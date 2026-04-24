import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Select, Spin, Alert, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import {
    getSalesParties, createSalesParty, updateSalesParty, deleteSalesParty,
    addAddressToParty, updatePartyAddress, deletePartyAddress,
    getSalesPartyPreviousBalance, saveSalesPartyPreviousBalance, deleteSalesPartyPreviousBalance,
} from '@/api/salesParties';
import type { SalesPartyResponse, SalesPartyRequest, SalesPartyCreateRequest, SalesAddressRequest } from '@/types';
import { State } from '@/types';
import { STATE_LABELS } from '@/utils/constants';
import { validateGST, validatePhone, validatePincode } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';



// ── Address type helper ───────────────────────────────────────────────────────
type PartyAddress = SalesPartyResponse['addresses'][0];

const SalesParties = () => {
    const queryClient = useQueryClient();

    // ── Party modal state ─────────────────────────────────────────────────────
    const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<SalesPartyResponse | null>(null);
    const [partyForm] = Form.useForm();

    // ── Address modal state ───────────────────────────────────────────────────
    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    const [addrParty, setAddrParty] = useState<SalesPartyResponse | null>(null);
    const [editingAddr, setEditingAddr] = useState<PartyAddress | null>(null);
    const [addrForm] = Form.useForm();

    // ── Previous Balance modal state ──────────────────────────────────────────
    const [isPbModalOpen, setIsPbModalOpen] = useState(false);
    const [selectedPbParty, setSelectedPbParty] = useState<SalesPartyResponse | null>(null);
    const [pbForm] = Form.useForm();

    // ── Fetch all parties ─────────────────────────────────────────────────────
    const { data: parties = [], isLoading, error } = useQuery({
        queryKey: ['salesParties'],
        queryFn: getSalesParties,
    });

    // ── Previous Balance query ────────────────────────────────────────────────
    const { data: pbData, isLoading: isPbLoading } = useQuery({
        queryKey: ['salesPreviousBalance', selectedPbParty?.id],
        queryFn: () => selectedPbParty ? getSalesPartyPreviousBalance(selectedPbParty.id) : null,
        enabled: !!selectedPbParty,
        retry: false,
    });

    useEffect(() => {
        if (pbData) {
            pbForm.setFieldsValue({ amount: pbData.amount });
        } else {
            pbForm.setFieldsValue({ amount: undefined });
        }
    }, [pbData, pbForm, isPbModalOpen]);

    // ── Mutations ─────────────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: (data: SalesPartyCreateRequest) => createSalesParty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Sales party created successfully');
            setIsPartyModalOpen(false);
            partyForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create sales party');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: SalesPartyRequest }) => updateSalesParty(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Sales party updated successfully');
            setIsPartyModalOpen(false);
            partyForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update sales party');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSalesParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Sales party deleted successfully');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete sales party');
        },
    });

    const addAddressMutation = useMutation({
        mutationFn: ({ partyId, data }: { partyId: number; data: SalesAddressRequest }) =>
            addAddressToParty(partyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Address added successfully');
            setIsAddrModalOpen(false);
            addrForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to add address');
        },
    });

    const updateAddressMutation = useMutation({
        mutationFn: ({ partyId, addressId, data }: { partyId: number; addressId: number; data: SalesAddressRequest }) =>
            updatePartyAddress(partyId, addressId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Address updated successfully');
            setIsAddrModalOpen(false);
            addrForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update address');
        },
    });

    const deleteAddressMutation = useMutation({
        mutationFn: ({ partyId, addressId }: { partyId: number; addressId: number }) =>
            deletePartyAddress(partyId, addressId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Address deleted successfully');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Cannot delete — address may be in use by an existing bill');
        },
    });

    const pbMutation = useMutation({
        mutationFn: saveSalesPartyPreviousBalance,
        onSuccess: () => {
            message.success('Previous balance saved successfully');
            setIsPbModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['salesPreviousBalance'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to save previous balance');
        },
    });

    const pbDeleteMutation = useMutation({
        mutationFn: deleteSalesPartyPreviousBalance,
        onSuccess: () => {
            message.success('Previous balance deleted successfully');
            setIsPbModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['salesPreviousBalance'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete previous balance');
        },
    });

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleAdd = () => {
        setEditingParty(null);
        partyForm.resetFields();
        partyForm.setFieldsValue({ addresses: [{}] });
        setIsPartyModalOpen(true);
    };

    const handleEdit = (record: SalesPartyResponse) => {
        setEditingParty(record);
        partyForm.setFieldsValue({
            name: record.name,
            gst: record.gst,
            phoneNumber: record.phoneNumber,
        });
        setIsPartyModalOpen(true);
    };

    const handlePartyOk = async () => {
        try {
            const values = await partyForm.validateFields();
            if (editingParty) {
                // Update: only name / gst / phone — no addresses
                const partyData: SalesPartyRequest = {
                    name: values.name,
                    gst: values.gst,
                    phoneNumber: values.phoneNumber,
                };
                updateMutation.mutate({ id: editingParty.id, data: partyData });
            } else {
                // Create: include initial addresses
                const partyData: SalesPartyCreateRequest = {
                    name: values.name,
                    gst: values.gst,
                    phoneNumber: values.phoneNumber,
                    addresses: (values.addresses ?? []).map((addr: any) => ({
                        unitNumber: addr.unitNumber,
                        buildingName: addr.buildingName,
                        streetOrLandmark: addr.streetOrLandmark || null,
                        destination: addr.destination,
                        city: addr.city,
                        state: addr.state,
                        pincode: addr.pincode,
                    })),
                };
                createMutation.mutate(partyData);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    // Address handlers
    const handleAddAddress = (record: SalesPartyResponse) => {
        setAddrParty(record);
        setEditingAddr(null);
        addrForm.resetFields();
        setIsAddrModalOpen(true);
    };

    const handleEditAddress = (party: SalesPartyResponse, addr: PartyAddress) => {
        setAddrParty(party);
        setEditingAddr(addr);
        addrForm.setFieldsValue({
            unitNumber: addr.unitNumber ?? '',
            buildingName: addr.buildingName ?? '',
            streetOrLandmark: addr.streetOrLandmark ?? '',
            destination: addr.destination ?? '',
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
        });
        setIsAddrModalOpen(true);
    };

    const handleAddrOk = async () => {
        if (!addrParty) return;
        try {
            const values = await addrForm.validateFields();
            const addrData: SalesAddressRequest = {
                unitNumber: values.unitNumber,
                buildingName: values.buildingName,
                streetOrLandmark: values.streetOrLandmark || null,
                destination: values.destination,
                city: values.city,
                state: values.state,
                pincode: values.pincode,
            };
            if (editingAddr) {
                updateAddressMutation.mutate({ partyId: addrParty.id, addressId: editingAddr.id, data: addrData });
            } else {
                addAddressMutation.mutate({ partyId: addrParty.id, data: addrData });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Previous Balance handlers
    const handlePbClick = (record: SalesPartyResponse) => {
        setSelectedPbParty(record);
        pbForm.resetFields();
        setIsPbModalOpen(true);
    };

    const handlePbOk = async () => {
        try {
            const values = await pbForm.validateFields();
            if (selectedPbParty) {
                pbMutation.mutate({ partyId: selectedPbParty.id, amount: Number(values.amount) });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handlePbDelete = () => {
        if (selectedPbParty) {
            pbDeleteMutation.mutate(selectedPbParty.id);
        }
    };

    // ── Table columns ─────────────────────────────────────────────────────────

    const columns: ColumnsType<SalesPartyResponse> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'GST', dataIndex: 'gst', key: 'gst', width: 190 },
        { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 140 },
        {
            title: 'Addresses',
            key: 'addrCount',
            width: 100,
            render: (_: any, record: SalesPartyResponse) => (
                <Tag color="blue">{record.addresses.length}</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 220,
            render: (_: any, record: SalesPartyResponse) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Party"
                        description="Are you sure you want to delete this party?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                    <Button type="link" icon={<DollarOutlined />} onClick={() => handlePbClick(record)}>
                        Prev Balance
                    </Button>
                </Space>
            ),
        },
    ];

    // ── Expanded row: address management ─────────────────────────────────────

    const expandedRowRender = (record: SalesPartyResponse) => {
        const addressColumns: ColumnsType<PartyAddress> = [
            {
                title: 'Address',
                key: 'fullAddress',
                render: (_: any, addr: PartyAddress) => {
                    const parts = [
                        addr.unitNumber,
                        addr.buildingName,
                        addr.streetOrLandmark,
                        addr.destination,
                        addr.city,
                    ].filter(Boolean);
                    return <span style={{ wordBreak: 'break-word' }}>{parts.join(', ')}</span>;
                },
            },
            {
                title: 'State',
                dataIndex: 'state',
                key: 'state',
                width: 160,
                render: (state: string) => STATE_LABELS[state as State] ?? state,
            },
            { title: 'Pincode', dataIndex: 'pincode', key: 'pincode', width: 90 },
            {
                title: '',
                key: 'addrActions',
                width: 130,
                render: (_: any, addr: PartyAddress) => (
                    <Space>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditAddress(record, addr)}
                        >
                            Edit
                        </Button>
                        <Popconfirm
                            title="Delete Address"
                            description="Cannot delete if used on an existing bill."
                            onConfirm={() => deleteAddressMutation.mutate({ partyId: record.id, addressId: addr.id })}
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                            cancelText="Cancel"
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deleteAddressMutation.isPending}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        return (
            <div style={{ padding: '0 48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ margin: 0 }}>Addresses</h4>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => handleAddAddress(record)}
                    >
                        Add Address
                    </Button>
                </div>
                {record.addresses.length === 0 ? (
                    <p style={{ color: '#8c8c8c' }}>No addresses yet.</p>
                ) : (
                    <Table
                        columns={addressColumns}
                        dataSource={record.addresses}
                        pagination={false}
                        size="small"
                        rowKey="id"
                    />
                )}
            </div>
        );
    };

    // ── Error state ───────────────────────────────────────────────────────────

    if (error) {
        return (
            <div>
                <PageHeader title="Sales Parties" />
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Alert
                        message="Error Loading Sales Parties"
                        description={error instanceof Error ? error.message : 'Failed to load sales parties. Please ensure the backend is running.'}
                        type="error"
                        showIcon
                    />
                    <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['salesParties'] })}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // ── Shared address form fields ─────────────────────────────────────────────

    const AddressFormFields = () => (
        <>
            <Form.Item
                name="unitNumber"
                label="Unit Number (Shop/Gala/Flat No.)"
                rules={[{ required: true, message: 'Enter unit number' }]}
            >
                <Input placeholder="e.g. Shop No. 12 / G-7 / Flat 3B" />
            </Form.Item>

            <Space style={{ width: '100%' }} size="large">
                <Form.Item
                    name="buildingName"
                    label="Building Name"
                    rules={[{ required: true, message: 'Enter building name' }]}
                    style={{ flex: 1 }}
                >
                    <Input placeholder="Building / Complex Name" />
                </Form.Item>
                <Form.Item
                    name="destination"
                    label="Destination / Area"
                    rules={[{ required: true, message: 'Enter destination / area' }]}
                    style={{ flex: 1 }}
                >
                    <Input placeholder="Delivery area / locality name" />
                </Form.Item>
            </Space>

            <Form.Item
                name="streetOrLandmark"
                label="Street / Landmark (Optional)"
            >
                <Input placeholder="Street name or nearby landmark" />
            </Form.Item>

            <Space style={{ width: '100%' }} size="large">
                <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: 'Enter city' }]}
                    style={{ flex: 1 }}
                >
                    <Input placeholder="City" />
                </Form.Item>
                <Form.Item
                    name="state"
                    label="State"
                    rules={[{ required: true, message: 'Select state' }]}
                    style={{ flex: 1 }}
                >
                    <Select placeholder="Select state" showSearch popupMatchSelectWidth={false}>
                        {Object.entries(STATE_LABELS).map(([value, label]) => (
                            <Select.Option key={value} value={value}>{label}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="pincode"
                    label="Pincode"
                    rules={validatePincode()}
                    style={{ flex: 1 }}
                >
                    <Input placeholder="Pincode (6 digits)" maxLength={6} />
                </Form.Item>
            </Space>
        </>
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div>
            <PageHeader
                title="Sales Parties"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Party
                    </Button>
                }
            />

            <Spin spinning={isLoading}>
                <Table
                    dataSource={parties}
                    columns={columns}
                    rowKey="id"
                    expandable={{ expandedRowRender }}
                    pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} parties` }}
                />
            </Spin>

            {/* ── Party Create / Edit Modal (name / GST / phone only) ── */}
            <Modal
                title={editingParty ? 'Edit Sales Party' : 'Add New Sales Party'}
                open={isPartyModalOpen}
                onOk={handlePartyOk}
                onCancel={() => setIsPartyModalOpen(false)}
                width={editingParty ? 600 : 800}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={partyForm} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        name="name"
                        label="Party Name"
                        rules={[{ required: true, message: 'Please enter party name' }]}
                    >
                        <Input placeholder="Enter party name" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="gst"
                            label="GST Number"
                            rules={validateGST()}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Enter GST number (15 characters)" maxLength={15} />
                        </Form.Item>
                        <Form.Item
                            name="phoneNumber"
                            label="Phone Number"
                            rules={validatePhone()}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Enter phone number (10 digits)" maxLength={10} />
                        </Form.Item>
                    </Space>

                    {/* Address section — only shown on create, not edit */}
                    {!editingParty && (
                        <>
                            <h4 style={{ marginTop: 16, marginBottom: 12 }}>Addresses (optional)</h4>
                            <Form.List name="addresses">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <div key={field.key} style={{
                                                border: '1px solid #f0f0f0',
                                                borderRadius: 6,
                                                padding: '12px 16px 4px',
                                                marginBottom: 12,
                                                background: '#fafafa',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                    <strong>Address {index + 1}</strong>
                                                    {fields.length > 1 && (
                                                        <Button type="link" danger size="small" onClick={() => remove(field.name)}>Remove</Button>
                                                    )}
                                                </div>

                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'unitNumber']}
                                                    label="Unit Number (Shop/Gala/Flat No.)"
                                                    rules={[{ required: true, message: 'Enter unit number' }]}
                                                >
                                                    <Input placeholder="e.g. Shop No. 12 / G-7" />
                                                </Form.Item>

                                                <Space style={{ width: '100%' }} size="large">
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'buildingName']}
                                                        label="Building Name"
                                                        rules={[{ required: true, message: 'Enter building name' }]}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Input placeholder="Building Name" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'destination']}
                                                        label="Destination / Area"
                                                        rules={[{ required: true, message: 'Enter destination' }]}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Input placeholder="Delivery area / locality" />
                                                    </Form.Item>
                                                </Space>

                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'streetOrLandmark']}
                                                    label="Street / Landmark (Optional)"
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input placeholder="Street name or nearby landmark" />
                                                </Form.Item>

                                                <Space style={{ width: '100%' }} size="large">
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'city']}
                                                        label="City"
                                                        rules={[{ required: true, message: 'Enter city' }]}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Input placeholder="City" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'state']}
                                                        label="State"
                                                        rules={[{ required: true, message: 'Select state' }]}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Select placeholder="Select state" showSearch popupMatchSelectWidth={false}>
                                                            {Object.entries(STATE_LABELS).map(([value, label]) => (
                                                                <Select.Option key={value} value={value}>{label}</Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'pincode']}
                                                        label="Pincode"
                                                        rules={validatePincode()}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Input placeholder="Pincode" maxLength={6} />
                                                    </Form.Item>
                                                </Space>
                                            </div>
                                        ))}
                                        <Button type="dashed" onClick={() => add({})} block>+ Add Address</Button>
                                    </>
                                )}
                            </Form.List>
                        </>
                    )}

                    {editingParty && (
                        <p style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8 }}>
                            To manage addresses, expand the party row in the table and use the address controls there.
                        </p>
                    )}
                </Form>
            </Modal>

            {/* ── Address Add / Edit Modal ── */}
            <Modal
                title={editingAddr
                    ? `Edit Address — ${addrParty?.name}`
                    : `Add Address — ${addrParty?.name}`}
                open={isAddrModalOpen}
                onOk={handleAddrOk}
                onCancel={() => { setIsAddrModalOpen(false); addrForm.resetFields(); }}
                width={700}
                confirmLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
            >
                <Form form={addrForm} layout="vertical" style={{ marginTop: 24 }}>
                    <AddressFormFields />
                </Form>
            </Modal>

            {/* ── Previous Balance Modal ── */}
            <Modal
                title={`Previous Balance - ${selectedPbParty?.name || ''}`}
                open={isPbModalOpen}
                onOk={handlePbOk}
                onCancel={() => setIsPbModalOpen(false)}
                confirmLoading={pbMutation.isPending}
                footer={[
                    <Button key="cancel" onClick={() => setIsPbModalOpen(false)}>Cancel</Button>,
                    pbData ? (
                        <Popconfirm
                            key="delete"
                            title="Delete Previous Balance"
                            description="Are you sure you want to delete this previous balance?"
                            onConfirm={handlePbDelete}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger loading={pbDeleteMutation.isPending}>Delete Balance</Button>
                        </Popconfirm>
                    ) : null,
                    <Button key="submit" type="primary" loading={pbMutation.isPending} onClick={handlePbOk}>
                        Save Balance
                    </Button>,
                ].filter(Boolean)}
            >
                <Spin spinning={isPbLoading}>
                    <Form form={pbForm} layout="vertical" style={{ marginTop: 24 }}>
                        <Form.Item
                            name="amount"
                            label="Balance Amount"
                            rules={[{ required: true, message: 'Please enter balance amount' }]}
                        >
                            <Input type="number" step="0.01" placeholder="Enter amount" />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </div>
    );
};

export default SalesParties;
