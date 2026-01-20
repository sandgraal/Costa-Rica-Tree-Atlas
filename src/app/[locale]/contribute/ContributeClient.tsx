"use client";

import { useState } from "react";
import { Link } from "@i18n/navigation";

type ContributionType = "NEW_SPECIES" | "CORRECTION" | "LOCAL_KNOWLEDGE";

interface TreeOption {
  slug: string;
  title: string;
  scientificName: string;
}

interface Translations {
  chooseType: string;
  newSpecies: { title: string; description: string; icon: string };
  correction: { title: string; description: string; icon: string };
  localKnowledge: { title: string; description: string; icon: string };
  photo: { title: string; description: string; icon: string };
  form: {
    selectTree: string;
    searchTrees: string;
    title: string;
    titlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    evidence: string;
    evidencePlaceholder: string;
    scientificName: string;
    scientificNamePlaceholder: string;
    commonNameEn: string;
    commonNameEs: string;
    family: string;
    familyPlaceholder: string;
    whereFound: string;
    whereFoundPlaceholder: string;
    targetField: string;
    knowledgeType: string;
    region: string;
    regionPlaceholder: string;
    contributorName: string;
    contributorNamePlaceholder: string;
    contributorEmail: string;
    contributorEmailPlaceholder: string;
    optional: string;
    submit: string;
    submitting: string;
    cancel: string;
    back: string;
  };
  fields: Record<string, string>;
  knowledgeTypes: Record<string, string>;
  success: { title: string; message: string; another: string };
  error: { title: string; tryAgain: string };
}

interface ContributeClientProps {
  trees: TreeOption[];
  translations: Translations;
}

