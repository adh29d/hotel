"use client";

import { useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// Centered modal dialog with a blurred dark backdrop. Pinned to the viewport
// (fixed) so it stays in place no matter how tall the page content grows.
export default function Modal({ open, onClose, children }: Props) {
  // Body scroll lock — only depends on `open` so parent re-renders that
  // create a new onClose reference don't toggle the lock counter.
  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-md animate-fadeIn"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[360px] max-h-[88svh] overflow-y-auto overscroll-contain bg-white rounded-3xl shadow-xl animate-pop"
      >
        {children}
      </div>
    </div>
  );
}
