// Script to seed sample profiles for testing
import pool from './index';
import { hashPassword } from '../auth/helpers';

async function seedProfiles() {
  try {
    console.log('🌱 Seeding sample profiles...');

    // Sample users and profiles
    const sampleProfiles = [
      {
        email: 'sarah.johnson@mail.mcgill.ca',
        password: 'password123',
        displayName: 'Sarah',
        bio: 'Arts student who loves coffee, books, and exploring Montreal',
        faculty: 'Arts',
        year: 2026,
        pronouns: 'she/her',
        gender: 'female',
        intent: 'dating',
      },
      {
        email: 'mike.chen@mail.mcgill.ca',
        password: 'password123',
        displayName: 'Mike',
        bio: 'Engineering student, rock climbing enthusiast, always down for poutine',
        faculty: 'Engineering',
        year: 2025,
        pronouns: 'he/him',
        gender: 'male',
        intent: 'dating',
      },
      {
        email: 'alex.taylor@mail.mcgill.ca',
        password: 'password123',
        displayName: 'Alex',
        bio: 'Science major, love hiking and board games. Looking to meet new people!',
        faculty: 'Science',
        year: 2027,
        pronouns: 'they/them',
        gender: 'non-binary',
        intent: 'friendship',
      },
      {
        email: 'emma.wilson@mail.mcgill.ca',
        password: 'password123',
        displayName: 'Emma',
        bio: 'Management student, foodie, and travel lover. Let\'s grab coffee!',
        faculty: 'Management',
        year: 2026,
        pronouns: 'she/her',
        gender: 'female',
        intent: 'networking',
      },
      {
        email: 'david.lee@mail.mcgill.ca',
        password: 'password123',
        displayName: 'David',
        bio: 'Music student, guitarist, and coffee addict. Always looking for jam sessions',
        faculty: 'Music',
        year: 2025,
        pronouns: 'he/him',
        gender: 'male',
        intent: 'casual',
      },
    ];

    for (const profile of sampleProfiles) {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [profile.email]
      );

      let userId: string;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        console.log(`✓ User ${profile.email} already exists`);
      } else {
        // Create user
        const passwordHash = await hashPassword(profile.password);
        const userResult = await pool.query(
          `INSERT INTO users (email, password_hash, mcgill_verified)
           VALUES ($1, $2, TRUE)
           RETURNING id`,
          [profile.email, passwordHash]
        );
        userId = userResult.rows[0].id;
        console.log(`✓ Created user ${profile.email}`);
      }

      // Check if profile exists
      const existingProfile = await pool.query(
        'SELECT user_id FROM profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length === 0) {
        // Create profile
        await pool.query(
          `INSERT INTO profiles (
            user_id, display_name, bio, faculty, year, 
            pronouns, gender, intent, age_min, age_max
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            userId,
            profile.displayName,
            profile.bio,
            profile.faculty,
            profile.year,
            profile.pronouns,
            profile.gender,
            profile.intent,
            18,
            30,
          ]
        );
        console.log(`✓ Created profile for ${profile.displayName}`);
      } else {
        console.log(`✓ Profile for ${profile.displayName} already exists`);
      }
    }

    console.log('\n✅ Seeding complete!');
    console.log('\nYou can now log in with any of these accounts:');
    sampleProfiles.forEach((p) => {
      console.log(`  - ${p.email} / password123`);
    });
  } catch (error) {
    console.error('❌ Error seeding profiles:', error);
  } finally {
    await pool.end();
  }
}

seedProfiles();
