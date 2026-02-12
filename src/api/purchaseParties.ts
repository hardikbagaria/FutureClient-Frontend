import apiClient from './client';
import type { PurchasePartyRequest, PurchasePartyResponse } from '@/types';

/**
 * Purchase Parties API Service
 */

/**
 * Fetch all purchase parties
 */
export const getPurchaseParties = async (): Promise<PurchasePartyResponse[]> => {
    const response = await apiClient.get<PurchasePartyResponse[]>('/purchase/parties');
    return response.data;
};

/**
 * Create a new purchase party
 */
export const createPurchaseParty = async (data: PurchasePartyRequest): Promise<PurchasePartyResponse> => {
    const response = await apiClient.post<PurchasePartyResponse>('/purchase/parties', data);
    return response.data;
};

/**
 * Update an existing purchase party
 */
export const updatePurchaseParty = async (id: number, data: PurchasePartyRequest): Promise<PurchasePartyResponse> => {
    const response = await apiClient.put<PurchasePartyResponse>(`/purchase/parties/${id}`, data);
    return response.data;
};

/**
 * Delete a purchase party
 */
export const deletePurchaseParty = async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase/parties/${id}`);
};
