import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ProfileMenu } from "./ProfileMenu";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { SessionGuard } from "@/components/admin/SessionGuard";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DashboardLayoutProps {
  children: React.ReactNode;
  location: string;
}

export function DashboardLayout({ children, location }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useLanguage();

  // Get current user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SessionGuard>
      <div className="min-h-screen bg-zinc-50 flex fixed inset-0 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          location={location}
        />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "ml-[80px]" : "ml-[250px]"} overflow-hidden`}
        >
          <header className="h-16 px-4 border-b flex items-center justify-between bg-white shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-zinc-800">
                {t("admin.dashboard.title", "Admin Dashboard")}
              </h1>
              {user && (
                <div className="flex items-center space-x-2 text-sm text-zinc-600">
                  <User size={16} />
                  <span className="font-medium">ID: {user.id}</span>
                  <span>|</span>
                  <span className="font-medium">@{user.username}</span>
                  {user.fullName && (
                    <>
                      <span>|</span>
                      <span className="font-medium">{user.fullName}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" showLabel={false} />
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink size={18} />
                  <span>{t("admin.viewSite", "View Site")}</span>
                </Button>
              </Link>
              <ProfileMenu />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
