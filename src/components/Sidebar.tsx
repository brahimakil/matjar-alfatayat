import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { logout, admin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: '📦', label: 'Products', path: '/admin/products' },
    { icon: '📁', label: 'Categories', path: '/admin/categories' },
    { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
    { icon: '👥', label: 'Admins', path: '/admin/admins' },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>Matjar Alfatayat</h1>
          <p>Admin Panel</p>
        </div>

        <div className="admin-info">
          <div className="admin-profile">
            <div className="admin-avatar">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-details">
              <div className="name">{admin?.name}</div>
              <div className="email">{admin?.email}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={isActive ? 'active' : ''}
                  >
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <span style={{ fontSize: '20px' }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
