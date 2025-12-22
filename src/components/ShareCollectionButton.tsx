"use client";

import { useState } from "react";
import type { DiscoveryCollection } from "@/lib/geo/collections";

interface ShareCollectionButtonProps {
  collection: DiscoveryCollection;
  locale: "en" | "es";
  treeCount?: number;
}

export function ShareCollectionButton({
  collection,
  locale,
  treeCount,
}: ShareCollectionButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/map/collection/${collection.id}`
      : "";

  const shareText = collection.shareText[locale];
  const title = collection.title[locale];

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
          "_blank"
        );
        break;
      case "pinterest":
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
          "_blank"
        );
        break;
      case "copy":
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
          } else {
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
          }
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
        break;
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${title} - Costa Rica Tree Atlas`,
              text: shareText,
              url: shareUrl,
            });
          } catch {
            // User cancelled
          }
        }
        break;
    }
    setShowDropdown(false);
  };

  const labels = {
    share: locale === "es" ? "Compartir" : "Share",
    copied: locale === "es" ? "¡Copiado!" : "Copied!",
    copyLink: locale === "es" ? "Copiar enlace" : "Copy link",
    shareOn: locale === "es" ? "Compartir en" : "Share on",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        aria-label={labels.share}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {labels.share}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="text-sm font-medium truncate">{title}</p>
              {treeCount !== undefined && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {treeCount} {locale === "es" ? "árboles" : "trees"}
                </p>
              )}
            </div>

            <div className="p-2">
              {/* Native share (mobile) */}
              {typeof window !== "undefined" && "share" in navigator && (
                <button
                  onClick={() => handleShare("native")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-lg">📤</span>
                  {labels.share}...
                </button>
              )}

              {/* Social buttons */}
              <button
                onClick={() => handleShare("twitter")}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-lg">𝕏</span>
                {labels.shareOn} X/Twitter
              </button>

              <button
                onClick={() => handleShare("facebook")}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-lg">📘</span>
                {labels.shareOn} Facebook
              </button>

              <button
                onClick={() => handleShare("whatsapp")}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-lg">💬</span>
                {labels.shareOn} WhatsApp
              </button>

              <button
                onClick={() => handleShare("pinterest")}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-lg">📌</span>
                {labels.shareOn} Pinterest
              </button>

              <hr className="my-2 border-border" />

              <button
                onClick={() => handleShare("copy")}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-lg">{showCopied ? "✓" : "🔗"}</span>
                {showCopied ? labels.copied : labels.copyLink}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
