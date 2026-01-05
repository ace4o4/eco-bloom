import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Target, Users, Flame, Calendar, ChevronRight, Star, Leaf, Recycle, Droplets, TreeDeciduous, Zap, Crown, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Contributor {
  rank: number;
  name: string;
  avatar: string;
  level: string;
  points: number;
  matches: number;
  co2Saved: number;
  streak: number;
  badges: string[];
}

const topContributors: Contributor[] = [
  { rank: 1, name: 'EcoWarrior_Sarah', avatar: '🌳', level: 'Ancient Oak', points: 15420, matches: 234, co2Saved: 2.4, streak: 45, badges: ['🏆', '🌟', '💎'] },
  { rank: 2, name: 'GreenTech_Mike', avatar: '🌿', level: 'Mighty Pine', points: 12850, matches: 189, co2Saved: 1.9, streak: 32, badges: ['🥈', '⚡', '🔥'] },
  { rank: 3, name: 'CircularEconomy_Co', avatar: '♻️', level: 'Flourishing Maple', points: 11200, matches: 156, co2Saved: 1.7, streak: 28, badges: ['🥉', '🌍', '✨'] },
  { rank: 4, name: 'ZeroWaste_Jane', avatar: '🌱', level: 'Growing Birch', points: 9840, matches: 142, co2Saved: 1.4, streak: 21, badges: ['🎯', '💚'] },
  { rank: 5, name: 'SustainableCity', avatar: '🏙️', level: 'Growing Birch', points: 8920, matches: 128, co2Saved: 1.2, streak: 18, badges: ['🌿', '⭐'] },
  { rank: 6, name: 'CompostKing', avatar: '🍂', level: 'Sapling', points: 7650, matches: 98, co2Saved: 0.9, streak: 14, badges: ['🍃'] },
  { rank: 7, name: 'RecycleQueen', avatar: '👑', level: 'Sapling', points: 6890, matches: 87, co2Saved: 0.8, streak: 12, badges: ['♻️'] },
  { rank: 8, name: 'EcoStartup_NYC', avatar: '🗽', level: 'Seedling', points: 5420, matches: 65, co2Saved: 0.6, streak: 9, badges: ['🌱'] },
];

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  target: number;
  unit: string;
  reward: string;
  daysLeft: number;
  participants: number;
  color: string;
}

const monthlyChallenges: Challenge[] = [
  { id: '1', title: 'Textile Revolution', description: 'Divert textiles from landfills through creative matching', icon: <Recycle className="w-6 h-6" />, progress: 8420, target: 10000, unit: 'kg', reward: '500 points + Textile Champion Badge', daysLeft: 12, participants: 342, color: 'from-eco-purple to-eco-pink' },
  { id: '2', title: 'Organic Odyssey', description: 'Transform organic waste into valuable compost', icon: <Leaf className="w-6 h-6" />, progress: 15600, target: 20000, unit: 'kg', reward: '750 points + Compost Master Badge', daysLeft: 12, participants: 521, color: 'from-eco-green to-eco-lime' },
  { id: '3', title: 'Plastic Free Week', description: 'Help businesses find plastic alternatives', icon: <Droplets className="w-6 h-6" />, progress: 156, target: 200, unit: 'matches', reward: '300 points + Ocean Guardian Badge', daysLeft: 5, participants: 189, color: 'from-eco-cyan to-eco-blue' },
];

interface CommunityGoal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  current: number;
  target: number;
  unit: string;
  color: string;
  milestone: string;
}

