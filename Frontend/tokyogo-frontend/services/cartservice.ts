import { CART_API_BASE_URL } from "./config";

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

export interface AddCartItemRequest {
    productId: string;
    quantity: number;
    unit: string[];
}

export interface UpdateCartItemRequest {
    productName: string;
    quantity: number;
    productUnit: string;
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

export async function addToCart(payload: AddCartItemRequest): Promise<AddCartResponse> {
    const response = await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorMsg = "Failed to add item to cart";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch (e) {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export async function updateCartItem(payload: UpdateCartItemRequest): Promise<AddCartResponse> {
    const response = await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/update`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorMsg = "Failed to update cart item";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch (e) {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export async function removeFromCart(productName: string, productUnit: string): Promise<AddCartResponse> {
    const response = await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart?productName=${encodeURIComponent(productName)}&productUnit=${encodeURIComponent(productUnit)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        let errorMsg = "Failed to remove item from cart";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch (e) {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export async function getCartList(): Promise<CartListResponse> {
    const response = await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/list`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        let errorMsg = "Failed to fetch cart list";
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch (e) {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    return response.json();
}
