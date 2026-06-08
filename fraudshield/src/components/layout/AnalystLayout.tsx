import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AnalystSidebar } from './AnalystSidebar';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Search } from 'lucide-react';

export function AnalystLayout() {
  const { user, isLoading, userRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'fraud_analyst') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AnalystSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger className="h-9 w-9" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Search className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Fraud Analyst</span>
            </div>
            <div className="hidden md:block" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
