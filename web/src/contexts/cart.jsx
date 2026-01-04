import { createContext, useContext, useEffect, useState } from "react"
import { cartService } from "../services/cart"

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([])
    const [count, setCount] = useState(0)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const result = await cartService.fetchCart()
                if (result.success) {
                    setItems(result.data.data.items)
                    setCount(result.data.data.items_count)

                    setTotal(result.data.data.items.reduce((sum, item) => sum + item.subtotal, 0))
                }
            } catch (err) {
                console.error(`Failed to fetch cart data: ${err}`)
            }
        }
        fetchCartData()
    }, [])

    const fetchCart = async (params) => {
        const result = await cartService.fetchCart({ params })
        if (result.success) {
            setItems(result.data.data.items)
            setCount(result.data.data.items_count)

            setTotal(result.data.data.items.reduce((sum, item) => sum + item.subtotal, 0))
        } else {
            throw new Error(result.error)
        }
    }

    const addToCart = async (productId, quantity) => {
        const result = await cartService.addToCart({ productId, quantity })
        if (result.success) {
            const tmpItems = items.filter((item) => item.product_id !== result.data.data.product_id)
            const newItems = [...tmpItems, result.data.data]

            setItems(newItems)
            setCount(newItems.length)

            setTotal(newItems.reduce((sum, item) => sum + item.subtotal, 0))
        } else {
            throw new Error(result.error)
        }
    }

    const updateCartItem = async (itemId, quantity) => {
        const result = await cartService.updateCartItem({ itemId, quantity })
        if (result.success) {
            const tmpItems = items.filter((item) => item.id !== result.data.data.id)
            const newItems = [...tmpItems, result.data.data]

            setItems(newItems)

            setTotal(newItems.reduce((sum, item) => sum + item.subtotal, 0))
        } else {
            throw new Error(result.error)
        }
    }

    const removeCartItem = async (itemId) => {
        const result = await cartService.removeCartItem({ itemId })
        if (result.success) {
            const newItems = items.filter((item) => item.id !== itemId)

            setItems(newItems)
            setCount(newItems.length)
            setTotal(newItems.reduce((sum, item) => sum + item.subtotal, 0))
        } else {
            throw new Error(result.error)
        }
    }

    const clearCart = async (params) => {
        const result = await cartService.clearCart({ params })
        if (result.success) {
            setItems([])
            setCount(0)
            setTotal(0)
        } else {
            throw new Error(result.error)
        }
    }

    return (
        <CartContext.Provider value={{
            items,
            count,
            total,
            fetchCart,
            addToCart,
            updateCartItem,
            removeCartItem,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const cart = useContext(CartContext)
    if (!cart) {
        throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider")
    }
    return cart
}
