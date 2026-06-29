"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBIC_BASE_URL || 'http://localhost:4000';

// Record a completed Stripe checkout transaction
export const createPayment = async (paymentData) => {
  try {
    const res = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data, status: res.status };
    }
    return { success: false, message: data.message || "Failed to record payment", status: res.status };
  } catch (error) {
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// Fetch payments (optionally filtered by clientEmail or freelancerEmail)
export const getPayments = async ({ clientEmail, freelancerEmail } = {}) => {
  try {
    const params = new URLSearchParams();
    if (clientEmail) params.set("clientEmail", clientEmail);
    if (freelancerEmail) params.set("freelancerEmail", freelancerEmail);

    const url = params.toString()
      ? `${baseUrl}/payments?${params.toString()}`
      : `${baseUrl}/payments`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, message: data.message || "Failed to fetch payments" };
  } catch (error) {
    return { success: false, message: error.message || "Failed to fetch payments" };
  }
};
