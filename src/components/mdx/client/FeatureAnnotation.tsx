"use client";

import React from "react";
import { SafeImage } from "@/components/SafeImage";

interface AnnotationPoint {
  x: number;
  y: number;
  label: string;
  description: string;
}

interface FeatureAnnotationProps {
  image: string;
  alt: string;
  annotations: AnnotationPoint[];
  credit?: string;
}

export function FeatureAnnotation({
  image,
  alt,
  annotations,
  credit,
}: FeatureAnnotationProps) {
  const [activeAnnotation, setActiveAnnotation] = React.useState<number | null>(
    null
  );
  const isRemote = image.startsWith("http");

  return (
    <figure className="my-8 not-prose">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
        <SafeImage
          src={image}
          alt={alt}
          fill
          className="object-cover"
          unoptimized={isRemote}
        />

        {/* Annotation Points */}
        {annotations.map((point, index) => (
          <button
            key={index}
            className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-all ${
              activeAnnotation === index
                ? "bg-primary scale-125 z-20"
                : "bg-primary/80 hover:bg-primary hover:scale-110 z-10"
            }`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onClick={() =>
              setActiveAnnotation(activeAnnotation === index ? null : index)
            }
            aria-label={point.label}
          >
            <span className="text-white font-bold text-sm">{index + 1}</span>
          </button>
        ))}

        {/* Active Annotation Tooltip */}
        {activeAnnotation !== null && (
          <div
            className="absolute z-30 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs border border-border"
            style={{
              left: `${Math.min(Math.max(annotations[activeAnnotation].x, 20), 80)}%`,
              top: `${annotations[activeAnnotation].y + 8}%`,
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => setActiveAnnotation(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center hover:bg-primary-dark"
            >
              ✕
            </button>
            <h4 className="font-semibold text-sm mb-1">
              {annotations[activeAnnotation].label}
            </h4>
            <p className="text-xs text-muted-foreground">
              {annotations[activeAnnotation].description}
            </p>
          </div>
        )}
      </div>

      {/* Annotation Legend */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {annotations.map((point, index) => (
          <button
            key={index}
            onClick={() =>
              setActiveAnnotation(activeAnnotation === index ? null : index)
            }
            className={`flex items-start gap-2 p-2 rounded-lg text-left transition-colors ${
              activeAnnotation === index
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-muted"
            }`}
          >
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">
              {index + 1}
            </span>
            <div>
              <span className="font-medium text-sm">{point.label}</span>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {point.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {credit && (
        <p className="text-xs text-muted-foreground mt-2">📷 {credit}</p>
      )}
    </figure>
  );
}
