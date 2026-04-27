import React, { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { useApp } from "./state";
import { NotFound } from "./pages/NotFound";
import { RouteErrorBoundary } from "./pages/RouteErrorBoundary";
import { RouteLoading } from "./pages/RouteLoading";
import { routes } from "./router";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useApp();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <AppShell>{children}</AppShell>;
}

export function AppRouter() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {routes.map((route) => {
            const element = route.redirectTo ? <Navigate to={route.redirectTo} replace /> : route.component ? <route.component /> : <NotFound />;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={route.protected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
              />
            );
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}
