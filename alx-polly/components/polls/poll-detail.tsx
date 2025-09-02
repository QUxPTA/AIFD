"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Vote, Users, Calendar, Share2, BarChart3 } from "lucide-react"

interface PollDetailProps {
  pollId: string
}

// Mock data - replace with actual data fetching
const mockPoll = {
  id: "1",
  title: "What's your favorite programming language?",
  description: "Help us understand the community's preferences for backend development in 2024.",
  author: "John Doe",
  totalVotes: 245,
  createdAt: "2024-01-15",
  isActive: true,
  allowMultipleVotes: false,
  options: [
    { id: "1", text: "JavaScript", votes: 89 },
    { id: "2", text: "Python", votes: 76 },
    { id: "3", text: "TypeScript", votes: 54 },
    { id: "4", text: "Go", votes: 26 },
  ]
}

export function PollDetail({ pollId }: PollDetailProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = () => {
    if (selectedOption) {
      // TODO: Submit vote to API
      console.log("Voting for option:", selectedOption)
      setHasVoted(true)
    }
  }

  const getPercentage = (votes: number) => {
    return mockPoll.totalVotes > 0 ? (votes / mockPoll.totalVotes) * 100 : 0
  }

  return (
    <div className="space-y-6">
      {/* Poll Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{mockPoll.title}</CardTitle>
              <CardDescription className="text-base">
                {mockPoll.description}
              </CardDescription>
            </div>
            <Badge variant={mockPoll.isActive ? "default" : "secondary"}>
              {mockPoll.isActive ? "Active" : "Closed"}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {mockPoll.totalVotes} votes
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {new Date(mockPoll.createdAt).toLocaleDateString()}
            </div>
            <span>by {mockPoll.author}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Poll Options */}
      <Card>
        <CardHeader>
          <CardTitle>
            {hasVoted ? "Results" : "Cast Your Vote"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPoll.options.map((option) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {!hasVoted && mockPoll.isActive && (
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="h-4 w-4"
                    />
                  )}
                  <span className={`font-medium ${selectedOption === option.id ? 'text-primary' : ''}`}>
                    {option.text}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {option.votes} votes
                  </span>
                  <span className="text-sm font-medium">
                    {getPercentage(option.votes).toFixed(1)}%
                  </span>
                </div>
              </div>
              {hasVoted && (
                <Progress value={getPercentage(option.votes)} className="h-2" />
              )}
            </div>
          ))}
          
          {!hasVoted && mockPoll.isActive && (
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption}
              className="w-full mt-4"
            >
              <Vote className="mr-2 h-4 w-4" />
              Submit Vote
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share Poll
        </Button>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>
    </div>
  )
}
