/**
 * Small, plain line icons drawn inline so the app needs no icon dependency.
 * They inherit the surrounding text colour.
 */
type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 20 20",
  "aria-hidden": true,
};

export function HomeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 8.5 10 3.5l6.5 5V16a.5.5 0 0 1-.5.5h-4v-5h-4v5H4a.5.5 0 0 1-.5-.5Z" />
    </svg>
  );
}

export function BoardIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3.5" width="4.5" height="13" rx="1" />
      <rect x="9" y="3.5" width="4.5" height="9" rx="1" />
      <rect x="15" y="3.5" width="2" height="6" rx="1" />
    </svg>
  );
}

export function BriefcaseIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.75" y="6.5" width="14.5" height="9.5" rx="1.5" />
      <path d="M7.25 6.5V5a1.25 1.25 0 0 1 1.25-1.25h3A1.25 1.25 0 0 1 12.75 5v1.5M2.75 10.5h14.5" />
    </svg>
  );
}

export function ChartIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 16.5h13M6 16.5V9M10 16.5V4.5M14 16.5v-5" />
    </svg>
  );
}

export function TableIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <path d="M3 8h14M3 12h14M8 8v8" />
    </svg>
  );
}

export function HashIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 3.5 5.5 16.5M13 3.5 11.5 16.5M3.5 7.5h13M3 12.5h13" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
    </svg>
  );
}

export function SunIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="3.25" />
      <path d="M10 2.5v1.75M10 15.75v1.75M2.5 10h1.75M15.75 10h1.75M4.7 4.7l1.25 1.25M14.05 14.05l1.25 1.25M15.3 4.7l-1.25 1.25M5.95 14.05 4.7 15.3" />
    </svg>
  );
}

export function MoonIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M16 12.4A6.5 6.5 0 0 1 7.6 4a6.5 6.5 0 1 0 8.4 8.4Z" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M11.5 5.5 7 10l4.5 4.5" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8.5 5.5 13 10l-4.5 4.5" />
    </svg>
  );
}

export function LogoutIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8 16.5H4.5A.5.5 0 0 1 4 16V4a.5.5 0 0 1 .5-.5H8M12 6.5 15.5 10 12 13.5M7.5 10h8" />
    </svg>
  );
}