export function ContributeClient({
  trees,
  translations: t,
}: ContributeClientProps) {
  const [selectedType, setSelectedType] = useState<ContributionType | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    treeSlug: "",
    targetField: "description",
    knowledgeType: "traditional_uses",
    title: "",
    description: "",
    evidence: "",
    scientificName: "",
    commonNameEn: "",
    commonNameEs: "",
    family: "",
    whereFound: "",
    region: "",
    contributorName: "",
    contributorEmail: "",
  });

  const [treeSearch, setTreeSearch] = useState("");

  const filteredTrees = trees.filter(
    (tree) =>
      tree.title.toLowerCase().includes(treeSearch.toLowerCase()) ||
      tree.scientificName.toLowerCase().includes(treeSearch.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        type: selectedType,
        treeSlug: formData.treeSlug || null,
        targetField:
          selectedType === "CORRECTION"
            ? formData.targetField
            : selectedType === "LOCAL_KNOWLEDGE"
              ? formData.knowledgeType
              : null,
        title: formData.title,
        description: formData.description,
        evidence: formData.evidence || null,
        scientificName:
          selectedType === "NEW_SPECIES" ? formData.scientificName : null,
        commonNameEn:
          selectedType === "NEW_SPECIES" ? formData.commonNameEn : null,
        commonNameEs:
          selectedType === "NEW_SPECIES" ? formData.commonNameEs : null,
        family: selectedType === "NEW_SPECIES" ? formData.family : null,
        contributorName: formData.contributorName || null,
        contributorEmail: formData.contributorEmail || null,
      };

      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit contribution");
      }

      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setSubmitStatus("idle");
    setErrorMessage("");
    setFormData({
      treeSlug: "",
      targetField: "description",
      knowledgeType: "traditional_uses",
      title: "",
      description: "",
      evidence: "",
      scientificName: "",
      commonNameEn: "",
      commonNameEs: "",
      family: "",
      whereFound: "",
      region: "",
      contributorName: "",
      contributorEmail: "",
    });
  };

  // Success state
  if (submitStatus === "success") {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-4">{t.success.title}</h2>
        <p className="text-muted-foreground mb-8">{t.success.message}</p>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          {t.success.another}
        </button>
      </div>
    );
  }

  // Error state
  if (submitStatus === "error") {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-4">{t.error.title}</h2>
        <p className="text-red-500 mb-8">{errorMessage}</p>
        <button
          onClick={() => setSubmitStatus("idle")}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          {t.error.tryAgain}
        </button>
      </div>
    );
  }

  // Type selection
  if (!selectedType) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-center mb-8">
          {t.chooseType}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* New Species */}
          <button
            onClick={() => setSelectedType("NEW_SPECIES")}
            className="p-6 rounded-xl border-2 border-border hover:border-primary transition-colors text-left group"
          >
            <div className="text-4xl mb-4">{t.newSpecies.icon}</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {t.newSpecies.title}
            </h3>
            <p className="text-muted-foreground">{t.newSpecies.description}</p>
          </button>

          {/* Correction */}
          <button
            onClick={() => setSelectedType("CORRECTION")}
            className="p-6 rounded-xl border-2 border-border hover:border-primary transition-colors text-left group"
          >
            <div className="text-4xl mb-4">{t.correction.icon}</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {t.correction.title}
            </h3>
            <p className="text-muted-foreground">{t.correction.description}</p>
          </button>

          {/* Local Knowledge */}
          <button
            onClick={() => setSelectedType("LOCAL_KNOWLEDGE")}
            className="p-6 rounded-xl border-2 border-border hover:border-primary transition-colors text-left group"
          >
            <div className="text-4xl mb-4">{t.localKnowledge.icon}</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {t.localKnowledge.title}
            </h3>
            <p className="text-muted-foreground">
              {t.localKnowledge.description}
            </p>
          </button>

          {/* Photo Upload - Links to existing upload page */}
          <Link
            href="/contribute/photo"
            className="p-6 rounded-xl border-2 border-border hover:border-primary transition-colors text-left group block"
          >
            <div className="text-4xl mb-4">{t.photo.icon}</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {t.photo.title}
            </h3>
            <p className="text-muted-foreground">{t.photo.description}</p>
          </Link>
        </div>
      </div>
    );
  }

  // Form rendering based on selected type
  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => setSelectedType(null)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>←</span>
        <span>{t.form.back}</span>
      </button>

      {/* Form title */}
      <h2 className="text-2xl font-bold">
        {selectedType === "NEW_SPECIES" && t.newSpecies.title}
        {selectedType === "CORRECTION" && t.correction.title}
        {selectedType === "LOCAL_KNOWLEDGE" && t.localKnowledge.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tree selector (for CORRECTION and LOCAL_KNOWLEDGE) */}
        {selectedType !== "NEW_SPECIES" && (
          <div className="space-y-2">
            <label className="block font-medium">{t.form.selectTree}</label>
            <input
              type="text"
              placeholder={t.form.searchTrees}
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {treeSearch && filteredTrees.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                {filteredTrees.slice(0, 10).map((tree) => (
                  <button
                    key={tree.slug}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, treeSlug: tree.slug }));
                      setTreeSearch(`${tree.title} (${tree.scientificName})`);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">{tree.title}</span>
                    <span className="text-muted-foreground ml-2">
                      ({tree.scientificName})
                    </span>
                  </button>
                ))}
              </div>
            )}
            {formData.treeSlug && (
              <p className="text-sm text-green-600">
                ✓ Selected:{" "}
                {trees.find((t) => t.slug === formData.treeSlug)?.title}
              </p>
            )}
          </div>
        )}

        {/* Target field (for CORRECTION) */}
        {selectedType === "CORRECTION" && (
          <div className="space-y-2">
            <label className="block font-medium">{t.form.targetField}</label>
            <select
              name="targetField"
              value={formData.targetField}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(t.fields).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Knowledge type (for LOCAL_KNOWLEDGE) */}
        {selectedType === "LOCAL_KNOWLEDGE" && (
          <div className="space-y-2">
            <label className="block font-medium">{t.form.knowledgeType}</label>
            <select
              name="knowledgeType"
              value={formData.knowledgeType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(t.knowledgeTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Species info (for NEW_SPECIES) */}
        {selectedType === "NEW_SPECIES" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-medium">
                  {t.form.scientificName}{" "}
                  <span className="text-muted-foreground">
                    ({t.form.optional})
                  </span>
                </label>
                <input
                  type="text"
                  name="scientificName"
                  value={formData.scientificName}
                  onChange={handleInputChange}
                  placeholder={t.form.scientificNamePlaceholder}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">
                  {t.form.family}{" "}
                  <span className="text-muted-foreground">
                    ({t.form.optional})
                  </span>
                </label>
                <input
                  type="text"
                  name="family"
                  value={formData.family}
                  onChange={handleInputChange}
                  placeholder={t.form.familyPlaceholder}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-medium">
                  {t.form.commonNameEn}{" "}
                  <span className="text-muted-foreground">
                    ({t.form.optional})
                  </span>
                </label>
                <input
                  type="text"
                  name="commonNameEn"
                  value={formData.commonNameEn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">
                  {t.form.commonNameEs}{" "}
                  <span className="text-muted-foreground">
                    ({t.form.optional})
                  </span>
                </label>
                <input
                  type="text"
                  name="commonNameEs"
                  value={formData.commonNameEs}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-medium">
                {t.form.whereFound}{" "}
                <span className="text-muted-foreground">
                  ({t.form.optional})
                </span>
              </label>
              <input
                type="text"
                name="whereFound"
                value={formData.whereFound}
                onChange={handleInputChange}
                placeholder={t.form.whereFoundPlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </>
        )}

        {/* Region (for LOCAL_KNOWLEDGE) */}
        {selectedType === "LOCAL_KNOWLEDGE" && (
          <div className="space-y-2">
            <label className="block font-medium">
              {t.form.region}{" "}
              <span className="text-muted-foreground">({t.form.optional})</span>
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder={t.form.regionPlaceholder}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="block font-medium">{t.form.title} *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={t.form.titlePlaceholder}
            required
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block font-medium">{t.form.description} *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t.form.descriptionPlaceholder}
            required
            rows={6}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
        </div>

        {/* Evidence */}
        <div className="space-y-2">
          <label className="block font-medium">
            {t.form.evidence}{" "}
            <span className="text-muted-foreground">({t.form.optional})</span>
          </label>
          <textarea
            name="evidence"
            value={formData.evidence}
            onChange={handleInputChange}
            placeholder={t.form.evidencePlaceholder}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
        </div>

        {/* Contributor info */}
        <div className="border-t border-border pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Your contact info is optional but helps us follow up if needed.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">
                {t.form.contributorName}{" "}
                <span className="text-muted-foreground">
                  ({t.form.optional})
                </span>
              </label>
              <input
                type="text"
                name="contributorName"
                value={formData.contributorName}
                onChange={handleInputChange}
                placeholder={t.form.contributorNamePlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium">
                {t.form.contributorEmail}{" "}
                <span className="text-muted-foreground">
                  ({t.form.optional})
                </span>
              </label>
              <input
                type="email"
                name="contributorEmail"
                value={formData.contributorEmail}
                onChange={handleInputChange}
                placeholder={t.form.contributorEmailPlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (selectedType !== "NEW_SPECIES" && !formData.treeSlug)
            }
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.form.submitting : t.form.submit}
          </button>
          <button
            type="button"
            onClick={() => setSelectedType(null)}
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition"
          >
            {t.form.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
