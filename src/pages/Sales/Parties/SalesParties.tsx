import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Select, Collapse, Spin, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { getSalesParties, createSalesParty, updateSalesParty, deleteSalesParty } from '@/api/salesParties';
import type { SalesPartyResponse, SalesPartyRequest } from '@/types';
import { State } from '@/types';
import { STATE_LABELS } from '@/utils/constants';
import { validateGST, validatePhone, validatePincode } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';

const { Panel } = Collapse;

const SalesParties = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<SalesPartyResponse | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch sales parties
    const { data: parties = [], isLoading, error } = useQuery({
        queryKey: ['salesParties'],
        queryFn: getSalesParties,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createSalesParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Sales party created successfully');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create sales party');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: SalesPartyRequest }) => updateSalesParty(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salesParties'] });
            message.success('Sales party updated successfully');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update sales party');
        },
    });

    // Delete mutation
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

    const handleAdd = () => {
        setEditingParty(null);
        form.resetFields();
        form.setFieldsValue({
            addresses: [{}]
        });
        setIsModalOpen(true);
    };

    const handleEdit = (record: SalesPartyResponse) => {
        setEditingParty(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const partyData: SalesPartyRequest = {
                name: values.name,
                gst: values.gst,
                phoneNumber: values.phoneNumber,
                addresses: values.addresses.map((addr: any) => ({
                    shopGalaNumber: addr.shopGalaNumber || null,
                    buildingName: addr.buildingName || null,
                    compoundAreaName: addr.compoundAreaName || null,
                    city: addr.city,
                    state: addr.state,
                    pincode: addr.pincode
                }))
            };

            if (editingParty) {
                updateMutation.mutate({ id: editingParty.id, data: partyData });
            } else {
                createMutation.mutate(partyData);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns: ColumnsType<SalesPartyResponse> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'GST', dataIndex: 'gst', key: 'gst', width: 200 },
        { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 150 },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
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
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record: SalesPartyResponse) => {
        const addressColumns: ColumnsType<typeof record.addresses[0]> = [
            {
                title: 'Address',
                key: 'fullAddress',
                render: (_: any, addr: any) => {
                    const parts = [
                        addr.shopGalaNumber,
                        addr.buildingName,
                        addr.compoundAreaName,
                        addr.city
                    ].filter(Boolean);
                    return parts.join(', ');
                }
            },
            { title: 'State', dataIndex: 'state', key: 'state', width: 120, render: (state: string) => STATE_LABELS[state as State] },
            { title: 'Pincode', dataIndex: 'pincode', key: 'pincode', width: 100 },
        ];

        return (
            <div style={{ padding: '0 48px' }}>
                <h4>Addresses</h4>
                <Table
                    columns={addressColumns}
                    dataSource={record.addresses}
                    pagination={false}
                    size="small"
                    rowKey="id"
                />
            </div>
        );
    };

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

            <Modal
                title={editingParty ? 'Edit Sales Party' : 'Add New Sales Party'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={800}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
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

                    <h4 style={{ marginTop: 16, marginBottom: 12 }}>Addresses</h4>
                    <Form.List name="addresses">
                        {(fields, { add, remove }) => (
                            <>
                                <Collapse defaultActiveKey={[0]}>
                                    {fields.map((field, index) => (
                                        <Panel
                                            header={`Address ${index + 1}`}
                                            key={field.key}
                                            extra={fields.length > 1 && (
                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        remove(field.name);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        >
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'shopGalaNumber']}
                                                label="Shop/Gala Number"
                                            >
                                                <Input placeholder="Shop/Gala No." />
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
                                                    name={[field.name, 'compoundAreaName']}
                                                    label="Compound / Area Name"
                                                    rules={[{ required: true, message: 'Enter compound / area name' }]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input placeholder="Compound / Area Name" />
                                                </Form.Item>
                                            </Space>

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
                                                    <Select placeholder="Select state" showSearch>
                                                        {Object.entries(STATE_LABELS).map(([value, label]) => (
                                                            <Select.Option key={value} value={value}>
                                                                {label}
                                                            </Select.Option>
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
                                                    <Input placeholder="Pincode (6 digits)" maxLength={6} />
                                                </Form.Item>
                                            </Space>
                                        </Panel>
                                    ))}
                                </Collapse>
                                <Button type="dashed" onClick={() => add({})} block style={{ marginTop: 12 }}>
                                    + Add Address
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
};

export default SalesParties;
