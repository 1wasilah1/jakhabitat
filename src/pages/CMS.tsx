import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/cms/LoginForm';
import { CMSDashboard } from '@/components/cms/CMSDashboard';

export const CMS = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <CMSDashboard /> : <LoginForm />;
};