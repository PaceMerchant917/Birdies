import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from './auth/helpers';
import { requireAuth, type AuthRequest } from './auth/middleware';
import { generateOTPCode, storeOTP, verifyOTP } from './auth/otp';
import { sendOTPEmail } from './auth/email';
import type {
  ApiError,
  HealthResponse,
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  GetMeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  DiscoverResponse,
  CreateLikeRequest,
  CreateLikeResponse,
  GetMatchesResponse,
  GetMessagesResponse,
  CreateMessageRequest,
  CreateMessageResponse,
  CreateReportRequest,
  CreateReportResponse,
  CreateBlockRequest,
  CreateBlockResponse,
} from './types';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper for not implemented responses
const notImplemented = (res: express.Response) => {
  const error: ApiError = {
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'This endpoint is not yet implemented',
    },
  };
  return res.status(501).json(error);
};

// ============================================
// HEALTH
// ============================================

app.get('/api/health', (req, res) => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// ============================================
// AUTH
// ============================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const body: SignupRequest = req.body;
    const { email, password } = body;

    console.log(`\n🔵 Signup request received for: ${email}`);

    // Validate email domain (must be @mail.mcgill.ca)
    if (!email.endsWith('@mail.mcgill.ca')) {
      const error: ApiError = {
        error: {
          code: 'INVALID_EMAIL_DOMAIN',
          message: 'Invalid email domain (must be @mail.mcgill.ca)',
        },
      };
      return res.status(400).json(error);
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      const error: ApiError = {
        error: {
          code: 'EMAIL_ALREADY_REGISTERED',
          message: 'Email already registered',
        },
      };
      return res.status(409).json(error);
    }

    // Generate OTP code and send email
    const otpCode = generateOTPCode();
    storeOTP(email, otpCode, 10); // 10 minute expiry

    try {
      await sendOTPEmail(email, otpCode);
      console.log(`✅ OTP sent to ${email} for signup verification`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      // Still return success to avoid leaking email existence
    }

    // Return response indicating OTP was sent
    const response: SignupResponse = {
      userId: '', // Empty for now, will be set after verification
      message: `Verification code sent to ${email}. Please check your email.`,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during signup',
      },
    };
    res.status(500).json(apiError);
  }
});

/**
 * POST /api/auth/complete-signup
 * Complete signup with OTP verification and create account
 */
