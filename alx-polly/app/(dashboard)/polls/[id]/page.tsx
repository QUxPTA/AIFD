import { PollDetail } from "@/components/polls/poll-detail"
import { notFound } from "next/navigation"

interface PollPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params
  
  // TODO: Fetch poll data from database
  // const poll = await getPoll(id)
  // if (!poll) {
  //   notFound()
  // }

  return (
    <div className="space-y-6">
      <PollDetail pollId={id} />
    </div>
  )
}
