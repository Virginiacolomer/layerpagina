const PALETTE = ["#FFE4BD", "#FBCD89", "#DBDADE", "#E6E6E6"];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function ProductImagePlaceholder({ seed }: { seed: string }) {
  const bg = PALETTE[hashString(seed) % PALETTE.length];

  return (
    <div
      className="flex aspect-square w-full items-center justify-center rounded-lg"
      style={{ backgroundColor: bg }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-1/3 w-1/3 text-brand/70"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          d="M9 3h6l1 4-4 5-4-5 1-4Z"
          strokeLinejoin="round"
        />
        <path
          d="M12 12v3M4 20c0-1.5 1.5-2 4-2s3 1 5 1 2.5-1 5-1 4 .5 4 2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
