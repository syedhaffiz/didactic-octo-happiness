// Top-level error boundary. Catches render-time and lifecycle errors from
// anywhere in the tree below it, including lazy chunk failures. Network
// errors thrown inside `useApi` are handled by per-page Alerts; this boundary
// is the last line of defence for everything else.

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, Button, Space } from "antd";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface in the console for dev — in production this is where you'd
    // wire Application Insights / Sentry.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

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
                <Button onClick={() => window.location.reload()}>
                  Reload page
                </Button>
              </Space>
            </Space>
          }
        />
      </div>
    );
  }
}
