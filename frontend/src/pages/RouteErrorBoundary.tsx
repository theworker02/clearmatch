import React from "react";
import { Link } from "react-router-dom";

type State = { hasError: boolean };

export class RouteErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="emptyState">
          <h1>Something did not load</h1>
          <p>ClearMatch recovered the route instead of leaving a blank page.</p>
          <Link className="primaryButton" to="/discover">Return to Discover</Link>
        </section>
      );
    }
    return this.props.children;
  }
}
