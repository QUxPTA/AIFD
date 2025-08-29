import { PollDetail } from '@/components/polls/poll-detail';
import { Metadata } from 'next';

interface PollPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PollPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Poll - ${id}`,
    description: 'View and manage poll details',
  };
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params;

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Poll Details</h1>
        <p className='text-gray-600'>View poll results and manage settings</p>
      </div>

      <PollDetail pollId={id} />
    </div>
  );
}
