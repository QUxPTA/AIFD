import { PollsList } from "@/components/polls/polls-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PollsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Polls</h1>
          <p className="text-muted-foreground">
            Discover and participate in polls from the community
          </p>
        </div>
        <Button asChild>
          <Link href="/create-poll">
            <Plus className="mr-2 h-4 w-4" />
            Create Poll
          </Link>
        </Button>
      </div>
      
      <PollsList />
    </div>
  )
}
