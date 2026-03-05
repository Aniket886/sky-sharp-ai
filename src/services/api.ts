import { supabase } from "@/integrations/supabase/client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 30_000;

// ── Demo mode ──────────────────────────────────────────────
let _demoMode = true; // default ON so the app works without a backend

export function isDemoMode(): boolean {
  return _demoMode;
}

export function setDemoMode(on: boolean) {
  _demoMode = on;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mockEnhance(
  file: File,
  scaleFactor: number,
  _model: string
): Promise<EnhanceResponse> {
  // Read file to get a data URL we can use as both original and "enhanced"
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

  // Get real dimensions
  const dims = await new Promise<[number, number]>((resolve) => {
    const img = new Image();
    img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
    img.onerror = () => resolve([256, 256]);
    img.src = dataUrl;
  });

  // Model-specific mock metrics
  const modelProfiles: Record<string, { psnrBase: number; ssimBase: number; timeBase: number }> = {
    "real-esrgan": { psnrBase: 27, ssimBase: 0.83, timeBase: 3.0 },
  };

  const profile = modelProfiles[_model] || modelProfiles["real-esrgan"];

  // Simulate processing delay scaled by model complexity
  await delay(profile.timeBase * 800 + Math.random() * 1500);

  return {
    sr_image_url: dataUrl,
    metrics: {
      psnr: +(profile.psnrBase + Math.random() * 3).toFixed(2),
      ssim: +(profile.ssimBase + Math.random() * 0.08).toFixed(3),
      processing_time: +(profile.timeBase + Math.random() * 1.5).toFixed(1),
    },
    original_dimensions: dims,
    enhanced_dimensions: [dims[0] * scaleFactor, dims[1] * scaleFactor],
  };
}

// ── Types ──────────────────────────────────────────────────
interface EnhanceResponse {
  sr_image_url: string;
  metrics: {
    psnr: number;
    ssim: number;
    processing_time: number;
  };
  original_dimensions: [number, number];
  enhanced_dimensions: [number, number];
}

interface HealthResponse {
  status: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ── Fetch wrapper ──────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  timeout = TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const url = `${BASE_URL}${path}`;
  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    console.log(`[API] ${res.status} ${url}`);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        (body as any)?.detail ||
        (body as any)?.message ||
        friendlyError(res.status);
      throw new ApiError(message, res.status);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new ApiError("Request timed out. The server may be busy — please try again.", 408);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || "Server unavailable. Make sure the backend is running.", 0);
  } finally {
    clearTimeout(timer);
  }
}

function friendlyError(status: number): string {
  switch (status) {
    case 400: return "Invalid request — please check your image and settings.";
    case 413: return "Image too large. Please upload a smaller file.";
    case 422: return "Unsupported image format.";
    case 500: return "Processing failed on the server. Please try again.";
    case 503: return "Server is temporarily unavailable.";
    default: return `Request failed (${status}).`;
  }
}

