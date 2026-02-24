// Const objects replacing enums (compatible with erasableSyntaxOnly)
export const UnitType = {
    LITER: 'LITER',
    KILOGRAM: 'KILOGRAM',
    PIECE: 'PIECE',
    METER: 'METER',
} as const;
export type UnitType = typeof UnitType[keyof typeof UnitType];

export const PaymentMode = {
    CASH: 'CASH',
    CHEQUE: 'CHEQUE',
    UPI: 'UPI',
    NEFT: 'NEFT',
    RTGS: 'RTGS',
    CREDIT: 'CREDIT',
} as const;
export type PaymentMode = typeof PaymentMode[keyof typeof PaymentMode];

export const AddressType = {
    BILLING: 'BILLING',
    SHIPPING: 'SHIPPING',
} as const;
export type AddressType = typeof AddressType[keyof typeof AddressType];

export const State = {
    ANDHRA_PRADESH: 'ANDHRA_PRADESH',
    ARUNACHAL_PRADESH: 'ARUNACHAL_PRADESH',
    ASSAM: 'ASSAM',
    BIHAR: 'BIHAR',
    CHHATTISGARH: 'CHHATTISGARH',
    GOA: 'GOA',
    GUJARAT: 'GUJARAT',
    HARYANA: 'HARYANA',
    HIMACHAL_PRADESH: 'HIMACHAL_PRADESH',
    JHARKHAND: 'JHARKHAND',
    KARNATAKA: 'KARNATAKA',
    KERALA: 'KERALA',
    MADHYA_PRADESH: 'MADHYA_PRADESH',
    MAHARASHTRA: 'MAHARASHTRA',
    MANIPUR: 'MANIPUR',
    MEGHALAYA: 'MEGHALAYA',
    MIZORAM: 'MIZORAM',
    NAGALAND: 'NAGALAND',
    ODISHA: 'ODISHA',
    PUNJAB: 'PUNJAB',
    RAJASTHAN: 'RAJASTHAN',
    SIKKIM: 'SIKKIM',
    TAMIL_NADU: 'TAMIL_NADU',
    TELANGANA: 'TELANGANA',
    TRIPURA: 'TRIPURA',
    UTTAR_PRADESH: 'UTTAR_PRADESH',
    UTTARAKHAND: 'UTTARAKHAND',
    WEST_BENGAL: 'WEST_BENGAL',
    DELHI: 'DELHI',
    JAMMU_AND_KASHMIR: 'JAMMU_AND_KASHMIR',
    LADAKH: 'LADAKH',
} as const;
export type State = typeof State[keyof typeof State];


// Item Interfaces
export interface ItemRequest {
    description: string;
    hsn: string;
    unit: UnitType;
}

export interface ItemResponse {
    id: number;
    description: string;
    hsn: string;
    unit: string;
}

// Purchase Party Interfaces
export interface PurchasePartyRequest {
    name: string;
    gst: string;
    phoneNumber: string;
}

export interface PurchasePartyResponse {
    id: number;
    name: string;
    gst: string;
    phoneNumber: string;
}

// Purchase Bill Interfaces
export interface PurchaseBillItem {
    description: string;
    quantity: number;
    rate: number;
}

