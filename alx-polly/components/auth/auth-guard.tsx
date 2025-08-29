'use client';

import { useSupabase } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };

    // a delay to prevent flash of loading screen on fast connections
    const timer = setTimeout(() => {
      checkUser();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, router, supabase.auth]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
