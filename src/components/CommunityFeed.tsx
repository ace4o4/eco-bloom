import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Leaf, Award } from "lucide-react";

interface StoryCard {
  id: string;
  business: string;
  action: string;
  recipient: string;
  impact: string;
  avatar: string;
  level: "seedling" | "sapling" | "tree" | "oak";
  reactions: number;
  time: string;
}

const stories: StoryCard[] = [
  {
    id: "1",
    business: "Café Verde",
    action: "matched coffee grounds with",
    recipient: "Bloom Gardens",
    impact: "5.2kg CO₂ saved!",
    avatar: "🌱",
    level: "sapling",
    reactions: 24,
    time: "2h ago",
  },
  {
    id: "2",
    business: "EcoTextiles",
    action: "diverted fabric scraps to",
    recipient: "Creative Reuse Studio",
    impact: "12kg materials saved!",
    avatar: "🌿",
    level: "tree",
    reactions: 38,
    time: "4h ago",
  },
  {
    id: "3",
    business: "Green Grocers",
    action: "sent organic waste to",
    recipient: "Urban Farm Co",
    impact: "8.7kg compost created!",
    avatar: "🌳",
    level: "oak",
    reactions: 56,
    time: "6h ago",
  },
  {
    id: "4",
    business: "The Bakery",
    action: "shared surplus bread with",
    recipient: "Community Kitchen",
    impact: "45 meals provided!",
    avatar: "🌾",
    level: "seedling",
    reactions: 89,
    time: "8h ago",
  },
];

const levelColors = {
  seedling: "bg-secondary/30 text-primary",
  sapling: "bg-primary/20 text-primary",
  tree: "bg-primary/30 text-primary",
  oak: "bg-primary text-primary-foreground",
};

const CommunityFeed = () => {
  return (
    <section id="community" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="eco-badge mb-4">Community Stories</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-4">
            Every Match Tells a Story
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how businesses in your community are turning waste into value. 
            Every story here is a step toward a regenerative future.
          </p>
        </motion.div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {stories.map((story, index) => (
            <motion.article
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 hover:shadow-eco-glow transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar with Level */}
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${levelColors[story.level]}`}>
                      {story.avatar}
                    </div>
                    {story.level === "oak" && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-golden rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-foreground">{story.business}</div>
                    <div className="text-xs text-muted-foreground">{story.time}</div>
                  </div>
                </div>

                <div className="eco-badge text-xs">
                  <Leaf className="w-3 h-3" />
                  {story.impact}
                </div>
              </div>

              {/* Content */}
              <p className="text-foreground/80 mb-4">
                <span className="font-medium">{story.business}</span>{" "}
                {story.action}{" "}
                <span className="font-medium text-primary">{story.recipient}</span>
              </p>

              {/* Impact Visual */}
              <div className="bg-muted rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎉
                  </motion.div>
                  <span className="font-bold text-lg">{story.impact}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-coral transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{story.reactions}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Comment</span>
                  </button>
                </div>
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="story-link text-primary font-semibold hover:text-primary/80 transition-colors">
            View All Stories →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityFeed;
