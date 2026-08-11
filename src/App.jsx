import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './state/AppContext';
import SiteLayout from './layouts/SiteLayout';
import AccountLayout from './layouts/AccountLayout';
import AdminLayout from './layouts/AdminLayout';
import { BlockStaffFromCustomer } from './components/RequireRole';
import HomePage from './pages/site/HomePage';
import HowPage from './pages/site/HowPage';
import PlansPage from './pages/site/PlansPage';
import CatalogPage from './pages/site/CatalogPage';
import ProductPage from './pages/site/ProductPage';
import LoginPage from './pages/site/LoginPage';
import SignupPage from './pages/site/SignupPage';
import FaqPage from './pages/site/FaqPage';
import AboutPage from './pages/site/AboutPage';
import ContactPage from './pages/site/ContactPage';
import DashboardPage from './pages/account/DashboardPage';
import CartPage from './pages/account/CartPage';
import ExchangePage from './pages/account/ExchangePage';
import ReturnPouchPage from './pages/account/ReturnPouchPage';
import HistoryPage from './pages/account/HistoryPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminWarehousePage from './pages/admin/AdminWarehousePage';
import AdminRentalsPage from './pages/admin/AdminRentalsPage';
import InventoryPage from './pages/admin/InventoryPage';
import CustomersPage from './pages/admin/CustomersPage';
import PlansAdminPage from './pages/admin/PlansAdminPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import ExpensesAdminPage from './pages/admin/ExpensesAdminPage';

export default function App() {
  const { loading, error, setError } = useApp();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading">טוען…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {error && (
        <div className="error-banner" onClick={() => setError(null)} style={{ cursor: 'pointer' }}>
          {error}
        </div>
      )}
      <Routes>
        <Route path="/" element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="how" element={<HowPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="catalog/:id" element={<ProductPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="info" element={<Navigate to="/faq" replace />} />
          <Route path="box" element={<CartPage />} />
          <Route path="exchange" element={<ExchangePage />} />
          <Route
            path="account"
            element={
              <BlockStaffFromCustomer>
                <AccountLayout />
              </BlockStaffFromCustomer>
            }
          >
            <Route index element={<Navigate to="me" replace />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="me" element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/account/me" replace />} />
            <Route path="cart" element={<Navigate to="/box" replace />} />
            <Route path="shop" element={<Navigate to="/catalog" replace />} />
            <Route path="catalog" element={<Navigate to="/catalog" replace />} />
            <Route path="exchange" element={<Navigate to="/exchange" replace />} />
            <Route path="returns" element={<ReturnPouchPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="warehouse" element={<AdminWarehousePage />} />
          <Route path="rentals" element={<AdminRentalsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="subscriptions" element={<PlansAdminPage />} />
          <Route path="expenses" element={<ExpensesAdminPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="returns" element={<Navigate to="/admin/warehouse" replace />} />
          <Route path="products" element={<Navigate to="/admin/inventory" replace />} />
          <Route path="receive" element={<Navigate to="/admin/inventory" replace />} />
        </Route>

        <Route path="/warehouse/*" element={<Navigate to="/admin/warehouse" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
