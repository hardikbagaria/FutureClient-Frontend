import { Table, Button, Modal, Form, Select, DatePicker, InputNumber, Input, Tag, Space, message, Spin, Alert, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import { getSalesPayments, createSalesPayment, updateSalesPayment, deleteSalesPayment, getSalesPartyOutstanding } from '@/api/salesPayments';
import { getSalesParties } from '@/api/salesParties';
import type { SalesPaymentResponse, SalesPaymentRequest } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_MODE_LABELS } from '@/utils/constants';
import { validateAmount } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';

const SalesPayments = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<SalesPaymentResponse | null>(null);
    const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch payments
    const { data: payments = [], isLoading, error } = useQuery({
        queryKey: ['salesPayments'],
        queryFn: getSalesPayments,
    });

    // Fetch parties for dropdown
    const { data: parties = [] } = useQuery({
        queryKey: ['salesParties'],
        queryFn: getSalesParties,
    });

    // Fetch outstanding amount for selected party — always fresh, no cache
    const { data: outstandingAmount, isLoading: isLoadingOutstanding, error: outstandingError } = useQuery({
        queryKey: ['salesPartyOutstanding', selectedPartyId],
        queryFn: () => getSalesPartyOutstanding(selectedPartyId!),
        enabled: !!selectedPartyId && !editingPayment,
        staleTime: 0,
        gcTime: 0,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createSalesPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesPayments'] });
            message.success('Payment recorded successfully');
            setIsModalOpen(false);
            form.resetFields();
            setSelectedPartyId(null);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to record payment';
            message.error(errorMessage);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: SalesPaymentRequest }) => updateSalesPayment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesPayments'] });
            message.success('Payment updated successfully');
            setIsModalOpen(false);
            form.resetFields();
            setEditingPayment(null);
            setSelectedPartyId(null);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update payment';
            message.error(errorMessage);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteSalesPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesPayments'] });
            message.success('Payment deleted successfully');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete payment';
            message.error(errorMessage);
        },
    });

    const handleAdd = () => {
        setEditingPayment(null);
        form.resetFields();
        form.setFieldsValue({ paymentDate: dayjs() });
        setSelectedPartyId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: SalesPaymentResponse) => {
        setEditingPayment(record);
        setSelectedPartyId(null); // don't show outstanding on edit
        form.setFieldsValue({
            partyId: record.partyId,
            paymentDate: dayjs(record.paymentDate),
            amountPaid: record.amountPaid,
            modeOfPayment: record.modeOfPayment,
            transactionReference: record.transactionReference,
            remarks: record.remarks,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const paymentData: SalesPaymentRequest = {
                partyId: values.partyId,
                paymentDate: values.paymentDate.format('YYYY-MM-DD'),
                amountPaid: values.amountPaid,
                modeOfPayment: values.modeOfPayment,
                transactionReference: values.transactionReference,
                remarks: values.remarks,
            };

            if (editingPayment) {
                updateMutation.mutate({ id: editingPayment.id, data: paymentData });
            } else {
                createMutation.mutate(paymentData);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
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
            width: 130,
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
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: SalesPaymentResponse) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Payment"
                        description="Are you sure you want to delete this payment?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (error) {
        return (
            <div>
                <PageHeader title="Sales Payments" />
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Alert
                        message="Error Loading Payments"
                        description={error instanceof Error ? error.message : 'Failed to load sales payments. Please ensure the backend is running.'}
                        type="error"
                        showIcon
                    />
                    <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['salesPayments'] })}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

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

            <Spin spinning={isLoading}>
                <Table
                    dataSource={payments}
                    columns={columns}
                    rowKey="id"
                    expandable={{
                        expandedRowRender: (record) => record.remarks ? (
                            <div style={{ padding: '8px 48px' }}>
                                <strong>Remarks:</strong> {record.remarks}
                            </div>
                        ) : null,
                        rowExpandable: (record) => !!record.remarks,
                    }}
                    pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} payments` }}
                />
            </Spin>

            <Modal
                title={editingPayment ? 'Edit Sales Payment' : 'Record Sales Payment'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedPartyId(null);
                    setEditingPayment(null);
                }}
                width={600}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        name="partyId"
                        label="Party"
                        rules={[{ required: true, message: 'Please select party' }]}
                    >
                        <Select
                            placeholder="Select party"
                            disabled={!!editingPayment}
                            onChange={(v: number) => setSelectedPartyId(v)}
                            showSearch
                            optionFilterProp="children"
                        >
                            {parties.map((party) => (
                                <Select.Option key={party.id} value={party.id}>
                                    {party.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Show outstanding when creating (not editing) */}
                    {selectedPartyId && !editingPayment && (
                        <div style={{ marginBottom: 16 }}>
                            {isLoadingOutstanding ? (
                                <div style={{ padding: 12, background: '#f0f2f5', borderRadius: 4, textAlign: 'center' }}>
                                    <Spin size="small" />&nbsp;Loading outstanding...
                                </div>
                            ) : outstandingError ? (
                                <Alert message="Could not load outstanding amount" type="warning" showIcon closable />
                            ) : outstandingAmount != null ? (
                                <div style={{ padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
                                    <strong>Outstanding Amount:</strong>{' '}
                                    <span style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 'bold' }}>
                                        {formatCurrency(outstandingAmount)}
                                    </span>
                                </div>
                            ) : null}
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
                            rules={validateAmount()}
                            style={{ flex: 1 }}
                        >
                            <InputNumber style={{ width: '100%' }} prefix="₹" min={0.01} placeholder="Enter amount" />
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

                    <Form.Item name="transactionReference" label="Transaction Reference (Optional)">
                        <Input placeholder="Enter transaction reference" />
                    </Form.Item>

                    <Form.Item name="remarks" label="Remarks (Optional)">
                        <Input.TextArea rows={3} placeholder="Enter remarks" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SalesPayments;
