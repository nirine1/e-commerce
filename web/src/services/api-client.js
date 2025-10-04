import axios from 'axios';

const apiClient = axios.create({
    baseURL: (import.meta.env.VITE_API_URL + '/api') || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true,
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getCsrfCookie = async () => {
    await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/sanctum/csrf-cookie`, {
        withCredentials: true
    });
};

export default apiClient;
