import { useCallback, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import ProductSearch from "./ProductSearch";
import CustomPagination from "../../components/CustomPagination";
import { productService } from "../../services/product";

const ProductList = ({ items }) => {
    const [newItems, setNewItems] = useState(items.data.data);
    const [currentPage, setCurrentPage] = useState(1);
    const searchProduct = (query) => {
        productService.fetchProducts({search: query}).then(response => {
            if(response.success) {
                setNewItems(response.data.data);
                setCurrentPage(1);
            }
        });
    }

    const onPageChange = (page) => {
        productService.fetchProducts({page: page}).then(response => {
            if(response.success) {
                setNewItems(response.data.data);
                setCurrentPage(response.data.meta.current_page);
            }
        });
    }

    const totalPages = useMemo(() => {
        return Math.ceil(items.data.meta.total / items.data.meta.per_page);
    }, [newItems]);
    
    return (
        <div className="flex flex-col gap-6">
            <CustomPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
            <ProductSearch 
                onSearch={searchProduct}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {newItems.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default ProductList;