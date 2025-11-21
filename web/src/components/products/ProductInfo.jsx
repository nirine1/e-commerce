import { Button } from "../../components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProductInfo = ({ name, sku, categories, shortDescription, price, comparePrice, inStock, quantity }) => {
    return (
        <>
            <h1 className="text-3xl font-bold text-gray-900">
                { name }
            </h1>

            {/* SKU */}
            <p className="mt-2 text-sm text-gray-500">
                SKU: {sku}
            </p>

            {/* Categories */}
            {categories && categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((category) => (
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
            {shortDescription && (
                <p className="mt-4 text-gray-600">
                    {shortDescription}
                </p>
            )}

            {/* Price */}
            <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                    {price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                    })}
                </span>
                {comparePrice && comparePrice > price && (
                    <span className="text-xl text-gray-500 line-through">
                        {comparePrice.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </span>
                )}
            </div>

            {/* Stock Status */}
            <div className="mt-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {inStock
                        ? `En stock (${quantity} disponible${quantity > 1 ? 's' : ''})`
                        : 'Rupture de stock'}
                </span>
            </div>

            {/* Add to Cart */}
            <div className="mt-6 flex items-center space-x-3">
                <Button disabled={!inStock} >
                    {inStock ? 'Ajouter au panier' : 'Indisponible'}
                </Button>
            </div>
        </>
    )
}

export default ProductInfo;
