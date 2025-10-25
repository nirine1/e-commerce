import apiClient from "./api-client";
import { getCsrfCookie } from "./api-client";

export const authService = {
    register: async (userData) => {
        try {
            const { data } = await apiClient.post('/register', {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                password_confirmation: userData.passwordConfirmation
            });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'inscription'
            };
        }
    },
    login: async (userData) => {
        try {
            const { data } = await apiClient.post('/login', {
                email: userData.email,
                password: userData.password,
            });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la connexion'
            };
        }
    },
    logout: async (userData) => {
        try {
            const { data } = await apiClient.post('/logout', {});
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la déconnexion'
            };
        }
    },
    forgotPassword: async (userData) => {
        try {
            await getCsrfCookie();
            const { data } = await apiClient.post('/forgot-password', {
                email: userData.email,
            });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Une erreur est survenue'
            };
        }
    },
    resetPassword: async (userData) => {
        try {
            await getCsrfCookie();            
            const { data } = await apiClient.post('/reset-password', {
                email: userData.email,
                token: userData.token,
                password: userData.password,
                password_confirmation: userData.passwordConfirmation
            });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Une erreur est survenue'
            };
        }
    },
    user: async () => {
        try {
            const { data } = await apiClient.get('/user');
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur'
            };
        }
    }
}
