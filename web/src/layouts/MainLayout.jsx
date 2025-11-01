import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/navbar/MainNavbar";
import { useAuth } from "../contexts/auth";
import LoadingMessage from "../components/LoadingMessage";

export default function MainLayout({ isProtected = false }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingMessage message="Vérification de l'authentification..." />;

    if (isProtected && !user) {
        return <Navigate to="/login" replace />;
    }

    if (!isProtected && user) {
        return <Navigate to="/" replace />;
    }

    if (isProtected && user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />

                <main className="flex-grow container mx-auto px-6 py-4">
                    <Outlet />
                </main>

                <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
                    © 2025 E-commerce. Tous droits réservés.
                </footer>
            </div>
        );
    }

    if (!isProtected) {
        return (
            <div className="min-h-screen flex flex-col">
                <main className="flex-grow container mx-auto px-6 py-4">
                    <Outlet />
                </main>
            </div>
        );
    }

    return null; 
}
