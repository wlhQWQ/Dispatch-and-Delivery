import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page on mount
    navigate("/login");
  }, [navigate]);

  return null;
}
