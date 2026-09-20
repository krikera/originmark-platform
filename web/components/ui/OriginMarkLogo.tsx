import React from "react";

export interface OriginMarkLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  accentColor?: string;
  strokeWidth?: number;
  className?: string;
  monochrome?: boolean;
}

export const OriginMarkLogo: React.FC<OriginMarkLogoProps> = ({
  size = 24,
  accentColor = "#3ecf8e",
  strokeWidth = 2.5,
  className = "",
  monochrome = false,
  ...props
}) => {
  const accent = monochrome ? "currentColor" : accentColor;

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="OriginMark Logo"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {/* Outer Origin Ring (The Genesis Perimeter / Provenance Circle) */}
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* Inner Signature Mark (The Cryptographic M) */}
      <path
        d="M10 21V12.5L16 17.5L22 12.5V21"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Cryptographic Anchor Node (Genesis verification diamond at coordinate junction) */}
      <rect
        x="14"
        y="15.5"
        width="4"
        height="4"
        rx="0.5"
        transform="rotate(45 16 17.5)"
        fill={accent}
      />
    </svg>
  );
};

export default OriginMarkLogo;
