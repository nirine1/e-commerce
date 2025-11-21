import ResourceList from '../../components/ResourceList'
import { productService } from '../../services/product'
import ProductList from '../../components/products/ProductList'

const ProductIndex = () => {
    return (
        <>
            <ResourceList 
                service={productService.fetchProducts}
                renderItems={(items) => <ProductList items={items} />}
                emptyMessage="Aucun produit trouvé."
                loadingMessage="Chargement des produits..."
            />
        </>
    )
}

export default ProductIndex