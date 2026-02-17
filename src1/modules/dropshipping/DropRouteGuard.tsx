import React, { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { isTokenValid } from "../../helpers/tokenValidator";

export default function DropRouteGuard({ children }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const tokenValid = isTokenValid();

  useEffect(() => {
    console.log("🛡️ [AdminRouteGuard] Checking access to:", location.pathname);
    console.log("🔑 [AdminRouteGuard] Token valid:", tokenValid);

    // Only redirect if user is trying to access admin routes without valid token
    if (!tokenValid && location.pathname.startsWith("/admin")) {
      console.log(
        "❌ [AdminRouteGuard] No valid token, redirecting to admin login",
      );
      navigate("/auth/admin/login", { replace: true });
    }
  }, [tokenValid, location.pathname, navigate]);

  // If token is valid or user is on login page, render children
  if (tokenValid || location.pathname === "/auth/admin/login") {
    return (
      <>
        <Outlet />
      </>
    );
  }

  // Show loading or nothing while redirecting
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  );
}
