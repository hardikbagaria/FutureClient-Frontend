import React, { useState, useEffect } from 'react';
import { Users, FileText, IndianRupee, TrendingUp } from 'lucide-react';
import { partyService } from '../services/partyService';
import { billService } from '../services/billService';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalParties: 0,
        totalBills: 0,
        totalRevenue: 0,
        avgBillValue: 0,
    });
    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [parties, bills] = await Promise.all([
                partyService.getAll(),
                billService.getAll(),
            ]);

            const totalRevenue = bills.reduce((sum, b) => sum + (b.total || 0), 0);
            const avgBillValue = bills.length > 0 ? totalRevenue / bills.length : 0;

            setStats({
                totalParties: parties.length,
                totalBills: bills.length,
                totalRevenue,
                avgBillValue,
            });

            // Get 5 most recent bills
            setRecentBills(bills.slice(0, 5));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const statCards = [
        {
            label: 'Total Customers',
            value: stats.totalParties,
            icon: Users,
            color: '#3b82f6',
            bg: '#eff6ff',
        },
        {
            label: 'Total Invoices',
            value: stats.totalBills,
            icon: FileText,
            color: '#8b5cf6',
            bg: '#f5f3ff',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: IndianRupee,
            color: '#10b981',
            bg: '#ecfdf5',
        },
        {
            label: 'Avg. Bill Value',
            value: formatCurrency(stats.avgBillValue),
            icon: TrendingUp,
            color: '#f59e0b',
            bg: '#fffbeb',
        },
    ];

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here's your business overview.</p>
                </div>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: '1rem', background: '#fef2f2', borderColor: '#fecaca' }}>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {statCards.map((card, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <card.icon size={24} color={card.color} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{card.label}</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Bills */}
            <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Invoices</h2>
                {recentBills.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <p>No invoices yet. Create your first invoice to see it here!</p>
                        </div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Bill #</th>
                                    <th>Date</th>
                                    <th>Party</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBills.map((bill) => (
                                    <tr key={bill.id}>
                                        <td style={{ fontWeight: 600 }}>#{bill.id}</td>
                                        <td>{new Date(bill.billDate).toLocaleDateString('en-IN')}</td>
                                        <td>{bill.party?.name || 'N/A'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                            {formatCurrency(bill.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
