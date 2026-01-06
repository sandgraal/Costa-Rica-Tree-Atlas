"use client";

import { Link } from "@i18n/navigation";
import {
  EducationProgressProvider,
  useEducationProgress,
  BadgeDisplay,
} from "@/components/EducationProgress";

interface LessonPlan {
  id: string;
  icon: string;
  color: string;
  grades: string;
  duration: string;
  activityCount: number;
  features: string[];
  title: string;
  description: string;
  objectives: string[];
}

interface LessonsClientProps {
  lessonPlans: LessonPlan[];
  locale: string;
  t: {
    startLesson: string;
    grades: string;
    duration: string;
    minutes: string;
    activities: string;
    objectives: string;
    interactive: string;
    printable: string;
    multimedia: string;
  };
}

function LessonsContent({ lessonPlans, locale, t }: LessonsClientProps) {
  const { progress, totalPoints, completedLessons } = useEducationProgress();

  const getStatusBadge = (lessonId: string) => {
    if (!Object.hasOwn(progress, lessonId)) return null;
    // Safe access after Object.hasOwn check
    // eslint-disable-next-line security/detect-object-injection
    const lessonProgress = progress[lessonId];
    if (!lessonProgress) return null;

    if (lessonProgress.completed) {
      return (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/90 text-white rounded-full text-sm font-medium shadow-lg">
          <span>✓</span>
          {locale === "es" ? "Completada" : "Completed"}
          <span className="text-green-200">
            ({lessonProgress.totalPoints} pts)
          </span>
        </div>
      );
    }

    return (
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-yellow-500/90 text-white rounded-full text-sm font-medium shadow-lg">
        {locale === "es" ? "En progreso" : "In progress"}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary - only show if there's any progress */}
      {(totalPoints > 0 || completedLessons > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📊</span>
              {locale === "es" ? "Tu Progreso" : "Your Progress"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">
                  {locale === "es" ? "Puntos" : "Points"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {completedLessons}/4
                </div>
                <div className="text-sm text-muted-foreground">
                  {locale === "es" ? "Lecciones" : "Lessons"}
                </div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(completedLessons / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badges */}
          <BadgeDisplay locale={locale} showAll={false} />
        </div>
      )}

      {/* Lesson Cards */}
      {lessonPlans.map((lesson) => {
        const lessonProgress = progress[lesson.id];
        const isCompleted = lessonProgress?.completed;

        return (
          <div
            key={lesson.id}
            className={`relative bg-gradient-to-br ${lesson.color} rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
              isCompleted
                ? "border-green-500/30 ring-2 ring-green-500/20"
                : "border-border hover:border-primary/30"
            }`}
          >
            {/* Status Badge */}
            {getStatusBadge(lesson.id)}

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon and Grades */}
                <div className="flex md:flex-col items-center gap-4 md:gap-2">
                  <div
                    className={`text-5xl md:text-6xl ${isCompleted ? "" : ""}`}
                  >
                    {isCompleted ? "🏆" : lesson.icon}
                  </div>
                  <div className="bg-background/50 backdrop-blur rounded-lg px-3 py-1.5 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {t.grades}
                    </div>
                    <div className="font-semibold text-foreground">
                      {lesson.grades}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                    {lesson.title}
                    {isCompleted && (
                      <span className="text-green-500 text-lg">✓</span>
                    )}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {lesson.description}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur rounded-full text-sm">
                      <span>⏱️</span>
                      {lesson.duration} {t.minutes}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur rounded-full text-sm">
                      <span>🎯</span>
                      {lesson.activityCount} {t.activities}
                    </span>
                    {lesson.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {feature === "interactive" && <span>🖥️</span>}
                        {feature === "printable" && <span>🖨️</span>}
                        {feature === "multimedia" && <span>🎬</span>}
                        {feature === "interactive" && t.interactive}
                        {feature === "printable" && t.printable}
                        {feature === "multimedia" && t.multimedia}
                      </span>
                    ))}
                  </div>

                  {/* Objectives */}
                  <div className="bg-background/30 backdrop-blur rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span>🎯</span> {t.objectives}
                    </h3>
                    <ul className="space-y-1">
                      {lesson.objectives.map((objective, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span
                            className={
                              isCompleted ? "text-green-500" : "text-primary"
                            }
                          >
                            ✓
                          </span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/education/lessons/${lesson.id}`}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                      isCompleted
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isCompleted
                      ? locale === "es"
                        ? "Revisar Lección"
                        : "Review Lesson"
                      : t.startLesson}
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* All Badges Section - always show if there's some progress */}
      {totalPoints > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            {locale === "es" ? "🏅 Todas las Insignias" : "🏅 All Badges"}
          </h2>
          <BadgeDisplay locale={locale} showAll={true} />
        </div>
      )}
    </div>
  );
}

export default function LessonsClient(props: LessonsClientProps) {
  return (
    <EducationProgressProvider>
      <LessonsContent {...props} />
    </EducationProgressProvider>
  );
}
