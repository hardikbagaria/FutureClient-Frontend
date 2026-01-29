import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Suppliers from './pages/Suppliers';

const Settings = () => (
  <div className="animate-fade-in">
    <div className="page-header">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Application settings (coming soon)</p>
      </div>
    </div>
    <div className="card">
      <p style={{ color: 'var(--color-text-muted)' }}>Settings page is under construction.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
