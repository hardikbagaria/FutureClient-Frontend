import apiClient from './client';
import type { SalesPartyRequest, SalesPartyCreateRequest, SalesPartyResponse, SalesAddressRequest } from '@/types';

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
export const createSalesParty = async (data: SalesPartyCreateRequest): Promise<SalesPartyResponse> => {
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

/**
 * ── Address Management (dedicated endpoints) ─────────────────────────────────
 */

/**
 * Add a new address to an existing sales party
 */
export const addAddressToParty = async (partyId: number, data: SalesAddressRequest): Promise<SalesPartyResponse> => {
    const response = await apiClient.post<SalesPartyResponse>(`/sales/parties/${partyId}/addresses`, data);
    return response.data;
};

/**
 * Edit an existing address of a sales party
 */
export const updatePartyAddress = async (partyId: number, addressId: number, data: SalesAddressRequest): Promise<SalesPartyResponse> => {
    const response = await apiClient.put<SalesPartyResponse>(`/sales/parties/${partyId}/addresses/${addressId}`, data);
    return response.data;
};

/**
 * Delete an address from a sales party
 * Note: Will fail with 500 if the address is referenced by an existing SalesBill — this is intentional.
 */
export const deletePartyAddress = async (partyId: number, addressId: number): Promise<void> => {
    await apiClient.delete(`/sales/parties/${partyId}/addresses/${addressId}`);
};

/**
 * ── Previous Balance (Sales) ────────────────────────────────────────────────
 */

export const getSalesPartyPreviousBalance = async (partyId: number): Promise<import('@/types').PreviousBalanceResponse> => {
    const response = await apiClient.get<import('@/types').PreviousBalanceResponse>(`/sales-parties/previous-balance/party/${partyId}`);
    return response.data;
};

export const saveSalesPartyPreviousBalance = async (data: import('@/types').PreviousBalanceRequest): Promise<import('@/types').PreviousBalanceResponse> => {
    const response = await apiClient.post<import('@/types').PreviousBalanceResponse>('/sales-parties/previous-balance', data);
    return response.data;
};

export const deleteSalesPartyPreviousBalance = async (partyId: number): Promise<void> => {
    await apiClient.delete(`/sales-parties/previous-balance/party/${partyId}`);
};
