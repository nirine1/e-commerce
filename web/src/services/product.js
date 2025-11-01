import apiClient from "./api-client";
import { getCsrfCookie } from "./api-client";

export const productService = {
    /*fetchProducts: async () => {
        try {
            const { data } = await apiClient.get('/products');
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération des produits'
            };
        }
    },*/
    fetchProducts: async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockData = [
                {
                    id: 1,
                    name: 'Table de Chevet',
                    slug: 'table-chevet',
                    description: 'Table de chevet en bois avec tiroir.',
                    short_description: 'Table de chevet',
                    sku: 'TC001',
                    price: 80.00,
                    compare_price: 100.00,
                    cost_price: 50.00,
                    quantity: 50,
                    min_quantity: 1,
                    weight: 7.000,
                    dimensions_length: 50.00,
                    dimensions_width: 40.00,
                    dimensions_height: 55.00,
                    is_active: true,
                    is_featured: false,
                    meta_title: 'Table de Chevet',
                    meta_description: 'Table pratique pour chambre à coucher',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 2,
                    name: 'Bureau Moderne',
                    slug: 'bureau-moderne',
                    description: 'Bureau en bois massif avec espace de rangement.',
                    short_description: 'Bureau élégant',
                    sku: 'BM002',
                    price: 200.00,
                    compare_price: 250.00,
                    cost_price: 120.00,
                    quantity: 30,
                    min_quantity: 1,
                    weight: 20.000,
                    dimensions_length: 120.00,
                    dimensions_width: 60.00,
                    dimensions_height: 75.00,
                    is_active: true,
                    is_featured: true,
                    meta_title: 'Bureau Moderne',
                    meta_description: 'Bureau en bois massif pour espace de travail',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 3,
                    name: 'Chaise Scandinave',
                    slug: 'chaise-scandinave',
                    description: 'Chaise de style nordique avec pieds en bois clair.',
                    short_description: 'Chaise design',
                    sku: 'CS003',
                    price: 65.00,
                    compare_price: 79.00,
                    cost_price: 40.00,
                    quantity: 100,
                    min_quantity: 1,
                    weight: 5.500,
                    dimensions_length: 45.00,
                    dimensions_width: 45.00,
                    dimensions_height: 85.00,
                    is_active: true,
                    is_featured: false,
                    meta_title: 'Chaise Scandinave',
                    meta_description: 'Chaise nordique moderne et confortable',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 4,
                    name: 'Canapé 3 Places',
                    slug: 'canape-3-places',
                    description: 'Canapé en tissu gris clair, design moderne et confortable.',
                    short_description: 'Canapé gris 3 places',
                    sku: 'CP004',
                    price: 650.00,
                    compare_price: 750.00,
                    cost_price: 400.00,
                    quantity: 10,
                    min_quantity: 1,
                    weight: 45.000,
                    dimensions_length: 200.00,
                    dimensions_width: 85.00,
                    dimensions_height: 90.00,
                    is_active: true,
                    is_featured: true,
                    meta_title: 'Canapé 3 Places',
                    meta_description: 'Canapé moderne et confortable pour salon',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 5,
                    name: 'Buffet en Chêne',
                    slug: 'buffet-chene',
                    description: 'Buffet 3 portes en chêne massif, style rustique.',
                    short_description: 'Buffet rustique',
                    sku: 'BF005',
                    price: 480.00,
                    compare_price: 520.00,
                    cost_price: 300.00,
                    quantity: 20,
                    min_quantity: 1,
                    weight: 60.000,
                    dimensions_length: 150.00,
                    dimensions_width: 45.00,
                    dimensions_height: 90.00,
                    is_active: true,
                    is_featured: false,
                    meta_title: 'Buffet en Chêne',
                    meta_description: 'Buffet rustique en bois massif pour salon ou salle à manger',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 6,
                    name: 'Table Basse Verre et Métal',
                    slug: 'table-basse-verre-metal',
                    description: 'Table basse moderne avec plateau en verre trempé et structure en métal noir.',
                    short_description: 'Table basse design',
                    sku: 'TB006',
                    price: 150.00,
                    compare_price: 180.00,
                    cost_price: 100.00,
                    quantity: 25,
                    min_quantity: 1,
                    weight: 12.000,
                    dimensions_length: 100.00,
                    dimensions_width: 60.00,
                    dimensions_height: 45.00,
                    is_active: true,
                    is_featured: true,
                    meta_title: 'Table Basse Verre et Métal',
                    meta_description: 'Table basse design pour salon contemporain',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 7,
                    name: 'Armoire Penderie Blanche',
                    slug: 'armoire-penderie-blanche',
                    description: 'Grande armoire blanche avec penderie et étagères de rangement.',
                    short_description: 'Armoire moderne',
                    sku: 'AP007',
                    price: 590.00,
                    compare_price: 650.00,
                    cost_price: 400.00,
                    quantity: 15,
                    min_quantity: 1,
                    weight: 75.000,
                    dimensions_length: 180.00,
                    dimensions_width: 60.00,
                    dimensions_height: 200.00,
                    is_active: true,
                    is_featured: false,
                    meta_title: 'Armoire Penderie Blanche',
                    meta_description: 'Armoire spacieuse et élégante pour chambre à coucher',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 8,
                    name: 'Commode 4 Tiroirs',
                    slug: 'commode-4-tiroirs',
                    description: 'Commode en bois clair avec 4 tiroirs spacieux.',
                    short_description: 'Commode bois clair',
                    sku: 'CM008',
                    price: 220.00,
                    compare_price: 260.00,
                    cost_price: 140.00,
                    quantity: 40,
                    min_quantity: 1,
                    weight: 25.000,
                    dimensions_length: 100.00,
                    dimensions_width: 45.00,
                    dimensions_height: 90.00,
                    is_active: true,
                    is_featured: true,
                    meta_title: 'Commode 4 Tiroirs',
                    meta_description: 'Commode pratique et moderne pour chambre ou salon',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 9,
                    name: 'Lampe de Chevet LED',
                    slug: 'lampe-chevet-led',
                    description: 'Lampe de chevet moderne avec lumière LED réglable.',
                    short_description: 'Lampe LED',
                    sku: 'LC009',
                    price: 45.00,
                    compare_price: 60.00,
                    cost_price: 25.00,
                    quantity: 80,
                    min_quantity: 1,
                    weight: 2.000,
                    dimensions_length: 20.00,
                    dimensions_width: 20.00,
                    dimensions_height: 35.00,
                    is_active: true,
                    is_featured: false,
                    meta_title: 'Lampe de Chevet LED',
                    meta_description: 'Lampe moderne et économique pour chambre',
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 10,
                    name: 'Étagère Murale Flottante',
                    slug: 'etagere-murale-flottante',
                    description: 'Étagère murale en bois clair, facile à installer.',
                    short_description: 'Étagère murale',
                    sku: 'EM010',
                    price: 35.00,
                    compare_price: 45.00,
                    cost_price: 20.00,
                    quantity: 120,
                    min_quantity: 1,
                    weight: 3.500,
                    dimensions_length: 80.00,
                    dimensions_width: 20.00,
                    dimensions_height: 5.00,
                    is_active: true,
                    is_featured: false,
                    meta_title: 'Étagère Murale Flottante',
                    meta_description: 'Étagère murale simple et pratique pour la maison',
                    created_at: null,
                    updated_at: null
                }
            ];

            return mockData;
        } catch (error) {
            return {
                success: false,
                error: 'Erreur simulée lors de la récupération des produits'
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