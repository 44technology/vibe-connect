import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircle, UserMinus } from "lucide-react";

const mockConnections = [
  { id: 1, name: "Sarah Miller", mutualFriends: 12, avatar: "👩", status: "online" },
  { id: 2, name: "Mike Chen", mutualFriends: 8, avatar: "👨", status: "offline" },
  { id: 3, name: "Emma Wilson", mutualFriends: 15, avatar: "👩‍🦰", status: "online" },
  { id: 4, name: "James Brown", mutualFriends: 5, avatar: "👨‍🦱", status: "offline" },
  { id: 5, name: "Lisa Park", mutualFriends: 20, avatar: "👩‍🦳", status: "online" },
];

const ConnectionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">My Connections</h1>
        <span className="ml-auto text-muted-foreground">128 total</span>
      </div>

      <div className="p-4 space-y-3">
        {mockConnections.map((connection) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4"
          >
            <div className="relative">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-2xl">
                {connection.avatar}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                  connection.status === "online" ? "bg-friendme" : "bg-muted-foreground"
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{connection.name}</h3>
              <p className="text-sm text-muted-foreground">
                {connection.mutualFriends} mutual connections
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-primary text-primary-foreground rounded-full">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 bg-muted text-muted-foreground rounded-full">
                <UserMinus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionsPage;
