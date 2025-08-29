import { Metadata } from 'next';
import { MyPollsList } from '@/components/polls/my-polls-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Polls',
  description: 'Manage your created polls',
};

export default function MyPollsPage() {
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Polls</h1>
          <p className='text-muted-foreground'>
            Manage and view statistics for your created polls
          </p>
        </div>
        <Button asChild>
          <Link href='/dashboard/create-poll'>
            <Plus className='mr-2 h-4 w-4' />
            Create New Poll
          </Link>
        </Button>
      </div>

      <MyPollsList />
    </div>
  );
}
