import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, GraduationCap } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";

const tabs = ["Vibes", "Venues", "Classes"];

const mockVibes = [
  { id: 1, title: "Brunch Club", venue: "Café Cluny", time: "Sun 11AM", attendees: 6, emoji: "🥐" },
  { id: 2, title: "Hiking Group", venue: "Bear Mountain", time: "Sat 8AM", attendees: 12, emoji: "🥾" },
  { id: 3, title: "Book Club", venue: "Strand Bookstore", time: "Thu 7PM", attendees: 8, emoji: "📚" },
];

const mockVenues = [
  { id: 1, name: "Blue Bottle Coffee", type: "Café", rating: 4.8, distance: "0.3 mi", emoji: "☕" },
  { id: 2, name: "Central Park", type: "Park", rating: 4.9, distance: "0.5 mi", emoji: "🌳" },
  { id: 3, name: "WeWork SoHo", type: "Coworking", rating: 4.5, distance: "0.8 mi", emoji: "💼" },
];

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Vibes");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MobileLayout>
      <div className="p-4 pb-24">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vibes, venues, classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Classes") {
                  navigate("/classes");
                }
              }}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab === "Classes" && <GraduationCap className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "Vibes" && (
          <div className="space-y-4">
            {mockVibes.map((vibe) => (
              <motion.div
                key={vibe.id}
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-2xl">
                    {vibe.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{vibe.title}</h3>
                    <p className="text-sm text-muted-foreground">{vibe.venue}</p>
                    <p className="text-sm text-primary">{vibe.time} • {vibe.attendees} going</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Venues" && (
          <div className="space-y-4">
            {mockVenues.map((venue) => (
              <motion.div
                key={venue.id}
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-2xl">
                    {venue.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{venue.name}</h3>
                    <p className="text-sm text-muted-foreground">{venue.type}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-secondary fill-secondary" />
                        {venue.rating}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {venue.distance}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default DiscoverPage;
