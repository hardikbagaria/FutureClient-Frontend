import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, FileText, Receipt, Package } from 'lucide-react';
import { billService } from '../services/billService';
import { partyService } from '../services/partyService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyItem = { description: '', quantity: 1, rate: 0 };

const emptyBill = {
    billNumber: '',
    partyId: '',
    billDate: new Date().toISOString().split('T')[0],
    items: [{ ...emptyItem }],
};

export default function Invoices() {
    const [bills, setBills] = useState([]);
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...emptyBill });
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    // Tab for modal
    const [activeTab, setActiveTab] = useState('details');

    // Live calculation preview
    const [preview, setPreview] = useState(null);
    const [calculating, setCalculating] = useState(false);

    // View modal
    const [viewBill, setViewBill] = useState(null);

    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, bill: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [billsData, partiesData] = await Promise.all([
                billService.getAll(),
                partyService.getAll(),
            ]);
            setBills(billsData || []);
            setParties(partiesData || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Debounced calculation
    const calculatePreview = useCallback(async (items) => {
        const validItems = items.filter(i => i.description && i.quantity > 0 && i.rate > 0);
        if (validItems.length === 0) {
            setPreview(null);
            return;
        }

        try {
            setCalculating(true);
            const result = await billService.calculate(validItems);
            setPreview(result);
        } catch (err) {
            console.error('Calculation error:', err);
        } finally {
            setCalculating(false);
        }
    }, []);

    // Trigger calculation when items change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isModalOpen && activeTab === 'items') {
                calculatePreview(formData.items);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.items, isModalOpen, activeTab, calculatePreview]);

    const openAddModal = () => {
        setFormData({ ...emptyBill, items: [{ ...emptyItem }] });
        setIsEditing(false);
        setFormError(null);
        setPreview(null);
        setActiveTab('details');
        setIsModalOpen(true);
    };

    const openEditModal = (bill) => {
        setFormData({
            id: bill.id,
            billNumber: bill.billNumber || '',
            partyId: bill.party?.id || '',
            billDate: bill.billDate,
            items: bill.items.map(i => ({
                description: i.description,
                quantity: i.quantity,
                rate: i.rate,
            })),
        });
        setIsEditing(true);
        setFormError(null);
        setPreview(null);
        setActiveTab('details');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ ...emptyBill });
        setPreview(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = {
                ...newItems[index],
                [field]: field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value,
            };
            return { ...prev, items: newItems };
        });
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...emptyItem }],
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSaving(true);

        try {
            const payload = {
                billNumber: formData.billNumber,
                partyId: parseInt(formData.partyId),
                billDate: formData.billDate,
                items: formData.items.filter(i => i.description && i.quantity > 0),
            };

            if (isEditing) {
                await billService.update(formData.id, payload);
            } else {
                await billService.create(payload);
            }

            closeModal();
            loadData();
        } catch (err) {
            setFormError(err.message || 'Failed to save purchase bill');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (bill) => {
        setDeleteConfirm({ open: true, bill });
    };

    const handleDelete = async () => {
        try {
            await billService.delete(deleteConfirm.bill.id);
            setDeleteConfirm({ open: false, bill: null });
            loadData();
        } catch (err) {
            setError(err.message);
            setDeleteConfirm({ open: false, bill: null });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount || 0);
    };

    const tabs = [
        { id: 'details', label: 'Bill Details', icon: Receipt },
        { id: 'items', label: 'Line Items', icon: Package },
    ];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Purchase Bills</h1>
                    <p className="page-subtitle">Manage bills from your suppliers</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} />
                    New Purchase Bill
                </button>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: '1rem', background: '#fef2f2', borderColor: '#fecaca' }}>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading purchase bills...</div>
            ) : bills.length === 0 ? (
                <div className="table-container">
                    <div className="empty-state">
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No purchase bills found. Create your first bill to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Bill #</th>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => (
                                <tr key={bill.id}>
                                    <td style={{ fontWeight: 600 }}>{bill.billNumber || `#${bill.id}`}</td>
                                    <td>{new Date(bill.billDate).toLocaleDateString('en-IN')}</td>
                                    <td>{bill.party?.name || 'N/A'}</td>
                                    <td>{bill.items?.length || 0} items</td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                        {formatCurrency(bill.total)}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setViewBill(bill)}>
                                                <Eye size={14} />
                                            </button>
                                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(bill)}>
                                                <Pencil size={14} />
                                            </button>
                                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => confirmDelete(bill)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal with Vertical Tabs */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditing ? 'Edit Purchase Bill' : 'New Purchase Bill'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    {formError && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.875rem' }}>
                            {formError}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {/* Vertical Tab Navigation */}
                        <div style={{ width: '140px', flexShrink: 0 }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        marginBottom: '0.25rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.875rem',
                                        fontWeight: activeTab === tab.id ? 600 : 400,
                                        background: activeTab === tab.id ? 'var(--color-bg-surface-hover)' : 'transparent',
                                        color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div>
                                    <div className="form-group">
                                        <label className="form-label">Bill Number *</label>
                                        <input
                                            type="text"
                                            name="billNumber"
                                            className="form-input"
                                            value={formData.billNumber}
                                            onChange={handleInputChange}
                                            placeholder="e.g. PB-001 or supplier invoice number"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Supplier *</label>
                                        <select
                                            name="partyId"
                                            className="form-input"
                                            value={formData.partyId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select a supplier</option>
                                            {parties.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bill Date *</label>
                                        <input
                                            type="date"
                                            name="billDate"
                                            className="form-input"
                                            value={formData.billDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Items Tab */}
                            {activeTab === 'items' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            {formData.items.length} item(s)
                                        </span>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                                            <Plus size={14} /> Add Item
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                                        {formData.items.map((item, idx) => (
                                            <div key={idx} style={{
                                                background: 'var(--color-bg-surface-hover)',
                                                borderRadius: 'var(--radius-sm)',
                                                padding: '0.75rem',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Description</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                            placeholder="Item name"
                                                            style={{ marginBottom: 0 }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Qty</label>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                            min="1"
                                                            style={{ marginBottom: 0 }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Rate</label>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={item.rate}
                                                            onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                            style={{ marginBottom: 0 }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm btn-icon"
                                                        onClick={() => removeItem(idx)}
                                                        disabled={formData.items.length === 1}
                                                        style={{ opacity: formData.items.length === 1 ? 0.5 : 1 }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500 }}>
                                                    = {formatCurrency(item.quantity * item.rate)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calculation Preview */}
                                    {preview && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                                                <span style={{ fontWeight: 500 }}>{formatCurrency(preview.amount)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: 'var(--color-text-muted)' }}>GST (18%)</span>
                                                <span style={{ fontWeight: 500 }}>{formatCurrency(preview.gst)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #bae6fd' }}>
                                                <span style={{ fontWeight: 600 }}>Total</span>
                                                <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary)' }}>{formatCurrency(preview.total)}</span>
                                            </div>
                                            {calculating && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Updating...</span>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (isEditing ? 'Update Bill' : 'Create Bill')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={!!viewBill}
                onClose={() => setViewBill(null)}
                title={`Purchase Bill: ${viewBill?.billNumber || '#' + viewBill?.id}`}
                size="md"
            >
                {viewBill && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Supplier</div>
                                <div style={{ fontWeight: 600 }}>{viewBill.party?.name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Date</div>
                                <div style={{ fontWeight: 600 }}>{new Date(viewBill.billDate).toLocaleDateString('en-IN')}</div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Items</div>
                            {viewBill.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < viewBill.items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{item.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.quantity} × {formatCurrency(item.rate)}</div>
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{formatCurrency(item.amount || item.quantity * item.rate)}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Subtotal: {formatCurrency(viewBill.amount)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                GST: {formatCurrency(viewBill.gst)}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                Total: {formatCurrency(viewBill.total)}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, bill: null })}
                onConfirm={handleDelete}
                title="Delete Purchase Bill"
                message={`Are you sure you want to delete Bill ${deleteConfirm.bill?.billNumber || '#' + deleteConfirm.bill?.id}? This action cannot be undone.`}
            />
        </div>
    );
}
