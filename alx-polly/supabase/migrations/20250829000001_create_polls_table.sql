-- Create polls table
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL CHECK (char_length(question) > 0),
  description TEXT,
  options JSONB NOT NULL CHECK (jsonb_array_length(options) >= 2),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  allow_multiple_votes BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_polls_creator_id ON polls(creator_id);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_polls_is_active ON polls(is_active);
CREATE INDEX idx_polls_expires_at ON polls(expires_at) WHERE expires_at IS NOT NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_polls_updated_at 
    BEFORE UPDATE ON polls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active polls
CREATE POLICY "Anyone can view active polls" ON polls
    FOR SELECT USING (is_active = true);

-- Policy: Users can view their own polls (including inactive)
CREATE POLICY "Users can view own polls" ON polls
    FOR SELECT USING (auth.uid() = creator_id);

-- Policy: Authenticated users can create polls
CREATE POLICY "Authenticated users can create polls" ON polls
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can update their own polls
CREATE POLICY "Users can update own polls" ON polls
    FOR UPDATE USING (auth.uid() = creator_id);

-- Policy: Users can delete their own polls
CREATE POLICY "Users can delete own polls" ON polls
    FOR DELETE USING (auth.uid() = creator_id);

-- Add comments for documentation
COMMENT ON TABLE polls IS 'Stores poll questions and configurations';
COMMENT ON COLUMN polls.options IS 'Array of poll options in JSON format: [{"id": "opt1", "text": "Option 1"}, ...]';
COMMENT ON COLUMN polls.allow_multiple_votes IS 'Whether users can select multiple options';
COMMENT ON COLUMN polls.is_anonymous IS 'Whether votes are recorded anonymously';
COMMENT ON COLUMN polls.expires_at IS 'When the poll expires (NULL = never expires)';
