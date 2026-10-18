import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Handcrafted vector logo for topfastfood.lol
 * Pure SVG - zero AI artifacts, razor-sharp on Retina screens, authentic 1960s drive-in diner aesthetic.
 */
export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", size = 32 }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-lg bg-[#167A75] shadow-xs border border-[#12625E] overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[82%] h-[82%]"
      >
        {/* Top Bun - Warm Golden Marquee Amber */}
        <path
          d="M7 14C7 8.47715 11.9249 4 18 4C24.0751 4 29 8.47715 29 14C29 14.5523 28.5523 15 28 15H8C7.44772 15 7 14.5523 7 14Z"
          fill="#FFB000"
        />

        {/* Sesame Seeds */}
        <ellipse cx="14" cy="9.5" rx="1.2" ry="0.6" transform="rotate(-15 14 9.5)" fill="#FFFFFF" fillOpacity="0.8" />
        <ellipse cx="18" cy="8" rx="1.2" ry="0.6" fill="#FFFFFF" fillOpacity="0.8" />
        <ellipse cx="22" cy="9.5" rx="1.2" ry="0.6" transform="rotate(15 22 9.5)" fill="#FFFFFF" fillOpacity="0.8" />

        {/* Relish / Lettuce Layer - Crisp Pickle Relish Green */}
        <path
          d="M6.5 17.5C7.5 16.5 8.5 16.5 9.5 17.5C10.5 18.5 11.5 18.5 12.5 17.5C13.5 16.5 14.5 16.5 15.5 17.5C16.5 18.5 17.5 18.5 18.5 17.5C19.5 16.5 20.5 16.5 21.5 17.5C22.5 18.5 23.5 18.5 24.5 17.5C25.5 16.5 26.5 16.5 27.5 17.5C28.5 18.5 29.5 18.5 29.5 17.5"
          stroke="#48A826"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Melted Cheese Slice - Golden Sharp Angle */}
        <path
          d="M8 18.5H28L18 24.5L8 18.5Z"
          fill="#FFC72C"
        />

        {/* Beef Patty - Rich Diner Navy/Brown */}
        <rect
          x="7"
          y="23"
          width="22"
          height="4.5"
          rx="2.25"
          fill="#1E2A3A"
        />

        {/* Bottom Bun - Golden Amber with rounded base */}
        <path
          d="M8 29.5C8 29.5 8 32 18 32C28 32 28 29.5 28 29.5H8Z"
          fill="#FFB000"
        />
        <rect
          x="8"
          y="28.5"
          width="20"
          height="2"
          rx="1"
          fill="#E69E00"
        />
      </svg>
    </div>
  );
};
