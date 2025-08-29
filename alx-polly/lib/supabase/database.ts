import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type {
  Database,
  Poll,
  Vote,
  CreatePollData,
  UpdatePollData,
  CastVoteData,
  VoteResult,
  PollWithResults,
  PollFilters,
  ApiResponse,
} from '@/lib/types';

// Get Supabase client
const getSupabaseClient = () => createClientComponentClient<Database>();

// Utility function to generate option IDs
const generateOptionId = (index: number): string => `option_${index + 1}`;

// Poll CRUD Operations
export async function createPoll(
  pollData: CreatePollData
): Promise<ApiResponse<Poll>> {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Convert string options to PollOption objects
    const formattedOptions = pollData.options.map((text, index) => ({
      id: generateOptionId(index),
      text: text.trim(),
    }));

    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: pollData.question,
        description: pollData.description || null,
        options: formattedOptions,
        creator_id: user.id,
        allow_multiple_votes: pollData.allow_multiple_votes || false,
        is_anonymous: pollData.is_anonymous || false,
        expires_at: pollData.expires_at || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create poll',
    };
  }
}

export async function getPoll(
  pollId: string
): Promise<ApiResponse<PollWithResults>> {
  try {
    const supabase = getSupabaseClient();

    // Use the get_poll_results function we created
    const { data, error } = await supabase
      .rpc('get_poll_results', { poll_uuid: pollId })
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Poll not found' };
    }

    // Check if current user has voted (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userHasVoted = false;

    if (user) {
      const { data: hasVoted } = await supabase.rpc('user_has_voted', {
        poll_uuid: pollId,
        user_uuid: user.id,
      });

      userHasVoted = hasVoted || false;
    }

    return {
      success: true,
      data: {
        ...data,
        user_has_voted: userHasVoted,
      } as PollWithResults,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get poll',
    };
  }
}

export async function getPolls(
  filters?: PollFilters
): Promise<ApiResponse<Poll[]>> {
  try {
    const supabase = getSupabaseClient();
    let query = supabase.from('polls').select('*');

    // Apply filters
    if (filters?.status === 'active') {
      query = query.eq('is_active', true);
    } else if (filters?.status === 'closed') {
      query = query.eq('is_active', false);
    }

    if (filters?.creator) {
      query = query.eq('creator_id', filters.creator);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get polls',
    };
  }
}

export async function getUserPolls(
  userId: string
): Promise<ApiResponse<Poll[]>> {
  return getPolls({ creator: userId });
}

export async function updatePoll(
  pollId: string,
  updates: UpdatePollData
): Promise<ApiResponse<Poll>> {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('polls')
      .update(updates)
      .eq('id', pollId)
      .eq('creator_id', user.id) // Ensure user owns the poll
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Poll not found or unauthorized' };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update poll',
    };
  }
}

export async function deletePoll(
  pollId: string
): Promise<ApiResponse<boolean>> {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)
      .eq('creator_id', user.id); // Ensure user owns the poll

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete poll',
    };
  }
}

// Vote Operations
export async function castVote(voteData: CastVoteData): Promise<VoteResult> {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get user's IP and user agent for anonymous voting
    const ipAddress = null; // Would need to be passed from client or API route
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : null;

    const { data, error } = await supabase.rpc('cast_vote', {
      poll_uuid: voteData.poll_id,
      option_id_param: voteData.option_id,
      user_uuid: user?.id || null,
      anon_id: voteData.anonymous_id || null,
      ip_addr: ipAddress,
      user_agent_param: userAgent,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // The function returns JSON, parse it
    const result = data as VoteResult;
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cast vote',
    };
  }
}

export async function getUserVotes(
  userId: string
): Promise<ApiResponse<Vote[]>> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get user votes',
    };
  }
}

// Utility function to generate anonymous ID
export function generateAnonymousId(): string {
  // Simple implementation - in production, consider using a more sophisticated approach
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