export interface PurchaseBillItemResponse {
    id: number;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface PurchaseBillRequest {
    billNumber: string;
    billDate: string;
    partyId: number;
    items: PurchaseBillItem[];
}

export interface PurchaseBillResponse {
    id: number;
    billNumber: string;
    billDate: string;
    amount: number;
    gst: number;
    roundOff: number;
    total: number;   // grand total — always a whole number
    party: {
        id: number;
        name: string;
        gst: string;
        phoneNumber: string;
    };
    items: PurchaseBillItemResponse[];
}

// Purchase Payment Interfaces
export interface PurchasePaymentRequest {
    partyId: number;
    paymentDate: string;
    amount: number;
    modeOfPayment: PaymentMode;
    transactionReference?: string;
    remarks?: string;
}

export interface PurchasePaymentResponse {
    id: number;
    partyId: number;
    partyName: string;
    paymentDate: string;
    amount: number;
    modeOfPayment: string;
    transactionReference: string | null;
    remarks: string | null;
}

// Sales Address Interface
export interface SalesAddress {
    id?: number;
    shopGalaNumber?: string;
    buildingName?: string;
    compoundAreaName?: string;
    city: string;
    state: State;
    pincode: string;
}

// Sales Party Interfaces
export interface SalesPartyRequest {
    name: string;
    gst: string;
    phoneNumber: string;
    addresses: SalesAddress[];
}

export interface SalesPartyResponse {
    id: number;
    name: string;
    gst: string;
    phoneNumber: string;
    addresses: {
        id: number;
        shopGalaNumber: string | null;
        buildingName: string | null;
        compoundAreaName: string | null;
        city: string;
        state: string;
        pincode: string;
    }[];
}

// Sales Bill Interfaces
export interface SalesBillItem {
    itemId: number;
    quantity: number;
    rate: number;
}

export interface SalesBillItemResponse {
    id: number;
    serialNumber: number;
    itemId: number;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

// ── Calculate Preview Types ───────────────────────────────────────────────────

export interface SalesCalculateRequest {
    items: { itemId: number; quantity: number; rate: number }[];
    transportation?: number;
}

export interface SalesCalculateResponse {
    totalTaxableAmount: number;
    gst: number;
    transportation: number;
    suggestedRoundOff: number;
    grandTotal: number;
}

export interface PurchaseCalculateRequest {
    items: { description: string; quantity: number; rate: number }[];
}

export interface PurchaseCalculateResponse {
    taxableAmount: number;
    gst: number;
    total: number;
    suggestedRoundOff: number;
    grandTotal: number;
}

export interface SalesBillRequest {
    billDate: string;
    salesPartyId: number;
    billingAddressId?: number;
    shippingAddressId?: number;
    vehicleDetails?: string;
    modeOfPayment?: PaymentMode;
    dueDate?: string;
    buyerOrderNo?: string;
    termsOfDelivery?: string;
    items: SalesBillItem[];
    transportation?: number;
}

// Address shape as returned inside a bill response
export interface AddressInBillResponse {
    id: number;
    shopGalaNumber: string | null;
    buildingName: string | null;
    compoundAreaName: string | null;
    city: string;
    state: string;
    pincode: string;
}

export interface SalesBillResponse {
    id: number;
    billNumber: string;
    billDate: string;
    totalTaxableAmount: number;
    gst: number;
    transportation: number;
    roundOff: number;
    grandTotal: number;
    salesParty: {
        id: number;
        name: string;
        gst: string;
        phoneNumber: string;
    };
    billingAddress: AddressInBillResponse | null;
    shippingAddress: AddressInBillResponse | null;
    vehicleDetails: string | null;
    modeOfPayment: string | null;
    dueDate: string;
    buyerOrderNo: string;
    termsOfDelivery: string | null;
    items: SalesBillItemResponse[];
}

// Sales Bill Calculation
export interface SalesBillCalculationRequest {
    items: {
        itemId: number;
        quantity: number;
        rate: number;
    }[];
    transportation?: number;
    roundOff?: number;
}

export interface SalesBillCalculationResponse {
    amount: number;
    gst: number;
    transportation: number;
    roundOff: number;
    grandTotal: number;
}

// Sales Payment Interfaces
export interface SalesPaymentRequest {
    partyId: number;
    paymentDate: string;
    amountPaid: number;
    modeOfPayment: PaymentMode;
    transactionReference?: string;
    remarks?: string;
}

export interface SalesPaymentResponse {
    id: number;
    partyId: number;
    partyName: string;
    paymentDate: string;
    amountPaid: number;
    modeOfPayment: string;
    transactionReference: string | null;
    remarks: string | null;
}

// ── Ledger DTOs ──────────────────────────────────────────────────────────────

export interface LedgerTransactionDto {
    date: string;        // LocalDate as ISO string
    type: 'BILL' | 'PAYMENT';
    reference: string;   // Bill number or payment reference
    debit: number;
    credit: number;
    balance: number;
}

export interface PartyLedgerDto {
    partyId: number;
    partyName: string;
    transactions: LedgerTransactionDto[];
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
}

export interface LedgerSummaryDto {
    partyId: number;
    partyName: string;
    totalDebit: number;
    totalCredit: number;
    balance: number;
}

// Legacy aliases kept for backward compat with other pages
export type LedgerTransaction = LedgerTransactionDto;
export type PurchaseLedgerResponse = PartyLedgerDto;
export type SalesLedgerResponse = PartyLedgerDto;
export type LedgerSummary = LedgerSummaryDto;

// ── Dashboard DTOs ────────────────────────────────────────────────────────────

export interface DashboardSummaryDto {
    totalPurchases: number;
    totalSales: number;
    profit: number;
    pendingPurchasePayments: number;
    pendingSalesCollections: number;
    currentMonthGSTLiability: number;
}

/** Legacy alias */
export type DashboardSummary = DashboardSummaryDto;

export interface MonthlyTotalDto {
    year: number;
    month: number;
    totalAmount: number;
    billCount: number;
}

export interface MonthlyDataPoint {
    month: number;
    monthName: string;
    total: number;
    count: number;
}

export interface YearlyTrendDto {
    year: number;
    monthlyData: MonthlyDataPoint[];
}

export interface TopPartyDto {
    partyId: number;
    partyName: string;
    totalAmount: number;
    billCount: number;
}

/** Legacy aliases */
export type TopVendor = TopPartyDto;
export type TopCustomer = TopPartyDto;

export interface PendingPaymentDto {
    billId: number;
    billNumber: string;
    partyId: number;
    partyName: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
}

/** Legacy aliases */
export type PendingPayment = PendingPaymentDto;
export type PendingCollection = PendingPaymentDto;

// ── GST DTO ───────────────────────────────────────────────────────────────────

export interface GSTLiabilityDto {
    purchaseGST: number;
    salesGST: number;
    netGST: number;
    status: 'PAYABLE' | 'REFUNDABLE';
}

/** Legacy alias */
export type GSTReport = GSTLiabilityDto;
