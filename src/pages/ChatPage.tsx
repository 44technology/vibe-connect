import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Send } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";

const mockChats = [
  {
    id: 1,
    name: "Coffee Lovers ☕",
    lastMessage: "See you all at 3pm!",
    time: "2m",
    unread: 3,
    isGroup: true,
    avatar: "☕",
  },
  {
    id: 2,
    name: "Sarah M.",
    lastMessage: "That sounds great!",
    time: "1h",
    unread: 0,
    isGroup: false,
    avatar: "👩",
  },
  {
    id: 3,
    name: "Hiking Squad 🥾",
    lastMessage: "Don't forget water bottles",
    time: "3h",
    unread: 12,
    isGroup: true,
    avatar: "🥾",
  },
];

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  if (selectedChat) {
    const chat = mockChats.find((c) => c.id === selectedChat);
    return (
      <MobileLayout hideNav>
        <div className="flex flex-col h-screen">
          {/* Chat Header */}
          <div className="bg-card border-b border-border p-4 flex items-center gap-4">
            <button onClick={() => setSelectedChat(null)} className="text-2xl">
              ←
            </button>
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xl">
              {chat?.avatar}
            </div>
            <div>
              <h2 className="font-semibold">{chat?.name}</h2>
              <p className="text-xs text-muted-foreground">
                {chat?.isGroup ? "8 members" : "Active now"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm p-3 max-w-[80%]">
                <p className="text-sm">Hey everyone! Excited for today's meetup 🎉</p>
                <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm p-3 max-w-[80%]">
                <p className="text-sm">Can't wait! See you there!</p>
                <p className="text-xs opacity-70 mt-1">10:32 AM</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-3 bg-muted rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="p-3 bg-primary text-primary-foreground rounded-2xl">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 pb-24">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-12 pr-4 py-3 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          {mockChats.map((chat) => (
            <motion.button
              key={chat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedChat(chat.id)}
              className="w-full bg-card rounded-2xl p-4 border border-border flex items-center gap-4 text-left"
            >
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-2xl">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {chat.unread}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default ChatPage;
