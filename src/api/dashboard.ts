import apiClient from './client';
import type {
    DashboardSummaryDto,
    MonthlyTotalDto,
    YearlyTrendDto,
    TopPartyDto,
    PendingPaymentDto,
    GSTLiabilityDto,
} from '@/types';

/**
 * Dashboard API Service
 * Base Path: /api/dashboard
 */

// ── Overall ────────────────────────────────────────────────────────────────────

/** GET /api/dashboard/summary */
export const getDashboardSummary = async (): Promise<DashboardSummaryDto> => {
    const response = await apiClient.get<DashboardSummaryDto>('/dashboard/summary');
    return response.data;
};

// ── Purchase ───────────────────────────────────────────────────────────────────

/** GET /api/dashboard/purchase/monthly-total?year=&month= */
export const getPurchaseMonthlyTotal = async (year: number, month: number): Promise<MonthlyTotalDto> => {
    const response = await apiClient.get<MonthlyTotalDto>('/dashboard/purchase/monthly-total', {
        params: { year, month },
    });
    return response.data;
};

/** GET /api/dashboard/purchase/yearly-trend?year= */
export const getPurchaseYearlyTrend = async (year: number): Promise<YearlyTrendDto> => {
    const response = await apiClient.get<YearlyTrendDto>('/dashboard/purchase/yearly-trend', {
        params: { year },
    });
    return response.data;
};

/** GET /api/dashboard/purchase/top-vendors?limit= */
export const getPurchaseTopVendors = async (limit = 5): Promise<TopPartyDto[]> => {
    const response = await apiClient.get<TopPartyDto[]>('/dashboard/purchase/top-vendors', {
        params: { limit },
    });
    return response.data;
};

/** GET /api/dashboard/purchase/pending-payments */
export const getPurchasePendingPayments = async (): Promise<PendingPaymentDto[]> => {
    const response = await apiClient.get<PendingPaymentDto[]>('/dashboard/purchase/pending-payments');
    return response.data;
};

// ── Sales ──────────────────────────────────────────────────────────────────────

/** GET /api/dashboard/sales/monthly-total?year=&month= */
export const getSalesMonthlyTotal = async (year: number, month: number): Promise<MonthlyTotalDto> => {
    const response = await apiClient.get<MonthlyTotalDto>('/dashboard/sales/monthly-total', {
        params: { year, month },
    });
    return response.data;
};

/** GET /api/dashboard/sales/yearly-trend?year= */
export const getSalesYearlyTrend = async (year: number): Promise<YearlyTrendDto> => {
    const response = await apiClient.get<YearlyTrendDto>('/dashboard/sales/yearly-trend', {
        params: { year },
    });
    return response.data;
};

/** GET /api/dashboard/sales/top-customers?limit= */
export const getSalesTopCustomers = async (limit = 5): Promise<TopPartyDto[]> => {
    const response = await apiClient.get<TopPartyDto[]>('/dashboard/sales/top-customers', {
        params: { limit },
    });
    return response.data;
};

/** GET /api/dashboard/sales/pending-collections */
export const getSalesPendingCollections = async (): Promise<PendingPaymentDto[]> => {
    const response = await apiClient.get<PendingPaymentDto[]>('/dashboard/sales/pending-collections');
    return response.data;
};

// ── GST ────────────────────────────────────────────────────────────────────────

/** GET /api/dashboard/gst/monthly-liability?year=&month= */
export const getGSTMonthlyLiability = async (year: number, month: number): Promise<GSTLiabilityDto> => {
    const response = await apiClient.get<GSTLiabilityDto>('/dashboard/gst/monthly-liability', {
        params: { year, month },
    });
    return response.data;
};

/** GET /api/dashboard/gst/quarterly-summary?year=&quarter= */
export const getGSTQuarterlySummary = async (year: number, quarter: number): Promise<GSTLiabilityDto> => {
    const response = await apiClient.get<GSTLiabilityDto>('/dashboard/gst/quarterly-summary', {
        params: { year, quarter },
    });
    return response.data;
};
