const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

class ApiCLient {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
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

    async createTask(heading, link, startDate) {
        return this.request("/task/create-task", {
            method: 'POST',
            body: JSON.stringify({ heading, link, startDate })
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

    async completeRevision(taskId) {
        return this.request("/task/complete-revision", {
            method: 'PATCH',
            body: JSON.stringify({taskId})
        })
    }

    async deleteTask(taskId) {
        return this.request("/task/delete-task", {
            method: 'DELETE',
            body: JSON.stringify({taskId})
        })
    }

    // utility

    async exportToPdf(){
        return this.request("/utility/export-to-pdf",{
            method:'GET',
        })
    }


}