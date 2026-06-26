"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Submit a new proposal (freelancer → task)
export const createProposal = async (proposalData) => {
    try {
        const res = await fetch(`${baseUrl}/proposals`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(proposalData),
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to submit proposal', status: res.status };
    } catch (error) {
        return { success: false, message: error.message || 'Something went wrong.' };
    }
};

// Fetch proposals — pass one of: taskId, freelancerEmail, clientEmail
export const getProposals = async ({ taskId, freelancerEmail, clientEmail } = {}) => {
    try {
        const params = new URLSearchParams();
        if (taskId) params.set('taskId', taskId);
        else if (freelancerEmail) params.set('freelancerEmail', freelancerEmail);
        else if (clientEmail) params.set('clientEmail', clientEmail);

        const res = await fetch(`${baseUrl}/proposals?${params.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: 'no-store',
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to fetch proposals', status: res.status };
    } catch (error) {
        return { success: false, message: error.message || 'Failed to fetch proposals' };
    }
};

// Update proposal status: 'accepted' | 'declined' | 'pending'
export const updateProposalStatus = async (proposalId, status) => {
    try {
        const res = await fetch(`${baseUrl}/proposals/${proposalId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to update proposal', status: res.status };
    } catch (error) {
        return { success: false, message: error.message || 'Something went wrong.' };
    }
};

// Delete a proposal entirely
export const deleteProposal = async (proposalId) => {
    try {
        const res = await fetch(`${baseUrl}/proposals/${proposalId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to delete proposal', status: res.status };
    } catch (error) {
        return { success: false, message: error.message || 'Something went wrong.' };
    }
};
