import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "auth" | "unauth"

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("http://localhost/api/auth/me", {
          credentials: "include",
        });
        setStatus(res.ok ? "auth" : "unauth");
      } catch {
        setStatus("unauth");
      }
    };
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauth") {
    return <Navigate to="/login" replace />;
  }

  return children;
}