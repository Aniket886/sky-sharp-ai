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

  // Simulate processing delay (2–4s)
  await delay(2000 + Math.random() * 2000);

  return {
    sr_image_url: dataUrl, // In demo mode, reuse same image
    metrics: {
      psnr: +(25 + Math.random() * 5).toFixed(2),
      ssim: +(0.78 + Math.random() * 0.15).toFixed(3),
      processing_time: +(2 + Math.random() * 2).toFixed(1),
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
    throw new ApiError("Server unavailable. Make sure the backend is running.", 0);
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
  model: string
): Promise<EnhanceResponse> {
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
