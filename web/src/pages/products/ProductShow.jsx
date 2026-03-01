import { Suspense, useMemo } from "react";
import { useParams } from "react-router"
import { useResource } from "../../hooks/use-resource";
import { productService } from "../../services/product";
import ErrorBoundary from "../../components/ErrorBoundary";
import LoadingMessage from "../../components/LoadingMessage";
import ProductDetails from "../../components/products/ProductDetails";
import ProductImageGallery from "../../components/products/ProductImageGallery";
import ProductInfo from "../../components/products/ProductInfo";

const ProductShow = () => {
    const params = useParams()
    const resource = useMemo(() => {
        return productService.fetchProductById(params.slug);
    }, [params.slug]);
    const getResource = useResource(resource);

    const ShowProduct = () => {
        const product = getResource();

        if (!product || !product.success) {
            return <div>Produit introuvable</div>;
        }

        const productData = product.data.data;

        // Get primary image or first image
        const primaryImage = productData.primary_image ||
            productData.images?.[0] ||
            {
                id: Math.floor(Math.random() * 100),
                alt_text: productData.name,
                image_url: '/placeholder.png'
            };

        // Get product images
        const productImages = productData.images || [];

        return (
            <div className="mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Images Section */}
                    <div>
                        <ProductImageGallery primaryImage={primaryImage} productImages={productImages} />
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <ProductInfo 
                                id={productData.id}
                                name={productData.name}
                                sku={productData.sku}
                                categories={productData.categories}
                                shortDescription={productData.short_description}
                                price={productData.price}
                                comparePrice={productData.compare_price}
                                inStock={productData.in_stock}
                                quantity={productData.quantity}
                            />
                        </div>
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="mt-12">
                    <ProductDetails
                        categories={productData.categories}
                        description={productData.description}
                        dimensions={productData.dimensions}
                        inStock={productData.in_stock}
                        sku={productData.sku}
                        weight={productData.weight}
                    />
                </div>
            </div>

        );
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingMessage message="Chargement..." />}>
                <ShowProduct />
            </Suspense>
        </ErrorBoundary>
    )
}

export default ProductShow;