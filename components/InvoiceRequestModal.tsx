"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultEmail: string;
  onSent?: () => void;
};

export default function InvoiceRequestModal({
  open,
  onClose,
  defaultEmail,
  onSent,
}: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setSent(false);
    }
  }, [open, defaultEmail]);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submit = () => {
    if (!valid) return;
    setSent(true);
    onSent?.();
  };

  return (
    <Modal open={open} onClose={onClose}>
      {sent ? (
        <div className="p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-accent text-white flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="mt-4 font-serif text-[20px] text-ink">Request sent</h3>
          <p className="mt-1.5 text-[13px] text-muted leading-relaxed">
            Reception will email your itemised invoice to{" "}
            <span className="text-ink">{email}</span> within 24 hours.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-2xl bg-ink text-white py-3 text-[14px] font-medium tracking-tight transition active:scale-[0.99]"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="p-6">
          <h3 className="font-serif text-[20px] text-ink">Send my itemised invoice</h3>
          <p className="mt-1.5 text-[13px] text-muted leading-relaxed">
            We&rsquo;ll email a full breakdown of your charges within 24 hours.
            Confirm or edit your address below.
          </p>
          <label className="mt-4 block text-[10px] uppercase tracking-[0.14em] text-muted">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            spellCheck={false}
            className="mt-1 w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-ink/40"
          />
          <button
            type="button"
            disabled={!valid}
            onClick={submit}
            className="mt-5 w-full rounded-2xl bg-ink text-white py-3 text-[14px] font-medium tracking-tight transition active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send invoice request
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full text-[12px] text-muted hover:text-ink transition py-1"
          >
            Cancel
          </button>
        </div>
      )}
    </Modal>
  );
}
