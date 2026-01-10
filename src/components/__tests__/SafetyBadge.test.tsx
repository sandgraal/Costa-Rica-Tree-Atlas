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
    },
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
});
