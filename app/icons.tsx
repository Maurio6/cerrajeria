import type { ServiceSlug } from "@/lib/site";

// Iconos de línea propios (24x24), heredan el color del texto.
type P = { className?: string };
const base = (className = "size-6") => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

export const KeyIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="7.5" cy="12" r="4" /><circle cx="6.5" cy="12" r="1" /><path d="M11.5 12H21l-1.5 2-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5" /></svg>
);
export const CylinderIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><path d="M12 7.5v9" /></svg>
);
export const LockIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><path d="M12 14.5v2.5" /></svg>
);
export const CarIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M3.5 16.5v-3.2l2-4.6A2 2 0 0 1 7.3 7.5h9.4a2 2 0 0 1 1.8 1.2l2 4.6v3.2" /><path d="M2.5 16.5h19" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /><path d="M5.5 13h13" /></svg>
);
export const MotoIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="5.5" cy="16" r="3" /><circle cx="18.5" cy="16" r="3" /><path d="M5.5 16 9 10h5l2.5 6M14 10l1.5-3H18M9 10l-1-2H6" /></svg>
);
export const DoorIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M3.5 21h17" /><circle cx="15" cy="12.5" r="1" /></svg>
);
export const SearchKeyIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20.5 20.5-5.3-5.3M8 10.5h5M11.5 10.5v2" /></svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 5.7a2 2 0 0 1 2-2.2Z" /></svg>
);
export const PinIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>
);
export const SunIcon =({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>
);
export const MoonIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
);
export const PlusIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 5v14M5 12h14" /></svg>
);
export const WhatsAppIcon = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.7-.1 1.3Z" />
  </svg>
);

export const Logo = ({ className = "size-9" }: P) => (
  <svg viewBox="0 0 36 36" className={className} aria-hidden>
    <rect width="36" height="36" rx="9" fill="var(--brass)" />
    <circle cx="18" cy="14.5" r="5" fill="#15202b" />
    <path d="M15.6 17.5 14 27h8l-1.6-9.5Z" fill="#15202b" />
  </svg>
);

export const serviceIcons: Record<ServiceSlug, (p: P) => React.JSX.Element> = {
  llaves: KeyIcon,
  guardas: CylinderIcon,
  instalacion: LockIcon,
  carros: CarIcon,
  motos: MotoIcon,
};
