"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError" | "src"> {
  src: string;
  fallback?: "placeholder" | "hide";
}

/**
 * Image component with error handling and placeholder fallback
 * NO circular dependencies, NO API calls
 */
export function SafeImage({
  src,
  alt,
  fallback = "placeholder",
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    if (fallback === "hide") {
      return null;
    }

    // Show placeholder with tree icon
    return (
      <div
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{
          width: props.width || "100%",
          height: props.height || "100%",
        }}
      >
        <TreeIcon className="h-12 w-12 text-muted-foreground opacity-50" />
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div
          className="animate-pulse bg-muted rounded-lg"
          style={{
            width: props.width || "100%",
            height: props.height || "100%",
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        onError={() => {
          console.warn(`Failed to load image: ${src}`);
          setError(true);
        }}
        onLoad={() => setLoading(false)}
        {...props}
      />
    </>
  );
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22V8" />
      <path d="M5 12l7-10 7 10" />
      <path d="M5 12a7 7 0 0 0 14 0" />
    </svg>
  );
}
