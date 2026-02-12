import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Space, message, Drawer, Spin } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import { getPurchaseBills, createPurchaseBill, deletePurchaseBill } from '@/api/purchaseBills';
import { getPurchaseParties } from '@/api/purchaseParties';
import type { PurchaseBillResponse, PurchaseBillRequest } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { GST_RATE } from '@/utils/constants';
import { validateQuantity, validateRate } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';

const PurchaseBills = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingBill, setViewingBill] = useState<PurchaseBillResponse | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch bills
    const { data: bills = [], isLoading, error } = useQuery({
        queryKey: ['purchaseBills'],
        queryFn: getPurchaseBills,
    });

    // Fetch parties for dropdown
    const { data: parties = [] } = useQuery({
        queryKey: ['purchaseParties'],
        queryFn: getPurchaseParties,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createPurchaseBill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseBills'] });
            message.success('Purchase bill created successfully');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create purchase bill');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deletePurchaseBill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseBills'] });
            message.success('Purchase bill deleted successfully');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete purchase bill');
        },
    });

    const handleAdd = () => {
        form.resetFields();
        form.setFieldsValue({
            billDate: dayjs(),
            items: [{ description: '', quantity: 1, rate: 0 }]
        });
        setIsModalOpen(true);
    };

    const handleView = (record: PurchaseBillResponse) => {
        setViewingBill(record);
        setIsDrawerOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const billData: PurchaseBillRequest = {
                billNumber: values.billNumber,
                billDate: values.billDate.format('YYYY-MM-DD'),
                partyId: values.partyId,
                items: values.items.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    rate: item.rate
                }))
            };

            createMutation.mutate(billData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns: ColumnsType<PurchaseBillResponse> = [
        { title: 'Bill Number', dataIndex: 'billNumber', key: 'billNumber', width: 150 },
        {
            title: 'Bill Date',
            dataIndex: 'billDate',
            key: 'billDate',
            width: 120,
            render: (date: string) => formatDate(date)
        },
        {
            title: 'Party Name',
            dataIndex: ['party', 'name'],
            key: 'partyName'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            align: 'right',
            render: (val: number) => formatCurrency(val)
        },
        {
            title: 'GST (18%)',
            dataIndex: 'gst',
            key: 'gst',
            width: 120,
            align: 'right',
            render: (val: number) => formatCurrency(val)
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            width: 120,
            align: 'right',
            render: (val: number) => <strong>{formatCurrency(val)}</strong>
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: PurchaseBillResponse) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                        View
                    </Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    if (error) {
        return (
            <div>
                <PageHeader title="Purchase Bills" />
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p style={{ color: 'red' }}>Error loading purchase bills. Please ensure the backend is running.</p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['purchaseBills'] })}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Purchase Bills"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Create Bill
                    </Button>
                }
            />

            <Spin spinning={isLoading}>
                <Table
                    dataSource={bills}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} bills` }}
                />
            </Spin>

            <Modal
                title="Create Purchase Bill"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={800}
                confirmLoading={createMutation.isPending}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        name="billNumber"
                        label="Bill Number"
                        rules={[{ required: true, message: 'Please enter bill number' }]}
                    >
                        <Input placeholder="Enter bill number" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="billDate"
                            label="Bill Date"
                            rules={[{ required: true, message: 'Please select bill date' }]}
                            style={{ flex: 1 }}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                        </Form.Item>

                        <Form.Item
                            name="partyId"
                            label="Party"
                            rules={[{ required: true, message: 'Please select party' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="Select party">
                                {parties.map((party) => (
                                    <Select.Option key={party.id} value={party.id}>
                                        {party.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'description']}
                                            label={index === 0 ? 'Description' : ''}
                                            rules={[{ required: true, message: 'Required' }]}
                                        >
                                            <Input placeholder="Item description" style={{ width: 250 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'quantity']}
                                            label={index === 0 ? 'Quantity' : ''}
                                            rules={validateQuantity()}
                                        >
                                            <InputNumber min={0.01} placeholder="Qty" style={{ width: 100 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'rate']}
                                            label={index === 0 ? 'Rate' : ''}
                                            rules={validateRate()}
                                        >
                                            <InputNumber min={0} placeholder="Rate" style={{ width: 120 }} prefix="₹" />
                                        </Form.Item>
                                        {fields.length > 1 && (
                                            <Button type="link" danger onClick={() => remove(field.name)}>
                                                Remove
                                            </Button>
                                        )}
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block>
                                    + Add Item
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>

            <Drawer
                title="Bill Details"
                placement="right"
                width={600}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            >
                {viewingBill && (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <p><strong>Bill Number:</strong> {viewingBill.billNumber}</p>
                            <p><strong>Bill Date:</strong> {formatDate(viewingBill.billDate)}</p>
                            <p><strong>Party:</strong> {viewingBill.party.name}</p>
                            <p><strong>GST:</strong> {viewingBill.party.gst}</p>
                        </div>

                        <h4>Items</h4>
                        <Table
                            dataSource={viewingBill.items}
                            pagination={false}
                            size="small"
                            columns={[
                                { title: 'Description', dataIndex: 'description', key: 'description' },
                                { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
                                { title: 'Rate', dataIndex: 'rate', key: 'rate', width: 100, align: 'right', render: (v) => formatCurrency(v) },
                                { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 120, align: 'right', render: (v) => formatCurrency(v) },
                            ]}
                        />

                        <div style={{ marginTop: 24, textAlign: 'right' }}>
                            <p><strong>Amount:</strong> {formatCurrency(viewingBill.amount)}</p>
                            <p><strong>GST (18%):</strong> {formatCurrency(viewingBill.gst)}</p>
                            <p style={{ fontSize: 18 }}><strong>Total:</strong> {formatCurrency(viewingBill.total)}</p>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default PurchaseBills;
