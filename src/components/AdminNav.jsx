import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuBox, setMenuBox] = useState(null);
  const dropRef = useRef(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setOpenBiz(false);
  }, [location.pathname]);

  useEffect(() => {
    function onDoc(e) {
      const target = e.target;
      if (dropRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpenBiz(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // The tab bar scrolls horizontally, which clips anything that drops below it,
  // so the menu is rendered on the body and positioned under its button.
  useEffect(() => {
    if (!openBiz || mobileOpen) return undefined;
    const place = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuBox({
        top: rect.bottom,
        insetInlineStart: document.documentElement.clientWidth - rect.right,
        insetInlineEnd: 'auto',
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [openBiz, mobileOpen]);

  return (
    <nav className={`admin-tabs-wrap${mobileOpen ? ' is-open' : ''}`} aria-label="ניווט ניהול">
      {mobileOpen && (
        <button type="button" className="admin-nav-backdrop" aria-label="סגירת תפריט" onClick={onClose} />
      )}
      <div className="admin-tabs">
        {items.map((item) => {
          if (item.children) {
            const active = groupActive(location.pathname, item.children);
            const menu = (
              <div
                ref={menuRef}
                className="admin-nav-drop-menu"
                role="menu"
                style={menuBox && !mobileOpen ? { position: 'fixed', ...menuBox, zIndex: 90 } : undefined}
              >
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
            );
            return (
              <div key={item.label} className={`admin-nav-drop${active ? ' on' : ''}`} ref={dropRef}>
                <button
                  ref={btnRef}
                  type="button"
                  className={`admin-nav-drop-btn${active ? ' on' : ''}`}
                  aria-expanded={openBiz}
                  aria-haspopup="menu"
                  onClick={() => setOpenBiz((v) => !v)}
                >
                  {item.label}
                  <span className="admin-nav-caret" aria-hidden>▾</span>
                </button>
                {openBiz && (mobileOpen ? menu : menuBox && createPortal(menu, document.body))}
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
