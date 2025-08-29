'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { getPolls } from '@/lib/db';
import type { Poll } from '@/lib/types';
import Link from 'next/link';

export function MyPollsList() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadMyPolls();
    }
  }, [user]);

  const loadMyPolls = async () => {
    try {
      const result = await getPolls({ creator: user?.id });
      if (result.success && result.data) {
        setPolls(result.data);
      } else {
        setError(result.error || 'Failed to load polls');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remove the deleted poll from the list
        setPolls(prev => prev.filter(poll => poll.id !== pollId));
      } else {
        alert(result.error || 'Failed to delete poll');
      }
    } catch (err) {
      alert('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading your polls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">
          You haven't created any polls yet.
        </div>
        <Button asChild>
          <Link href="/dashboard/create-poll">
            Create Your First Poll
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className='space-y-4'>
      {polls.map((poll) => (
        <Card key={poll.id} className='hover:shadow-md transition-shadow'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='space-y-1'>
                <CardTitle className='text-lg'>{poll.question}</CardTitle>
                <CardDescription>{poll.description || 'No description'}</CardDescription>
              </div>
              <div className='flex items-center space-x-2'>
                <Badge variant={poll.is_active ? 'default' : 'secondary'}>
                  {poll.is_active ? 'Active' : 'Closed'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/polls/${poll.id}`}>
                        <Eye className='mr-2 h-4 w-4' />
                        View Poll
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/polls/${poll.id}`}>
                        <BarChart3 className='mr-2 h-4 w-4' />
                        Public View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(poll.id)}
                      className='text-destructive'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                <span>{poll.options?.length || 0} options</span>
                <span>
                  Created {new Date(poll.created_at).toLocaleDateString()}
                </span>
                {poll.expires_at && (
                  <span>
                    Expires {new Date(poll.expires_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <Button size='sm' variant='outline' asChild>
                <Link href={`/dashboard/polls/${poll.id}`}>
                  <BarChart3 className='mr-2 h-4 w-4' />
                  View Results
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
