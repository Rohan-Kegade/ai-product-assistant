import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

function FullPageSpinner() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f8fafc]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Sends logged-out visitors to /login, remembering where they were headed
// (including the #/c/<id> conversation hash).
export function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}

// For /login and /signup: a logged-in user goes straight to the app.
export function RedirectIfAuthenticated({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (user) return <Navigate to={location.state?.from || "/app"} replace />;

  return children;
}
