import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import ItemsList from './pages/Items/ItemsList';
import PurchaseParties from './pages/Purchase/Parties/PurchaseParties';
import PurchaseBills from './pages/Purchase/Bills/PurchaseBills';
import PurchasePayments from './pages/Purchase/Payments/PurchasePayments';
import SalesParties from './pages/Sales/Parties/SalesParties';
import SalesBills from './pages/Sales/Bills/SalesBills';
import SalesPayments from './pages/Sales/Payments/SalesPayments';
import PurchaseLedger from './pages/Ledger/PurchaseLedger';
import SalesLedger from './pages/Ledger/SalesLedger';
import GSTReports from './pages/Ledger/GSTReports';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
            fontSize: 14,
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="items" element={<ItemsList />} />
              <Route path="purchase">
                <Route path="parties" element={<PurchaseParties />} />
                <Route path="bills" element={<PurchaseBills />} />
                <Route path="payments" element={<PurchasePayments />} />
              </Route>
              <Route path="sales">
                <Route path="parties" element={<SalesParties />} />
                <Route path="bills" element={<SalesBills />} />
                <Route path="payments" element={<SalesPayments />} />
              </Route>
              <Route path="ledger">
                <Route path="purchase" element={<PurchaseLedger />} />
                <Route path="sales" element={<SalesLedger />} />
                <Route path="gst" element={<GSTReports />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
