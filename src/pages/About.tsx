import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import {
  Brain,
  Database,
  Maximize,
  BarChart3,
  Layers,
  Cpu,
  Zap,
  Image as ImageIcon,
  ArrowRight,
  Github,
  ExternalLink,
  FileText,
  Users,
  Clock,
  Grid3X3,
  Sparkles,
  Monitor,
  Target,
  Box,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const childFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── CountUp hook ─── */
const CountUp = ({
  target,
  suffix = "",
  decimals = 1,
  delay = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
  delay?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, target, {
      duration: 1.4,
      delay,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = v.toFixed(decimals) + suffix;
      },
    });
    return controls.stop;
  }, [inView, target, suffix, decimals, delay]);

  return (
    <span ref={ref} className="font-mono font-bold">
      0{suffix}
    </span>
  );
};

/* ─── Architecture node ─── */
const archNodes = [
  {
    icon: ImageIcon,
    label: "LR Input",
    detail: "Low-resolution 64×64 satellite patch fed into the network",
  },
  {
    icon: Layers,
    label: "Conv Layer",
    detail: "Initial 3×3 convolution extracting 64 feature maps",
  },
  {
    icon: Brain,
    label: "RRDB ×16",
    detail: "16 cascaded Residual-in-Residual Dense Blocks with residual scaling (β=0.2)",
  },
  {
    icon: Grid3X3,
    label: "Pixel Shuffle ×2",
    detail: "Sub-pixel convolution for 2× spatial upsampling",
  },
  {
    icon: Grid3X3,
    label: "Pixel Shuffle ×2",
    detail: "Second 2× upsampling stage, achieving total 4× resolution",
  },
  {
    icon: Sparkles,
    label: "HR Output",
    detail: "Final 256×256 super-resolved satellite image output",
  },
];

/* ─── Training cards ─── */
const trainingCards = [
  {
    icon: Database,
    title: "Dataset",
    lines: ["UC Merced Land Use", "21 classes · 2,100 images", "256 × 256 px"],
  },
  {
    icon: Clock,
    title: "Training",
    lines: ["100–200 epochs", "Adam optimizer", "lr = 1e-4"],
  },
  {
    icon: Target,
    title: "Loss Functions",
    lines: ["Content: MSE (L2)", "Perceptual: VGG19", "Adversarial: BCE"],
  },
  {
    icon: Monitor,
    title: "Hardware",
    lines: ["Google Colab", "NVIDIA T4 GPU", "16 GB VRAM"],
  },
];

/* ─── Benchmarks ─── */
const benchmarks = [
  { metric: "PSNR", bicubic: 22.1, esrgan: 27.4, unit: " dB", max: 35 },
  { metric: "SSIM", bicubic: 0.58, esrgan: 0.82, unit: "", max: 1 },
];

/* ─── Gallery ─── */
const galleryItems = [
  { id: 1, label: "Agricultural", hue: 120 },
  { id: 2, label: "Urban", hue: 210 },
  { id: 3, label: "Forest", hue: 140 },
  { id: 4, label: "Coastal", hue: 190 },
  { id: 5, label: "Desert", hue: 35 },
  { id: 6, label: "Mountain", hue: 260 },
];

