"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Fetch all users (for Admin dashboard)
export const getAllUsers = async () => {
  try {
    const res = await fetch(`${baseUrl}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, message: data.message || "Failed to fetch users" };
  } catch (error) {
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// Fetch user profile details by email
export const getUserByEmail = async (email) => {
  try {
    const res = await fetch(`${baseUrl}/users/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, message: data.message || "Failed to fetch profile details" };
  } catch (error) {
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// Update user profile details (Freelancer)
export const updateUserProfile = async (email, profileData) => {
  try {
    const res = await fetch(`${baseUrl}/users/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, message: data.message || "Failed to update profile" };
  } catch (error) {
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// Check whether a user account is blocked (used to enforce block at login/dashboards)
// The backend (`/users/:email`) is the single source of truth for `isBlocked`.
export const isUserBlocked = async (email) => {
  if (!email) return { success: true, isBlocked: false };
  try {
    const res = await fetch(`${baseUrl}/users/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, isBlocked: !!data?.isBlocked };
    }
    // On failure, fail open — don't lock users out because the profile API hiccuped.
    return { success: false, isBlocked: false };
  } catch (error) {
    return { success: false, isBlocked: false };
  }
};

// Block/Unblock user account (Admin)
export const toggleBlockUser = async (email, isBlocked) => {
  try {
    const res = await fetch(`${baseUrl}/users/${encodeURIComponent(email)}/block`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isBlocked }),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, message: data.message || "Failed to update block status" };
  } catch (error) {
    return { success: false, message: error.message || "Something went wrong" };
  }
};
