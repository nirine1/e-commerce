import React from 'react'
import ResourceList from '../../components/ResourceList'
import { productService } from '../../services/product'

const ProductIndex = () => {
    return (
        <>
            <div>ProductIndex</div>
            <ResourceList 
                service={productService.fetchProducts}
                renderItem={(product) => (<span>{product.name}</span>)}
                emptyMessage="Aucun produit trouvé."
                loadingMessage="Chargement des produits..."
            />
        </>
    )
}

export default ProductIndex