app.post('/api/auth/complete-signup', async (req, res) => {
  try {
    const body = req.body as { email: string; password: string; code: string };
    const { email, password, code } = body;

    console.log(`\n🔵 Complete signup request for: ${email}`);

    // Validate inputs
    if (!email || !password || !code) {
      const error: ApiError = {
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, password, and verification code are required',
        },
      };
      return res.status(400).json(error);
    }

    // Validate email domain
    if (!email.endsWith('@mail.mcgill.ca')) {
      const error: ApiError = {
        error: {
          code: 'INVALID_EMAIL_DOMAIN',
          message: 'Invalid email domain (must be @mail.mcgill.ca)',
        },
      };
      return res.status(400).json(error);
    }

    // Verify OTP code
    const verification = verifyOTP(email, code);
    if (!verification.valid) {
      let errorCode = 'INVALID_CODE';
      let errorMessage = 'Invalid or expired verification code';

      switch (verification.reason) {
        case 'max_attempts':
          errorCode = 'MAX_ATTEMPTS_EXCEEDED';
          errorMessage = 'Maximum verification attempts exceeded. Please request a new code.';
          break;
        case 'expired':
          errorCode = 'CODE_EXPIRED';
          errorMessage = 'Verification code has expired. Please request a new code.';
          break;
        case 'not_found':
          errorCode = 'CODE_NOT_FOUND';
          errorMessage = 'No verification code found. Please start signup again.';
          break;
        case 'invalid_code':
          errorCode = 'INVALID_CODE';
          errorMessage = 'Invalid verification code. Please try again.';
          break;
      }

      const error: ApiError = {
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
      return res.status(400).json(error);
    }

    // Check if email already exists (double check)
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      const error: ApiError = {
        error: {
          code: 'EMAIL_ALREADY_REGISTERED',
          message: 'Email already registered',
        },
      };
      return res.status(409).json(error);
    }

    // Hash password and create account
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, mcgill_verified)
       VALUES ($1, $2, TRUE)
       RETURNING id`,
      [email, passwordHash]
    );

    const userId = result.rows[0].id;
    console.log(`✅ User account created successfully: ${email} (ID: ${userId})`);

    // Return success response
    const response: SignupResponse = {
      userId: userId,
      message: `Account created successfully for ${email}`,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Complete signup error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred completing signup',
      },
    };
    res.status(500).json(apiError);
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const body: LoginRequest = req.body;
    const { email, password } = body;

    // Find user by email
    const userResult = await pool.query(
      'SELECT id, email, password_hash, mcgill_verified, created_at FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      const error: ApiError = {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
      };
      return res.status(401).json(error);
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      const error: ApiError = {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
      };
      return res.status(401).json(error);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return response matching CONTRACTS.md exactly
    const response: LoginResponse = {
      token: token,
      user: {
        id: user.id,
        email: user.email,
        mcgillVerified: user.mcgill_verified,
        createdAt: user.created_at,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
    };
    res.status(500).json(apiError);
  }
});

// Removed: Email verification is no longer required

app.post('/api/auth/logout', (req, res) => {
  // TODO: Implement logout logic
  notImplemented(res);
});

// ============================================
// OTP VERIFICATION ENDPOINTS
// ============================================

/**
 * POST /api/auth/send-code
 * Send a 4-digit OTP code to the user's email
 */
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const body: SendCodeRequest = req.body;
    const { email } = body;

    // Validate email format
    if (!email || typeof email !== 'string') {
      const error: ApiError = {
        error: {
          code: 'INVALID_EMAIL',
          message: 'Email is required and must be a string',
        },
      };
      return res.status(400).json(error);
    }

    // Optional: Validate email domain (remove if not needed)
    // if (!email.endsWith('@mail.mcgill.ca')) {
    //   const error: ApiError = {
    //     error: {
    //       code: 'INVALID_EMAIL_DOMAIN',
    //       message: 'Invalid email domain',
    //     },
    //   };
    //   return res.status(400).json(error);
    // }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error: ApiError = {
        error: {
          code: 'INVALID_EMAIL_FORMAT',
          message: 'Invalid email format',
        },
      };
      return res.status(400).json(error);
    }

    // Generate 4-digit code
    const code = generateOTPCode();

    // Store code in memory (10 minute expiry)
    storeOTP(email, code, 10);

    // Send email via Resend
    try {
      await sendOTPEmail(email, code);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Still return success to avoid leaking email existence
      // In production, you might want to handle this differently
    }

    // Return success (don't leak whether email exists or not)
    const response: SendCodeResponse = { ok: true };
    res.status(200).json(response);
  } catch (error) {
    console.error('Send code error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while sending verification code',
      },
    };
    res.status(500).json(apiError);
  }
});

/**
 * POST /api/auth/verify-code
 * Verify the OTP code sent to the user's email
 */
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const body: VerifyCodeRequest = req.body;
    const { email, code } = body;

    // Validate inputs
    if (!email || typeof email !== 'string') {
      const error: ApiError = {
        error: {
          code: 'INVALID_EMAIL',
          message: 'Email is required and must be a string',
        },
      };
      return res.status(400).json(error);
    }

    if (!code || typeof code !== 'string') {
      const error: ApiError = {
        error: {
          code: 'INVALID_CODE',
          message: 'Code is required and must be a string',
        },
      };
      return res.status(400).json(error);
    }

    // Validate code format (exactly 4 digits)
    const codeRegex = /^\d{4}$/;
    if (!codeRegex.test(code)) {
      const error: ApiError = {
        error: {
          code: 'INVALID_CODE_FORMAT',
          message: 'Code must be exactly 4 digits',
        },
      };
      return res.status(400).json(error);
    }

    // Verify the code
    const verification = verifyOTP(email, code);

    if (!verification.valid) {
      let errorCode = 'INVALID_CODE';
      let errorMessage = 'Invalid or expired verification code';

      switch (verification.reason) {
        case 'max_attempts':
          errorCode = 'MAX_ATTEMPTS_EXCEEDED';
          errorMessage =
            'Maximum verification attempts exceeded. Please request a new code.';
          break;
        case 'expired':
          errorCode = 'CODE_EXPIRED';
          errorMessage = 'Verification code has expired. Please request a new code.';
          break;
        case 'not_found':
          errorCode = 'CODE_NOT_FOUND';
          errorMessage =
            'No verification code found for this email. Please request a new code.';
          break;
        case 'invalid_code':
          errorCode = 'INVALID_CODE';
          errorMessage = 'Invalid verification code. Please try again.';
          break;
      }

      const error: ApiError = {
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
      return res.status(400).json(error);
    }

    // Code is valid
    // Optional: Update user verification status in database here
    // Example:
    // await pool.query(
    //   'UPDATE users SET email_verified = TRUE WHERE email = $1',
    //   [email]
    // );

    const response: VerifyCodeResponse = { ok: true };
    res.status(200).json(response);
  } catch (error) {
    console.error('Verify code error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while verifying code',
      },
    };
    res.status(500).json(apiError);
  }
});

// ============================================
// USER/PROFILE
// ============================================

app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Get user info
    const userResult = await pool.query(
      'SELECT id, email, mcgill_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      const error: ApiError = {
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      };
      return res.status(404).json(error);
    }

    const user = userResult.rows[0];

    // Get profile info (may not exist yet)
    const profileResult = await pool.query(
      `SELECT 
        user_id,
        display_name,
        bio,
        photos,
        faculty,
        year,
        pronouns,
        gender,
        intent,
        age_min,
        age_max,
        gender_preference,
        max_distance
      FROM profiles WHERE user_id = $1`,
      [userId]
    );

    let profile = null;
    if (profileResult.rows.length > 0) {
      const p = profileResult.rows[0];
      profile = {
        userId: p.user_id,
        displayName: p.display_name,
        bio: p.bio || '',
        photos: p.photos || [],
        faculty: p.faculty,
        year: p.year,
        pronouns: p.pronouns,
        gender: p.gender,
        intent: p.intent,
        preferences: {
          ageMin: p.age_min,
          ageMax: p.age_max,
          genderPreference: p.gender_preference || [],
          maxDistance: p.max_distance,
        },
      };
    }

    const response: GetMeResponse = {
      user: {
        id: user.id,
        email: user.email,
        mcgillVerified: user.mcgill_verified,
        createdAt: user.created_at,
      },
      profile,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get me error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred fetching user data',
      },
    };
    res.status(500).json(apiError);
  }
});

app.patch('/api/me/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const body: UpdateProfileRequest = req.body;

    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT user_id FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      // Create new profile
      await pool.query(
        `INSERT INTO profiles (
          user_id, display_name, bio, photos, faculty, year, 
          pronouns, gender, intent, age_min, age_max, 
          gender_preference, max_distance
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          userId,
          body.displayName || '',
          body.bio || '',
          body.photos || [],
          body.faculty,
          body.year,
          body.pronouns,
          body.gender,
          body.intent,
          body.preferences?.ageMin,
          body.preferences?.ageMax,
          body.preferences?.genderPreference || [],
          body.preferences?.maxDistance,
        ]
      );
    } else {
      // Update existing profile
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (body.displayName !== undefined) {
        updates.push(`display_name = $${paramCount++}`);
        values.push(body.displayName);
      }
      if (body.bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        values.push(body.bio);
      }
      if (body.photos !== undefined) {
        updates.push(`photos = $${paramCount++}`);
        values.push(body.photos);
      }
      if (body.faculty !== undefined) {
        updates.push(`faculty = $${paramCount++}`);
        values.push(body.faculty);
      }
      if (body.year !== undefined) {
        updates.push(`year = $${paramCount++}`);
        values.push(body.year);
      }
      if (body.pronouns !== undefined) {
        updates.push(`pronouns = $${paramCount++}`);
        values.push(body.pronouns);
      }
      if (body.gender !== undefined) {
        updates.push(`gender = $${paramCount++}`);
        values.push(body.gender);
      }
      if (body.intent !== undefined) {
        updates.push(`intent = $${paramCount++}`);
        values.push(body.intent);
      }
      if (body.preferences?.ageMin !== undefined) {
        updates.push(`age_min = $${paramCount++}`);
        values.push(body.preferences.ageMin);
      }
      if (body.preferences?.ageMax !== undefined) {
        updates.push(`age_max = $${paramCount++}`);
        values.push(body.preferences.ageMax);
      }
      if (body.preferences?.genderPreference !== undefined) {
        updates.push(`gender_preference = $${paramCount++}`);
        values.push(body.preferences.genderPreference);
      }
      if (body.preferences?.maxDistance !== undefined) {
        updates.push(`max_distance = $${paramCount++}`);
        values.push(body.preferences.maxDistance);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      await pool.query(
        `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = $${paramCount}`,
        values
      );
    }

    // Fetch and return updated profile
    const profileResult = await pool.query(
      `SELECT 
        user_id,
        display_name,
        bio,
        photos,
        faculty,
        year,
        pronouns,
        gender,
        intent,
        age_min,
        age_max,
        gender_preference,
        max_distance
      FROM profiles WHERE user_id = $1`,
      [userId]
    );

    const p = profileResult.rows[0];
    const profile = {
      userId: p.user_id,
      displayName: p.display_name,
      bio: p.bio || '',
      photos: p.photos || [],
      faculty: p.faculty,
      year: p.year,
      pronouns: p.pronouns,
      gender: p.gender,
      intent: p.intent,
      preferences: {
        ageMin: p.age_min,
        ageMax: p.age_max,
        genderPreference: p.gender_preference || [],
        maxDistance: p.max_distance,
      },
    };

    const response: UpdateProfileResponse = {
      profile,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred updating profile',
      },
    };
    res.status(500).json(apiError);
  }
});

