import { motion } from "framer-motion";
import { ArrowRight, Leaf, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    Platform: ["How It Works", "Pricing", "For Businesses", "For Farms"],
    Resources: ["Blog", "Case Studies", "API Docs", "Help Center"],
    Company: ["About Us", "Careers", "Press", "Contact"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* CTA Section */}
      <section className="py-20 px-4 border-b border-border bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-gradient-eco">Grow Your Impact</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already transforming their waste streams 
              into value. Your forest awaits its first seed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/plant-match">
                <Button variant="hero" size="xl" className="group">
                  Plant Your First Match
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Talk to Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Links Section */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-neon">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-montserrat font-bold text-xl text-gradient-eco">Eco-Sync</span>
              </Link>
              <p className="text-muted-foreground text-sm mb-4">
                Growing circular economies, one match at a time.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-coral fill-coral" />
                <span>for the planet</span>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold mb-4 text-foreground">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 Eco-Sync. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Twitter", "LinkedIn", "Instagram", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
