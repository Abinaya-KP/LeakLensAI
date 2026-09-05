import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl font-bold text-gradient-cyan mb-4 font-mono-data">404</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist in LeakLens AI.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 gradient-cyan text-black text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
