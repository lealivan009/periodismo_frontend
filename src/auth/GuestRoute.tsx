import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { safeNext } from "./redirect";

export function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="boot">
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    const next = safeNext(new URLSearchParams(location.search).get("next"));
    return <Navigate to={next ?? "/app"} replace />;
  }

  return <Outlet />;
}
