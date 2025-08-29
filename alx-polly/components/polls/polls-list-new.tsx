'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CalendarDays, Users, BarChart3, Eye } from 'lucide-react'
import type { PollWithResults, ApiResponse } from '@/lib/types'

interface PollsListProps {
  showCreateButton?: boolean
  limit?: number
  creatorId?: string
}

export function PollsList({ showCreateButton = true, limit, creatorId }: PollsListProps) {
  const [polls, setPolls] = useState<PollWithResults[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        let url = '/api/polls'
        const params = new URLSearchParams()
        
        if (limit) params.append('limit', limit.toString())
        if (creatorId) params.append('creator_id', creatorId)
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await fetch(url)
        const result: ApiResponse<PollWithResults[]> = await response.json()

        if (result.success && result.data) {
          setPolls(result.data)
        } else {
          setError(result.error || 'Failed to fetch polls')
        }
      } catch (err) {
        console.error('Error fetching polls:', err)
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolls()
  }, [limit, creatorId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) <= new Date()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (polls.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No polls found</h3>
          <p className="text-gray-600 mb-4">
            {creatorId ? "You haven't created any polls yet." : "No polls have been created yet."}
          </p>
          {showCreateButton && (
            <Link href="/create-poll">
              <Button>Create Your First Poll</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showCreateButton && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {creatorId ? 'My Polls' : 'Recent Polls'}
          </h2>
          <Link href="/create-poll">
            <Button>Create New Poll</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {polls.map((poll) => {
          const expired = isExpired(poll.expires_at)
          const topOption = poll.options_with_results?.reduce((prev, current) => 
            (prev.vote_count > current.vote_count) ? prev : current
          )

          return (
            <Card key={poll.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {poll.question}
                    </CardTitle>
                    {poll.description && (
                      <CardDescription className="line-clamp-2">
                        {poll.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {expired && (
                      <Badge variant="secondary">Expired</Badge>
                    )}
                    {!poll.is_active && (
                      <Badge variant="destructive">Closed</Badge>
                    )}
                    {poll.is_anonymous && (
                      <Badge variant="outline">Anonymous</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Poll Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                        <span>Expires {formatDate(poll.expires_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Top Option Preview */}
                  {topOption && poll.total_votes > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Leading option:</span>
                        <span>{topOption.percentage}%</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">{topOption.text}</p>
                        <Progress value={topOption.percentage} className="h-2" />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link href={`/polls/${poll.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Poll
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {polls.length >= (limit || 10) && (
        <div className="text-center">
          <Link href="/polls">
            <Button variant="outline">View All Polls</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
