import {
    Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
    Space, message, Drawer, Spin, Alert, Popconfirm, Statistic, Row, Col,
} from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, EditOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import { getPurchaseBills, createPurchaseBill, updatePurchaseBill, deletePurchaseBill, calculatePurchaseBill } from '@/api/purchaseBills';
import { getPurchaseParties } from '@/api/purchaseParties';
import type { PurchaseBillResponse, PurchaseBillRequest, PurchaseCalculateResponse } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { validateQuantity, validateRate } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';

const PurchaseBills = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<PurchaseBillResponse | null>(null);
    const [viewingBill, setViewingBill] = useState<PurchaseBillResponse | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Live calculation preview state
    const [preview, setPreview] = useState<PurchaseCalculateResponse | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Queries ───────────────────────────────────────────────────────────────

    const { data: bills = [], isLoading, error } = useQuery({
        queryKey: ['purchaseBills'],
        queryFn: getPurchaseBills,
    });

    const { data: parties = [] } = useQuery({
        queryKey: ['purchaseParties'],
        queryFn: getPurchaseParties,
    });

    // ── Calculate preview (debounced 300ms) ───────────────────────────────────

    const triggerCalculate = useCallback(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            const formItems = form.getFieldValue('items') ?? [];
            const validItems = formItems.filter(
                (it: any) => it?.description?.trim() && it?.quantity > 0 && it?.rate >= 0
            );
            if (validItems.length === 0) { setPreview(null); return; }

            setIsCalculating(true);
            try {
                const result = await calculatePurchaseBill({
                    items: validItems.map((it: any) => ({
                        description: it.description,
                        quantity: it.quantity,
                        rate: it.rate,
                    })),
                });
                setPreview(result);
            } catch {
                // silently ignore — preview is best-effort
            } finally {
                setIsCalculating(false);
            }
        }, 300);
    }, [form]);

    // ── Mutations ─────────────────────────────────────────────────────────────

    const resetModal = () => {
        setIsModalOpen(false);
        setEditingBill(null);
        setPreview(null);
        form.resetFields();
    };

    const createMutation = useMutation({
        mutationFn: createPurchaseBill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseBills'] });
            message.success('Purchase bill created successfully');
            resetModal();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create purchase bill');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: PurchaseBillRequest }) => updatePurchaseBill(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseBills'] });
            message.success('Purchase bill updated successfully');
            resetModal();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update purchase bill');
        },
    });

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

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAdd = () => {
        setEditingBill(null);
        setPreview(null);
        form.resetFields();
        form.setFieldsValue({
            billDate: dayjs(),
            items: [{ description: '', quantity: 1, rate: 0 }],
        });
        setIsModalOpen(true);
    };

    const handleEdit = (record: PurchaseBillResponse) => {
        setEditingBill(record);
        setPreview(null);
        form.setFieldsValue({
            billNumber: record.billNumber,
            billDate: dayjs(record.billDate),
            partyId: record.party.id,
            items: record.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
            })),
        });
        setIsModalOpen(true);
        setTimeout(triggerCalculate, 100);
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
                    rate: item.rate,
                })),
            };

            if (editingBill) {
                updateMutation.mutate({ id: editingBill.id, data: billData });
            } else {
                createMutation.mutate(billData);
            }
        } catch (err) {
            console.error('Validation failed:', err);
        }
    };

    // ── Table Columns ─────────────────────────────────────────────────────────

    const columns: ColumnsType<PurchaseBillResponse> = [
        { title: 'Bill Number', dataIndex: 'billNumber', key: 'billNumber', width: 150 },
        { title: 'Bill Date', dataIndex: 'billDate', key: 'billDate', width: 120, render: (d) => formatDate(d) },
        { title: 'Party Name', dataIndex: ['party', 'name'], key: 'partyName' },
        {
            title: 'Amount', dataIndex: 'amount', key: 'amount',
            width: 130, align: 'right', render: (v) => formatCurrency(v),
        },
        {
            title: 'GST (18%)', dataIndex: 'gst', key: 'gst',
            width: 120, align: 'right', render: (v) => formatCurrency(v),
        },
        {
            title: 'Grand Total', dataIndex: 'total', key: 'total',
            width: 130, align: 'right', render: (v) => <strong>{formatCurrency(v)}</strong>,
        },
        {
            title: 'Actions', key: 'actions', width: 190,
            render: (_: any, record: PurchaseBillResponse) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>View</Button>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm
                        title="Delete Bill" description="Are you sure?" okText="Yes" cancelText="No"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ── Live Preview Panel ────────────────────────────────────────────────────

    const PreviewPanel = () => (
        <div style={{
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 8,
            padding: '16px 20px',
            marginTop: 16,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CalculatorOutlined style={{ color: '#52c41a' }} />
                <span style={{ fontWeight: 600, color: '#389e0d' }}>
                    Live Preview {isCalculating && <Spin size="small" style={{ marginLeft: 8 }} />}
                </span>
            </div>
            {preview ? (
                <Row gutter={16}>
                    <Col span={5}>
                        <Statistic title="Taxable Amount" value={preview.taxableAmount} prefix="₹" precision={2} valueStyle={{ fontSize: 13 }} />
                    </Col>
                    <Col span={4}>
                        <Statistic title="GST (18%)" value={preview.gst} prefix="₹" precision={2} valueStyle={{ fontSize: 13, color: '#fa8c16' }} />
                    </Col>
                    <Col span={5}>
                        <Statistic title="Sub-total" value={preview.total} prefix="₹" precision={2} valueStyle={{ fontSize: 13 }} />
                    </Col>
                    <Col span={5}>
                        <Statistic
                            title="Round Off"
                            value={preview.suggestedRoundOff}
                            prefix="₹"
                            precision={2}
                            valueStyle={{ fontSize: 13, color: preview.suggestedRoundOff < 0 ? '#ff4d4f' : '#52c41a' }}
                        />
                    </Col>
                    <Col span={5}>
                        <Statistic title="Grand Total" value={preview.grandTotal} prefix="₹" precision={2} valueStyle={{ fontSize: 15, fontWeight: 700, color: '#1677ff' }} />
                    </Col>
                </Row>
            ) : (
                <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                    {isCalculating ? 'Calculating…' : 'Add items to see a live preview'}
                </span>
            )}
        </div>
    );

    // ── Error state ───────────────────────────────────────────────────────────

    if (error) {
        return (
            <div>
                <PageHeader title="Purchase Bills" />
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Alert
                        message="Error Loading Purchase Bills"
                        description={error instanceof Error ? error.message : 'Failed to load. Ensure the backend is running.'}
                        type="error" showIcon
                    />
                    <Button type="primary" style={{ marginTop: 16 }}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['purchaseBills'] })}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div>
            <PageHeader
                title="Purchase Bills"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Create Bill</Button>}
            />

            <Spin spinning={isLoading}>
                <Table
                    dataSource={bills} columns={columns} rowKey="id"
                    pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} bills` }}
                />
            </Spin>

            {/* ── Create / Edit Modal ──────────────────────────────────────── */}
            <Modal
                title={editingBill ? 'Edit Purchase Bill' : 'Create Purchase Bill'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={resetModal}
                width={850}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                    onValuesChange={(_changed) => {
                        if ('items' in _changed) triggerCalculate();
                    }}
                >
                    <Form.Item name="billNumber" label="Bill Number"
                        rules={[{ required: true, message: 'Please enter bill number' }]}>
                        <Input placeholder="Enter bill number" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="billDate" label="Bill Date"
                            rules={[{ required: true, message: 'Please select bill date' }]} style={{ flex: 1 }}>
                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                        </Form.Item>
                        <Form.Item name="partyId" label="Party"
                            rules={[{ required: true, message: 'Please select party' }]} style={{ flex: 1 }}>
                            <Select placeholder="Select party" showSearch optionFilterProp="children">
                                {parties.map((p) => (
                                    <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    {/* Items */}
                    <h4>Items</h4>
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item {...field} name={[field.name, 'description']}
                                            label={index === 0 ? 'Description' : ''}
                                            rules={[{ required: true, message: 'Required' }]}>
                                            <Input placeholder="Item description" style={{ width: 280 }} />
                                        </Form.Item>
                                        <Form.Item {...field} name={[field.name, 'quantity']}
                                            label={index === 0 ? 'Qty' : ''} rules={validateQuantity()}>
                                            <InputNumber min={0.01} placeholder="Qty" style={{ width: 90 }} controls={false} />
                                        </Form.Item>
                                        <Form.Item {...field} name={[field.name, 'rate']}
                                            label={index === 0 ? 'Rate (₹)' : ''} rules={validateRate()}>
                                            <InputNumber min={0} placeholder="Rate" style={{ width: 130 }} prefix="₹" controls={false} />
                                        </Form.Item>
                                        {fields.length > 1 && (
                                            <Button type="link" danger onClick={() => remove(field.name)}>
                                                Remove
                                            </Button>
                                        )}
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block>+ Add Item</Button>
                            </>
                        )}
                    </Form.List>

                    {/* Live preview */}
                    <PreviewPanel />
                </Form>
            </Modal>

            {/* ── View Drawer ──────────────────────────────────────────────── */}
            <Drawer
                title="Bill Details" placement="right" width={600}
                open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
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
                            dataSource={viewingBill.items} pagination={false} size="small"
                            columns={[
                                { title: 'Description', dataIndex: 'description', key: 'description' },
                                { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
                                { title: 'Rate', dataIndex: 'rate', key: 'rate', width: 100, align: 'right', render: (v) => formatCurrency(v) },
                                { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 120, align: 'right', render: (v) => formatCurrency(v) },
                            ]}
                        />
                        <div style={{ marginTop: 24, textAlign: 'right' }}>
                            <p><strong>Taxable Amount:</strong> {formatCurrency(viewingBill.amount)}</p>
                            <p><strong>GST (18%):</strong> {formatCurrency(viewingBill.gst)}</p>
                            {viewingBill.roundOff !== 0 && (
                                <p><strong>Round Off:</strong>{' '}
                                    <span style={{ color: viewingBill.roundOff < 0 ? '#ff4d4f' : '#52c41a' }}>
                                        {formatCurrency(viewingBill.roundOff)}
                                    </span>
                                </p>
                            )}
                            <p style={{ fontSize: 18 }}><strong>Grand Total:</strong> {formatCurrency(viewingBill.total)}</p>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default PurchaseBills;
