import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin, Phone, Building2 } from 'lucide-react';
import { partyService } from '../services/partyService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const INDIAN_STATES = [
    'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
    'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JHARKHAND', 'KARNATAKA',
    'KERALA', 'MADHYA PRADESH', 'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM',
    'NAGALAND', 'ODISHA', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU',
    'TELANGANA', 'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL',
    'ANDAMAN AND NICOBAR ISLANDS', 'CHANDIGARH', 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
    'DELHI', 'JAMMU AND KASHMIR', 'LADAKH', 'LAKSHADWEEP', 'PUDUCHERRY'
];

const ADDRESS_TYPES = ['BILLING', 'OFFICE', 'SHIPPING'];

const emptyAddress = {
    building: '',
    street: '',
    area: '',
    city: '',
    pincode: '',
    state: 'MAHARASHTRA',
    addressType: 'BILLING',
};

const emptyParty = {
    name: '',
    gst: '',
    number: '',
    addresses: [{ ...emptyAddress }],
};

export default function Customers() {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...emptyParty });
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, party: null });

    useEffect(() => {
        loadParties();
    }, []);

    const loadParties = async () => {
        try {
            setLoading(true);
            const data = await partyService.getAll();
            setParties(data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setFormData({ ...emptyParty, addresses: [{ ...emptyAddress }] });
        setIsEditing(false);
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (party) => {
        setFormData({
            id: party.id,
            name: party.name,
            gst: party.gst,
            number: party.number,
            addresses: party.addresses?.map(a => ({ ...a })) || [{ ...emptyAddress }],
        });
        setIsEditing(true);
        setFormError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ ...emptyParty });
        setFormError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (index, field, value) => {
        setFormData(prev => {
            const newAddresses = [...prev.addresses];
            newAddresses[index] = { ...newAddresses[index], [field]: value };
            return { ...prev, addresses: newAddresses };
        });
    };

    const addAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [...prev.addresses, { ...emptyAddress }],
        }));
    };

    const removeAddress = (index) => {
        if (formData.addresses.length === 1) return;
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSaving(true);

        try {
            const payload = {
                name: formData.name,
                gst: formData.gst,
                number: formData.number,
                addresses: formData.addresses,
            };

            if (isEditing) {
                await partyService.update(formData.id, payload);
            } else {
                await partyService.create(payload);
            }

            closeModal();
            loadParties();
        } catch (err) {
            setFormError(err.message || 'Failed to save party');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (party) => {
        setDeleteConfirm({ open: true, party });
    };

    const handleDelete = async () => {
        try {
            await partyService.delete(deleteConfirm.party.id);
            setDeleteConfirm({ open: false, party: null });
            loadParties();
        } catch (err) {
            setError(err.message);
            setDeleteConfirm({ open: false, party: null });
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">Manage your parties and suppliers</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} />
                    Add Party
                </button>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: '1rem', background: '#fef2f2', borderColor: '#fecaca' }}>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading parties...</div>
            ) : parties.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Building2 size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No parties found. Add your first party to get started.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {parties.map((party) => (
                        <div key={party.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Card Header */}
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{party.name}</h3>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-surface-hover)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>{party.gst}</code>
                                    </div>
                                    <div className="table-actions">
                                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(party)} title="Edit">
                                            <Pencil size={14} />
                                        </button>
                                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => confirmDelete(party)} title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    <Phone size={14} />
                                    <span>{party.number}</span>
                                </div>
                            </div>
                            {/* Card Footer - Primary Address */}
                            {party.addresses?.[0] && (
                                <div style={{ padding: '1rem 1.25rem', background: 'var(--color-bg-surface-hover)', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                                        <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span>
                                            {party.addresses[0].building}, {party.addresses[0].street}, {party.addresses[0].area}, {party.addresses[0].city} - {party.addresses[0].pincode}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditing ? 'Edit Party' : 'Add New Party'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    {formError && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.875rem' }}>
                            {formError}
                        </div>
                    )}

                    {/* Party Details Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Party Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Party Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter party name"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">GST Number *</label>
                                <input
                                    type="text"
                                    name="gst"
                                    className="form-input"
                                    value={formData.gst}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 27AQHPB0072E1ZA"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="number"
                                    className="form-input"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 9967627909"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Addresses Section */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Addresses ({formData.addresses.length})
                            </h4>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addAddress}>
                                <Plus size={14} /> Add Address
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.addresses.map((addr, idx) => (
                                <div key={idx} style={{
                                    background: 'var(--color-bg-surface-hover)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1.25rem',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    {/* Address Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {idx + 1}
                                            </div>
                                            <select
                                                className="form-input"
                                                value={addr.addressType}
                                                onChange={(e) => handleAddressChange(idx, 'addressType', e.target.value)}
                                                style={{ width: 'auto', padding: '0.375rem 0.75rem', fontWeight: 500, marginBottom: 0 }}
                                                required
                                            >
                                                {ADDRESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        {formData.addresses.length > 1 && (
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeAddress(idx)}>
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        )}
                                    </div>

                                    {/* Address Fields - Responsive Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Building *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={addr.building}
                                                onChange={(e) => handleAddressChange(idx, 'building', e.target.value)}
                                                placeholder="Building/Flat"
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Street *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={addr.street}
                                                onChange={(e) => handleAddressChange(idx, 'street', e.target.value)}
                                                placeholder="Street name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Area *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={addr.area}
                                                onChange={(e) => handleAddressChange(idx, 'area', e.target.value)}
                                                placeholder="Area/Locality"
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">City *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={addr.city}
                                                onChange={(e) => handleAddressChange(idx, 'city', e.target.value)}
                                                placeholder="City"
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Pincode *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={addr.pincode}
                                                onChange={(e) => handleAddressChange(idx, 'pincode', e.target.value)}
                                                placeholder="6-digit"
                                                pattern="[0-9]{6}"
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">State *</label>
                                            <select
                                                className="form-input"
                                                value={addr.state}
                                                onChange={(e) => handleAddressChange(idx, 'state', e.target.value)}
                                                required
                                            >
                                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (isEditing ? 'Update Party' : 'Create Party')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, party: null })}
                onConfirm={handleDelete}
                title="Delete Party"
                message={`Are you sure you want to delete "${deleteConfirm.party?.name}"? This action cannot be undone.`}
            />
        </div>
    );
}
