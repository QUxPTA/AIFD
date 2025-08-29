import { DashboardHeader } from '@/components/layout/dashboard-header';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className='flex min-h-screen'>
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main content */}
        <div className='flex-1 flex flex-col'>
          <DashboardHeader />
          <main className='flex-1 p-6'>{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
