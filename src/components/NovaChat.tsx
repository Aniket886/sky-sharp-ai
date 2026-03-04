import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Trash2, Send, Minus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useIsMobile } from "@/hooks/use-mobile";
import "./NovaChat.css";

type Msg = { role: "user" | "assistant"; content: string; ts: number };

const STARTERS = [
  "How does TerraLens enhance satellite imagery?",
  "What is ESRGAN and why use it for satellites?",
  "How can I analyze land use with TerraLens?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nova-chat`;

export default function NovaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Auto-dismiss tooltip
  useEffect(() => {
    const seen = sessionStorage.getItem("nova-seen");
    if (!seen) {
      setShowTooltip(true);
      const t = setTimeout(() => {
        setShowTooltip(false);
        sessionStorage.setItem("nova-seen", "1");
      }, 4000);
      return () => clearTimeout(t);
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");

      const userMsg: Msg = { role: "user", content: trimmed, ts: Date.now() };
      const history = [...messages, userMsg];
      setMessages(history);
      setLoading(true);

      let assistantText = "";

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${resp.status}`);
        }

        if (!resp.body) throw new Error("No response stream");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const upsert = (chunk: string) => {
          assistantText += chunk;
          const snapshot = assistantText;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
            }
            return [...prev, { role: "assistant", content: snapshot, ts: Date.now() }];
          });
        };

        let done = false;
        while (!done) {
          const { done: rDone, value } = await reader.read();
          if (rDone) break;
          buffer += decoder.decode(value, { stream: true });

          let nlIdx: number;
          while ((nlIdx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nlIdx);
            buffer = buffer.slice(nlIdx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(json);
              const c = parsed.choices?.[0]?.delta?.content;
              if (c) upsert(c);
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${e.message || "Something went wrong. Please try again."}`,
            ts: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => setMessages([]);

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /* ---- Render ---- */
  const panelMotion = isMobile
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
      };

  return (
    <>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !open && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed bottom-[92px] right-7 z-[9998] bg-background/90 backdrop-blur-md border border-primary/20 rounded-xl px-4 py-2 text-sm text-foreground shadow-lg"
          >
            Ask Nova ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => {
          setOpen((v) => !v);
          setShowTooltip(false);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-7 right-7 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl focus:outline-none"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-violet, 271 81% 56%)))",
        }}
        aria-label="Toggle Nova AI chat"
      >
        {/* pulse ring */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full nova-pulse-ring"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-violet, 271 81% 56%)))",
            }}
          />
        )}
        {/* online dot */}
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-background nova-online-dot" />
        )}
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}>
          {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
        </motion.span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={
              isMobile ? "fixed inset-0 z-[9998] flex flex-col" : "fixed bottom-24 right-7 z-[9998] flex flex-col"
            }
            style={
              isMobile
                ? { background: "rgba(11,15,26,0.96)", backdropFilter: "blur(20px)" }
                : {
                    width: 380,
                    height: 520,
                    background: "rgba(11,15,26,0.92)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(0,229,255,0.15)",
                    borderRadius: 20,
                    boxShadow: "0 8px 40px rgba(0,229,255,0.08), 0 2px 8px rgba(0,0,0,0.6)",
                  }
            }
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-primary/10">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-violet, 271 81% 56%)))",
                }}
              >
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">Nova</p>
                <p className="text-xs text-muted-foreground">TerraLens AI • Satellite Intelligence</p>
              </div>
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto nova-scrollbar px-4 py-3 space-y-3">
              {messages.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-violet, 271 81% 56%)))",
                    }}
                  >
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">Hey! I'm Nova ✨</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      Ask me about satellite imagery, AI enhancement, land analysis, or anything TerraLens.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="flex gap-2 max-w-[85%]">
                        {m.role === "assistant" && (
                          <span
                            className="w-5 h-5 rounded-full shrink-0 mt-1 flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-violet, 271 81% 56%)))",
                            }}
                          >
                            <Bot className="w-3 h-3 text-white" />
                          </span>
                        )}
                        <div>
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                              m.role === "user"
                                ? "bg-primary/12 border border-primary/20 text-foreground"
                                : "bg-white/[0.04] text-foreground nova-markdown"
                            }`}
                          >
                            {m.role === "assistant" ? (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    const codeStr = String(children).replace(/\n$/, "");
                                    if (match) {
                                      return (
                                        <SyntaxHighlighter
                                          style={oneDark}
                                          language={match[1]}
                                          PreTag="div"
                                          customStyle={{ borderRadius: 8, fontSize: "0.82em", margin: "6px 0" }}
                                        >
                                          {codeStr}
                                        </SyntaxHighlighter>
                                      );
                                    }
                                    return (
                                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs" {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {m.content}
                              </ReactMarkdown>
                            ) : (
                              m.content
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-1">{formatTime(m.ts)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Typing indicator */}
                  {loading && !messages.some((m) => m.role === "assistant" && m === messages[messages.length - 1]) && (
                    <div className="flex gap-2 items-center">
                      <span
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-violet, 271 81% 56%)))",
                        }}
                      >
                        <Bot className="w-3 h-3 text-white" />
                      </span>
                      <div className="flex gap-1.5 px-3 py-3">
                        <span className="w-2 h-2 rounded-full bg-primary/60 nova-dot-1" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 nova-dot-2" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 nova-dot-3" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pt-2 pb-3 border-t border-primary/10">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nova about TerraLens..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors max-h-24"
                  style={{ minHeight: 40 }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 96) + "px";
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-violet, 271 81% 56%)))",
                  }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              {input.length > 800 && <p className="text-[10px] text-amber-400 mt-1 px-1">{input.length}/800+ chars</p>}
              <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                Nova may make mistakes. Verify important info.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
