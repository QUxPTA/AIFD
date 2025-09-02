export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Poll {
  id: string
  title: string
  description?: string
  authorId: string
  author: User
  options: PollOption[]
  totalVotes: number
  isActive: boolean
  allowMultipleVotes: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface PollOption {
  id: string
  pollId: string
  text: string
  votes: number
  order: number
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId: string
  createdAt: string
}

export interface CreatePollData {
  title: string
  description?: string
  options: string[]
  allowMultipleVotes: boolean
  expiresAt?: string
}

export interface UpdatePollData {
  title?: string
  description?: string
  isActive?: boolean
  expiresAt?: string
}

export interface PollFilters {
  status?: 'active' | 'closed' | 'all'
  author?: string
  sortBy?: 'created' | 'votes' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}
