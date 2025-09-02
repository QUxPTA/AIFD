"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - replace with actual data fetching
const mockMyPolls = [
  {
    id: "1",
    title: "Team lunch preferences",
    description: "Weekly team lunch survey",
    totalVotes: 12,
    createdAt: "2024-01-22",
    isActive: true,
    responses: 12,
  },
  {
    id: "2",
    title: "Project feedback survey",
    description: "Collecting feedback on the latest project release",
    totalVotes: 45,
    createdAt: "2024-01-18",
    isActive: false,
    responses: 45,
  },
]

export function MyPollsList() {
  return (
    <div className="space-y-4">
      {mockMyPolls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{poll.title}</CardTitle>
                <CardDescription>{poll.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={poll.isActive ? "default" : "secondary"}>
                  {poll.isActive ? "Active" : "Closed"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Poll
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{poll.responses} responses</span>
                <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
              <Button size="sm" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {mockMyPolls.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No polls yet</h3>
              <p className="text-muted-foreground">
                Create your first poll to get started
              </p>
              <Button className="mt-4">Create Poll</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
