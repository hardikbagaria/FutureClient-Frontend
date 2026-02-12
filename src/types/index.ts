// Enums
export enum UnitType {
    LITER = 'LITER',
    KILOGRAM = 'KILOGRAM',
    PIECE = 'PIECE',
    METER = 'METER'
}

export enum PaymentMode {
    CASH = 'CASH',
    CHEQUE = 'CHEQUE',
    UPI = 'UPI',
    NEFT = 'NEFT',
    RTGS = 'RTGS',
    CREDIT = 'CREDIT'
}

export enum AddressType {
    BILLING = 'BILLING',
    SHIPPING = 'SHIPPING'
}

export enum State {
    ANDHRA_PRADESH = 'ANDHRA_PRADESH',
    ARUNACHAL_PRADESH = 'ARUNACHAL_PRADESH',
    ASSAM = 'ASSAM',
    BIHAR = 'BIHAR',
    CHHATTISGARH = 'CHHATTISGARH',
    GOA = 'GOA',
    GUJARAT = 'GUJARAT',
    HARYANA = 'HARYANA',
    HIMACHAL_PRADESH = 'HIMACHAL_PRADESH',
    JHARKHAND = 'JHARKHAND',
    KARNATAKA = 'KARNATAKA',
    KERALA = 'KERALA',
    MADHYA_PRADESH = 'MADHYA_PRADESH',
    MAHARASHTRA = 'MAHARASHTRA',
    MANIPUR = 'MANIPUR',
    MEGHALAYA = 'MEGHALAYA',
    MIZORAM = 'MIZORAM',
    NAGALAND = 'NAGALAND',
    ODISHA = 'ODISHA',
    PUNJAB = 'PUNJAB',
    RAJASTHAN = 'RAJASTHAN',
    SIKKIM = 'SIKKIM',
    TAMIL_NADU = 'TAMIL_NADU',
    TELANGANA = 'TELANGANA',
    TRIPURA = 'TRIPURA',
    UTTAR_PRADESH = 'UTTAR_PRADESH',
    UTTARAKHAND = 'UTTARAKHAND',
    WEST_BENGAL = 'WEST_BENGAL',
    DELHI = 'DELHI',
    JAMMU_AND_KASHMIR = 'JAMMU_AND_KASHMIR',
    LADAKH = 'LADAKH'
}

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
    total: number;
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
    allocations: {
        billId: number;
        billNumber: string;
        amountAllocated: number;
    }[];
    partyOutstandingAfterPayment: number;
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
    addressType: AddressType;
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
        addressType: string;
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

export interface SalesBillRequest {
    billDate: string;
    salesPartyId: number;
    vehicleDetails?: string;
    modeOfPayment?: PaymentMode;
    dueDate?: string;
    buyerOrderNo?: string;
    termsOfDelivery?: string;
    items: SalesBillItem[];
    transportation?: number;
    roundOff?: number;
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
    allocations: {
        billId: number;
        billNumber: string;
        amountAllocated: number;
    }[];
    partyOutstandingAfterPayment: number;
}

// Ledger Interfaces
export interface LedgerTransaction {
    date: string;
    type: 'BILL' | 'PAYMENT';
    reference: string;
    debit: number;
    credit: number;
    balance: number;
}

export interface PurchaseLedgerResponse {
    partyId: number;
    partyName: string;
    transactions: LedgerTransaction[];
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
}

export interface SalesLedgerResponse {
    partyId: number;
    partyName: string;
    transactions: LedgerTransaction[];
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
}

export interface LedgerSummary {
    partyId: number;
    partyName: string;
    totalDebit: number;
    totalCredit: number;
    balance: number;
}

// Dashboard Interfaces
export interface DashboardSummary {
    totalPurchases: number;
    totalSales: number;
    profit: number;
    pendingPurchasePayments: number;
    pendingSalesCollections: number;
    currentMonthGSTLiability: number;
}

export interface MonthlyTotal {
    year: number;
    month: number;
    totalAmount: number;
    billCount: number;
}

export interface YearlyTrend {
    year: number;
    monthlyData: {
        month: number;
        monthName: string;
        totalAmount: number;
        billCount: number;
    }[];
}

export interface TopVendor {
    partyId: number;
    partyName: string;
    totalAmount: number;
    transactionCount: number;
}

export interface TopCustomer {
    partyId: number;
    partyName: string;
    totalAmount: number;
    transactionCount: number;
}

export interface PendingPayment {
    billId: number;
    billNumber: string;
    partyId: number;
    partyName: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
}

export interface PendingCollection {
    billId: number;
    billNumber: string;
    partyId: number;
    partyName: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
}

// GST Report Interfaces
export interface GSTReport {
    purchaseGST: number;
    salesGST: number;
    netGST: number;
    status: 'PAYABLE' | 'REFUNDABLE';
}
