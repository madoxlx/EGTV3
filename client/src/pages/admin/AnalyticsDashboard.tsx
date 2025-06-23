import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  Eye,
  MapPin,
  Star,
  Clock,
  Percent
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

interface AnalyticsData {
  revenueData: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
    activeUsers: number;
  }>;
  topPerformingHotels: Array<{
    id: number;
    name: string;
    bookings: number;
    revenue: number;
    rating: number;
    city: string;
  }>;
  topPerformingPackages: Array<{
    id: number;
    name: string;
    bookings: number;
    revenue: number;
    rating: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }>;
  performanceMetrics: {
    conversionRate: number;
    averageBookingValue: number;
    customerLifetimeValue: number;
    churnRate: number;
    repeatCustomerRate: number;
  };
}

export default function AnalyticsDashboard() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics', selectedPeriod, dateRange],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('admin.analytics.title', 'Analytics Dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('admin.analytics.subtitle', 'Comprehensive insights and performance metrics')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t('admin.analytics.last_7_days', 'Last 7 days')}</SelectItem>
                <SelectItem value="30d">{t('admin.analytics.last_30_days', 'Last 30 days')}</SelectItem>
                <SelectItem value="90d">{t('admin.analytics.last_90_days', 'Last 90 days')}</SelectItem>
                <SelectItem value="1y">{t('admin.analytics.last_year', 'Last year')}</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {t('admin.analytics.custom_range', 'Custom Range')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{from: dateRange.from, to: dateRange.to}}
                  onSelect={(range) => setDateRange(range || {from: undefined, to: undefined})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('admin.analytics.export_report', 'Export Report')}
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.analytics.conversion_rate', 'Conversion Rate')}</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(analytics?.performanceMetrics?.conversionRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.analytics.conversion_growth', '+2.5% from last period')}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.analytics.avg_booking_value', 'Avg. Booking Value')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.performanceMetrics?.averageBookingValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.analytics.booking_value_growth', '+8.1% from last period')}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.analytics.customer_ltv', 'Customer LTV')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.performanceMetrics?.customerLifetimeValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.analytics.ltv_growth', '+12.3% from last period')}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.analytics.repeat_customer_rate', 'Repeat Customer Rate')}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(analytics?.performanceMetrics?.repeatCustomerRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('admin.analytics.repeat_customer_growth', '+5.2% from last period')}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.analytics.churn_rate', 'Churn Rate')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(analytics?.performanceMetrics?.churnRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {t('admin.analytics.churn_rate_decline', '-1.2% from last period')}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">{t('admin.analytics.performance', 'Performance')}</TabsTrigger>
            <TabsTrigger value="geographic">{t('admin.analytics.geographic', 'Geographic')}</TabsTrigger>
            <TabsTrigger value="products">{t('admin.analytics.products', 'Top Products')}</TabsTrigger>
            <TabsTrigger value="trends">{t('admin.analytics.trends', 'Trends')}</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    {t('admin.analytics.revenue_overview', 'Revenue Overview')}
                  </CardTitle>
                  <CardDescription>{t('admin.analytics.monthly_revenue_booking_trends', 'Monthly revenue and booking trends')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.revenueData?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.month}</p>
                          <p className="text-sm text-muted-foreground">{item.bookings} {t('admin.analytics.bookings', 'bookings')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(item.revenue)}</p>
                          <Badge variant="outline">{item.bookings} {t('admin.analytics.orders', 'orders')}</Badge>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('admin.analytics.no_revenue_data_available', 'No revenue data available for the selected period')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    {t('admin.analytics.user_growth', 'User Growth')}
                  </CardTitle>
                  <CardDescription>{t('admin.analytics.new_vs_active_users', 'New vs active users')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.userGrowth?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.month}</p>
                          <p className="text-sm text-muted-foreground">{t('admin.analytics.active', 'Active')}: {item.activeUsers}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.users} {t('admin.analytics.total', 'total')}</p>
                          <Badge variant="secondary">
                            {Math.round((item.activeUsers / item.users) * 100)}% {t('admin.analytics.active', 'active')}
                          </Badge>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('admin.analytics.no_user_growth_data_available', 'No user growth data available for the selected period')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {t('admin.analytics.geographic_distribution', 'Geographic Distribution')}
                </CardTitle>
                <CardDescription>{t('admin.analytics.bookings_revenue_country', 'Bookings and revenue by country')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.geographicDistribution?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{item.country}</p>
                          <p className="text-sm text-muted-foreground">{item.bookings} {t('admin.analytics.bookings', 'bookings')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.revenue)}</p>
                        <p className="text-sm text-muted-foreground">{formatPercentage(item.percentage)}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('admin.analytics.no_geographic_data_available', 'No geographic data available for the selected period')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Top Hotels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    {t('admin.analytics.top_performing_hotels', 'Top Performing Hotels')}
                  </CardTitle>
                  <CardDescription>{t('admin.analytics.best_performing_hotels_revenue', 'Best performing hotels by revenue')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.topPerformingHotels?.map((hotel, index) => (
                      <div key={hotel.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{hotel.name}</p>
                            <p className="text-sm text-muted-foreground">{hotel.city} • ⭐ {hotel.rating}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(hotel.revenue)}</p>
                          <p className="text-sm text-muted-foreground">{hotel.bookings} {t('admin.analytics.bookings', 'bookings')}</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('admin.analytics.no_hotel_data_available', 'No hotel data available for the selected period')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Packages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    {t('admin.analytics.top_performing_packages', 'Top Performing Packages')}
                  </CardTitle>
                  <CardDescription>{t('admin.analytics.best_performing_packages_revenue', 'Best performing packages by revenue')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.topPerformingPackages?.map((pkg, index) => (
                      <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-sm text-muted-foreground">⭐ {pkg.rating}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(pkg.revenue)}</p>
                          <p className="text-sm text-muted-foreground">{pkg.bookings} {t('admin.analytics.bookings', 'bookings')}</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('admin.analytics.no_package_data_available', 'No package data available for the selected period')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {t('admin.analytics.booking_trends', 'Booking Trends')}
                </CardTitle>
                <CardDescription>{t('admin.analytics.seasonal_temporal_booking_patterns', 'Seasonal and temporal booking patterns')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.analytics.advanced_trend_analysis_coming_soon', 'Advanced trend analysis coming soon')}</p>
                  <p className="text-sm">{t('admin.analytics.this_will_include_seasonal_patterns', 'This will include seasonal patterns, peak booking times, and predictive analytics')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}