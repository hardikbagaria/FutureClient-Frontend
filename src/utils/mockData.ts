import {
    type ItemResponse,
    type PurchasePartyResponse,
    type PurchaseBillResponse,
    type PurchasePaymentResponse,
    type SalesPartyResponse,
    type SalesBillResponse,
    type SalesPaymentResponse,
    type DashboardSummary,
    type LedgerSummary,
    type PurchaseLedgerResponse,
    type SalesLedgerResponse,
    type PendingPayment,
    type PendingCollection,
    type TopVendor,
    type TopCustomer,
    UnitType,
    AddressType,
    State
} from '@/types';

// Mock Items
export const mockItems: ItemResponse[] = [
    { id: 1, description: 'Engine Oil 5W-30 5L', hsn: '271019', unit: UnitType.LITER },
    { id: 2, description: 'Brake Fluid DOT 4 1L', hsn: '382000', unit: UnitType.LITER },
    { id: 3, description: 'Air Filter Premium', hsn: '842139', unit: UnitType.PIECE },
    { id: 4, description: 'Oil Filter Standard', hsn: '842131', unit: UnitType.PIECE },
    { id: 5, description: 'Spark Plug Platinum', hsn: '851110', unit: UnitType.PIECE },
    { id: 6, description: 'Battery 12V 65Ah', hsn: '850710', unit: UnitType.PIECE },
    { id: 7, description: 'Coolant Concentrate 5L', hsn: '382000', unit: UnitType.LITER },
    { id: 8, description: 'Transmission Oil 1L', hsn: '271019', unit: UnitType.LITER },
    { id: 9, description: 'Wiper Blade 22 inch', hsn: '842139', unit: UnitType.PIECE },
    { id: 10, description: 'Brake Pad Set Front', hsn: '870830', unit: UnitType.PIECE },
    { id: 11, description: 'Hydraulic Hose 10m', hsn: '401693', unit: UnitType.METER },
    { id: 12, description: 'Lubricant Grease 5kg', hsn: '271019', unit: UnitType.KILOGRAM },
    { id: 13, description: 'Radiator Cap', hsn: '840999', unit: UnitType.PIECE },
    { id: 14, description: 'Fuel Filter Diesel', hsn: '842139', unit: UnitType.PIECE },
    { id: 15, description: 'Clutch Plate Assembly', hsn: '870893', unit: UnitType.PIECE },
    { id: 16, description: 'Timing Belt', hsn: '401039', unit: UnitType.PIECE },
    { id: 17, description: 'Alternator Belt', hsn: '401039', unit: UnitType.PIECE },
    { id: 18, description: 'Shock Absorber Front', hsn: '870880', unit: UnitType.PIECE },
    { id: 19, description: 'Headlight Bulb H4', hsn: '853922', unit: UnitType.PIECE },
    { id: 20, description: 'Horn 12V Electric', hsn: '851230', unit: UnitType.PIECE },
];

// Mock Purchase Parties
export const mockPurchaseParties: PurchasePartyResponse[] = [
    { id: 1, name: 'ABC Oil Suppliers', gst: '27AABCU9603R1Z1', phoneNumber: '9876543210' },
    { id: 2, name: 'XYZ Auto Parts Ltd', gst: '24AABCX1234F1Z5', phoneNumber: '9876543211' },
    { id: 3, name: 'Prime Filters India', gst: '29PRIME1234G1Z8', phoneNumber: '9876543212' },
    { id: 4, name: 'Battery World', gst: '27BATTW5678H1Z2', phoneNumber: '9876543213' },
    { id: 5, name: 'Auto Components Co', gst: '24AUTOC9012I1Z6', phoneNumber: '9876543214' },
    { id: 6, name: 'Brake Masters Inc', gst: '29BRAKE3456J1Z9', phoneNumber: '9876543215' },
    { id: 7, name: 'Engine Parts Depot', gst: '27ENGINE7890K1Z3', phoneNumber: '9876543216' },
    { id: 8, name: 'Fluid Dynamics Pvt Ltd', gst: '24FLUID1234L1Z7', phoneNumber: '9876543217' },
    { id: 9, name: 'Spark Solutions', gst: '29SPARK5678M1Z0', phoneNumber: '9876543218' },
    { id: 10, name: 'Transmission Tech', gst: '27TRANS9012N1Z4', phoneNumber: '9876543219' },
];

