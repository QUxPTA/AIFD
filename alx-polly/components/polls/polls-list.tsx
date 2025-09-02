"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, Calendar } from "lucide-react"

// Mock data - replace with actual data fetching
const mockPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Help us understand the community's preferences",
    author: "John Doe",
    totalVotes: 245,
    createdAt: "2024-01-15",
    isActive: true,
    options: [
      { id: "1", text: "JavaScript", votes: 89 },
      { id: "2", text: "Python", votes: 76 },
      { id: "3", text: "TypeScript", votes: 54 },
      { id: "4", text: "Go", votes: 26 },
    ]
  },
  {
    id: "2",
    title: "Best time for team meetings?",
    description: "Let's find a time that works for everyone",
    author: "Jane Smith",
    totalVotes: 32,
    createdAt: "2024-01-20",
    isActive: true,
    options: [
      { id: "1", text: "9 AM", votes: 12 },
      { id: "2", text: "11 AM", votes: 15 },
      { id: "3", text: "2 PM", votes: 5 },
    ]
  }
]

export function PollsList() {
  return (
    <div className="space-y-4">
      {mockPolls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{poll.title}</CardTitle>
                <CardDescription>{poll.description}</CardDescription>
              </div>
              <Badge variant={poll.isActive ? "default" : "secondary"}>
                {poll.isActive ? "Active" : "Closed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {poll.totalVotes} votes
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(poll.createdAt).toLocaleDateString()}
                </div>
                <span>by {poll.author}</span>
              </div>
              <Button size="sm">
                <Vote className="mr-2 h-4 w-4" />
                View Poll
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
