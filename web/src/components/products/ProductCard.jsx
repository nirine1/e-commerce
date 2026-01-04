import { Tag, DollarSign, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../../contexts/cart";

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer" onClick={() => window.location.href = `/products/${product.id}`}>
            <div className="relative">
                <img
                    src={product.images?.[0]?.image_url || "https://www.basketpack.fr/wp-content/uploads/2022/04/comparatif-chaussures-basketball-peak-800x800-c-center.jpg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
                {product.is_featured && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        Featured
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col gap-2">
                <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
                {product.short_description && (
                    <p className="text-gray-500 text-sm line-clamp-2">{product.short_description}</p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                        <DollarSign size={16} /> {product.price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <PackageCheck size={16} /> {product.quantity} en stock
                    </div>
                </div>

                <div className="flex w-full items-center gap-2 mt-3">
                    <Button size="lg" className="w-full" onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product.id, 1)
                    }}>
                        <Tag size={16} /> Ajouter dans le panier
                    </Button>
                </div>
            </div>
        </div>
    )
};

export default ProductCard;
