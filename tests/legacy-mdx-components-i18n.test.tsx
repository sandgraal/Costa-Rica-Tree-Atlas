/**
 * Legacy MDX Component i18n Tests
 *
 * These tests ensure that legacy MDX components (SafetyCard, ConservationStatus)
 * properly render localized content based on the locale prop.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  SafetyCard,
  ConservationStatus,
} from "@/components/mdx/server-components";

describe("SafetyCard Component i18n", () => {
  it("should render English labels by default", () => {
    const { container } = render(
      <SafetyCard
        safetyLevel="safe"
        warnings={["Warning 1"]}
        precautions={["Precaution 1"]}
      />
    );

    // Check for English text
    expect(container.textContent).toContain("Safety Overview");
    expect(container.textContent).toContain("Safe");
    expect(container.textContent).toContain("Warnings");
    expect(container.textContent).toContain("Precautions");
  });

  it("should render Spanish labels when locale is 'es'", () => {
    const { container } = render(
      <SafetyCard
        safetyLevel="safe"
        warnings={["Advertencia 1"]}
        precautions={["Precaución 1"]}
        locale="es"
      />
    );

    // Check for Spanish text
    expect(container.textContent).toContain("Resumen de Seguridad");
    expect(container.textContent).toContain("Seguro");
    expect(container.textContent).toContain("Advertencias");
    expect(container.textContent).toContain("Precauciones");
  });

  it("should localize all safety levels in English", () => {
    const levels: Array<"safe" | "caution" | "warning" | "danger"> = [
      "safe",
      "caution",
      "warning",
      "danger",
    ];
    const englishLabels = ["Safe", "Caution", "Warning", "High Risk"];

    levels.forEach((level, index) => {
      const { container } = render(
        <SafetyCard safetyLevel={level} locale="en" />
      );
      expect(container.textContent).toContain(englishLabels[index]);
    });
  });

  it("should localize all safety levels in Spanish", () => {
    const levels: Array<"safe" | "caution" | "warning" | "danger"> = [
      "safe",
      "caution",
      "warning",
      "danger",
    ];
    const spanishLabels = [
      "Seguro",
      "Precaución",
      "Advertencia",
      "Alto Riesgo",
    ];

    levels.forEach((level, index) => {
      const { container } = render(
        <SafetyCard safetyLevel={level} locale="es" />
      );
      expect(container.textContent).toContain(spanishLabels[index]);
    });
  });

  it("should render warning and caution with correct titles in English", () => {
    const { container: warningContainer } = render(
      <SafetyCard safetyLevel="warning" locale="en" />
    );
    expect(warningContainer.textContent).toContain("Safety Warning");

    const { container: cautionContainer } = render(
      <SafetyCard safetyLevel="caution" locale="en" />
    );
    expect(cautionContainer.textContent).toContain("Safety Overview");
  });

  it("should render warning and caution with correct titles in Spanish", () => {
    const { container: warningContainer } = render(
      <SafetyCard safetyLevel="warning" locale="es" />
    );
    expect(warningContainer.textContent).toContain("Advertencia de Seguridad");

    const { container: cautionContainer } = render(
      <SafetyCard safetyLevel="caution" locale="es" />
    );
    expect(cautionContainer.textContent).toContain("Resumen de Seguridad");
  });
});

describe("ConservationStatus Component i18n", () => {
  it("should render English labels by default", () => {
    const { container } = render(
      <ConservationStatus
        code="EN"
        assessed="2020"
        population="Decreasing"
        threats={["Habitat loss"]}
      />
    );

    // Check for English text
    expect(container.textContent).toContain("Assessed:");
    expect(container.textContent).toContain("Population trend:");
    expect(container.textContent).toContain("Threats");
  });

  it("should render Spanish labels when locale is 'es'", () => {
    const { container } = render(
      <ConservationStatus
        code="EN"
        assessed="2020"
        population="En declive"
        threats={["Pérdida de hábitat"]}
        locale="es"
      />
    );

    // Check for Spanish text
    expect(container.textContent).toContain("Evaluado:");
    expect(container.textContent).toContain("Tendencia poblacional:");
    expect(container.textContent).toContain("Amenazas");
  });

  it("should render with assessmentDate when assessed is not provided", () => {
    const { container: enContainer } = render(
      <ConservationStatus code="VU" assessmentDate="2021-01-15" locale="en" />
    );
    expect(enContainer.textContent).toContain("Assessed:");
    expect(enContainer.textContent).toContain("2021-01-15");

    const { container: esContainer } = render(
      <ConservationStatus code="VU" assessmentDate="2021-01-15" locale="es" />
    );
    expect(esContainer.textContent).toContain("Evaluado:");
    expect(esContainer.textContent).toContain("2021-01-15");
  });

  it("should handle missing optional fields gracefully", () => {
    const { container: enContainer } = render(
      <ConservationStatus code="LC" locale="en" />
    );
    expect(enContainer.textContent).toContain("LC");
    expect(enContainer.textContent).not.toContain("Assessed:");
    expect(enContainer.textContent).not.toContain("Population trend:");
    expect(enContainer.textContent).not.toContain("Threats");

    const { container: esContainer } = render(
      <ConservationStatus code="LC" locale="es" />
    );
    expect(esContainer.textContent).toContain("LC");
    expect(esContainer.textContent).not.toContain("Evaluado:");
    expect(esContainer.textContent).not.toContain("Tendencia poblacional:");
    expect(esContainer.textContent).not.toContain("Amenazas");
  });

  it("should render multiple threats with localized heading", () => {
    const threats = ["Threat 1", "Threat 2", "Threat 3"];

    const { container: enContainer } = render(
      <ConservationStatus code="EN" threats={threats} locale="en" />
    );
    expect(enContainer.textContent).toContain("Threats");
    threats.forEach((threat) => {
      expect(enContainer.textContent).toContain(threat);
    });

    const amenazas = ["Amenaza 1", "Amenaza 2", "Amenaza 3"];
    const { container: esContainer } = render(
      <ConservationStatus code="EN" threats={amenazas} locale="es" />
    );
    expect(esContainer.textContent).toContain("Amenazas");
    amenazas.forEach((amenaza) => {
      expect(esContainer.textContent).toContain(amenaza);
    });
  });
});
