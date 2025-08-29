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
import { Plus, Vote, Users, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { getPolls } from '@/lib/db';
import type { Poll } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    totalViews: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Fetch user's polls
      const result = await getPolls({ creator: user?.id });
      if (result.success && result.data) {
        const userPolls = result.data;
        setPolls(userPolls);
        
        // Calculate stats
        const activePolls = userPolls.filter(poll => poll.is_active).length;
        // Note: We don't have vote counts in the basic poll data, 
        // would need to fetch from poll results function for accurate counts
        setStats({
          totalPolls: userPolls.length,
          totalVotes: 0, // This would need to be calculated from votes
          activePolls,
          totalViews: 0, // This would need view tracking
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recentPolls = polls.slice(0, 5); // Show 5 most recent polls

  return (
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome back! Here's an overview of your polling activity.
          </p>
        </div>
        <Button asChild>
          <Link href='/dashboard/create-poll'>
            <Plus className='mr-2 h-4 w-4' />
            Create Poll
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Polls</CardTitle>
            <Vote className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalPolls}</div>
            <p className='text-xs text-muted-foreground'>+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Votes</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalVotes}</div>
            <p className='text-xs text-muted-foreground'>
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Polls</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activePolls}</div>
            <p className='text-xs text-muted-foreground'>Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Views</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalViews}</div>
            <p className='text-xs text-muted-foreground'>
              +25% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Polls */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Polls</CardTitle>
            <CardDescription>Your most recent polling activity</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : recentPolls.length > 0 ? (
              recentPolls.map((poll) => (
                <div
                  key={poll.id}
                  className='flex items-center justify-between space-x-4'
                >
                  <div className='space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {poll.question}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {poll.options?.length || 0} options • {new Date(poll.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant='ghost' size='sm' asChild>
                    <Link href={`/dashboard/polls/${poll.id}`}>View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                No polls created yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button className='w-full justify-start' asChild>
              <Link href='/dashboard/create-poll'>
                <Plus className='mr-2 h-4 w-4' />
                Create New Poll
              </Link>
            </Button>
            <Button variant='outline' className='w-full justify-start' asChild>
              <Link href='/dashboard/my-polls'>
                <Vote className='mr-2 h-4 w-4' />
                View My Polls
              </Link>
            </Button>
            <Button variant='outline' className='w-full justify-start' asChild>
              <Link href='/dashboard/polls'>
                <BarChart3 className='mr-2 h-4 w-4' />
                Browse All Polls
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
