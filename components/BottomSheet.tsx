"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function BottomSheet({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while open so the page underneath doesn't drift.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 animate-fadeIn"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[440px] max-h-[88svh] flex flex-col bg-white rounded-t-[28px] shadow-sheet animate-slideUp"
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-line" />
        </div>
        {title && (
          <div className="px-6 pt-2 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-[22px] text-ink leading-tight">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 rounded-full bg-surface text-muted flex items-center justify-center text-base leading-none hover:text-ink transition active:scale-95"
            >
              ×
            </button>
          </div>
        )}
        <div className="overflow-y-auto no-scrollbar px-6 pb-2 flex-1">{children}</div>
        {footer && (
          <div
            className="px-6 pt-3 border-t border-line/70 bg-white"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
