"use client";

import { useEffect, useState } from "react";

/**
 * Hook to avoid hydration mismatch by ensuring code only runs on client after mount.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
