import { motion } from "framer-motion";
import { Download, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface LocationState {
  originalImage?: string;
  scaleFactor?: string;
  model?: string;
  fileName?: string;
}

const Results = () => {
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const { originalImage, scaleFactor = "4", fileName } = state;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Enhanced</span> Result
          </h1>
          <p className="text-muted-foreground mb-10">
            Your satellite image has been upscaled {scaleFactor}× using ESRGAN
          </p>

          <div className="glass rounded-2xl p-1.5 mb-8">
            <div className="rounded-xl overflow-hidden flex">
              <div className="flex-1 bg-muted/50 p-8 flex flex-col items-center justify-center border-r border-border/30">
                {originalImage ? (
                  <img src={originalImage} alt="Original" className="max-h-48 rounded-lg" />
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center max-w-[200px]">
                    <span className="text-muted-foreground text-sm font-mono">Original</span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground mt-3 font-mono">
                  Before {fileName && `· ${fileName}`}
                </span>
              </div>
              <div className="flex-1 bg-muted/30 p-8 flex flex-col items-center justify-center">
                {originalImage ? (
                  <img
                    src={originalImage}
                    alt="Enhanced"
                    className="max-h-48 rounded-lg border border-primary/20"
                    style={{ imageRendering: "auto" }}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center border border-primary/20 max-w-[200px]">
                    <span className="text-primary text-sm font-mono">Enhanced</span>
                  </div>
                )}
                <span className="text-xs text-primary mt-3 font-mono">After ({scaleFactor}×)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" asChild className="rounded-xl">
              <Link to="/enhance">
                <ArrowLeft className="w-4 h-4 mr-2" /> Try Another
              </Link>
            </Button>
            <Button
              size="lg"
              className="btn-gradient text-primary-foreground glow-cyan rounded-xl px-8"
            >
              <Download className="w-4 h-4 mr-2" /> Download Enhanced
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Results;
