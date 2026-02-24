import {
    Table, Button, Modal, Form, Select, DatePicker, InputNumber, Input,
    Space, message, Drawer, Spin, Alert, Radio, Popconfirm, Statistic, Row, Col,
} from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, EditOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import { getSalesBills, createSalesBill, updateSalesBill, deleteSalesBill, calculateSalesBill } from '@/api/salesBills';
import { getSalesParties, getSalesParty } from '@/api/salesParties';
import { getItems } from '@/api/items';
import type { SalesBillResponse, SalesBillRequest, SalesCalculateResponse } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_MODE_LABELS } from '@/utils/constants';
import { validateQuantity, validateRate } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatAddress = (addr: {
    shopGalaNumber?: string | null;
    buildingName?: string | null;
    compoundAreaName?: string | null;
    city: string; state: string; pincode: string;
} | null): string => {
    if (!addr) return '—';
    return [addr.shopGalaNumber, addr.buildingName, addr.compoundAreaName, addr.city, addr.state, addr.pincode]
        .filter(Boolean).join(', ');
};

// ── Component ─────────────────────────────────────────────────────────────────

const SalesBills = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<SalesBillResponse | null>(null);
    const [viewingBill, setViewingBill] = useState<SalesBillResponse | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Address UI state
    const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
    const [addrMode, setAddrMode] = useState<'same' | 'separate'>('same');

    // Live calculation preview state
    const [preview, setPreview] = useState<SalesCalculateResponse | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Queries ───────────────────────────────────────────────────────────────

    const { data: bills = [], isLoading, error } = useQuery({
        queryKey: ['salesBills'],
        queryFn: getSalesBills,
    });

    const { data: parties = [] } = useQuery({
        queryKey: ['salesParties'],
        queryFn: getSalesParties,
    });

    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    const { data: selectedParty } = useQuery({
        queryKey: ['salesParty', selectedPartyId],
        queryFn: () => getSalesParty(selectedPartyId!),
        enabled: !!selectedPartyId,
        staleTime: 0,
    });

    const partyAddresses = selectedParty?.addresses ?? [];
    const hasMultipleAddresses = partyAddresses.length > 1;

    // ── Calculate preview (debounced 300ms) ───────────────────────────────────

    const triggerCalculate = useCallback(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            const formItems = form.getFieldValue('items') ?? [];
            const transportation = form.getFieldValue('transportation') ?? 0;

            // Only call if every item has itemId + quantity + rate
            const validItems = formItems.filter(
                (it: any) => it?.itemId && it?.quantity > 0 && it?.rate >= 0
            );
            if (validItems.length === 0) { setPreview(null); return; }

            setIsCalculating(true);
            try {
                const result = await calculateSalesBill({
                    items: validItems.map((it: any) => ({
                        itemId: it.itemId,
                        quantity: it.quantity,
                        rate: it.rate,
                    })),
                    transportation: transportation || 0,
                });
                setPreview(result);
                // no longer pre-filling a form field — round off lives in the preview
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
        setSelectedPartyId(null);
        setAddrMode('same');
        setPreview(null);
        form.resetFields();
    };

    const createMutation = useMutation({
        mutationFn: createSalesBill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesBills'] });
            message.success('Sales bill created successfully');
            resetModal();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create sales bill');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: SalesBillRequest }) => updateSalesBill(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesBills'] });
            message.success('Sales bill updated successfully');
            resetModal();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update sales bill');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSalesBill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesBills'] });
            message.success('Sales bill deleted successfully');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete sales bill');
        },
    });

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAdd = () => {
        setEditingBill(null);
        setSelectedPartyId(null);
        setAddrMode('same');
        setPreview(null);
        form.resetFields();
        form.setFieldsValue({
            billDate: dayjs(),
            items: [{ itemId: undefined, quantity: 1, rate: 0 }],
            transportation: 0,
            roundOff: 0,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (record: SalesBillResponse) => {
        setEditingBill(record);
        setSelectedPartyId(record.salesParty.id);
        setPreview(null);

        const hasBilling = !!record.billingAddress;
        const hasShipping = !!record.shippingAddress;
        const sameAddr = hasBilling && hasShipping && record.billingAddress?.id === record.shippingAddress?.id;
        setAddrMode(hasBilling && hasShipping && !sameAddr ? 'separate' : 'same');

        form.setFieldsValue({
            billDate: dayjs(record.billDate),
            salesPartyId: record.salesParty.id,
            items: record.items.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                rate: item.rate,
            })),
            transportation: record.transportation,
            roundOff: record.roundOff,
            vehicleDetails: record.vehicleDetails,
            modeOfPayment: record.modeOfPayment,
            dueDate: record.dueDate ? dayjs(record.dueDate) : null,
            addressId: sameAddr ? record.billingAddress?.id : undefined,
            billingAddressId: !sameAddr ? record.billingAddress?.id : undefined,
            shippingAddressId: !sameAddr ? record.shippingAddress?.id : undefined,
        });
        setIsModalOpen(true);
        // Trigger initial preview for edit
        setTimeout(triggerCalculate, 100);
    };

    const handleView = (record: SalesBillResponse) => {
        setViewingBill(record);
        setIsDrawerOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handlePartyChange = (partyId: number) => {
        setSelectedPartyId(partyId);
        setAddrMode('same');
        form.setFieldsValue({ addressId: undefined, billingAddressId: undefined, shippingAddressId: undefined });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            let billingAddressId: number | undefined;
            let shippingAddressId: number | undefined;

            if (partyAddresses.length > 0) {
                if (addrMode === 'same') {
                    billingAddressId = values.addressId ?? undefined;
                    shippingAddressId = values.addressId ?? undefined;
                } else {
                    billingAddressId = values.billingAddressId ?? undefined;
                    shippingAddressId = values.shippingAddressId ?? undefined;
                }
            }

            const billData: SalesBillRequest = {
                billDate: values.billDate.format('YYYY-MM-DD'),
                salesPartyId: values.salesPartyId,
                ...(billingAddressId != null && { billingAddressId }),
                ...(shippingAddressId != null && { shippingAddressId }),
                items: values.items.map((item: any) => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                    rate: item.rate,
                })),
                vehicleDetails: values.vehicleDetails || undefined,
                transportation: values.transportation || 0,
                modeOfPayment: values.modeOfPayment || undefined,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
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

    const columns: ColumnsType<SalesBillResponse> = [
        { title: 'Bill Number', dataIndex: 'billNumber', key: 'billNumber', width: 150 },
        { title: 'Bill Date', dataIndex: 'billDate', key: 'billDate', width: 120, render: (d) => formatDate(d) },
        { title: 'Party Name', dataIndex: ['salesParty', 'name'], key: 'partyName' },
        {
            title: 'Taxable Amount', dataIndex: 'totalTaxableAmount', key: 'totalTaxableAmount',
            width: 140, align: 'right', render: (v) => formatCurrency(v),
        },
        {
            title: 'Grand Total', dataIndex: 'grandTotal', key: 'grandTotal',
            width: 130, align: 'right', render: (v) => <strong>{formatCurrency(v)}</strong>,
        },
        {
            title: 'Actions', key: 'actions', width: 190,
            render: (_: any, record: SalesBillResponse) => (
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

    // ── Address helper ────────────────────────────────────────────────────────

    const AddressSelect = ({ name, label }: { name: string; label: string }) => (
        <Form.Item name={name} label={label}>
            <Select placeholder="Select address (optional)" allowClear>
                {partyAddresses.map((addr) => (
                    <Select.Option key={addr.id} value={addr.id}>
                        {formatAddress(addr)}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
    );

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
                        <Statistic title="Taxable Amount" value={preview.totalTaxableAmount} prefix="₹" precision={2} valueStyle={{ fontSize: 13 }} />
                    </Col>
                    <Col span={4}>
                        <Statistic title="GST (18%)" value={preview.gst} prefix="₹" precision={2} valueStyle={{ fontSize: 13, color: '#fa8c16' }} />
                    </Col>
                    <Col span={5}>
                        <Statistic title="Transportation" value={preview.transportation} prefix="₹" precision={2} valueStyle={{ fontSize: 13 }} />
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
                <PageHeader title="Sales Bills" />
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Alert
                        message="Error Loading Sales Bills"
                        description={error instanceof Error ? error.message : 'Failed to load. Ensure the backend is running.'}
                        type="error" showIcon
                    />
                    <Button type="primary" style={{ marginTop: 16 }}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['salesBills'] })}>
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
                title="Sales Bills"
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
                title={editingBill ? 'Edit Sales Bill' : 'Create Sales Bill'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={resetModal}
                width={960}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                    onValuesChange={(_changed) => {
                        // Recalculate when items or transportation change
                        if ('items' in _changed || 'transportation' in _changed) {
                            triggerCalculate();
                        }
                    }}
                >
                    {/* Party & Date */}
                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="billDate" label="Bill Date"
                            rules={[{ required: true, message: 'Please select bill date' }]} style={{ flex: 1 }}>
                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                        </Form.Item>
                        <Form.Item name="salesPartyId" label="Party"
                            rules={[{ required: true, message: 'Please select party' }]} style={{ flex: 1 }}>
                            <Select placeholder="Select party" showSearch optionFilterProp="children"
                                onChange={handlePartyChange}>
                                {parties.map((p) => (
                                    <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    {/* Address selection */}
                    {selectedPartyId && partyAddresses.length > 0 && (
                        <div style={{
                            background: '#fafafa', border: '1px solid #f0f0f0',
                            borderRadius: 6, padding: '16px 16px 4px', marginBottom: 16,
                        }}>
                            <div style={{ marginBottom: 12, fontWeight: 500 }}>Addresses (Optional)</div>
                            {hasMultipleAddresses && (
                                <Form.Item label="Address Mode">
                                    <Radio.Group value={addrMode} onChange={(e) => {
                                        setAddrMode(e.target.value);
                                        form.setFieldsValue({ addressId: undefined, billingAddressId: undefined, shippingAddressId: undefined });
                                    }}>
                                        <Radio value="same">Same for Billing &amp; Shipping</Radio>
                                        <Radio value="separate">Separate Billing &amp; Shipping</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            )}
                            {addrMode === 'same' ? (
                                <AddressSelect name="addressId" label={hasMultipleAddresses ? 'Address (Billing & Shipping)' : 'Address (optional)'} />
                            ) : (
                                <Space style={{ width: '100%' }} size="large">
                                    <div style={{ flex: 1 }}><AddressSelect name="billingAddressId" label="Billing Address" /></div>
                                    <div style={{ flex: 1 }}><AddressSelect name="shippingAddressId" label="Shipping Address" /></div>
                                </Space>
                            )}
                        </div>
                    )}

                    {/* Items */}
                    <h4>Items</h4>
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item {...field} name={[field.name, 'itemId']}
                                            label={index === 0 ? 'Item' : ''}
                                            rules={[{ required: true, message: 'Select item' }]}>
                                            <Select placeholder="Select item" style={{ width: 250 }} showSearch
                                                optionFilterProp="children">
                                                {items.map((item) => (
                                                    <Select.Option key={item.id} value={item.id}>
                                                        {item.description}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item {...field} name={[field.name, 'quantity']}
                                            label={index === 0 ? 'Qty' : ''} rules={validateQuantity()}>
                                            <InputNumber
                                                min={0.01} placeholder="Qty" style={{ width: 90 }}
                                                controls={false}
                                            />
                                        </Form.Item>
                                        <Form.Item {...field} name={[field.name, 'rate']}
                                            label={index === 0 ? 'Rate (₹)' : ''} rules={validateRate()}>
                                            <InputNumber
                                                min={0} placeholder="Rate" style={{ width: 120 }} prefix="₹"
                                                controls={false}
                                            />
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


                    {/* Additional Details */}
                    <h4>Additional Details</h4>
                    <Form.Item name="vehicleDetails" label="Vehicle Details (Optional)">
                        <Input placeholder="Enter vehicle details" />
                    </Form.Item>
                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="transportation" label="Transportation (₹)">
                            <InputNumber
                                min={0} placeholder="0.00" prefix="₹" style={{ width: '100%' }}
                                controls={false}
                                onChange={() => triggerCalculate()}
                            />
                        </Form.Item>
                    </Space>

                    {/* Payment Details */}
                    <h4>Payment Details (Optional)</h4>
                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="modeOfPayment" label="Payment Mode">
                            <Select placeholder="Select mode" style={{ width: 200 }} allowClear>
                                {Object.entries(PAYMENT_MODE_LABELS).map(([v, l]) => (
                                    <Select.Option key={v} value={v}>{l}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="dueDate" label="Due Date">
                            <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>

            {/* ── View Drawer ──────────────────────────────────────────────── */}
            <Drawer
                title="Bill Details" placement="right" width={700}
                open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
            >
                {viewingBill && (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <p><strong>Bill Number:</strong> {viewingBill.billNumber}</p>
                            <p><strong>Bill Date:</strong> {formatDate(viewingBill.billDate)}</p>
                            <p><strong>Party:</strong> {viewingBill.salesParty.name}</p>
                            <p><strong>GST:</strong> {viewingBill.salesParty.gst}</p>
                            {viewingBill.billingAddress && (
                                <p><strong>Billing Address:</strong> {formatAddress(viewingBill.billingAddress)}</p>
                            )}
                            {viewingBill.shippingAddress && (
                                <p><strong>Shipping Address:</strong> {formatAddress(viewingBill.shippingAddress)}</p>
                            )}
                            {viewingBill.vehicleDetails && (
                                <p><strong>Vehicle:</strong> {viewingBill.vehicleDetails}</p>
                            )}
                        </div>
                        <h4>Items</h4>
                        <Table
                            dataSource={viewingBill.items} pagination={false} size="small" rowKey="id"
                            columns={[
                                { title: 'Description', dataIndex: 'description', key: 'description' },
                                { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
                                { title: 'Rate', dataIndex: 'rate', key: 'rate', width: 100, align: 'right', render: (v) => formatCurrency(v) },
                                { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 120, align: 'right', render: (v) => formatCurrency(v) },
                            ]}
                        />
                        <div style={{ marginTop: 24, textAlign: 'right' }}>
                            <p><strong>Taxable Amount:</strong> {formatCurrency(viewingBill.totalTaxableAmount)}</p>
                            <p><strong>GST (18%):</strong> {formatCurrency(viewingBill.gst)}</p>
                            {viewingBill.transportation > 0 && (
                                <p><strong>Transportation:</strong> {formatCurrency(viewingBill.transportation)}</p>
                            )}
                            {viewingBill.roundOff !== 0 && (
                                <p><strong>Round Off:</strong> {formatCurrency(viewingBill.roundOff)}</p>
                            )}
                            <p style={{ fontSize: 18 }}><strong>Grand Total:</strong> {formatCurrency(viewingBill.grandTotal)}</p>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default SalesBills;
