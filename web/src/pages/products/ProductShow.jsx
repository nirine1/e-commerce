import { useParams } from "react-router"
import { useResource } from "../../hooks/use-resource";
import { productService } from "../../services/product";
import ErrorBoundary from "../../components/ErrorBoundary";
import { Suspense } from "react";
import LoadingMessage from "../../components/LoadingMessage";
import { Button } from "../../components/ui/button";
import { Badge } from "@/components/ui/badge"

const ProductShow = () => {
    const params = useParams()
    const getResource = useResource(productService.fetchProductById(params.slug));

    const ShowProduct = () => {
        const product = getResource();

        if (!product || !product.success) {
            return <div>Produit introuvable</div>;
        }

        const productData = product.data.data;

        // Get primary image or first image
        const primaryImage = productData.primary_image?.image_url ||
            productData.images?.[0]?.image_url ||
            "/placeholder.png";

        // Get additional images (exclude primary)
        const additionalImages = productData.images?.filter(img => !img.is_primary) || [];

        // Check if product has dimensions
        const hasDimensions = productData.dimensions?.length ||
            productData.dimensions?.width ||
            productData.dimensions?.height;

        return (
            <div className="mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Images Section */}
                    <div>
                        <div className="aspect-square overflow-hidden rounded-lg border">
                            <img
                                src={primaryImage}
                                alt={productData.primary_image?.alt_text || productData.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        {additionalImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {additionalImages.slice(0, 4).map((img) => (
                                    <button
                                        key={img.id}
                                        className="aspect-square overflow-hidden rounded-lg border hover:ring-2 hover:ring-black"
                                    >
                                        <img
                                            src={img.image_url}
                                            alt={img.alt_text || ""}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {productData.name}
                            </h1>

                            {/* SKU */}
                            <p className="mt-2 text-sm text-gray-500">
                                SKU: {productData.sku}
                            </p>

                            {/* Categories */}
                            {productData.categories && productData.categories.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {productData.categories.map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            {category.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Short Description */}
                            {productData.short_description && (
                                <p className="mt-4 text-gray-600">
                                    {productData.short_description}
                                </p>
                            )}

                            {/* Price */}
                            <div className="mt-6 flex items-center gap-3">
                                <span className="text-3xl font-bold text-gray-900">
                                    {productData.price.toLocaleString("fr-FR", {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </span>
                                {productData.compare_price && productData.compare_price > productData.price && (
                                    <span className="text-xl text-gray-500 line-through">
                                        {productData.compare_price.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: "EUR",
                                        })}
                                    </span>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="mt-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${productData.in_stock
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {productData.in_stock
                                        ? `En stock (${productData.quantity} disponible${productData.quantity > 1 ? 's' : ''})`
                                        : 'Rupture de stock'}
                                </span>
                            </div>

                            {/* Add to Cart */}
                            <div className="mt-6 flex items-center space-x-3">
                                <Button disabled={!productData.in_stock} >
                                    {productData.in_stock ? 'Ajouter au panier' : 'Indisponible'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails du produit</h2>

                    {/* Description */}
                    {productData.description && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 whitespace-pre-line">
                                {productData.description}
                            </p>
                        </div>
                    )}

                    {/* Specifications Grid */}
                    {(hasDimensions || productData.weight) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Spécifications</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-6">
                                {productData.weight && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Poids</span>
                                        <p className="text-base text-gray-900">{productData.weight} kg</p>
                                    </div>
                                )}
                                {productData.dimensions?.length && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Longueur</span>
                                        <p className="text-base text-gray-900">{productData.dimensions.length} cm</p>
                                    </div>
                                )}
                                {productData.dimensions?.width && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Largeur</span>
                                        <p className="text-base text-gray-900">{productData.dimensions.width} cm</p>
                                    </div>
                                )}
                                {productData.dimensions?.height && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Hauteur</span>
                                        <p className="text-base text-gray-900">{productData.dimensions.height} cm</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">SKU:</span>
                                <span className="text-gray-900 font-medium">{productData.sku}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Disponibilité:</span>
                                <span className="text-gray-900 font-medium">
                                    {productData.in_stock ? 'En stock' : 'Rupture de stock'}
                                </span>
                            </div>
                            {productData.categories && productData.categories.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Catégories:</span>
                                    <span className="text-gray-900 font-medium">
                                        {productData.categories.map(c => c.name).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
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