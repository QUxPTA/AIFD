import { CreatePollForm } from "@/components/polls/create-poll-form"

export default function CreatePollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create a New Poll</h1>
        <p className="text-muted-foreground">
          Create engaging polls and get instant feedback from your audience
        </p>
      </div>
      
      <div className="max-w-2xl">
        <CreatePollForm />
      </div>
    </div>
  )
}
