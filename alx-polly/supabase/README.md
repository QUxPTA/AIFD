# Supabase Database Setup for Alx Polly

This document explains how to set up the database schema for the Alx Polly polling application.

## Overview

The database consists of these main tables:

- **polls** - Stores poll questions and configurations
- **votes** - Stores individual votes for polls
- **user_profiles** - Extended user profile information

## Database Schema

### Tables

#### `polls`

- `id` (UUID, Primary Key) - Unique poll identifier
- `question` (TEXT, NOT NULL) - The poll question
- `description` (TEXT) - Optional description
- `options` (JSONB, NOT NULL) - Poll options in JSON format
- `creator_id` (UUID, NOT NULL) - Foreign key to auth.users
- `is_active` (BOOLEAN, DEFAULT true) - Whether poll is active
- `allow_multiple_votes` (BOOLEAN, DEFAULT false) - Allow multiple option selection
- `is_anonymous` (BOOLEAN, DEFAULT false) - Whether votes are anonymous
- `expires_at` (TIMESTAMPTZ) - When poll expires (NULL = never)
- `created_at` (TIMESTAMPTZ, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, DEFAULT now())

#### `votes`

- `id` (UUID, Primary Key) - Unique vote identifier
- `poll_id` (UUID, NOT NULL) - Foreign key to polls
- `option_id` (TEXT, NOT NULL) - References option ID from poll's options JSON
- `user_id` (UUID) - Foreign key to auth.users (NULL for anonymous)
- `anonymous_id` (TEXT) - Anonymous user identifier
- `ip_address` (INET) - IP address for rate limiting
- `user_agent` (TEXT) - Browser user agent
- `created_at` (TIMESTAMPTZ, DEFAULT now())

#### `user_profiles`

- `id` (UUID, Primary Key) - Foreign key to auth.users
- `full_name` (TEXT) - User's full name
- `username` (TEXT, UNIQUE) - Unique username
- `avatar_url` (TEXT) - Avatar image URL
- `bio` (TEXT) - User biography
- `created_at` (TIMESTAMPTZ, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, DEFAULT now())

## Setup Instructions

### 1. Apply Migrations

Run the migration files in order:

```sql
-- 1. Create polls table
\i supabase/migrations/20250829000001_create_polls_table.sql

-- 2. Create votes table
\i supabase/migrations/20250829000002_create_votes_table.sql

-- 3. Create poll functions and views
\i supabase/migrations/20250829000003_create_poll_functions.sql

-- 4. Create user profiles table
\i supabase/migrations/20250829000004_create_user_profiles.sql
```

### 2. Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push
```

### 3. Manual Setup in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each migration file content
4. Execute them in order

## Functions and Views

### Views

- `poll_results` - Combines polls with vote counts and percentages

### Functions

- `get_poll_results(poll_uuid)` - Get poll with vote results
- `user_has_voted(poll_uuid, user_uuid)` - Check if user voted
- `anonymous_has_voted(poll_uuid, anon_id)` - Check if anonymous user voted
- `cast_vote(...)` - Cast a vote with validation
- `handle_new_user()` - Trigger function for user profile creation

## Row Level Security (RLS)

All tables have RLS enabled with policies for:

### Polls

- Anyone can view active polls
- Users can view their own polls
- Authenticated users can create polls
- Users can update/delete their own polls

### Votes

- Anyone can view vote counts (aggregated)
- Authenticated users can vote
- Users can view their own votes

### User Profiles

- Public profiles viewable by everyone
- Users can insert/update their own profiles

## Usage Examples

### Creating a Poll

```typescript
import { createPoll } from '@/lib/db';

const newPoll = await createPoll({
  question: "What's your favorite programming language?",
  description: 'Choose your preferred language for web development',
  options: ['JavaScript', 'TypeScript', 'Python', 'Go'],
  allow_multiple_votes: false,
  is_anonymous: false,
  expires_at: '2024-12-31T23:59:59Z',
});
```

### Casting a Vote

```typescript
import { castVote } from '@/lib/db';

const result = await castVote({
  poll_id: 'poll-uuid',
  option_id: 'option_1',
});
```

### Getting Poll Results

```typescript
import { getPoll } from '@/lib/db';

const pollWithResults = await getPoll('poll-uuid');
```

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## TypeScript Types

All database types are defined in `/lib/types/index.ts` and match the database schema exactly.
