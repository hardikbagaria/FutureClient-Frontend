import apiClient from './client';
import type { SalesBillRequest, SalesBillResponse, SalesCalculateRequest, SalesCalculateResponse } from '@/types';

/**
 * Sales Bills API Service
 */

export const getSalesBills = async (): Promise<SalesBillResponse[]> => {
    const response = await apiClient.get<SalesBillResponse[]>('/sales/bills');
    return response.data;
};

export const createSalesBill = async (data: SalesBillRequest): Promise<SalesBillResponse> => {
    const response = await apiClient.post<SalesBillResponse>('/sales/bills', data);
    return response.data;
};

export const updateSalesBill = async (id: number, data: SalesBillRequest): Promise<SalesBillResponse> => {
    const response = await apiClient.put<SalesBillResponse>(`/sales/bills/${id}`, data);
    return response.data;
};

export const deleteSalesBill = async (id: number): Promise<void> => {
    await apiClient.delete(`/sales/bills/${id}`);
};

/**
 * Real-time calculation preview — values are display only, never stored.
 */
export const calculateSalesBill = async (data: SalesCalculateRequest): Promise<SalesCalculateResponse> => {
    const response = await apiClient.post<SalesCalculateResponse>('/sales/bills/calculate', data);
    return response.data;
};
