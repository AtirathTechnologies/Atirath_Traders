import React, { useEffect, useState } from "react";
import { getAllUsers, getAllVendors, getAllAdmins, addAdmin, removeAdmin, getUserProfile, logHistoryAction } from "../../firebase";
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
  FiDownload,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiShield,
  FiUserPlus,
  FiUserMinus,
  FiStar
} from "react-icons/fi";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    active: 0,
    vendors: 0,
    activeVendors: 0,
    admins: 0
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'users', 'vendors', 'admins'
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState({ name: 'Admin', email: 'admin@system.com' }); // You should get this from auth context

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading users, vendors, and admins from separate collections...');
      
      // Load all collections
      const [usersList, vendorsList, adminsList] = await Promise.all([
        getAllUsers(),
        getAllVendors(),
        getAllAdmins()
      ]);
      
      console.log('📊 Raw Users Data:', usersList.length);
      console.log('📊 Raw Vendors Data:', vendorsList.length);
      console.log('📊 Raw Admins Data:', adminsList.length);
      
      // Process users
      const processedUsers = usersList.map(user => ({
        ...user,
        userType: 'user',
        accountDisplay: '👤 User'
      }));
      
      // Process vendors
      const processedVendors = vendorsList.map(vendor => ({
        ...vendor,
        userType: 'vendor',
        accountDisplay: vendor.vendorStatus === 'approved' || vendor.vendorApproved ? '🏢 Active Vendor' : '🏢 Pending Vendor',
        vendorStatus: vendor.vendorStatus || (vendor.vendorApproved ? 'approved' : 'pending')
      }));
      
      // Process admins - but we need to know their original type (user or vendor)
      const processedAdmins = adminsList.map(admin => ({
        ...admin,
        name: admin.name || 'Admin',
        email: admin.email || '',
        userType: 'admin',
        originalUserType: admin.originalUserType || 'user', // Track if they were user or vendor
        accountDisplay: '👑 Admin',
        role: admin.role || 'admin',
        uid: admin.uid || admin.adminKey
      }));
      
      const allAccounts = [...processedUsers, ...processedVendors];
      
      setUsers(allAccounts);
      setAdmins(processedAdmins);
      
      // Calculate stats
      const regularUsers = allAccounts.filter(account => account.userType === 'user');
      const vendorUsers = allAccounts.filter(account => account.userType === 'vendor');
      
      calculateStats(regularUsers, vendorUsers, processedAdmins);

    } catch (error) {
      console.error("❌ Error loading data:", error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (regularUsers, vendorUsers, adminUsers) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allAccounts = [...regularUsers, ...vendorUsers];
    
    const todayUsers = allAccounts.filter(account => {
      if (!account.createdAt) return false;
      const accountDate = new Date(account.createdAt);
      return accountDate >= today;
    });

    const activeUsers = allAccounts.filter(account => {
      if (!account.lastLogin) return false;
      const lastLogin = new Date(account.lastLogin);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return lastLogin >= thirtyDaysAgo;
    });

    const activeVendors = vendorUsers.filter(vendor => 
      vendor.vendorStatus === 'approved' || vendor.vendorApproved === true
    );

    setStats({
      total: allAccounts.length,
      today: todayUsers.length,
      active: activeUsers.length,
      vendors: vendorUsers.length,
      activeVendors: activeVendors.length,
      admins: adminUsers.length
    });
  };

  const handleMakeAdmin = async (user) => {
    if (!window.confirm(`Are you sure you want to make ${user.name || user.email} an admin?`)) {
      return;
    }

    setProcessingAction(true);
    try {
      const result = await addAdmin({
        uid: user.uid,
        email: user.email,
        name: user.name,
        originalUserType: user.userType, // Store whether they were user or vendor
        role: 'admin',
        createdBy: 'admin'
      });

      if (result.success) {
        // Log to history
        await logHistoryAction({
          entity: 'admin',
          entityId: result.adminKey,
          action: 'make_admin',
          changedBy: currentAdmin.name,
          userEmail: user.email,
          details: `Made ${user.name || user.email} an admin (Original type: ${user.userType})`,
          newValue: { 
            role: 'admin', 
            name: user.name, 
            email: user.email,
            originalUserType: user.userType 
          }
        });
        
        alert(`✅ ${user.name || user.email} has been made an admin successfully!`);
        await loadAllData(); // Reload data
      } else {
        alert(`❌ Failed to make admin: ${result.error}`);
      }
    } catch (error) {
      console.error('Error making admin:', error);
      alert('❌ Error making admin. Please try again.');
    } finally {
      setProcessingAction(false);
      setSelectedUser(null);
    }
  };

  const handleRemoveAdmin = async (admin) => {
    if (!window.confirm(`Are you sure you want to remove admin privileges from ${admin.name || admin.email}? They will become a regular ${admin.originalUserType || 'user'} again.`)) {
      return;
    }

    setProcessingAction(true);
    try {
      const success = await removeAdmin(admin.adminKey);
      
      if (success) {
        // Log to history
        await logHistoryAction({
          entity: 'admin',
          entityId: admin.adminKey,
          action: 'remove_admin',
          changedBy: currentAdmin.name,
          userEmail: admin.email,
          details: `Removed admin privileges from ${admin.name || admin.email}. They are now a regular ${admin.originalUserType || 'user'}.`,
          oldValue: { role: 'admin', ...admin }
        });
        
        alert(`✅ Admin privileges removed from ${admin.name || admin.email}. They are now a regular ${admin.originalUserType || 'user'} again.`);
        await loadAllData(); // Reload data
      } else {
        alert('❌ Failed to remove admin privileges');
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('❌ Error removing admin. Please try again.');
    } finally {
      setProcessingAction(false);
      setSelectedUser(null);
    }
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
    if (!user) return "inactive";
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
      'United States': '🇺🇸',
      'USA': '🇺🇸',
      'UAE': '🇦🇪',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Singapore': '🇸🇬',
      'Japan': '🇯🇵',
      'China': '🇨🇳'
    };
    return flags[country] || '🌍';
  };

  const getAccountTypeBadge = (user) => {
    if (!user) return <span className="account-badge unknown">❓ Unknown</span>;
    
    if (user.userType === 'admin') {
      return <span className="account-badge admin-badge">👑 Admin</span>;
    }
    
    if (user.userType === 'user') {
      return <span className="account-badge user-badge">👤 User</span>;
    }
    
    if (user.userType === 'vendor') {
      if (user.vendorStatus === 'approved' || user.vendorApproved) {
        return <span className="account-badge vendor-active">🏢 Active Vendor</span>;
      } else {
        return <span className="account-badge vendor-pending">⏳ Pending Vendor</span>;
      }
    }
    
    return <span className="account-badge unknown">❓ Unknown</span>;
  };

  const getFilteredUsers = () => {
    if (!users || users.length === 0) return [];
    
    switch (activeTab) {
      case 'users':
        return users.filter(user => user.userType === 'user');
      case 'vendors':
        return users.filter(user => user.userType === 'vendor');
      case 'admins':
        return admins;
      default:
        return users;
    }
  };

  const exportUsersToCSV = () => {
    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length === 0) {
      alert("No users to export!");
      return;
    }

    const csvContent = [
      ['User ID', 'Type', 'Original Type', 'Name', 'Email', 'Phone', 'Country Code', 'Country', 'State', 'City', 'Pincode', 'User Status', 'Vendor Status', 'Admin Role', 'GST No', 'Registered By', 'Account Created', 'Last Login'],
      ...filteredUsers.map(user => [
        user.userKey || user.vendorKey || user.adminKey || user.uid || '',
        user.userType === 'vendor' ? 'Vendor' : (user.userType === 'admin' ? 'Admin' : 'User'),
        user.originalUserType || 'N/A',
        user.name || '',
        user.email || '',
        user.phone || '',
        user.countryCode || '',
        user.country || '',
        user.state || '',
        user.city || '',
        user.pincode || '',
        getUserStatus(user),
        user.userType === 'vendor' ? (user.vendorStatus || (user.vendorApproved ? 'approved' : 'pending')) : 'N/A',
        user.userType === 'admin' ? (user.role || 'admin') : 'N/A',
        user.userType === 'vendor' ? (user.gstNo || '') : '',
        user.userType === 'vendor' ? (user.registeredBy || '') : '',
        formatDate(user.createdAt),
        formatDate(user.lastLogin)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Exported ${filteredUsers.length} ${activeTab} to CSV file!`);
  };

  const canMakeAdmin = (user) => {
    // Check if user exists and is not already an admin
    return user && user.userType !== 'admin' && user.email;
  };

  return (
    <div className="users-container admin-content">
      {/* Header Section */}
      <div className="users-header">
        <div className="header-content">
          <h1 className="users-title">
            <FiUsers className="title-icon" />
            Users & Vendors Management
          </h1>
          <p className="users-subtitle">
            Manage and monitor all registered users, vendors, and admins in real-time
            <span className="user-count">{users.length + admins.length} total accounts</span>
          </p>
        </div>
        <div className="header-stats">
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiUser />
            </div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiBriefcase />
            </div>
            <div>
              <div className="stat-value">{stats.vendors}</div>
              <div className="stat-label">Vendors</div>
            </div>
          </div>
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiShield />
            </div>
            <div>
              <div className="stat-value">{stats.admins}</div>
              <div className="stat-label">Admins</div>
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
            <p>Total Accounts</p>
            <div className="stat-trend">All registered accounts</div>
          </div>
        </div>

        <div className="stat-card today-stat">
          <div className="stat-icon">
            <FiUser />
          </div>
          <div className="stat-content">
            <h3>{stats.today}</h3>
            <p>Today's Registrations</p>
            <div className="stat-trend">Registered today</div>
          </div>
        </div>

        <div className="stat-card vendors-stat">
          <div className="stat-icon">
            <FiBriefcase />
          </div>
          <div className="stat-content">
            <h3>{stats.vendors}</h3>
            <p>Vendors</p>
            <div className="stat-trend">
              {stats.activeVendors} active vendors
            </div>
          </div>
        </div>

        <div className="stat-card active-stat">
          <div className="stat-icon">
            <FiUser />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active Users</p>
            <div className="stat-trend">Last 30 days activity</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FiUsers /> All Accounts ({users.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUser /> Regular Users ({users.filter(u => u && u.userType === 'user').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          <FiBriefcase /> Vendors ({users.filter(u => u && u.userType === 'vendor').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <FiShield /> Admins ({admins.length})
        </button>
      </div>

      {/* Toolbar with Export and Refresh */}
      <div className="users-toolbar">
        <div className="toolbar-left">
          <button
            className="export-btn"
            onClick={exportUsersToCSV}
            disabled={getFilteredUsers().length === 0 || processingAction}
          >
            <FiDownload /> Export CSV
          </button>
        </div>
        <div className="toolbar-right">
          <button
            className="refresh-btn"
            onClick={loadAllData}
            disabled={processingAction}
          >
            <FiRefreshCw /> Refresh Data
          </button>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading users, vendors, and admins from Firebase...</p>
            <small>Checking collections: users, vendors, admin</small>
          </div>
        ) : error ? (
          <div className="error-state">
            <FiAlertCircle size={48} />
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button onClick={loadAllData} className="refresh-btn">
              <FiRefreshCw /> Try Again
            </button>
          </div>
        ) : getFilteredUsers().length === 0 ? (
          <div className="empty-state">
            {activeTab === 'users' ? <FiUser size={48} /> : 
             activeTab === 'vendors' ? <FiBriefcase size={48} /> : 
             activeTab === 'admins' ? <FiShield size={48} /> : <FiUsers size={48} />}
            <h3>No {activeTab} found</h3>
            <p>No {activeTab} have been registered yet</p>
            <button onClick={loadAllData} className="refresh-btn">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="table-info">
              <span>Showing {getFilteredUsers().length} {activeTab === 'all' ? 'accounts' : activeTab}</span>
              <span className="export-hint">
                <FiDownload size={12} /> Click Export CSV to download all data
              </span>
            </div>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Account Type</th>
                  <th>User Details</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>User Status</th>
                  <th>Vendor/Admin Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'admins' ? admins : getFilteredUsers()).map((user) => (
                  <tr key={user.userKey || user.vendorKey || user.adminKey || user.uid || Math.random()} className="user-row">
                    <td className="account-type-cell">
                      {getAccountTypeBadge(user)}
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
                      {user.userType === 'vendor' ? (
                        <div className={`vendor-status ${user.vendorStatus === 'approved' || user.vendorApproved ? 'active' : 'pending'}`}>
                          {user.vendorStatus === 'approved' || user.vendorApproved ? (
                            <><FiCheckCircle /> Active Vendor</>
                          ) : (
                            <><FiAlertCircle /> Pending</>
                          )}
                        </div>
                      ) : user.userType === 'admin' ? (
                        <div className="admin-status">
                          <FiStar /> {user.role || 'Admin'}
                        </div>
                      ) : (
                        <div className="vendor-status not-vendor">
                          Regular User
                        </div>
                      )}
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
                        
                        {/* Make Admin button for non-admin users */}
                        {user.userType !== 'admin' && canMakeAdmin(user) && (
                          <button
                            className="make-admin-btn"
                            onClick={() => handleMakeAdmin(user)}
                            title="Make Admin"
                            disabled={processingAction}
                          >
                            <FiUserPlus /> Make Admin
                          </button>
                        )}
                        
                        {/* Remove Admin button for admin users - they become regular users again, not deleted */}
                        {user.userType === 'admin' && user.adminKey && (
                          <button
                            className="remove-admin-btn"
                            onClick={() => handleRemoveAdmin(user)}
                            title="Remove Admin (becomes regular user)"
                            disabled={processingAction}
                          >
                            <FiUserMinus /> Remove Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* User/Vendor/Admin Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedUser.userType === 'vendor' ? 'Vendor Details' : 
                 selectedUser.userType === 'admin' ? 'Admin Details' : 'User Details'}
                {getAccountTypeBadge(selectedUser)}
              </h2>
              <button
                className="modal-close-blue"
                onClick={() => setSelectedUser(null)}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="user-id-section">
              <div className="user-id-label">UID / Key:</div>
              <div className="user-id-value">
                {selectedUser.uid || selectedUser.userKey || selectedUser.vendorKey || selectedUser.adminKey || "N/A"}
              </div>
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
                    <div className="detail-row">
                      <span className="detail-label">Account Type:</span>
                      <span className="detail-value">
                        {selectedUser.userType === 'vendor' ? 'Vendor' : 
                         selectedUser.userType === 'admin' ? 'Admin' : 'Regular User'}
                      </span>
                    </div>
                    {selectedUser.userType === 'admin' && selectedUser.originalUserType && (
                      <div className="detail-row">
                        <span className="detail-label">Original Type:</span>
                        <span className="detail-value">
                          {selectedUser.originalUserType === 'vendor' ? 'Vendor' : 'Regular User'}
                        </span>
                      </div>
                    )}
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

                {selectedUser.userType === 'vendor' && (
                  <div className="details-section">
                    <div className="section-header">
                      <FiBriefcase className="section-icon" />
                      <h3 className="section-title">Vendor Information</h3>
                    </div>
                    <div className="section-content">
                      <div className="detail-row">
                        <span className="detail-label">GST Number:</span>
                        <span className="detail-value vendor-gst">{selectedUser.gstNo || "Not provided"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Registered By:</span>
                        <span className="detail-value">{selectedUser.registeredBy || "Not provided"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Vendor Status:</span>
                        <span className="detail-value">
                          <span className={`vendor-status-indicator ${selectedUser.vendorStatus === 'approved' || selectedUser.vendorApproved ? 'approved' : 'pending'}`}>
                            {selectedUser.vendorStatus === 'approved' || selectedUser.vendorApproved ? '✅ Active' : '⏳ Pending'}
                          </span>
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Vendor ID:</span>
                        <span className="detail-value">{selectedUser.vendorKey || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.userType === 'admin' && (
                  <div className="details-section">
                    <div className="section-header">
                      <FiShield className="section-icon" />
                      <h3 className="section-title">Admin Information</h3>
                    </div>
                    <div className="section-content">
                      <div className="detail-row">
                        <span className="detail-label">Admin Role:</span>
                        <span className="detail-value">{selectedUser.role || 'Admin'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Admin Key:</span>
                        <span className="detail-value">{selectedUser.adminKey || "N/A"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Original Type:</span>
                        <span className="detail-value">{selectedUser.originalUserType === 'vendor' ? 'Vendor' : 'Regular User'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Created By:</span>
                        <span className="detail-value">{selectedUser.createdBy || 'system'}</span>
                      </div>
                    </div>
                  </div>
                )}

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
              <div className="vendor-actions">
                {/* Make Admin button for non-admin users in modal */}
                {selectedUser.userType !== 'admin' && canMakeAdmin(selectedUser) && (
                  <button
                    className="btn-approve"
                    onClick={() => handleMakeAdmin(selectedUser)}
                    disabled={processingAction}
                  >
                    <FiUserPlus /> Make Admin
                  </button>
                )}
                
                {/* Remove Admin button for admin users in modal */}
                {selectedUser.userType === 'admin' && selectedUser.adminKey && (
                  <button
                    className="btn-reject"
                    onClick={() => handleRemoveAdmin(selectedUser)}
                    disabled={processingAction}
                  >
                    <FiUserMinus /> Remove Admin
                  </button>
                )}
              </div>
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