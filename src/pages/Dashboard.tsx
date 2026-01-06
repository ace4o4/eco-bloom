import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Leaf, Target, TrendingUp, Users, Calendar,
    Sparkles, ArrowRight, Package, Recycle, Wheat,
    TreeDeciduous, Droplets, Cloud, Award, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"overview" | "plant-match" | "scorecard">("overview");

    // Mock user stats - will be replaced with real data from database
    const userStats = {
        level: "Seedling",
        points: 150,
        streak: 3,
        matches: 2,
        co2Saved: 24.5,
        materialsDiverted: 12,
        waterConserved: 450,
    };

    const quickActions = [
        {
            icon: Leaf,
            title: "Plant a Match",
            description: "List materials or find what you need",
            color: "from-primary to-secondary",
            action: () => navigate("/plant-match")
        },
        {
            icon: Target,
            title: "View Scorecard",
            description: "Track your sustainability impact",
            color: "from-info to-sky",
            action: () => setActiveTab("scorecard")
        },
        {
            icon: Users,
            title: "Community Feed",
            description: "See what others are doing",
            color: "from-violet to-magenta",
            action: () => navigate("/#community")
        },
        {
            icon: Award,
            title: "Challenges",
            description: "Join community challenges",
            color: "from-accent to-golden",
            action: () => navigate("/leaderboard")
        },
    ];

    const recentActivity = [
        { id: 1, action: "Listed 5kg of coffee grounds", time: "2 hours ago", icon: "🌱" },
        { id: 2, action: "Earned 'First Seed' badge", time: "1 day ago", icon: "🏆" },
        { id: 3, action: "Matched with Urban Farm Co", time: "2 days ago", icon: "🤝" },
    ];

    return (
        <div className="min-h-screen bg-background bg-vibrant-pattern">
            <Navbar />

            <main className="pt-28 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                    Welcome back, <span className="text-gradient-eco">{user?.user_metadata?.full_name || "Eco Warrior"}</span>! 🌿
                                </h1>
                                <p className="text-muted-foreground">
                                    Ready to make a positive impact today?
                                </p>
                            </div>

                            {/* Level Badge */}
                            <div className="glass-card px-6 py-4 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <span className="text-2xl">🌱</span>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Level</div>
                                    <div className="text-xl font-bold">{userStats.level}</div>
                                    <div className="text-xs text-primary">{userStats.points} points</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: Flame, label: "Day Streak", value: userStats.streak, color: "from-accent to-golden" },
                            { icon: Target, label: "Total Matches", value: userStats.matches, color: "from-primary to-secondary" },
                            { icon: Cloud, label: "CO₂ Saved", value: `${userStats.co2Saved}kg`, color: "from-info to-sky" },
                            { icon: Droplets, label: "Water Saved", value: `${userStats.waterConserved}L`, color: "from-ocean to-info" },
                        ].map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card p-4 hover:shadow-neon transition-shadow"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary" />
                            Quick Actions
                        </h2>
                        <div className="grid md:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <motion.button
                                        key={action.title}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        onClick={action.action}
                                        className="glass-card p-6 text-left hover:scale-[1.02] transition-all duration-300 group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                                        <p className="text-sm text-muted-foreground">{action.description}</p>
                                        <ArrowRight className="w-4 h-4 text-primary mt-2 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Two Column Layout */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="lg:col-span-2"
                        >
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Recent Activity
                                </h2>
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="text-3xl">{activity.icon}</div>
                                            <div className="flex-1">
                                                <p className="text-foreground font-medium">{activity.action}</p>
                                                <p className="text-sm text-muted-foreground">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <Button variant="ghost" className="w-full mt-4">
                                        View All Activity
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Active Listings */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Your Listings
                                </h2>

                                <div className="space-y-3 mb-4">
                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wheat className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium">Coffee Grounds</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">5kg • Active</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Recycle className="w-4 h-4 text-info" />
                                            <span className="text-sm font-medium">Cardboard Boxes</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">15kg • Matched</p>
                                    </div>
                                </div>

                                <Button
                                    variant="eco"
                                    className="w-full"
                                    onClick={() => navigate("/plant-match")}
                                >
                                    <Leaf className="w-4 h-4 mr-2" />
                                    Create New Listing
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 glass-card p-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10"
                    >
                        <TreeDeciduous className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <h2 className="text-2xl font-bold mb-2">Ready to Make an Impact?</h2>
                        <p className="text-muted-foreground mb-6">
                            Every match you make helps build a more sustainable future
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="hero"
                                size="lg"
                                onClick={() => navigate("/plant-match")}
                            >
                                <Leaf className="w-5 h-5 mr-2" />
                                Plant a Match
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate("/leaderboard")}
                            >
                                View Leaderboard
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
