import { CART_API_BASE_URL } from "./config";
import { AuthRequiredError, authFetch, getAccessToken, isLoggedIn, refreshIfPossible } from "./authFetch";

export { AuthRequiredError, isLoggedIn };

export function redirectToLogin() {
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

export interface AddCartItemRequest {
    productId: string;
    quantity: number;
    unit: string[];
}

export interface UpdateCartItemRequest {
    productId: string;
    quantity: number;
}

export interface CartItemResponse {
    productName: string;
    quantity: number;
    subTotal: number;
}

export interface AddCartResponse {
    status: number;
    code: string;
    message: string;
    data: CartItemResponse[];
}

export interface CartListItem {
    grandTotal: number | null;
    price: number;
    productName: string;
    productUnit: string;
    quantity: number;
    subTotal: number;
    productId: string;
    cartDetailId: string;
    productUrl?: string;
}

export interface CartListResponse {
    status: number;
    code: string;
    message: string;
    data: {
        grandTotal: number;
        itemList: CartListItem[];
    };
}

type MutationResponse = Record<string, unknown> | void;

export async function addToCart(payload: AddCartItemRequest): Promise<AddCartResponse> {
    const response = await authFetch(`${CART_API_BASE_URL}/tokyo/gropup/cart`, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorMsg = "Failed to add item to cart";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export async function updateCartItem(productId: string, quantity: number): Promise<MutationResponse> {
    const response = await authFetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/${productId}/quantity/`, {
        method: "PATCH",
        body: JSON.stringify(quantity),
    });

    if (!response.ok) {
        let errorMsg = "Failed to update cart item";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export async function removeFromCart(cartDetailId: string): Promise<MutationResponse> {
    const response = await authFetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/${cartDetailId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        let errorMsg = "Failed to remove item from cart";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    if (response.status === 204) {
        return;
    }
    return response.json();
}

export async function getCartList(): Promise<CartListResponse> {
    const token = getAccessToken();
    let response = token
        ? await authFetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/list`, { method: "GET" })
        : await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/list`, { method: "GET" });

    if (!response.ok) {
        if (response.status === 404) {
            return {
                status: 404,
                code: "NOT_FOUND",
                message: "Cart is empty",
                data: {
                    grandTotal: 0,
                    itemList: [],
                },
            };
        }
        let errorMsg = "Failed to fetch cart list";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    const cartResponse = (await response.json()) as CartListResponse;

    if (token && cartResponse.message === "Please login first" && await refreshIfPossible()) {
        response = await authFetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/list`, { method: "GET" });
        return response.json();
    }

    return cartResponse;
}

export async function getCartCount(): Promise<number> {
    try {
        const res = await getCartList();
        if (res.data && res.data.itemList) {
            return res.data.itemList.reduce((sum, item) => sum + item.quantity, 0);
        }
        return 0;
    } catch {
        return 0;
    }
}
