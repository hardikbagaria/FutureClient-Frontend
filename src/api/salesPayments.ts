import apiClient from './client';
import type { SalesPaymentRequest, SalesPaymentResponse } from '@/types';

/**
 * Sales Payments API Service
 */

/**
 * Fetch all sales payments
 */
export const getSalesPayments = async (): Promise<SalesPaymentResponse[]> => {
    const response = await apiClient.get<SalesPaymentResponse[]>('/sales/payments');
    return response.data;
};

/**
 * Create a new sales payment
 */
export const createSalesPayment = async (data: SalesPaymentRequest): Promise<SalesPaymentResponse> => {
    const response = await apiClient.post<SalesPaymentResponse>('/sales/payments', data);
    return response.data;
};

/**
 * Update an existing sales payment
 */
export const updateSalesPayment = async (id: number, data: SalesPaymentRequest): Promise<SalesPaymentResponse> => {
    const response = await apiClient.put<SalesPaymentResponse>(`/sales/payments/${id}`, data);
    return response.data;
};

/**
 * Delete a sales payment
 */
export const deleteSalesPayment = async (id: number): Promise<void> => {
    await apiClient.delete(`/sales/payments/${id}`);
};

/**
 * Get outstanding (closing balance) for a sales party via the Ledger API.
 * Falls back to 0 if the party has no ledger entries yet.
 */
export const getSalesPartyOutstanding = async (partyId: number): Promise<number> => {
    const response = await apiClient.get<{ closingBalance: number }>(`/ledger/sales/party/${partyId}`);
    return response.data.closingBalance ?? 0;
};
