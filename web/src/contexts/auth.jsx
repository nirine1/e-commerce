import { createContext, useContext, useEffect, useState } from "react";
import { tokenService } from "../services/token";
import { authService } from "../services/auth";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = tokenService.getToken();
            if (token) {
                try {
                    const result = await authService.user(); 
                    if (result.success) {
                        setUser(result.data.user);
                    }
                } catch (err) {
                    tokenService.clearToken();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const result = await authService.login({ email, password });
        if (result.success) {
            tokenService.setToken(result.data.token);
            setUser(result.data.user);
        } else {
            throw new Error(result.error);
        }
    };

    const logout = async () => {
        const result = await authService.logout();
        if(result.success) {
            tokenService.removeToken();        
            setUser(null);
        } else {
            throw new Error(result.error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};
