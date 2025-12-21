import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { LogOut } from 'lucide-react';

const MainNavbar = () => {
    const { user, logout } = useAuth();
    
    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    E-commerce
                </Link>

                <div className="flex space-x-6">
                    {user && (
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-600 hover:text-blue-600 transition-colors"
                            }
                            Accueil
                        ></NavLink>
                    )}

                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            isActive
                                ? "text-blue-600 font-semibold"
                                : "text-gray-600 hover:text-blue-600 transition-colors"
                        }
                    >
                        Produits
                    </NavLink>

                    {user && (
                        <>
                            <div>
                                <span className="mr-4 text-gray-800">Bonjour, {user.email}</span>
                            </div>
                            
                            <button
                                onClick={() => logout()}
                                className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            >
                                Se déconnecter
                                <LogOut className="mr-2 h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default MainNavbar;