import apiClient from './client';
import type { PurchasePaymentRequest, PurchasePaymentResponse } from '@/types';

/**
 * Purchase Payments API Service
 */

/**
 * Fetch all purchase payments
 */
export const getPurchasePayments = async (): Promise<PurchasePaymentResponse[]> => {
    const response = await apiClient.get<PurchasePaymentResponse[]>('/purchase/payments');
    return response.data;
};

/**
 * Create a new purchase payment
 */
export const createPurchasePayment = async (data: PurchasePaymentRequest): Promise<PurchasePaymentResponse> => {
    const response = await apiClient.post<PurchasePaymentResponse>('/purchase/payments', data);
    return response.data;
};

/**
 * Update an existing purchase payment
 */
export const updatePurchasePayment = async (id: number, data: PurchasePaymentRequest): Promise<PurchasePaymentResponse> => {
    const response = await apiClient.put<PurchasePaymentResponse>(`/purchase/payments/${id}`, data);
    return response.data;
};

/**
 * Delete a purchase payment
 */
export const deletePurchasePayment = async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase/payments/${id}`);
};

/**
 * Get pending amount for a purchase party
 */
export const getPartyOutstanding = async (partyId: number): Promise<number> => {
    const response = await apiClient.get<number>(`/purchase/payments/pending-amount/${partyId}`);
    return response.data;
};

