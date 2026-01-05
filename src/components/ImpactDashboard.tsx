import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TreeDeciduous, Cloud, Droplets, Recycle } from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  comparison: string;
  color: string;
  delay: number;
}

const AnimatedCounter = ({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const MetricCard = ({ icon, value, suffix, label, comparison, color, delay }: MetricCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="metric-card group hover:scale-[1.02] hover:shadow-neon transition-all duration-300"
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        {icon}
      </div>
      
      <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      
      <div className="text-lg font-semibold text-foreground mb-2">{label}</div>
      
      <div className="text-sm text-muted-foreground">{comparison}</div>
      
      {/* Progress bar */}
      <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: "75%" } : {}}
          transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </motion.div>
  );
};

const ImpactDashboard = () => {
  const metrics = [
    {
      icon: <TreeDeciduous className="w-7 h-7 text-white" />,
      value: 1247,
      suffix: "",
      label: "Trees Saved",
      comparison: "= 12 soccer fields of forest",
      color: "from-primary to-secondary",
    },
    {
      icon: <Cloud className="w-7 h-7 text-white" />,
      value: 8400,
      suffix: "kg",
      label: "CO₂ Prevented",
      comparison: "= 35,000 car miles avoided",
      color: "from-info to-sky",
    },
    {
      icon: <Droplets className="w-7 h-7 text-white" />,
      value: 52300,
      suffix: "L",
      label: "Water Conserved",
      comparison: "= 350 bathtubs of water",
      color: "from-ocean to-info",
    },
    {
      icon: <Recycle className="w-7 h-7 text-white" />,
      value: 12800,
      suffix: "kg",
      label: "Materials Diverted",
      comparison: "= 2 elephants in weight",
      color: "from-accent to-golden",
    },
  ];

  return (
    <section id="impact" className="py-24 px-4 bg-vibrant-pattern">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="eco-badge mb-4">Community Impact</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-4">
            Watch Our <span className="text-gradient-eco">Forest Grow</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every match plants a seed. Together, we're cultivating a thriving ecosystem of circular economy.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.label} {...metric} delay={index * 0.1} />
          ))}
        </div>

        {/* Time Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <div className="glass-card inline-flex p-1 gap-1">
            {["This Week", "This Month", "All Time"].map((period, index) => (
              <button
                key={period}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  index === 2 
                    ? "bg-primary text-primary-foreground shadow-neon" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactDashboard;
