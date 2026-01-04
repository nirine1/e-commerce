import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import { Trash2, Minus, Plus } from "lucide-react";

const CartItemList = ({ items, updateCartItem, removeCartItem }) => {
    return (
        <div className="space-y-6">
            {items.length === 0 && (
                <p>Votre panier est vide.</p>
            )}
            {items.map((item) => (
                <div className="flex flex-row w-full h-36 items-center gap-6 overflow-hidden" key={item.id}>
                    <img className="w-36 h-full object-cover" src={item.product.primary_image.image_url} alt={item.product.name} />
                    <div className="flex flex-col justify-between w-full h-full">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">{item.product.name}</h2>
                                <Button 
                                    variant="link"
                                    size="xs"
                                    className="hover:text-destructive"
                                    onClick={() => removeCartItem(item.id)}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                            <span>{`${item.quantity} ${item.quantity > 1 ? 'articles' : 'article'}`}</span>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <div className="font-semibold">
                                {item.subtotal.toFixed(2)}€
                            </div>
                            <div>
                                <ButtonGroup
                                    aria-label="Cart item quantity controls"
                                    className="w-fit"
                                >
                                    <Button variant="outline" size="icon" onClick={() => updateCartItem(item.id, item.quantity - 1)}>
                                        <Minus />
                                    </Button>
                                    <ButtonGroupText asChild>
                                        <Label htmlFor="name">{item.quantity}</Label>
                                    </ButtonGroupText>
                                    <Button variant="outline" size="icon" onClick={() => updateCartItem(item.id, item.quantity + 1)}>
                                        <Plus />
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CartItemList;