// Mock Purchase Bills
export const mockPurchaseBills: PurchaseBillResponse[] = [
    {
        id: 1,
        billNumber: 'PB-2024-001',
        billDate: '2024-01-15',
        amount: 5000,
        gst: 900,
        total: 5900,
        party: mockPurchaseParties[0],
        items: [
            { id: 1, description: 'Engine Oil 5W-30 5L', quantity: 10, rate: 500, amount: 5000 }
        ]
    },
    {
        id: 2,
        billNumber: 'PB-2024-002',
        billDate: '2024-01-20',
        amount: 8000,
        gst: 1440,
        total: 9440,
        party: mockPurchaseParties[1],
        items: [
            { id: 2, description: 'Air Filter Premium', quantity: 20, rate: 400, amount: 8000 }
        ]
    },
    {
        id: 3,
        billNumber: 'PB-2024-003',
        billDate: '2024-02-01',
        amount: 12000,
        gst: 2160,
        total: 14160,
        party: mockPurchaseParties[2],
        items: [
            { id: 3, description: 'Battery 12V 65Ah', quantity: 10, rate: 1200, amount: 12000 }
        ]
    },
];

// Mock Purchase Payments
export const mockPurchasePayments: PurchasePaymentResponse[] = [
    {
        id: 1,
        partyId: 1,
        partyName: 'ABC Oil Suppliers',
        paymentDate: '2024-01-25',
        amount: 5900,
        modeOfPayment: 'UPI',
        transactionReference: 'UPI/123456789',
        remarks: 'Full payment',
        allocations: [
            { billId: 1, billNumber: 'PB-2024-001', amountAllocated: 5900 }
        ],
        partyOutstandingAfterPayment: 0
    },
    {
        id: 2,
        partyId: 2,
        partyName: 'XYZ Auto Parts Ltd',
        paymentDate: '2024-02-05',
        amount: 5000,
        modeOfPayment: 'NEFT',
        transactionReference: 'NEFT/987654321',
        remarks: 'Partial payment',
        allocations: [
            { billId: 2, billNumber: 'PB-2024-002', amountAllocated: 5000 }
        ],
        partyOutstandingAfterPayment: 4440
    },
];

// Mock Sales Parties
export const mockSalesParties: SalesPartyResponse[] = [
    {
        id: 1,
        name: 'XYZ Motors',
        gst: '27XYZAB1234C1D2',
        phoneNumber: '9123456789',
        addresses: [
            {
                id: 1,
                shopGalaNumber: 'Shop 15',
                buildingName: 'Trade Center',
                compoundAreaName: 'MG Road',
                city: 'Mumbai',
                state: State.MAHARASHTRA,
                pincode: '400001',
                addressType: AddressType.BILLING
            },
            {
                id: 2,
                shopGalaNumber: 'Warehouse 3',
                buildingName: 'Industrial Estate',
                compoundAreaName: 'Andheri East',
                city: 'Mumbai',
                state: State.MAHARASHTRA,
                pincode: '400069',
                addressType: AddressType.SHIPPING
            }
        ]
    },
    {
        id: 2,
        name: 'Quick Service Garage',
        gst: '24QUICK5678E1F3',
        phoneNumber: '9123456790',
        addresses: [
            {
                id: 3,
                shopGalaNumber: 'Unit 7',
                buildingName: 'Auto Complex',
                compoundAreaName: 'Ring Road',
                city: 'Ahmedabad',
                state: State.GUJARAT,
                pincode: '380001',
                addressType: AddressType.BILLING
            }
        ]
    },
    {
        id: 3,
        name: 'Premium Auto Care',
        gst: '29PREMI9012G1H4',
        phoneNumber: '9123456791',
        addresses: [
            {
                id: 4,
                shopGalaNumber: 'Shop 21',
                buildingName: 'Service Station',
                compoundAreaName: 'Main Street',
                city: 'Bangalore',
                state: State.KARNATAKA,
                pincode: '560001',
                addressType: AddressType.BILLING
            }
        ]
    },
];

// Mock Sales Bills
export const mockSalesBills: SalesBillResponse[] = [
    {
        id: 1,
        billNumber: 'SE/2025-26/001',
        billDate: '2025-02-01',
        totalTaxableAmount: 10500,
        gst: 1890,
        transportation: 500,
        roundOff: -10,
        grandTotal: 12880,
        salesParty: {
            id: 1,
            name: 'XYZ Motors',
            gst: '27XYZAB1234C1D2',
            phoneNumber: '9123456789'
        },
        vehicleDetails: 'MH-12-AB-1234',
        modeOfPayment: 'CREDIT',
        dueDate: '2025-03-03',
        buyerOrderNo: 'SE/2025-26/001',
        termsOfDelivery: 'Ex-warehouse',
        items: [
            {
                id: 1,
                serialNumber: 1,
                itemId: 1,
                description: 'Engine Oil 5W-30 5L',
                quantity: 15,
                rate: 700,
                amount: 10500
            }
        ]
    },
    {
        id: 2,
        billNumber: 'SE/2025-26/002',
        billDate: '2025-02-05',
        totalTaxableAmount: 16000,
        gst: 2880,
        transportation: 300,
        roundOff: -20,
        grandTotal: 19160,
        salesParty: {
            id: 2,
            name: 'Quick Service Garage',
            gst: '24QUICK5678E1F3',
            phoneNumber: '9123456790'
        },
        vehicleDetails: 'GJ-01-XY-5678',
        modeOfPayment: 'CREDIT',
        dueDate: '2025-03-07',
        buyerOrderNo: 'SE/2025-26/002',
        termsOfDelivery: 'Door delivery',
        items: [
            {
                id: 2,
                serialNumber: 1,
                itemId: 3,
                description: 'Air Filter Premium',
                quantity: 20,
                rate: 800,
                amount: 16000
            }
        ]
    },
];

