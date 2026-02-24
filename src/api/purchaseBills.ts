import apiClient from './client';
import type { PurchaseBillRequest, PurchaseBillResponse, PurchaseCalculateRequest, PurchaseCalculateResponse } from '@/types';

/**
 * Purchase Bills API Service
 */

export const getPurchaseBills = async (): Promise<PurchaseBillResponse[]> => {
    const response = await apiClient.get<PurchaseBillResponse[]>('/purchase/bills');
    return response.data;
};

export const createPurchaseBill = async (data: PurchaseBillRequest): Promise<PurchaseBillResponse> => {
    const response = await apiClient.post<PurchaseBillResponse>('/purchase/bills', data);
    return response.data;
};

export const updatePurchaseBill = async (id: number, data: PurchaseBillRequest): Promise<PurchaseBillResponse> => {
    const response = await apiClient.put<PurchaseBillResponse>(`/purchase/bills/${id}`, data);
    return response.data;
};

export const deletePurchaseBill = async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase/bills/${id}`);
};

/**
 * Real-time calculation preview — values are display only, never stored.
 */
export const calculatePurchaseBill = async (data: PurchaseCalculateRequest): Promise<PurchaseCalculateResponse> => {
    const response = await apiClient.post<PurchaseCalculateResponse>('/purchase/bills/calculate', data);
    return response.data;
};
