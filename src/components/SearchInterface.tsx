import { useState } from "react";
import { Search, MapPin, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  radius: number;
}

interface SearchInterfaceProps {
  onSearch: (filters: SearchFilters) => void;
  onBack?: () => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "plastic", label: "Plastic" },
  { value: "paper", label: "Paper" },
  { value: "metal", label: "Metal" },
  { value: "glass", label: "Glass" },
  { value: "electronics", label: "Electronics" },
  { value: "textiles", label: "Textiles" },
  { value: "organic", label: "Organic" },
  { value: "other", label: "Other" },
];

const radiusOptions = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

const SearchInterface = ({ onSearch, onBack }: SearchInterfaceProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    location: "",
    radius: 10,
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Find Materials</h2>
        <p className="text-muted-foreground">
          Search for available materials in your area
        </p>
      </div>

      {/* Search Form */}
      <div className="space-y-4">
        {/* Search Query */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            What are you looking for?
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="e.g., plastic bottles, old electronics..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location & Radius */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              placeholder="Enter city..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Radius</label>
            <select
              value={filters.radius}
              onChange={(e) => setFilters({ ...filters, radius: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            >
              {radiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <Button
          variant="eco"
          onClick={handleSearch}
          className="w-full group"
          size="lg"
        >
          <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
          Search Available Materials
        </Button>

        {/* Back Button */}
        {onBack && (
          <Button variant="outline" onClick={onBack} className="w-full">
            Back
          </Button>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Leave the search empty to see all available materials nearby!
        </p>
      </div>
    </motion.div>
  );
};

export default SearchInterface;
