import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect when user visits root "/"
    if (location.pathname === "/") {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}
