"use client";

import { useState, useEffect, useMemo } from "react";
import {
  EducationProgressProvider,
  useEducationProgress,
} from "@/components/EducationProgress";
import { createStorage, classroomSchema, studentInfoSchema } from "@/lib/storage";

interface ClassroomClientProps {
  locale: string;
}

interface Student {
  id: string;
  name: string;
  points: number;
  lessonsCompleted: number;
  badges: string[];
  lastActive: string;
}

interface Classroom {
  id: string;
  code: string;
  name: string;
  teacherName: string;
  students: Student[];
  createdAt: string;
}

const CLASSROOM_STORAGE_KEY = "costa-rica-tree-atlas-classroom";
const STUDENT_STORAGE_KEY = "costa-rica-tree-atlas-student";

export default function ClassroomClient({ locale }: ClassroomClientProps) {
  return (
    <EducationProgressProvider>
      <ClassroomContent locale={locale} />
    </EducationProgressProvider>
  );
}

function ClassroomContent({ locale }: ClassroomClientProps) {
  const { getBadges, totalPoints, completedLessons } = useEducationProgress();
  const [mode, setMode] = useState<"select" | "create" | "join" | "classroom">(
    "select"
  );
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    classroomCode: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    classroomName: "",
    teacherName: "",
    studentName: "",
    classroomCode: "",
  });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const badges = getBadges();
  const earnedBadgeIcons = badges.filter((b) => b.earned).map((b) => b.icon);

  // Create storage instances with error handling
  const classroomStorage = useMemo(
    () =>
      createStorage({
        key: CLASSROOM_STORAGE_KEY,
        schema: classroomSchema,
        onError: (error) => {
          setStorageError(
            locale === "es"
              ? "Se detectaron datos corruptos del aula y fueron eliminados"
              : "Corrupted classroom data was detected and cleared"
          );
        },
      }),
    [locale]
  );

  const studentInfoStorage = useMemo(
    () =>
      createStorage({
        key: STUDENT_STORAGE_KEY,
        schema: studentInfoSchema,
        onError: (error) => {
          setStorageError(
            locale === "es"
              ? "Se detectaron datos corruptos del estudiante y fueron eliminados"
              : "Corrupted student data was detected and cleared"
          );
        },
      }),
    [locale]
  );

  // Load saved data on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedClassroom = classroomStorage.get();
    const savedStudent = studentInfoStorage.get();

    if (savedClassroom) {
      setClassroom(savedClassroom);
      setMode("classroom");
    }
    if (savedStudent) {
      setStudentInfo(savedStudent);
    }
  }, [classroomStorage, studentInfoStorage]);

  // Auto-update student progress in classroom
  useEffect(() => {
    if (!studentInfo?.name) return;

    setClassroom((prev) => {
      if (!prev) return prev;

      const updatedStudents = prev.students.map((s) =>
        s.name === studentInfo.name
          ? {
              ...s,
              points: totalPoints,
              lessonsCompleted: completedLessons,
              badges: earnedBadgeIcons,
              lastActive: new Date().toISOString(),
            }
          : s
      );

      const updatedClassroom = { ...prev, students: updatedStudents };
      localStorage.setItem(
        CLASSROOM_STORAGE_KEY,
        JSON.stringify(updatedClassroom)
      );
      return updatedClassroom;
    });
  }, [studentInfo?.name, totalPoints, completedLessons, earnedBadgeIcons]);

  const t = {
    createClassroom: locale === "es" ? "Crear Aula" : "Create Classroom",
    joinClassroom: locale === "es" ? "Unirse a Aula" : "Join Classroom",
    teacherMode: locale === "es" ? "Modo Profesor" : "Teacher Mode",
    studentMode: locale === "es" ? "Modo Estudiante" : "Student Mode",
    classroomName: locale === "es" ? "Nombre del Aula" : "Classroom Name",
    teacherName: locale === "es" ? "Nombre del Profesor" : "Teacher Name",
    studentName: locale === "es" ? "Tu Nombre" : "Your Name",
    classroomCode: locale === "es" ? "Código del Aula" : "Classroom Code",
    create: locale === "es" ? "Crear" : "Create",
    join: locale === "es" ? "Unirse" : "Join",
    back: locale === "es" ? "← Volver" : "← Back",
    leaderboard: locale === "es" ? "Tabla de Posiciones" : "Leaderboard",
    shareCode:
      locale === "es"
        ? "Comparte este código con tus estudiantes:"
        : "Share this code with your students:",
    copyCode: locale === "es" ? "Copiar Código" : "Copy Code",
    copied: locale === "es" ? "¡Copiado!" : "Copied!",
    rank: locale === "es" ? "Posición" : "Rank",
    name: locale === "es" ? "Nombre" : "Name",
    points: locale === "es" ? "Puntos" : "Points",
    lessons: locale === "es" ? "Lecciones" : "Lessons",
    badges: locale === "es" ? "Insignias" : "Badges",
    noStudents: locale === "es" ? "Aún no hay estudiantes" : "No students yet",
    inviteStudents:
      locale === "es"
        ? "¡Invita a tus estudiantes usando el código!"
        : "Invite students using the code!",
    leaveClassroom: locale === "es" ? "Salir del Aula" : "Leave Classroom",
    deleteClassroom: locale === "es" ? "Eliminar Aula" : "Delete Classroom",
    you: locale === "es" ? "(Tú)" : "(You)",
    errorClassroomNotFound:
      locale === "es"
        ? "Código de aula no encontrado"
        : "Classroom code not found",
    errorFillFields:
      locale === "es"
        ? "Por favor completa todos los campos"
        : "Please fill in all fields",
    welcomeTeacher:
      locale === "es" ? "¡Bienvenido, Profesor!" : "Welcome, Teacher!",
    welcomeStudent:
      locale === "es" ? "¡Bienvenido, Estudiante!" : "Welcome, Student!",
    classroomInfo: locale === "es" ? "Información del Aula" : "Classroom Info",
    students: locale === "es" ? "estudiantes" : "students",
    lastActive: locale === "es" ? "Última actividad" : "Last active",
    today: locale === "es" ? "Hoy" : "Today",
    yesterday: locale === "es" ? "Ayer" : "Yesterday",
    daysAgo: locale === "es" ? "hace {n} días" : "{n} days ago",
  };

  const generateCode = () => {
    // eslint-disable-next-line no-secrets/no-secrets -- Character set for code generation, not a secret
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateClassroom = () => {
    if (!formData.classroomName.trim() || !formData.teacherName.trim()) {
      setError(t.errorFillFields);
      return;
    }

    const newClassroom: Classroom = {
      id: Date.now().toString(),
      code: generateCode(),
      name: formData.classroomName,
      teacherName: formData.teacherName,
      students: [],
      createdAt: new Date().toISOString(),
    };

    setClassroom(newClassroom);
    classroomStorage.set(newClassroom);
    setMode("classroom");
    setError("");
  };

  const handleJoinClassroom = () => {
    if (!formData.studentName.trim() || !formData.classroomCode.trim()) {
      setError(t.errorFillFields);
      return;
    }

    // In a real app, this would validate against a server
    // For demo, we'll create/join a local classroom
    const existingClassroom = classroomStorage.get();

    if (existingClassroom) {
      if (
        existingClassroom.code.toUpperCase() ===
        formData.classroomCode.toUpperCase()
      ) {
        // Check if student already exists
        const existingStudent = existingClassroom.students.find(
          (s) => s.name.toLowerCase() === formData.studentName.toLowerCase()
        );

        if (!existingStudent) {
          const newStudent: Student = {
            id: Date.now().toString(),
            name: formData.studentName,
            points: totalPoints,
            lessonsCompleted: completedLessons,
            badges: earnedBadgeIcons,
            lastActive: new Date().toISOString(),
          };
          // Create a new object reference to avoid mutation issues
          const updatedClassroom = {
            ...existingClassroom,
            students: [...existingClassroom.students, newStudent],
          };
          classroomStorage.set(updatedClassroom);
          setClassroom(updatedClassroom);
        } else {
          setClassroom(existingClassroom);
        }

        const studentData = {
          name: formData.studentName,
          classroomCode: existingClassroom.code,
        };
        setStudentInfo(studentData);
        studentInfoStorage.set(studentData);
        setMode("classroom");
        setError("");
        return;
      }
    }

    // Create new classroom with this code (for demo purposes)
    const newClassroom: Classroom = {
      id: Date.now().toString(),
      code: formData.classroomCode.toUpperCase(),
      name: `Classroom ${formData.classroomCode.toUpperCase()}`,
      teacherName: "Teacher",
      students: [
        {
          id: Date.now().toString(),
          name: formData.studentName,
          points: totalPoints,
          lessonsCompleted: completedLessons,
          badges: earnedBadgeIcons,
          lastActive: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setClassroom(newClassroom);
    const studentData = {
      name: formData.studentName,
      classroomCode: newClassroom.code,
    };
    setStudentInfo(studentData);
    classroomStorage.set(newClassroom);
    studentInfoStorage.set(studentData);
    setMode("classroom");
    setError("");
  };

  const handleCopyCode = () => {
    if (classroom) {
      navigator.clipboard.writeText(classroom.code).catch(() => {
        // Fallback - user can manually copy from displayed code
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveClassroom = () => {
    classroomStorage.clear();
    studentInfoStorage.clear();
    setClassroom(null);
    setStudentInfo(null);
    setMode("select");
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return t.today;
    if (diffDays === 1) return t.yesterday;
    return t.daysAgo.replace("{n}", diffDays.toString());
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  // Mode Selection
  if (mode === "select") {
    return (
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button
          onClick={() => setMode("create")}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:border-primary transition-colors group"
        >
          <div className="text-5xl mb-4">👩‍🏫</div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {t.teacherMode}
          </h3>
          <p className="text-muted-foreground text-sm">{t.createClassroom}</p>
        </button>

        <button
          onClick={() => setMode("join")}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:border-primary transition-colors group"
        >
          <div className="text-5xl mb-4">👨‍🎓</div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {t.studentMode}
          </h3>
          <p className="text-muted-foreground text-sm">{t.joinClassroom}</p>
        </button>
      </div>
    );
  }

  // Create Classroom Form
  if (mode === "create") {
    return (
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setMode("select")}
          className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center"
        >
          {t.back}
        </button>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">👩‍🏫</div>
            <h2 className="text-xl font-bold">{t.createClassroom}</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">{t.classroomName}</span>
              <input
                type="text"
                value={formData.classroomName}
                onChange={(e) =>
                  setFormData({ ...formData, classroomName: e.target.value })
                }
                placeholder={
                  locale === "es" ? "Ej: Ciencias 5A" : "E.g. Science 5A"
                }
                className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">{t.teacherName}</span>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) =>
                  setFormData({ ...formData, teacherName: e.target.value })
                }
                placeholder={
                  locale === "es" ? "Ej: Sra. García" : "E.g. Mrs. Garcia"
                }
                className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </label>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleCreateClassroom}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              {t.create}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join Classroom Form
  if (mode === "join") {
    return (
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setMode("select")}
          className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center"
        >
          {t.back}
        </button>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">👨‍🎓</div>
            <h2 className="text-xl font-bold">{t.joinClassroom}</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">{t.studentName}</span>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                placeholder={locale === "es" ? "Tu nombre" : "Your name"}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">{t.classroomCode}</span>
              <input
                type="text"
                value={formData.classroomCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classroomCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="ABC123"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background text-center text-2xl font-mono tracking-wider"
                maxLength={6}
              />
            </label>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleJoinClassroom}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              {t.join}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Classroom View with Leaderboard
  if (mode === "classroom" && classroom) {
    const sortedStudents = [...classroom.students].sort(
      (a, b) => b.points - a.points
    );
    const isTeacher = !studentInfo;

    return (
      <div className="space-y-6">
        {/* Classroom Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{classroom.name}</h2>
              <p className="text-muted-foreground">
                {isTeacher ? t.welcomeTeacher : t.welcomeStudent} •{" "}
                {classroom.students.length} {t.students}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-background rounded-xl px-4 py-2 border border-border">
                <div className="text-xs text-muted-foreground">
                  {t.classroomCode}
                </div>
                <div className="text-2xl font-mono font-bold tracking-wider">
                  {classroom.code}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm"
              >
                {copied ? t.copied : t.copyCode}
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-border">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>🏆</span> {t.leaderboard}
            </h3>
          </div>

          {sortedStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-muted-foreground">{t.noStudents}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t.inviteStudents}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {t.rank}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {t.name}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                      {t.points}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                      {t.lessons}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                      {t.badges}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t.lastActive}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student, index) => {
                    const isCurrentUser =
                      studentInfo?.name.toLowerCase() ===
                      student.name.toLowerCase();
                    return (
                      <tr
                        key={student.id}
                        className={`border-b border-border last:border-0 ${
                          isCurrentUser
                            ? "bg-primary/5"
                            : index % 2 === 0
                              ? "bg-muted/20"
                              : ""
                        } ${index < 3 ? "font-medium" : ""}`}
                      >
                        <td className="px-4 py-4">
                          <span className="text-2xl">
                            {getRankEmoji(index + 1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-2">
                            {student.name}
                            {isCurrentUser && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                {t.you}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-yellow-600">
                            {student.points}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-green-600">
                            {student.lessonsCompleted}/4
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="flex justify-center gap-0.5">
                            {student.badges.slice(0, 4).map((badge, i) => (
                              <span key={i}>{badge}</span>
                            ))}
                            {student.badges.length > 4 && (
                              <span className="text-xs text-muted-foreground">
                                +{student.badges.length - 4}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                          {getRelativeTime(student.lastActive)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <button
            onClick={handleLeaveClassroom}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            {isTeacher ? t.deleteClassroom : t.leaveClassroom}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
