import { useState, useCallback } from 'react';
import { productService } from '../services/product';

export const useProductFilters = (initialData) => {
    const [products, setProducts] = useState(initialData.data);
    const [currentPage, setCurrentPage] = useState(initialData.meta.current_page);
    const [totalPages, setTotalPages] = useState(
        Math.ceil(initialData.meta.total / initialData.meta.per_page)
    );
    const updateProducts = useCallback(async (params = {}) => {
        try {
            const response = await productService.fetchProducts(params);
            if (response.success) {
                setProducts(response.data.data);
                setCurrentPage(response.data.meta.current_page);
                setTotalPages(
                    Math.ceil(response.data.meta.total / response.data.meta.per_page)
                );
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données', error);
        } 
    }, []);

    return {
        products,
        currentPage,
        totalPages,
        updateProducts
    };
};