import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Building2, Factory, Store, Flower2 } from "lucide-react";

interface EcoNode {
  id: string;
  name: string;
  type: "cafe" | "factory" | "farm" | "store" | "garden";
  position: { x: number; y: number };
  active: boolean;
  materials: string[];
}

const nodes: EcoNode[] = [
  { id: "1", name: "Café Verde", type: "cafe", position: { x: 20, y: 30 }, active: true, materials: ["Coffee grounds", "Cardboard"] },
  { id: "2", name: "Urban Farm Co", type: "farm", position: { x: 45, y: 20 }, active: true, materials: ["Organic compost", "Plant waste"] },
  { id: "3", name: "EcoTextiles", type: "factory", position: { x: 70, y: 35 }, active: true, materials: ["Fabric scraps", "Thread ends"] },
  { id: "4", name: "Green Grocers", type: "store", position: { x: 30, y: 60 }, active: false, materials: ["Food waste", "Packaging"] },
  { id: "5", name: "Bloom Gardens", type: "garden", position: { x: 60, y: 55 }, active: true, materials: ["Green waste", "Soil"] },
  { id: "6", name: "BioMaterials Inc", type: "factory", position: { x: 80, y: 65 }, active: true, materials: ["Recycled plastics"] },
];

const connections = [
  { from: "1", to: "5" },
  { from: "2", to: "4" },
  { from: "3", to: "6" },
  { from: "5", to: "2" },
];

const getNodeIcon = (type: EcoNode["type"]) => {
  const icons = {
    cafe: Store,
    factory: Factory,
    farm: Flower2,
    store: Store,
    garden: Flower2,
  };
  return icons[type];
};

const EcoMapVisualization = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="eco-badge mb-4">Living Ecosystem</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-4">
            Your City, <span className="text-gradient-eco">Connected</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch resources flow through our network. Every glowing connection represents 
            waste becoming value, pollution becoming possibility.
          </p>
        </motion.div>

        {/* Map Container */}
        <div 
          ref={ref}
          className="relative glass-card p-8 aspect-video max-w-5xl mx-auto overflow-hidden"
        >
          {/* Background Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {connections.map((conn, index) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              return (
                <motion.path
                  key={`${conn.from}-${conn.to}`}
                  d={`M ${fromNode.position.x}% ${fromNode.position.y}% 
                      Q ${(fromNode.position.x + toNode.position.x) / 2}% ${Math.min(fromNode.position.y, toNode.position.y) - 10}%
                      ${toNode.position.x}% ${toNode.position.y}%`}
                  fill="none"
                  stroke="url(#connectionGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node, index) => {
            const Icon = getNodeIcon(node.type);
            
            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: index * 0.1 
                }}
                className="absolute group cursor-pointer"
                style={{ 
                  left: `${node.position.x}%`, 
                  top: `${node.position.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                {/* Pulse Ring */}
                {node.active && (
                  <motion.div
                    className="absolute inset-0 -m-2 rounded-full bg-secondary/40"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                )}
                
                {/* Node Icon */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${node.active 
                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-neon" 
                    : "bg-muted text-muted-foreground"
                  }
                  transition-all duration-300 group-hover:scale-110
                `}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Tooltip */}
                <div className="
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-3
                  opacity-0 group-hover:opacity-100 transition-opacity
                  pointer-events-none z-10
                ">
                  <div className="glass-card px-3 py-2 text-center whitespace-nowrap">
                    <div className="font-semibold text-sm">{node.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {node.materials[0]}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-card px-4 py-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse-glow" />
                <span className="text-muted-foreground">Active Match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-muted-foreground">Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {[
            { title: "Real-Time Matching", desc: "AI-powered connections updated every minute", color: "from-primary to-secondary" },
            { title: "Carbon-Optimized", desc: "Routes calculated for minimal environmental impact", color: "from-info to-sky" },
            { title: "Full Transparency", desc: "Track every gram from source to destination", color: "from-accent to-golden" },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-5 text-center group hover:shadow-neon transition-all duration-300"
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} mx-auto mb-3`} />
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EcoMapVisualization;
