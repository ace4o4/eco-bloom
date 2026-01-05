import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Filter, Search, Leaf, Recycle, Shirt, Package, Droplets, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Business {
  id: string;
  name: string;
  type: string;
  category: string;
  materials: string[];
  matchAvailability: 'high' | 'medium' | 'low';
  coordinates: [number, number];
  address: string;
  impactScore: number;
}

const mockBusinesses: Business[] = [
  { id: '1', name: 'Green Cafe', type: 'Restaurant', category: 'organic', materials: ['Coffee Grounds', 'Food Scraps'], matchAvailability: 'high', coordinates: [-73.985, 40.748], address: '123 Green St, NYC', impactScore: 94 },
  { id: '2', name: 'EcoTextiles Co', type: 'Manufacturer', category: 'textiles', materials: ['Fabric Scraps', 'Thread Waste'], matchAvailability: 'medium', coordinates: [-73.975, 40.752], address: '456 Eco Ave, NYC', impactScore: 87 },
  { id: '3', name: 'PlastiRecycle Hub', type: 'Recycling Center', category: 'plastics', materials: ['PET Bottles', 'HDPE Containers'], matchAvailability: 'high', coordinates: [-73.990, 40.745], address: '789 Recycle Rd, NYC', impactScore: 92 },
  { id: '4', name: 'Urban Compost', type: 'Composting Facility', category: 'organic', materials: ['Yard Waste', 'Food Waste'], matchAvailability: 'low', coordinates: [-73.980, 40.755], address: '321 Compost Ln, NYC', impactScore: 89 },
  { id: '5', name: 'MetalWorks Recycling', type: 'Metal Recycler', category: 'metals', materials: ['Aluminum', 'Steel Scrap'], matchAvailability: 'high', coordinates: [-73.995, 40.750], address: '654 Metal Dr, NYC', impactScore: 91 },
  { id: '6', name: 'Paper & Print Solutions', type: 'Paper Recycler', category: 'paper', materials: ['Cardboard', 'Office Paper'], matchAvailability: 'medium', coordinates: [-73.972, 40.758], address: '987 Paper Way, NYC', impactScore: 85 },
  { id: '7', name: 'BioFuel Station', type: 'Energy', category: 'organic', materials: ['Used Cooking Oil', 'Grease'], matchAvailability: 'high', coordinates: [-73.988, 40.742], address: '147 Fuel St, NYC', impactScore: 96 },
  { id: '8', name: 'Fashion Forward', type: 'Clothing Store', category: 'textiles', materials: ['Used Clothing', 'Textile Waste'], matchAvailability: 'medium', coordinates: [-73.978, 40.760], address: '258 Fashion Blvd, NYC', impactScore: 82 },
];

const categories = [
  { id: 'all', name: 'All', icon: Recycle, color: 'from-eco-cyan to-eco-blue' },
  { id: 'organic', name: 'Organic', icon: Leaf, color: 'from-eco-green to-eco-lime' },
  { id: 'textiles', name: 'Textiles', icon: Shirt, color: 'from-eco-purple to-eco-pink' },
  { id: 'plastics', name: 'Plastics', icon: Package, color: 'from-eco-orange to-eco-yellow' },
  { id: 'metals', name: 'Metals', icon: Recycle, color: 'from-eco-cyan to-eco-blue' },
  { id: 'paper', name: 'Paper', icon: Package, color: 'from-eco-lime to-eco-green' },
];

const EcoMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceRange, setDistanceRange] = useState([25]);
  const [matchFilter, setMatchFilter] = useState<string[]>(['high', 'medium', 'low']);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const filteredBusinesses = mockBusinesses.filter(business => {
    const categoryMatch = selectedCategory === 'all' || business.category === selectedCategory;
    const searchMatch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       business.materials.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchAvailabilityMatch = matchFilter.includes(business.matchAvailability);
    return categoryMatch && searchMatch && matchAvailabilityMatch;
  });

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-73.985, 40.750],
      zoom: 13,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    
    map.current.on('load', () => {
      setIsMapReady(true);
      map.current?.setFog({
        color: 'rgb(20, 20, 30)',
        'high-color': 'rgb(40, 60, 80)',
        'horizon-blend': 0.1,
      });
    });
  };

  useEffect(() => {
    if (isMapReady) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      filteredBusinesses.forEach(business => {
        const el = document.createElement('div');
        el.className = 'eco-marker';
        el.innerHTML = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
            business.matchAvailability === 'high' ? 'bg-gradient-to-br from-eco-green to-eco-lime' :
            business.matchAvailability === 'medium' ? 'bg-gradient-to-br from-eco-yellow to-eco-orange' :
            'bg-gradient-to-br from-eco-purple to-eco-pink'
          }" style="box-shadow: 0 0 20px ${
            business.matchAvailability === 'high' ? 'rgba(74, 222, 128, 0.5)' :
            business.matchAvailability === 'medium' ? 'rgba(251, 191, 36, 0.5)' :
            'rgba(168, 85, 247, 0.5)'
          }">
            <svg class="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
        `;
        
        el.addEventListener('click', () => setSelectedBusiness(business));

        const marker = new mapboxgl.Marker(el)
          .setLngLat(business.coordinates)
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      });
    }
  }, [filteredBusinesses, isMapReady]);

  const toggleMatchFilter = (value: string) => {
    setMatchFilter(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'bg-eco-green/20 text-eco-green border-eco-green/30';
      case 'medium': return 'bg-eco-yellow/20 text-eco-yellow border-eco-yellow/30';
      case 'low': return 'bg-eco-purple/20 text-eco-purple border-eco-purple/30';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Token Input */}
        {!isMapReady && (
          <div className="container mx-auto px-4 py-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="glass-card-dark p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-eco-cyan to-eco-blue flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-background" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-glow">Connect to Mapbox</h2>
                <p className="text-muted-foreground mb-6">
                  Enter your Mapbox public token to view the interactive eco-map. 
                  Get one free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-eco-cyan hover:underline">mapbox.com</a>
                </p>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="pk.eyJ1IjoieW91..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                    className="flex-1 bg-background/50 border-white/10"
                  />
                  <Button onClick={initializeMap} variant="eco" disabled={!mapboxToken}>
                    Load Map
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Map Container */}
        {isMapReady && (
          <div className="relative h-[calc(100vh-80px)]">
            <div ref={mapContainer} className="absolute inset-0" />
            
            {/* Search & Filters Overlay */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search businesses or materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/80 backdrop-blur-xl border-white/10"
                  />
                </div>
                
                {/* Filter Toggle */}
                <Button
                  variant="glass"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                        selectedCategory === cat.id
                          ? `bg-gradient-to-r ${cat.color} text-background font-medium`
                          : 'bg-background/60 backdrop-blur-xl text-foreground hover:bg-background/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </motion.button>
                  );
                })}
              </div>

              {/* Expanded Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card-dark p-4 mt-3 max-w-md"
                  >
                    {/* Distance Slider */}
                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">
                        Distance: {distanceRange[0]} km
                      </label>
                      <Slider
                        value={distanceRange}
                        onValueChange={setDistanceRange}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Match Availability */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Match Availability</label>
                      <div className="flex gap-2">
                        {['high', 'medium', 'low'].map(level => (
                          <button
                            key={level}
                            onClick={() => toggleMatchFilter(level)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                              matchFilter.includes(level)
                                ? getAvailabilityColor(level)
                                : 'bg-muted/20 text-muted-foreground border-transparent'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Counter */}
            <div className="absolute bottom-4 left-4 z-10">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-xl border-white/10 px-4 py-2">
                <MapPin className="w-4 h-4 mr-2 text-eco-green" />
                {filteredBusinesses.length} locations found
              </Badge>
            </div>

            {/* Business Detail Panel */}
            <AnimatePresence>
              {selectedBusiness && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  className="absolute top-4 right-4 bottom-4 w-80 glass-card-dark p-6 z-20 overflow-y-auto"
                >
                  <button
                    onClick={() => setSelectedBusiness(null)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                    categories.find(c => c.id === selectedBusiness.category)?.color || 'from-eco-cyan to-eco-blue'
                  } flex items-center justify-center mb-4`}>
                    <Recycle className="w-8 h-8 text-background" />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{selectedBusiness.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{selectedBusiness.type}</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Address</label>
                      <p className="text-sm">{selectedBusiness.address}</p>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Match Availability</label>
                      <Badge className={`mt-1 ${getAvailabilityColor(selectedBusiness.matchAvailability)}`}>
                        {selectedBusiness.matchAvailability === 'high' && <Check className="w-3 h-3 mr-1" />}
                        {selectedBusiness.matchAvailability === 'medium' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {selectedBusiness.matchAvailability.charAt(0).toUpperCase() + selectedBusiness.matchAvailability.slice(1)} Availability
                      </Badge>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Materials</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedBusiness.materials.map(material => (
                          <Badge key={material} variant="outline" className="bg-white/5 border-white/10">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Impact Score</label>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedBusiness.impactScore}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-eco-green to-eco-lime"
                          />
                        </div>
                        <span className="text-eco-green font-bold">{selectedBusiness.impactScore}</span>
                      </div>
                    </div>

                    <Button variant="eco" className="w-full mt-4">
                      <Leaf className="w-4 h-4 mr-2" />
                      Request Match
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Map Container Ref for initialization */}
        {!isMapReady && <div ref={mapContainer} className="hidden" />}
      </main>

      {!isMapReady && <Footer />}
    </div>
  );
};

export default EcoMap;
