import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { getPurchaseParties, createPurchaseParty, updatePurchaseParty, deletePurchaseParty, getPurchasePartyPreviousBalance, savePurchasePartyPreviousBalance, deletePurchasePartyPreviousBalance } from '@/api/purchaseParties';
import type { PurchasePartyResponse, PurchasePartyRequest } from '@/types';
import { validateGST, validatePhone } from '@/utils/validators';
import type { ColumnsType } from 'antd/es/table';

const PurchaseParties = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<PurchasePartyResponse | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Previous Balance states
    const [isPbModalOpen, setIsPbModalOpen] = useState(false);
    const [selectedPbParty, setSelectedPbParty] = useState<PurchasePartyResponse | null>(null);
    const [pbForm] = Form.useForm();

    const { data: pbData, isLoading: isPbLoading } = useQuery({
        queryKey: ['purchasePreviousBalance', selectedPbParty?.id],
        queryFn: () => selectedPbParty ? getPurchasePartyPreviousBalance(selectedPbParty.id) : null,
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

    const pbMutation = useMutation({
        mutationFn: savePurchasePartyPreviousBalance,
        onSuccess: () => {
            message.success('Previous balance saved successfully');
            setIsPbModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['purchasePreviousBalance'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to save previous balance');
        },
    });

    const pbDeleteMutation = useMutation({
        mutationFn: deletePurchasePartyPreviousBalance,
        onSuccess: () => {
            message.success('Previous balance deleted successfully');
            setIsPbModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['purchasePreviousBalance'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete previous balance');
        },
    });

    const handlePbClick = (record: PurchasePartyResponse) => {
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

    // Fetch purchase parties
    const { data: parties = [], isLoading, error } = useQuery({
        queryKey: ['purchaseParties'],
        queryFn: getPurchaseParties,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createPurchaseParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseParties'] });
            message.success('Purchase party created successfully');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create purchase party');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: PurchasePartyRequest }) => updatePurchaseParty(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseParties'] });
            message.success('Purchase party updated successfully');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update purchase party');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deletePurchaseParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseParties'] });
            message.success('Purchase party deleted successfully');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete purchase party');
        },
    });

    const handleAdd = () => {
        setEditingParty(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: PurchasePartyResponse) => {
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
            const partyData: PurchasePartyRequest = {
                name: values.name,
                gst: values.gst,
                phoneNumber: values.phoneNumber,
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

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const columns: ColumnsType<PurchasePartyResponse> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'GST', dataIndex: 'gst', key: 'gst', width: 200 },
        { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 150 },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: PurchasePartyResponse) => (
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
                    <Button type="link" icon={<DollarOutlined />} onClick={() => handlePbClick(record)}>
                        Prev Balance
                    </Button>
                </Space>
            ),
        },
    ];

    if (error) {
        return (
            <div>
                <PageHeader title="Purchase Parties" />
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p style={{ color: 'red' }}>Error loading purchase parties. Please ensure the backend is running.</p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['purchaseParties'] })}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Purchase Parties"
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
                    pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} parties` }}
                />
            </Spin>

            <Modal
                title={editingParty ? 'Edit Purchase Party' : 'Add New Purchase Party'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
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

                    <Form.Item
                        name="gst"
                        label="GST Number"
                        rules={validateGST()}
                    >
                        <Input placeholder="Enter GST number (15 characters)" maxLength={15} />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Phone Number"
                        rules={validatePhone()}
                    >
                        <Input placeholder="Enter phone number (10 digits)" maxLength={10} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Previous Balance Modal */}
            <Modal
                title={`Previous Balance - ${selectedPbParty?.name || ''}`}
                open={isPbModalOpen}
                onOk={handlePbOk}
                onCancel={() => setIsPbModalOpen(false)}
                confirmLoading={pbMutation.isPending}
                footer={[
                    <Button key="cancel" onClick={() => setIsPbModalOpen(false)}>
                        Cancel
                    </Button>,
                    pbData ? (
                        <Popconfirm
                            key="delete"
                            title="Delete Previous Balance"
                            description="Are you sure you want to delete this previous balance?"
                            onConfirm={handlePbDelete}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger loading={pbDeleteMutation.isPending}>
                                Delete Balance
                            </Button>
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

export default PurchaseParties;
