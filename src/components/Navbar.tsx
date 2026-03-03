import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const links = [
  { to: "/", label: "Home" },
  { to: "/enhance", label: "Enhance" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { connected } = useHealthCheck();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const statusColor =
    connected === null
      ? "bg-muted-foreground"
      : connected
      ? "bg-emerald-400"
      : "bg-destructive";

  const statusLabel =
    connected === null
      ? "Checking API..."
      : connected
      ? "API Connected"
      : "API Disconnected";

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass glow-cyan-sm" : "bg-transparent"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold"
            aria-label="SuperSat AI Home"
          >
            <span className="text-2xl" aria-hidden="true">🛰️</span>
            <span className="gradient-text">SuperSat AI</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "nav-underline px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === l.to
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={location.pathname === l.to ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}

            {/* Health indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-3 flex items-center gap-1.5 cursor-default" aria-label={statusLabel}>
                  <span className={cn("w-2 h-2 rounded-full transition-colors", statusColor)} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {statusLabel}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full transition-colors", statusColor)} aria-label={statusLabel} />
            <button
              className="text-foreground btn-press p-2 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[55] bg-background/60 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[60] w-64 glass border-l border-border/50 md:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <span className="gradient-text font-bold">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground btn-press"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      location.pathname === l.to
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                    aria-current={location.pathname === l.to ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
