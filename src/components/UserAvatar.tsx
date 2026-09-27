"use client";

import React, { useState, useEffect } from "react";

interface UserAvatarProps {
  handle: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  handle,
  size = "sm",
  className = "",
}) => {
  const clean = handle.replace(/^@/, "").trim();
  const primaryUrl = clean ? `https://unavatar.io/twitter/${clean}` : "";
  const [src, setSrc] = useState<string>(primaryUrl);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (clean) {
      setSrc(`https://unavatar.io/twitter/${clean}`);
      setHasError(false);
    }
  }, [clean]);

  if (!clean) return null;

  const sizeClasses = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    clean
  )}&background=090d0b&color=38bdf8&bold=true&size=64`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? fallbackUrl : src}
      alt={clean}
      className={`${sizeClasses} rounded-full object-cover border border-zinc-700 bg-zinc-800 inline-block flex-shrink-0 ${className}`}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
};
