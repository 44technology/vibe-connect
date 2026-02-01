import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import WelcomePage from "./pages/WelcomePage";
import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import CreateVibePage from "./pages/CreateVibePage";
import EventsPage from "./pages/EventsPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import ConnectionsPage from "./pages/ConnectionsPage";
import MyMeetupsPage from "./pages/MyMeetupsPage";
import BadgesPage from "./pages/BadgesPage";
import ClassesPage from "./pages/ClassesPage";
import ClassDetailPage from "./pages/ClassDetailPage";
import MyClassesPage from "./pages/MyClassesPage";
import SocialFeedPage from "./pages/SocialFeedPage";
import SettingsPage from "./pages/SettingsPage";
import MeetupDetailPage from "./pages/MeetupDetailPage";
import VenueDetailPage from "./pages/VenueDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import UserConnectionsPage from "./pages/UserConnectionsPage";
import UserVibesPage from "./pages/UserVibesPage";
import UserBadgesPage from "./pages/UserBadgesPage";
import LifePage from "./pages/LifePage";
import SurpriseMePage from "./pages/SurpriseMePage";
import VenuePostsPage from "./pages/VenuePostsPage";
import StoryViewPage from "./pages/StoryViewPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/create" element={<CreateVibePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/create-event" element={<CreateVibePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/my-meetups" element={<MyMeetupsPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/class/:id" element={<ClassDetailPage />} />
          <Route path="/my-classes" element={<MyClassesPage />} />
          <Route path="/social" element={<SocialFeedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
            <Route path="/meetup/:id" element={<MeetupDetailPage />} />
            <Route path="/venue/:id" element={<VenueDetailPage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/user/:userId/connections" element={<UserConnectionsPage />} />
            <Route path="/user/:userId/vibes" element={<UserVibesPage />} />
            <Route path="/user/:userId/badges" element={<UserBadgesPage />} />
            <Route path="/life" element={<LifePage />} />
            <Route path="/surprise" element={<SurpriseMePage />} />
            <Route path="/venue-posts" element={<VenuePostsPage />} />
            <Route path="/story/:id" element={<StoryViewPage />} />
            <Route path="/tickets" element={<MyTicketsPage />} />
            <Route path="/ticket/:ticketId" element={<TicketDetailPage />} />
            {/* Mentors are now part of Classes - redirect old routes */}
            <Route path="/mentors" element={<ClassesPage />} />
            <Route path="/mentor/:id" element={<ClassDetailPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
