import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import VenueLayout from './layouts/VenueLayout';
import InstructorLayout from './layouts/InstructorLayout';

// Admin pages
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import VenuesPage from './pages/VenuesPage';
import InstructorsPage from './pages/InstructorsPage';

// Venue pages
import VenueDashboardPage from './pages/venue/DashboardPage';
import VenueContentPage from './pages/venue/ContentPage';
import VenueQAPage from './pages/venue/QAPage';
import VenueChatPage from './pages/venue/ChatPage';
import VenueCampaignsPage from './pages/venue/CampaignsPage';
import VenueVibesPage from './pages/venue/VibesPage';
import VenueDiscountsPage from './pages/venue/DiscountsPage';
import VenueAdsPage from './pages/venue/AdsPage';
import VenueSettingsPage from './pages/venue/SettingsPage';
import SettingsPage from './pages/SettingsPage';

// Instructor pages
import InstructorDashboardPage from './pages/instructor/DashboardPage';
import InstructorContentPage from './pages/instructor/ContentPage';
import InstructorStreamingPage from './pages/instructor/StreamingPage';
import InstructorClassesPage from './pages/instructor/ClassesPage';
import InstructorClassDetailPage from './pages/instructor/ClassDetailPage';
import InstructorSettingsPage from './pages/instructor/SettingsPage';

// Production pages
import ProductionCreatePage from './pages/instructor/ProductionCreatePage';
import AIContentAssistantPage from './pages/instructor/AIContentAssistantPage';
import ScheduleCapacityPage from './pages/instructor/ScheduleCapacityPage';

// Tickets pages
import TicketsPricingPage from './pages/instructor/TicketsPricingPage';
import QRCheckinPage from './pages/instructor/QRCheckinPage';
import AccessRulesPage from './pages/instructor/AccessRulesPage';

// Visibility pages
import VisibilityBoostsPage from './pages/instructor/VisibilityBoostsPage';
import VisibilityTrendingPage from './pages/instructor/VisibilityTrendingPage';
import VisibilityNearbyPage from './pages/instructor/VisibilityNearbyPage';
import VisibilityInfluencerPage from './pages/instructor/VisibilityInfluencerPage';

// Monetization pages
import MonetizationPricingPage from './pages/instructor/MonetizationPricingPage';
import MonetizationRevenuePage from './pages/instructor/MonetizationRevenuePage';
import MonetizationPayoutsPage from './pages/instructor/MonetizationPayoutsPage';
import MonetizationAnalyticsPage from './pages/instructor/MonetizationAnalyticsPage';

