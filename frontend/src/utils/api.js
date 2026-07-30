import { useAuth0Token } from "./useAuth0Toke.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

class ApiCLient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const isFormData = options.body instanceof FormData;

        const config = {
            ...options,
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers,
            },
            credentials: "include",
        };

        const res = await fetch(url, config);

        // If access token expired, try a silent refresh then retry once
        if (res.status === 401 && !options._retry && !endpoint.includes("/refresh-token")) {
            if (this.isRefreshing) {
                // wait for the in-flight refresh, then retry
                return new Promise((resolve, reject) => {
                    this.refreshSubscribers.push((error) => {
                        if (error) reject(error);
                        else resolve(this.request(endpoint, { ...options, _retry: true }));
                    });
                });
            }

            this.isRefreshing = true;
            try {
                await this.refreshToken();
                this.isRefreshing = false;
                this.refreshSubscribers.forEach((cb) => cb(null));
                this.refreshSubscribers = [];
                return this.request(endpoint, { ...options, _retry: true });
            } catch (refreshError) {
                this.isRefreshing = false;
                this.refreshSubscribers.forEach((cb) => cb(refreshError));
                this.refreshSubscribers = [];
                window.dispatchEvent(new Event("auth:logout"));
                throw refreshError;
            }
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "request failed");
        }

        return data;
    }


    // AUth methods 

    async refreshToken() {
        const res = await fetch(`${this.baseURL}/user/refresh-token`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error("refresh failed");
        }
        return res.json();
    }

    async register(userData) {
        return this.request('/user/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        })
    }

    async sendOtp(email) {
        return this.request('/user/otp', {
            method: 'POST',
            body: JSON.stringify({ email })
        })
    }

    async verifyOtp(data) {
        return this.request('/user/verify-otp', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    async googleLogin(response) {
        return this.request('/user/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token: response.credential })
        })
    }

    async gitHubLogin(auth0Token) {
        return this.request("/user/auth/github", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${auth0Token}`,
            },
        });
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

    // push notifications

    // async subscribe(){
    //     return this.request("/notification//subscribe",{
    //         method:'POST'
    //     })
    // }

    // task methods 

    async createTask(heading, link, startDate, description, document) {
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

    async getTask(taskId) {
        return this.request(`/task/get-task/${taskId}`, {
            method: 'GET',
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

    async startRevisionQuiz(taskId, revisionIndex) {
        return this.request(`/task/${taskId}/revisions/${revisionIndex}/quiz/start`, {
            method: 'POST'
        });
    }

    async submitRevisionQuiz(taskId, revisionIndex, answers) {
        return this.request(`/task/${taskId}/revisions/${revisionIndex}/quiz/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers })
        });
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




    

    
