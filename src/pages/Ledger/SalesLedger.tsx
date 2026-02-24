import { useState } from 'react';
import { Card, Select, Table, Spin, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { getSalesPartyLedger, getSalesLedgerSummary } from '@/api/ledger';
import { getSalesParties } from '@/api/salesParties';
import type { LedgerTransactionDto, LedgerSummaryDto } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';

const SalesLedger = () => {
    const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: parties = [], isLoading: partiesLoading } = useQuery({
        queryKey: ['sales', 'parties'],
        queryFn: getSalesParties,
    });

    const { data: summary = [], isLoading: summaryLoading, error: summaryError } = useQuery({
        queryKey: ['ledger', 'sales', 'all'],
        queryFn: getSalesLedgerSummary,
        enabled: viewMode === 'summary',
    });

    const { data: partyLedger, isLoading: ledgerLoading, error: ledgerError } = useQuery({
        queryKey: ['ledger', 'sales', 'party', selectedPartyId],
        queryFn: () => getSalesPartyLedger(selectedPartyId!),
        enabled: viewMode === 'detail' && selectedPartyId !== null,
    });

    // ── Table Columns ─────────────────────────────────────────────────────────
    const transactionColumns: ColumnsType<LedgerTransactionDto> = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date: string) => formatDate(date),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
        },
        { title: 'Reference', dataIndex: 'reference', key: 'reference' },
        {
            title: 'Debit',
            dataIndex: 'debit',
            key: 'debit',
            width: 130,
            align: 'right',
            render: (val: number) => val > 0 ? formatCurrency(val) : '–',
        },
        {
            title: 'Credit',
            dataIndex: 'credit',
            key: 'credit',
            width: 130,
            align: 'right',
            render: (val: number) => val > 0 ? formatCurrency(val) : '–',
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
            ),
        },
    ];

    const summaryColumns: ColumnsType<LedgerSummaryDto> = [
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Debit',
            dataIndex: 'totalDebit',
            key: 'totalDebit',
            width: 150,
            align: 'right',
            render: (val: number) => formatCurrency(val),
        },
        {
            title: 'Total Credit',
            dataIndex: 'totalCredit',
            key: 'totalCredit',
            width: 150,
            align: 'right',
            render: (val: number) => formatCurrency(val),
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
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Sales Ledger" />

            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>View Mode:</label>
                        <Select
                            style={{ width: '100%' }}
                            value={viewMode}
                            onChange={(v) => { setViewMode(v); setSelectedPartyId(null); }}
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
                                loading={partiesLoading}
                                showSearch
                                filterOption={(input, option) =>
                                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {parties.map((party) => (
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
                summaryError ? (
                    <Alert type="error" message="Failed to load ledger summary" showIcon />
                ) : (
                    <Card title="All Sales Parties – Ledger Summary">
                        <Spin spinning={summaryLoading}>
                            <Table
                                dataSource={summary}
                                columns={summaryColumns}
                                rowKey="partyId"
                                pagination={false}
                                locale={{ emptyText: 'No ledger data' }}
                            />
                        </Spin>
                    </Card>
                )
            ) : selectedPartyId ? (
                ledgerError ? (
                    <Alert type="error" message="Failed to load party ledger" showIcon />
                ) : (
                    <Card title={partyLedger ? `Party Ledger – ${partyLedger.partyName}` : 'Loading...'}>
                        <Spin spinning={ledgerLoading}>
                            <Table
                                dataSource={partyLedger?.transactions ?? []}
                                columns={transactionColumns}
                                rowKey={(r) => `${r.date}-${r.reference}`}
                                pagination={false}
                                footer={() => partyLedger ? (
                                    <div style={{ textAlign: 'right', padding: '12px 0' }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Total Debit:</strong> {formatCurrency(partyLedger.totalDebit)}
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>Total Credit:</strong> {formatCurrency(partyLedger.totalCredit)}
                                        </div>
                                        <div style={{ fontSize: 16 }}>
                                            <strong>Closing Balance:</strong>{' '}
                                            <span style={{ color: partyLedger.closingBalance > 0 ? '#ff4d4f' : '#52c41a' }}>
                                                {formatCurrency(partyLedger.closingBalance)}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            />
                        </Spin>
                    </Card>
                )
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

export default SalesLedger;
