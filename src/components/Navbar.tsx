import { motion } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Impact", href: "/#impact" },
    { name: "Community", href: "/#community" },
    { name: "Scorecard", href: "/scorecard" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 20 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-neon"
            >
              <Leaf className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-montserrat font-bold text-xl text-gradient-eco">
              Eco-Sync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`story-link text-foreground/80 hover:text-primary transition-colors font-medium ${
                  location.pathname === link.href ? "text-primary" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Link to="/plant-match">
              <Button variant="eco" size="sm">
                Plant a Match
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 glass-panel p-4 space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2 text-foreground/80 hover:text-primary transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <Button variant="ghost" className="w-full justify-center">
                Sign In
              </Button>
              <Link to="/plant-match" className="block">
                <Button variant="eco" className="w-full justify-center">
                  Plant a Match
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
