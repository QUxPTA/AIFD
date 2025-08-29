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

export default function DashboardPage() {
  // Mock data - replace with actual data fetching
  const stats = {
    totalPolls: 12,
    totalVotes: 347,
    activePolls: 8,
    totalViews: 1204,
  };

  const recentPolls = [
    {
      id: '1',
      title: 'Favorite Programming Language',
      votes: 89,
      createdAt: '2024-01-20',
    },
    {
      id: '2',
      title: 'Team Meeting Time',
      votes: 32,
      createdAt: '2024-01-18',
    },
  ];

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
            {recentPolls.map((poll) => (
              <div
                key={poll.id}
                className='flex items-center justify-between space-x-4'
              >
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {poll.title}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {poll.votes} votes • {poll.createdAt}
                  </p>
                </div>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/dashboard/polls/${poll.id}`}>View</Link>
                </Button>
              </div>
            ))}
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
