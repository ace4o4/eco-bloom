import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Scale,
  Check,
  Sparkles,
  Search,
  Sprout,
  HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CameraScanner from "@/components/CameraScanner";
import SearchInterface, { SearchFilters } from "@/components/SearchInterface";
import ListingsBrowse from "@/components/ListingsBrowse";
import ContactDialog from "@/components/ContactDialog";
import type { Listing as UIListing } from "@/components/ListingsBrowse";
import { z } from "zod";
import type { MaterialDetectionResult } from "@/services/aiMaterialDetection";
import {
  createListing,
  fetchListings,
  uploadListingImageFromBase64,
  type Listing as DBListing,
  type SearchFilters as DBSearchFilters,
} from "@/lib/supabase-listings";
import { getCurrentLocation, calculateDistance } from "@/lib/geolocation";

const listingSchema = z.object({
  type: z.enum(["offering", "seeking"]),
  imageData: z.string().min(1, "Please capture or upload an image"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  quantity: z.string().min(1, "Please enter quantity"),
  unit: z.string().min(1, "Please select a unit"),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(100),
  frequency: z.string().min(1, "Please select frequency"),
});

// Map form categories to database slugs
const getCategorySlug = (category: string): string => {
  const categoryMap: Record<string, string> = {
    organic: "organic",
    textiles: "textiles",
    plastic: "plastics",
    plastics: "plastics",
    metal: "metals",
    metals: "metals",
    paper: "paper",
    electronics: "plastics", // fallback
    glass: "plastics", // fallback
    other: "organic", // fallback to first category
  };
  return categoryMap[category?.toLowerCase()] || "organic";
};

interface MarketPriceData {
  min: number;
  max: number;
  avg: number;
  unit: string;
  recommended_min: number;
}

const PlantMatch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [marketPrice, setMarketPrice] = useState<MarketPriceData | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    imageData: "",
    title: "",
    description: "",
    category: "",
    quantity: "",
    price: "",
    unit: "units",
    location: "",
    frequency: "one-time",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seeking flow state
  const [listings, setListings] = useState<UIListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [selectedListing, setSelectedListing] = useState<UIListing | null>(
    null,
  );
  const [showContactDialog, setShowContactDialog] = useState(false);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !formData.type) {
      newErrors.type =
        "Please select whether you're offering or seeking materials";
    }
    if (step === 2 && !formData.imageData) {
      newErrors.imageData =
        "Please capture or upload an image of your material";
    }
    if (step === 3) {
      if (formData.title.length < 3)
        newErrors.title = "Title must be at least 3 characters";
      if (formData.description.length < 10)
        newErrors.description = "Description must be at least 10 characters";
      if (!formData.quantity) newErrors.quantity = "Please enter quantity";
    }
    if (step === 4) {
      if (formData.location.length < 3)
        newErrors.location = "Please enter a valid location";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      // Upload image to Supabase Storage
      let imageUrl = "";
      if (formData.imageData) {
        console.log("📤 Uploading image...");
        imageUrl = await uploadListingImageFromBase64(formData.imageData);
        console.log("✅ Image uploaded:", imageUrl);
      }

      // Get location
      let locationData = {};
      try {
        const location = await getCurrentLocation();
        locationData = {
          location_lat: location.coords.lat,
          location_lng: location.coords.lng,
          location_address: location.address,
        };
        console.log("📍 Location:", location.address);
      } catch (error) {
        console.log("⚠️ Location not available:", error);
        // Fallback to manual location
        locationData = {
          location_address: formData.location,
        };
      }

      // Create listing
      const listingData: DBListing = {
        type: formData.type as "offering",
        title: formData.title,
        description: formData.description,
        category: getCategorySlug(formData.category), // Map to slug
        quantity: formData.quantity,
        price: formData.price ? parseFloat(formData.price) : null,
        unit: formData.unit,
        frequency: formData.frequency,
        image_url: imageUrl,
        ...locationData,
      };

      console.log("💾 Creating listing...");
      await createListing(listingData);
      console.log("✅ Listing created successfully!");

      setIsSubmitting(false);
      setStep(5);
    } catch (error) {
      console.error("❌ Error creating listing:", error);
      setIsSubmitting(false);
      alert(
        error instanceof Error
          ? `Failed to create listing: ${error.message}`
          : "Failed to create listing. Please try again.",
      );
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoadingListings(true);

    try {
      console.log("🔍 Searching listings with filters:", filters);

      // Prepare API filters
      const apiFilters: DBSearchFilters = {
        query: filters.query,
        category: filters.category,
        radius: filters.radius,
      };

      // Get user location if logic requires (e.g. if location string is present or just use current)
      // Original logic seemed to rely on current location for radius search
      if (filters.location && filters.radius) {
        try {
          const location = await getCurrentLocation();
          apiFilters.location = location.coords;
        } catch (error) {
          console.log(
            "⚠️ Location not available, searching without distance filter",
          );
          apiFilters.location = undefined;
          apiFilters.radius = undefined;
        }
      }

      // Fetch real listings from Supabase
      const data = await fetchListings(apiFilters);

      const userLocation = apiFilters.location;

      // Calculate distances if we have user location
      const listingsWithDistance: UIListing[] = data.map((listing) => {
        let distance;
        if (userLocation && listing.location_lat && listing.location_lng) {
          distance = calculateDistance(userLocation, {
            lat: listing.location_lat,
            lng: listing.location_lng,
          });
        }

        return {
          id: listing.id!,
          type: listing.type || "offering", // Include type
          title: listing.title,
          description: listing.description || "",
          category: listing.category,
          quantity: listing.quantity || "0",
          unit: listing.unit || "units",

          price: listing.price, // Include price
          imageData: listing.image_url || "",
          user_id: listing.user_id, // Pass user_id for chat
          location: {
            address: listing.location_address || "Location not specified",
            distance,
          },
          user: {
            name: listing.contact_name,
            email: listing.contact_email,
            phone: listing.contact_phone,
          },
          createdAt: listing.created_at || new Date().toISOString(),
        };
      });

      console.log(`✅ Found ${listingsWithDistance.length} listings`);
      setListings(listingsWithDistance);
      setIsLoadingListings(false);
      setStep(3); // Move to browse listings
    } catch (error) {
      console.error("❌ Error fetching listings:", error);
      setIsLoadingListings(false);
      alert(
        error instanceof Error
          ? `Failed to fetch listings: ${error.message}`
          : "Failed to fetch listings. Please try again.",
      );
    }
  };

  const handleContact = (listing: UIListing) => {
    setSelectedListing(listing);
    setShowContactDialog(true);
  };

  const handleCloseContactDialog = () => {
    setShowContactDialog(false);
    setSelectedListing(null);
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
              {(formData.type === "offering"
                ? ["Type", "Scan", "Details", "Location", "Done"]
                : formData.type === "seeking"
                  ? ["Type", "Search", "Browse", "Contact", ""]
                  : ["Type", "Next", "Details", "Location", "Done"]
              ).map((label, index) => {
                if (!label) return <div key={index} className="w-12" />; // Empty space
                return (
                  <div
                    key={label}
                    className={`text-xs font-medium ${
                      index + 1 <= step
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
            <div className="h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-secondary to-electric shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
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
                    {
                      value: "offering",
                      label: "I'm Offering",
                      IconComponent: Sprout,
                      desc: "I have materials to share",
                    },
                    {
                      value: "seeking",
                      label: "I'm Seeking",
                      IconComponent: Search,
                      desc: "I need materials",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          type: option.value as "offering" | "seeking",
                        });
                        setStep(2);
                      }}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                        formData.type === option.value
                          ? "border-primary bg-primary/10 shadow-neon"
                          : "border-border bg-card/50 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <option.IconComponent
                            className="w-10 h-10 text-white"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-semibold mb-2">
                            {option.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {option.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-destructive text-sm text-center">
                    {errors.type}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Camera Scanner (OFFERING ONLY) */}
            {step === 2 && formData.type === "offering" && (
              <CameraScanner
                onCapture={(imageData, aiResult) => {
                  // Set image data
                  setFormData({ ...formData, imageData });
                  setErrors({ ...errors, imageData: "" });

                  // Auto-fill from AI if available
                  if (aiResult) {
                    console.log(
                      "🤖 Auto-filling form with Florence-2 results:",
                      aiResult,
                    );
                    setFormData((prev) => ({
                      ...prev,
                      imageData,
                      title:
                        aiResult.primary_detection?.title || aiResult.title,
                      description:
                        aiResult.primary_detection?.description ||
                        aiResult.description,
                    }));

                    if (aiResult.primary_detection?.market_price) {
                      setMarketPrice(aiResult.primary_detection.market_price);
                    }
                  }
                }}
                onCancel={() => setStep(1)}
              />
            )}

            {/* Step 2: Search Interface (SEEKING ONLY) */}
            {step === 2 && formData.type === "seeking" && (
              <SearchInterface
                onSearch={handleSearch}
                onBack={() => setStep(1)}
                isLoading={isLoadingListings}
              />
            )}

            {/* Step 3: Browse Listings (SEEKING ONLY) */}
            {step === 3 && formData.type === "seeking" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Search
                  </Button>
                </div>
                <ListingsBrowse
                  listings={listings}
                  onContact={handleContact}
                  isLoading={isLoadingListings}
                />
              </div>
            )}

            {/* Step 3: Details (OFFERING ONLY) */}
            {step === 3 && formData.type === "offering" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-center mb-6">
                  Tell us about your{" "}
                  {formData.type === "offering" ? "materials" : "needs"}
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Fresh coffee grounds, Plastic bottles, Cardboard boxes"
                    className="eco-input w-full"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the quality, source, and any special handling requirements..."
                    className="eco-input w-full h-28 resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-destructive text-sm">
                        {errors.description}
                      </p>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formData.description.length}/500
                    </span>
                  </div>
                </div>
                {/* Material Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="e.g., 100"
                      className="eco-input w-full"
                    />
                    {errors.quantity && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="eco-select w-full"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="tons">Tons</option>
                      <option value="liters">Liters</option>
                      <option value="units">Units/Pieces</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    className="eco-select w-full"
                  >
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      className="eco-input w-full pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty if offering for free
                  </p>

                  {marketPrice && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-xl"
                    >
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-secondary mb-2">
                        <Leaf className="w-4 h-4" />
                        Market Price Estimate
                      </h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Market Rate:</span>
                          <span className="font-medium text-foreground">
                            ₹{marketPrice.min} - ₹{marketPrice.max} /{" "}
                            {marketPrice.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommended Bargain (60%):</span>
                          <span className="font-medium text-primary">
                            Min ₹{marketPrice.recommended_min.toFixed(2)} /{" "}
                            {marketPrice.unit}
                          </span>
                        </div>
                        <p className="text-xs italic mt-2 opacity-80">
                          *Fair pricing helps ensure quick pickups. We recommend
                          listing at approx. 60% of market value.
                        </p>
                      </div>
                    </motion.div>
                  )}
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
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="City, neighborhood, or full address"
                      className="eco-input w-full pr-10"
                      maxLength={100}
                    />
                    <button
                      onClick={async () => {
                        try {
                          const location = await getCurrentLocation();
                          if (location.address) {
                            setFormData({
                              ...formData,
                              location: location.address,
                            });
                          }
                        } catch (error) {
                          console.error("Failed to get location", error);
                          alert(
                            "Could not detect location. Please enter manually.",
                          );
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted text-primary transition-colors"
                      title="Use my current location"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.location && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="inline-flex items-center gap-1">
                      We prioritize local matches to minimize carbon footprint{" "}
                      <Leaf className="w-3.5 h-3.5 inline" />
                    </span>
                  </p>
                </div>

                {/* Summary Preview */}
                <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    Listing Preview
                  </h3>
                  <div className="space-y-3">
                    {formData.imageData && (
                      <img
                        src={formData.imageData}
                        alt="Material preview"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          formData.type === "offering"
                            ? "bg-primary/20 text-primary"
                            : "bg-info/20 text-info"
                        }`}
                      >
                        {formData.type === "offering" ? "Offering" : "Seeking"}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground">
                      {formData.title || "Untitled"}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.description}
                    </p>
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
                    {formData.price && (
                      <div className="mt-2 text-sm font-semibold text-primary">
                        ${parseFloat(formData.price).toFixed(2)}
                      </div>
                    )}
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
                  <span className="text-gradient-eco inline-flex items-center gap-2">
                    Match Planted! <Sprout className="w-5 h-5" />
                  </span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Your listing is now live. We'll notify you when we find a
                  match.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="eco" onClick={() => navigate("/scorecard")}>
                    View Your Impact
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setFormData({
                        type: "",
                        imageData: "",
                        title: "",
                        description: "",
                        category: "",
                        quantity: "",
                        price: "",
                        unit: "units",
                        location: "",
                        frequency: "one-time",
                      });
                    }}
                  >
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

                {step < 4 && step !== 1 && formData.type !== "seeking" ? (
                  <Button variant="eco" onClick={nextStep}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : step === 4 ? (
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
                ) : null}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Contact Dialog */}
      <ContactDialog
        listing={selectedListing}
        isOpen={showContactDialog}
        onClose={handleCloseContactDialog}
      />
    </div>
  );
};

export default PlantMatch;
