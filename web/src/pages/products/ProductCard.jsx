import { Tag, DollarSign, PackageCheck } from "lucide-react";

const ProductCard = ({ product }) => {
    
    return (
        <div className="max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="relative">
                <img
                    src={product.imageUrl || "https://www.basketpack.fr/wp-content/uploads/2022/04/comparatif-chaussures-basketball-peak-800x800-c-center.jpg"}
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
                        <PackageCheck size={16} /> {product.quantity} in stock
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                        <Tag size={16} /> Buy Now
                    </button>
                </div>
            </div>
        </div>
    )
};

export default ProductCard;
