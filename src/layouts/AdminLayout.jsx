import { NavLink, Outlet } from 'react-router-dom';
import Flash from '../components/Flash';

export default function AdminLayout() {
  return (
    <div className="layout-split">
      <aside className="sidebar" style={{ width: 200 }}>
        <div className="display" style={{ padding: '0 24px 20px', fontSize: 18 }}>
          ניהול
        </div>
        <NavLink to="/admin/customers">לקוחות</NavLink>
        <NavLink to="/admin/plans">מסלולים</NavLink>
        <NavLink to="/admin/products">מוצרים</NavLink>
        <NavLink to="/admin/inventory">מלאי וסטטוסים</NavLink>
        <NavLink to="/admin/orders">הזמנות והחלפות</NavLink>
        <NavLink to="/admin/more">משלוחים · חיובים · משתמשים</NavLink>
      </aside>
      <div className="main-pane">
        <Flash />
        <Outlet />
      </div>
    </div>
  );
}
