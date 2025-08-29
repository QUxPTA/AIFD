-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL, -- References the option ID from poll's options JSONB
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for anonymous votes
  anonymous_id TEXT, -- For tracking anonymous users (browser fingerprint/session)
  ip_address INET, -- For additional anonymous tracking/rate limiting
  user_agent TEXT, -- Browser info for fingerprinting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure either user_id or anonymous_id is provided
  CONSTRAINT votes_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_votes_anonymous_id ON votes(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);
CREATE INDEX idx_votes_poll_option ON votes(poll_id, option_id);
CREATE INDEX idx_votes_ip_address ON votes(ip_address) WHERE ip_address IS NOT NULL;

-- Create unique constraints to prevent duplicate voting
-- For authenticated users: one vote per poll per user (unless multiple votes allowed)
CREATE UNIQUE INDEX idx_votes_unique_user_poll 
  ON votes(poll_id, user_id) 
  WHERE user_id IS NOT NULL;

-- For anonymous users: one vote per poll per anonymous_id
CREATE UNIQUE INDEX idx_votes_unique_anonymous_poll 
  ON votes(poll_id, anonymous_id) 
  WHERE anonymous_id IS NOT NULL;

-- Add RLS policies
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view vote counts (aggregated data)
-- Note: Individual votes should not be exposed, only aggregated counts
CREATE POLICY "Anyone can view vote counts" ON votes
    FOR SELECT USING (
      -- Allow reading for vote counting purposes
      -- Individual vote details should be accessed through views/functions
      true
    );

-- Policy: Authenticated users can vote
CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (
      -- User can only vote with their own user_id
      (auth.uid() = user_id AND anonymous_id IS NULL) OR
      -- Or as anonymous user
      (user_id IS NULL AND anonymous_id IS NOT NULL)
    );

-- Policy: Users can view their own votes
CREATE POLICY "Users can view own votes" ON votes
    FOR SELECT USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE votes IS 'Stores individual votes for polls';
COMMENT ON COLUMN votes.option_id IS 'References the option ID from the poll options JSON array';
COMMENT ON COLUMN votes.user_id IS 'User who voted (NULL for anonymous votes)';
COMMENT ON COLUMN votes.anonymous_id IS 'Anonymous identifier for non-authenticated votes';
COMMENT ON COLUMN votes.ip_address IS 'IP address for rate limiting and fraud prevention';
COMMENT ON COLUMN votes.user_agent IS 'Browser user agent for additional fingerprinting';
