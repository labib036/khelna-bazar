"use client";

import { useEffect } from "react";

// Reference count so multiple concurrent modals/drawers don't prematurely unlock scroll
let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

export function useLockBodyScroll(lock: boolean = true) {
  useEffect(() => {
    if (!lock || typeof document === "undefined") return;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;

      // Prevent layout shift when scrollbar disappears
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [lock]);
}
