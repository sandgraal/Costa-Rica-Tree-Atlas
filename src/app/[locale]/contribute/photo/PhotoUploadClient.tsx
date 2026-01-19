"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Link } from "@i18n/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { type ImageType, IMAGE_TYPES } from "@/types/image-review";

interface TreeOption {
  slug: string;
  title: string;
  scientificName: string;
}

interface PhotoUploadClientProps {
  trees: TreeOption[];
}

interface UploadLimits {
  maxFileSize: number;
  maxFileSizeMB: number;
  allowedTypes: string[];
  minWidth: number;
  minHeight: number;
  uploadsPerHour: number;
}

const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  FEATURED: "featuredImage",
  TREE: "fullTree",
  BARK: "bark",
  LEAVES: "leaves",
  FLOWERS: "flowers",
  FRUIT: "fruit",
  ROOTS: "roots",
  HABITAT: "habitat",
};

export default function PhotoUploadClient({ trees }: PhotoUploadClientProps) {
  const t = useTranslations("contribute");
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [treeSlug, setTreeSlug] = useState("");
  const [imageType, setImageType] = useState<ImageType>("TREE");
  const [attribution, setAttribution] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [limits, setLimits] = useState<UploadLimits | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch upload limits on mount
  useState(() => {
    fetch("/api/images/upload")
      .then((res) => res.json())
      .then((data) => setLimits(data.data?.limits))
      .catch(() => {});
  });

  const filteredTrees = trees.filter(
    (tree) =>
      tree.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setSuccess(null);

      // Validate file type
      if (!limits?.allowedTypes.includes(file.type)) {
        setError(t("uploadPhoto.errorInvalidType"));
        return;
      }

      // Validate file size
      if (limits && file.size > limits.maxFileSize) {
        setError(
          t("uploadPhoto.errorTooLarge", { maxMB: limits.maxFileSizeMB })
        );
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [limits, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !treeSlug || uploading) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("treeSlug", treeSlug);
      formData.append("imageType", imageType);
      if (attribution) formData.append("attribution", attribution);
      if (notes) formData.append("notes", notes);

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(t("uploadPhoto.success"));
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setTreeSlug("");
      setAttribution("");
      setNotes("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("uploadPhoto.errorGeneric")
      );
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show login prompt if not authenticated
  if (status === "loading") {
    return (
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-64 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <span className="text-6xl block mb-4">📸</span>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("uploadPhoto.title")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("uploadPhoto.loginRequired")}
            </p>
            <Link
              href="/admin/login"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("uploadPhoto.signIn")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("uploadPhoto.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("uploadPhoto.description")}
          </p>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            {t("uploadPhoto.guidelinesTitle")}
          </h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>{t("uploadPhoto.guideline1")}</li>
            <li>{t("uploadPhoto.guideline2")}</li>
            <li>{t("uploadPhoto.guideline3")}</li>
            <li>{t("uploadPhoto.guideline4")}</li>
          </ul>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-4 mb-6 text-green-700 dark:text-green-300">
            <p className="font-medium">✓ {success}</p>
            <p className="text-sm mt-1">{t("uploadPhoto.successNote")}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 mb-6 text-red-600">
            {error}
          </div>
        )}

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              preview
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            {preview ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={clearFile}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    {t("uploadPhoto.removeFile")}
                  </button>
                  <label className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                    {t("uploadPhoto.changeFile")}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <span className="text-5xl block mb-4">📷</span>
                <p className="text-foreground font-medium mb-1">
                  {t("uploadPhoto.dropzone")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("uploadPhoto.dropzoneHint", {
                    types: "JPEG, PNG, WebP",
                    maxMB: limits?.maxFileSizeMB || 10,
                  })}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Tree selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("uploadPhoto.selectTree")} *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("uploadPhoto.searchPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground mb-2"
            />
            <select
              value={treeSlug}
              onChange={(e) => setTreeSlug(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">{t("uploadPhoto.selectTreePlaceholder")}</option>
              {filteredTrees.map((tree) => (
                <option key={tree.slug} value={tree.slug}>
                  {tree.title} ({tree.scientificName})
                </option>
              ))}
            </select>
          </div>

          {/* Image type selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("uploadPhoto.imageType")} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {IMAGE_TYPES.filter((type) => type !== "FEATURED").map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setImageType(type)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    imageType === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {t(`uploadPhoto.types.${IMAGE_TYPE_LABELS[type]}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Attribution */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("uploadPhoto.attribution")}
            </label>
            <input
              type="text"
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder={t("uploadPhoto.attributionPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("uploadPhoto.attributionHint")}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("uploadPhoto.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("uploadPhoto.notesPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!selectedFile || !treeSlug || uploading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? t("uploadPhoto.uploading") : t("uploadPhoto.submit")}
          </button>

          {/* Terms note */}
          <p className="text-xs text-center text-muted-foreground">
            {t("uploadPhoto.termsNote")}
          </p>
        </form>
      </div>
    </div>
  );
}
