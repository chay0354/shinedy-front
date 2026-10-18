import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ADMIN_NAV } from '../lib/staff';

function pathActive(pathname, path, end) {
  if (end) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function groupActive(pathname, children) {
  return children.some((c) => pathActive(pathname, c.path, false));
}

export default function AdminNav({ items, mobileOpen, onClose }) {
  const location = useLocation();
  const [openBiz, setOpenBiz] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    setOpenBiz(false);
  }, [location.pathname]);

  useEffect(() => {
    function onDoc(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpenBiz(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <nav className={`admin-tabs-wrap${mobileOpen ? ' is-open' : ''}`} aria-label="ניווט ניהול">
      {mobileOpen && (
        <button type="button" className="admin-nav-backdrop" aria-label="סגירת תפריט" onClick={onClose} />
      )}
      <div className="admin-tabs">
        {items.map((item) => {
          if (item.children) {
            const active = groupActive(location.pathname, item.children);
            return (
              <div key={item.label} className={`admin-nav-drop${active ? ' on' : ''}`} ref={dropRef}>
                <button
                  type="button"
                  className={`admin-nav-drop-btn${active ? ' on' : ''}`}
                  aria-expanded={openBiz}
                  onClick={() => setOpenBiz((v) => !v)}
                >
                  {item.label}
                  <span className="admin-nav-caret" aria-hidden>▾</span>
                </button>
                {openBiz && (
                  <div className="admin-nav-drop-menu" role="menu">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.path}
                        to={c.path}
                        role="menuitem"
                        className={({ isActive }) => (isActive ? 'on' : '')}
                        onClick={() => { setOpenBiz(false); onClose?.(); }}
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => (isActive ? 'on' : '')}
              onClick={() => onClose?.()}
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function navItemsForStaff(me, isManager, staffCanAccess) {
  const flat = [];
  for (const item of ADMIN_NAV) {
    if (item.children) {
      const kids = item.children.filter((c) => !me || isManager || staffCanAccess(me, c.path));
      if (kids.length) flat.push({ ...item, children: kids });
    } else if (!me || isManager || staffCanAccess(me, item.path)) {
      flat.push(item);
    }
  }
  return flat;
}
