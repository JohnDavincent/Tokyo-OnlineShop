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
