import { motion } from "framer-motion";
import { Brain, Database, Maximize, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 pt-28 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          About <span className="gradient-text">SuperSat AI</span>
        </h1>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          An AI-powered tool for satellite image super-resolution using
          state-of-the-art deep learning.
        </p>

        <div className="space-y-6">
          {[
            {
              icon: Brain,
              title: "ESRGAN Architecture",
              body: "We use Enhanced Super-Resolution Generative Adversarial Networks with Residual-in-Residual Dense Blocks (RRDB). This architecture excels at recovering fine textures and details lost in low-resolution satellite captures.",
            },
            {
              icon: Database,
              title: "Training Dataset",
              body: "The model is trained on the UC Merced Land Use dataset — 2,100 high-resolution images across 21 land-use categories including agricultural, urban, forest, and coastal regions.",
            },
            {
              icon: Maximize,
              title: "4× Super-Resolution",
              body: "Each input image is upscaled by a factor of 4 in both dimensions, producing a 16× increase in total pixel count while maintaining sharp, realistic detail.",
            },
            {
              icon: BarChart3,
              title: "Quality Assurance",
              body: "Our model achieves PSNR > 25 dB and SSIM > 0.75, meeting industry-standard benchmarks for image reconstruction quality.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
    <Footer />
  </div>
);

export default About;
