import { motion } from "framer-motion";

const PageLoader = () => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-20 h-20 rounded-full border-2 border-primary/30 pulse-ring" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="text-4xl"
      >
        🛰️
      </motion.div>
    </div>
  </div>
);

export default PageLoader;
