"use client";

import React from "react";
import { SafeImage } from "@/components/SafeImage";

export interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  credit?: string;
  license?: string;
  sourceUrl?: string;
  slug?: string;
  index?: number;
  onClick?: () => void;
}

export function ImageCard({
  src,
  alt,
  title,
  credit,
  license,
  sourceUrl,
  slug: _slug,
  index: _index,
  onClick,
}: ImageCardProps) {
  const isRemote = src.startsWith("http");

  const content = (
    <figure className="bg-card rounded-xl overflow-hidden border border-border not-prose group">
      <div className="aspect-[4/3] bg-muted relative">
        <SafeImage
          src={src}
          alt={alt}
          fill
          className={`object-cover ${onClick ? "group-hover:scale-105 transition-transform duration-300" : ""}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
          unoptimized={isRemote}
        />
        {onClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
          </div>
        )}
      </div>
      <figcaption className="p-3 text-sm">
        {title && <p className="font-medium mb-1">{title}</p>}
        {credit && (
          <p className="text-muted-foreground text-xs">
            📷 {credit}
            {license && <span className="ml-2 opacity-75">({license})</span>}
          </p>
        )}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-1 inline-block"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            View source ↗
          </a>
        )}
      </figcaption>
    </figure>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
      >
        {content}
      </button>
    );
  }

  return content;
}
