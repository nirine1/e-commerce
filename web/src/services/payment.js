import apiClient from "./api-client";

export const paymentService = {
    checkout: async ({ cartId, successUrl = null, cancelUrl = null }) => {
        try {
            const { data } = await apiClient.post('/checkout', {
                cart_id: cartId,
                success_url: successUrl ?? `${location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl ?? `${location.origin}/cart`
            });

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors du processus de paiement'
            };
        }
    },

    verifyPayment: async ({ sessionId }) => {
        try {
            const { data } = await apiClient.get(`/verify/${sessionId}`);

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la vérification du paiement'
            };
        }
    },
}