// ============================================
// DISCOVERY/MATCHING
// ============================================

app.get('/api/discover', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get profiles that:
    // 1. Are not the current user
    // 2. Have not been liked by the current user
    // 3. Are not blocked by or blocking the current user
    // 4. Have a complete profile
    const result = await pool.query(
      `SELECT 
        p.user_id,
        p.display_name,
        p.bio,
        p.photos,
        p.faculty,
        p.year,
        p.pronouns,
        p.gender,
        p.intent,
        p.age_min,
        p.age_max,
        p.gender_preference,
        p.max_distance
      FROM profiles p
      WHERE p.user_id != $1
        AND p.user_id NOT IN (
          SELECT to_user_id FROM likes WHERE from_user_id = $1
        )
        AND p.user_id NOT IN (
          SELECT target_id FROM blocks WHERE blocker_id = $1
        )
        AND p.user_id NOT IN (
          SELECT blocker_id FROM blocks WHERE target_id = $1
        )
        AND p.display_name IS NOT NULL
        AND p.display_name != ''
      ORDER BY p.created_at DESC
      LIMIT $2`,
      [userId, limit]
    );

    // Transform database rows to Profile objects
    const profiles = result.rows.map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      bio: row.bio || '',
      photos: row.photos || [],
      faculty: row.faculty,
      year: row.year,
      pronouns: row.pronouns,
      gender: row.gender,
      intent: row.intent,
      preferences: {
        ageMin: row.age_min,
        ageMax: row.age_max,
        genderPreference: row.gender_preference || [],
        maxDistance: row.max_distance,
      },
    }));

    const response: DiscoverResponse = {
      profiles,
      hasMore: profiles.length === limit,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Discover error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred fetching discovery feed',
      },
    };
    res.status(500).json(apiError);
  }
});

