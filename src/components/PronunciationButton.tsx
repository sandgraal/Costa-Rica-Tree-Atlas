"use client";

import { useState, useCallback, useEffect } from "react";

interface PronunciationButtonProps {
  text: string;
  label?: string;
  locale?: string;
  className?: string;
}

/**
 * PronunciationButton - Uses Web Speech API to pronounce scientific names
 * Provides audio pronunciation for tree scientific names to aid learning.
 */
export function PronunciationButton({
  text,
  label,
  locale = "en",
  className = "",
}: PronunciationButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if Speech Synthesis is supported
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  const handleSpeak = useCallback(() => {
    if (
      !isSupported ||
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Scientific names are in Latin - use a neutral voice
    // Try to use a voice that sounds good with Latin pronunciation
    const voices = window.speechSynthesis.getVoices();

    // Prefer voices that handle Latin/scientific terms well
    // English voices typically handle Latin scientific names better
    const preferredVoice =
      voices.find(
        (v) => v.lang.startsWith("en") && v.name.includes("Google")
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Slow down for clarity of scientific names
    utterance.rate = 0.85;
    utterance.pitch = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [text, isSupported]);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const buttonLabel = label || (locale === "es" ? "Pronunciar" : "Pronounce");
  const ariaLabel =
    locale === "es"
      ? `Escuchar pronunciación de ${text}`
      : `Listen to pronunciation of ${text}`;

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={isPlaying}
      aria-label={ariaLabel}
      title={buttonLabel}
      className={`inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded ${className}`}
    >
      {isPlaying ? (
        <SpeakingIcon className="h-4 w-4 animate-pulse" />
      ) : (
        <SpeakerIcon className="h-4 w-4" />
      )}
      <span className="text-sm">{buttonLabel}</span>
    </button>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakingIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
