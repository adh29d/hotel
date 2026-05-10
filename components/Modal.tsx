"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// Centered modal dialog with a blurred dark backdrop. Pinned to the viewport
// (fixed) so it stays in place no matter how tall the page content grows.
export default function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
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
        className="relative w-full max-w-[360px] max-h-[88svh] overflow-y-auto bg-white rounded-3xl shadow-xl animate-pop"
      >
        {children}
      </div>
    </div>
  );
}
