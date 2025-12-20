"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// Visually hidden styles for screen readers
const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
};

interface AnnouncerContextType {
  announce: (message: string, politeness?: "polite" | "assertive") => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | undefined>(
  undefined
);

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback(
    (message: string, politeness: "polite" | "assertive" = "polite") => {
      // Clear first to ensure new message is announced
      if (politeness === "assertive") {
        setAssertiveMessage("");
        setTimeout(() => setAssertiveMessage(message), 100);
      } else {
        setPoliteMessage("");
        setTimeout(() => setPoliteMessage(message), 100);
      }
    },
    []
  );

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Screen reader live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={srOnlyStyle}
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={srOnlyStyle}
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error("useAnnounce must be used within an AnnouncerProvider");
  }
  return context.announce;
}

// Utility component for visually hidden text
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span style={srOnlyStyle}>{children}</span>;
}

export default AnnouncerProvider;
