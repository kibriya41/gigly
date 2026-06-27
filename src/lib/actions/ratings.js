"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const submitRating = async (ratingData) => {
    try {
        const res = await fetch(`${baseUrl}/ratings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ratingData),
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to submit rating', status: res.status };
    } catch (error) {
        console.error("Error submitting rating:", error);
        return { success: false, message: error.message || 'Something went wrong. Please try again.' };
    }
};

export const getFreelancerRatings = async (freelancerEmail) => {
    try {
        const url = freelancerEmail ? `${baseUrl}/ratings?freelancerEmail=${encodeURIComponent(freelancerEmail)}` : `${baseUrl}/ratings`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: 'no-store',
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to fetch ratings', status: res.status };
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return { success: false, message: error.message || 'Failed to fetch ratings' };
    }
};
