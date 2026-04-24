import { useState } from 'react';
import { Card, Select, Row, Col, Statistic, Tag, Spin, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { getGSTMonthlyLiability, getGSTQuarterlySummary } from '@/api/dashboard';
import { formatCurrency } from '@/utils/formatters';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const quarters = [
    { value: 1, label: 'Q1 (Apr–Jun)' },
    { value: 2, label: 'Q2 (Jul–Sep)' },
    { value: 3, label: 'Q3 (Oct–Dec)' },
    { value: 4, label: 'Q4 (Jan–Mar)' },
];

const GSTReports = () => {
    const [period, setPeriod] = useState<'monthly' | 'quarterly'>('monthly');
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [quarter, setQuarter] = useState(1);

    // ── Queries ──────────────────────────────────────────────────────────────
    const {
        data: monthlyData,
        isLoading: monthlyLoading,
        error: monthlyError,
    } = useQuery({
        queryKey: ['gst', 'monthly', year, month],
        queryFn: () => getGSTMonthlyLiability(year, month),
        enabled: period === 'monthly',
    });

    const {
        data: quarterlyData,
        isLoading: quarterlyLoading,
        error: quarterlyError,
    } = useQuery({
        queryKey: ['gst', 'quarterly', year, quarter],
        queryFn: () => getGSTQuarterlySummary(year, quarter),
        enabled: period === 'quarterly',
    });

    const gstData = period === 'monthly' ? monthlyData : quarterlyData;
    const isLoading = period === 'monthly' ? monthlyLoading : quarterlyLoading;
    const error = period === 'monthly' ? monthlyError : quarterlyError;

    const periodLabel =
        period === 'monthly'
            ? months[month - 1]
            : quarters.find((q) => q.value === quarter)?.label ?? '';

    return (
        <div>
            <PageHeader title="GST Reports" />

            {/* Filter Controls */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Period Type:</label>
                        <Select
                            style={{ width: '100%' }}
                            value={period}
                            onChange={setPeriod}
                        >
                            <Select.Option value="monthly">Monthly</Select.Option>
                            <Select.Option value="quarterly">Quarterly</Select.Option>
                        </Select>
                    </Col>

                    <Col span={8}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Year:</label>
                        <Select
                            style={{ width: '100%' }}
                            value={year}
                            onChange={setYear}
                        >
                            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                <Select.Option key={y} value={y}>{y}</Select.Option>
                            ))}
                        </Select>
                    </Col>

                    {period === 'monthly' ? (
                        <Col span={8}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Month:</label>
                            <Select
                                style={{ width: '100%' }}
                                value={month}
                                onChange={setMonth}
                            >
                                {months.map((m, idx) => (
                                    <Select.Option key={idx + 1} value={idx + 1}>{m}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                    ) : (
                        <Col span={8}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Quarter:</label>
                            <Select
                                style={{ width: '100%' }}
                                value={quarter}
                                onChange={setQuarter}
                            >
                                {quarters.map((q) => (
                                    <Select.Option key={q.value} value={q.value}>{q.label}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                    )}
                </Row>
            </Card>

            {/* GST Report Card */}
            {error ? (
                <Alert
                    type="error"
                    message="Failed to load GST data"
                    description="Please ensure the backend server is running at http://localhost:8080"
                    showIcon
                />
            ) : (
                <Card title={`GST Report – ${periodLabel} ${year}`}>
                    <Spin spinning={isLoading}>
                        {gstData ? (
                            <>
                                <Row gutter={[24, 24]}>
                                    {/* Purchase GST */}
                                    <Col xs={24} md={8}>
                                        <Card bordered={false} style={{ background: '#e6f7ff', height: '100%' }}>
                                            <Statistic
                                                title={<span style={{ fontSize: 16, fontWeight: 500 }}>Purchase GST (Input Tax Credit)</span>}
                                                value={gstData.purchaseGST}
                                                prefix="₹"
                                                valueStyle={{ color: '#1890ff', fontSize: 28 }}
                                            />
                                            <p style={{ marginTop: 12, color: '#666' }}>Total GST paid on purchases</p>
                                        </Card>
                                    </Col>

                                    {/* Sales GST */}
                                    <Col xs={24} md={8}>
                                        <Card bordered={false} style={{ background: '#f6ffed', height: '100%' }}>
                                            <Statistic
                                                title={<span style={{ fontSize: 16, fontWeight: 500 }}>Sales GST (Output Tax)</span>}
                                                value={gstData.salesGST}
                                                prefix="₹"
                                                valueStyle={{ color: '#52c41a', fontSize: 28 }}
                                            />
                                            <p style={{ marginTop: 12, color: '#666' }}>Total GST collected on sales</p>
                                        </Card>
                                    </Col>

                                    {/* Net GST */}
                                    <Col xs={24} md={8}>
                                        <Card
                                            bordered={false}
                                            style={{
                                                background: gstData.status === 'PAYABLE' ? '#fff1f0' : '#e6fffb',
                                                height: '100%',
                                            }}
                                        >
                                            <Statistic
                                                title={<span style={{ fontSize: 16, fontWeight: 500 }}>Net GST</span>}
                                                value={gstData.netGST}
                                                prefix="₹"
                                                valueStyle={{
                                                    color: gstData.status === 'PAYABLE' ? '#ff4d4f' : '#13c2c2',
                                                    fontSize: 28,
                                                }}
                                            />
                                            <div style={{ marginTop: 12 }}>
                                                <Tag
                                                    color={gstData.status === 'PAYABLE' ? 'red' : 'cyan'}
                                                    style={{ fontSize: 14 }}
                                                >
                                                    {gstData.status}
                                                </Tag>
                                                <p style={{ marginTop: 8, color: '#666' }}>
                                                    {gstData.status === 'PAYABLE'
                                                        ? 'Amount to be paid to government'
                                                        : 'Amount to be refunded by government'}
                                                </p>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Calculation Breakdown */}
                                <Card style={{ marginTop: 24 }} type="inner" title="Calculation">
                                    <div style={{ fontSize: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span>Sales GST (Output Tax):</span>
                                            <strong>{formatCurrency(gstData.salesGST)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span>Purchase GST (Input Tax Credit):</span>
                                            <strong>– {formatCurrency(gstData.purchaseGST)}</strong>
                                        </div>
                                        <hr style={{ margin: '16px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                                            <strong>Net GST {gstData.status}:</strong>
                                            <strong style={{ color: gstData.status === 'PAYABLE' ? '#ff4d4f' : '#13c2c2' }}>
                                                {formatCurrency(gstData.netGST)}
                                            </strong>
                                        </div>
                                    </div>
                                </Card>
                            </>
                        ) : !isLoading ? (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                                No GST data available for the selected period
                            </p>
                        ) : null}
                    </Spin>
                </Card>
            )}
        </div>
    );
};

export default GSTReports;
