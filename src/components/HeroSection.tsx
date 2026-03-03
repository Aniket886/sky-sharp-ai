import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Satellite, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

const PARTICLE_COUNT = 80;

const HeroSection = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      hue: Math.random() > 0.5 ? 187 : 263, // cyan or violet
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      if (particlesRef.current.length === 0) {
        initParticles(canvas.offsetWidth, canvas.offsetHeight);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach((p) => {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.hue === 187 ? 50 : 52}%, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(187, 100%, 50%, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCursorGlow({ x: e.clientX, y: e.clientY, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
    setCursorGlow((prev) => ({ ...prev, active: false }));
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Custom cursor glow */}
      <div
        className="pointer-events-none fixed z-50 transition-opacity duration-300"
        style={{
          left: cursorGlow.x - 16,
          top: cursorGlow.y - 16,
          width: 32,
          height: 32,
          opacity: cursorGlow.active ? 1 : 0,
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-primary/80" />
        <div
          className="absolute inset-0 rounded-full bg-primary/20 blur-md"
          style={{ transform: "scale(2.5)" }}
        />
        <div className="absolute inset-[12px] rounded-full bg-primary" />
      </div>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(187_100%_50%/0.12),transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_50%_40%_at_80%_110%,hsl(263_75%_52%/0.1),transparent)]" />
      </div>

      {/* Floating orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div
          className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-primary/[0.06]"
          style={{ animation: "spin 60s linear infinite" }}
        />
        <div
          className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-secondary/[0.08]"
          style={{ animation: "spin 45s linear infinite reverse" }}
        />
        <div
          className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-primary/[0.04]"
          style={{ animation: "spin 30s linear infinite" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-mono text-primary border border-primary/20">
              <Satellite className="w-3.5 h-3.5" />
              ESRGAN-Powered Super-Resolution
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl sm:text-6xl md:text-8xl font-extrabold leading-[1.05] mb-8 tracking-tight"
          >
            <span className="block">Enhance Satellite</span>
            <span className="block gradient-text mt-1">Imagery with AI</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Transform blurry satellite captures into crystal-clear imagery with{" "}
            <span className="text-primary font-medium">4× super-resolution</span>{" "}
            powered by Real-ESRGAN.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="btn-gradient text-primary-foreground glow-cyan rounded-xl px-10 py-7 text-base font-semibold btn-press cursor-none"
            >
              <Link to="/enhance" aria-label="Try SuperSat AI image enhancement">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-8 py-7 text-base font-medium border-border/50 hover:border-primary/30 hover:bg-primary/5 cursor-none"
            >
              <Link to="/about" aria-label="Learn more about SuperSat AI">
                Learn More
              </Link>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-16 md:mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: "4×", label: "Upscale" },
              { value: "30+", label: "PSNR (dB)" },
              { value: "0.85+", label: "SSIM" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-2xl md:text-3xl font-extrabold font-mono gradient-text group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Floating visual */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-14 md:mt-20 animate-float"
          >
            <div className="glass rounded-2xl p-1 max-w-2xl mx-auto border border-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <div className="rounded-xl overflow-hidden flex relative">
                <div className="flex-1 p-5 sm:p-8 flex flex-col items-center justify-center border-r border-border/20">
                  <div className="w-full aspect-square bg-muted/60 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_9px,hsl(var(--border)/0.3)_10px)] opacity-30" />
                    <span className="text-muted-foreground text-xs font-mono z-10">
                      Low-Res Input
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-3 font-mono tracking-wider uppercase">
                    Before
                  </span>
                </div>
                <div className="flex-1 p-5 sm:p-8 flex flex-col items-center justify-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-primary/15 to-secondary/15 rounded-lg flex items-center justify-center border border-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer" />
                    <span className="text-primary text-xs font-mono font-semibold z-10">
                      4× Enhanced
                    </span>
                  </div>
                  <span className="text-xs text-primary mt-3 font-mono tracking-wider uppercase">
                    After
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
