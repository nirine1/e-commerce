import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/auth";

const GuestNavbar = () => {
    const { user, logout } = useAuth();
    
    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <Link to="/products" className="text-2xl font-bold text-blue-600">
                    E-commerce
                </Link>

                <div className="flex space-x-6">
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
                </div>
            </div>
        </nav>
    );
}

export default GuestNavbar;