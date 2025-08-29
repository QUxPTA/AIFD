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
import { Progress } from '@/components/ui/progress';
import { Vote, Users, Calendar, Share2, BarChart3, QrCode } from 'lucide-react';
import { getPoll, castVote } from '@/lib/db';
import type { Poll, PollWithResults } from '@/lib/types';

interface PollDetailProps {
  pollId: string;
}

export function PollDetail({ pollId }: PollDetailProps) {
  const [poll, setPoll] = useState<PollWithResults | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPoll();
  }, [pollId]);

  const loadPoll = async () => {
    try {
      const result = await getPoll(pollId);
      if (result.success && result.data) {
        setPoll(result.data);
      } else {
        setError(result.error || 'Failed to load poll');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionToggle = (optionId: string) => {
    if (!poll) return;

    if (poll.allow_multiple_votes) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (!poll || selectedOptions.length === 0) return;

    setIsVoting(true);
    setError(null);

    try {
      for (const optionId of selectedOptions) {
        const result = await castVote({
          poll_id: pollId,
          option_id: optionId,
        });
        if (!result.success) {
          setError(result.error || 'Failed to cast vote');
          setIsVoting(false);
          return;
        }
      }

      setHasVoted(true);
      // Reload poll to get updated vote counts
      await loadPoll();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsVoting(false);
    }
  };

  const shareUrl = `${window?.location?.origin}/polls/${pollId}`;

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    // TODO: Show toast notification
  };

  const getPercentage = (votes: number) => {
    const totalVotes = poll?.total_votes || 0;
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };

  const isExpired = poll?.expires_at
    ? new Date(poll.expires_at) < new Date()
    : false;

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>Loading poll...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !poll) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            {error || 'Poll not found'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Poll Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <CardTitle className='text-2xl'>{poll.question}</CardTitle>
              {poll.description && (
                <CardDescription className='text-base'>
                  {poll.description}
                </CardDescription>
              )}
            </div>
            <Badge variant={!isExpired ? 'default' : 'secondary'}>
              {!isExpired ? 'Active' : 'Closed'}
            </Badge>
          </div>

          <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
            <div className='flex items-center'>
              <Users className='mr-1 h-4 w-4' />
              {poll.total_votes || 0} votes
            </div>
            <div className='flex items-center'>
              <Calendar className='mr-1 h-4 w-4' />
              {new Date(poll.created_at).toLocaleDateString()}
            </div>
            {poll.expires_at && (
              <div className='flex items-center'>
                <Calendar className='mr-1 h-4 w-4' />
                Expires: {new Date(poll.expires_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Poll Options */}
      <Card>
        <CardHeader>
          <CardTitle>{hasVoted ? 'Results' : 'Cast Your Vote'}</CardTitle>
          {poll.allow_multiple_votes && !hasVoted && (
            <CardDescription>You can select multiple options</CardDescription>
          )}
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          {poll.options_with_results && poll.options_with_results.length > 0 ? (
            poll.options_with_results.map((option: any) => (
              <div key={option.option_id} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    {!hasVoted && !isExpired && (
                      <input
                        type={poll.allow_multiple_votes ? 'checkbox' : 'radio'}
                        name='poll-option'
                        value={option.option_id}
                        checked={selectedOptions.includes(option.option_id)}
                        onChange={() => handleOptionToggle(option.option_id)}
                        className='h-4 w-4'
                      />
                    )}
                    <span
                      className={`font-medium ${
                        selectedOptions.includes(option.option_id)
                          ? 'text-primary'
                          : ''
                      }`}
                    >
                      {option.option_text}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-muted-foreground'>
                      {option.vote_count || 0} votes
                    </span>
                    <span className='text-sm font-medium'>
                      {option.percentage || 0}%
                    </span>
                  </div>
                </div>
                {(hasVoted || isExpired) && (
                  <Progress value={option.percentage || 0} className='h-2' />
                )}
              </div>
            ))
          ) : (
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <p className='text-muted-foreground'>
                No options available for this poll
              </p>
            </div>
          )}

          {!hasVoted &&
            !isExpired &&
            poll.options_with_results &&
            poll.options_with_results.length > 0 && (
              <Button
                onClick={handleVote}
                disabled={selectedOptions.length === 0 || isVoting}
                className='w-full mt-4'
              >
                <Vote className='mr-2 h-4 w-4' />
                {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
              </Button>
            )}

          {isExpired && (
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <p className='text-muted-foreground'>This poll has expired</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex space-x-2'>
        <Button variant='outline' onClick={copyShareUrl}>
          <Share2 className='mr-2 h-4 w-4' />
          Share Poll
        </Button>
        <Button variant='outline'>
          <QrCode className='mr-2 h-4 w-4' />
          QR Code
        </Button>
        <Button variant='outline'>
          <BarChart3 className='mr-2 h-4 w-4' />
          View Analytics
        </Button>
      </div>
    </div>
  );
}
