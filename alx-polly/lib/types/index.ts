// Database Types - matching Supabase schema
export interface Database {
  public: {
    Tables: {
      polls: {
        Row: Poll;
        Insert: Omit<Poll, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Poll, 'id' | 'creator_id' | 'created_at'>>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, 'id' | 'created_at'>;
        Update: never;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
    };
  };
}

// Core Types
export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  text: string;
}

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  options: PollOption[];
  creator_id: string;
  is_active: boolean;
  allow_multiple_votes: boolean;
  is_anonymous: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  anonymous_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Extended types with computed data
export interface PollWithResults extends Poll {
  options_with_results: PollOptionResult[];
  total_votes: number;
  user_has_voted?: boolean;
}

export interface PollOptionResult extends PollOption {
  vote_count: number;
  percentage: number;
}

// Poll with votes and detailed information
export interface PollWithVotes extends Poll {
  options: PollOptionResult[];
  total_votes: number;
}

// Form and API Types
export interface CreatePollData {
  question: string;
  description?: string;
  options: string[]; // Will be converted to PollOption[] with IDs
  allow_multiple_votes?: boolean;
  is_anonymous?: boolean;
  expires_at?: string;
}

export interface UpdatePollData {
  question?: string;
  description?: string;
  is_active?: boolean;
  expires_at?: string;
}

export interface CastVoteData {
  poll_id: string;
  option_id: string;
  anonymous_id?: string;
}

export interface VoteResult {
  success: boolean;
  data?: string;
  error?: string;
}

// Filter and Query Types
export interface PollFilters {
  status?: 'active' | 'closed' | 'all';
  creator?: string;
  sortBy?: 'created_at' | 'total_votes' | 'question';
  sortOrder?: 'asc' | 'desc';
}

// Auth Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
