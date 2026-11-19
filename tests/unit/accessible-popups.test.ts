import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  pushModalEntry,
  popModalEntry,
  handleGlobalEscape,
  getModalStackCount,
  clearModalStack,
} from "@/lib/modal-stack";

describe("F-23: Accessible Popups & Modal Stack Management", () => {
  beforeEach(() => {
    clearModalStack();
    vi.clearAllMocks();
  });

  it("calculates stacked z-index dynamically to prevent nested modal occlusion", () => {
    const close1 = vi.fn();
    const close2 = vi.fn();
    const close3 = vi.fn();

    const zIndex1 = pushModalEntry({ id: "drawer-cart", close: close1 }, 50);
    expect(zIndex1).toBe(50);
    expect(getModalStackCount()).toBe(1);

    const zIndex2 = pushModalEntry({ id: "dialog-address", close: close2 }, 50);
    expect(zIndex2).toBe(60);
    expect(getModalStackCount()).toBe(2);

    const zIndex3 = pushModalEntry({ id: "dialog-confirm", close: close3 }, 50);
    expect(zIndex3).toBe(70);
    expect(getModalStackCount()).toBe(3);

    // Each nested modal has strictly higher z-index than its parent
    expect(zIndex3).toBeGreaterThan(zIndex2);
    expect(zIndex2).toBeGreaterThan(zIndex1);
  });

  it("dispatches global Escape strictly to the topmost modal in LIFO order", () => {
    const closeBottom = vi.fn();
    const closeMiddle = vi.fn();
    const closeTop = vi.fn();

    pushModalEntry({ id: "modal-bottom", close: closeBottom });
    pushModalEntry({ id: "modal-middle", close: closeMiddle });
    pushModalEntry({ id: "modal-top", close: closeTop });

    expect(getModalStackCount()).toBe(3);

    // 1st Escape: Only topmost should close
    const handled1 = handleGlobalEscape();
    expect(handled1).toBe(true);
    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeMiddle).not.toHaveBeenCalled();
    expect(closeBottom).not.toHaveBeenCalled();

    // Pop the closed top modal
    popModalEntry("modal-top");
    expect(getModalStackCount()).toBe(2);

    // 2nd Escape: Now middle should close
    const handled2 = handleGlobalEscape();
    expect(handled2).toBe(true);
    expect(closeMiddle).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();

    popModalEntry("modal-middle");
    expect(getModalStackCount()).toBe(1);

    // 3rd Escape: Bottom closes
    const handled3 = handleGlobalEscape();
    expect(handled3).toBe(true);
    expect(closeBottom).toHaveBeenCalledTimes(1);

    popModalEntry("modal-bottom");
    expect(getModalStackCount()).toBe(0);

    // 4th Escape: Stack is empty, returns false
    const handled4 = handleGlobalEscape();
    expect(handled4).toBe(false);
  });
});
