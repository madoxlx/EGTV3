import React, { Suspense, lazy } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { FloatingLanguageSwitcher } from "@/components/ui/floating-language-switcher";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "@/lib/admin-route";
import {
  NavigationProvider,
  useNavigation,
} from "@/contexts/NavigationContext";
import Preloader from "@/components/Preloader";

// Immediate load essential pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";

// Lazy load user-facing pages
const DestinationsPage = lazy(() => import("@/pages/destinations-page"));
const Tours = lazy(() => import("@/pages/Tours"));
const ToursPackageStyle = lazy(() => import("@/pages/ToursPackageStyle"));
const TourDetail = lazy(() => import("@/pages/TourDetail"));
const PackagesPage = lazy(() => import("@/pages/packages"));
const AboutPage = lazy(() => import("@/pages/about-page"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const AllServices = lazy(() => import("@/pages/all-services"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const SocialMediaBoxDemo = lazy(() => import("@/pages/SocialMediaBoxDemo"));
const SailingCruise = lazy(() => import("@/pages/sailing-cruise"));
const ZigzagDemo = lazy(() => import("@/pages/ZigzagDemo"));
const PackageDetail = lazy(() => import("@/pages/package-detail"));
const ManualPackageDetail = lazy(() => import("@/pages/manual-package-detail"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("@/pages/OrderConfirmationPage"));

// Lazy load search results pages
const FlightsSearchResults = lazy(() => import("@/pages/search-results").then(m => ({default: m.FlightsSearchResults})));
const HotelsSearchResults = lazy(() => import("@/pages/search-results").then(m => ({default: m.HotelsSearchResults})));
const TransportationSearchResults = lazy(() => import("@/pages/search-results").then(m => ({default: m.TransportationSearchResults})));
const VisasSearchResults = lazy(() => import("@/pages/search-results").then(m => ({default: m.VisasSearchResults})));
const ToursSearchResults = lazy(() => import("@/pages/search-results").then(m => ({default: m.ToursSearchResults})));
const PackagesSearchResults = lazy(() => import("@/pages/search-results").then(m => ({default: m.PackagesSearchResults})));

// Lazy load all admin pages for better performance
const PackagesManagement = lazy(() => import("@/pages/admin/PackagesManagement"));
const ManualPackagesManagement = lazy(() => import("@/pages/admin/ManualPackagesManagement"));
const PackageCreatorPage = lazy(() => import("@/pages/admin/PackageCreatorPage"));
const CreateManualPackage = lazy(() => import("@/pages/admin/CreateManualPackage"));
const EditManualPackage = lazy(() => import("@/pages/admin/EditManualPackage"));
const UsersManagement = lazy(() => import("@/pages/admin/UsersManagement"));
const ToursManagement = lazy(() => import("@/pages/admin/ToursManagement"));
const TourCreatorPage = lazy(() => import("@/pages/admin/TourCreatorPage"));
const CreateTour = lazy(() => import("@/pages/admin/tours/create"));
const EditTour = lazy(() => import("@/pages/admin/tours/edit"));
const HotelsManagement = lazy(() => import("@/pages/admin/HotelsManagement"));
const AdvancedHotelsManagement = lazy(() => import("@/pages/admin/AdvancedHotelsManagement"));
const HotelCreatePage = lazy(() => import("@/pages/admin/HotelCreatePage"));
const HotelEditPage = lazy(() => import("@/pages/admin/HotelEditPage"));
const EnhancedHotelCreatePage = lazy(() => import("@/pages/admin/EnhancedHotelCreatePage"));
const EnhancedHotelEditPage = lazy(() => import("@/pages/admin/EnhancedHotelEditPage"));
const RoomsManagement = lazy(() => import("@/pages/admin/RoomsManagement"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/AnalyticsDashboard"));
const SystemMonitoring = lazy(() => import("@/pages/admin/SystemMonitoring"));
const EnhancedDataImportPage = lazy(() => import("@/pages/admin/EnhancedDataImportPage"));
const RoomsPage = lazy(() => import("@/pages/admin/RoomsPage"));
const RoomCreatePage = lazy(() => import("@/pages/admin/RoomCreatePage"));
const TransportationManagement = lazy(() => import("@/pages/admin/TransportationManagement"));
const TransportationCreate = lazy(() => import("@/pages/admin/TransportationCreate"));
const TransportationEdit = lazy(() => import("@/pages/admin/TransportationEdit"));
const TransportTypesManagement = lazy(() => import("@/pages/admin/TransportTypesManagement"));
const TransportLocationsManagement = lazy(() => import("@/pages/admin/TransportLocationsManagement"));
const TransportDurationsManagement = lazy(() => import("@/pages/admin/TransportDurationsManagement"));
// Lazy load remaining admin pages
const CountryCityManagement = lazy(() => import("@/pages/admin/CountryCityManagement"));
const DestinationsManagement = lazy(() => import("@/pages/admin/DestinationsManagement"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const SliderManagement = lazy(() => import("@/pages/admin/SliderManagement"));
const TranslationManagement = lazy(() => import("@/pages/admin/TranslationManagement"));
const NavigationManager = lazy(() => import("@/pages/admin/NavigationManager"));
const WhyChooseUsManager = lazy(() => import("@/pages/admin/WhyChooseUsManager"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));

// Immediate load layout components and CSS
import Layout from "@/components/Layout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import "./styles/sailing-cruise.css";

// Lazy load category and feature manager pages
const TourCategoriesPage = lazy(() => import("@/pages/admin/tours/categories"));
const RoomCategoriesPage = lazy(() => import("@/pages/admin/rooms/categories"));
const RoomAmenitiesPage = lazy(() => import("@/pages/admin/rooms/RoomAmenitiesPage"));
const PackageCategoriesPage = lazy(() => import("@/pages/admin/packages/categories"));
const HotelCategoriesPage = lazy(() => import("@/pages/admin/hotels/categories"));
const DataExportImportPage = lazy(() => import("@/pages/admin/DataExportImportPage"));
const VisasManagement = lazy(() => import("@/pages/admin/VisasManagement"));

// Lazy load advanced admin pages
const AdvancedDashboard = lazy(() => import("@/pages/admin/AdvancedDashboard"));
const AdvancedBookingsManagement = lazy(() => import("@/pages/admin/AdvancedBookingsManagement"));
const AdvancedUserManagement = lazy(() => import("@/pages/admin/AdvancedUserManagement"));
const AdvancedSystemSettings = lazy(() => import("@/pages/admin/AdvancedSystemSettings"));
const HomepageSectionsManagement = lazy(() => import("@/pages/admin/HomepageSectionsManagement"));

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  // Don't wrap admin routes with the regular Layout
  if (isAdminRoute) {
    return (
      <DashboardLayout location={location}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
          <Switch>
          <AdminRoute
            path="/admin/packages/create"
            component={PackageCreatorPage}
          />
          <AdminRoute
            path="/admin/packages/edit/:id"
            component={PackageCreatorPage}
          />
          <AdminRoute
            path="/admin/packages/create-manual"
            component={CreateManualPackage}
          />
          <AdminRoute
            path="/admin/packages/edit-manual/:id"
            component={EditManualPackage}
          />
          <AdminRoute
            path="/admin/packages/categories"
            component={PackageCategoriesPage}
          />
          <AdminRoute path="/admin/packages" component={PackagesManagement} />
          <AdminRoute path="/admin/manual-packages" component={ManualPackagesManagement} />
          <AdminRoute
            path="/admin/advanced-users"
            component={AdvancedUserManagement}
          />
          <AdminRoute path="/admin/tours/create" component={CreateTour} />
          <AdminRoute path="/admin/tours/edit/:id" component={EditTour} />
          <AdminRoute path="/admin/tours/creator" component={TourCreatorPage} />
          <AdminRoute
            path="/admin/tours/categories"
            component={TourCategoriesPage}
          />
          <AdminRoute path="/admin/tours" component={ToursManagement} />

          <AdminRoute
            path="/admin/hotels/create"
            component={EnhancedHotelCreatePage}
          />
          <AdminRoute
            path="/admin/hotels/create-basic"
            component={HotelCreatePage}
          />
          <AdminRoute
            path="/admin/hotels/edit/:id"
            component={EnhancedHotelEditPage}
          />
          <AdminRoute
            path="/admin/hotels"
            component={AdvancedHotelsManagement}
          />
          <AdminRoute
            path="/admin/hotels/categories"
            component={HotelCategoriesPage}
          />
          <AdminRoute
            path="/admin/rooms/categories"
            component={RoomCategoriesPage}
          />
          <AdminRoute
            path="/admin/rooms/amenities"
            component={RoomAmenitiesPage}
          />
          <AdminRoute path="/admin/rooms/create" component={RoomCreatePage} />
          <AdminRoute path="/admin/rooms/:id/edit" component={RoomCreatePage} />
          <AdminRoute path="/admin/rooms" component={RoomsPage} />
          <AdminRoute
            path="/admin/transportation/create"
            component={TransportationCreate}
          />
          <AdminRoute
            path="/admin/transportation/edit/:id"
            component={TransportationEdit}
          />
          <AdminRoute
            path="/admin/transportation"
            component={TransportationManagement}
          />
          <AdminRoute
            path="/admin/transport-types"
            component={TransportTypesManagement}
          />
          <AdminRoute
            path="/admin/transport-locations"
            component={TransportLocationsManagement}
          />
          <AdminRoute
            path="/admin/transport-durations"
            component={TransportDurationsManagement}
          />
          <AdminRoute
            path="/admin/countries-cities"
            component={CountryCityManagement}
          />
          <AdminRoute
            path="/admin/destinations"
            component={DestinationsManagement}
          />
          <AdminRoute
            path="/admin/translations"
            component={TranslationManagement}
          />
          <AdminRoute
            path="/admin/navigation"
            component={NavigationManager}
          />
          <AdminRoute
            path="/admin/why-choose-us"
            component={WhyChooseUsManager}
          />
          <AdminRoute
            path="/admin/data-export-import"
            component={DataExportImportPage}
          />
          <AdminRoute
            path="/admin/enhanced-import"
            component={EnhancedDataImportPage}
          />
          <AdminRoute path="/admin/analytics" component={AnalyticsDashboard} />
          <AdminRoute
            path="/admin/system-monitoring"
            component={SystemMonitoring}
          />
          <AdminRoute path="/admin/settings" component={SettingsPage} />
          <AdminRoute
            path="/admin/advanced-settings"
            component={AdvancedSystemSettings}
          />
          <AdminRoute
            path="/admin/advanced-dashboard"
            component={AdvancedDashboard}
          />
          <AdminRoute
            path="/admin/advanced-bookings"
            component={AdvancedBookingsManagement}
          />

          <AdminRoute path="/admin/slider" component={SliderManagement} />
          <AdminRoute path="/admin/navigation" component={NavigationManager} />
          <AdminRoute path="/admin/homepage-sections" component={HomepageSectionsManagement} />
          <AdminRoute path="/admin" component={AdminDashboard} />
          <AdminRoute path="/admin/visas" component={VisasManagement} />
          <Route component={NotFound} />
          </Switch>
        </Suspense>
      </DashboardLayout>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/destinations" component={DestinationsPage} />
          {/* <Route path="/tours" component={Tours} /> */}
          <Route path="/packages" component={PackagesPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/all-services" component={AllServices} />
          <Route path="/social-demo" component={SocialMediaBoxDemo} />
          <Route path="/sailing-cruise" component={SailingCruise} />
          <Route path="/zigzag-demo" component={ZigzagDemo} />
          <ProtectedRoute path="/profile" component={ProfilePage} />

          {/* Search Results Pages */}
          <Route path="/search/flights" component={FlightsSearchResults} />
          <Route path="/search/hotels" component={HotelsSearchResults} />
          <Route
            path="/search/transportation"
            component={TransportationSearchResults}
          />
          <Route path="/search/visas" component={VisasSearchResults} />
          <Route path="/search/tours" component={ToursSearchResults} />
          <Route path="/search/packages" component={PackagesSearchResults} />

          {/* Package detail pages */}
          <Route path="/packages/manual/:id" component={ManualPackageDetail} />
          <Route path="/packages/:id" component={PackageDetail} />

          {/* Tours pages */}
          <Route path="/tours/:slug" component={TourDetail} />
          <Route path="/tours" component={ToursPackageStyle} />

          {/* Hotel detail page */}
          <Route
            path="/hotel/:id"
            component={() => {
              const HotelDetailsPage = React.lazy(
                () => import("@/pages/hotel-details/HotelDetailsPage"),
              );
              return (
                <React.Suspense fallback={<div>Loading...</div>}>
                  <HotelDetailsPage />
                </React.Suspense>
              );
            }}
          />

          {/* Cart and Checkout pages */}
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/order-confirmation" component={OrderConfirmationPage} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
      
      {/* Floating Language Switcher - Available site-wide */}
      <FloatingLanguageSwitcher 
        position="bottom-right" 
        autoHide={true}
        autoHideDelay={8000}
      />
      
      {/* Floating WhatsApp Button - Only on non-admin pages */}
      <FloatingWhatsApp />
    </Layout>
  );
}

function InnerApp() {
  const { isLoading } = useNavigation();
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading || isLoading) {
    return <Preloader isVisible={true} />;
  }

  return <Router />;
}

function AppWithPreloader() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <NavigationProvider>
            <AppWithPreloader />
          </NavigationProvider>
        </LanguageProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
