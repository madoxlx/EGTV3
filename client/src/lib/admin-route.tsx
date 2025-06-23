import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading, error } = useAuth();

  // Check if session is valid by making a test request
  useEffect(() => {
    if (user && user.role === "admin") {
      // Test session validity
      fetch('/api/user', {
        credentials: 'include',
      }).catch(() => {
        // If session is invalid, clear user data and redirect
        localStorage.removeItem('user');
        window.location.href = '/auth';
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If there's an error or user is not authenticated, redirect to auth page
  if (error || !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // If user is authenticated but not an admin, redirect to home page
  if (user.role !== "admin") {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // User is authenticated and has admin role, show the component
  return <Route path={path} component={Component} />;
}