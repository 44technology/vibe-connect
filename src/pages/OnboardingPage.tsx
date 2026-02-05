import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Heart, Users, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  { id: 1, title: "What's your name?", icon: User, type: "text" },
  { id: 2, title: "When's your birthday?", icon: Calendar, type: "date" },
  { id: 3, title: "I am a...", icon: User, type: "gender" },
  { id: 4, title: "I'm looking for...", icon: Heart, type: "looking" },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    gender: "",
    lookingFor: [] as string[],
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/home");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-4 bg-card rounded-2xl border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            className="w-full p-4 bg-card rounded-2xl border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
      case "gender":
        return (
          <div className="grid grid-cols-2 gap-4">
            {["Male", "Female", "Non-binary", "Prefer not to say"].map((option) => (
              <button
                key={option}
                onClick={() => setFormData({ ...formData, gender: option })}
                className={`p-4 rounded-2xl border transition-all ${
                  formData.gender === option
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case "looking":
        return (
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: "friends", label: "Friends", icon: Users, color: "friendme" },
              { id: "love", label: "Love", icon: Heart, color: "loveme" },
              { id: "networking", label: "Networking", icon: Users, color: "connectme" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  const current = formData.lookingFor;
                  const updated = current.includes(option.id)
                    ? current.filter((i) => i !== option.id)
                    : [...current, option.id];
                  setFormData({ ...formData, lookingFor: updated });
                }}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                  formData.lookingFor.includes(option.id)
                    ? `bg-${option.color} text-${option.color}-foreground border-${option.color}`
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <option.icon className="w-6 h-6" />
                {option.label}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className={`p-2 rounded-full ${currentStep === 0 ? "opacity-0" : "bg-muted"}`}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex-1 flex flex-col"
        >
          <h1 className="text-2xl font-bold mb-8">{steps[currentStep].title}</h1>
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold text-lg mt-8 flex items-center justify-center gap-2"
      >
        {currentStep === steps.length - 1 ? "Start Vibing!" : "Continue"}
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default OnboardingPage;
