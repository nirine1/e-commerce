import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/auth";

export default function RouteLayout({ isProtected = false }) {
    const { user, loading } = useAuth();

    if (loading) return <div>Chargement...</div>;

    // Route protégée 
    if (isProtected && !user) {
        return <Navigate to="/login" replace />;
    }

    // Route publique 
    if (!isProtected && user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}