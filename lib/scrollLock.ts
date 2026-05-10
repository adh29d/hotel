// Counter-based body scroll lock. Multiple overlays (BottomSheet, Modal) can
// stack arbitrarily — body stays locked while any of them are open and is
// restored to its pre-lock value when the last one closes. This avoids the
// races you get if each overlay independently captures `prev` and restores
// it on cleanup, since cleanups can interleave when overlays nest.

let lockCount = 0;
let savedOverflow = "";

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow;
    savedOverflow = "";
  }
}
