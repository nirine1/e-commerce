import { Suspense, useCallback } from 'react';
import ProductCard from './ProductCard';
import CustomPagination from '../CustomPagination';
import ProductSearchBar from './ProductSearchBar';
import ProductFilter from './ProductFilter';
import { useProductFilters } from '../../hooks/use-product-filter';
import { buildFilterParams } from '../../utils/common-utils';
import ErrorBoundary from '../ErrorBoundary';
import LoadingMessage from '../LoadingMessage';

const ProductList = ({ items }) => {
    const { products, currentPage, totalPages, updateProducts } = 
        useProductFilters(items.data);

    const handleSearch = useCallback((query) => {
        updateProducts({ search: query, page: 1 });
    }, [updateProducts]);

    const handleFilter = useCallback((filters) => {
        const params = buildFilterParams(filters);
        params.page = 1;
        updateProducts(params);
    }, [updateProducts]);

    const handlePageChange = useCallback((page) => {
        updateProducts({ page });
    }, [updateProducts]);

    return (
        <div className="flex flex-col gap-6">
            <CustomPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            
            <ProductFilter onFilter={handleFilter} />
            
            <ProductSearchBar onSearch={handleSearch} />

            <ErrorBoundary>
                <Suspense fallback={<LoadingMessage message={"Chargement des produits"}/>}>
                
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
};

export default ProductList;