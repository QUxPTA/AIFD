import { PollDetail } from "@/components/polls/poll-detail"
import { notFound } from "next/navigation"

interface PublicPollPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PublicPollPage({ params }: PublicPollPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Public Poll</h1>
          <p className="text-gray-600 mt-2">Share your opinion on this poll</p>
        </div>
        
        <PollDetail pollId={id} />
        
        <div className="mt-8 text-center">
          <a 
            href="/register" 
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            Create your own polls - Sign up for free
          </a>
        </div>
      </div>
    </div>
  )
}
