'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import type { CreatePollData, ApiResponse } from '@/lib/types';

export function CreatePollForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form state
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');

  // Add new option
  const addOption = () => {
    if (options.length < 10) {
      // Limit to 10 options
      setOptions([...options, '']);
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    if (options.length > 2) {
      // Keep minimum 2 options
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // Update option text
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!question.trim()) {
      return 'Question is required';
    }

    if (question.length > 500) {
      return 'Question must be 500 characters or less';
    }

    const validOptions = options.filter((opt) => opt.trim().length > 0);
    if (validOptions.length < 2) {
      return 'At least 2 options are required';
    }

    if (validOptions.some((opt) => opt.length > 200)) {
      return 'Options must be 200 characters or less';
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return 'Expiration date must be in the future';
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const validOptions = options.filter((opt) => opt.trim().length > 0);

      const pollData: CreatePollData = {
        question: question.trim(),
        description: description.trim() || undefined,
        options: validOptions,
        allow_multiple_votes: allowMultipleVotes,
        is_anonymous: isAnonymous,
        expires_at: expiresAt || undefined,
      };

      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      });

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        // Show success message
        setSuccess('Poll created successfully! Redirecting to polls page...');
        setError('');

        // Redirect to the public polls page after a short delay
        setTimeout(() => {
          router.push(`/polls/${result.data.id}`);
        }, 1500);
      } else {
        setError(result.error || 'Failed to create poll');
        setSuccess('');
      }
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('An unexpected error occurred');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Create a poll to gather opinions and feedback from your audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Error Display */}
          {error && (
            <div className='p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md'>
              {error}
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className='p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md'>
              {success}
            </div>
          )}

          {/* Question */}
          <div className='space-y-2'>
            <Label htmlFor='question'>
              Poll Question <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='question'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='What would you like to ask?'
              maxLength={500}
              required
            />
            <p className='text-xs text-gray-500'>
              {question.length}/500 characters
            </p>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Add more context or details about your poll...'
              maxLength={1000}
              rows={3}
            />
            <p className='text-xs text-gray-500'>
              {description.length}/1000 characters
            </p>
          </div>

          {/* Options */}
          <div className='space-y-2'>
            <Label>
              Poll Options <span className='text-red-500'>*</span>
            </Label>
            <div className='space-y-2'>
              {options.map((option, index) => (
                <div key={index} className='flex gap-2'>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={200}
                  />
                  {options.length > 2 && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => removeOption(index)}
                      className='shrink-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <Button
                type='button'
                variant='outline'
                onClick={addOption}
                className='w-full'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Option
              </Button>
            )}
          </div>

          {/* Settings */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>Poll Settings</h3>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='multiple-votes'>Allow Multiple Votes</Label>
                <p className='text-xs text-gray-500'>
                  Let users select multiple options
                </p>
              </div>
              <Switch
                id='multiple-votes'
                checked={allowMultipleVotes}
                onCheckedChange={setAllowMultipleVotes}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='anonymous'>Anonymous Voting</Label>
                <p className='text-xs text-gray-500'>
                  Allow voting without requiring login
                </p>
              </div>
              <Switch
                id='anonymous'
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='expires-at'>Expiration Date (Optional)</Label>
              <Input
                id='expires-at'
                type='datetime-local'
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className='text-xs text-gray-500'>
                Leave empty for polls that never expire
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={isLoading}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='flex-1'>
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
