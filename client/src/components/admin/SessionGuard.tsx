import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { user, logoutMutation } = useAuth();
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (!user) {
        setIsSessionValid(false);
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch('/api/session/validate', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsSessionValid(data.valid);
          
          if (!data.valid) {
            // Clear invalid session data
            localStorage.removeItem('user');
          }
        } else {
          setIsSessionValid(false);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setIsSessionValid(false);
        localStorage.removeItem('user');
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [user]);

  // Show loading while checking session
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Show error if session is invalid
  if (!isSessionValid) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              جلسة العمل منتهية الصلاحية. يرجى تسجيل الدخول مرة أخرى.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="w-full"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  // Session is valid, render children
  return <>{children}</>;
} 