import type { ReactNode } from "react";

type IconProps = { size?: number };

const S = ({ size = 20, children }: { size?: number; children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const IconSelect = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M4 3l7 17 2.5-6.5L20 11z" />
  </S>
);
export const IconPan = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-7.4-5L3 16.5a1.5 1.5 0 0 1 3-1.3" />
  </S>
);
export const IconPen = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-1.5" />
    <path d="M2 22l4-1 12-12-3-3L3 18z" />
  </S>
);
export const IconLine = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M5 19L19 5" />
  </S>
);
export const IconArrow = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M5 19L19 5M19 5h-7M19 5v7" />
  </S>
);
export const IconRect = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="4" y="6" width="16" height="12" rx="2" />
  </S>
);
export const IconEllipse = ({ size }: IconProps) => (
  <S size={size}>
    <ellipse cx="12" cy="12" rx="9" ry="7" />
  </S>
);
export const IconText = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M5 6h14M12 6v12M9 18h6" />
  </S>
);
export const IconSticky = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M4 4h16v10l-6 6H4z" />
    <path d="M20 14h-6v6" />
  </S>
);
export const IconImage = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="M21 16l-5-5L5 21" />
  </S>
);
export const IconEraser = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M16 3l5 5L10 19H5l-2-2z" />
    <path d="M9 12l5 5" />
  </S>
);
export const IconUndo = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-1" />
  </S>
);
export const IconRedo = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H9a5 5 0 0 0 0 10h1" />
  </S>
);
export const IconTrash = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </S>
);
export const IconDownload = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </S>
);
export const IconShare = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </S>
);
export const IconPlus = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M12 5v14M5 12h14" />
  </S>
);
