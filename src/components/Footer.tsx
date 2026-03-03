import { Github, Sparkles } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 py-10">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <span className="font-semibold gradient-text">🛰️ SuperSat AI</span>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs">
          <Sparkles className="w-3 h-3 text-primary" /> Built with AI
        </span>
        <a href="#" className="hover:text-foreground transition-colors">
          <Github className="w-4 h-4" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
