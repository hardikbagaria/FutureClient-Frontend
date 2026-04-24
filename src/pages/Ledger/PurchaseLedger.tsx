import { useState } from 'react';
import { Card, Select, Table, Spin, Alert, DatePicker, Button } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { getPurchasePartyLedger, getPurchaseLedgerSummary, getPurchaseAllTransactions } from '@/api/ledger';
import { getPurchaseParties } from '@/api/purchaseParties';
import type { LedgerTransactionDto, LedgerSummaryDto } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';
import { exportSummaryToPdf, exportMonthlyToPdf, exportPartyDetailToPdf } from '@/utils/ledgerPdfExport';

const PurchaseLedger = () => {
    const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'summary' | 'monthly_transactions' | 'detail'>('summary');
    const [includePayments, setIncludePayments] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
    const [selectedMonthStr, setSelectedMonthStr] = useState<string>(''); // e.g., '2026-04'

    let activeStartDate: string | undefined = undefined;
    let activeEndDate: string | undefined = undefined;

    if (viewMode === 'detail') {
        activeStartDate = dateRange[0] || undefined;
        activeEndDate = dateRange[1] || undefined;
    } else if (selectedMonthStr) {
        const parts = selectedMonthStr.split('-');
        if (parts.length === 2) {
            activeStartDate = `${selectedMonthStr}-01`;
            const lastDay = new Date(parseInt(parts[0]), parseInt(parts[1]), 0).getDate();
            activeEndDate = `${selectedMonthStr}-${lastDay}`;
        }
    }

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: parties = [], isLoading: partiesLoading } = useQuery({
        queryKey: ['purchase', 'parties'],
        queryFn: getPurchaseParties,
    });

    const { data: summary = [], isLoading: summaryLoading, error: summaryError } = useQuery({
        queryKey: ['ledger', 'purchase', 'all', activeStartDate, activeEndDate],
        queryFn: () => getPurchaseLedgerSummary({ startDate: activeStartDate, endDate: activeEndDate }),
        enabled: viewMode === 'summary',
        staleTime: 0,
        gcTime: 0,
    });

    const { data: monthlyTransactions = [], isLoading: transactionsLoading, error: transactionsError } = useQuery({
        queryKey: ['ledger', 'purchase', 'transactions', activeStartDate, activeEndDate, includePayments],
        queryFn: () => getPurchaseAllTransactions({ startDate: activeStartDate, endDate: activeEndDate, includePayments }),
        enabled: viewMode === 'monthly_transactions',
        staleTime: 0,
        gcTime: 0,
    });

    const { data: partyLedger, isLoading: ledgerLoading, error: ledgerError } = useQuery({
        queryKey: ['ledger', 'purchase', 'party', selectedPartyId, activeStartDate, activeEndDate],
        queryFn: () => getPurchasePartyLedger(selectedPartyId!, { startDate: activeStartDate, endDate: activeEndDate }),
        enabled: viewMode === 'detail' && selectedPartyId !== null,
        staleTime: 0,
        gcTime: 0,
    });

    // ── Table Columns ─────────────────────────────────────────────────────────
    const transactionColumns: ColumnsType<LedgerTransactionDto> = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date: string | null) => date ? formatDate(date) : '—',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 140,
            render: (type: string) => {
                if (type === 'OPENING_BALANCE') return 'Opening Balance';
                if (type === 'BILL') return 'Bill';
                if (type === 'PAYMENT') return 'Payment';
                return type;
            }
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
            title: 'Month Turnover',
            dataIndex: 'monthTurnover',
            key: 'monthTurnover',
            width: 140,
            align: 'right',
            render: (val: number | undefined, record: LedgerTransactionDto) =>
                (record.type === 'BILL' && val !== undefined && val !== null) ? formatCurrency(val) : '—',
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

    const globalTransactionColumns: ColumnsType<LedgerTransactionDto> = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date: string | null) => date ? formatDate(date) : '—',
        },
        { title: 'Party', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: string) => {
                if (type === 'OPENING_BALANCE') return 'Opening Balance';
                if (type === 'BILL') return 'Bill';
                if (type === 'PAYMENT') return 'Payment';
                return type;
            }
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
            title: 'Month Turnover',
            dataIndex: 'monthTurnover',
            key: 'monthTurnover',
            width: 140,
            align: 'right',
            render: (val: number | undefined, record: LedgerTransactionDto) =>
                (record.type === 'BILL' && val !== undefined && val !== null) ? formatCurrency(val) : '—',
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

    // ── Date label for PDF subtitle ───────────────────────────────────────────
    const dateLabel = selectedMonthStr
        ? `Month: ${selectedMonthStr}`
        : activeStartDate && activeEndDate
            ? `${activeStartDate} to ${activeEndDate}`
            : undefined;

    // ── PDF export handlers ───────────────────────────────────────────────────
    const handleExportPdf = () => {
        if (viewMode === 'summary') {
            exportSummaryToPdf('Purchase', summary, dateLabel);
        } else if (viewMode === 'monthly_transactions') {
            exportMonthlyToPdf('Purchase', monthlyTransactions, dateLabel);
        } else if (viewMode === 'detail' && partyLedger) {
            exportPartyDetailToPdf(
                'Purchase',
                partyLedger.partyName,
                partyLedger.transactions,
                {
                    totalDebit: partyLedger.totalDebit,
                    totalCredit: partyLedger.totalCredit,
                    closingBalance: partyLedger.closingBalance,
                },
                dateLabel,
            );
        }
    };

    const canExport =
        (viewMode === 'summary' && summary.length > 0) ||
        (viewMode === 'monthly_transactions' && monthlyTransactions.length > 0) ||
        (viewMode === 'detail' && !!partyLedger);

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
                            onChange={(v) => { setViewMode(v); setSelectedPartyId(null); }}
                        >
                            <Select.Option value="summary">Summary</Select.Option>
                            <Select.Option value="monthly_transactions">Monthly Register</Select.Option>
                            <Select.Option value="detail">Party Detail</Select.Option>
                        </Select>
                    </div>

                    {(viewMode === 'summary' || viewMode === 'monthly_transactions') && (
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Select Month:</label>
                            <DatePicker
                                picker="month"
                                style={{ width: '100%' }}
                                onChange={(_, dateString) => setSelectedMonthStr(dateString as string)}
                            />
                        </div>
                    )}

                    {viewMode === 'detail' && (
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Date Range:</label>
                            <DatePicker.RangePicker
                                style={{ width: '100%' }}
                                onChange={(_, dateStrings) => setDateRange(dateStrings as [string, string])}
                            />
                        </div>
                    )}

                    {viewMode === 'monthly_transactions' && (
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Transactions:</label>
                            <Select
                                style={{ width: '100%' }}
                                value={includePayments ? "all" : "bills"}
                                onChange={(v) => setIncludePayments(v === "all")}
                            >
                                <Select.Option value="all">Include Payments</Select.Option>
                                <Select.Option value="bills">Exclude Payments</Select.Option>
                            </Select>
                        </div>
                    )}

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

                    <div style={{ alignSelf: 'flex-end' }}>
                        <Button
                            type="primary"
                            danger
                            icon={<FilePdfOutlined />}
                            disabled={!canExport}
                            onClick={handleExportPdf}
                        >
                            Export PDF
                        </Button>
                    </div>
                </div>
            </Card>

            {viewMode === 'summary' ? (
                summaryError ? (
                    <Alert type="error" message="Failed to load ledger summary" showIcon />
                ) : (
                    <Card title="All Purchase Parties – Ledger Summary">
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
            ) : viewMode === 'monthly_transactions' ? (
                transactionsError ? (
                    <Alert type="error" message="Failed to load transactions list" showIcon />
                ) : (
                    <Card title="Purchase Monthly Register">
                        <Spin spinning={transactionsLoading}>
                            <Table
                                dataSource={monthlyTransactions}
                                columns={globalTransactionColumns}
                                rowKey={(r) => `${r.partyId}-${r.date}-${r.reference}`}
                                pagination={{ pageSize: 50 }}
                                locale={{ emptyText: 'No transactions found' }}
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

export default PurchaseLedger;
