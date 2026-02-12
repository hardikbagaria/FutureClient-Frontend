import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

/**
 * Axios client instance with base configuration
 */
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

/**
 * Request interceptor - Add any auth tokens or custom headers here
 */
apiClient.interceptors.request.use(
    (config) => {
        // You can add authentication tokens here if needed
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle different error status codes
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    console.error('Bad Request:', data);
                    break;
                case 401:
                    console.error('Unauthorized - Please login');
                    // Redirect to login if needed
                    break;
                case 403:
                    console.error('Forbidden - Access denied');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('API Error:', error.message);
            }
        } else if (error.request) {
            // Request made but no response received
            console.error('No response from server. Please check your connection.');
        } else {
            // Something went wrong in setting up the request
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
