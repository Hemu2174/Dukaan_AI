import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/auth/login" />;

  if (role && userRole !== role) {
    // If exact role required doesn't match, we might redirect depending on their actual role wrapper
    // For example, if helper tries to access owner route, send them to /log
    if (userRole === 'helper') {
      return <Navigate to="/log" />;
    }
    return <Navigate to="/" />;
  }

  return children;
}
