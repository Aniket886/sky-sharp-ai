import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CloudUpload, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Enhance = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f?.type.startsWith("image/")) handleFile(f);
    },
    [handleFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleEnhance = () => {
    setProcessing(true);
    setTimeout(() => {
      navigate("/results");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Enhance</span> Your Image
          </h1>
          <p className="text-muted-foreground mb-10">
            Upload a satellite image to apply 4× ESRGAN super-resolution
          </p>

          <motion.div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            animate={{ borderColor: dragOver ? "hsl(187 100% 50%)" : "hsl(228 20% 20%)" }}
            className={`glass rounded-2xl border-2 border-dashed p-12 transition-colors cursor-pointer ${dragOver ? "border-primary" : ""}`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-xl mb-4"
                />
                <p className="text-sm text-muted-foreground font-mono">{file?.name}</p>
              </div>
            ) : (
              <div className="text-center">
                <CloudUpload className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-foreground font-medium mb-1">
                  Drop your image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, TIFF — max 20MB
                </p>
              </div>
            )}
          </motion.div>

          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Button
                onClick={handleEnhance}
                disabled={processing}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan rounded-xl px-8"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance 4×
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Enhance;
