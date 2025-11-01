import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductSearch from "./ProductSearch";

const ProductList = ({ items }) => {
    const [newItems, setNewItems] = useState(items);
    const searchProduct = (query) => {
        const filteredItems = items.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        );
        setNewItems(filteredItems);
    }
    
    return (
        <div className="flex flex-col gap-6">
            <ProductSearch 
                onSearch={searchProduct}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {newItems.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default ProductList;