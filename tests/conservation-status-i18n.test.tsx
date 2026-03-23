import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ConservationScale,
  ConservationStatus,
} from "@/components/ConservationStatus";

const CATEGORY_LABELS = {
  en: {
    EX: "Extinct",
    EW: "Extinct in the Wild",
    CR: "Critically Endangered",
    EN: "Endangered",
    VU: "Vulnerable",
    NT: "Near Threatened",
    LC: "Least Concern",
    DD: "Data Deficient",
    NE: "Not Evaluated",
  },
  es: {
    EX: "Extinto",
    EW: "Extinto en estado silvestre",
    CR: "En peligro crítico",
    EN: "En peligro",
    VU: "Vulnerable",
    NT: "Casi amenazado",
    LC: "Preocupación menor",
    DD: "Datos insuficientes",
    NE: "No evaluado",
  },
} as const;

const LOCALE_UI = {
  en: {
    heading: "Conservation Status",
    populationTrend: "Population Trend",
    assessedBy: "Assessed by",
    viewOn: "View on IUCN Red List",
    decreasing: "Decreasing",
    lowerRisk: "Lower risk",
    higherRisk: "Higher risk",
  },
  es: {
    heading: "Estado de Conservación",
    populationTrend: "Tendencia Poblacional",
    assessedBy: "Evaluado por",
    viewOn: "Ver en Lista Roja de la UICN",
    decreasing: "En disminución",
    lowerRisk: "Menor riesgo",
    higherRisk: "Mayor riesgo",
  },
} as const;

describe.each([
  ["en", CATEGORY_LABELS.en, LOCALE_UI.en],
  ["es", CATEGORY_LABELS.es, LOCALE_UI.es],
] as const)(
  "ConservationStatus localization (%s)",
  (locale, categoryLabels, ui) => {
    it.each(Object.entries(categoryLabels))(
      "renders the localized label for %s",
      (category, label) => {
        render(<ConservationStatus category={category} locale={locale} />);

        expect(screen.getByText(ui.heading)).toBeInTheDocument();
        expect(screen.getByText(category)).toBeInTheDocument();
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    );

    it("renders localized trend and footer labels", () => {
      render(
        <ConservationStatus
          category="EN"
          locale={locale}
          populationTrend="decreasing"
          assessmentDate="2024-05-01"
          iucnUrl="https://www.iucnredlist.org/species/123"
        />
      );

      expect(screen.getByText(ui.heading)).toBeInTheDocument();
      expect(screen.getByText(ui.decreasing)).toBeInTheDocument();
      expect(screen.getByText(ui.populationTrend)).toBeInTheDocument();
      expect(
        screen.getByText(`${ui.assessedBy}: IUCN 2024`)
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: ui.viewOn })).toHaveAttribute(
        "href",
        "https://www.iucnredlist.org/species/123"
      );
    });

    it("renders localized scale labels", () => {
      render(<ConservationScale currentCategory="EN" locale={locale} />);

      expect(screen.getByText(ui.lowerRisk)).toBeInTheDocument();
      expect(screen.getByText(ui.higherRisk)).toBeInTheDocument();
    });
  }
);
