import { Navigate, Outlet } from "react-router-dom";
import MainNavbar from "../components/navbar/MainNavbar";
import { useAuth } from "../contexts/auth";
import LoadingMessage from "../components/LoadingMessage";
import GuestNavbar from "../components/navbar/GuestNavbar";

export default function MainLayout({ isProtected = false, isAuth = false }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingMessage message="Vérification de l'authentification..." />;

    if (isProtected && !user) {
        return <Navigate to="/login" replace />;
    }

    if (user && isAuth) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <MainNavbar />

            <main className="flex-grow container mx-auto px-6 py-4">
                <Outlet />
            </main>

            <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
                © 2025 E-commerce. Tous droits réservés.
            </footer>
        </div>
    );
}
