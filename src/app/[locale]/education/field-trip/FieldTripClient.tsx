"use client";

import { useState, useEffect } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import { FieldTripMap } from "@/components/maps";
import type { Locale } from "@/types/tree";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
  conservationStatus?: string;
  nativeRegion?: string;
  tags?: string[];
}

interface FieldTripClientProps {
  trees: Tree[];
  locale: string;
}

interface SpottedTree {
  slug: string;
  timestamp: string;
  notes: string;
  location?: { lat: number; lng: number };
}

const FIELD_TRIP_STORAGE_KEY = "costa-rica-tree-atlas-field-trip";

export default function FieldTripClient({
  trees,
  locale,
}: FieldTripClientProps) {
  const [spottedTrees, setSpottedTrees] = useState<SpottedTree[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [showOnlySpotted, setShowOnlySpotted] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<string | null>(null);
  const [tripName, setTripName] = useState("");
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const families = [...new Set(trees.map((t) => t.family))].sort();

  // Load saved data
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(FIELD_TRIP_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setSpottedTrees(data.spottedTrees || []);
        setCurrentTrip(data.currentTrip || null);
      }
    } catch (e) {
      console.error("Failed to parse field trip data:", e);
    }

    // Check online status
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(
      FIELD_TRIP_STORAGE_KEY,
      JSON.stringify({ spottedTrees, currentTrip })
    );
  }, [spottedTrees, currentTrip]);

  const t = {
    title: locale === "es" ? "Modo Excursión" : "Field Trip Mode",
    subtitle:
      locale === "es"
        ? "Lista de verificación para identificar árboles en el campo"
        : "Checklist for identifying trees in the field",
    backToEducation:
      locale === "es" ? "← Volver a Educación" : "← Back to Education",
    startTrip: locale === "es" ? "🥾 Iniciar Excursión" : "🥾 Start Field Trip",
    endTrip: locale === "es" ? "Finalizar Excursión" : "End Field Trip",
    tripInProgress:
      locale === "es" ? "Excursión en Progreso" : "Trip in Progress",
    searchPlaceholder:
      locale === "es" ? "Buscar árboles..." : "Search trees...",
    filterByFamily:
      locale === "es" ? "Filtrar por Familia" : "Filter by Family",
    allFamilies: locale === "es" ? "Todas las Familias" : "All Families",
    showSpotted: locale === "es" ? "Solo Encontrados" : "Show Spotted Only",
    spotted: locale === "es" ? "¡Encontrado!" : "Spotted!",
    markAsSpotted:
      locale === "es" ? "Marcar como Encontrado" : "Mark as Spotted",
    removeSpotted: locale === "es" ? "Quitar Marca" : "Remove Mark",
    addNote: locale === "es" ? "Agregar Nota" : "Add Note",
    notes: locale === "es" ? "Notas" : "Notes",
    notePlaceholder:
      locale === "es" ? "Escribe una nota..." : "Write a note...",
    save: locale === "es" ? "Guardar" : "Save",
    cancel: locale === "es" ? "Cancelar" : "Cancel",
    summary: locale === "es" ? "Resumen" : "Summary",
    treesSpotted: locale === "es" ? "árboles encontrados" : "trees spotted",
    familiesSpotted:
      locale === "es" ? "familias encontradas" : "families spotted",
    progress: locale === "es" ? "Progreso" : "Progress",
    offlineMode: locale === "es" ? "Modo Sin Conexión" : "Offline Mode",
    offlineNote:
      locale === "es"
        ? "Tus datos se guardarán localmente"
        : "Your data will be saved locally",
    tripNamePlaceholder:
      locale === "es"
        ? "Ej: Parque Nacional Manuel Antonio"
        : "E.g. Manuel Antonio National Park",
    tripNameLabel: locale === "es" ? "Nombre de la Excursión" : "Trip Name",
    clearAll: locale === "es" ? "Borrar Todo" : "Clear All",
    exportData: locale === "es" ? "📤 Exportar Datos" : "📤 Export Data",
    viewDetails: locale === "es" ? "Ver Detalles" : "View Details",
    quickTips: locale === "es" ? "Consejos Rápidos" : "Quick Tips",
    tips:
      locale === "es"
        ? [
            "Observa las hojas: forma, borde y textura",
            "Revisa la corteza: color, textura y patrones",
            "Busca flores o frutos si están presentes",
            "Nota la altura y forma general del árbol",
            "Toma fotos para referencia posterior",
          ]
        : [
            "Observe leaves: shape, edge, and texture",
            "Check bark: color, texture, and patterns",
            "Look for flowers or fruits if present",
            "Note the height and overall tree shape",
            "Take photos for later reference",
          ],
    conservationStatus: locale === "es" ? "Estado" : "Status",
    nativeRegion: locale === "es" ? "Región" : "Region",
  };

  const handleStartTrip = () => {
    if (tripName.trim()) {
      setCurrentTrip(tripName);
      setShowStartModal(false);
      setTripName("");
    }
  };

  const handleEndTrip = () => {
    setCurrentTrip(null);
  };

  const handleSpotTree = (tree: Tree) => {
    const existing = spottedTrees.find((s) => s.slug === tree.slug);
    if (existing) {
      // Open note modal
      setSelectedTree(tree);
      setNoteInput(existing.notes);
    } else {
      // Mark as spotted
      const newSpotted: SpottedTree = {
        slug: tree.slug,
        timestamp: new Date().toISOString(),
        notes: "",
      };

      // Try to get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            newSpotted.location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setSpottedTrees((prev) => [...prev, newSpotted]);
          },
          () => {
            setSpottedTrees((prev) => [...prev, newSpotted]);
          }
        );
      } else {
        setSpottedTrees((prev) => [...prev, newSpotted]);
      }
    }
  };

  const handleSaveNote = () => {
    if (selectedTree) {
      setSpottedTrees((prev) =>
        prev.map((s) =>
          s.slug === selectedTree.slug ? { ...s, notes: noteInput } : s
        )
      );
      setSelectedTree(null);
      setNoteInput("");
    }
  };

  const handleRemoveSpotted = (slug: string) => {
    setSpottedTrees((prev) => prev.filter((s) => s.slug !== slug));
  };

  const handleExportData = () => {
    const data = {
      tripName: currentTrip,
      date: new Date().toISOString(),
      treesSpotted: spottedTrees.map((s) => {
        const tree = trees.find((t) => t.slug === s.slug);
        return {
          ...s,
          treeName: tree?.title,
          scientificName: tree?.scientificName,
          family: tree?.family,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `field-trip-${currentTrip?.replace(/\s+/g, "-") || "data"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (
      confirm(locale === "es" ? "¿Borrar todos los datos?" : "Clear all data?")
    ) {
      setSpottedTrees([]);
      setCurrentTrip(null);
    }
  };

  // Filter trees
  const filteredTrees = trees.filter((tree) => {
    const matchesSearch =
      tree.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFamily =
      selectedFamily === "all" || tree.family === selectedFamily;
    const matchesSpotted =
      !showOnlySpotted || spottedTrees.some((s) => s.slug === tree.slug);
    return matchesSearch && matchesFamily && matchesSpotted;
  });

  const spottedFamilies = new Set(
    spottedTrees
      .map((s) => trees.find((t) => t.slug === s.slug)?.family)
      .filter(Boolean)
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-600 to-green-700 text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education"
            className="text-green-200 hover:text-white text-sm mb-4 inline-block"
          >
            {t.backToEducation}
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>🥾</span> {t.title}
              </h1>
              <p className="text-green-100 mt-1">{t.subtitle}</p>
            </div>

            {isOffline && (
              <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg px-4 py-2 text-sm">
                <div className="font-medium">📴 {t.offlineMode}</div>
                <div className="text-yellow-100 text-xs">{t.offlineNote}</div>
              </div>
            )}
          </div>

          {/* Trip Status */}
          <div className="mt-6">
            {currentTrip ? (
              <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-200">
                    {t.tripInProgress}
                  </div>
                  <div className="text-xl font-bold">{currentTrip}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
                  >
                    {t.exportData}
                  </button>
                  <button
                    onClick={handleEndTrip}
                    className="px-4 py-2 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors text-sm"
                  >
                    {t.endTrip}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowStartModal(true)}
                className="w-full py-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors font-semibold text-lg"
              >
                {t.startTrip}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{spottedTrees.length}</div>
              <div className="text-sm text-green-200">{t.treesSpotted}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{spottedFamilies.size}</div>
              <div className="text-sm text-green-200">{t.familiesSpotted}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">
                {Math.round((spottedTrees.length / trees.length) * 100)}%
              </div>
              <div className="text-sm text-green-200">{t.progress}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Field Trip Map */}
        {spottedTrees.length > 0 && (
          <div className="mb-6">
            <FieldTripMap
              spottedTrees={spottedTrees}
              trees={trees}
              locale={locale as Locale}
              onMarkerClick={(slug) => {
                const tree = trees.find((t) => t.slug === slug);
                if (tree) {
                  setSelectedTree(tree);
                  const spotted = spottedTrees.find((s) => s.slug === slug);
                  setNoteInput(spotted?.notes || "");
                }
              }}
            />
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6 border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
            <span>💡</span> {t.quickTips}
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {t.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span>•</span> {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6 space-y-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground"
          />

          <div className="flex flex-wrap gap-4">
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="all">{t.allFamilies}</option>
              {families.map((family) => (
                <option key={family} value={family}>
                  {family}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlySpotted}
                onChange={(e) => setShowOnlySpotted(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm">{t.showSpotted}</span>
            </label>

            {spottedTrees.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-600 ml-auto"
              >
                {t.clearAll}
              </button>
            )}
          </div>
        </div>

        {/* Tree List */}
        <div className="grid gap-3">
          {filteredTrees.map((tree) => {
            const spotted = spottedTrees.find((s) => s.slug === tree.slug);
            const isSpotted = !!spotted;

            return (
              <div
                key={tree.slug}
                className={`bg-card rounded-xl border-2 overflow-hidden transition-all ${
                  isSpotted
                    ? "border-green-500 bg-green-500/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Checkbox / Spotted Indicator */}
                  <button
                    onClick={() => handleSpotTree(tree)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all ${
                      isSpotted
                        ? "bg-green-500 text-white"
                        : "bg-muted hover:bg-primary/10"
                    }`}
                  >
                    {isSpotted ? "✓" : "○"}
                  </button>

                  {/* Tree Image */}
                  {tree.featuredImage && (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={tree.featuredImage}
                        alt={tree.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}

                  {/* Tree Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {tree.title}
                    </h3>
                    <p className="text-sm text-muted-foreground italic truncate">
                      {tree.scientificName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {tree.family}
                      </span>
                      {tree.conservationStatus && (
                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded">
                          {tree.conservationStatus}
                        </span>
                      )}
                    </div>
                    {spotted?.notes && (
                      <p className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded px-2 py-1">
                        📝 {spotted.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isSpotted && (
                      <button
                        onClick={() => {
                          setSelectedTree(tree);
                          setNoteInput(spotted?.notes || "");
                        }}
                        className="px-3 py-1.5 text-sm bg-muted rounded-lg hover:bg-muted/80"
                      >
                        {t.addNote}
                      </button>
                    )}
                    <Link
                      href={`/trees/${tree.slug}`}
                      className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                    >
                      {t.viewDetails}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTrees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-muted-foreground">
              {locale === "es" ? "No se encontraron árboles" : "No trees found"}
            </p>
          </div>
        )}
      </div>

      {/* Start Trip Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t.startTrip}</h2>
            <label className="block mb-4">
              <span className="text-sm font-medium">{t.tripNameLabel}</span>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder={t.tripNamePlaceholder}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background"
                autoFocus
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 py-2 bg-muted rounded-xl hover:bg-muted/80"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleStartTrip}
                disabled={!tripName.trim()}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50"
              >
                {t.startTrip}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {selectedTree && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">{selectedTree.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTree.scientificName}
            </p>
            <label className="block mb-4">
              <span className="text-sm font-medium">{t.notes}</span>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={t.notePlaceholder}
                rows={4}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background resize-none"
                autoFocus
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleRemoveSpotted(selectedTree.slug)}
                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"
              >
                {t.removeSpotted}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => {
                  setSelectedTree(null);
                  setNoteInput("");
                }}
                className="px-4 py-2 bg-muted rounded-xl hover:bg-muted/80"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
