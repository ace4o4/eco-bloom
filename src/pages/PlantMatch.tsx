import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf, ArrowRight, ArrowLeft, MapPin, Calendar,
  Scale, Check, Sparkles, Search, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CameraScanner from "@/components/CameraScanner";
import { z } from "zod";
import type { MaterialDetectionResult } from "@/services/aiMaterialDetection";

const listingSchema = z.object({
  type: z.enum(["offering", "seeking"]),
  imageData: z.string().min(1, "Please capture or upload an image"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  quantity: z.string().min(1, "Please enter quantity"),
  unit: z.string().min(1, "Please select a unit"),
  location: z.string().min(3, "Location must be at least 3 characters").max(100),
  frequency: z.string().min(1, "Please select frequency"),
});

const PlantMatch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "" as "offering" | "seeking" | "",
    imageData: "",
    title: "",
    description: "",
    quantity: "",
    unit: "kg",
    location: "",
    frequency: "one-time",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !formData.type) {
      newErrors.type = "Please select whether you're offering or seeking materials";
    }
    if (step === 2 && !formData.imageData) {
      newErrors.imageData = "Please capture or upload an image of your material";
    }
    if (step === 3) {
      if (formData.title.length < 3) newErrors.title = "Title must be at least 3 characters";
      if (formData.description.length < 10) newErrors.description = "Description must be at least 10 characters";
      if (!formData.quantity) newErrors.quantity = "Please enter quantity";
    }
    if (step === 4) {
      if (formData.location.length < 3) newErrors.location = "Please enter a valid location";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(s => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(5);
  };



  return (
    <div className="min-h-screen bg-background bg-vibrant-pattern">
      <Navbar />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 eco-badge mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Listing</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="text-gradient-eco">Plant a Match</span>
            </h1>
            <p className="text-muted-foreground">
              List your available resources or find what you need
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between mb-2">
              {["Type", "Scan", "Details", "Location", "Done"].map((label, index) => (
                <div
                  key={label}
                  className={`text-xs font-medium ${index + 1 <= step ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-secondary to-electric"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            {/* Step 1: Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-center mb-6">
                  Are you offering or seeking materials?
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "offering", label: "I'm Offering", IconComponent: Sprout, desc: "I have materials to share" },
                    { value: "seeking", label: "I'm Seeking", IconComponent: Search, desc: "I need materials" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, type: option.value as "offering" | "seeking" })}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${formData.type === option.value
                        ? "border-primary bg-primary/10 shadow-neon"
                        : "border-border bg-card/50 hover:border-primary/50"
                        }`}
                    >
                      <div className="text-4xl mb-3">{option.icon}</div>
                      <div className="font-semibold text-foreground">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.type && <p className="text-destructive text-sm text-center">{errors.type}</p>}
              </div>
            )}

            {/* Step 2: Camera Scanner */}
            {step === 2 && (
              <CameraScanner
                onCapture={(imageData, aiResult) => {
                  // Set image data
                  setFormData({ ...formData, imageData });
                  setErrors({ ...errors, imageData: "" });

                  // Auto-fill from AI if available
                  if (aiResult) {
                    console.log("🤖 Auto-filling form with YOLOv5 results:", aiResult);
                    setFormData(prev => ({
                      ...prev,
                      imageData,
                      title: aiResult.title,
                      description: aiResult.description,
                      quantity: aiResult.estimatedWeight?.replace(/[^\d.]/g, '') || "", // Extract number
                      unit: aiResult.estimatedWeight?.includes('kg') ? 'kg' :
                        aiResult.estimatedWeight?.includes('g') ? 'grams' : 'pieces',
                    }));
                  }
                }}
                onCancel={() => setStep(1)}
              />
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-center mb-6">
                  Tell us about your {formData.type === "offering" ? "materials" : "needs"}
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Fresh coffee grounds, Plastic bottles, Cardboard boxes"
                    className="eco-input w-full"
                    maxLength={100}
                  />
                  {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the quality, source, and any special handling requirements..."
                    className="eco-input w-full h-28 resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                    <span className="text-xs text-muted-foreground ml-auto">{formData.description.length}/500</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0"
                        className="eco-input flex-1"
                        min="0"
                      />
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="eco-select w-24"
                      >
                        <option value="kg">kg</option>
                        <option value="tons">tons</option>
                        <option value="liters">liters</option>
                        <option value="units">units</option>
                      </select>
                    </div>
                    {errors.quantity && <p className="text-destructive text-sm mt-1">{errors.quantity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="eco-select w-full"
                    >
                      <option value="one-time">One-time</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-center mb-6">
                  Where are you located?
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location / Address
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, neighborhood, or full address"
                    className="eco-input w-full"
                    maxLength={100}
                  />
                  {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="inline-flex items-center gap-1">We prioritize local matches to minimize carbon footprint <Leaf className="w-3.5 h-3.5 inline" /></span>
                  </p>
                </div>

                {/* Summary Preview */}
                <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">Listing Preview</h3>
                  <div className="space-y-3">
                    {formData.imageData && (
                      <img
                        src={formData.imageData}
                        alt="Material preview"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.type === "offering"
                        ? "bg-primary/20 text-primary"
                        : "bg-info/20 text-info"
                        }`}>
                        {formData.type === "offering" ? "Offering" : "Seeking"}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground">{formData.title || "Untitled"}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{formData.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Scale className="w-4 h-4" />
                        {formData.quantity} {formData.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formData.frequency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-neon-lg"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">
                  <span className="text-gradient-eco inline-flex items-center gap-2">Match Planted! <Sprout className="w-5 h-5" /></span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Your listing is now live. We'll notify you when we find a match.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="eco" onClick={() => navigate("/scorecard")}>
                    View Your Impact
                  </Button>
                  <Button variant="outline" onClick={() => { setStep(1); setFormData({ type: "", imageData: "", title: "", description: "", quantity: "", unit: "kg", location: "", frequency: "one-time" }); }}>
                    Plant Another Match
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 5 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {step > 1 ? (
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                )}

                {step < 4 ? (
                  <Button variant="eco" onClick={nextStep}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Leaf className="w-4 h-4 animate-spin" />
                        Planting...
                      </>
                    ) : (
                      <>
                        <Leaf className="w-4 h-4" />
                        Plant Match
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PlantMatch;
