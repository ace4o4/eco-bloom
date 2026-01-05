import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TreeDeciduous, Cloud, Droplets, Recycle, Award, TrendingUp, 
  Users, Zap, Star, Medal, Trophy, Flame, Target, ArrowLeft,
  Calendar, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// Mock data for charts
const impactOverTime = [
  { month: "Jul", co2: 120, materials: 45, water: 800 },
  { month: "Aug", co2: 280, materials: 89, water: 1200 },
  { month: "Sep", co2: 450, materials: 156, water: 2100 },
  { month: "Oct", co2: 620, materials: 234, water: 3400 },
  { month: "Nov", co2: 890, materials: 312, water: 4200 },
  { month: "Dec", co2: 1240, materials: 420, water: 5800 },
];

const categoryBreakdown = [
  { name: "Organic", value: 45, fill: "hsl(145, 65%, 42%)" },
  { name: "Plastics", value: 22, fill: "hsl(195, 85%, 55%)" },
  { name: "Textiles", value: 18, fill: "hsl(280, 70%, 60%)" },
  { name: "Paper", value: 10, fill: "hsl(40, 95%, 60%)" },
  { name: "Metals", value: 5, fill: "hsl(25, 75%, 55%)" },
];

const radarData = [
  { category: "CO₂ Saved", user: 85, community: 60 },
  { category: "Materials", user: 72, community: 55 },
  { category: "Water", user: 90, community: 65 },
  { category: "Matches", user: 68, community: 70 },
  { category: "Streak", user: 95, community: 40 },
  { category: "Impact", user: 78, community: 58 },
];

const badges = [
  { id: 1, name: "First Seed", icon: "🌱", desc: "Made your first match", earned: true, date: "Jul 2025" },
  { id: 2, name: "Week Warrior", icon: "⚡", desc: "7-day streak", earned: true, date: "Aug 2025" },
  { id: 3, name: "Carbon Crusher", icon: "☁️", desc: "Saved 1 ton CO₂", earned: true, date: "Oct 2025" },
  { id: 4, name: "Community Builder", icon: "🤝", desc: "10+ matches", earned: true, date: "Nov 2025" },
  { id: 5, name: "Forest Guardian", icon: "🌳", desc: "Saved 100 trees", earned: false, progress: 78 },
  { id: 6, name: "Ocean Protector", icon: "🌊", desc: "Conserved 10,000L water", earned: false, progress: 58 },
];

const AnimatedCounter = ({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
};

const Scorecard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("all-time");

  const metrics = [
    { icon: TreeDeciduous, value: 1247, label: "Trees Saved", color: "from-primary to-secondary", suffix: "" },
    { icon: Cloud, value: 8420, label: "CO₂ Prevented", color: "from-info to-sky", suffix: "kg" },
    { icon: Droplets, value: 52300, label: "Water Conserved", color: "from-ocean to-info", suffix: "L" },
    { icon: Recycle, value: 12800, label: "Materials Diverted", color: "from-accent to-golden", suffix: "kg" },
  ];

  return (
    <div className="min-h-screen bg-background bg-vibrant-pattern">
      <Navbar />
      
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Your <span className="text-gradient-eco">Sustainability Scorecard</span>
                </h1>
                <p className="text-muted-foreground">
                  Track your environmental impact and celebrate your achievements
                </p>
              </div>
              
              {/* Time Range Selector */}
              <div className="glass-card inline-flex p-1 gap-1">
                {[
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                  { value: "all-time", label: "All Time" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      timeRange === option.value 
                        ? "bg-primary text-primary-foreground shadow-neon" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Level & Streak Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Level */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-neon">
                  <span className="text-2xl">🌳</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                  <div className="text-2xl font-bold text-foreground">Forest Guardian</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full w-32 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "72%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">72% to Oak Keeper</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-golden">
                    <Flame className="w-5 h-5" />
                    <span className="text-2xl font-bold">28</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-info">
                    <Target className="w-5 h-5" />
                    <span className="text-2xl font-bold">42</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-violet">
                    <Star className="w-5 h-5" />
                    <span className="text-2xl font-bold">4</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Badges Earned</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Impact Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-card p-5 hover:shadow-neon transition-shadow duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Impact Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Impact Over Time
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={impactOverTime}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145, 65%, 42%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(145, 65%, 42%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMaterials" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(195, 85%, 55%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(195, 85%, 55%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 20%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(80, 15%, 65%)" fontSize={12} />
                  <YAxis stroke="hsl(80, 15%, 65%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(160, 25%, 10%)", 
                      border: "1px solid hsl(160, 20%, 18%)",
                      borderRadius: "12px",
                      color: "hsl(80, 20%, 95%)"
                    }}
                  />
                  <Area type="monotone" dataKey="co2" stroke="hsl(145, 65%, 42%)" fillOpacity={1} fill="url(#colorCo2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="materials" stroke="hsl(195, 85%, 55%)" fillOpacity={1} fill="url(#colorMaterials)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">CO₂ Saved (kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info" />
                  <span className="text-muted-foreground">Materials (kg)</span>
                </div>
              </div>
            </motion.div>

            {/* Community Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet" />
                You vs Community Average
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(160, 20%, 18%)" />
                  <PolarAngleAxis dataKey="category" stroke="hsl(80, 15%, 65%)" fontSize={11} />
                  <PolarRadiusAxis stroke="hsl(160, 20%, 18%)" fontSize={10} />
                  <Radar name="You" dataKey="user" stroke="hsl(145, 65%, 42%)" fill="hsl(145, 65%, 42%)" fillOpacity={0.4} strokeWidth={2} />
                  <Radar name="Community" dataKey="community" stroke="hsl(280, 70%, 60%)" fill="hsl(280, 70%, 60%)" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(160, 25%, 10%)", 
                      border: "1px solid hsl(160, 20%, 18%)",
                      borderRadius: "12px",
                      color: "hsl(80, 20%, 95%)"
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Your Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet" />
                  <span className="text-muted-foreground">Community Avg</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 mb-8"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-accent" />
              Materials by Category
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 20%, 18%)" horizontal={false} />
                <XAxis type="number" stroke="hsl(80, 15%, 65%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(80, 15%, 65%)" fontSize={12} width={70} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(160, 25%, 10%)", 
                    border: "1px solid hsl(160, 20%, 18%)",
                    borderRadius: "12px",
                    color: "hsl(80, 20%, 95%)"
                  }}
                  formatter={(value: number) => [`${value}%`, "Share"]}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {categoryBreakdown.map((entry, index) => (
                    <motion.rect
                      key={index}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      fill={entry.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Badges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-golden" />
              Badges & Achievements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                    badge.earned 
                      ? "border-golden/50 bg-golden/10 hover:shadow-eco-glow" 
                      : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  <div className={`text-4xl mb-2 ${badge.earned ? "" : "grayscale"}`}>
                    {badge.icon}
                  </div>
                  <div className="font-medium text-sm text-foreground">{badge.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{badge.desc}</div>
                  
                  {badge.earned ? (
                    <div className="text-xs text-golden mt-2">{badge.date}</div>
                  ) : (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{badge.progress}%</div>
                    </div>
                  )}
                  
                  {badge.earned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-golden rounded-full flex items-center justify-center">
                      <Medal className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Scorecard;
