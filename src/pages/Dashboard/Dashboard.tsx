import { useState } from 'react';
import { Row, Col, Card, Table, Select, Spin, Alert } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import { formatCurrency } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';
import type { TopPartyDto, PendingPaymentDto, MonthlyDataPoint } from '@/types';
import {
    getDashboardSummary,
    getPurchaseTopVendors,
    getSalesTopCustomers,
    getPurchasePendingPayments,
    getSalesPendingCollections,
    getPurchaseYearlyTrend,
    getSalesYearlyTrend,
} from '@/api/dashboard';

const currentYear = new Date().getFullYear();

const Dashboard = () => {
    const [trendYear, setTrendYear] = useState(currentYear);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
        queryKey: ['dashboard', 'summary'],
        queryFn: getDashboardSummary,
    });

    const { data: topVendors = [], isLoading: vendorsLoading } = useQuery({
        queryKey: ['dashboard', 'top-vendors'],
        queryFn: () => getPurchaseTopVendors(5),
    });

    const { data: topCustomers = [], isLoading: customersLoading } = useQuery({
        queryKey: ['dashboard', 'top-customers'],
        queryFn: () => getSalesTopCustomers(5),
    });

    const { data: pendingPayments = [], isLoading: pendingPaymentsLoading } = useQuery({
        queryKey: ['dashboard', 'pending-payments'],
        queryFn: getPurchasePendingPayments,
    });

    const { data: pendingCollections = [], isLoading: pendingCollectionsLoading } = useQuery({
        queryKey: ['dashboard', 'pending-collections'],
        queryFn: getSalesPendingCollections,
    });

    const { data: purchaseTrend, isLoading: purchaseTrendLoading } = useQuery({
        queryKey: ['dashboard', 'purchase-yearly-trend', trendYear],
        queryFn: () => getPurchaseYearlyTrend(trendYear),
    });

    const { data: salesTrend, isLoading: salesTrendLoading } = useQuery({
        queryKey: ['dashboard', 'sales-yearly-trend', trendYear],
        queryFn: () => getSalesYearlyTrend(trendYear),
    });

    // ── Merge trend data ────────────────────────────────────────────────────
    const trendData = (() => {
        const purchaseMap: Record<number, MonthlyDataPoint> = {};
        purchaseTrend?.monthlyData.forEach((d) => { purchaseMap[d.month] = d; });

        const salesMap: Record<number, MonthlyDataPoint> = {};
        salesTrend?.monthlyData.forEach((d) => { salesMap[d.month] = d; });

        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        return months.map((m) => ({
            month: purchaseMap[m]?.monthName || salesMap[m]?.monthName || `Month ${m}`,
            purchases: purchaseMap[m]?.total ?? 0,
            sales: salesMap[m]?.total ?? 0,
        })).filter((d) => d.purchases > 0 || d.sales > 0);
    })();

    const trendLoading = purchaseTrendLoading || salesTrendLoading;

    // ── Table Columns ───────────────────────────────────────────────────────
    const topPartyColumns: ColumnsType<TopPartyDto> = [
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val) => formatCurrency(val),
            align: 'right',
        },
        {
            title: 'Bills',
            dataIndex: 'billCount',
            key: 'billCount',
            align: 'center',
        },
    ];

    const pendingColumns: ColumnsType<PendingPaymentDto> = [
        { title: 'Bill No.', dataIndex: 'billNumber', key: 'billNumber' },
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val) => formatCurrency(val),
            align: 'right',
        },
        {
            title: 'Paid',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            render: (val) => formatCurrency(val),
            align: 'right',
        },
        {
            title: 'Pending',
            dataIndex: 'pendingAmount',
            key: 'pendingAmount',
            render: (val) => <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{formatCurrency(val)}</span>,
            align: 'right',
        },
    ];

    // ── Render ───────────────────────────────────────────────────────────────
    if (summaryError) {
        return (
            <div>
                <PageHeader title="Dashboard" />
                <Alert
                    type="error"
                    message="Failed to load dashboard data"
                    description="Please ensure the backend server is running at http://localhost:8080"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Dashboard" />

            {/* Summary Statistics */}
            <Spin spinning={summaryLoading}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard
                            title="Total Purchases"
                            value={summary?.totalPurchases ?? 0}
                            prefix="₹"
                            icon={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard
                            title="Total Sales"
                            value={summary?.totalSales ?? 0}
                            prefix="₹"
                            icon={<ShoppingOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard
                            title="Profit"
                            value={summary?.profit ?? 0}
                            prefix="₹"
                            icon={<RiseOutlined />}
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard
                            title="GST Liability"
                            value={summary?.currentMonthGSTLiability ?? 0}
                            prefix="₹"
                            icon={<DollarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12}>
                        <StatCard
                            title="Pending Purchase Payments"
                            value={summary?.pendingPurchasePayments ?? 0}
                            prefix="₹"
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Col>
                    <Col xs={24} sm={12}>
                        <StatCard
                            title="Pending Sales Collections"
                            value={summary?.pendingSalesCollections ?? 0}
                            prefix="₹"
                            valueStyle={{ color: '#ff7a45' }}
                        />
                    </Col>
                </Row>
            </Spin>

            {/* Trend Chart */}
            <Card
                title="Purchase & Sales Trend"
                style={{ marginBottom: 24 }}
                extra={
                    <Select value={trendYear} onChange={setTrendYear} style={{ width: 100 }}>
                        {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                            <Select.Option key={y} value={y}>{y}</Select.Option>
                        ))}
                    </Select>
                }
            >
                <Spin spinning={trendLoading}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Line type="monotone" dataKey="purchases" stroke="#1890ff" strokeWidth={2} name="Purchases" dot={false} />
                            <Line type="monotone" dataKey="sales" stroke="#52c41a" strokeWidth={2} name="Sales" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                    {trendData.length === 0 && !trendLoading && (
                        <p style={{ textAlign: 'center', color: '#888', paddingBottom: 16 }}>
                            No trend data available for {trendYear}
                        </p>
                    )}
                </Spin>
            </Card>

            {/* Top Vendors and Customers */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Top Vendors">
                        <Spin spinning={vendorsLoading}>
                            <Table
                                dataSource={topVendors}
                                columns={topPartyColumns}
                                rowKey="partyId"
                                pagination={false}
                                size="small"
                                locale={{ emptyText: 'No vendor data' }}
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Top Customers">
                        <Spin spinning={customersLoading}>
                            <Table
                                dataSource={topCustomers}
                                columns={topPartyColumns}
                                rowKey="partyId"
                                pagination={false}
                                size="small"
                                locale={{ emptyText: 'No customer data' }}
                            />
                        </Spin>
                    </Card>
                </Col>
            </Row>

            {/* Pending Payments and Collections */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Pending Purchase Payments">
                        <Spin spinning={pendingPaymentsLoading}>
                            <Table
                                dataSource={pendingPayments}
                                columns={pendingColumns}
                                rowKey="billId"
                                pagination={false}
                                size="small"
                                locale={{ emptyText: 'No pending payments 🎉' }}
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Pending Sales Collections">
                        <Spin spinning={pendingCollectionsLoading}>
                            <Table
                                dataSource={pendingCollections}
                                columns={pendingColumns}
                                rowKey="billId"
                                pagination={false}
                                size="small"
                                locale={{ emptyText: 'No pending collections 🎉' }}
                            />
                        </Spin>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