app.post('/api/likes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const body: CreateLikeRequest = req.body;
    const { targetUserId } = body;

    // Check if user is trying to like themselves
    if (userId === targetUserId) {
      const error: ApiError = {
        error: {
          code: 'INVALID_ACTION',
          message: 'Cannot like yourself',
        },
      };
      return res.status(400).json(error);
    }

    // Check if target user exists
    const targetExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [targetUserId]
    );

    if (targetExists.rows.length === 0) {
      const error: ApiError = {
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Target user not found',
        },
      };
      return res.status(404).json(error);
    }

    // Check if already liked
    const existingLike = await pool.query(
      'SELECT id FROM likes WHERE from_user_id = $1 AND to_user_id = $2',
      [userId, targetUserId]
    );

    if (existingLike.rows.length > 0) {
      const error: ApiError = {
        error: {
          code: 'ALREADY_LIKED',
          message: 'You have already liked this user',
        },
      };
      return res.status(409).json(error);
    }

    // Create the like
    await pool.query(
      'INSERT INTO likes (from_user_id, to_user_id) VALUES ($1, $2)',
      [userId, targetUserId]
    );

    console.log(`💜 User ${userId} liked ${targetUserId}`);

    // Check if there's a mutual like (the other person already liked us)
    const mutualLike = await pool.query(
      'SELECT id FROM likes WHERE from_user_id = $1 AND to_user_id = $2',
      [targetUserId, userId]
    );

    if (mutualLike.rows.length > 0) {
      // It's a match! Create match record
      // Ensure user_a_id < user_b_id for the CHECK constraint
      const [userA, userB] = userId < targetUserId 
        ? [userId, targetUserId] 
        : [targetUserId, userId];

      // Check if match already exists
      const existingMatch = await pool.query(
        'SELECT id FROM matches WHERE user_a_id = $1 AND user_b_id = $2',
        [userA, userB]
      );

      let matchId;
      if (existingMatch.rows.length === 0) {
        const matchResult = await pool.query(
          'INSERT INTO matches (user_a_id, user_b_id) VALUES ($1, $2) RETURNING id',
          [userA, userB]
        );
        matchId = matchResult.rows[0].id;
        console.log(`🎉 IT'S A MATCH! ${userId} <-> ${targetUserId} (Match ID: ${matchId})`);
      } else {
        matchId = existingMatch.rows[0].id;
      }

      const response: CreateLikeResponse = {
        matched: true,
        matchId: matchId,
      };
      return res.status(200).json(response);
    }

    // No mutual like yet
    const response: CreateLikeResponse = {
      matched: false,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Like error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred creating like',
      },
    };
    res.status(500).json(apiError);
  }
});