const communityGoals: CommunityGoal[] = [
  { id: '1', title: 'Million Kg Challenge', description: 'Divert 1 million kg of waste from landfills this year', icon: <Target className="w-8 h-8" />, current: 742000, target: 1000000, unit: 'kg', color: 'from-eco-orange to-eco-yellow', milestone: '750K milestone reward: Community Tree Planting Event' },
  { id: '2', title: 'Carbon Neutral City', description: 'Prevent 100 tons of CO2 emissions through local matching', icon: <TreeDeciduous className="w-8 h-8" />, current: 78.4, target: 100, unit: 'tons CO2', color: 'from-eco-green to-eco-lime', milestone: '80 ton milestone: Featured in Sustainability Report' },
  { id: '3', title: '10K Businesses', description: 'Onboard 10,000 businesses to the circular economy', icon: <Users className="w-8 h-8" />, current: 6840, target: 10000, unit: 'businesses', color: 'from-eco-cyan to-eco-blue', milestone: '7K milestone: Community Celebration Event' },
];

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-yellow/10 border border-eco-yellow/20 text-eco-yellow mb-6">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Community Champions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-glow">Leaderboard</span> & Challenges
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compete, collaborate, and celebrate sustainability achievements with the Eco-Sync community
            </p>
          </motion.div>

          <Tabs defaultValue="leaderboard" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-card/50 border border-white/10">
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-eco-yellow/20 data-[state=active]:to-eco-orange/20">
                <Trophy className="w-4 h-4 mr-2" />
                Leaders
              </TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-eco-purple/20 data-[state=active]:to-eco-pink/20">
                <Flame className="w-4 h-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-eco-green/20 data-[state=active]:to-eco-lime/20">
                <Target className="w-4 h-4 mr-2" />
                Goals
              </TabsTrigger>
            </TabsList>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              {/* Time Filter */}
              <div className="flex justify-center gap-2 mb-8">
                {['week', 'month', 'all'].map((filter) => (
                  <Button
                    key={filter}
                    variant={timeFilter === filter ? 'eco' : 'glass'}
                    size="sm"
                    onClick={() => setTimeFilter(filter as any)}
                  >
                    {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Time'}
                  </Button>
                ))}
              </div>

              {/* Top 3 Podium */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8"
              >
                {/* 2nd Place */}
                <motion.div variants={itemVariants} className="flex flex-col items-center mt-8">
                  <div className="glass-card-dark p-6 text-center w-full">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-3xl shadow-lg">
                      {topContributors[1].avatar}
                    </div>
                    <Medal className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <h3 className="font-bold text-sm truncate">{topContributors[1].name}</h3>
                    <p className="text-muted-foreground text-xs">{topContributors[1].level}</p>
                    <p className="text-xl font-bold text-gray-300 mt-2">{topContributors[1].points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div variants={itemVariants} className="flex flex-col items-center">
                  <div className="glass-card-dark p-6 text-center w-full border-2 border-eco-yellow/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-eco-yellow/10 to-transparent" />
                    <Crown className="w-8 h-8 mx-auto mb-2 text-eco-yellow absolute top-2 right-2" />
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-eco-yellow to-eco-orange flex items-center justify-center text-4xl shadow-lg shadow-eco-yellow/30">
                        {topContributors[0].avatar}
                      </div>
                      <Trophy className="w-10 h-10 mx-auto mb-2 text-eco-yellow" />
                      <h3 className="font-bold truncate">{topContributors[0].name}</h3>
                      <p className="text-muted-foreground text-sm">{topContributors[0].level}</p>
                      <p className="text-2xl font-bold text-eco-yellow mt-2">{topContributors[0].points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                      <div className="flex justify-center gap-1 mt-2">
                        {topContributors[0].badges.map((badge, i) => (
                          <span key={i} className="text-lg">{badge}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div variants={itemVariants} className="flex flex-col items-center mt-12">
                  <div className="glass-card-dark p-6 text-center w-full">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-2xl shadow-lg">
                      {topContributors[2].avatar}
                    </div>
                    <Award className="w-7 h-7 mx-auto mb-2 text-amber-600" />
                    <h3 className="font-bold text-sm truncate">{topContributors[2].name}</h3>
                    <p className="text-muted-foreground text-xs">{topContributors[2].level}</p>
                    <p className="text-lg font-bold text-amber-600 mt-2">{topContributors[2].points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Full Leaderboard */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="glass-card-dark overflow-hidden max-w-4xl mx-auto"
              >
                {topContributors.slice(3).map((contributor, index) => (
                  <motion.div
                    key={contributor.rank}
                    variants={itemVariants}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center font-bold text-muted-foreground">
                      {contributor.rank}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-eco-green/30 to-eco-lime/30 flex items-center justify-center text-2xl">
                      {contributor.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{contributor.name}</h4>
                      <p className="text-sm text-muted-foreground">{contributor.level}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      {contributor.badges.map((badge, i) => (
                        <span key={i}>{badge}</span>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-eco-lime">{contributor.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{contributor.matches} matches</p>
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-eco-orange">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">{contributor.streak}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 max-w-4xl mx-auto"
              >
                {monthlyChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    variants={itemVariants}
                    className="glass-card-dark p-6 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${challenge.color} flex items-center justify-center text-background shrink-0`}>
                        {challenge.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold">{challenge.title}</h3>
                            <p className="text-muted-foreground text-sm">{challenge.description}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 bg-eco-orange/10 text-eco-orange border-eco-orange/20">
                            <Calendar className="w-3 h-3 mr-1" />
                            {challenge.daysLeft} days left
                          </Badge>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">{challenge.progress.toLocaleString()} / {challenge.target.toLocaleString()} {challenge.unit}</span>
                            <span className="font-medium">{Math.round((challenge.progress / challenge.target) * 100)}%</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full bg-gradient-to-r ${challenge.color}`}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {challenge.participants} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-eco-yellow" />
                              {challenge.reward}
                            </span>
                          </div>
                          <Button variant="eco" size="sm">
                            Join Challenge
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Community Goals Tab */}
            <TabsContent value="goals">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8 max-w-4xl mx-auto"
              >
                {communityGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    variants={itemVariants}
                    className="glass-card-dark p-8"
                  >
                    <div className="flex items-center gap-6 mb-6">
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-background`}>
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">{goal.title}</h3>
                        <p className="text-muted-foreground">{goal.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">
                          <span className={`bg-gradient-to-r ${goal.color} bg-clip-text text-transparent`}>
                            {goal.current.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-muted-foreground">of {goal.target.toLocaleString()} {goal.unit}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${goal.color} relative`}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" />
                        </motion.div>
                      </div>
                      
                      {/* Milestone markers */}
                      <div className="absolute top-0 left-0 right-0 h-6 flex items-center">
                        {[25, 50, 75].map(percent => (
                          <div
                            key={percent}
                            className="absolute w-0.5 h-4 bg-white/30"
                            style={{ left: `${percent}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-eco-yellow" />
                      <span className="text-muted-foreground">{goal.milestone}</span>
                    </div>
                  </motion.div>
                ))}

                {/* Call to Action */}
                <motion.div 
                  variants={itemVariants}
                  className="text-center glass-card-dark p-8 bg-gradient-to-br from-eco-green/10 to-eco-lime/10 border-eco-green/20"
                >
                  <h3 className="text-2xl font-bold mb-2">Ready to Make an Impact?</h3>
                  <p className="text-muted-foreground mb-6">Every match counts towards our community goals</p>
                  <Button variant="hero" size="lg">
                    <Leaf className="w-5 h-5 mr-2" />
                    Plant a Match Now
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
