import { Row, Col, Card, Table } from 'antd';
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
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import {
    mockDashboardSummary,
    mockTopVendors,
    mockTopCustomers,
    mockPendingPayments,
    mockPendingCollections,
} from '@/utils/mockData';
import { formatCurrency } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';

// Mock trend data
const trendData = [
    { month: 'Jan', purchases: 8000, sales: 12000 },
    { month: 'Feb', purchases: 9500, sales: 15000 },
    { month: 'Mar', purchases: 11000, sales: 14500 },
    { month: 'Apr', purchases: 10200, sales: 16800 },
    { month: 'May', purchases: 12500, sales: 18200 },
    { month: 'Jun', purchases: 13800, sales: 20500 },
];

const Dashboard = () => {
    const topVendorColumns: ColumnsType<typeof mockTopVendors[0]> = [
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val) => formatCurrency(val),
            align: 'right',
        },
        {
            title: 'Transactions',
            dataIndex: 'transactionCount',
            key: 'transactionCount',
            align: 'center',
        },
    ];

    const topCustomerColumns: ColumnsType<typeof mockTopCustomers[0]> = [
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val) => formatCurrency(val),
            align: 'right',
        },
        {
            title: 'Transactions',
            dataIndex: 'transactionCount',
            key: 'transactionCount',
            align: 'center',
        },
    ];

    const pendingPaymentColumns: ColumnsType<typeof mockPendingPayments[0]> = [
        { title: 'Bill Number', dataIndex: 'billNumber', key: 'billNumber' },
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val) => formatCurrency(val),
            align: 'right',
        },
        {
            title: 'Paid Amount',
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

    const pendingCollectionColumns: ColumnsType<typeof mockPendingCollections[0]> = [
        { title: 'Bill Number', dataIndex: 'billNumber', key: 'billNumber' },
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val) => formatCurrency(val),
            align: 'right',
        },
        {
            title: 'Paid Amount',
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

    return (
        <div>
            <PageHeader title="Dashboard" />

            {/* Summary Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Total Purchases"
                        value={mockDashboardSummary.totalPurchases}
                        prefix="₹"
                        icon={<ShoppingCartOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Total Sales"
                        value={mockDashboardSummary.totalSales}
                        prefix="₹"
                        icon={<ShoppingOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Profit"
                        value={mockDashboardSummary.profit}
                        prefix="₹"
                        icon={<RiseOutlined />}
                        valueStyle={{ color: '#13c2c2' }}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="GST Liability"
                        value={mockDashboardSummary.currentMonthGSTLiability}
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
                        value={mockDashboardSummary.pendingPurchasePayments}
                        prefix="₹"
                        valueStyle={{ color: '#ff4d4f' }}
                    />
                </Col>
                <Col xs={24} sm={12}>
                    <StatCard
                        title="Pending Sales Collections"
                        value={mockDashboardSummary.pendingSalesCollections}
                        prefix="₹"
                        valueStyle={{ color: '#ff7a45' }}
                    />
                </Col>
            </Row>

            {/* Trend Chart */}
            <Card title="Purchase & Sales Trend" style={{ marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Line type="monotone" dataKey="purchases" stroke="#1890ff" strokeWidth={2} name="Purchases" />
                        <Line type="monotone" dataKey="sales" stroke="#52c41a" strokeWidth={2} name="Sales" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Top Vendors and Customers */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Top Vendors">
                        <Table
                            dataSource={mockTopVendors}
                            columns={topVendorColumns}
                            rowKey="partyId"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Top Customers">
                        <Table
                            dataSource={mockTopCustomers}
                            columns={topCustomerColumns}
                            rowKey="partyId"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Pending Payments and Collections */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Pending Purchase Payments">
                        <Table
                            dataSource={mockPendingPayments}
                            columns={pendingPaymentColumns}
                            rowKey="billId"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Pending Sales Collections">
                        <Table
                            dataSource={mockPendingCollections}
                            columns={pendingCollectionColumns}
                            rowKey="billId"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
