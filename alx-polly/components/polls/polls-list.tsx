"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, Calendar } from "lucide-react"
import { getPolls } from "@/lib/db"
import type { Poll } from "@/lib/types"
import Link from "next/link"

export function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadPolls()
  }, [])

  const loadPolls = async () => {
    try {
      const result = await getPolls({ status: 'active' }) // Only show active polls
      if (result.success && result.data) {
        setPolls(result.data)
      } else {
        setError(result.error || 'Failed to load polls')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading polls...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">
          No active polls available at the moment.
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{poll.question}</CardTitle>
                <CardDescription>{poll.description || 'No description provided'}</CardDescription>
              </div>
              <Badge variant={poll.is_active ? "default" : "secondary"}>
                {poll.is_active ? "Active" : "Closed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {poll.options?.length || 0} options
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(poll.created_at).toLocaleDateString()}
                </div>
                {poll.expires_at && (
                  <span>Expires {new Date(poll.expires_at).toLocaleDateString()}</span>
                )}
              </div>
              <Button size="sm" asChild>
                <Link href={`/polls/${poll.id}`}>
                  <Vote className="mr-2 h-4 w-4" />
                  View Poll
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
