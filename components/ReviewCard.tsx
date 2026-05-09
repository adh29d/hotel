"use client";

import { useState } from "react";

type Stage = "rating" | "high" | "low" | "thanks";

export default function ReviewCard() {
  const [stage, setStage] = useState<Stage>("rating");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");

  const choose = (r: number) => {
    setRating(r);
    setTimeout(() => {
      setStage(r >= 4 ? "high" : "low");
    }, 350);
  };

  if (stage === "thanks") {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-card animate-fadeUp text-center">
        <div className="font-serif text-2xl text-ink">Thank you.</div>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          We hope to see you again soon.
        </p>
      </section>
    );
  }

  if (stage === "high") {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-card animate-fadeUp">
        <div className="font-serif text-xl text-ink">Thank you.</div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Would you mind sharing on Google? It helps us enormously.
        </p>
        <button
          type="button"
          onClick={() => setStage("thanks")}
          className="mt-5 w-full rounded-full bg-accent text-white py-3.5 text-[15px] font-medium tracking-wide transition active:scale-[0.99]"
        >
          Post to Google
        </button>
        <button
          type="button"
          onClick={() => setStage("thanks")}
          className="mt-2 w-full text-xs text-muted hover:text-ink transition"
        >
          Maybe later
        </button>
      </section>
    );
  }

  if (stage === "low") {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-card animate-fadeUp">
        <div className="font-serif text-xl text-ink">We&rsquo;re sorry your stay didn&rsquo;t meet expectations.</div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Your feedback goes directly to our General Manager — no one else will see it.
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Tell us what went wrong…"
          className="mt-4 w-full rounded-xl border border-line bg-bone/40 p-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:border-ink/40 transition"
        />
        <button
          type="button"
          onClick={() => setStage("thanks")}
          className="mt-4 w-full rounded-full bg-ink text-bone py-3.5 text-[15px] font-medium tracking-wide transition active:scale-[0.99]"
        >
          Send to GM
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card animate-fadeUp">
      <div className="font-serif text-xl text-ink">How was your stay?</div>
      <p className="mt-1 text-sm text-muted">A tap is all it takes.</p>
      <div className="mt-5 flex justify-between max-w-[260px] mx-auto">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = (hover || rating) >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => choose(n)}
              className="p-1.5 transition active:scale-90"
            >
              <Star filled={filled} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6l-5.4 2.8 1-6.1L3.2 10l6.1-.9L12 3.5z"
        fill={filled ? "#1F4D3C" : "transparent"}
        stroke={filled ? "#1F4D3C" : "#C8C2B6"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        style={{ transition: "fill 200ms ease, stroke 200ms ease" }}
      />
    </svg>
  );
}
