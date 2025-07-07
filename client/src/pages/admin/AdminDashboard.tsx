import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Hotel, 
  Package, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Eye,
  Settings,
  Download,
  Upload,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Star,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";

interface DashboardStats {
  totalUsers: number;
  totalHotels: number;
  totalPackages: number;
  totalBookings: number;
  revenue: number;
  activeUsers: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
  popularDestinations: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
  };
}

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard-stats'],
  });

  if (isLoading) {
    return (
      <div>
        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      case 'package': return <Package className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className={`${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('admin.dashboard.title', 'Admin Dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('admin.dashboard.subtitle', 'Comprehensive overview of your travel platform')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('admin.dashboard.export_data', 'Export Data')}
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              {t('admin.dashboard.import_data', 'Import Data')}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              {t('admin.dashboard.settings', 'Settings')}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_users', 'Total Users')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.dashboard.users_growth', '+12% from last month')}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_hotels', 'Total Hotels')}</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalHotels || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.dashboard.hotels_growth', '+5% from last month')}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.active_packages', 'Active Packages')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPackages || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.dashboard.packages_growth', '+8% from last month')}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.revenue', 'Revenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats?.revenue || 0) / 100).toLocaleString('en-US')} EGP
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.dashboard.revenue_growth', '+23% from last month')}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              {t('admin.dashboard.system_health', 'System Health')}
            </CardTitle>
            <CardDescription>
              {t('admin.dashboard.system_health_desc', 'Real-time status of platform components')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(stats?.systemHealth?.database || 'healthy')}`} />
                <div>
                  <p className="font-medium">{t('admin.dashboard.database', 'Database')}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.systemHealth?.database === 'healthy' ? t('admin.dashboard.all_systems_operational', 'All systems operational') : t('admin.dashboard.issues_detected', 'Issues detected')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(stats?.systemHealth?.api || 'healthy')}`} />
                <div>
                  <p className="font-medium">{t('admin.dashboard.api_services', 'API Services')}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.systemHealth?.api === 'healthy' ? t('admin.dashboard.response_time_optimal', 'Response time optimal') : t('admin.dashboard.performance_issues', 'Performance issues')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(stats?.systemHealth?.storage || 'healthy')}`} />
                <div>
                  <p className="font-medium">{t('admin.dashboard.storage', 'Storage')}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.systemHealth?.storage === 'healthy' ? t('admin.dashboard.storage_available', 'Storage available') : t('admin.dashboard.storage_issues', 'Storage issues')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('admin.dashboard.overview', 'Overview')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('admin.dashboard.analytics', 'Analytics')}</TabsTrigger>
            <TabsTrigger value="activity">{t('admin.dashboard.activity', 'Activity')}</TabsTrigger>
            <TabsTrigger value="management">{t('admin.dashboard.quick_management', 'Quick Management')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Popular Destinations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {t('admin.dashboard.top_destinations', 'Top Destinations')}
                  </CardTitle>
                  <CardDescription>{t('admin.dashboard.most_popular_destinations', 'Most popular destinations this month')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.popularDestinations?.map((dest, index) => (
                      <div key={dest.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{dest.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{dest.bookings} {t('admin.dashboard.bookings', 'bookings')}</p>
                          <p className="text-sm text-muted-foreground">
                            {(dest.revenue / 100).toLocaleString('en-US')} EGP
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    {t('admin.dashboard.performance_metrics', 'Performance Metrics')}
                  </CardTitle>
                  <CardDescription>{t('admin.dashboard.key_performance_indicators', 'Key performance indicators')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{t('admin.dashboard.booking_conversion_rate', 'Booking Conversion Rate')}</span>
                      <span className="text-sm">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{t('admin.dashboard.user_engagement', 'User Engagement')}</span>
                      <span className="text-sm">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{t('admin.dashboard.platform_uptime', 'Platform Uptime')}</span>
                      <span className="text-sm">99.9%</span>
                    </div>
                    <Progress value={99.9} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5" />
                    {t('admin.dashboard.revenue_distribution', 'Revenue Distribution')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>{t('admin.dashboard.hotel_bookings', 'Hotel Bookings')}</span>
                      <Badge>65%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('admin.dashboard.package_tours', 'Package Tours')}</span>
                      <Badge>25%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('admin.dashboard.transportation', 'Transportation')}</span>
                      <Badge>10%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    {t('admin.dashboard.customer_satisfaction', 'Customer Satisfaction')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">4.8</div>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('admin.dashboard.based_on_reviews', 'Based on 1,234 reviews')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {t('admin.dashboard.recent_activity', 'Recent Activity')}
                </CardTitle>
                <CardDescription>{t('admin.dashboard.latest_system_activities', 'Latest system activities and updates')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity?.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                      </div>
                      <Badge 
                        variant={activity.status === 'success' ? 'default' : 
                                activity.status === 'warning' ? 'secondary' : 'destructive'}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  )) || (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="h-8 w-8 rounded" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.hotel_management', 'Hotel Management')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.manage_hotels_accommodations', 'Manage hotels and accommodations')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/hotels">{t('admin.dashboard.view_all_hotels', 'View All Hotels')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/hotels/create">{t('admin.dashboard.add_new_hotel', 'Add New Hotel')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/hotels/categories">{t('admin.dashboard.hotel_categories', 'Hotel Categories')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.package_management', 'Package Management')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.create_manage_tour_packages', 'Create and manage tour packages')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/packages">Dynamic Packages</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/admin/manual-packages">Manual Packages</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/packages/create">Create Dynamic</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/packages/create-manual">Create Manual</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/packages/categories">{t('admin.dashboard.package_categories', 'Package Categories')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.user_management', 'User Management')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.manage_users_permissions', 'Manage users and permissions')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/users">{t('admin.dashboard.view_all_users', 'View All Users')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/users/create">{t('admin.dashboard.add_new_user', 'Add New User')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/roles">{t('admin.dashboard.manage_roles', 'Manage Roles')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.content_management', 'Content Management')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.manage_content_translations', 'Manage content and translations')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/content">{t('admin.dashboard.content_editor', 'Content Editor')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/translations">{t('admin.dashboard.translations', 'Translations')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/menus">{t('admin.dashboard.menu_management', 'Menu Management')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.analytics_reports', 'Analytics & Reports')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.view_detailed_analytics_reports', 'View detailed analytics and reports')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/analytics">{t('admin.dashboard.analytics_dashboard', 'Analytics Dashboard')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/reports">{t('admin.dashboard.generate_reports', 'Generate Reports')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/exports">{t('admin.dashboard.data_exports', 'Data Exports')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.system_settings', 'System Settings')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.configure_system_settings', 'Configure system settings')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/settings">{t('admin.dashboard.general_settings', 'General Settings')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/integrations">{t('admin.dashboard.integrations', 'Integrations')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/maintenance">{t('admin.dashboard.maintenance', 'Maintenance')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}