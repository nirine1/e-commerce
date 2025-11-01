import apiClient from "./api-client";
import { getCsrfCookie } from "./api-client";

export const productService = {
    fetchProducts: async ({ page, search = '' } = {}) => {
        try {
            const params = [];
            if (page) params.push(`page=${page}`);
            if (search) params.push(`search=${encodeURIComponent(search)}`);

            const queryString = params.length ? `?${params.join('&')}` : '';
            const { data } = await apiClient.get(`/products${queryString}`);

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération des produits'
            };
        }
    },

    fetchProductById: async (productId) => {
        try {
            const { data } = await apiClient.get(`/products/${productId}`);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération du produit'
            };
        }
    },  
    insertProduct: async (productData) => {
        try {
            const { data } = await apiClient.post('/products', productData);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'insertion du produit'
            };
        }
    },
    updateProduct: async (productId, productData) => {
        try {
            const { data } = await apiClient.put(`/products/${productId}`, productData);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la mise à jour du produit'
            };
        }
    },
    deleteProduct: async (productId) => {
        try {
            const { data } = await apiClient.delete(`/products/${productId}`);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la suppression du produit'
            };
        }
    }
}