import { CART_API_BASE_URL } from "./config";

export class AuthRequiredError extends Error {
    constructor() {
        super("AUTH_REQUIRED");
        this.name = "AuthRequiredError";
    }
}

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

function ensureAuth(): string {
    const token = getToken();
    if (!token) {
        throw new AuthRequiredError();
    }
    return token;
}

function getAuthHeaders(): Record<string, string> {
    const token = getToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

export function isLoggedIn(): boolean {
    return !!getToken();
}

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

export async function addToCart(payload: AddCartItemRequest): Promise<AddCartResponse> {
    ensureAuth();
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

export async function updateCartItem(productId: string, quantity: number): Promise<any> {
    ensureAuth();
    const response = await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/${productId}/quantity/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(quantity),
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

export async function removeFromCart(cartDetailId: string): Promise<any> {
    ensureAuth();
    const response = await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/${cartDetailId}`, {
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

    if (response.status === 204) {
        return;
    }
    return response.json();
}

export async function getCartList(): Promise<CartListResponse> {
    // GET /cart/list is permitAll on backend — no auth required to view
    const response = await fetch(`${CART_API_BASE_URL}/tokyo/gropup/cart/list`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

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
        } catch (e) {
            // Ignored
        }
        throw new Error(errorMsg);
    }

    return response.json();
}
