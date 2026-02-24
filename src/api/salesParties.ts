import apiClient from './client';
import type { SalesPartyRequest, SalesPartyResponse } from '@/types';

/**
 * Sales Parties API Service
 */

/**
 * Fetch all sales parties
 */
export const getSalesParties = async (): Promise<SalesPartyResponse[]> => {
    const response = await apiClient.get<SalesPartyResponse[]>('/sales/parties');
    return response.data;
};

/**
 * Fetch a single sales party by ID (used to get address list for bill form)
 */
export const getSalesParty = async (id: number): Promise<SalesPartyResponse> => {
    const response = await apiClient.get<SalesPartyResponse>(`/sales/parties/${id}`);
    return response.data;
};

/**
 * Create a new sales party
 */
export const createSalesParty = async (data: SalesPartyRequest): Promise<SalesPartyResponse> => {
    const response = await apiClient.post<SalesPartyResponse>('/sales/parties', data);
    return response.data;
};

/**
 * Update an existing sales party
 */
export const updateSalesParty = async (id: number, data: SalesPartyRequest): Promise<SalesPartyResponse> => {
    const response = await apiClient.put<SalesPartyResponse>(`/sales/parties/${id}`, data);
    return response.data;
};

/**
 * Delete a sales party
 */
export const deleteSalesParty = async (id: number): Promise<void> => {
    await apiClient.delete(`/sales/parties/${id}`);
};
