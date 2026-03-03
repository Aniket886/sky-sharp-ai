import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/* ------------------------------------------------------------------ */
/*  Canvas Dot-Grid overlay — lights up near cursor                   */
/* ------------------------------------------------------------------ */
const DotGrid = memo(({ mouseX, mouseY }: { mouseX: number; mouseY: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouse = useRef({ x: mouseX, y: mouseY });
  mouse.current = { x: mouseX, y: mouseY };

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const spacing = 40;
    const radius = 200;

    const resize = () => {
      cvs.width = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;
      for (let x = 0; x < cvs.width; x += spacing) {
        for (let y = 0; y < cvs.height; y += spacing) {
          const dist = Math.hypot(x - mx, y - my);
          const inRange = dist < radius;
          const alpha = inRange ? 0.1 + 0.3 * (1 - dist / radius) : 0.08;
          ctx.fillStyle = inRange
            ? `hsla(187,100%,50%,${alpha})`
            : `hsla(210,20%,55%,${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
});
DotGrid.displayName = "DotGrid";

/* ------------------------------------------------------------------ */
/*  Magnetic CTA Button                                                */
/* ------------------------------------------------------------------ */
const MagneticButton = memo(() => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 20 });
  const sy = useSpring(y, { stiffness: 250, damping: 20 });

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 100) {
        x.set(dx * 0.1);
        y.set(dy * 0.1);
      }
    },
    [x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      <Button
        asChild
        size="lg"
        className="relative bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan rounded-xl px-8 py-6 text-base font-semibold overflow-hidden group"
      >
        <Link to="/enhance" aria-label="Try SuperSat AI image enhancement">
          <span className="relative z-10 flex items-center gap-2">
            Try It Now <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
          {/* animated gradient sweep */}
          <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[gradient-shift_3s_linear_infinite]" />
          {/* pulse ring */}
          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-hover:animate-[btn-pulse_1.5s_ease-out_infinite] border-2 border-primary pointer-events-none" />
        </Link>
      </Button>
    </motion.div>
  );
});
MagneticButton.displayName = "MagneticButton";

/* ------------------------------------------------------------------ */
/*  Scroll Indicator                                                   */
/* ------------------------------------------------------------------ */
const ScrollIndicator = memo(() => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
    >
      <span className="text-xs text-muted-foreground font-mono">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5 text-primary" />
      </motion.div>
    </motion.div>
  );
});
ScrollIndicator.displayName = "ScrollIndicator";

/* ------------------------------------------------------------------ */
/*  Main Hero                                                          */
/* ------------------------------------------------------------------ */
const HeroSection = memo(() => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLElement>(null);
  const [engineReady, setEngineReady] = useState(false);

  // Raw mouse position
  const rawMouseX = useMotionValue(0.5);
  const rawMouseY = useMotionValue(0.5);
  // Smoothed
  const mouseX = useSpring(rawMouseX, { stiffness: 80, damping: 25 });
  const mouseY = useSpring(rawMouseY, { stiffness: 80, damping: 25 });

  // For dot grid (absolute px)
  const [absMouse, setAbsMouse] = useState({ x: -1000, y: -1000 });

  // 3D tilt for headline
  const rotateX = useTransform(mouseY, [0, 1], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);

  // Parallax for floating card (opposite direction)
  const cardX = useTransform(mouseX, [0, 1], [30, -30]);
  const cardY = useTransform(mouseY, [0, 1], [20, -20]);
  const cardSX = useSpring(cardX, { stiffness: 60, damping: 20 });
  const cardSY = useSpring(cardY, { stiffness: 60, damping: 20 });

  // Cursor glow position (px)
  const glowX = useSpring(useMotionValue(0), { stiffness: 120, damping: 25 });
  const glowY = useSpring(useMotionValue(0), { stiffness: 120, damping: 25 });

  // Card tilt (on hover)
  const cardRotateX = useMotionValue(0);
  const cardRotateY = useMotionValue(0);
  const cardRotateXS = useSpring(cardRotateX, { stiffness: 200, damping: 20 });
  const cardRotateYS = useSpring(cardRotateY, { stiffness: 200, damping: 20 });
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      rawMouseX.set(nx);
      rawMouseY.set(ny);
      glowX.set(e.clientX - rect.left);
      glowY.set(e.clientY - rect.top);
      setAbsMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [isMobile, rawMouseX, rawMouseY, glowX, glowY]
  );

  const handleCardMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    cardRotateX.set((ny - 0.5) * -15);
    cardRotateY.set((nx - 0.5) * 15);
    setSpotlightPos({ x: nx * 100, y: ny * 100 });
  }, [cardRotateX, cardRotateY]);

  const handleCardLeave = useCallback(() => {
    cardRotateX.set(0);
    cardRotateY.set(0);
  }, [cardRotateX, cardRotateY]);

  // Init tsparticles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  const particlesOptions = {
    fullScreen: false,
    fpsLimit: 60,
    particles: {
      number: { value: isMobile ? 80 : 200, density: { enable: true } },
      color: {
        value: ["#00E5FF", "#7C3AED", "#ffffff"],
      },
      opacity: { value: { min: 0.2, max: 0.7 } },
      size: { value: { min: 0.8, max: 2.2 } },
      move: {
        enable: true,
        speed: 0.6,
        direction: "none" as const,
        outModes: { default: "out" as const },
      },
      links: { enable: false },
    },
    interactivity: {
      events: {
        onHover: {
          enable: !isMobile,
          mode: "repulse" as const,
        },
      },
      modes: {
        repulse: { distance: 150, speed: 0.4, duration: 0.4 },
      },
    },
    detectRetina: true,
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Particle star field */}
      {engineReady && (
        <Particles
          id="hero-particles"
          className="absolute inset-0 z-0"
          options={particlesOptions}
        />
      )}

      {/* Dot grid overlay */}
      {!isMobile && (
        <DotGrid mouseX={absMouse.x} mouseY={absMouse.y} />
      )}

      {/* Mouse-following glow */}
      {!isMobile && (
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full pointer-events-none z-[1]"
          style={{
            x: glowX,
            y: glowY,
            translateX: "-50%",
            translateY: "-50%",
            background:
              "radial-gradient(circle, hsla(187,100%,50%,0.15) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Static ambient blobs */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-56 md:w-80 h-56 md:h-80 rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass text-xs font-mono text-primary mb-6">
              ESRGAN-Powered Super-Resolution
            </span>
          </motion.div>

          {/* 3D Tilt Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            style={
              isMobile
                ? {}
                : {
                    rotateX,
                    rotateY,
                    perspective: 800,
                    transformStyle: "preserve-3d" as const,
                  }
            }
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Enhance Satellite{" "}
              <span className="hero-shimmer-text gradient-text">
                Imagery with AI
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            ESRGAN-powered 4× super-resolution for micro-region analysis.
            Transform blurry satellite captures into crystal-clear imagery.
          </motion.p>

          {/* Magnetic CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <MagneticButton />
          </motion.div>

          {/* Floating parallax card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={isMobile ? {} : { x: cardSX, y: cardSY }}
            className="mt-12 md:mt-16"
          >
            <motion.div
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
              style={
                isMobile
                  ? {}
                  : {
                      rotateX: cardRotateXS,
                      rotateY: cardRotateYS,
                      perspective: 800,
                      transformStyle: "preserve-3d" as const,
                    }
              }
              className="hero-card-border rounded-2xl p-[2px] max-w-2xl mx-auto relative group cursor-pointer"
            >
              {/* Spotlight glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
                style={{
                  background: `radial-gradient(circle at ${spotlightPos.x}% ${spotlightPos.y}%, hsla(187,100%,50%,0.15) 0%, transparent 60%)`,
                }}
              />
              <div className="rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl relative">
                <img
                  src="/samples/satellite-hero.jpg"
                  alt="Satellite imagery sample"
                  className="w-full h-auto object-cover max-h-[340px]"
                  loading="eager"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-primary">4× Enhanced</p>
                      <p className="text-sm text-foreground/80">
                        AI Super-Resolution Output
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">
                        PSNR 32.4
                      </span>
                      <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-mono">
                        SSIM 0.91
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
