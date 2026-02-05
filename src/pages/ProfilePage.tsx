import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Settings, ChevronRight, Camera, Award, Users, Calendar } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";

const ProfilePage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Connections", value: 128, path: "/connections", icon: Users },
    { label: "Meetups", value: 42, path: "/my-meetups", icon: Calendar },
    { label: "Badges", value: 15, path: "/badges", icon: Award },
  ];

  return (
    <MobileLayout>
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <button className="p-2 bg-muted rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 border border-border mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-4xl">
                👤
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold">Alex Johnson</h2>
              <p className="text-muted-foreground">@alexj • New York, NY</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <motion.button
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(stat.path)}
                className="bg-muted rounded-2xl p-4 text-center"
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-muted-foreground text-sm">
            Coffee enthusiast ☕ | Yoga lover 🧘 | Always up for an adventure! Looking to meet like-minded people in NYC.
          </p>
        </div>

        {/* Interests */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-6">
          <h3 className="font-semibold mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {["Coffee", "Yoga", "Hiking", "Photography", "Tech", "Music"].map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {[
            { label: "My Posts", icon: "📸" },
            { label: "Saved Vibes", icon: "💾" },
            { label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full bg-card rounded-2xl p-4 border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default ProfilePage;