function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderRoleBasedRoutes = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return (
          <AdminLayout>
            <Routes>
              {/* Admin Management Pages */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/venues" element={<VenuesPage />} />
              <Route path="/instructors" element={<InstructorsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Venue Features (Admin can access all) */}
              <Route path="/venue/content" element={<VenueContentPage />} />
              <Route path="/venue/qa" element={<VenueQAPage />} />
              <Route path="/venue/chat" element={<VenueChatPage />} />
              <Route path="/venue/campaigns" element={<VenueCampaignsPage />} />
              <Route path="/venue/vibes" element={<VenueVibesPage />} />
              <Route path="/venue/discounts" element={<VenueDiscountsPage />} />
              <Route path="/venue/ads" element={<VenueAdsPage />} />
              
              {/* Instructor Features (Admin can access all) */}
              <Route path="/instructor/content" element={<InstructorContentPage />} />
              <Route path="/instructor/streaming" element={<InstructorStreamingPage />} />
              <Route path="/instructor/classes" element={<InstructorClassesPage />} />
              <Route path="/instructor/classes/:id" element={<InstructorClassDetailPage />} />
              
              {/* Production (Admin can access) */}
              <Route path="/production/create" element={<ProductionCreatePage />} />
              <Route path="/production/ai-assistant" element={<AIContentAssistantPage />} />
              <Route path="/production/schedule" element={<ScheduleCapacityPage />} />
              
              {/* Tickets (Admin can access) */}
              <Route path="/tickets/pricing" element={<TicketsPricingPage />} />
              <Route path="/tickets/checkin" element={<QRCheckinPage />} />
              <Route path="/tickets/access" element={<AccessRulesPage />} />
              
              {/* Visibility (Admin can access) */}
              <Route path="/visibility/boosts" element={<VisibilityBoostsPage />} />
              <Route path="/visibility/trending" element={<VisibilityTrendingPage />} />
              <Route path="/visibility/nearby" element={<VisibilityNearbyPage />} />
              <Route path="/visibility/influencer" element={<VisibilityInfluencerPage />} />
              
              {/* Monetization (Admin can access) */}
              <Route path="/monetization/pricing" element={<MonetizationPricingPage />} />
              <Route path="/monetization/revenue" element={<MonetizationRevenuePage />} />
              <Route path="/monetization/payouts" element={<MonetizationPayoutsPage />} />
              <Route path="/monetization/analytics" element={<MonetizationAnalyticsPage />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        );
      case 'venue':
        return (
          <VenueLayout>
            <Routes>
              <Route path="/dashboard" element={<VenueDashboardPage />} />
              <Route path="/content" element={<VenueContentPage />} />
              <Route path="/qa" element={<VenueQAPage />} />
              <Route path="/chat" element={<VenueChatPage />} />
              <Route path="/campaigns" element={<VenueCampaignsPage />} />
              <Route path="/vibes" element={<VenueVibesPage />} />
              <Route path="/discounts" element={<VenueDiscountsPage />} />
              <Route path="/ads" element={<VenueAdsPage />} />
              
              {/* Production */}
              <Route path="/production/create" element={<ProductionCreatePage />} />
              <Route path="/production/ai-assistant" element={<AIContentAssistantPage />} />
              <Route path="/production/schedule" element={<ScheduleCapacityPage />} />
              
              {/* Tickets */}
              <Route path="/tickets/pricing" element={<TicketsPricingPage />} />
              <Route path="/tickets/checkin" element={<QRCheckinPage />} />
              <Route path="/tickets/access" element={<AccessRulesPage />} />
              
              {/* Visibility */}
              <Route path="/visibility/boosts" element={<VisibilityBoostsPage />} />
              <Route path="/visibility/trending" element={<VisibilityTrendingPage />} />
              <Route path="/visibility/nearby" element={<VisibilityNearbyPage />} />
              <Route path="/visibility/influencer" element={<VisibilityInfluencerPage />} />
              
              {/* Monetization */}
              <Route path="/monetization/pricing" element={<MonetizationPricingPage />} />
              <Route path="/monetization/revenue" element={<MonetizationRevenuePage />} />
              <Route path="/monetization/payouts" element={<MonetizationPayoutsPage />} />
              <Route path="/monetization/analytics" element={<MonetizationAnalyticsPage />} />
              
              <Route path="/settings" element={<VenueSettingsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </VenueLayout>
        );
      case 'instructor':
        return (
          <InstructorLayout>
            <Routes>
              <Route path="/dashboard" element={<InstructorDashboardPage />} />
              <Route path="/content" element={<InstructorContentPage />} />
              <Route path="/streaming" element={<InstructorStreamingPage />} />
              <Route path="/classes" element={<InstructorClassesPage />} />
              <Route path="/classes/:id" element={<InstructorClassDetailPage />} />
              
              {/* Production */}
              <Route path="/production/create" element={<ProductionCreatePage />} />
              <Route path="/production/ai-assistant" element={<AIContentAssistantPage />} />
              <Route path="/production/schedule" element={<ScheduleCapacityPage />} />
              
              {/* Tickets */}
              <Route path="/tickets/pricing" element={<TicketsPricingPage />} />
              <Route path="/tickets/checkin" element={<QRCheckinPage />} />
              <Route path="/tickets/access" element={<AccessRulesPage />} />
              
              {/* Visibility */}
              <Route path="/visibility/boosts" element={<VisibilityBoostsPage />} />
              <Route path="/visibility/trending" element={<VisibilityTrendingPage />} />
              <Route path="/visibility/nearby" element={<VisibilityNearbyPage />} />
              <Route path="/visibility/influencer" element={<VisibilityInfluencerPage />} />
              
              {/* Monetization */}
              <Route path="/monetization/pricing" element={<MonetizationPricingPage />} />
              <Route path="/monetization/revenue" element={<MonetizationRevenuePage />} />
              <Route path="/monetization/payouts" element={<MonetizationPayoutsPage />} />
              <Route path="/monetization/analytics" element={<MonetizationAnalyticsPage />} />
              
              <Route path="/settings" element={<InstructorSettingsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </InstructorLayout>
        );
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              renderRoleBasedRoutes() || <Navigate to="/login" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
