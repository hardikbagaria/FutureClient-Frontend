import { api, extractArray } from './api';

const BASE_PATH = '/api/parties';

export const partyService = {
    getAll: async () => {
        const response = await api.get(BASE_PATH);
        return extractArray(response);
    },

    getById: (id) => api.get(`${BASE_PATH}/${id}`),

    create: (partyData) => api.post(BASE_PATH, partyData),

    update: (id, partyData) => api.put(`${BASE_PATH}/${id}`, partyData),

    delete: (id) => api.delete(`${BASE_PATH}/${id}`),
};
