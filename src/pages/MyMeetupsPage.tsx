import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Clock, Users } from "lucide-react";

const mockMeetups = {
  upcoming: [
    { id: 1, title: "Coffee Tasting", venue: "Blue Bottle", date: "Feb 8", time: "3:00 PM", attendees: 8, emoji: "☕" },
    { id: 2, title: "Yoga in the Park", venue: "Central Park", date: "Feb 10", time: "7:00 AM", attendees: 15, emoji: "🧘" },
  ],
  past: [
    { id: 3, title: "Tech Networking", venue: "WeWork", date: "Feb 1", time: "6:00 PM", attendees: 25, emoji: "💼" },
    { id: 4, title: "Book Club", venue: "Strand", date: "Jan 28", time: "5:00 PM", attendees: 10, emoji: "📚" },
  ],
};

const MyMeetupsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">My Vibes</h1>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <div className="flex gap-2 mb-6">
          {(["upcoming", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Meetups List */}
        <div className="space-y-4">
          {mockMeetups[activeTab].map((meetup) => (
            <motion.div
              key={meetup.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-2xl">
                  {meetup.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{meetup.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {meetup.venue}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meetup.date}, {meetup.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {meetup.attendees}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyMeetupsPage;
