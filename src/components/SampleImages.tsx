import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

const SAMPLES = [
  { src: "/samples/sample-city.jpg", label: "City Lights" },
  { src: "/samples/sample-earth.jpg", label: "Earth View" },
  { src: "/samples/sample-terrain.jpg", label: "Terrain" },
  { src: "/test-satellite.png", label: "Urban Area" },
];

interface SampleImagesProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export default function SampleImages({ onSelect, disabled }: SampleImagesProps) {
  const handleClick = async (sample: (typeof SAMPLES)[0]) => {
    if (disabled) return;
    try {
      const res = await fetch(sample.src);
      const blob = await res.blob();
      const ext = sample.src.endsWith(".png") ? "png" : "jpg";
      const file = new File([blob], `sample-${sample.label.toLowerCase().replace(/\s/g, "-")}.${ext}`, {
        type: ext === "png" ? "image/png" : "image/jpeg",
      });
      onSelect(file);
    } catch {
      // silently fail
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Or try a sample image</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {SAMPLES.map((s) => (
          <motion.button
            key={s.label}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClick(s)}
            disabled={disabled}
            className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <img src={s.src} alt={s.label} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[11px] font-semibold text-foreground">{s.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
