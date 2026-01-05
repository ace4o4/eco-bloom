import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

const LeafLoader = ({ size = 32, className = "" }: { size?: number; className?: string }) => {
  return (
    <motion.div
      className={`text-primary ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <Leaf size={size} />
    </motion.div>
  );
};

export default LeafLoader;
