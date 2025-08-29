-- Create helpful views and functions for poll analytics

-- View: Poll results with vote counts and percentages
CREATE OR REPLACE VIEW poll_results AS
SELECT 
  p.id as poll_id,
  p.question,
  p.creator_id,
  p.is_active,
  p.created_at,
  p.expires_at,
  
  -- Extract option details and calculate vote counts
  jsonb_agg(
    jsonb_build_object(
      'option_id', option_value->>'id',
      'option_text', option_value->>'text',
      'vote_count', COALESCE(vote_counts.count, 0),
      'percentage', CASE 
        WHEN total_votes.total > 0 
        THEN ROUND((COALESCE(vote_counts.count, 0)::numeric / total_votes.total) * 100, 2)
        ELSE 0 
      END
    ) ORDER BY (option_value->>'id')
  ) as options_with_results,
  
  COALESCE(total_votes.total, 0) as total_votes

FROM polls p
CROSS JOIN LATERAL jsonb_array_elements(p.options) as option_value
LEFT JOIN LATERAL (
  SELECT COUNT(*) as count
  FROM votes v 
  WHERE v.poll_id = p.id 
    AND v.option_id = (option_value->>'id')
) vote_counts ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) as total
  FROM votes v 
  WHERE v.poll_id = p.id
) total_votes ON true

GROUP BY p.id, p.question, p.creator_id, p.is_active, p.created_at, p.expires_at, total_votes.total;

-- Function: Get poll results by ID
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS TABLE(
  poll_id UUID,
  question TEXT,
  creator_id UUID,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  options_with_results JSONB,
  total_votes BIGINT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    pr.poll_id,
    pr.question,
    pr.creator_id,
    pr.is_active,
    pr.created_at,
    pr.expires_at,
    pr.options_with_results,
    pr.total_votes
  FROM poll_results pr
  WHERE pr.poll_id = poll_uuid;
$$;

-- Function: Check if user has already voted on a poll
CREATE OR REPLACE FUNCTION user_has_voted(poll_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM votes 
    WHERE poll_id = poll_uuid 
      AND user_id = user_uuid
  );
$$;

-- Function: Check if anonymous user has already voted
CREATE OR REPLACE FUNCTION anonymous_has_voted(poll_uuid UUID, anon_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM votes 
    WHERE poll_id = poll_uuid 
      AND anonymous_id = anon_id
  );
$$;

-- Function: Cast a vote (with validation)
CREATE OR REPLACE FUNCTION cast_vote(
  poll_uuid UUID,
  option_id_param TEXT,
  user_uuid UUID DEFAULT auth.uid(),
  anon_id TEXT DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poll_record polls%ROWTYPE;
  option_exists BOOLEAN;
  user_voted BOOLEAN;
  anon_voted BOOLEAN;
BEGIN
  -- Get poll details
  SELECT * INTO poll_record FROM polls WHERE id = poll_uuid;
  
  -- Check if poll exists and is active
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Poll not found');
  END IF;
  
  IF NOT poll_record.is_active THEN
    RETURN json_build_object('success', false, 'error', 'Poll is not active');
  END IF;
  
  -- Check if poll has expired
  IF poll_record.expires_at IS NOT NULL AND poll_record.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Poll has expired');
  END IF;
  
  -- Check if option exists
  SELECT EXISTS(
    SELECT 1 FROM jsonb_array_elements(poll_record.options) as option
    WHERE option->>'id' = option_id_param
  ) INTO option_exists;
  
  IF NOT option_exists THEN
    RETURN json_build_object('success', false, 'error', 'Invalid option');
  END IF;
  
  -- Check for duplicate votes
  IF user_uuid IS NOT NULL THEN
    SELECT user_has_voted(poll_uuid, user_uuid) INTO user_voted;
    IF user_voted AND NOT poll_record.allow_multiple_votes THEN
      RETURN json_build_object('success', false, 'error', 'User has already voted');
    END IF;
  END IF;
  
  IF anon_id IS NOT NULL THEN
    SELECT anonymous_has_voted(poll_uuid, anon_id) INTO anon_voted;
    IF anon_voted AND NOT poll_record.allow_multiple_votes THEN
      RETURN json_build_object('success', false, 'error', 'Anonymous user has already voted');
    END IF;
  END IF;
  
  -- Cast the vote
  INSERT INTO votes (poll_id, option_id, user_id, anonymous_id, ip_address, user_agent)
  VALUES (poll_uuid, option_id_param, user_uuid, anon_id, ip_addr, user_agent_param);
  
  RETURN json_build_object('success', true, 'data', 'Vote cast successfully');
  
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'Duplicate vote detected');
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant permissions to authenticated users
GRANT SELECT ON poll_results TO authenticated;
GRANT EXECUTE ON FUNCTION get_poll_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_voted(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION anonymous_has_voted(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cast_vote(UUID, TEXT, UUID, TEXT, INET, TEXT) TO authenticated;

-- Grant limited permissions to anonymous users for voting
GRANT EXECUTE ON FUNCTION anonymous_has_voted(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION cast_vote(UUID, TEXT, UUID, TEXT, INET, TEXT) TO anon;
