import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminSetupHint, isLocalAdminPreviewEnabled } from '@/lib/admin';
import { useAuth } from '@/lib/auth';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, loading, login, loginError } = useAuth();
  const localPreview = isLocalAdminPreviewEnabled();
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    const signedIn = await login();

    if (!signedIn) {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          Loading BIO LAB...
        </div>
      </div>
    );
  }

  if (requireAdmin && localPreview) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
        <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin login required</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {localPreview
                  ? 'Local test mode is on. Sign in with Google to preview the admin dashboard.'
                  : 'The student website is public. Sign in only if you need to manage BIO LAB admin content.'}
              </p>
            </div>
            <Button
              onClick={() => void handleAdminLogin()}
              className="h-11 w-full rounded-xl bg-teal-600 font-bold text-white hover:bg-teal-700"
            >
              Continue with Google
            </Button>
            <Link to="/">
              <Button variant="outline" className="h-11 w-full rounded-xl font-bold">
                Back to Home
              </Button>
            </Link>
            {loginError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
                {loginError}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
        <Card className="w-full max-w-lg border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin access only</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                This account is logged in, but it is not listed as an admin. {adminSetupHint}
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" className="h-11 w-full rounded-xl font-bold">
                Back to BIO LAB
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