// ── Public API ─────────────────────────────────────────────
export async function enhanceImage(
  file: File,
  scaleFactor: number,
  model: string,
  fastMode = true,
): Promise<EnhanceResponse> {
  if (model === "gemini") {
    console.log("[API] Using Gemini AI for enhancement");
    return geminiEnhance(file, scaleFactor);
  }

  if (model === "kie") {
    console.log(`[API] Using Kie AI (Nano Banana 2), fastMode=${fastMode}`);
    return kieEnhance(file, scaleFactor, fastMode);
  }

  if (model === "real-esrgan") {
    console.log("[API] Using Real-ESRGAN via Replicate for enhancement");
    return realEsrganEnhance(file, scaleFactor);
  }

  if (_demoMode) {
    console.log("[API] Demo mode — simulating enhancement");
    return mockEnhance(file, scaleFactor, model);
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("scale_factor", String(scaleFactor));
  formData.append("model", model);

  return request<EnhanceResponse>("/api/enhance", {
    method: "POST",
    body: formData,
  });
}

async function realEsrganEnhance(file: File, scaleFactor: number): Promise<EnhanceResponse> {
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

  const dims = await new Promise<[number, number]>((resolve) => {
    const img = new Image();
    img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
    img.onerror = () => resolve([256, 256]);
    img.src = dataUrl;
  });

  const { data, error } = await supabase.functions.invoke("realesrgan-enhance", {
    body: { imageBase64: dataUrl, scaleFactor },
  });

  if (error) throw new ApiError(error.message || "Real-ESRGAN enhancement failed", 500);
  if (data?.error) throw new ApiError(data.error, 500);

  const res = data as EnhanceResponse;
  if (res.original_dimensions[0] === 0) res.original_dimensions = dims;
  if (res.enhanced_dimensions[0] === 0) res.enhanced_dimensions = [dims[0] * scaleFactor, dims[1] * scaleFactor];

  return res;
}

async function geminiEnhance(file: File, scaleFactor: number): Promise<EnhanceResponse> {
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

  const dims = await new Promise<[number, number]>((resolve) => {
    const img = new Image();
    img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
    img.onerror = () => resolve([256, 256]);
    img.src = dataUrl;
  });

  const { data, error } = await supabase.functions.invoke("gemini-enhance", {
    body: { imageBase64: dataUrl, scaleFactor },
  });

  if (error) throw new ApiError(error.message || "Gemini enhancement failed", 500);
  if (data?.error) throw new ApiError(data.error, data.fallback ? 200 : 500);

  // Fill in dimensions if the edge function returned zeros
  const res = data as EnhanceResponse & { analysis?: string };
  if (res.original_dimensions[0] === 0) res.original_dimensions = dims;
  if (res.enhanced_dimensions[0] === 0) res.enhanced_dimensions = [dims[0] * scaleFactor, dims[1] * scaleFactor];

  return res;
}

async function kieEnhance(file: File, scaleFactor: number, fastMode: boolean): Promise<EnhanceResponse> {
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

  const dims = await new Promise<[number, number]>((resolve) => {
    const img = new Image();
    img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
    img.onerror = () => resolve([256, 256]);
    img.src = dataUrl;
  });

  let startData: any;
  try {
    const { data, error: startError } = await supabase.functions.invoke("kie-enhance", {
      body: { imageBase64: dataUrl, scaleFactor, fastMode },
    });

    if (startError) {
      console.warn("[KIE] Start failed, falling back to Real-ESRGAN:", startError.message);
      return realEsrganEnhance(file, scaleFactor);
    }
    if (data?.error) {
      console.warn("[KIE] Start error:", data.error, "— falling back to Real-ESRGAN");
      return realEsrganEnhance(file, scaleFactor);
    }
    startData = data;
  } catch (e: any) {
    console.warn("[KIE] Start exception, falling back to Real-ESRGAN:", e?.message);
    return realEsrganEnhance(file, scaleFactor);
  }

  const { taskId, startTime } = startData;
  if (!taskId) {
    console.warn("[KIE] No task ID, falling back to Real-ESRGAN");
    return realEsrganEnhance(file, scaleFactor);
  }

  const POLL_INTERVAL = 2000;
  const MAX_POLL_TIME = 60_000; // 1 min hard cap for both modes
  const MAX_POLL_ERRORS = 5;
  const pollStart = Date.now();
  let pollErrors = 0;

  while (Date.now() - pollStart < MAX_POLL_TIME) {
    await delay(POLL_INTERVAL);

    try {
      const { data: pollData, error: pollError } = await supabase.functions.invoke("kie-enhance", {
        body: { mode: "poll", taskId, startTime },
      });

      if (pollError) {
        pollErrors += 1;
        console.warn(`[KIE Poll] Error ${pollErrors}/${MAX_POLL_ERRORS}:`, pollError.message);
        if (pollErrors >= MAX_POLL_ERRORS) {
          console.warn("[KIE Poll] Too many errors, falling back to Real-ESRGAN");
          return realEsrganEnhance(file, scaleFactor);
        }
        continue;
      }

      pollErrors = 0;

      if (pollData?.status === "complete") {
        const res = pollData as EnhanceResponse;
        if (res.original_dimensions[0] === 0) res.original_dimensions = dims;
        if (res.enhanced_dimensions[0] === 0) res.enhanced_dimensions = [dims[0] * scaleFactor, dims[1] * scaleFactor];
        return res;
      }

      if (pollData?.status === "failed") {
        console.warn("[KIE Poll] Provider task failed, falling back to Real-ESRGAN");
        return realEsrganEnhance(file, scaleFactor);
      }
    } catch (e: any) {
      pollErrors += 1;
      console.warn(`[KIE Poll] Exception ${pollErrors}/${MAX_POLL_ERRORS}:`, e?.message);
      if (pollErrors >= MAX_POLL_ERRORS) {
        console.warn("[KIE Poll] Too many exceptions, falling back to Real-ESRGAN");
        return realEsrganEnhance(file, scaleFactor);
      }
    }
  }

  // Timeout → always fallback instead of erroring
  console.warn("[KIE Poll] Timed out after 60s, falling back to Real-ESRGAN");
  return realEsrganEnhance(file, scaleFactor);
}

export async function healthCheck(): Promise<boolean> {
  if (_demoMode) return true;
  try {
    await request<HealthResponse>("/api/health", {}, 5000);
    return true;
  } catch {
    return false;
  }
}

export { ApiError };
export type { EnhanceResponse };
