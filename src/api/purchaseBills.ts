import apiClient from './client';
import type { PurchaseBillRequest, PurchaseBillResponse } from '@/types';

/**
 * Purchase Bills API Service
 */

/**
 * Fetch all purchase bills
 */
export const getPurchaseBills = async (): Promise<PurchaseBillResponse[]> => {
    const response = await apiClient.get<PurchaseBillResponse[]>('/purchase/bills');
    return response.data;
};

/**
 * Create a new purchase bill
 */
export const createPurchaseBill = async (data: PurchaseBillRequest): Promise<PurchaseBillResponse> => {
    const response = await apiClient.post<PurchaseBillResponse>('/purchase/bills', data);
    return response.data;
};

/**
 * Delete a purchase bill
 */
export const deletePurchaseBill = async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase/bills/${id}`);
};
