import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './state/AppContext';
import SiteLayout from './layouts/SiteLayout';
import AccountLayout from './layouts/AccountLayout';
import AdminLayout from './layouts/AdminLayout';
import { BlockStaffFromCustomer } from './components/RequireRole';
import WarehouseLayout from './layouts/WarehouseLayout';
import HomePage from './pages/site/HomePage';
import HowPage from './pages/site/HowPage';
import PlansPage from './pages/site/PlansPage';
import CatalogPage from './pages/site/CatalogPage';
import ProductPage from './pages/site/ProductPage';
import LoginPage from './pages/site/LoginPage';
import SignupPage from './pages/site/SignupPage';
import InfoPage from './pages/site/InfoPage';
import DashboardPage from './pages/account/DashboardPage';
import AccountCatalogPage from './pages/account/AccountCatalogPage';
import CartPage from './pages/account/CartPage';
import ExchangePage from './pages/account/ExchangePage';
import ReturnPouchPage from './pages/account/ReturnPouchPage';
import HistoryPage from './pages/account/HistoryPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import InventoryPage from './pages/admin/InventoryPage';
import WarehouseOrdersPage from './pages/warehouse/WarehouseOrdersPage';
import ReturnsPage from './pages/warehouse/ReturnsPage';

const SHOW_WAREHOUSE = import.meta.env.VITE_ENABLE_STAFF === 'true';

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
          <Route path="info" element={<InfoPage />} />
        </Route>

        <Route path="/account" element={<BlockStaffFromCustomer><AccountLayout /></BlockStaffFromCustomer>}>
          <Route index element={<Navigate to="shop" replace />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="shop" element={<AccountCatalogPage />} />
          <Route path="catalog" element={<Navigate to="/account/shop" replace />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="me" element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/account/me" replace />} />
          <Route path="exchange" element={<ExchangePage />} />
          <Route path="returns" element={<ReturnPouchPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<ProductsAdminPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="receive" element={<Navigate to="/admin/inventory" replace />} />
        </Route>

        {SHOW_WAREHOUSE && (
          <Route path="/warehouse" element={<WarehouseLayout />}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<WarehouseOrdersPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="receive" element={<Navigate to="/admin/inventory" replace />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
