import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { EnhanceResponse } from "@/services/api";

type ProcessingStatus = "idle" | "uploading" | "processing" | "complete" | "error";

interface EnhanceState {
  file: File | null;
  preview: string | null;
  scaleFactor: string;
  model: string;
  status: ProcessingStatus;
  error: string | null;
  result: EnhanceResult | null;
}

export interface EnhanceResult {
  srImageUrl: string;
  originalImage: string;
  metrics: { psnr: number; ssim: number; processing_time: number };
  originalDimensions: [number, number];
  enhancedDimensions: [number, number];
  fileName: string;
  fileSize: number;
  model: string;
  scaleFactor: string;
  timestamp: string;
}

interface EnhanceContextValue extends EnhanceState {
  setFile: (file: File | null, preview: string | null) => void;
  setScaleFactor: (v: string) => void;
  setModel: (v: string) => void;
  setStatus: (s: ProcessingStatus) => void;
  setError: (e: string | null) => void;
  setResult: (r: EnhanceResult | null) => void;
  reset: () => void;
}

const SESSION_KEY = "supersat_last_result";

function loadPersistedResult(): EnhanceResult | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const EnhanceContext = createContext<EnhanceContextValue | null>(null);

export function EnhanceProvider({ children }: { children: ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState("4");
  const [model, setModel] = useState("esrgan");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResultState] = useState<EnhanceResult | null>(loadPersistedResult);

  const setFile = useCallback((f: File | null, p: string | null) => {
    setFileState(f);
    setPreview(p);
  }, []);

  const setResult = useCallback((r: EnhanceResult | null) => {
    setResultState(r);
    if (r) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(r));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const reset = useCallback(() => {
    setFileState(null);
    setPreview(null);
    setStatus("idle");
    setError(null);
  }, []);

  return (
    <EnhanceContext.Provider
      value={{
        file, preview, scaleFactor, model, status, error, result,
        setFile, setScaleFactor, setModel, setStatus, setError, setResult, reset,
      }}
    >
      {children}
    </EnhanceContext.Provider>
  );
}

export function useEnhance() {
  const ctx = useContext(EnhanceContext);
  if (!ctx) throw new Error("useEnhance must be used within EnhanceProvider");
  return ctx;
}
