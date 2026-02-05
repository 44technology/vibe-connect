import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Heart,
  Briefcase,
  Coffee,
  Music,
  Dumbbell,
  Dice5,
  MapPin,
  Clock,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import SurpriseMeModal from "@/components/SurpriseMeModal";

const categories = [
  { id: "friendme", label: "FriendMe", icon: Users, color: "bg-friendme" },
  { id: "loveme", label: "LoveMe", icon: Heart, color: "bg-loveme" },
  { id: "connectme", label: "ConnectMe", icon: Briefcase, color: "bg-connectme" },
];

const subcategories = [
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "music", label: "Music", icon: Music },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
];

const mockMeetups = [
  {
    id: 1,
    title: "Coffee Lovers Meetup",
    venue: "Blue Bottle Coffee",
    time: "Today, 3:00 PM",
    attendees: 8,
    maxAttendees: 12,
    image: "☕",
  },
  {
    id: 2,
    title: "Sunset Yoga Session",
    venue: "Central Park",
    time: "Tomorrow, 6:00 PM",
    attendees: 15,
    maxAttendees: 20,
    image: "🧘",
  },
  {
    id: 3,
    title: "Tech Networking Night",
    venue: "WeWork SoHo",
    time: "Friday, 7:00 PM",
    attendees: 25,
    maxAttendees: 50,
    image: "💼",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("friendme");

  return (
    <MobileLayout>
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hey, Alex! 👋</h1>
            <p className="text-muted-foreground">Ready to vibe today?</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSurpriseModal(true)}
            className="bg-secondary text-secondary-foreground p-3 rounded-2xl shadow-lg"
          >
            <Dice5 className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? `${cat.color} text-white shadow-lg`
                  : "bg-card border border-border"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Subcategories */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
            >
              <sub.icon className="w-3 h-3" />
              {sub.label}
            </button>
          ))}
        </div>

        {/* Social Feed Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/social")}
          className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-2xl mb-6 flex items-center justify-between"
        >
          <span className="font-semibold">📸 See What's Happening</span>
          <span className="text-sm opacity-80">Stories & Posts</span>
        </motion.button>

        {/* Meetups */}
        <h2 className="text-lg font-semibold mb-4">Vibes Near You</h2>
        <div className="space-y-4">
          {mockMeetups.map((meetup) => (
            <motion.div
              key={meetup.id}
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-3xl">
                  {meetup.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{meetup.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {meetup.venue}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {meetup.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">
                    {meetup.attendees}/{meetup.maxAttendees}
                  </div>
                  <div className="text-xs text-muted-foreground">spots</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SurpriseMeModal
        isOpen={showSurpriseModal}
        onClose={() => setShowSurpriseModal(false)}
      />
    </MobileLayout>
  );
};

export default HomePage;
