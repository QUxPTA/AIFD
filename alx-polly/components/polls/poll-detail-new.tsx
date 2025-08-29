'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, CalendarDays, Clock, Check } from 'lucide-react'
import type { PollWithResults, ApiResponse } from '@/lib/types'

interface PollDetailProps {
  pollId: string
}

export function PollDetail({ pollId }: PollDetailProps) {
  const { user } = useAuth()
  const [poll, setPoll] = useState<PollWithResults | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`/api/polls/${pollId}`)
        const result: ApiResponse<PollWithResults> = await response.json()

        if (result.success && result.data) {
          setPoll(result.data)
          setHasVoted(result.data.user_has_voted || false)
        } else {
          setError(result.error || 'Failed to fetch poll')
        }
      } catch (err) {
        console.error('Error fetching poll:', err)
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPoll()
  }, [pollId])

  const handleOptionSelect = (optionId: string) => {
    if (hasVoted || !poll?.is_active) return

    if (poll?.allow_multiple_votes) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleVote = async () => {
    if (!poll || selectedOptions.length === 0) return

    setIsVoting(true)
    setError('')

    try {
      // For now, just vote for the first selected option
      // In a real implementation, you'd handle multiple votes for multiple-choice polls
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          option_id: selectedOptions[0],
          anonymous_id: !user ? `anon_${Date.now()}` : undefined
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setHasVoted(true)
        setSelectedOptions([])
        // Refresh poll data to get updated results
        const pollResponse = await fetch(`/api/polls/${pollId}`)
        const pollResult: ApiResponse<PollWithResults> = await pollResponse.json()
        if (pollResult.success && pollResult.data) {
          setPoll(pollResult.data)
        }
      } else {
        setError(result.error || 'Failed to cast vote')
      }
    } catch (err) {
      console.error('Error voting:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsVoting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) <= new Date()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!poll) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Poll not found</p>
        </CardContent>
      </Card>
    )
  }

  const expired = isExpired(poll.expires_at)
  const canVote = poll.is_active && !expired && !hasVoted

  return (
    <div className="space-y-6">
      {/* Poll Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{poll.question}</CardTitle>
              {poll.description && (
                <CardDescription className="text-base">
                  {poll.description}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {expired && <Badge variant="secondary">Expired</Badge>}
              {!poll.is_active && <Badge variant="destructive">Closed</Badge>}
              {poll.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
              {poll.allow_multiple_votes && <Badge variant="outline">Multiple Choice</Badge>}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{poll.total_votes} votes</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>Created {formatDate(poll.created_at)}</span>
            </div>
            {poll.expires_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Expires {formatDate(poll.expires_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voting Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {hasVoted ? 'Results' : canVote ? 'Cast Your Vote' : 'Results'}
          </CardTitle>
          {hasVoted && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">You have voted on this poll</span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {poll.options_with_results?.map((option) => {
              const isSelected = selectedOptions.includes(option.id)
              const showResults = hasVoted || !canVote

              return (
                <div
                  key={option.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${canVote ? 'hover:bg-gray-50' : ''}
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${!canVote ? 'cursor-default' : ''}
                  `}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{option.text}</span>
                    {showResults && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {option.vote_count} votes
                        </span>
                        <span className="font-semibold">
                          {option.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {showResults && (
                    <Progress value={option.percentage} className="h-2" />
                  )}
                </div>
              )
            })}
          </div>

          {canVote && selectedOptions.length > 0 && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleVote}
                disabled={isVoting}
                className="flex-1"
              >
                {isVoting ? 'Voting...' : 'Submit Vote'}
              </Button>
              <Button
                onClick={() => setSelectedOptions([])}
                variant="outline"
                disabled={isVoting}
              >
                Clear
              </Button>
            </div>
          )}

          {!canVote && !hasVoted && (
            <div className="mt-4 p-3 text-sm text-gray-600 bg-gray-50 rounded-md">
              {expired ? 'This poll has expired.' : 'This poll is no longer accepting votes.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
