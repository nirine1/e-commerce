import apiClient from "./api-client";

export const cartService = {
    fetchCart: async (params) => {
        try {
            const { data } = await apiClient.get('/cart', { params });

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération du panier'
            };
        }
    },

    addToCart: async ({ productId, quantity }) => {
        try {
            const { data } = await apiClient.post('/cart/items', {
                product_id: productId,
                quantity
            });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de l\'ajout du produit dans le panier'
            };
        }
    },
    updateCartItem: async ({ itemId, quantity }) => {
        try {
            const { data } = await apiClient.put(`/cart/items/${itemId}`, {
                quantity
            });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la modification de l\'élément'
            };
        }
    },
    removeCartItem: async ({ itemId }) => {
        try {
            const { data } = await apiClient.delete(`/cart/items/${itemId}`);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la suppression du produit'
            };
        }
    },
    clearCart: async (params) => {
        try {
            const { data } = await apiClient.delete('/cart', { params });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la suppression des éléments'
            };
        }
    }
}
