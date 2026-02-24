import apiClient from './client';
import type { PartyLedgerDto, LedgerSummaryDto } from '@/types';

/**
 * Ledger API Service
 * Base Path: /api/ledger
 */

// ── Purchase Ledger ──────────────────────────────────────────────────────────

/** GET /api/ledger/purchase/party/{partyId} */
export const getPurchasePartyLedger = async (partyId: number): Promise<PartyLedgerDto> => {
    const response = await apiClient.get<PartyLedgerDto>(`/ledger/purchase/party/${partyId}`);
    return response.data;
};

/** GET /api/ledger/purchase/all */
export const getPurchaseLedgerSummary = async (): Promise<LedgerSummaryDto[]> => {
    const response = await apiClient.get<LedgerSummaryDto[]>('/ledger/purchase/all');
    return response.data;
};

// ── Sales Ledger ──────────────────────────────────────────────────────────────

/** GET /api/ledger/sales/party/{partyId} */
export const getSalesPartyLedger = async (partyId: number): Promise<PartyLedgerDto> => {
    const response = await apiClient.get<PartyLedgerDto>(`/ledger/sales/party/${partyId}`);
    return response.data;
};

/** GET /api/ledger/sales/all */
export const getSalesLedgerSummary = async (): Promise<LedgerSummaryDto[]> => {
    const response = await apiClient.get<LedgerSummaryDto[]>('/ledger/sales/all');
    return response.data;
};
