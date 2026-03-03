import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  ArrowLeft,
  BarChart3,
  Columns2,
  SlidersHorizontal,
  Clock,
  Maximize,
  Search,
  ImageIcon,
  Activity,
  Gauge,
} from "lucide-react";
import { Link, useLocation, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ImageLightbox from "@/components/ImageLightbox";
import ResultsSlider from "@/components/ResultsSlider";
import RadialMetric from "@/components/RadialMetric";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LocationState {
  originalImage?: string;
  scaleFactor?: string;
  model?: string;
  fileName?: string;
  fileSize?: number;
  processingTime?: string;
  timestamp?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Results = () => {
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const {
    originalImage,
    scaleFactor = "4",
    model = "esrgan",
    fileName = "image.png",
    fileSize = 0,
    processingTime = "3.2",
    timestamp,
  } = state;

  const [viewMode, setViewMode] = useState<"side" | "slider">("side");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showBicubic, setShowBicubic] = useState(false);

  // Simulated metrics
  const metrics = useMemo(
    () => ({
      psnr: (25 + Math.random() * 4).toFixed(1),
      ssim: (0.75 + Math.random() * 0.15).toFixed(2),
    }),
    []
  );

  const scale = parseInt(scaleFactor);
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1);
  const enhancedSizeMB = (fileSize * 1.8 / 1024 / 1024).toFixed(1);
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString()
    : new Date().toLocaleString();

  // Empty state
  if (!originalImage) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="container mx-auto px-4 pt-28 pb-20"
        >
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              No image to display
            </h1>
            <p className="text-muted-foreground mb-8">
              Upload and enhance a satellite image first to see your results here.
            </p>
            <Button
              asChild
              size="lg"
              className="btn-gradient text-primary-foreground glow-cyan rounded-xl px-8"
            >
              <Link to="/enhance">Go to Enhance Page</Link>
            </Button>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = originalImage;
    link.download = `enhanced_${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ImageLightbox
        src={lightboxSrc || ""}
        alt="Zoomed image"
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 pt-28 pb-20"
      >
        <div className="max-w-[960px] mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              <span className="gradient-text">Enhancement</span> Results
            </h1>
            <p className="text-muted-foreground">
              Your image has been upscaled {scaleFactor}× using{" "}
              {model.toUpperCase()}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setViewMode("side")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === "side"
                  ? "glass border-primary/40 text-primary glow-cyan-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns2 className="w-4 h-4" /> Side-by-Side
            </button>
            <button
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === "slider"
                  ? "glass border-primary/40 text-primary glow-cyan-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Slider
            </button>
          </div>

          {/* Comparison Section */}
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "side" ? (
              <div
                className={`grid gap-4 ${
                  showBicubic ? "md:grid-cols-3" : "md:grid-cols-2"
                }`}
              >
                {/* Original */}
                <div
                  className="glass rounded-2xl p-3 group cursor-zoom-in"
                  onClick={() => setLightboxSrc(originalImage)}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full aspect-square object-contain bg-muted/40 rounded-xl transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-destructive/20 border border-destructive/30 text-xs font-mono text-destructive-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      Original (Low-Res)
                    </div>
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                      <Search className="w-8 h-8 text-foreground/0 group-hover:text-foreground/60 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Enhanced */}
                <div
                  className="glass rounded-2xl p-3 group cursor-zoom-in"
                  onClick={() => setLightboxSrc(originalImage)}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={originalImage}
                      alt="Enhanced"
                      className="w-full aspect-square object-contain bg-muted/20 rounded-xl transition-transform group-hover:scale-[1.02]"
                      style={{ filter: "contrast(1.05) saturate(1.1)" }}
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Enhanced (Super-Res)
                    </div>
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                      <Search className="w-8 h-8 text-foreground/0 group-hover:text-foreground/60 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Bicubic (optional) */}
                {showBicubic && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-3 group cursor-zoom-in"
                    onClick={() => setLightboxSrc(originalImage)}
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={originalImage}
                        alt="Bicubic"
                        className="w-full aspect-square object-contain bg-muted/30 rounded-xl transition-transform group-hover:scale-[1.02]"
                        style={{ filter: "blur(0.5px)" }}
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Bicubic Interpolation
                      </div>
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                        <Search className="w-8 h-8 text-foreground/0 group-hover:text-foreground/60 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <ResultsSlider
                originalSrc={originalImage}
                enhancedSrc={originalImage}
              />
            )}
          </motion.div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <RadialMetric
              value={parseFloat(metrics.psnr)}
              max={40}
              label="PSNR"
              displayValue={`${metrics.psnr} dB`}
              color="cyan"
              icon={<Activity className="w-5 h-5" />}
              delay={0.1}
            />
            <RadialMetric
              value={parseFloat(metrics.ssim)}
              max={1}
              label="SSIM"
              displayValue={metrics.ssim}
              color="violet"
              icon={<Gauge className="w-5 h-5" />}
              delay={0.2}
            />
            <RadialMetric
              value={parseFloat(processingTime)}
              max={10}
              label="Processing Time"
              displayValue={`${processingTime}s`}
              color="cyan"
              icon={<Clock className="w-5 h-5" />}
              delay={0.3}
            />
            <RadialMetric
              value={scale}
              max={8}
              label="Scale Factor"
              displayValue={`${scaleFactor}×`}
              color="violet"
              icon={<Maximize className="w-5 h-5" />}
              delay={0.4}
            />
          </div>

          {/* Image Details Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Accordion type="single" collapsible>
              <AccordionItem
                value="details"
                className="glass rounded-2xl border-border/50 px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                  Image Details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid md:grid-cols-2 gap-4 pb-4">
                    <div className="space-y-3">
                      <DetailRow
                        label="Original Dimensions"
                        value="256 × 256 px"
                      />
                      <DetailRow
                        label="Enhanced Dimensions"
                        value={`${256 * scale} × ${256 * scale} px`}
                      />
                      <DetailRow label="Original File Size" value={`${fileSizeMB} MB`} />
                    </div>
                    <div className="space-y-3">
                      <DetailRow
                        label="Enhanced File Size"
                        value={`~${enhancedSizeMB} MB`}
                      />
                      <DetailRow
                        label="Model"
                        value={model.toUpperCase()}
                      />
                      <DetailRow label="Processed At" value={formattedTime} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            <Button
              onClick={handleDownload}
              size="lg"
              className="btn-gradient text-primary-foreground glow-cyan rounded-xl px-8 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" /> Download Enhanced Image
            </Button>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="rounded-xl"
            >
              <Link to="/enhance">
                <ArrowLeft className="w-4 h-4 mr-2" /> Enhance Another
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl"
              onClick={() => setShowBicubic((v) => !v)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showBicubic ? "Hide Bicubic" : "Compare with Bicubic"}
            </Button>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono text-foreground">{value}</span>
  </div>
);

export default Results;
