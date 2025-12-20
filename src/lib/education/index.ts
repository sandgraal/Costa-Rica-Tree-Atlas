/**
 * Shared education utilities
 * Extracted from duplicated code in lesson client components
 */

// ============================================================================
// Confetti Effect
// ============================================================================

const CONFETTI_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444", "#a855f7"];

export function triggerConfetti(count = 60): void {
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
      position: fixed;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      left: ${Math.random() * 100}%;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      pointer-events: none;
      z-index: 9999;
      animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4500);
  }
}

// ============================================================================
// Animation Styles
// ============================================================================

const EDUCATION_STYLES = `
  @keyframes confetti-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes bounce-in {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @keyframes pulse-green {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
    50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes progress-fill {
    from { width: 0; }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const STYLE_ID = "education-shared-styles";

export function injectEducationStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = EDUCATION_STYLES;
  document.head.appendChild(style);
}

// ============================================================================
// Types
// ============================================================================

export interface LessonTreeData {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  description: string;
  featuredImage?: string;
  uses?: string[];
  tags?: string[];
}

// ============================================================================
// Progress Utilities
// ============================================================================

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function formatPoints(points: number): string {
  return points.toLocaleString();
}
