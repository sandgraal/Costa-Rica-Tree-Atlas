"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Image with loading placeholder
 */
export function ProgressiveImage(props: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <Image
        {...props}
        alt={props.alt}
        onLoad={() => {
          setIsLoading(false);
        }}
        className={`${props.className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
      />
    </div>
  );
}
