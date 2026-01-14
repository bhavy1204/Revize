const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

class ApiCLient {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`

        const isFormData = options.body instanceof FormData;

        const config = {
            ...options,
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers,
            },
            credentials: "include",
        };

        try {
            const res = await fetch(url, config);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "request failed")
            }

            return data;
        } catch (error) {
            throw error
        }

    }


    // AUth methods 

    async register(userData) {
        return this.request('/user/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        })
    }

    async googleLogin(response) {
        return this.request('/user/auth/google', {
            method:'POST',
            body: JSON.stringify({ token: response.credential })
        })
    }

    async login(email, password) {
        return this.request('/user/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    }

    async authMe() {
        return this.request('/user/authMe', {
            method: 'GET'
        })
    }

    async logout() {
        return this.request('/user/logout', {
            method: 'POST'
        })
    }

    async refreshToken() {
        return this.request('/user/refresh-token', {
            method: 'GET'
        })
    }

    // user methods

    async changePassword(oldPassword, newPassword) {
        return this.request("/user/change-password", {
            method: 'PATCH',
            body: JSON.stringify({ oldPassword, newPassword })
        })
    }

    async getUser() {
        return this.request("/user/get-user", {
            method: 'GET',
        })
    }

    async deleteAccount() {
        return this.request("/user/delete-account", {
            method: 'DELETE'
        })
    }

    // task methods 

    async createTask(heading, link, description, startDate, document) {
        const formData = new FormData();

        formData.append("heading", heading);
        formData.append("link", link);
        formData.append("startDate", startDate);

        if (description) formData.append("description", description);
        if (document) formData.append("document", document)

        return this.request("/task/create-task", {
            method: 'POST',
            body: formData
        })
    }

    async getTodayRevision() {
        return this.request("/task/get/today-revision", {
            method: 'GET'
        })
    }

    async getAllPendingRevision() {
        return this.request("/task/get/all-pending-revision", {
            method: 'GET'
        })
    }

    async getAllUpcomingRevisions() {
        return this.request("/task/get/all-upcoming-revision", {
            method: 'GET'
        })
    }

    async completeRevision(taskId) {
        return this.request("/task/complete-revision", {
            method: 'PATCH',
            body: JSON.stringify({ taskId })
        })
    }

    async deleteTask(taskId) {
        return this.request("/task/delete-task", {
            method: 'DELETE',
            body: JSON.stringify({ taskId })
        })
    }

    // utility

    async exportToPdf() {
        const url = `${this.baseURL}/utility/export-to-pdf`;
        const config = {
            method: 'GET',
            credentials: "include", // Ensure cookies are sent
        };

        try {
            const res = await fetch(url, config);

            if (!res.ok) {
                // If response is not OK, attempt to read error as text/JSON
                const errorBody = await res.text();
                try {
                    const errorData = JSON.parse(errorBody);
                    throw new Error(errorData.message || `PDF export failed with status: ${res.status}`);
                } catch (e) {
                    // If it's not valid JSON, just throw the raw text or status
                    throw new Error(`PDF export failed with status: ${res.status}. Response: ${errorBody || res.statusText}`);
                }
            }

            // If response is OK, it must be the PDF blob
            return res.blob();
        } catch (error) {
            console.error("Error during PDF export fetch:", error);
            throw error; // Re-throw the error for frontend to handle
        }
    }

}

export default ApiCLient;