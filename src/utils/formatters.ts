import dayjs from 'dayjs';
import { CURRENCY_SYMBOL, DISPLAY_DATE_FORMAT } from './constants';

// Format currency
export const formatCurrency = (amount: number): string => {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

// Format date for display
export const formatDate = (date: string): string => {
    return dayjs(date).format(DISPLAY_DATE_FORMAT);
};

// Format date for API (YYYY-MM-DD)
export const formatDateForAPI = (date: Date | dayjs.Dayjs): string => {
    return dayjs(date).format('YYYY-MM-DD');
};

// Format number
export const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

// Calculate GST amount
export const calculateGST = (amount: number, rate: number = 0.18): number => {
    return amount * rate;
};

// Calculate grand total
export const calculateGrandTotal = (
    amount: number,
    gst: number,
    transportation: number = 0,
    roundOff: number = 0
): number => {
    return amount + gst + transportation + roundOff;
};
