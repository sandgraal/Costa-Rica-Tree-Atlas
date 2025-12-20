"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  totalPoints: number;
  completedAt?: string;
  objectives?: Record<string, boolean>;
}

interface EducationProgressContextType {
  progress: Record<string, LessonProgress>;
  totalPoints: number;
  completedLessons: number;
  updateProgress: (lessonId: string, data: Partial<LessonProgress>) => void;
  markLessonComplete: (lessonId: string, score: number, points: number) => void;
  resetProgress: () => void;
  getBadges: () => Badge[];
}

interface Badge {
  id: string;
  name: string;
  nameEs: string;
  icon: string;
  description: string;
  descriptionEs: string;
  earned: boolean;
}

const EducationProgressContext = createContext<
  EducationProgressContextType | undefined
>(undefined);

const STORAGE_KEY = "costa-rica-tree-atlas-education-progress";

const BADGES: Omit<Badge, "earned">[] = [
  {
    id: "first-lesson",
    name: "First Steps",
    nameEs: "Primeros Pasos",
    icon: "🌱",
    description: "Complete your first lesson",
    descriptionEs: "Completa tu primera lección",
  },
  {
    id: "biodiversity-master",
    name: "Biodiversity Master",
    nameEs: "Maestro de Biodiversidad",
    icon: "🌳",
    description: "Complete the Biodiversity lesson",
    descriptionEs: "Completa la lección de Biodiversidad",
  },
  {
    id: "tree-detective",
    name: "Tree Detective",
    nameEs: "Detective de Árboles",
    icon: "🔍",
    description: "Complete the Tree Identification lesson",
    descriptionEs: "Completa la lección de Identificación",
  },
  {
    id: "conservation-hero",
    name: "Conservation Hero",
    nameEs: "Héroe de la Conservación",
    icon: "🛡️",
    description: "Complete the Conservation lesson",
    descriptionEs: "Completa la lección de Conservación",
  },
  {
    id: "ecosystem-expert",
    name: "Ecosystem Expert",
    nameEs: "Experto en Ecosistemas",
    icon: "🌍",
    description: "Complete the Ecosystem Services lesson",
    descriptionEs: "Completa la lección de Servicios Ecosistémicos",
  },
  {
    id: "all-lessons",
    name: "Forest Champion",
    nameEs: "Campeón del Bosque",
    icon: "🏆",
    description: "Complete all lessons",
    descriptionEs: "Completa todas las lecciones",
  },
  {
    id: "high-scorer",
    name: "High Scorer",
    nameEs: "Alto Puntaje",
    icon: "⭐",
    description: "Earn 500 total points",
    descriptionEs: "Obtén 500 puntos totales",
  },
  {
    id: "perfect-quiz",
    name: "Perfect Quiz",
    nameEs: "Quiz Perfecto",
    icon: "💯",
    description: "Get a perfect score on any quiz",
    descriptionEs: "Obtén puntuación perfecta en cualquier quiz",
  },
];

export function EducationProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setProgress(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse education progress:", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, isLoaded]);

  const totalPoints = Object.values(progress).reduce(
    (sum, p) => sum + (p.totalPoints || 0),
    0
  );
  const completedLessons = Object.values(progress).filter(
    (p) => p.completed
  ).length;

  const updateProgress = (lessonId: string, data: Partial<LessonProgress>) => {
    setProgress((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        lessonId,
        ...data,
      },
    }));
  };

  const markLessonComplete = (
    lessonId: string,
    score: number,
    points: number
  ) => {
    setProgress((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        lessonId,
        completed: true,
        score,
        totalPoints: points,
        completedAt: new Date().toISOString(),
      },
    }));
  };

  const resetProgress = () => {
    setProgress({});
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getBadges = (): Badge[] => {
    const lessonBadgeMap: Record<string, string> = {
      "biodiversity-intro": "biodiversity-master",
      "tree-identification": "tree-detective",
      conservation: "conservation-hero",
      "ecosystem-services": "ecosystem-expert",
    };

    return BADGES.map((badge) => {
      let earned = false;

      if (badge.id === "first-lesson") {
        earned = completedLessons >= 1;
      } else if (badge.id === "all-lessons") {
        earned = completedLessons >= 4;
      } else if (badge.id === "high-scorer") {
        earned = totalPoints >= 500;
      } else if (badge.id === "perfect-quiz") {
        earned = Object.values(progress).some((p) => p.score >= 100);
      } else {
        // Check lesson-specific badges
        const lessonId = Object.entries(lessonBadgeMap).find(
          ([, badgeId]) => badgeId === badge.id
        )?.[0];
        if (lessonId) {
          earned = progress[lessonId]?.completed || false;
        }
      }

      return { ...badge, earned };
    });
  };

  return (
    <EducationProgressContext.Provider
      value={{
        progress,
        totalPoints,
        completedLessons,
        updateProgress,
        markLessonComplete,
        resetProgress,
        getBadges,
      }}
    >
      {children}
    </EducationProgressContext.Provider>
  );
}

export function useEducationProgress() {
  const context = useContext(EducationProgressContext);
  if (!context) {
    throw new Error(
      "useEducationProgress must be used within an EducationProgressProvider"
    );
  }
  return context;
}

// Export badge component for displaying earned badges
export function BadgeDisplay({
  locale,
  showAll = false,
}: {
  locale: string;
  showAll?: boolean;
}) {
  const { getBadges, totalPoints, completedLessons } = useEducationProgress();
  const badges = getBadges();
  const displayBadges = showAll ? badges : badges.filter((b) => b.earned);

  if (!showAll && displayBadges.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🏅</span>
          {locale === "es" ? "Insignias" : "Badges"}
        </h3>
        <div className="text-sm text-muted-foreground">
          {displayBadges.filter((b) => b.earned).length}/{badges.length}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className={`relative p-3 rounded-xl text-center transition-all ${
              badge.earned
                ? "bg-yellow-500/10 border-2 border-yellow-500/30"
                : "bg-muted/50 border border-border opacity-50"
            }`}
            title={locale === "es" ? badge.descriptionEs : badge.description}
          >
            <div className={`text-3xl mb-1 ${badge.earned ? "" : "grayscale"}`}>
              {badge.icon}
            </div>
            <div className="text-xs font-medium truncate">
              {locale === "es" ? badge.nameEs : badge.name}
            </div>
            {badge.earned && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-primary">{totalPoints}</div>
          <div className="text-xs text-muted-foreground">
            {locale === "es" ? "Puntos Totales" : "Total Points"}
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {completedLessons}/4
          </div>
          <div className="text-xs text-muted-foreground">
            {locale === "es" ? "Lecciones" : "Lessons"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress bar component for individual lessons
export function LessonProgressBar({
  lessonId,
  locale,
}: {
  lessonId: string;
  locale: string;
}) {
  const { progress } = useEducationProgress();
  const lessonProgress = progress[lessonId];

  if (!lessonProgress) {
    return (
      <div className="text-xs text-muted-foreground">
        {locale === "es" ? "No iniciada" : "Not started"}
      </div>
    );
  }

  if (lessonProgress.completed) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <span className="text-sm">✓</span>
        <span className="text-xs font-medium">
          {locale === "es" ? "Completada" : "Completed"}
        </span>
        <span className="text-xs text-muted-foreground">
          ({lessonProgress.totalPoints} pts)
        </span>
      </div>
    );
  }

  return (
    <div className="text-xs text-yellow-600">
      {locale === "es" ? "En progreso" : "In progress"}
    </div>
  );
}
