import { useState } from 'react';
import { Card, Select, Table, Typography } from 'antd';
import PageHeader from '@/components/PageHeader';
import { mockPurchaseLedger, mockPurchaseLedgerSummary, mockPurchaseParties } from '@/utils/mockData';
import type { PurchaseLedgerResponse, LedgerSummary } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const PurchaseLedger = () => {
    const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');

    const ledgerData: PurchaseLedgerResponse = selectedPartyId
        ? mockPurchaseLedger
        : mockPurchaseLedger;

    const transactionColumns: ColumnsType<typeof ledgerData.transactions[0]> = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date: string) => formatDate(date)
        },
        { title: 'Type', dataIndex: 'type', key: 'type', width: 100 },
        { title: 'Reference', dataIndex: 'reference', key: 'reference' },
        {
            title: 'Debit',
            dataIndex: 'debit',
            key: 'debit',
            width: 130,
            align: 'right',
            render: (val: number) => val > 0 ? formatCurrency(val) : '-'
        },
        {
            title: 'Credit',
            dataIndex: 'credit',
            key: 'credit',
            width: 130,
            align: 'right',
            render: (val: number) => val > 0 ? formatCurrency(val) : '-'
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            width: 130,
            align: 'right',
            render: (val: number) => (
                <strong style={{ color: val > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {formatCurrency(val)}
                </strong>
            )
        },
    ];

    const summaryColumns: ColumnsType<LedgerSummary> = [
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Debit',
            dataIndex: 'totalDebit',
            key: 'totalDebit',
            width: 150,
            align: 'right',
            render: (val: number) => formatCurrency(val)
        },
        {
            title: 'Total Credit',
            dataIndex: 'totalCredit',
            key: 'totalCredit',
            width: 150,
            align: 'right',
            render: (val: number) => formatCurrency(val)
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            width: 150,
            align: 'right',
            render: (val: number) => (
                <strong style={{ color: val > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {formatCurrency(val)}
                </strong>
            )
        },
    ];

    return (
        <div>
            <PageHeader title="Purchase Ledger" />

            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>View Mode:</label>
                        <Select
                            style={{ width: '100%' }}
                            value={viewMode}
                            onChange={setViewMode}
                        >
                            <Select.Option value="summary">Summary</Select.Option>
                            <Select.Option value="detail">Party Detail</Select.Option>
                        </Select>
                    </div>

                    {viewMode === 'detail' && (
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Select Party:</label>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Select party"
                                value={selectedPartyId}
                                onChange={setSelectedPartyId}
                            >
                                {mockPurchaseParties.map((party) => (
                                    <Select.Option key={party.id} value={party.id}>
                                        {party.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>
            </Card>

            {viewMode === 'summary' ? (
                <Card title="All Parties Summary">
                    <Table
                        dataSource={mockPurchaseLedgerSummary}
                        columns={summaryColumns}
                        rowKey="partyId"
                        pagination={false}
                    />
                </Card>
            ) : selectedPartyId ? (
                <Card title={`Party Ledger - ${ledgerData.partyName}`}>
                    <Table
                        dataSource={ledgerData.transactions}
                        columns={transactionColumns}
                        pagination={false}
                        footer={() => (
                            <div style={{ textAlign: 'right', padding: '12px 0' }}>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Total Debit:</strong> {formatCurrency(ledgerData.totalDebit)}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Total Credit:</strong> {formatCurrency(ledgerData.totalCredit)}
                                </div>
                                <div style={{ fontSize: 16 }}>
                                    <strong>Closing Balance:</strong>{' '}
                                    <span style={{ color: ledgerData.closingBalance > 0 ? '#ff4d4f' : '#52c41a' }}>
                                        {formatCurrency(ledgerData.closingBalance)}
                                    </span>
                                </div>
                            </div>
                        )}
                    />
                </Card>
            ) : (
                <Card>
                    <p style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                        Please select a party to view ledger details
                    </p>
                </Card>
            )}
        </div>
    );
};

export default PurchaseLedger;
