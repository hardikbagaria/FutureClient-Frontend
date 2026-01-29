import { api, extractArray } from './api';

export const billService = {
    // Preview calculation (no DB)
    calculate: (items) => api.post('/api/calculate', { items }),

    // Purchase Bill CRUD
    getAll: async () => {
        const response = await api.get('/api/purchase-bills');
        return extractArray(response);
    },

    getById: (id) => api.get(`/api/purchase-bills/${id}`),

    create: (billData) => api.post('/api/purchase-bills', billData),

    update: (id, billData) => api.put(`/api/purchase-bills/${id}`, billData),

    delete: (id) => api.delete(`/api/purchase-bills/${id}`),
};
