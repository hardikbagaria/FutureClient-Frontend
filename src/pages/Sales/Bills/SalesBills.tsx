import { useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, InputNumber, Input, Space, message, Drawer, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import { mockSalesBills, mockSalesParties, mockItems } from '@/utils/mockData';
import type { SalesBillResponse } from '@/types';
import { PaymentMode } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { GST_RATE, PAYMENT_MODE_LABELS } from '@/utils/constants';
import type { ColumnsType } from 'antd/es/table';

const SalesBills = () => {
    const [bills, setBills] = useState<SalesBillResponse[]>(mockSalesBills);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingBill, setViewingBill] = useState<SalesBillResponse | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();

    const handleAdd = () => {
        form.resetFields();
        form.setFieldsValue({
            billDate: dayjs(),
            items: [{ itemId: undefined, quantity: 1, rate: 0 }],
            transportation: 0,
            roundOff: 0
        });
        setIsModalOpen(true);
    };

    const handleView = (record: SalesBillResponse) => {
        setViewingBill(record);
        setIsDrawerOpen(true);
    };

    const handleDelete = (id: number) => {
        setBills(bills.filter((bill) => bill.id !== id));
        message.success('Bill deleted successfully');
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const items = values.items.map((item: any) => {
                const itemData = mockItems.find(i => i.id === item.itemId)!;
                return {
                    ...item,
                    description: itemData.description,
                    amount: item.quantity * item.rate
                };
            });

            const totalTaxableAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
            const gst = totalTaxableAmount * GST_RATE;
            const transportation = values.transportation || 0;
            const roundOff = values.roundOff || 0;
            const grandTotal = totalTaxableAmount + gst + transportation + roundOff;

            const party = mockSalesParties.find(p => p.id === values.salesPartyId)!;
            const billNumber = `SE/2025-26/${String(bills.length + 1).padStart(3, '0')}`;

            const dueDate = values.dueDate ? values.dueDate.format('YYYY-MM-DD') : dayjs(values.billDate).add(7, 'days').format('YYYY-MM-DD');

            const newBill: SalesBillResponse = {
                id: Math.max(...bills.map(b => b.id)) + 1,
                billNumber,
                billDate: values.billDate.format('YYYY-MM-DD'),
                totalTaxableAmount,
                gst,
                transportation,
                roundOff,
                grandTotal,
                salesParty: {
                    id: party.id,
                    name: party.name,
                    gst: party.gst,
                    phoneNumber: party.phoneNumber
                },
                vehicleDetails: values.vehicleDetails || null,
                modeOfPayment: values.modeOfPayment || null,
                dueDate,
                buyerOrderNo: values.buyerOrderNo || billNumber,
                termsOfDelivery: values.termsOfDelivery || null,
                items: items.map((item: any, index: number) => ({
                    id: index + 1,
                    serialNumber: index + 1,
                    ...item
                }))
            };

            setBills([...bills, newBill]);
            message.success(`Sales bill created successfully! Bill Number: ${billNumber}`);
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns: ColumnsType<SalesBillResponse> = [
        { title: 'Bill Number', dataIndex: 'billNumber', key: 'billNumber', width: 150 },
        {
            title: 'Bill Date',
            dataIndex: 'billDate',
            key: 'billDate',
            width: 120,
            render: (date: string) => formatDate(date)
        },
        { title: 'Party Name', dataIndex: ['salesParty', 'name'], key: 'partyName' },
        {
            title: 'Taxable Amount',
            dataIndex: 'totalTaxableAmount',
            key: 'totalTaxableAmount',
            width: 130,
            align: 'right',
            render: (val: number) => formatCurrency(val)
        },
        {
            title: 'GST',
            dataIndex: 'gst',
            key: 'gst',
            width: 110,
            align: 'right',
            render: (val: number) => formatCurrency(val)
        },
        {
            title: 'Grand Total',
            dataIndex: 'grandTotal',
            key: 'grandTotal',
            width: 130,
            align: 'right',
            render: (val: number) => <strong>{formatCurrency(val)}</strong>
        },
        {
            title: 'Mode',
            dataIndex: 'modeOfPayment',
            key: 'modeOfPayment',
            width: 100,
            render: (mode: string | null) => mode ? <Tag>{mode}</Tag> : '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: SalesBillResponse) => (
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

    return (
        <div>
            <PageHeader
                title="Sales Bills"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Create Bill
                    </Button>
                }
            />

            <Table
                dataSource={bills}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} bills` }}
            />

            <Modal
                title="Create Sales Bill"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={900}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <div style={{ padding: 12, background: '#f0f5ff', borderRadius: 4, marginBottom: 16 }}>
                        <p style={{ margin: 0, color: '#1890ff' }}>
                            ℹ️ Bill number will be auto-generated (e.g., SE/2025-26/001)
                        </p>
                    </div>

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
                            name="salesPartyId"
                            label="Sales Party"
                            rules={[{ required: true, message: 'Please select party' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="Select party" showSearch optionFilterProp="children">
                                {mockSalesParties.map((party) => (
                                    <Select.Option key={party.id} value={party.id}>
                                        {party.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="vehicleDetails" label="Vehicle Details (Optional)" style={{ flex: 1 }}>
                            <Input placeholder="e.g., MH-12-AB-1234" />
                        </Form.Item>

                        <Form.Item name="modeOfPayment" label="Mode of Payment (Optional)" style={{ flex: 1 }}>
                            <Select placeholder="Select payment mode" allowClear>
                                {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                                    <Select.Option key={value} value={value}>
                                        {label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                <h4>Items</h4>
                                {fields.map((field, index) => (
                                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'itemId']}
                                            label={index === 0 ? 'Item' : ''}
                                            rules={[{ required: true, message: 'Required' }]}
                                        >
                                            <Select placeholder="Select item" style={{ width: 300 }} showSearch optionFilterProp="children">
                                                {mockItems.map((item) => (
                                                    <Select.Option key={item.id} value={item.id}>
                                                        {item.description}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'quantity']}
                                            label={index === 0 ? 'Quantity' : ''}
                                            rules={[{ required: true, message: 'Required' }]}
                                        >
                                            <InputNumber min={0.01} placeholder="Qty" style={{ width: 100 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'rate']}
                                            label={index === 0 ? 'Rate' : ''}
                                            rules={[{ required: true, message: 'Required' }]}
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
                                <Button type="dashed" onClick={() => add()} block style={{ marginBottom: 16 }}>
                                    + Add Item
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="transportation" label="Transportation" style={{ flex: 1 }}>
                            <InputNumber min={0} placeholder="0.00" style={{ width: '100%' }} prefix="₹" />
                        </Form.Item>

                        <Form.Item name="roundOff" label="Round Off" style={{ flex: 1 }}>
                            <InputNumber placeholder="0.00" style={{ width: '100%' }} prefix="₹" />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="dueDate" label="Due Date (Optional)" style={{ flex: 1 }}>
                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                        </Form.Item>

                        <Form.Item name="buyerOrderNo" label="Buyer Order No (Optional)" style={{ flex: 1 }}>
                            <Input placeholder="Auto-generated if not provided" />
                        </Form.Item>
                    </Space>

                    <Form.Item name="termsOfDelivery" label="Terms of Delivery (Optional)">
                        <Input placeholder="e.g., Ex-warehouse, Door delivery" />
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title="Bill Details"
                placement="right"
                width={700}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            >
                {viewingBill && (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ color: '#1890ff' }}>Bill Number: {viewingBill.billNumber}</h3>
                            <p><strong>Bill Date:</strong> {formatDate(viewingBill.billDate)}</p>
                            <p><strong>Party:</strong> {viewingBill.salesParty.name}</p>
                            <p><strong>GST:</strong> {viewingBill.salesParty.gst}</p>
                            {viewingBill.vehicleDetails && <p><strong>Vehicle:</strong> {viewingBill.vehicleDetails}</p>}
                            {viewingBill.modeOfPayment && <p><strong>Payment Mode:</strong> {viewingBill.modeOfPayment}</p>}
                            <p><strong>Due Date:</strong> {formatDate(viewingBill.dueDate)}</p>
                        </div>

                        <h4>Items</h4>
                        <Table
                            dataSource={viewingBill.items}
                            pagination={false}
                            size="small"
                            columns={[
                                { title: '#', dataIndex: 'serialNumber', key: 'serialNumber', width: 50 },
                                { title: 'Description', dataIndex: 'description', key: 'description' },
                                { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
                                { title: 'Rate', dataIndex: 'rate', key: 'rate', width: 100, align: 'right', render: (v) => formatCurrency(v) },
                                { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 120, align: 'right', render: (v) => formatCurrency(v) },
                            ]}
                        />

                        <div style={{ marginTop: 24, textAlign: 'right', fontSize: 16 }}>
                            <p><strong>Taxable Amount:</strong> {formatCurrency(viewingBill.totalTaxableAmount)}</p>
                            <p><strong>GST (18%):</strong> {formatCurrency(viewingBill.gst)}</p>
                            <p><strong>Transportation:</strong> {formatCurrency(viewingBill.transportation)}</p>
                            <p><strong>Round Off:</strong> {formatCurrency(viewingBill.roundOff)}</p>
                            <p style={{ fontSize: 20, color: '#52c41a' }}><strong>Grand Total:</strong> {formatCurrency(viewingBill.grandTotal)}</p>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default SalesBills;
