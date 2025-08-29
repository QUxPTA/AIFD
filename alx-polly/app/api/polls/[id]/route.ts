import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database, UpdatePollData, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { id: pollId } = await params;

    // Get poll with results using our database function
    const { data: pollResults, error: dbError } = await supabase
      .rpc('get_poll_results', { poll_uuid: pollId })
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (!pollResults) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if current user has voted (if authenticated)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    let userHasVoted = false;

    if (session?.user) {
      const { data: hasVoted } = await supabase.rpc('user_has_voted', {
        poll_uuid: pollId,
        user_uuid: session.user.id,
      });

      userHasVoted = hasVoted || false;
    }

    const response: ApiResponse = {
      success: true,
      data: {
        ...pollResults,
        user_has_voted: userHasVoted,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { id: pollId } = await params;

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const updates: UpdatePollData = await request.json();

    // Update poll (RLS ensures user owns the poll)
    const { data: poll, error: dbError } = await supabase
      .from('polls')
      .update(updates)
      .eq('id', pollId)
      .eq('creator_id', session.user.id)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to update poll or poll not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: poll,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { id: pollId } = await params;

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete poll (RLS ensures user owns the poll)
    const { error: dbError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)
      .eq('creator_id', session.user.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete poll or poll not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
