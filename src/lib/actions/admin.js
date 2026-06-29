"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBIC_BASE_URL || 'http://localhost:4000';

// Fetch platform-wide statistics for the Admin dashboard overview
export const getAdminStats = async () => {
  try {
    const res = await fetch(`${baseUrl}/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, message: data.message || "Failed to fetch stats" };
  } catch (error) {
    return { success: false, message: error.message || "Something went wrong" };
  }
};
