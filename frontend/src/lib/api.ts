// API Client - Functions to call backend endpoints
// Respects CONTRACTS.md exactly

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Helper to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If response is not JSON, create a proper error
      throw {
        error: {
          code: 'INVALID_RESPONSE',
          message: response.statusText || 'Invalid response from server',
        },
      } as ApiError;
    }

    if (!response.ok) {
      // Ensure error has the correct structure
      const error: ApiError = {
        error: {
          code: data?.error?.code || 'UNKNOWN_ERROR',
          message: data?.error?.message || data?.message || `Request failed with status ${response.status}`,
        },
      };
      throw error;
    }

    return data as T;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Cannot connect to server. Make sure the backend is running on http://localhost:3001',
        },
      } as ApiError;
    }
    // Re-throw if it's already an ApiError
    if (error && typeof error === 'object' && 'error' in error) {
      throw error;
    }
    // Unknown error
    throw {
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      },
    } as ApiError;
  }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  userId: string;
  message: string;
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    mcgillVerified: boolean;
    createdAt: string;
  };
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface LogoutResponse {
  success: boolean;
}

export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>('/auth/logout', {
    method: 'POST',
  });
}

// ============================================
// DISCOVERY/PROFILE ENDPOINTS
// ============================================

export interface Profile {
  userId: string;
  displayName: string;
  bio: string;
  photos: string[];
  faculty?: string;
  year?: number;
  pronouns?: string;
  gender?: string;
  intent?: 'dating' | 'friendship' | 'networking' | 'casual';
  preferences: {
    ageMin?: number;
    ageMax?: number;
    genderPreference?: string[];
    maxDistance?: number;
  };
}

export interface DiscoverResponse {
  profiles: Profile[];
  hasMore: boolean;
}

export async function getDiscoverFeed(limit?: number): Promise<DiscoverResponse> {
  const queryParams = limit ? `?limit=${limit}` : '';
  return apiRequest<DiscoverResponse>(`/discover${queryParams}`, {
    method: 'GET',
  });
}

// ============================================
// USER/PROFILE ENDPOINTS
// ============================================

export interface GetMeResponse {
  user: {
    id: string;
    email: string;
    mcgillVerified: boolean;
    createdAt: string;
  };
  profile: Profile | null;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  photos?: string[];
  faculty?: string;
  year?: number;
  pronouns?: string;
  gender?: string;
  intent?: 'dating' | 'friendship' | 'networking' | 'casual';
  preferences?: {
    ageMin?: number;
    ageMax?: number;
    genderPreference?: string[];
    maxDistance?: number;
  };
}

export interface UpdateProfileResponse {
  profile: Profile;
}

export async function getMe(): Promise<GetMeResponse> {
  return apiRequest<GetMeResponse>('/me', {
    method: 'GET',
  });
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  return apiRequest<UpdateProfileResponse>('/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============================================
// LIKES/MATCHES ENDPOINTS
// ============================================

export interface CreateLikeRequest {
  targetUserId: string;
}

export interface CreateLikeResponse {
  matched: boolean;
  matchId?: string;
}

export async function createLike(targetUserId: string): Promise<CreateLikeResponse> {
  return apiRequest<CreateLikeResponse>('/likes', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  });
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  lastMessageAt?: string;
}

export interface GetMatchesResponse {
  matches: Array<{
    match: Match;
    profile: Profile;
  }>;
}

export async function getMatches(): Promise<GetMatchesResponse> {
  return apiRequest<GetMatchesResponse>('/matches', {
    method: 'GET',
  });
}

// ============================================
// MESSAGING ENDPOINTS
// ============================================

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface GetMessagesResponse {
  messages: Message[];
}

export async function getMessages(matchId: string): Promise<GetMessagesResponse> {
  return apiRequest<GetMessagesResponse>(`/matches/${matchId}/messages`, {
    method: 'GET',
  });
}

export interface CreateMessageResponse {
  message: Message;
}

export async function sendMessage(matchId: string, body: string): Promise<CreateMessageResponse> {
  return apiRequest<CreateMessageResponse>(`/matches/${matchId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}
