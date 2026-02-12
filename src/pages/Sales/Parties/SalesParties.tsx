import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Select, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { mockSalesParties } from '@/utils/mockData';
import type { SalesPartyResponse } from '@/types';
import { AddressType, State } from '@/types';
import { STATE_LABELS } from '@/utils/constants';
import type { ColumnsType } from 'antd/es/table';

const { Panel } = Collapse;

const SalesParties = () => {
    const [parties, setParties] = useState<SalesPartyResponse[]>(mockSalesParties);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<SalesPartyResponse | null>(null);
    const [form] = Form.useForm();

    const handleAdd = () => {
        setEditingParty(null);
        form.resetFields();
        form.setFieldsValue({
            addresses: [{ addressType: AddressType.BILLING }]
        });
        setIsModalOpen(true);
    };

    const handleEdit = (record: SalesPartyResponse) => {
        setEditingParty(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setParties(parties.filter((party) => party.id !== id));
        message.success('Party deleted successfully');
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingParty) {
                setParties(parties.map((party) =>
                    party.id === editingParty.id ? { ...party, ...values } : party
                ));
                message.success('Party updated successfully');
            } else {
                const newParty: SalesPartyResponse = {
                    id: Math.max(...parties.map(p => p.id)) + 1,
                    ...values,
                    addresses: values.addresses.map((addr: any, idx: number) => ({
                        id: idx + 1,
                        ...addr,
                        shopGalaNumber: addr.shopGalaNumber || null,
                        buildingName: addr.buildingName || null,
                        compoundAreaName: addr.compoundAreaName || null,
                    }))
                };
                setParties([...parties, newParty]);
                message.success('Party created successfully');
            }

            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const columns: ColumnsType<SalesPartyResponse> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'GST', dataIndex: 'gst', key: 'gst', width: 200 },
        { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 150 },
        {
            title: 'Addresses',
            key: 'addressCount',
            width: 100,
            align: 'center',
            render: (_: any, record: SalesPartyResponse) => record.addresses.length
        },
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
            { title: 'Type', dataIndex: 'addressType', key: 'addressType', width: 100 },
            {
                title: 'Address',
                key: 'fullAddress',
                render: (_: any, addr: any) => {
                    const parts = [addr.shopGalaNumber, addr.buildingName, addr.compoundAreaName].filter(Boolean);
                    return parts.join(', ');
                }
            },
            { title: 'City', dataIndex: 'city', key: 'city', width: 120 },
            { title: 'State', dataIndex: 'state', key: 'state', width: 150 },
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

            <Table
                dataSource={parties}
                columns={columns}
                rowKey="id"
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.addresses.length > 0
                }}
                pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} parties` }}
            />

            <Modal
                title={editingParty ? 'Edit Party' : 'Add New Party'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
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
                            rules={[
                                { required: true, message: 'Please enter GST number' },
                                { len: 15, message: 'GST number must be 15 characters' }
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Enter GST number" maxLength={15} />
                        </Form.Item>

                        <Form.Item
                            name="phoneNumber"
                            label="Phone Number"
                            rules={[
                                { required: true, message: 'Please enter phone number' },
                                { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' }
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Enter phone number" maxLength={10} />
                        </Form.Item>
                    </Space>

                    <h4 style={{ marginTop: 16, marginBottom: 12 }}>Addresses</h4>
                    <Form.List name="addresses">
                        {(fields, { add, remove }) => (
                            <>
                                <Collapse>
                                    {fields.map((field, index) => (
                                        <Panel header={`Address ${index + 1}`} key={field.key}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'addressType']}
                                                label="Address Type"
                                                rules={[{ required: true, message: 'Required' }]}
                                            >
                                                <Select placeholder="Select type">
                                                    <Select.Option value={AddressType.BILLING}>Billing</Select.Option>
                                                    <Select.Option value={AddressType.SHIPPING}>Shipping</Select.Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'shopGalaNumber']}
                                                label="Shop/Gala Number (Optional)"
                                            >
                                                <Input placeholder="Enter shop/gala number" />
                                            </Form.Item>

                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'buildingName']}
                                                label="Building Name (Optional)"
                                            >
                                                <Input placeholder="Enter building name" />
                                            </Form.Item>

                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'compoundAreaName']}
                                                label="Compound/Area Name (Optional)"
                                            >
                                                <Input placeholder="Enter compound/area name" />
                                            </Form.Item>

                                            <Space style={{ width: '100%' }}>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'city']}
                                                    label="City"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input placeholder="Enter city" />
                                                </Form.Item>

                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'pincode']}
                                                    label="Pincode"
                                                    rules={[
                                                        { required: true, message: 'Required' },
                                                        { pattern: /^[0-9]{6}$/, message: 'Enter valid 6-digit pincode' }
                                                    ]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input placeholder="Enter pincode" maxLength={6} />
                                                </Form.Item>
                                            </Space>

                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'state']}
                                                label="State"
                                                rules={[{ required: true, message: 'Required' }]}
                                            >
                                                <Select placeholder="Select state" showSearch>
                                                    {Object.entries(STATE_LABELS).map(([value, label]) => (
                                                        <Select.Option key={value} value={value}>
                                                            {label}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>

                                            {fields.length > 1 && (
                                                <Button type="dashed" danger onClick={() => remove(field.name)} block>
                                                    Remove Address
                                                </Button>
                                            )}
                                        </Panel>
                                    ))}
                                </Collapse>
                                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 12 }}>
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
