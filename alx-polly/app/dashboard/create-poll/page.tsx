import { Metadata } from 'next';
import { CreatePollForm } from '@/components/polls/create-poll-form';

export const metadata: Metadata = {
  title: 'Create Poll',
  description: 'Create a new poll for your audience',
};

export default function CreatePollPage() {
  return (
    <div className='container mx-auto max-w-2xl py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Create New Poll
        </h1>
        <p className='text-gray-600'>
          Create an engaging poll and share it with your audience. You can
          customize privacy settings and track responses in real-time.
        </p>
      </div>

      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <CreatePollForm />
      </div>
    </div>
  );
}
