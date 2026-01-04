import CartItemList from "../../components/cart/CartItemList";
import ResourceList from "../../components/ResourceList";
import { Button } from "@/components/ui/button";
import { cartService } from "../../services/cart";
import { useCart } from "../../contexts/cart";

const ShoppingCart = () => {
    const { count, total, updateCartItem, removeCartItem } = useCart();

    return (
        <>
            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight text-balance">Votre panier</h1>

            <div className="grid grid-cols-3 mt-6 gap-6">
                <div className="col-span-2 border-y-2 border-sidebar-accent py-6">
                    <ResourceList
                        service={cartService.fetchCart}
                        renderItems={(items) => <CartItemList 
                                items={items.data?.data?.items ?? []} 
                                updateCartItem={updateCartItem}
                                removeCartItem={removeCartItem}
                            />}
                        emptyMessage="Votre panier est vide."
                        loadingMessage="Chargement des articles..."
                    />
                </div>
                <div className="col-span-1 px-4 py-6 bg-accent">
                    <div className="flex flex-col w-full h-full justify-between gap-6">
                        <div className="space-y-6">
                            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Résumé</h2>

                            {/* Extradiv parce qu'on pourrait ajouter d'autres éléments comme 
                            le prix de livraison, la taxe, etc après, peut-être faire une <ul> */}
                            <div>
                                <div className="flex w-full items-center justify-between font-semibold">
                                    <span>Sous-total ({`${count} ${count > 1 ? 'articles' : 'article'}`})</span>
                                    <span>{total.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Button className="w-full text-md font-semibold" size="lg" disabled={count === 0}>
                                Passer la commande
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ShoppingCart
