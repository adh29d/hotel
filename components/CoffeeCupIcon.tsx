export default function CoffeeCupIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 9h14v5.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 4 14.5V9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18 11h2a2 2 0 1 1 0 4h-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.5c-.6 1 .6 2 0 3M12 3.5c-.6 1 .6 2 0 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
