import apiClient from './client';
import type { PartyLedgerDto, LedgerSummaryDto, LedgerTransactionDto } from '@/types';

/**
 * Ledger API Service
 * Base Path: /api/ledger
 */

export interface LedgerDateFilter {
    startDate?: string;
    endDate?: string;
    includePayments?: boolean;
}

// ── Purchase Ledger ──────────────────────────────────────────────────────────

/** GET /api/ledger/purchase/party/{partyId} */
export const getPurchasePartyLedger = async (partyId: number, params?: LedgerDateFilter): Promise<PartyLedgerDto> => {
    const response = await apiClient.get<PartyLedgerDto>(`/ledger/purchase/party/${partyId}`, { params });
    return response.data;
};

/** GET /api/ledger/purchase/all */
export const getPurchaseLedgerSummary = async (params?: LedgerDateFilter): Promise<LedgerSummaryDto[]> => {
    const response = await apiClient.get<LedgerSummaryDto[]>('/ledger/purchase/all', { params });
    return response.data;
};

/** GET /api/ledger/purchase/transactions */
export const getPurchaseAllTransactions = async (params?: LedgerDateFilter): Promise<LedgerTransactionDto[]> => {
    const response = await apiClient.get<LedgerTransactionDto[]>('/ledger/purchase/transactions', { params });
    return response.data;
};

// ── Sales Ledger ──────────────────────────────────────────────────────────────

/** GET /api/ledger/sales/party/{partyId} */
export const getSalesPartyLedger = async (partyId: number, params?: LedgerDateFilter): Promise<PartyLedgerDto> => {
    const response = await apiClient.get<PartyLedgerDto>(`/ledger/sales/party/${partyId}`, { params });
    return response.data;
};

/** GET /api/ledger/sales/all */
export const getSalesLedgerSummary = async (params?: LedgerDateFilter): Promise<LedgerSummaryDto[]> => {
    const response = await apiClient.get<LedgerSummaryDto[]>('/ledger/sales/all', { params });
    return response.data;
};

/** GET /api/ledger/sales/transactions */
export const getSalesAllTransactions = async (params?: LedgerDateFilter): Promise<LedgerTransactionDto[]> => {
    const response = await apiClient.get<LedgerTransactionDto[]>('/ledger/sales/transactions', { params });
    return response.data;
};
