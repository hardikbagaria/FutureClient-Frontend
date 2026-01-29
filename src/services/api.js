// API requests will be proxied through Vite to the backend
const API_BASE_URL = '';

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 204) {
            return null; // No content
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw {
                status: response.status,
                message: data?.message || `HTTP error ${response.status}`,
                data,
            };
        }

        return data;
    } catch (error) {
        if (error.status) {
            throw error; // Re-throw API errors
        }
        throw {
            status: 0,
            message: 'Network error - is the backend running?',
            data: null,
        };
    }
}

// Helper to extract array from responses (handles paginated/wrapped responses)
export function extractArray(response) {
    if (Array.isArray(response)) {
        return response;
    }
    // Handle Spring Boot paginated responses
    if (response?.content && Array.isArray(response.content)) {
        return response.content;
    }
    // Handle wrapped responses like { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
        return response.data;
    }
    return [];
}

export const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

