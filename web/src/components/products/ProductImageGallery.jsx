import { useState } from "react";

const ProductImageGallery = ({ primaryImage, productImages }) => {
    const [currentImage, setCurrentImage] = useState(primaryImage);

    return (
        <>
            <div className="aspect-square overflow-hidden rounded-lg border">
                <img
                    src={currentImage.image_url}
                    alt={currentImage.alt_text}
                    className="h-full w-full object-cover"
                />
            </div>
            {productImages.length > 0 && (
                <div className="mt-4 p-2 flex flex-row w-full gap-3 snap-x snap-mandatory scroll-smooth overflow-x-auto">
                    {productImages.map((img, index) => (
                        <button
                            key={img.id}
                            className={`cursor-pointer aspect-square w-24 overflow-hidden rounded-lg border shrink-0 snap-center hover:ring-2 hover:ring-black ${(img.id === currentImage.id) ? "ring-2 ring-black" : ""}`}
                            aria-label={`Voir l'image ${index + 1} sur ${productImages.length} du produit`}
                            aria-current={ img.id === currentImage.id ? "true" : "false" }
                            onClick={() => setCurrentImage(img)}
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
        </>
    )
}

export default ProductImageGallery;
