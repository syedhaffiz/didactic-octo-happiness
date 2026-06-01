// React error boundary with two display styles + auto-reset on dep change.
//
// React still requires class components for error catching — the
// `getDerivedStateFromError` / `componentDidCatch` lifecycle methods have no
// hook equivalents. Consumers use this declaratively though, so the class
// is an implementation detail.
//
// Usage:
//   <ErrorBoundary>                     // page-level fallback (default)
//   <ErrorBoundary level="section" label="Vessels">  // inline alert inside a card
//   <ErrorBoundary resetKeys={[port, origin, grade]}>  // auto-reset when filters change
//   <ErrorBoundary fallback={(err, reset) => ...}>     // fully custom

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, Button, Space } from "antd";

interface Props {
  children: ReactNode;
  /**
   * Visual style of the fallback.
   * - "page" (default): full-bleed alert, used for whole-page failures.
   * - "section": compact alert that fits inside a card/widget slot.
   */
  level?: "page" | "section";
  /**
   * Short noun describing what failed, e.g. "Vessels", "Sales chart".
   * Appears in the fallback message and the console log.
   */
  label?: string;
  /**
   * When any value in this array changes (shallow compare), a previously
   * caught error is cleared automatically. Use it to re-render a failed
   * section after the user changes filters / navigates etc.
   */
  resetKeys?: ReadonlyArray<unknown>;
  /**
   * Fully custom fallback. Receives the error and a reset function.
   * When provided, `level` and `label` are ignored.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

const keysChanged = (
  a: ReadonlyArray<unknown> | undefined,
  b: ReadonlyArray<unknown> | undefined,
): boolean => {
  if (!a || !b) return a !== b;
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return true;
  }
  return false;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const tag = this.props.label ? `[ErrorBoundary:${this.props.label}]` : "[ErrorBoundary]";
    // Dev console surface; wire Application Insights / Sentry here in prod.
    console.error(tag, error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && keysChanged(prev.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    const label = this.props.label ?? "this section";
    if (this.props.level === "section") {
      return (
        <Alert
          type="error"
          showIcon
          message={`Couldn't load ${label}`}
          description={
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <div style={{ wordBreak: "break-word", fontSize: 12 }}>{error.message}</div>
              <Button size="small" onClick={this.reset}>
                Try again
              </Button>
            </Space>
          }
          style={{ margin: 8 }}
        />
      );
    }

    return (
      <div style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
        <Alert
          type="error"
          showIcon
          message="Something went wrong"
          description={
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div style={{ wordBreak: "break-word" }}>{error.message}</div>
              <Space>
                <Button type="primary" onClick={this.reset}>
                  Try again
                </Button>
                <Button onClick={() => window.location.reload()}>Reload page</Button>
              </Space>
            </Space>
          }
        />
      </div>
    );
  }
}
