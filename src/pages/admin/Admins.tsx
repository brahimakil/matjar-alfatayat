import { useState, useEffect } from 'react';
import { adminsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Admins.css';

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

const Admins = () => {
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await adminsAPI.getAll();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (currentAdmin?.email === email) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!confirm(`Are you sure you want to delete admin: ${email}?`)) return;
    
    try {
      await adminsAPI.delete(id);
      fetchAdmins();
    } catch (error) {
      alert('Failed to delete admin');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admins-page">
      <div className="page-header">
        <h1>Admin Management</h1>
        <p className="subtitle">Manage administrator accounts</p>
      </div>

      <div className="admins-table-container">
        <table className="admins-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>
                  <div className="admin-name">
                    <div className="avatar">
                      {(admin.name || admin.email || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span>{admin.name || 'N/A'}</span>
                    {currentAdmin?.email === admin.email && (
                      <span className="current-badge">You</span>
                    )}
                  </div>
                </td>
                <td>{admin.email}</td>
                <td>{formatDate(admin.createdAt)}</td>
                <td>{formatDate(admin.lastLogin || '')}</td>
                <td>
                  <button
                    onClick={() => handleDelete(admin.id, admin.email)}
                    className="btn-delete"
                    disabled={currentAdmin?.email === admin.email}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box">
        <p>💡 <strong>Note:</strong> New admins can register at the <a href="/admin/register">registration page</a>. You cannot delete your own account.</p>
      </div>
    </div>
  );
};

export default Admins;

