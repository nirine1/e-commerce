<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Tag(
 *     name="Cart Item",
 *     description="Shopping cart endpoints - manage cart items (requires authentication or session ID for guests)"
 * )
 */
class CartController extends Controller
{
    public function __construct(private CartService $cartService)
    {
    }

    /**
     * @OA\Post(
     *     path="/cart/items",
     *     operationId="store-cart-item",
     *     tags={"Cart Item"},
     *     summary="Add item to cart",
     *     description="Adds a new item to the shopping cart",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","quantity"},
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="quantity", type="integer", example=2),
     *             @OA\Property(property="session_id", type="string", example="abc123xyz", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Cart item created successfully"),
     *     @OA\Response(response=400, description="Bad request"),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreCartItemRequest $request): JsonResource
    {
        $sessionId = $this->cartService->getSessionId($request);
        
        $cartItem = $this->cartService->addItem(
            $request->validated('product_id'),
            $request->validated('quantity'),
            $sessionId
        );

        return CartItemResource::make($cartItem->load('product'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Put(
     *     path="/cart/items/{cartItem}",
     *     operationId="update-cart-item",
     *     tags={"Cart Item"},
     *     summary="Update cart item",
     *     description="Update the quantity of an existing cart item",
     *     @OA\Parameter(
     *         name="cartItem",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="quantity", type="integer", example=3),
     *             @OA\Property(property="session_id", type="string", example="abc123xyz", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cart item updated successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Cart item not found")
     * )
     */
    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem): JsonResource
    {
        $sessionId = $this->cartService->getSessionId($request);
        
        abort_unless(
            $this->cartService->verifyCartItemOwnership($cartItem, $sessionId),
            403,
            'Unauthorized access to cart item'
        );
        
        $cartItem = $this->cartService->updateItem(
            $cartItem,
            $request->validated('quantity')
        );

        return CartItemResource::make($cartItem);
    }

    /**
     * @OA\Delete(
     *     path="/cart/items/{cartItem}",
     *     operationId="delete-cart-item",
     *     tags={"Cart Item"},
     *     summary="Delete a cart item",
     *     description="Delete an existing cart item by ID",
     *     @OA\Parameter(
     *         name="cartItem",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="session_id", type="string", example="abc123xyz", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cart item deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cart item deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Cart item not found")
     * )
     */
    public function destroyItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $sessionId = $this->cartService->getSessionId($request);
        
        abort_unless(
            $this->cartService->verifyCartItemOwnership($cartItem, $sessionId),
            403,
            'Unauthorized access to cart item'
        );
        
        $this->cartService->removeItem($cartItem);
        
        return response()->json([
            'message' => 'Cart item deleted successfully'
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/cart",
     *     operationId="delete-cart",
     *     tags={"Cart Item"},
     *     summary="Delete entire cart",
     *     description="Delete the entire shopping cart with all items",
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="session_id", type="string", example="abc123xyz", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cart deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cart deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Cart not found")
     * )
     */
    public function destroy(Request $request): JsonResponse
    {
        $sessionId = $this->cartService->getSessionId($request);
        $cart = $this->cartService->getUserCart($sessionId);
        
        abort_if(!$cart, 404, 'Cart not found');
        
        abort_unless(
            $this->cartService->verifyCartOwnership($cart, $request),
            403,
            'Unauthorized access to cart'
        );
        
        $this->cartService->clearCart($cart);
        
        return response()->json([
            'message' => 'Cart deleted successfully'
        ]);
    }
}