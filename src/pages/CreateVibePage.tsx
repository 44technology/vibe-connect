import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Lock,
  Globe,
  ChevronLeft,
  Search,
} from "lucide-react";

const categories = [
  { id: "coffee", label: "Coffee", emoji: "☕" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "games", label: "Games", emoji: "🎮" },
];

const CreateVibePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    time: "",
    visibility: "public",
    pricing: "free",
    price: "",
    maxAttendees: 10,
  });

  const handleSubmit = () => {
    console.log("Creating vibe:", formData);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Create Vibe</h1>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Vibe Title</label>
          <input
            type="text"
            placeholder="What's the vibe?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-4 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="Tell people what to expect..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full p-4 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  formData.category === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border"
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-xs">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for a venue..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium mb-2">Visibility</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({ ...formData, visibility: "public" })}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                formData.visibility === "public"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border"
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Public</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, visibility: "private" })}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                formData.visibility === "private"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border"
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Private</span>
            </button>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium mb-2">Pricing</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({ ...formData, pricing: "free", price: "" })}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                formData.pricing === "free"
                  ? "bg-friendme text-friendme-foreground border-friendme"
                  : "bg-card border-border"
              }`}
            >
              <span className="text-xl">🆓</span>
              <span>Free</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, pricing: "paid" })}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                formData.pricing === "paid"
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-card border-border"
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Paid</span>
            </button>
          </div>

          {formData.pricing === "paid" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  placeholder="Price per person"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Max Attendees */}
        <div>
          <label className="block text-sm font-medium mb-2">Max Attendees</label>
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <input
              type="range"
              min="2"
              max="50"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="font-medium w-12 text-right">{formData.maxAttendees}</span>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold text-lg shadow-lg"
        >
          Create Vibe ✨
        </motion.button>
      </div>
    </div>
  );
};

export default CreateVibePage;
