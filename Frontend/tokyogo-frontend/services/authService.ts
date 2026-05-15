import { AUTH_API_BASE_URL } from "./config";

export async function registerUser(name: string, phoneNumber: string, pin: string) {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyo/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phoneNumber,
      pin,
    }),
  });

  if (!response.ok) {
    let errorMsg = "Registration failed";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.text();
}

export async function requestOtp(phoneNumber: string) {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyo/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    let errorMsg = "Failed to request OTP";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.text();
}

export async function verifyOtp(phoneNumber: string, code: string) {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyo/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber, code }),
  });

  if (!response.ok) {
    let errorMsg = "OTP verification failed";
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.text();
}

export interface UserProfile {
  id: string;
  membership: string;
  name: string;
  phoneNumber: string;
}

export async function loginUser(phoneNumber: string, pin: string) {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyo/api-auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber,
      pin,
    }),
  });

  if (!response.ok) {
    let errorMsg = "Login failed";
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

export async function getCurrentUser(token: string): Promise<UserProfile> {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyo/api-auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMsg = "Failed to fetch user profile";
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

export interface UserDataResponse {
  username: string;
  phoneNumber: string;
  membership: string;
  password: string;
  address: string[];
}

export async function getUserProfile(token: string): Promise<UserDataResponse> {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyogo/user/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMsg = "Failed to fetch user profile";
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

export interface UserAddress {
  addressId: string;
  recipientName: string;
  recipientPhoneNumber: string;
  notes: string;
  address: string;
  city: string;
  province: string;
  label: string;
  postalCode: string;
  isDefaultShipping: boolean;
}

export async function getUserAddressList(token: string): Promise<UserAddress[]> {
  const response = await fetch(`${AUTH_API_BASE_URL}/tokyogo/user/address/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMsg = "Failed to fetch addresses";
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
