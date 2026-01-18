// ============================================
// DATA MODELS
// ============================================

export interface User {
  id: string;
  email: string;
  mcgillVerified: boolean;
  createdAt: Date;
}

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
  preferences: UserPreferences;
}

export interface UserPreferences {
  ageMin?: number;
  ageMax?: number;
  genderPreference?: string[];
  maxDistance?: number;
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: Date;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: Date;
  lastMessageAt?: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  readAt?: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  createdAt: Date;
}

export interface Block {
  id: string;
  blockerId: string;
  targetId: string;
  createdAt: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// Auth
export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  userId: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// User/Profile
export interface GetMeResponse {
  user: User;
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
  intent?: string;
  preferences?: UserPreferences;
}

export interface UpdateProfileResponse {
  profile: Profile;
}

// Discovery
export interface DiscoverResponse {
  profiles: Profile[];
  hasMore: boolean;
}

export interface CreateLikeRequest {
  targetUserId: string;
}

export interface CreateLikeResponse {
  matched: boolean;
  matchId?: string;
}

// Matches
export interface GetMatchesResponse {
  matches: Array<{
    match: Match;
    profile: Profile;
  }>;
}

// Messages
export interface GetMessagesResponse {
  messages: Message[];
}

export interface CreateMessageRequest {
  body: string;
}

export interface CreateMessageResponse {
  message: Message;
}

// Safety
export interface CreateReportRequest {
  targetId: string;
  reason: string;
  details?: string;
}

export interface CreateReportResponse {
  reportId: string;
}

export interface CreateBlockRequest {
  targetId: string;
}

export interface CreateBlockResponse {
  success: boolean;
}

// Health
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}
