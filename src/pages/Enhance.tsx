import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload,
  Loader2,
  X,
  Rocket,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { enhanceImage, ApiError } from "@/services/api";
import { useEnhance, type EnhanceResult } from "@/context/EnhanceContext";
import SampleImages from "@/components/SampleImages";

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

const Enhance = () => {
  const {
    file, preview, scaleFactor, model, status, error: apiError,
    setFile, setScaleFactor, setModel, setStatus, setError, setResult,
  } = useEnhance();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const processing = status === "uploading" || status === "processing";

  const validateFile = (f: File): boolean => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast({ variant: "destructive", title: "Invalid file type", description: "Please upload a PNG or JPG image." });
      return false;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: `Maximum file size is ${MAX_SIZE_MB}MB.` });
      return false;
    }
    return true;
  };

  const handleFile = useCallback(
    (f: File) => {
      if (!validateFile(f)) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setFile(f, e.target?.result as string);
        setStatus("idle");
        setError(null);
      };
      reader.readAsDataURL(f);
    },
    [toast, setFile, setStatus, setError]
  );

  const removeFile = () => {
    setFile(null, null);
    setStatus("idle");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleEnhance = async () => {
    if (!file || !preview) return;

    setStatus("uploading");
    setError(null);

    try {
      setStatus("processing");
      const res = await enhanceImage(file, parseInt(scaleFactor), model);

      const result: EnhanceResult = {
        srImageUrl: res.sr_image_url,
        originalImage: preview,
        metrics: res.metrics,
        originalDimensions: res.original_dimensions,
        enhancedDimensions: res.enhanced_dimensions,
        fileName: file.name,
        fileSize: file.size,
        model,
        scaleFactor,
        timestamp: new Date().toISOString(),
      };

      setResult(result);
      setStatus("complete");

      navigate("/results");
    } catch (err) {
      setStatus("error");
      const message = err instanceof ApiError ? err.message : "An unexpected error occurred.";
      setError(message);
      toast({ variant: "destructive", title: "Enhancement Failed", description: message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              <span className="gradient-text">Enhance</span> Your Image
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
              Upload a satellite image and let AI do the heavy lifting
            </p>
          </div>

          {/* Upload Zone */}
          <motion.div
            layout
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
            role="button"
            aria-label={preview ? "Image uploaded" : "Upload satellite image"}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" && !preview) fileInputRef.current?.click(); }}
            className={`relative glass rounded-2xl border-2 border-dashed transition-all duration-300 ${
              dragOver
                ? "border-primary glow-cyan"
                : preview
                ? "border-border/50"
                : "border-border hover:border-primary/50 cursor-pointer"
            } ${!preview ? "p-10 md:p-16" : "p-4 md:p-6"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={onFileChange}
              aria-label="Choose image file"
            />

            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ y: { repeat: Infinity, repeatType: "reverse", duration: 0.6 } }}
                    className="inline-flex"
                  >
                    <CloudUpload className="w-12 h-12 md:w-14 md:h-14 text-primary mx-auto mb-4 md:mb-5" />
                  </motion.div>
                  <p className="text-base md:text-lg font-medium text-foreground mb-1">
                    Drag & drop a satellite image here
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    or tap to browse — supports PNG, JPG, JPEG (max 10MB)
                  </p>
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative flex flex-col items-center">
                  <div className="relative inline-block">
                    <img src={preview} alt="Uploaded satellite image preview" className="max-h-48 md:max-h-72 rounded-xl border border-border/50" loading="lazy" />
                    {!processing && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors btn-press"
                        aria-label="Remove uploaded image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-3 font-mono">
                    {file?.name}
                    <span className="ml-2 text-xs">({((file?.size ?? 0) / 1024 / 1024).toFixed(1)} MB)</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sample images */}
          {!preview && <SampleImages onSelect={(f) => handleFile(f)} disabled={processing} />}

          {/* Controls */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-5 md:p-8 mt-5 md:mt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-6 md:mb-8">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">Scale Factor</Label>
                    <RadioGroup value={scaleFactor} onValueChange={setScaleFactor} disabled={processing} className="flex gap-3" aria-label="Scale factor">
                      {["2", "4"].map((v) => (
                        <Label
                          key={v}
                          htmlFor={`scale-${v}`}
                          className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl border cursor-pointer transition-all ${
                            scaleFactor === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30 text-muted-foreground"
                          } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <RadioGroupItem value={v} id={`scale-${v}`} />
                          <span className="font-mono font-semibold">{v}×</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">Model</Label>
                    <Select value={model} onValueChange={setModel} disabled={processing}>
                      <SelectTrigger className="rounded-xl bg-muted/50 border-border" aria-label="Select model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="esrgan">ESRGAN</SelectItem>
                        <SelectItem value="real-esrgan">Real-ESRGAN</SelectItem>
                        <SelectItem value="swinir">SwinIR</SelectItem>
                        <SelectItem value="hat">HAT</SelectItem>
                        <SelectItem value="edsr">EDSR</SelectItem>
                        <SelectItem value="gemini">✨ Gemini AI</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {model === "esrgan" && "Fast general-purpose super-resolution"}
                      {model === "real-esrgan" && "Best for real-world degraded images"}
                      {model === "swinir" && "Transformer-based, excellent detail recovery"}
                      {model === "hat" && "Hybrid attention — highest PSNR scores"}
                      {model === "edsr" && "Lightweight & fast, good baseline"}
                      {model === "gemini" && "Google Gemini AI — multimodal image enhancement"}
                    </p>
                  </div>
                </div>

                {/* Error state with retry */}
                <AnimatePresence>
                  {status === "error" && apiError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive flex items-center justify-between gap-3"
                    >
                      <span>{apiError}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEnhance}
                        className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 btn-press"
                        aria-label="Retry enhancement"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleEnhance}
                  disabled={processing}
                  size="lg"
                  aria-label={processing ? "Processing image" : "Enhance image"}
                  className={`w-full rounded-xl text-base font-bold py-5 md:py-6 transition-all btn-press ${
                    processing ? "bg-muted text-muted-foreground" : "btn-gradient text-primary-foreground shimmer glow-cyan"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {status === "uploading" ? "Uploading..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      Enhance Image <Rocket className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {processing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 md:mt-5">
                      <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
                        <span>{status === "uploading" ? "Uploading image..." : `Enhancing with ${model.toUpperCase()}...`}</span>
                        <span className="text-primary" aria-live="polite">Processing</span>
                      </div>
                      <div className="h-2 md:h-2.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-label="Processing progress">
                        <motion.div
                          className="h-full rounded-full btn-gradient"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 25, ease: "linear" }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">This may take up to 30 seconds depending on image size</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Enhance;
