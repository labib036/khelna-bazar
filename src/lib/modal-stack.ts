"use client";

import { useEffect, useRef, useState, useId } from "react";

export interface ModalEntry {
  id: string;
  close: () => void;
  triggerElement?: HTMLElement | null;
}

const modalStack: ModalEntry[] = [];

export function pushModalEntry(entry: ModalEntry, baseZIndex: number = 50): number {
  modalStack.push(entry);
  return baseZIndex + (modalStack.length - 1) * 10;
}

export function popModalEntry(id: string): void {
  const idx = modalStack.findIndex((m) => m.id === id);
  if (idx !== -1) {
    modalStack.splice(idx, 1);
  }
}

export function handleGlobalEscape(): boolean {
  if (modalStack.length > 0) {
    const topModal = modalStack[modalStack.length - 1];
    if (topModal && typeof topModal.close === "function") {
      topModal.close();
      return true;
    }
  }
  return false;
}

export function getModalStackCount(): number {
  return modalStack.length;
}

export function clearModalStack(): void {
  modalStack.length = 0;
}

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && modalStack.length > 0) {
      e.stopPropagation();
      e.preventDefault();
      handleGlobalEscape();
    }
  });
}

export function useAccessibleModal({
  isOpen,
  onClose,
  initialFocusRef,
  baseZIndex = 50,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  baseZIndex?: number;
}) {
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-desc`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const [zIndex, setZIndex] = useState(baseZIndex);

  useEffect(() => {
    if (!isOpen) return;

    // Capture the trigger element before opening
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      triggerElementRef.current = document.activeElement;
    }

    // Register into modal stack
    const entry: ModalEntry = {
      id: modalId,
      close: onClose,
      triggerElement: triggerElementRef.current,
    };
    const calculatedZIndex = pushModalEntry(entry, baseZIndex);
    setZIndex(calculatedZIndex);

    // Focus initial element or first focusable
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          containerRef.current.focus();
        }
      }
    }, 50);

    // Keydown listener for focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      clearTimeout(timer);
      if (container) {
        container.removeEventListener("keydown", handleKeyDown);
      }

      // Remove from modal stack
      popModalEntry(modalId);

      // Restore focus to original trigger element
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
        setTimeout(() => {
          triggerElementRef.current?.focus();
        }, 10);
      }
    };
  }, [isOpen, onClose, modalId, baseZIndex, initialFocusRef]);

  return {
    modalId,
    titleId,
    descriptionId,
    containerRef,
    zIndex,
  };
}
