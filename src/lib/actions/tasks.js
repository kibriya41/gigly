"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBIC_BASE_URL || 'http://localhost:4000';

export const createTask = async (newTaskData) => {
    try {
        const res = await fetch(`${baseUrl}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTaskData),
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to post task', status: res.status };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message || 'Something went wrong. Please try again.' };
    }
}

export const getTasks = async (email) => {
    try {
        const url = email ? `${baseUrl}/tasks?email=${encodeURIComponent(email)}` : `${baseUrl}/tasks`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: 'no-store',
        });
        const data = await res.json();
        return { success: true, data, status: res.status };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message || 'Failed to fetch tasks' };
    }
}

export const updateTask = async (id, updatedTaskData) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTaskData),
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to update task', status: res.status };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message || 'Something went wrong. Please try again.' };
    }
}

export const deleteTask = async (id) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data, status: res.status };
        }
        return { success: false, message: data.message || 'Failed to delete task', status: res.status };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message || 'Something went wrong. Please try again.' };
    }
}