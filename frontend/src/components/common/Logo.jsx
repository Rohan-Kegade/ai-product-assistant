import { useId } from "react";

// ProductIQ mark: a price tag (product) with an AI sparkle punched out of it,
// on a blue-to-violet tile, plus a small companion sparkle. Keep in sync with
// public/favicon.svg.
export function LogoMark({ size = 40, className = "" }) {
  // Unique per instance so several marks on one page don't share a gradient id.
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="ProductIQ"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="8"
          y1="4"
          x2="58"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="0.55" stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="17"
        fill={`url(#${gradientId})`}
      />

      <g transform="translate(32 34) rotate(12) scale(.9) translate(-32 -34)">
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M32 9.5 L46.5 22.5 V47 a5 5 0 0 1-5 5 H22.5 a5 5 0 0 1-5-5 V22.5 Z M32 17.2 a3.4 3.4 0 1 0 0.001 0 Z M32 28.5 C32.8 35 35.7 37.9 42.5 38.8 C35.7 39.7 32.8 42.6 32 49.5 C31.2 42.6 28.3 39.7 21.5 38.8 C28.3 37.9 31.2 35 32 28.5 Z"
        />
      </g>

      <path
        fill="#fff"
        fillOpacity=".92"
        d="M50.5 8.5 C50.8 10.9 52 12.1 54.4 12.5 C52 12.9 50.8 14.1 50.5 16.5 C50.2 14.1 49 12.9 46.6 12.5 C49 12.1 50.2 10.9 50.5 8.5 Z"
      />
    </svg>
  );
}

// Mark + "ProductIQ" wordmark for dark backgrounds (the sidebar).
export function Logo({ size = 40 }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <span className="text-[19px] font-bold tracking-tight text-white">
        Product
        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          IQ
        </span>
      </span>
    </div>
  );
}
