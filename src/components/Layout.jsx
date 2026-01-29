import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Truck, Settings, LogOut, Menu, X, Zap } from 'lucide-react';

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FileText, label: 'Purchase Bills', path: '/invoices' },
        { icon: Truck, label: 'Suppliers', path: '/suppliers' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: 'var(--color-bg-app)' }}>
            {/* Top Navigation Bar */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                minHeight: '70px',
                background: 'white',
                borderBottom: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                        <Zap size={22} color="white" />
                    </div>
                    <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', fontFamily: 'Outfit, sans-serif' }}>
                            Payout Fusion
                        </span>
                        <span style={{
                            fontSize: '0.625rem',
                            marginLeft: '0.5rem',
                            padding: '0.125rem 0.5rem',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            color: '#16a34a',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Beta
                        </span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all 0.2s',
                                background: isActive ? 'var(--color-bg-surface-hover)' : 'transparent',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                textDecoration: 'none'
                            })}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Desktop User Actions */}
                <div className="user-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.2s',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                    <div style={{
                        height: '40px',
                        width: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#4f46e5',
                        border: '2px solid white',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        HB
                    </div>
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                    className="nav-mobile"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="nav-mobile" style={{
                    background: 'white',
                    borderBottom: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'absolute',
                    top: '70px',
                    left: 0,
                    right: 0,
                    zIndex: 50
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.25rem' }}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    background: isActive ? 'var(--color-bg-surface-hover)' : 'transparent',
                                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    textDecoration: 'none'
                                })}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }}></div>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem 1rem',
                            color: 'var(--color-text-muted)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '1rem',
                            fontWeight: 500,
                            textAlign: 'left',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%'
                        }}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
