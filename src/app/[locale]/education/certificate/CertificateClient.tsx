"use client";

import { useState, useRef, useEffect } from "react";
import {
  EducationProgressProvider,
  useEducationProgress,
} from "@/components/EducationProgress";

interface CertificateClientProps {
  locale: string;
}

export default function CertificateClient({ locale }: CertificateClientProps) {
  return (
    <EducationProgressProvider>
      <CertificateContent locale={locale} />
    </EducationProgressProvider>
  );
}

function CertificateContent({ locale }: CertificateClientProps) {
  const { getBadges, totalPoints, completedLessons } = useEducationProgress();
  const [studentName, setStudentName] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const badges = getBadges();
  const earnedBadges = badges.filter((b) => b.earned);

  const t = {
    enterName: locale === "es" ? "Ingresa tu nombre" : "Enter your name",
    namePlaceholder: locale === "es" ? "Tu nombre completo" : "Your full name",
    generateCertificate:
      locale === "es" ? "Generar Certificado" : "Generate Certificate",
    downloadCertificate:
      locale === "es" ? "📥 Descargar Certificado" : "📥 Download Certificate",
    printCertificate:
      locale === "es" ? "🖨️ Imprimir Certificado" : "🖨️ Print Certificate",
    newCertificate:
      locale === "es" ? "Crear Nuevo Certificado" : "Create New Certificate",
    certificateTitle:
      locale === "es" ? "Certificado de Logros" : "Certificate of Achievement",
    certifiedThat: locale === "es" ? "Se certifica que" : "This certifies that",
    hasCompleted:
      locale === "es"
        ? "ha completado exitosamente el programa educativo"
        : "has successfully completed the educational program",
    programName:
      locale === "es"
        ? "Atlas de Árboles de Costa Rica"
        : "Costa Rica Tree Atlas",
    withScore: locale === "es" ? "con una puntuación de" : "with a score of",
    points: locale === "es" ? "puntos" : "points",
    lessonsCompleted:
      locale === "es" ? "Lecciones Completadas" : "Lessons Completed",
    badgesEarned: locale === "es" ? "Insignias Obtenidas" : "Badges Earned",
    dateIssued: locale === "es" ? "Fecha de emisión" : "Date issued",
    noProgress:
      locale === "es"
        ? "¡Completa al menos una lección para obtener tu certificado!"
        : "Complete at least one lesson to get your certificate!",
    startLearning: locale === "es" ? "Comenzar a Aprender" : "Start Learning",
    requirements: locale === "es" ? "Requisitos" : "Requirements",
    currentProgress: locale === "es" ? "Tu Progreso Actual" : "Your Current Progress",
    lessonsReq:
      locale === "es"
        ? "Completar al menos 1 lección"
        : "Complete at least 1 lesson",
    nameReq:
      locale === "es"
        ? "Ingresar tu nombre"
        : "Enter your name",
  };

  const lessonNames = {
    "biodiversity-intro":
      locale === "es" ? "Introducción a la Biodiversidad" : "Introduction to Biodiversity",
    "tree-identification":
      locale === "es" ? "Identificación de Árboles" : "Tree Identification",
    conservation: locale === "es" ? "Conservación" : "Conservation",
    "ecosystem-services":
      locale === "es" ? "Servicios Ecosistémicos" : "Ecosystem Services",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    // Use html2canvas dynamically
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });
    
    const link = document.createElement("a");
    link.download = `certificate-${studentName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === "es" ? "es-CR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (completedLessons === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🎓</div>
          <p className="text-lg text-muted-foreground mb-6">{t.noProgress}</p>
          
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3">{t.requirements}:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                  {completedLessons >= 1 ? "✓" : "1"}
                </span>
                {t.lessonsReq}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                  2
                </span>
                {t.nameReq}
              </li>
            </ul>
          </div>
          
          <a
            href={`/${locale}/education/lessons`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            📚 {t.startLearning}
          </a>
        </div>
      </div>
    );
  }

  if (!showCertificate) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          {/* Current Progress */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> {t.currentProgress}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {completedLessons}/4
                </div>
                <div className="text-sm text-muted-foreground">
                  {t.lessonsCompleted}
                </div>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">{t.points}</div>
              </div>
            </div>
            
            {earnedBadges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {earnedBadges.map((badge) => (
                  <span
                    key={badge.id}
                    className="px-3 py-1 bg-yellow-500/20 rounded-full text-sm flex items-center gap-1"
                    title={locale === "es" ? badge.descriptionEs : badge.description}
                  >
                    {badge.icon} {locale === "es" ? badge.nameEs : badge.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {t.enterName}
              </span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>

            <button
              onClick={() => setShowCertificate(true)}
              disabled={!studentName.trim()}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                studentName.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              📜 {t.generateCertificate}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 print:hidden">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
        >
          {t.downloadCertificate}
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/90 transition-colors"
        >
          {t.printCertificate}
        </button>
        <button
          onClick={() => setShowCertificate(false)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
        >
          {t.newCertificate}
        </button>
      </div>

      {/* Certificate */}
      <div
        ref={certificateRef}
        className="bg-white mx-auto max-w-3xl aspect-[1.4/1] rounded-lg shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
      >
        <div className="h-full p-8 flex flex-col relative">
          {/* Decorative Border */}
          <div className="absolute inset-4 border-4 border-double border-green-700 rounded-lg pointer-events-none" />
          <div className="absolute inset-6 border-2 border-green-600 rounded-lg pointer-events-none" />

          {/* Corner Decorations */}
          <div className="absolute top-8 left-8 text-4xl">🌳</div>
          <div className="absolute top-8 right-8 text-4xl">🌿</div>
          <div className="absolute bottom-8 left-8 text-4xl">🍃</div>
          <div className="absolute bottom-8 right-8 text-4xl">🌲</div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center z-10 px-12">
            {/* Header */}
            <div className="text-green-700 text-sm uppercase tracking-[0.3em] mb-2">
              {t.programName}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-green-800 mb-6">
              {t.certificateTitle}
            </h1>

            {/* Certification Text */}
            <p className="text-gray-600 text-lg mb-2">{t.certifiedThat}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 font-serif border-b-2 border-green-600 pb-2 px-8">
              {studentName}
            </h2>
            <p className="text-gray-600 text-lg mb-6">{t.hasCompleted}</p>

            {/* Stats */}
            <div className="flex items-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">
                  {completedLessons}/4
                </div>
                <div className="text-sm text-gray-500">{t.lessonsCompleted}</div>
              </div>
              <div className="text-4xl">🏆</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {totalPoints}
                </div>
                <div className="text-sm text-gray-500">{t.points}</div>
              </div>
            </div>

            {/* Badges */}
            {earnedBadges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {earnedBadges.slice(0, 5).map((badge) => (
                  <span
                    key={badge.id}
                    className="text-2xl"
                    title={locale === "es" ? badge.nameEs : badge.name}
                  >
                    {badge.icon}
                  </span>
                ))}
              </div>
            )}

            {/* Date */}
            <div className="text-gray-500 text-sm">
              {t.dateIssued}: {formatDate(new Date())}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 text-xs">
            costaricatreeatlas.com
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-container,
          #certificate-container * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