app.get('/api/matches', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Get all matches where user is either user_a or user_b
    const result = await pool.query(
      `SELECT 
        m.id as match_id,
        m.user_a_id,
        m.user_b_id,
        m.created_at as match_created_at,
        m.last_message_at,
        p.user_id,
        p.display_name,
        p.bio,
        p.photos,
        p.faculty,
        p.year,
        p.pronouns,
        p.gender,
        p.intent,
        p.age_min,
        p.age_max,
        p.gender_preference,
        p.max_distance
      FROM matches m
      JOIN profiles p ON (
        CASE 
          WHEN m.user_a_id = $1 THEN p.user_id = m.user_b_id
          ELSE p.user_id = m.user_a_id
        END
      )
      WHERE m.user_a_id = $1 OR m.user_b_id = $1
      ORDER BY COALESCE(m.last_message_at, m.created_at) DESC`,
      [userId]
    );

    const matches = result.rows.map((row) => ({
      match: {
        id: row.match_id,
        userAId: row.user_a_id,
        userBId: row.user_b_id,
        createdAt: row.match_created_at,
        lastMessageAt: row.last_message_at,
      },
      profile: {
        userId: row.user_id,
        displayName: row.display_name,
        bio: row.bio || '',
        photos: row.photos || [],
        faculty: row.faculty,
        year: row.year,
        pronouns: row.pronouns,
        gender: row.gender,
        intent: row.intent,
        preferences: {
          ageMin: row.age_min,
          ageMax: row.age_max,
          genderPreference: row.gender_preference || [],
          maxDistance: row.max_distance,
        },
      },
    }));

    const response: GetMatchesResponse = {
      matches,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get matches error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred fetching matches',
      },
    };
    res.status(500).json(apiError);
  }
});

