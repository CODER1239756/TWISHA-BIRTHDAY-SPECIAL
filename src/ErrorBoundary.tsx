import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  /** What to show instead of the failed subtree. */
  fallback: ReactNode;
  /** Where the failure happened, for the console. */
  label: string;
  children: ReactNode;
}

/**
 * Keeps one failing part of the app from blanking the whole page. Errors are
 * still reported to the console (never swallowed) so they can be diagnosed.
 */
export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`[${this.props.label}] failed:`, error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
