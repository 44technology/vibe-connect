import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import CreateVibePage from "./pages/CreateVibePage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import ConnectionsPage from "./pages/ConnectionsPage";
import MyMeetupsPage from "./pages/MyMeetupsPage";
import BadgesPage from "./pages/BadgesPage";
import ClassesPage from "./pages/ClassesPage";
import SocialFeedPage from "./pages/SocialFeedPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/create" element={<CreateVibePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/my-meetups" element={<MyMeetupsPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/social" element={<SocialFeedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
