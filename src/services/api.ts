const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 30_000;

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

export async function enhanceImage(
  file: File,
  scaleFactor: number,
  model: string
): Promise<EnhanceResponse> {
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
  try {
    await request<HealthResponse>("/api/health", {}, 5000);
    return true;
  } catch {
    return false;
  }
}

export { ApiError };
export type { EnhanceResponse };
