import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Star, MapPin, Clock, DollarSign } from "lucide-react";

const classCategories = ["All", "Sports", "Wellness", "Arts", "Adventure", "Music"];

const mockClasses = [
  {
    id: 1,
    title: "Tennis for Beginners",
    instructor: "Coach Mike",
    venue: "Central Park Courts",
    price: 45,
    rating: 4.9,
    students: 120,
    nextClass: "Tomorrow 9AM",
    emoji: "🎾",
    category: "Sports",
  },
  {
    id: 2,
    title: "Yoga Flow",
    instructor: "Sarah Chen",
    venue: "Zen Studio",
    price: 25,
    rating: 4.8,
    students: 450,
    nextClass: "Today 6PM",
    emoji: "🧘",
    category: "Wellness",
  },
  {
    id: 3,
    title: "Skydiving Intro",
    instructor: "Jake Williams",
    venue: "Sky Adventures",
    price: 199,
    rating: 5.0,
    students: 85,
    nextClass: "Saturday 10AM",
    emoji: "🪂",
    category: "Adventure",
  },
  {
    id: 4,
    title: "Photography Basics",
    instructor: "Emma Rose",
    venue: "Art Center NYC",
    price: 55,
    rating: 4.7,
    students: 200,
    nextClass: "Friday 2PM",
    emoji: "📷",
    category: "Arts",
  },
  {
    id: 5,
    title: "Guitar Lessons",
    instructor: "David Lee",
    venue: "Music House",
    price: 40,
    rating: 4.9,
    students: 180,
    nextClass: "Wed 5PM",
    emoji: "🎸",
    category: "Music",
  },
];

const ClassesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredClasses = mockClasses.filter((c) =>
    selectedCategory === "All" ? true : c.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border p-4 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Classes</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 pb-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {classCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Classes List */}
      <div className="p-4 space-y-4">
        {filteredClasses.map((classItem) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-3xl">
                {classItem.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{classItem.title}</h3>
                    <p className="text-sm text-muted-foreground">{classItem.instructor}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    {classItem.rating}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {classItem.venue}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-3 h-3" />
                    {classItem.nextClass}
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <DollarSign className="w-4 h-4" />
                    {classItem.price}
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-xl font-medium">
              Book Now
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClassesPage;
