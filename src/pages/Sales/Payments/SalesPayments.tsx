import { useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, InputNumber, Input, Tag, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import { mockSalesPayments, mockSalesParties } from '@/utils/mockData';
import type { SalesPaymentResponse } from '@/types';
import { PaymentMode } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_MODE_LABELS } from '@/utils/constants';
import type { ColumnsType } from 'antd/es/table';

const SalesPayments = () => {
    const [payments, setPayments] = useState<SalesPaymentResponse[]>(mockSalesPayments);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const handleAdd = () => {
        form.resetFields();
        form.setFieldsValue({ paymentDate: dayjs() });
        setSelectedPartyId(null);
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const party = mockSalesParties.find(p => p.id === values.partyId)!;

            const newPayment: SalesPaymentResponse = {
                id: Math.max(...payments.map(p => p.id)) + 1,
                partyId: values.partyId,
                partyName: party.name,
                paymentDate: values.paymentDate.format('YYYY-MM-DD'),
                amountPaid: values.amountPaid,
                modeOfPayment: values.modeOfPayment,
                transactionReference: values.transactionReference || null,
                remarks: values.remarks || null,
                allocations: [],
                partyOutstandingAfterPayment: 0
            };

            setPayments([...payments, newPayment]);
            message.success('Payment recorded successfully');
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const getPartyOutstanding = (partyId: number): number => {
        return Math.random() * 20000;
    };

    const columns: ColumnsType<SalesPaymentResponse> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        {
            title: 'Payment Date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            width: 120,
            render: (date: string) => formatDate(date)
        },
        { title: 'Party Name', dataIndex: 'partyName', key: 'partyName' },
        {
            title: 'Amount Paid',
            dataIndex: 'amountPaid',
            key: 'amountPaid',
            width: 120,
            align: 'right',
            render: (val: number) => <strong>{formatCurrency(val)}</strong>
        },
        {
            title: 'Mode',
            dataIndex: 'modeOfPayment',
            key: 'modeOfPayment',
            width: 100,
            render: (mode: string) => <Tag color="green">{mode}</Tag>
        },
        {
            title: 'Reference',
            dataIndex: 'transactionReference',
            key: 'transactionReference',
            width: 150,
            render: (ref: string | null) => ref || '-'
        },
        {
            title: 'Outstanding After',
            dataIndex: 'partyOutstandingAfterPayment',
            key: 'partyOutstandingAfterPayment',
            width: 150,
            align: 'right',
            render: (val: number) => (
                <span style={{ color: val > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {formatCurrency(val)}
                </span>
            )
        },
    ];

    const expandedRowRender = (record: SalesPaymentResponse) => {
        const allocationColumns: ColumnsType<typeof record.allocations[0]> = [
            { title: 'Bill Number', dataIndex: 'billNumber', key: 'billNumber' },
            {
                title: 'Amount Allocated',
                dataIndex: 'amountAllocated',
                key: 'amountAllocated',
                align: 'right',
                render: (val: number) => formatCurrency(val)
            },
        ];

        return (
            <div style={{ padding: '0 48px' }}>
                <h4>Payment Allocations</h4>
                {record.allocations.length > 0 ? (
                    <Table
                        columns={allocationColumns}
                        dataSource={record.allocations}
                        pagination={false}
                        size="small"
                        rowKey="billId"
                    />
                ) : (
                    <p>No allocations</p>
                )}
                {record.remarks && (
                    <p style={{ marginTop: 12 }}><strong>Remarks:</strong> {record.remarks}</p>
                )}
            </div>
        );
    };

    return (
        <div>
            <PageHeader
                title="Sales Payments"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Record Payment
                    </Button>
                }
            />

            <Table
                dataSource={payments}
                columns={columns}
                rowKey="id"
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.allocations.length > 0 || !!record.remarks
                }}
                pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} payments` }}
            />

            <Modal
                title="Record Sales Payment"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={600}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        name="partyId"
                        label="Party"
                        rules={[{ required: true, message: 'Please select party' }]}
                    >
                        <Select
                            placeholder="Select party"
                            onChange={(value) => setSelectedPartyId(value)}
                        >
                            {mockSalesParties.map((party) => (
                                <Select.Option key={party.id} value={party.id}>
                                    {party.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {selectedPartyId && (
                        <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                            <strong>Outstanding Amount:</strong>{' '}
                            <span style={{ color: '#52c41a', fontSize: 16 }}>
                                {formatCurrency(getPartyOutstanding(selectedPartyId))}
                            </span>
                        </div>
                    )}

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="paymentDate"
                            label="Payment Date"
                            rules={[{ required: true, message: 'Please select payment date' }]}
                            style={{ flex: 1 }}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                        </Form.Item>

                        <Form.Item
                            name="amountPaid"
                            label="Amount Paid"
                            rules={[
                                { required: true, message: 'Please enter amount' },
                                { type: 'number', min: 0.01, message: 'Amount must be positive' }
                            ]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="modeOfPayment"
                        label="Mode of Payment"
                        rules={[{ required: true, message: 'Please select payment mode' }]}
                    >
                        <Select placeholder="Select payment mode">
                            {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                                <Select.Option key={value} value={value}>
                                    {label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="transactionReference"
                        label="Transaction Reference (Optional)"
                    >
                        <Input placeholder="Enter transaction reference" />
                    </Form.Item>

                    <Form.Item
                        name="remarks"
                        label="Remarks (Optional)"
                    >
                        <Input.TextArea rows={3} placeholder="Enter remarks" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SalesPayments;
