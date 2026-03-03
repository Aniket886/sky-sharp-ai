import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload,
  Sparkles,
  Loader2,
  X,
  Rocket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const Enhance = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scaleFactor, setScaleFactor] = useState("4");
  const [model, setModel] = useState("esrgan");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateFile = (f: File): boolean => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PNG or JPG image.",
      });
      return false;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum file size is ${MAX_SIZE_MB}MB.`,
      });
      return false;
    }
    return true;
  };

  const handleFile = useCallback(
    (f: File) => {
      if (!validateFile(f)) return;
      setFile(f);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    },
    [toast]
  );

  const removeFile = () => {
    setFile(null);
    setPreview(null);
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

  const [startTime, setStartTime] = useState(0);

  const handleEnhance = () => {
    if (!file || !preview) return;
    setProcessing(true);
    setProgress(0);
    setStartTime(Date.now());
  };

  // Simulated progress
  useEffect(() => {
    if (!processing) return;
    const duration = 3500 + Math.random() * 1500; // 3.5–5s
    const interval = 50;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out curve for natural feel
      const raw = step / steps;
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgress(Math.min(Math.round(eased * 100), 100));

      if (step >= steps) {
        clearInterval(timer);
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        setTimeout(() => {
          navigate("/results", {
            state: {
              originalImage: preview,
              scaleFactor,
              model,
              fileName: file?.name,
              fileSize: file?.size,
              processingTime,
              timestamp: new Date().toISOString(),
            },
          });
        }, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [processing, navigate, preview, scaleFactor, model, file]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto px-4 pt-28 pb-20"
      >
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              <span className="gradient-text">Enhance</span> Your Image
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload a satellite image and let AI do the heavy lifting
            </p>
          </div>

          {/* Upload Zone */}
          <motion.div
            layout
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
            className={`relative glass rounded-2xl border-2 border-dashed transition-all duration-300 ${
              dragOver
                ? "border-primary glow-cyan"
                : preview
                ? "border-border/50"
                : "border-border hover:border-primary/50 cursor-pointer"
            } ${!preview ? "p-16" : "p-6"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={onFileChange}
            />

            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{
                      y: { repeat: Infinity, repeatType: "reverse", duration: 0.6 },
                    }}
                    className="inline-flex"
                  >
                    <CloudUpload className="w-14 h-14 text-primary mx-auto mb-5" />
                  </motion.div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    Drag & drop a satellite image here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse — supports PNG, JPG, JPEG (max 10MB)
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative flex flex-col items-center"
                >
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-72 rounded-xl border border-border/50"
                    />
                    {!processing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 font-mono">
                    {file?.name}
                    <span className="ml-2 text-xs">
                      ({((file?.size ?? 0) / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Controls */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 md:p-8 mt-6"
              >
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Scale Factor */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Scale Factor
                    </Label>
                    <RadioGroup
                      value={scaleFactor}
                      onValueChange={setScaleFactor}
                      disabled={processing}
                      className="flex gap-3"
                    >
                      {["2", "4"].map((v) => (
                        <Label
                          key={v}
                          htmlFor={`scale-${v}`}
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl border cursor-pointer transition-all ${
                            scaleFactor === v
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/30 text-muted-foreground"
                          } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <RadioGroupItem value={v} id={`scale-${v}`} />
                          <span className="font-mono font-semibold">{v}×</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Model Selector */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Model
                    </Label>
                    <Select
                      value={model}
                      onValueChange={setModel}
                      disabled={processing}
                    >
                      <SelectTrigger className="rounded-xl bg-muted/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="esrgan">ESRGAN (Default)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhance Button */}
                <Button
                  onClick={handleEnhance}
                  disabled={processing}
                  size="lg"
                  className={`w-full rounded-xl text-base font-bold py-6 transition-all ${
                    processing
                      ? "bg-muted text-muted-foreground"
                      : "btn-gradient text-primary-foreground shimmer glow-cyan"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Enhance Image <Rocket className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                <AnimatePresence>
                  {processing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5"
                    >
                      <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
                        <span>Enhancing with {model.toUpperCase()}...</span>
                        <span className="text-primary">{progress}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full btn-gradient"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Enhance;
