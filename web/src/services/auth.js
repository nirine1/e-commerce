import apiClient from "./api-client";

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
}