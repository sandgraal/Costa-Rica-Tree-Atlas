import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafetyBadge } from "../safety/SafetyBadge";
import { NextIntlClientProvider } from "next-intl";

const messages = {
  safety: {
    levels: {
      none: "None",
      low: "Low",
      moderate: "Moderate",
      high: "High",
      severe: "Severe",
    },
    badges: {
      safe: "Safe",
      ariaLabel: "Safety level:",
    },
    unknown: "Unknown",
  },
};

const messagesEs = {
  safety: {
    levels: {
      none: "Ninguno",
      low: "Bajo",
      moderate: "Moderado",
      high: "Alto",
      severe: "Severo",
    },
    badges: {
      safe: "Seguro",
      ariaLabel: "Nivel de seguridad:",
    },
    unknown: "Desconocido",
  },
};

describe("SafetyBadge", () => {
  it("renders none level badge", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="none" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("renders low level badge", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="low" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("renders moderate level badge", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="moderate" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Moderate")).toBeInTheDocument();
  });

  it("renders high level badge", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="high" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders severe level badge", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="severe" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Severe")).toBeInTheDocument();
  });

  it("renders safe badge", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="safe" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Safe")).toBeInTheDocument();
  });

  it("renders without label when showLabel is false", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="high" showLabel={false} />
      </NextIntlClientProvider>
    );
    expect(screen.queryByText("High")).not.toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="severe" />
      </NextIntlClientProvider>
    );
    const badge = container.querySelector('[role="status"]');
    expect(badge).toHaveAttribute("aria-label", "Safety level: Severe");
  });

  it("applies custom className", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SafetyBadge level="low" className="custom-class" />
      </NextIntlClientProvider>
    );
    const badge = container.querySelector(".custom-class");
    expect(badge).toBeInTheDocument();
  });

  // New tests for normalization/alias behavior
  describe("Level normalization and aliases", () => {
    it("normalizes Spanish 'alto' to high level", () => {
      render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="alto" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Alto")).toBeInTheDocument();
    });

    it("normalizes Spanish 'moderado' to moderate level", () => {
      render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="moderado" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Moderado")).toBeInTheDocument();
    });

    it("normalizes Spanish 'bajo' to low level", () => {
      render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="bajo" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Bajo")).toBeInTheDocument();
    });

    it("normalizes Spanish 'severo' to severe level", () => {
      render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="severo" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Severo")).toBeInTheDocument();
    });

    it("normalizes Spanish 'ninguno' to none level", () => {
      render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="ninguno" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Ninguno")).toBeInTheDocument();
    });

    it("handles unknown level gracefully with fallback", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <SafetyBadge level="unknown-level" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });

    it("handles blank level with unknown fallback", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <SafetyBadge level="" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });

    it("handles whitespace-only level with unknown fallback", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <SafetyBadge level="   " />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });

    it("normalizes 'mild' alias to low level", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <SafetyBadge level="mild" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("handles case-insensitive normalization", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <SafetyBadge level="HIGH" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("handles accented Spanish variants (alta -> high)", () => {
      render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="alta" />
        </NextIntlClientProvider>
      );
      expect(screen.getByText("Alto")).toBeInTheDocument();
    });
  });

  describe("Localized aria-label", () => {
    it("uses English aria-label prefix for English locale", () => {
      const { container } = render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <SafetyBadge level="high" />
        </NextIntlClientProvider>
      );
      const badge = container.querySelector('[role="status"]');
      expect(badge).toHaveAttribute("aria-label", "Safety level: High");
    });

    it("uses Spanish aria-label prefix for Spanish locale", () => {
      const { container } = render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="alto" />
        </NextIntlClientProvider>
      );
      const badge = container.querySelector('[role="status"]');
      expect(badge).toHaveAttribute("aria-label", "Nivel de seguridad: Alto");
    });

    it("uses localized aria-label for unknown levels", () => {
      const { container } = render(
        <NextIntlClientProvider locale="es" messages={messagesEs}>
          <SafetyBadge level="unknown-value" />
        </NextIntlClientProvider>
      );
      const badge = container.querySelector('[role="status"]');
      expect(badge).toHaveAttribute(
        "aria-label",
        "Nivel de seguridad: Desconocido"
      );
    });
  });
});
