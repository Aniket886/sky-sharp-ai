import { motion } from "framer-motion";
import { CloudUpload, Sparkles, Download } from "lucide-react";

const steps = [
  {
    icon: CloudUpload,
    title: "Upload",
    description: "Upload a low-res satellite image",
    step: 1,
  },
  {
    icon: Sparkles,
    title: "Enhance",
    description: "AI processes it through ESRGAN",
    step: 2,
  },
  {
    icon: Download,
    title: "Download",
    description: "Get your 4× enhanced image",
    step: 3,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const HowItWorks = () => {
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
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three simple steps to transform your satellite imagery
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={item}
              className="glass rounded-2xl p-8 text-center group hover:border-primary/30 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-5 group-hover:glow-cyan-sm transition-shadow">
                <s.icon className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono mb-3">
                Step {s.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
