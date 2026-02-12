import apiClient from './client';
import type { ItemRequest, ItemResponse } from '@/types';

/**
 * Items API Service
 */

/**
 * Fetch all items
 */
export const getItems = async (): Promise<ItemResponse[]> => {
    const response = await apiClient.get<ItemResponse[]>('/items');
    return response.data;
};

/**
 * Create a new item
 */
export const createItem = async (data: ItemRequest): Promise<ItemResponse> => {
    const response = await apiClient.post<ItemResponse>('/items', data);
    return response.data;
};

/**
 * Update an existing item
 */
export const updateItem = async (id: number, data: ItemRequest): Promise<ItemResponse> => {
    const response = await apiClient.put<ItemResponse>(`/items/${id}`, data);
    return response.data;
};

/**
 * Delete an item
 */
export const deleteItem = async (id: number): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
};