/* ─── Main Page ─── */
const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 pt-28 pb-20"
      >
        <div className="max-w-[960px] mx-auto space-y-24">
          {/* ════ 1. PROJECT OVERVIEW ════ */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="relative rounded-2xl p-[1px] overflow-hidden">
              {/* Animated gradient border */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(187 100% 50%), hsl(263 75% 52%), hsl(187 100% 50%))",
                  backgroundSize: "200% 200%",
                  animation: "shimmer 3s linear infinite",
                }}
              />
              <div className="relative bg-background rounded-2xl p-8 md:p-12">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-6">
                  About <span className="gradient-text">SuperSat AI</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  SuperSat AI uses Enhanced Super-Resolution Generative Adversarial
                  Networks (ESRGAN) to upscale low-resolution satellite imagery by
                  4×, recovering fine details critical for land-use analysis, urban
                  planning, and environmental monitoring.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ════ 2. MODEL ARCHITECTURE ════ */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={childFade}
              className="text-2xl md:text-3xl font-bold mb-2 text-center"
            >
              Model <span className="gradient-text">Architecture</span>
            </motion.h2>
            <motion.p
              variants={childFade}
              className="text-muted-foreground text-center mb-10 max-w-lg mx-auto"
            >
              The ESRGAN pipeline from input to super-resolved output
            </motion.p>

            {/* Flow diagram */}
            <motion.div
              variants={childFade}
              className="relative flex flex-wrap md:flex-nowrap items-center justify-center gap-3 md:gap-0"
            >
              {archNodes.map((node, i) => (
                <div key={i} className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.05 }}
                        className="glass rounded-xl p-4 flex flex-col items-center gap-2 min-w-[100px] cursor-default hover:border-primary/40 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <node.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-medium text-foreground text-center leading-tight">
                          {node.label}
                        </span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[240px] text-xs glass border-primary/20"
                    >
                      {node.detail}
                    </TooltipContent>
                  </Tooltip>

                  {i < archNodes.length - 1 && (
                    <div className="hidden md:flex items-center mx-1">
                      <div className="w-6 border-t border-dashed border-primary/40" />
                      <ArrowRight className="w-3.5 h-3.5 text-primary/50 -ml-1" />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* ════ 3. TRAINING DETAILS ════ */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={childFade}
              className="text-2xl md:text-3xl font-bold mb-2 text-center"
            >
              Training <span className="gradient-text">Details</span>
            </motion.h2>
            <motion.p
              variants={childFade}
              className="text-muted-foreground text-center mb-10 max-w-lg mx-auto"
            >
              How the model was trained end-to-end
            </motion.p>

            <motion.div
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {trainingCards.map((c) => (
                <motion.div
                  key={c.title}
                  variants={childFade}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-3">{c.title}</h3>
                  <ul className="space-y-1.5">
                    {c.lines.map((l, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground font-mono"
                      >
                        {l}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* ════ 4. PERFORMANCE BENCHMARKS ════ */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={childFade}
              className="text-2xl md:text-3xl font-bold mb-2 text-center"
            >
              Performance <span className="gradient-text">Benchmarks</span>
            </motion.h2>
            <motion.p
              variants={childFade}
              className="text-muted-foreground text-center mb-10 max-w-lg mx-auto"
            >
              ESRGAN vs Bicubic interpolation on standard metrics
            </motion.p>

            <motion.div variants={childFade} className="space-y-8 max-w-2xl mx-auto">
              {benchmarks.map((b) => (
                <BenchmarkBar key={b.metric} {...b} />
              ))}
            </motion.div>

            {/* Legend */}
            <motion.div
              variants={childFade}
              className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-destructive/60" />
                Bicubic
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary" />
                ESRGAN
              </span>
            </motion.div>
          </motion.section>

          {/* ════ 5. SAMPLE GALLERY ════ */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={childFade}
              className="text-2xl md:text-3xl font-bold mb-2 text-center"
            >
              Sample <span className="gradient-text">Gallery</span>
            </motion.h2>
            <motion.p
              variants={childFade}
              className="text-muted-foreground text-center mb-10 max-w-lg mx-auto"
            >
              Hover to see the super-resolved result
            </motion.p>

            <motion.div
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {galleryItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={childFade}
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl overflow-hidden group relative aspect-square cursor-pointer"
                >
                  {/* LR placeholder */}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${item.hue} 30% 20%), hsl(${item.hue} 40% 12%))`,
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-lg mx-auto mb-2 opacity-40"
                        style={{
                          background: `repeating-conic-gradient(hsl(${item.hue} 20% 25%) 0% 25%, hsl(${item.hue} 20% 18%) 0% 50%) 0 0 / 16px 16px`,
                        }}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.label} · LR
                      </span>
                    </div>
                  </div>

                  {/* SR reveal */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, hsl(${item.hue} 50% 25%), hsl(${item.hue} 60% 15%))`,
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-lg mx-auto mb-2 border border-primary/30"
                        style={{
                          background: `linear-gradient(135deg, hsl(${item.hue} 60% 35%), hsl(${item.hue} 70% 25%))`,
                        }}
                      />
                      <span className="text-xs font-mono text-primary">
                        {item.label} · SR ✨
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full glass text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    Sample #{item.id}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* ════ 6. TEAM & CREDITS ════ */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={childFade}
              className="text-2xl md:text-3xl font-bold mb-2 text-center"
            >
              Team & <span className="gradient-text">Credits</span>
            </motion.h2>
            <motion.p
              variants={childFade}
              className="text-muted-foreground text-center mb-10 max-w-lg mx-auto"
            >
              Built as a research exploration project
            </motion.p>

            <motion.div variants={stagger} className="grid md:grid-cols-3 gap-4">
              {/* Team placeholder */}
              <motion.div
                variants={childFade}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">Team</h3>
                <p className="text-sm text-muted-foreground">
                  AI / ML Research Team
                </p>
              </motion.div>

              {/* Resources */}
              <motion.div
                variants={childFade}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-3 text-center">Resources</h3>
                <ul className="space-y-2">
                  <CreditLink
                    href="https://arxiv.org/abs/1809.00219"
                    label="ESRGAN Paper (arXiv)"
                  />
                  <CreditLink
                    href="http://weegee.vision.ucmerced.edu/datasets/landuse.html"
                    label="UC Merced Dataset"
                  />
                </ul>
              </motion.div>

              {/* Source */}
              <motion.div
                variants={childFade}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Github className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">Source Code</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Open-source on GitHub
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  View Repository <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            </motion.div>
          </motion.section>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

/* ─── Benchmark Bar Sub-component ─── */
const BenchmarkBar = ({
  metric,
  bicubic,
  esrgan,
  unit,
  max,
}: {
  metric: string;
  bicubic: number;
  esrgan: number;
  unit: string;
  max: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-foreground">{metric}</span>
      </div>

      {/* Bicubic */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">Bicubic</span>
          <span className="font-mono text-destructive-foreground">
            <CountUp
              target={bicubic}
              suffix={unit}
              decimals={metric === "SSIM" ? 2 : 1}
              delay={0}
            />
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-destructive/60"
            initial={{ width: 0 }}
            animate={inView ? { width: `${(bicubic / max) * 100}%` } : {}}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ESRGAN */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">ESRGAN</span>
          <span className="font-mono text-primary">
            <CountUp
              target={esrgan}
              suffix={unit}
              decimals={metric === "SSIM" ? 2 : 1}
              delay={0.3}
            />
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={inView ? { width: `${(esrgan / max) * 100}%` } : {}}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

/* ─── Credit Link ─── */
const CreditLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </a>
  </li>
);

export default About;
