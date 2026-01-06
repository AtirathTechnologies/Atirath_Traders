import React, { useEffect, useState } from "react";
import { getAllUsers } from "../../firebase";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEye,
  FiX,
  FiDatabase,
  FiRefreshCw,
  FiGlobe,
  FiFlag,
  FiHome,
  FiNavigation,
  FiCamera,
  FiUsers,
  FiDownload
} from "react-icons/fi";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    active: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading users from Firebase...');
      const allUsers = await getAllUsers();
      console.log(`✅ Loaded ${allUsers.length} users:`, allUsers);

      setUsers(allUsers);
      calculateStats(allUsers);

    } catch (error) {
      console.error("❌ Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayUsers = usersData.filter(user => {
      if (!user.createdAt) return false;
      const userDate = new Date(user.createdAt);
      return userDate >= today;
    });

    const activeUsers = usersData.filter(user => {
      if (!user.lastLogin) return false;
      const lastLogin = new Date(user.lastLogin);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return lastLogin >= thirtyDaysAgo;
    });

    setStats({
      total: usersData.length,
      today: todayUsers.length,
      active: activeUsers.length
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatPhone = (phone, countryCode) => {
    if (!phone || phone === "N/A") return "Not Provided";
    const code = countryCode?.startsWith('+') ? countryCode : `+${countryCode || '91'}`;
    return `${code} ${phone}`;
  };

  const getUserStatus = (user) => {
    if (!user.lastLogin) return "inactive";
    const lastLogin = new Date(user.lastLogin);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastLogin >= thirtyDaysAgo ? "active" : "inactive";
  };

  const getCountryFlag = (country) => {
    const flags = {
      'India': '🇮🇳',
      'Oman': '🇴🇲',
      'United Kingdom': '🇬🇧',
      'USA': '🇺🇸',
      'UAE': '🇦🇪',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺'
    };
    return flags[country] || '🌍';
  };

  const exportUsersToCSV = () => {
    if (users.length === 0) {
      alert("No users to export!");
      return;
    }

    const csvContent = [
      ['User ID', 'Name', 'Email', 'Phone', 'Country Code', 'Country', 'State', 'City', 'Pincode', 'Status', 'Account Created', 'Last Login'],
      ...users.map(user => [
        user.userKey || user.uid || '',
        user.name || '',
        user.email || '',
        user.phone || '',
        user.countryCode || '',
        user.country || '',
        user.state || '',
        user.city || '',
        user.pincode || '',
        getUserStatus(user),
        formatDate(user.createdAt),
        formatDate(user.lastLogin)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Exported ${users.length} users to CSV file!`);
  };

  return (
    <div className="users-container">
      {/* Header Section */}
      <div className="users-header">
        <div className="header-content">
          <h1 className="users-title">
            <FiUsers className="title-icon" />
            Users Management
          </h1>
          <p className="users-subtitle">
            Manage and monitor all registered users in real-time
            <span className="user-count">{users.length} total users</span>
          </p>
        </div>
        <div className="header-stats">
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiUser />
            </div>
            <div>
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">Today</div>
            </div>
          </div>
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiDatabase />
            </div>
            <div>
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card total-stat">
          <div className="stat-icon">
            <FiDatabase />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
            <div className="stat-trend">All registered users</div>
          </div>
        </div>

        <div className="stat-card today-stat">
          <div className="stat-icon">
            <FiUser />
          </div>
          <div className="stat-content">
            <h3>{stats.today}</h3>
            <p>Today's Users</p>
            <div className="stat-trend">Registered today</div>
          </div>
        </div>

        <div className="stat-card active-stat">
          <div className="stat-icon">
            <FiUser />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active Users</p>
            <div className="stat-trend">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Toolbar with Export and Refresh */}
      <div className="users-toolbar">
        <div className="toolbar-left">
          <button
            className="export-btn"
            onClick={exportUsersToCSV}
            disabled={users.length === 0}
          >
            <FiDownload /> Export CSV
          </button>
        </div>
        <div className="toolbar-right">
          <button
            className="refresh-btn"
            onClick={loadUsers}
          >
            <FiRefreshCw /> Refresh Users
          </button>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading users from Firebase...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <FiUser size={48} />
            <h3>No users found</h3>
            <p>No users have registered yet</p>
          </div>
        ) : (
          <>
            <div className="table-info">
              <span>Showing all {users.length} users</span>
              <span className="export-hint">
                <FiDownload size={12} /> Click Export CSV to download all data
              </span>
            </div>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Details</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userKey} className="user-row">
                    <td className="user-id-cell">
                      <div className="user-key-display">
                        <div className="user-key-badge">
                          <span className="key-prefix">user-</span>
                          <span className="key-number">{user.userNumber || "?"}</span>
                        </div>
                        <div className="user-id">
                          <small>UID: {user.uid?.substring(0, 8) || user.userKey?.substring(0, 8) || "N/A"}...</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-name">
                          <FiUser size={12} />
                          {user.name || "Unnamed User"}
                        </div>
                        <div className="user-email">
                          <FiMail size={12} />
                          <span className="email-text">
                            {user.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="phone-info">
                          <FiPhone size={12} />
                          <span className="phone-text">
                            {formatPhone(user.phone, user.countryCode)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="location-info">
                        <FiMapPin size={12} />
                        <div className="location-summary">
                          {user.city || user.country || "Not set"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`status-badge-user ${getUserStatus(user)}`}>
                        <span className="status-dot"></span>
                        {getUserStatus(user) === "active" ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <FiCalendar size={12} />
                        <div className="date-summary">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => setSelectedUser(user)}
                          title="View Details"
                        >
                          <FiEye /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">User Details</h2>
              <button
                className="modal-close-blue"
                onClick={() => setSelectedUser(null)}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="user-id-section">
              <div className="user-id-label">UID:</div>
              <div className="user-id-value">{selectedUser.uid || selectedUser.userKey || "N/A"}</div>
            </div>

            <div className="modal-body">
              <div className="user-details-grid">
                <div className="details-section">
                  <div className="section-header">
                    <FiUser className="section-icon" />
                    <h3 className="section-title">Personal Information</h3>
                  </div>
                  <div className="section-content">
                    <div className="detail-row">
                      <span className="detail-label">Full Name:</span>
                      <span className="detail-value">{selectedUser.name || "Not provided"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedUser.email || "Not provided"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{formatPhone(selectedUser.phone, selectedUser.countryCode)}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <div className="section-header">
                    <FiMapPin className="section-icon" />
                    <h3 className="section-title">Location Details</h3>
                  </div>
                  <div className="section-content">
                    <div className="detail-row">
                      <span className="detail-label">Country:</span>
                      <span className="detail-value">
                        <span className="country-flag">{getCountryFlag(selectedUser.country)}</span>
                        {selectedUser.country || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">State:</span>
                      <span className="detail-value">{selectedUser.state || "Not provided"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">City:</span>
                      <span className="detail-value">{selectedUser.city || "Not provided"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Pincode:</span>
                      <span className="detail-value">{selectedUser.pincode || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <div className="section-header">
                    <FiDatabase className="section-icon" />
                    <h3 className="section-title">Account Information</h3>
                  </div>
                  <div className="section-content">
                    <div className="detail-row">
                      <span className="detail-label">Account Created:</span>
                      <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Login:</span>
                      <span className="detail-value">{formatDate(selectedUser.lastLogin) || "Never"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">{formatDate(selectedUser.updatedAt) || "Never"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Profile Photo:</span>
                      <span className="detail-value">
                        {selectedUser.photoURL ?
                          <span className="photo-status uploaded">✓ Uploaded</span> :
                          <span className="photo-status not-uploaded">No photo</span>
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary-blue"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}