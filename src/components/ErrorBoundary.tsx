"use client";

import { Component, type ReactNode } from "react";
import { captureException } from "@/lib/error-tracking";

interface ErrorBoundaryMessages {
  title: string;
  description: string;
  tryAgain: string;
  developmentDetails: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  messages?: ErrorBoundaryMessages;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const DEFAULT_ERROR_BOUNDARY_MESSAGES: ErrorBoundaryMessages = {
  title: "Something went wrong / Algo salió mal",
  description:
    "An unexpected error occurred. Please try again. / Ocurrió un error inesperado. Por favor intenta de nuevo.",
  tryAgain: "Try again / Intentar de nuevo",
  developmentDetails:
    "Technical details (development only) / Detalles técnicos (solo en desarrollo)",
};

/**
 * Base error boundary component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught error:", error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error for tracking
    captureException(error, {
      tags: { boundary: "ErrorBoundary" },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const messages = this.props.messages ?? DEFAULT_ERROR_BOUNDARY_MESSAGES;

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">{messages.title}</h2>
            <p className="text-muted-foreground mb-4">{messages.description}</p>
            <button
              onClick={this.reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {messages.tryAgain}
            </button>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer font-semibold mb-2">
                  {messages.developmentDetails}
                </summary>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                  {this.state.error.stack ?? this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