// Mock Sales Payments
export const mockSalesPayments: SalesPaymentResponse[] = [
    {
        id: 1,
        partyId: 1,
        partyName: 'XYZ Motors',
        paymentDate: '2025-02-10',
        amountPaid: 12880,
        modeOfPayment: 'CHEQUE',
        transactionReference: 'CHQ-789456',
        remarks: 'Full payment received',
        allocations: [
            { billId: 1, billNumber: 'SE/2025-26/001', amountAllocated: 12880 }
        ],
        partyOutstandingAfterPayment: 0
    },
];

// Mock Dashboard Summary
export const mockDashboardSummary: DashboardSummary = {
    totalPurchases: 29500,
    totalSales: 32040,
    profit: 2540,
    pendingPurchasePayments: 4440,
    pendingSalesCollections: 19160,
    currentMonthGSTLiability: 4770
};

// Mock Top Vendors
export const mockTopVendors: TopVendor[] = [
    { partyId: 3, partyName: 'Prime Filters India', totalAmount: 14160, transactionCount: 1 },
    { partyId: 2, partyName: 'XYZ Auto Parts Ltd', totalAmount: 9440, transactionCount: 1 },
    { partyId: 1, partyName: 'ABC Oil Suppliers', totalAmount: 5900, transactionCount: 1 },
];

// Mock Top Customers
export const mockTopCustomers: TopCustomer[] = [
    { partyId: 2, partyName: 'Quick Service Garage', totalAmount: 19160, transactionCount: 1 },
    { partyId: 1, partyName: 'XYZ Motors', totalAmount: 12880, transactionCount: 1 },
];

// Mock Pending Payments (Purchase)
export const mockPendingPayments: PendingPayment[] = [
    {
        billId: 2,
        billNumber: 'PB-2024-002',
        partyId: 2,
        partyName: 'XYZ Auto Parts Ltd',
        totalAmount: 9440,
        paidAmount: 5000,
        pendingAmount: 4440
    },
];

// Mock Pending Collections (Sales)
export const mockPendingCollections: PendingCollection[] = [
    {
        billId: 2,
        billNumber: 'SE/2025-26/002',
        partyId: 2,
        partyName: 'Quick Service Garage',
        totalAmount: 19160,
        paidAmount: 0,
        pendingAmount: 19160
    },
];

// Mock Purchase Ledger
export const mockPurchaseLedger: PurchaseLedgerResponse = {
    partyId: 1,
    partyName: 'ABC Oil Suppliers',
    transactions: [
        { date: '2024-01-15', type: 'BILL', reference: 'PB-2024-001', debit: 5900, credit: 0, balance: 5900 },
        { date: '2024-01-25', type: 'PAYMENT', reference: 'PMT-001', debit: 0, credit: 5900, balance: 0 },
    ],
    totalDebit: 5900,
    totalCredit: 5900,
    closingBalance: 0
};

// Mock Sales Ledger
export const mockSalesLedger: SalesLedgerResponse = {
    partyId: 1,
    partyName: 'XYZ Motors',
    transactions: [
        { date: '2025-02-01', type: 'BILL', reference: 'SE/2025-26/001', debit: 12880, credit: 0, balance: 12880 },
        { date: '2025-02-10', type: 'PAYMENT', reference: 'RCT-001', debit: 0, credit: 12880, balance: 0 },
    ],
    totalDebit: 12880,
    totalCredit: 12880,
    closingBalance: 0
};

// Mock Ledger Summary (Purchase)
export const mockPurchaseLedgerSummary: LedgerSummary[] = [
    { partyId: 1, partyName: 'ABC Oil Suppliers', totalDebit: 5900, totalCredit: 5900, balance: 0 },
    { partyId: 2, partyName: 'XYZ Auto Parts Ltd', totalDebit: 9440, totalCredit: 5000, balance: 4440 },
    { partyId: 3, partyName: 'Prime Filters India', totalDebit: 14160, totalCredit: 0, balance: 14160 },
];

// Mock Ledger Summary (Sales)
export const mockSalesLedgerSummary: LedgerSummary[] = [
    { partyId: 1, partyName: 'XYZ Motors', totalDebit: 12880, totalCredit: 12880, balance: 0 },
    { partyId: 2, partyName: 'Quick Service Garage', totalDebit: 19160, totalCredit: 0, balance: 19160 },
];
