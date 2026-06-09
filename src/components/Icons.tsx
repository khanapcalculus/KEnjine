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
export const IconHighlighter = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M9 11l-4 4v4h4l4-4" />
    <path d="M13 7l4 4 4-4-4-4z" />
    <path d="M11 9l4 4" />
  </S>
);
export const IconTriangle = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M12 4l9 16H3z" />
  </S>
);
export const IconDiamond = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M12 3l8 9-8 9-8-9z" />
  </S>
);
export const IconStar = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8z" />
  </S>
);
export const IconConnector = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="5" cy="6" r="2" />
    <circle cx="19" cy="18" r="2" />
    <path d="M7 6h6a3 3 0 0 1 3 3v7" />
  </S>
);
export const IconMindmap = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="9" y="10" width="6" height="4" rx="1" />
    <rect x="2" y="3" width="5" height="3" rx="1" />
    <rect x="2" y="18" width="5" height="3" rx="1" />
    <rect x="17" y="10" width="5" height="3" rx="1" />
    <path d="M9 12H7.5M7 4.5C7 7 9 9 9 11M7 19.5c0-2.5 2-4 2-6.5M15 12h2" />
  </S>
);
export const IconFrame = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M4 7h16M4 17h16M7 4v16M17 4v16" />
  </S>
);
export const IconVideo = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="2" y="6" width="13" height="12" rx="2" />
    <path d="M15 10l6-3v10l-6-3z" />
  </S>
);
export const IconAudio = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M11 5L6 9H3v6h3l5 4z" />
    <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
  </S>
);
export const IconEmbed = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 9l-2 3 2 3M15 9l2 3-2 3" />
  </S>
);
export const IconLaser = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </S>
);
export const IconGrid = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </S>
);
export const IconSun = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </S>
);
export const IconMoon = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </S>
);
export const IconPresent = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20l4-4 4 4" />
  </S>
);
export const IconPhone = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" />
  </S>
);
export const IconChevron = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M9 6l6 6-6 6" />
  </S>
);
export const IconShapes = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="3" y="11" width="9" height="9" rx="1" />
    <path d="M12 3l5 7H7z" />
  </S>
);
export const IconClose = ({ size }: IconProps) => (
  <S size={size}>
    <path d="M6 6l12 12M18 6L6 18" />
  </S>
);
