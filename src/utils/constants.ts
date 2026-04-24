import {
    UnitType,
    PaymentMode,
    PaymentDue,
    State
} from '@/types';

// API Base URL
export const API_BASE_URL = 'http://localhost:8080/api';

// Enum Display Values
export const UNIT_LABELS: Record<UnitType, string> = {
    [UnitType.LITER]: 'LITER',
    [UnitType.KG]: 'KG',
    [UnitType.PIECE]: 'PIECE'
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
    [PaymentMode.CASH]: 'Cash',
    [PaymentMode.CHEQUE]: 'Cheque',
    [PaymentMode.BANK_TRANSFER]: 'Bank Transfer',
    [PaymentMode.UPI]: 'UPI',
    [PaymentMode.CARD]: 'Card'
};

export const PAYMENT_DUE_LABELS: Record<PaymentDue, string> = {
    [PaymentDue.IMMEDIATE]: 'Immediate',
    [PaymentDue.WITHIN_3_DAYS]: 'Within 3 Days',
    [PaymentDue.WITHIN_7_DAYS]: 'Within 7 Days',
    [PaymentDue.WITHIN_45_DAYS]: 'Within 45 Days',
};

export const STATE_LABELS: Record<State, string> = {
    [State.ANDHRA_PRADESH]: 'Andhra Pradesh',
    [State.ARUNACHAL_PRADESH]: 'Arunachal Pradesh',
    [State.ASSAM]: 'Assam',
    [State.BIHAR]: 'Bihar',
    [State.CHHATTISGARH]: 'Chhattisgarh',
    [State.GOA]: 'Goa',
    [State.GUJARAT]: 'Gujarat',
    [State.HARYANA]: 'Haryana',
    [State.HIMACHAL_PRADESH]: 'Himachal Pradesh',
    [State.JHARKHAND]: 'Jharkhand',
    [State.KARNATAKA]: 'Karnataka',
    [State.KERALA]: 'Kerala',
    [State.MADHYA_PRADESH]: 'Madhya Pradesh',
    [State.MAHARASHTRA]: 'Maharashtra',
    [State.MANIPUR]: 'Manipur',
    [State.MEGHALAYA]: 'Meghalaya',
    [State.MIZORAM]: 'Mizoram',
    [State.NAGALAND]: 'Nagaland',
    [State.ODISHA]: 'Odisha',
    [State.PUNJAB]: 'Punjab',
    [State.RAJASTHAN]: 'Rajasthan',
    [State.SIKKIM]: 'Sikkim',
    [State.TAMIL_NADU]: 'Tamil Nadu',
    [State.TELANGANA]: 'Telangana',
    [State.TRIPURA]: 'Tripura',
    [State.UTTAR_PRADESH]: 'Uttar Pradesh',
    [State.UTTARAKHAND]: 'Uttarakhand',
    [State.WEST_BENGAL]: 'West Bengal',
    [State.ANDAMAN_AND_NICOBAR_ISLANDS]: 'Andaman and Nicobar Islands',
    [State.CHANDIGARH]: 'Chandigarh',
    [State.DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU]: 'Dadra and Nagar Haveli and Daman and Diu',
    [State.DELHI]: 'Delhi (NCT)',
    [State.JAMMU_AND_KASHMIR]: 'Jammu and Kashmir',
    [State.LADAKH]: 'Ladakh',
    [State.LAKSHADWEEP]: 'Lakshadweep',
    [State.PUDUCHERRY]: 'Puducherry',
};

// GST Rate
export const GST_RATE = 0.18; // 18%

// Date Format
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD-MM-YYYY';

// Currency Symbol
export const CURRENCY_SYMBOL = '₹';
