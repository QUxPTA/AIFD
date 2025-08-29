import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database, CreatePollData, ApiResponse, Poll } from '@/lib/types'

// Generate option IDs
const generateOptionId = (index: number): string => `option_${index + 1}`

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CreatePollData = await request.json()
    
    // Validate input
    if (!body.question?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    if (!body.options || body.options.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 options are required' },
        { status: 400 }
      )
    }

    if (body.options.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 options allowed' },
        { status: 400 }
      )
    }

    // Filter out empty options and validate
    const validOptions = body.options
      .map(option => option.trim())
      .filter(option => option.length > 0)

    if (validOptions.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 non-empty options are required' },
        { status: 400 }
      )
    }

    // Convert string options to PollOption objects
    const formattedOptions = validOptions.map((text, index) => ({
      id: generateOptionId(index),
      text
    }))

    // Create poll in database
    const { data: poll, error: dbError } = await supabase
      .from('polls')
      .insert({
        question: body.question.trim(),
        description: body.description?.trim() || null,
        options: formattedOptions,
        creator_id: session.user.id,
        allow_multiple_votes: body.allow_multiple_votes || false,
        is_anonymous: body.is_anonymous || false,
        expires_at: body.expires_at || null
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    const response: ApiResponse<Poll> = {
      success: true,
      data: poll
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)

    // Build query
    let query = supabase.from('polls').select('*')

    // Apply filters from query parameters
    const status = searchParams.get('status')
    const creator = searchParams.get('creator')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'closed') {
      query = query.eq('is_active', false)
    }

    if (creator) {
      query = query.eq('creator_id', creator)
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data: polls, error: dbError } = await query

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch polls' },
        { status: 500 }
      )
    }

    const response: ApiResponse<Poll[]> = {
      success: true,
      data: polls || []
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
