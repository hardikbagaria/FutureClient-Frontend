import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { getItems, createItem, updateItem, deleteItem } from '@/api/items';
import type { ItemResponse, ItemRequest } from '@/types';
import { UnitType } from '@/types';
import { UNIT_LABELS } from '@/utils/constants';
import { validateHSN } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';

const ItemsList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItemResponse | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch items
    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    // Create item mutation
    const createMutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            message.success('Item created successfully');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create item');
        },
    });

    // Update item mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ItemRequest }) => updateItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            message.success('Item updated successfully');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update item');
        },
    });

    // Delete item mutation
    const deleteMutation = useMutation({
        mutationFn: deleteItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            message.success('Item deleted successfully');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete item');
        },
    });

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: ItemResponse) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const itemData: ItemRequest = {
                description: values.description,
                hsn: values.hsn,
                unit: values.unit,
            };

            if (editingItem) {
                updateMutation.mutate({ id: editingItem.id, data: itemData });
            } else {
                createMutation.mutate(itemData);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const filteredItems = items.filter((item) =>
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.hsn.includes(searchText)
    );

    const columns: ColumnsType<ItemResponse> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'HSN Code',
            dataIndex: 'hsn',
            key: 'hsn',
            width: 150,
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            width: 120,
            render: (unit: string) => UNIT_LABELS[unit as UnitType] || unit,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: ItemResponse) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Item"
                        description="Are you sure you want to delete this item?"
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
                <PageHeader title="Items" />
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p style={{ color: 'red' }}>Error loading items. Please ensure the backend is running.</p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['items'] })}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Items"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Item
                    </Button>
                }
            />

            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search by description or HSN code..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Spin spinning={isLoading}>
                <Table
                    dataSource={filteredItems}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} items` }}
                />
            </Spin>

            <Modal
                title={editingItem ? 'Edit Item' : 'Add New Item'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input placeholder="Enter item description" />
                    </Form.Item>

                    <Form.Item
                        name="hsn"
                        label="HSN Code"
                        rules={validateHSN()}
                    >
                        <Input placeholder="Enter HSN code (4-8 digits)" maxLength={8} />
                    </Form.Item>

                    <Form.Item
                        name="unit"
                        label="Unit"
                        rules={[{ required: true, message: 'Please select unit' }]}
                    >
                        <Select placeholder="Select unit">
                            {Object.entries(UNIT_LABELS).map(([value, label]) => (
                                <Select.Option key={value} value={value}>
                                    {label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ItemsList;
