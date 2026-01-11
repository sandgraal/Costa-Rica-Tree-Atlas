"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";

interface Tree {
  title: string;
  scientificName: string;
  slug: string;
  family: string;
  tags: string[];
  featuredImage?: string;
  toxicityLevel?: string;
  childSafe?: boolean;
  petSafe?: boolean;
}

interface QuizClientProps {
  trees: Tree[];
  locale: string;
}

type QuizMode = "photo" | "safety" | "family";

interface Question {
  tree: Tree;
  options: string[];
  correctAnswer: string;
  type: "photo" | "safety" | "family";
}

export default function QuizClient({ trees, locale }: QuizClientProps) {
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: "Tree Identification Quiz",
        subtitle: "Test your knowledge of Costa Rican trees",
        selectMode: "Select a Quiz Mode",
        photoMode: "Photo Identification",
        photoModeDesc: "Identify trees from their photos",
        safetyMode: "Safety Quiz",
        safetyModeDesc: "Learn about tree safety and toxicity",
        familyMode: "Family Recognition",
        familyModeDesc: "Match trees to their botanical families",
        startQuiz: "Start Quiz",
        question: "Question",
        of: "of",
        score: "Score",
        submit: "Submit Answer",
        next: "Next Question",
        complete: "Quiz Complete!",
        finalScore: "Your final score",
        restart: "Try Another Quiz",
        backToModes: "Back to Quiz Modes",
        whatTree: "What tree is this?",
        whichSafe: "Which tree is safe for children?",
        whichFamily: "Which tree belongs to the {family} family?",
        correct: "Correct!",
        incorrect: "Incorrect. The correct answer is:",
        loading: "Loading quiz...",
      },
      es: {
        title: "Cuestionario de Identificación de Árboles",
        subtitle:
          "Pon a prueba tu conocimiento sobre los árboles de Costa Rica",
        selectMode: "Selecciona un Modo de Cuestionario",
        photoMode: "Identificación por Foto",
        photoModeDesc: "Identifica árboles por sus fotos",
        safetyMode: "Cuestionario de Seguridad",
        safetyModeDesc: "Aprende sobre la seguridad y toxicidad de los árboles",
        familyMode: "Reconocimiento de Familias",
        familyModeDesc: "Relaciona los árboles con sus familias botánicas",
        startQuiz: "Comenzar Cuestionario",
        question: "Pregunta",
        of: "de",
        score: "Puntuación",
        submit: "Enviar Respuesta",
        next: "Siguiente Pregunta",
        complete: "¡Cuestionario Completado!",
        finalScore: "Tu puntuación final",
        restart: "Intentar Otro Cuestionario",
        backToModes: "Volver a Modos de Cuestionario",
        whatTree: "¿Qué árbol es este?",
        whichSafe: "¿Qué árbol es seguro para niños?",
        whichFamily: "¿Qué árbol pertenece a la familia {family}?",
        correct: "¡Correcto!",
        incorrect: "Incorrecto. La respuesta correcta es:",
        loading: "Cargando cuestionario...",
      },
    };
    return translations[locale]?.[key] || key;
  };

  const generatePhotoQuestions = useCallback(() => {
    const treesWithImages = trees.filter((t) => t.featuredImage);
    const shuffled = [...treesWithImages].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, treesWithImages.length));

    return selected.map((tree) => {
      const otherTrees = treesWithImages.filter((t) => t.slug !== tree.slug);
      const randomOptions = otherTrees
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((t) => t.title);

      const options = [tree.title, ...randomOptions].sort(
        () => Math.random() - 0.5
      );

      return {
        tree,
        options,
        correctAnswer: tree.title,
        type: "photo" as const,
      };
    });
  }, [trees]);

  const generateSafetyQuestions = useCallback(() => {
    const treesWithSafety = trees.filter((t) => t.childSafe !== undefined);
    const shuffled = [...treesWithSafety].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, treesWithSafety.length));

    return selected.map((tree) => {
      const safeTrees = treesWithSafety.filter((t) => t.childSafe);
      const randomOptions = safeTrees
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((t) => t.title);

      const options = [...new Set([tree.title, ...randomOptions])]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      return {
        tree,
        options,
        correctAnswer:
          safeTrees.find((t) => options.includes(t.title))?.title || options[0],
        type: "safety" as const,
      };
    });
  }, [trees]);

  const generateFamilyQuestions = useCallback(() => {
    const shuffled = [...trees].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, trees.length));

    return selected.map((tree) => {
      const sameFamily = trees.filter((t) => t.family === tree.family);
      const otherFamilies = trees.filter((t) => t.family !== tree.family);
      const randomOptions = otherFamilies
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((t) => t.title);

      const correctOption =
        sameFamily[Math.floor(Math.random() * sameFamily.length)];
      const options = [
        correctOption.title,
        ...randomOptions.filter((o) => o !== correctOption.title),
      ]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      return {
        tree,
        options,
        correctAnswer: correctOption.title,
        type: "family" as const,
      };
    });
  }, [trees]);

  const startQuiz = (selectedMode: QuizMode) => {
    setMode(selectedMode);
    let newQuestions: Question[] = [];

    switch (selectedMode) {
      case "photo":
        newQuestions = generatePhotoQuestions();
        break;
      case "safety":
        newQuestions = generateSafetyQuestions();
        break;
      case "family":
        newQuestions = generateFamilyQuestions();
        break;
    }

    setQuestions(newQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
  };

  const handleAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect =
      selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setMode(null);
    setCurrentQuestion(0);
    setScore(0);
    setQuestions([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
  };

  if (!mode) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
              {t("title")}
            </h1>
            <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-center mb-6">
              {t("selectMode")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => startQuiz("photo")}
                className="p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
              >
                <div className="text-4xl mb-3">📷</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {t("photoMode")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("photoModeDesc")}
                </p>
              </button>

              <button
                onClick={() => startQuiz("safety")}
                className="p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
              >
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {t("safetyMode")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("safetyModeDesc")}
                </p>
              </button>

              <button
                onClick={() => startQuiz("family")}
                className="p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
              >
                <div className="text-4xl mb-3">🌳</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {t("familyMode")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("familyModeDesc")}
                </p>
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/trees"
              className="text-primary hover:text-primary-dark underline"
            >
              ← {locale === "es" ? "Volver a Árboles" : "Back to Trees"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🌟" : percentage >= 60 ? "🌳" : "🌱"}
            </div>
            <h2 className="text-3xl font-bold mb-4">{t("complete")}</h2>
            <div className="text-5xl font-bold text-primary mb-2">
              {percentage}%
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              {t("finalScore")}: {score} / {questions.length}
            </p>

            <div className="space-y-3">
              <button
                onClick={resetQuiz}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {t("restart")}
              </button>
              <Link
                href="/trees"
                className="block w-full px-6 py-3 border-2 border-border rounded-lg hover:border-primary transition-colors"
              >
                {locale === "es" ? "Explorar Árboles" : "Explore Trees"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {t("question")} {currentQuestion + 1} {t("of")} {questions.length}
            </span>
            <span className="text-sm font-semibold">
              {t("score")}: {score}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Image for photo mode */}
          {mode === "photo" && question.tree.featuredImage && (
            <div className="relative w-full h-64 bg-muted">
              <Image
                src={question.tree.featuredImage}
                alt="Tree to identify"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <div className="p-8">
            {/* Question text */}
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {mode === "photo" && t("whatTree")}
              {mode === "safety" && t("whichSafe")}
              {mode === "family" &&
                t("whichFamily").replace("{family}", question.tree.family)}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => !showResult && setSelectedAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    showResult
                      ? option === question.correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : option === selectedAnswer
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-border bg-muted/50"
                      : selectedAnswer === option
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>

            {/* Result feedback */}
            {showResult && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  selectedAnswer === question.correctAnswer
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-500"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-500"
                }`}
              >
                <p className="font-semibold mb-1">
                  {selectedAnswer === question.correctAnswer
                    ? t("correct")
                    : t("incorrect")}
                </p>
                {selectedAnswer !== question.correctAnswer && (
                  <p className="text-sm">{question.correctAnswer}</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {!showResult ? (
                <button
                  onClick={handleAnswer}
                  disabled={!selectedAnswer}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("submit")}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {currentQuestion + 1 < questions.length
                    ? t("next")
                    : t("complete")}
                </button>
              )}
              <button
                onClick={resetQuiz}
                className="px-6 py-3 border-2 border-border rounded-lg hover:border-primary transition-colors"
              >
                {t("backToModes")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
