import { motion } from "framer-motion";
import { Brain, Database, Maximize, BarChart3 } from "lucide-react";

const cards = [
  {
    icon: Brain,
    title: "Model",
    subtitle: "ESRGAN",
    detail: "Residual-in-Residual Dense Block architecture for photorealistic upscaling",
    span: "md:col-span-2",
  },
  {
    icon: Database,
    title: "Dataset",
    subtitle: "UC Merced Land Use",
    detail: "2,100 images across 21 land-use classes",
    span: "",
  },
  {
    icon: Maximize,
    title: "Scale Factor",
    subtitle: "4×",
    detail: "Quadruple resolution enhancement",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Quality Metrics",
    subtitle: "PSNR > 25 dB  ·  SSIM > 0.75",
    detail: "Industry-standard image quality benchmarks",
    span: "md:col-span-2",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const BentoGrid = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tech Stack & <span className="gradient-text">Model Info</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Built on cutting-edge deep learning architecture
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {cards.map((c) => (
            <motion.div
              key={c.title}
              variants={item}
              whileHover={{ y: -4 }}
              className={`glass rounded-2xl p-6 group hover:border-primary/30 transition-all ${c.span}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
                    {c.title}
                  </p>
                  <p className="text-lg font-semibold mb-1 font-mono">{c.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{c.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGrid;
