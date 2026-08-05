import { NavLink, Outlet } from 'react-router-dom';
import Flash from '../components/Flash';

export default function WarehouseLayout() {
  return (
    <div className="page" style={{ paddingTop: 36 }}>
      <div className="filters" style={{ marginBottom: 28 }}>
        <NavLink
          to="/warehouse/orders"
          className={({ isActive }) => `filter-btn${isActive ? ' active' : ''}`}
        >
          הזמנות לליקוט ומשלוח
        </NavLink>
        <NavLink
          to="/warehouse/returns"
          className={({ isActive }) => `filter-btn${isActive ? ' active' : ''}`}
        >
          קליטת החזרות
        </NavLink>
        <NavLink
          to="/warehouse/receive"
          className={({ isActive }) => `filter-btn${isActive ? ' active' : ''}`}
        >
          קליטת מלאי
        </NavLink>
      </div>
      <Flash />
      <Outlet />
    </div>
  );
}
