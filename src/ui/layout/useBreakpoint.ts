//src/ui/layout/useBreakpoint.ts
import { useEffect, useMemo, useState } from "react";

export type Breakpoint = "mobile" | "desktop";

export function useBreakpoint(): Breakpoint {
  const [w, setW] = useState<number>(() =>
    typeof window === "undefined" ? 1200 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return useMemo(() => (w >= 900 ? "desktop" : "mobile"), [w]);
}
