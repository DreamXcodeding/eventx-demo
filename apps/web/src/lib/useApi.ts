// useApi — ดึงข้อมูลจาก API ใน real mode · mock mode คืนค่า mock ทันที (demo ไม่กระทบ)
import { useEffect, useState } from "react";
import { USE_MOCK } from "./http";

// hook เล็ก ๆ: real → fetch, mock → mockValue · reload() เพื่อโหลดซ้ำหลัง action
export function useApi<T>(fetcher: () => Promise<T>, mockValue: T, deps: unknown[] = []) {
  const [data, setData] = useState<T>(mockValue);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (USE_MOCK) return;
    let cancelled = false;
    setLoading(true); setError("");
    fetcher()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e: { message?: string }) => { if (!cancelled) setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const reload = () => setTick((n) => n + 1);
  return { data, loading, error, reload };
}