// ============================================
// MESSAGING
// ============================================

app.get('/api/matches/:matchId/messages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    // Verify the match exists and user is part of it
    const matchResult = await pool.query(
      'SELECT user_a_id, user_b_id FROM matches WHERE id = $1',
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      const error: ApiError = {
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found',
        },
      };
      return res.status(404).json(error);
    }

    const match = matchResult.rows[0];
    if (match.user_a_id !== userId && match.user_b_id !== userId) {
      const error: ApiError = {
        error: {
          code: 'FORBIDDEN',
          message: 'You are not part of this match',
        },
      };
      return res.status(403).json(error);
    }

    // Get all messages for this match, ordered by created_at ascending
    const messagesResult = await pool.query(
      `SELECT id, match_id, sender_id, body, created_at, read_at
       FROM messages
       WHERE match_id = $1
       ORDER BY created_at ASC`,
      [matchId]
    );

    const messages = messagesResult.rows.map((row) => ({
      id: row.id,
      matchId: row.match_id,
      senderId: row.sender_id,
      body: row.body,
      createdAt: row.created_at,
      readAt: row.read_at,
    }));

    const response: GetMessagesResponse = {
      messages,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get messages error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred fetching messages',
      },
    };
    res.status(500).json(apiError);
  }
});

app.post('/api/matches/:matchId/messages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;
    const body: CreateMessageRequest = req.body;

    // Validate message body
    if (!body.body || typeof body.body !== 'string') {
      const error: ApiError = {
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message body is required',
        },
      };
      return res.status(400).json(error);
    }

    const trimmedBody = body.body.trim();
    if (trimmedBody.length === 0) {
      const error: ApiError = {
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message body cannot be empty',
        },
      };
      return res.status(400).json(error);
    }

    if (trimmedBody.length > 2000) {
      const error: ApiError = {
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message body cannot exceed 2000 characters',
        },
      };
      return res.status(400).json(error);
    }

    // Verify the match exists and user is part of it
    const matchResult = await pool.query(
      'SELECT user_a_id, user_b_id FROM matches WHERE id = $1',
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      const error: ApiError = {
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found',
        },
      };
      return res.status(404).json(error);
    }

    const match = matchResult.rows[0];
    if (match.user_a_id !== userId && match.user_b_id !== userId) {
      const error: ApiError = {
        error: {
          code: 'FORBIDDEN',
          message: 'You are not part of this match',
        },
      };
      return res.status(403).json(error);
    }

    // Insert the message
    const messageResult = await pool.query(
      `INSERT INTO messages (match_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, match_id, sender_id, body, created_at, read_at`,
      [matchId, userId, trimmedBody]
    );

    // Update the match's last_message_at timestamp
    await pool.query(
      'UPDATE matches SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
      [matchId]
    );

    const message = messageResult.rows[0];
    const response: CreateMessageResponse = {
      message: {
        id: message.id,
        matchId: message.match_id,
        senderId: message.sender_id,
        body: message.body,
        createdAt: message.created_at,
        readAt: message.read_at,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Send message error:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred sending message',
      },
    };
    res.status(500).json(apiError);
  }
});

// ============================================
// SAFETY
// ============================================

app.post('/api/report', (req, res) => {
  const body: CreateReportRequest = req.body;
  // TODO: Create report
  notImplemented(res);
});

app.post('/api/block', (req, res) => {
  const body: CreateBlockRequest = req.body;
  // TODO: Block user
  notImplemented(res);
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
