"use client";

export default function SuccessTick() {
  return (
    <div className="relative h-20 w-20 mx-auto">
      <span className="absolute inset-0 rounded-full bg-accent/20 animate-ringExpand" />
      <span className="absolute inset-0 rounded-full bg-accent flex items-center justify-center animate-pop">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path
            d="M8 17.5l6 6 12-12"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="48"
            strokeDashoffset="48"
            className="animate-tickDraw"
          />
        </svg>
      </span>
    </div>
  );
}
