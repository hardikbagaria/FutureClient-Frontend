import { useState } from 'react';
import { Card, Select, Row, Col, Statistic, Tag } from 'antd';
import PageHeader from '@/components/PageHeader';
import { formatCurrency } from '@/utils/formatters';

const GSTReports = () => {
    const [period, setPeriod] = useState<'monthly' | 'quarterly'>('monthly');
    const [year, setYear] = useState(2025);
    const [month, setMonth] = useState(2);
    const [quarter, setQuarter] = useState(1);

    // Mock GST data
    const mockGSTData = {
        purchaseGST: 4500,    // Input Tax Credit
        salesGST: 4770,       // Output Tax
        netGST: 270,          // Payable
        status: 'PAYABLE' as const
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const quarters = [
        { value: 1, label: 'Q1 (Apr-Jun)' },
        { value: 2, label: 'Q2 (Jul-Sep)' },
        { value: 3, label: 'Q3 (Oct-Dec)' },
        { value: 4, label: 'Q4 (Jan-Mar)' },
    ];

    return (
        <div>
            <PageHeader title="GST Reports" />

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
                            <Select.Option value={2024}>2024</Select.Option>
                            <Select.Option value={2025}>2025</Select.Option>
                            <Select.Option value={2026}>2026</Select.Option>
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
                                    <Select.Option key={idx + 1} value={idx + 1}>
                                        {m}
                                    </Select.Option>
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
                                    <Select.Option key={q.value} value={q.value}>
                                        {q.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                    )}
                </Row>
            </Card>

            <Card
                title={`GST Report - ${period === 'monthly' ? months[month - 1] : quarters.find(q => q.value === quarter)?.label} ${year}`}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                        <Card bordered={false} style={{ background: '#e6f7ff', height: '100%' }}>
                            <Statistic
                                title={<span style={{ fontSize: 16, fontWeight: 500 }}>Purchase GST (Input Tax Credit)</span>}
                                value={mockGSTData.purchaseGST}
                                prefix="₹"
                                valueStyle={{ color: '#1890ff', fontSize: 28 }}
                            />
                            <p style={{ marginTop: 12, color: '#666' }}>Total GST paid on purchases</p>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card bordered={false} style={{ background: '#f6ffed', height: '100%' }}>
                            <Statistic
                                title={<span style={{ fontSize: 16, fontWeight: 500 }}>Sales GST (Output Tax)</span>}
                                value={mockGSTData.salesGST}
                                prefix="₹"
                                valueStyle={{ color: '#52c41a', fontSize: 28 }}
                            />
                            <p style={{ marginTop: 12, color: '#666' }}>Total GST collected on sales</p>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            bordered={false}
                            style={{
                                background: mockGSTData.status === 'PAYABLE' ? '#fff1f0' : '#e6fffb',
                                height: '100%'
                            }}
                        >
                            <Statistic
                                title={<span style={{ fontSize: 16, fontWeight: 500 }}>Net GST</span>}
                                value={mockGSTData.netGST}
                                prefix="₹"
                                valueStyle={{
                                    color: mockGSTData.status === 'PAYABLE' ? '#ff4d4f' : '#13c2c2',
                                    fontSize: 28
                                }}
                            />
                            <div style={{ marginTop: 12 }}>
                                <Tag color={mockGSTData.status === 'PAYABLE' ? 'red' : 'cyan'} style={{ fontSize: 14 }}>
                                    {mockGSTData.status}
                                </Tag>
                                <p style={{ marginTop: 8, color: '#666' }}>
                                    {mockGSTData.status === 'PAYABLE'
                                        ? 'Amount to be paid to government'
                                        : 'Amount to be refunded by government'
                                    }
                                </p>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Card
                    style={{ marginTop: 24 }}
                    type="inner"
                    title="Calculation"
                >
                    <div style={{ fontSize: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span>Sales GST (Output Tax):</span>
                            <strong>{formatCurrency(mockGSTData.salesGST)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span>Purchase GST (Input Tax Credit):</span>
                            <strong>- {formatCurrency(mockGSTData.purchaseGST)}</strong>
                        </div>
                        <hr style={{ margin: '16px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                            <strong>Net GST {mockGSTData.status}:</strong>
                            <strong style={{ color: mockGSTData.status === 'PAYABLE' ? '#ff4d4f' : '#13c2c2' }}>
                                {formatCurrency(mockGSTData.netGST)}
                            </strong>
                        </div>
                    </div>
                </Card>
            </Card>
        </div>
    );
};

export default GSTReports;
