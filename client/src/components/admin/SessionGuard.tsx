import React from "react";

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  // Bypass session validation for admin access - allow direct access
  return <>{children}</>;
}