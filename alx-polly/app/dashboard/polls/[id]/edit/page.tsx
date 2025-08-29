import { Metadata } from "next"
import { EditPollForm } from "@/components/polls/edit-poll-form"

interface EditPollPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EditPollPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Edit Poll - ${id}`,
    description: 'Edit your poll settings and options',
  }
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Poll</h1>
        <p className="text-gray-600">
          Update your poll question, options, and settings.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <EditPollForm pollId={id} />
      </div>
    </div>
  )
}
