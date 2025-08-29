import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface VoteData {
  option_id: string;
  anonymous_id?: string;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { id: pollId } = await params;

    // Parse request body
    const { option_id, anonymous_id }: VoteData = await request.json();

    if (!option_id) {
      return NextResponse.json(
        { success: false, error: 'Option ID is required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let userId: string | null = null;
    let anonId: string | null = null;

    if (session?.user) {
      userId = session.user.id;
    } else if (anonymous_id) {
      anonId = anonymous_id;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Either authentication or anonymous ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user/anonymous has already voted on this poll
    if (userId) {
      const { data: hasVoted } = await supabase.rpc('user_has_voted', {
        poll_uuid: pollId,
        user_uuid: userId,
      });

      if (hasVoted) {
        return NextResponse.json(
          { success: false, error: 'You have already voted on this poll' },
          { status: 409 }
        );
      }
    } else if (anonId) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('anonymous_id', anonId)
        .single();

      if (existingVote) {
        return NextResponse.json(
          {
            success: false,
            error: 'This anonymous user has already voted on this poll',
          },
          { status: 409 }
        );
      }
    }

    // Verify poll exists and option belongs to this poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, options')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if option_id exists in poll options
    const options = poll.options as { id: string; text: string }[];
    const validOption = options.find((opt) => opt.id === option_id);

    if (!validOption) {
      return NextResponse.json(
        { success: false, error: 'Invalid option selected' },
        { status: 400 }
      );
    }

    // Cast the vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert([
        {
          poll_id: pollId,
          option_id: option_id,
          user_id: userId,
          anonymous_id: anonId,
        },
      ])
      .select()
      .single();

    if (voteError) {
      console.error('Vote error:', voteError);
      return NextResponse.json(
        { success: false, error: 'Failed to cast vote' },
        { status: 500 }
      );
    }

    // Return updated poll results
    const { data: pollResults, error: resultsError } = await supabase
      .rpc('get_poll_results', { poll_uuid: pollId })
      .single();

    if (resultsError) {
      console.error('Results error:', resultsError);
      // Vote was cast successfully, but we couldn't get updated results
      return NextResponse.json({
        success: true,
        data: { vote_cast: true },
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        vote_cast: true,
        poll_results: pollResults,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
