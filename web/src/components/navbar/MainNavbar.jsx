import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import {
    Barcode,
    LogIn,
    LogOut,
    Menu,
    ShoppingCart,
    Home,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useCart } from "../../contexts/cart";

const MainNavbar = () => {
    const { user, logout } = useAuth();
    const { count } = useCart();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    E-commerce
                </Link>

                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="More Options">
                                <Menu />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            {
                                user &&
                                <>
                                    {/* TODO: link to the profile page */}
                                    <DropdownMenuItem
                                        className="cursor-pointer" 
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{user.name}</span>
                                            <span className="text-xs text-gray-500">{user.email}</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            }
                            {
                                !user &&
                                <>
                                    <DropdownMenuItem className="cursor-pointer" asChild>
                                        <NavLink
                                            to="/login"
                                            className={({ isActive }) =>
                                                (isActive
                                                    ? "text-blue-600 font-semibold"
                                                    : "text-gray-600 hover:text-blue-600 transition-colors")
                                                + " flex items-center gap-1"
                                            }
                                        >
                                            <LogIn className="h-4 w-4" />
                                            Se connecter
                                        </NavLink>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            }
                            <DropdownMenuGroup>
                                {user && (
                                    <DropdownMenuItem className="cursor-pointer" asChild>
                                        <NavLink
                                            to="/"
                                            className={({ isActive }) =>
                                                (isActive
                                                    ? "text-blue-600 font-semibold"
                                                    : "text-gray-600 hover:text-blue-600 transition-colors")
                                                + " flex items-center gap-1"
                                            }
                                        >
                                            <Home className="h-4 w-4" />
                                            Accueil
                                        </NavLink>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <NavLink
                                        to="/products"
                                        className={({ isActive }) =>
                                            (isActive
                                                ? "text-blue-600 font-semibold"
                                                : "text-gray-600 hover:text-blue-600 transition-colors")
                                            + " flex items-center gap-1"
                                        }
                                    >
                                        <Barcode className="h-4 w-4" />
                                        Produits
                                    </NavLink>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <NavLink
                                        to="/cart"
                                        className={({ isActive }) =>
                                            (isActive
                                                ? "text-blue-600 font-semibold"
                                                : "text-gray-600 hover:text-blue-600 transition-colors")
                                            + " flex items-center justify-between w-full"
                                        }
                                    >
                                        <div className="flex items-center gap-1">
                                            <ShoppingCart className="h-4 w-4" />
                                            Panier
                                        </div>
                                        <Badge variant="outline">
                                            { count }
                                        </Badge>
                                    </NavLink>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            {user && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            variant="destructive"
                                            onClick={() => logout()}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Se déconnecter
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}

export default MainNavbar;