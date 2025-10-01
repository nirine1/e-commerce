const TOKEN_KEY = 'token';

export const tokenService = {
    setToken(token) {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error(error);
        }
    },

    getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    removeToken() {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch (error) {
            console.error(error);
        }
    },

    hasToken() {
        return this.getToken() !== null;
    },

    getAuthHeader() {
        const token = this.getToken();
        return token ? { Authorization: 'Bearer ' + token } : {};
    }
};
