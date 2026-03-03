import { useState, useEffect, useCallback } from "react";
import { healthCheck } from "@/services/api";

const INTERVAL_MS = 30_000;

export function useHealthCheck() {
  const [connected, setConnected] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    const ok = await healthCheck();
    setConnected(ok);
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, INTERVAL_MS);
    return () => clearInterval(id);
  }, [check]);

  return { connected, recheck: check };
}
