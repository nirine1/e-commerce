const ProductDetails = ({ categories, description, dimensions, inStock, sku, weight }) => {
    // Check if product has dimensions
    const hasDimensions = dimensions?.length ||
        dimensions?.width ||
        dimensions?.height;

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails du produit</h2>

            {/* Description */}
            {description && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                        {description}
                    </p>
                </div>
            )}

            {/* Specifications Grid */}
            {(hasDimensions || weight) && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Spécifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-6">
                        {weight && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Poids</span>
                                <p className="text-base text-gray-900">{weight} kg</p>
                            </div>
                        )}
                        {dimensions?.length && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Longueur</span>
                                <p className="text-base text-gray-900">{dimensions.length} cm</p>
                            </div>
                        )}
                        {dimensions?.width && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Largeur</span>
                                <p className="text-base text-gray-900">{dimensions.width} cm</p>
                            </div>
                        )}
                        {dimensions?.height && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Hauteur</span>
                                <p className="text-base text-gray-900">{dimensions.height} cm</p>
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
                        <span className="text-gray-900 font-medium">{sku}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Disponibilité:</span>
                        <span className="text-gray-900 font-medium">
                            {inStock ? 'En stock' : 'Rupture de stock'}
                        </span>
                    </div>
                    {categories && categories.length > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Catégories:</span>
                            <span className="text-gray-900 font-medium">
                                {categories.map(c => c.name).join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductDetails;
