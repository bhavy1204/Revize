const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3000/api/v1"

class ApiCLient {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async request(endpoint, options) {
        const url = `${this.baseURL}${endpoint}`
        const config = {
            ...options,
            headers: {
                'ContentType': 'application/json',
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
}