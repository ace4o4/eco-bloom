import { motion } from "framer-motion";
import { Search, Sparkles, Truck, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "List Your Resources",
    description: "Tell us what materials you have available or what you need. From coffee grounds to cardboard, every resource has potential.",
    color: "bg-primary",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Smart Matching",
    description: "Our carbon-conscious algorithm finds the perfect match, prioritizing local connections and minimal environmental impact.",
    color: "bg-info",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Eco-Logistics",
    description: "We coordinate green transport options—electric vehicles, bike couriers, or even walking routes for nearby matches.",
    color: "bg-accent",
  },
  {
    icon: <PartyPopper className="w-6 h-6" />,
    title: "Celebrate Impact",
    description: "Watch your sustainability scorecard grow. Every match saves carbon, water, and materials while building community.",
    color: "bg-success",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="eco-badge mb-4">Simple & Sustainable</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-4">
            How Eco-Sync Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform your waste into someone's treasure in four simple steps. 
            It's as natural as photosynthesis.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Step Number */}
                <motion.div
                  className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary text-sm z-10"
                  whileHover={{ scale: 1.1 }}
                >
                  {index + 1}
                </motion.div>

                <div className="glass-card p-6 h-full hover:shadow-eco-glow transition-all duration-300 group">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${step.color} text-primary-foreground flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-xl text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 text-primary/30 text-2xl">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
