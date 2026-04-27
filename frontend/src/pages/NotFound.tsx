import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="emptyState">
      <h1>Page not found</h1>
      <p>This route does not exist in ClearMatch.</p>
      <Link className="primaryButton" to="/discover">Go to Discover</Link>
    </section>
  );
}
