import React, { useEffect, useState } from "react";
import { database, ref, onValue } from "../../firebase";
import {
  FiUser,
  FiPackage,
  FiShoppingBag,
  FiShield,
  FiClock,
  FiCalendar,
  FiFilter,
  FiX,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiDatabase,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiUserPlus,
  FiUserMinus,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiMail,
  FiPhone,
  FiMapPin
} from "react-icons/fi";

export default function History() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    users: 0,
    products: 0,
    orders: 0,
    admin: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
    user: '',
    startDate: '',
    endDate: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Entity types with icons
  const entityIcons = {
    user: <FiUser size={14} />,
    vendor: <FiUser size={14} />,
    product: <FiPackage size={14} />,
    order: <FiShoppingBag size={14} />,
    admin: <FiShield size={14} />
  };

  // Action types with icons and colors
  const actionConfig = {
    create: { icon: <FiStar />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: 'Created' },
    update: { icon: <FiEdit />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', label: 'Updated' },
    delete: { icon: <FiTrash2 />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Deleted' },
    status_change: { icon: <FiCheckCircle />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'Status Changed' },
    make_admin: { icon: <FiUserPlus />, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', label: 'Made Admin' },
    remove_admin: { icon: <FiUserMinus />, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)', label: 'Removed Admin' },
    approve: { icon: <FiCheckCircle />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: 'Approved' },
    reject: { icon: <FiXCircle />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Rejected' }
  };

  useEffect(() => {
    const historyRef = ref(database, "history");

    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      setLoading(false);
      
      if (!data) {
        setHistory([]);
        setFilteredHistory([]);
        setStats({
          total: 0,
          today: 0,
          users: 0,
          products: 0,
          orders: 0,
          admin: 0
        });
        return;
      }

      const formatted = Object.keys(data).map((key) => {
        const entry = data[key];
        
        // Parse timestamp
        let timestamp = entry.timestamp || entry.createdAt || new Date().toISOString();
        
        return {
          id: key,
          ...entry,
          timestamp: timestamp,
          date: new Date(timestamp),
          timeAgo: getTimeAgo(new Date(timestamp))
        };
      });

      // Sort by timestamp (newest first)
      formatted.sort((a, b) => b.date - a.date);

      // Calculate stats
      const now = new Date();
      const today = formatted.filter(e => {
        const d = new Date(e.timestamp);
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });

      setStats({
        total: formatted.length,
        today: today.length,
        users: formatted.filter(e => e.entity === 'user' || e.entity === 'vendor').length,
        products: formatted.filter(e => e.entity === 'product').length,
        orders: formatted.filter(e => e.entity === 'order').length,
        admin: formatted.filter(e => e.entity === 'admin').length
      });

      setHistory(formatted);
      setFilteredHistory(formatted);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...history];

    if (filters.entity) {
      result = result.filter(e => e.entity === filters.entity);
    }
    
    if (filters.action) {
      result = result.filter(e => e.action === filters.action);
    }
    
    if (filters.user) {
      const searchTerm = filters.user.toLowerCase();
      result = result.filter(e => 
        (e.changedBy && e.changedBy.toLowerCase().includes(searchTerm)) ||
        (e.userEmail && e.userEmail.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      result = result.filter(e => new Date(e.timestamp) >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59);
      result = result.filter(e => new Date(e.timestamp) <= end);
    }

    setFilteredHistory(result);
  }, [filters, history]);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action) => {
    const config = actionConfig[action] || { 
      icon: <FiClock />, 
      color: '#6b7280', 
      bgColor: 'rgba(107, 114, 128, 0.1)',
      label: action
    };
    
    return (
      <span className="action-badge" style={{ backgroundColor: config.bgColor, color: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getEntityBadge = (entity) => {
    const entityColors = {
      user: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
      vendor: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
      product: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
      order: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      admin: { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }
    };
    
    const colors = entityColors[entity] || { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    
    return (
      <span className="entity-badge" style={{ backgroundColor: colors.bg, color: colors.color }}>
        {entityIcons[entity] || <FiDatabase size={14} />} {entity?.charAt(0).toUpperCase() + entity?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      entity: '',
      action: '',
      user: '',
      startDate: '',
      endDate: ''
    });
  };

  const exportHistoryToCSV = () => {
    if (filteredHistory.length === 0) {
      alert("No history to export!");
      return;
    }

    const csvContent = [
      ['Timestamp', 'Entity', 'Entity ID', 'Action', 'Changed By', 'User Email', 'Old Value', 'New Value', 'Details'],
      ...filteredHistory.map(entry => [
        formatDate(entry.date),
        entry.entity || '',
        entry.entityId || '',
        entry.action || '',
        entry.changedBy || '',
        entry.userEmail || '',
        entry.oldValue ? JSON.stringify(entry.oldValue) : '',
        entry.newValue ? JSON.stringify(entry.newValue) : '',
        entry.details || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `history_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Exported ${filteredHistory.length} history entries to CSV file!`);
  };

  return (
    <div className="history-container">
      {/* Header Section */}
      <div className="history-header">
        <div className="header-content">
          <h1 className="history-title">
            <FiClock className="title-icon" />
            Activity History
          </h1>
          <p className="history-subtitle">
            Track all actions across users, products, orders, and admin operations
            <span className="history-count">{history.length} total entries</span>
          </p>
        </div>
        <div className="header-stats">
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiCalendar />
            </div>
            <div>
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">Today</div>
            </div>
          </div>
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiTrendingUp />
            </div>
            <div>
              <div className="stat-value">{((stats.today / stats.total) * 100 || 0).toFixed(1)}%</div>
              <div className="stat-label">Activity</div>
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
            <p>Total Activities</p>
            <div className="stat-trend">All recorded actions</div>
          </div>
        </div>
        
        <div className="stat-card today-stat">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <h3>{stats.today}</h3>
            <p>Today's Activities</p>
            <div className="stat-trend">
              {stats.today > 0 ? 
                <span className="trend-up">↑ Active day</span> : 
                <span className="trend-down">No activity today</span>
              }
            </div>
          </div>
        </div>
        
        <div className="stat-card users-stat">
          <div className="stat-icon">
            <FiUser />
          </div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>User Actions</p>
            <div className="stat-trend">User management</div>
          </div>
        </div>
        
        <div className="stat-card products-stat">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.products}</h3>
            <p>Product Actions</p>
            <div className="stat-trend">Product management</div>
          </div>
        </div>

        <div className="stat-card orders-stat">
          <div className="stat-icon">
            <FiShoppingBag />
          </div>
          <div className="stat-content">
            <h3>{stats.orders}</h3>
            <p>Order Actions</p>
            <div className="stat-trend">Order management</div>
          </div>
        </div>

        <div className="stat-card admin-stat">
          <div className="stat-icon">
            <FiShield />
          </div>
          <div className="stat-content">
            <h3>{stats.admin}</h3>
            <p>Admin Actions</p>
            <div className="stat-trend">Admin operations</div>
          </div>
        </div>
      </div>

      {/* Toolbar with Filters and Export */}
      <div className="history-toolbar">
        <div className="toolbar-left">
          <button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
            {(filters.entity || filters.action || filters.user || filters.startDate || filters.endDate) && (
              <span className="filter-active-dot"></span>
            )}
          </button>
          
          <button 
            className="export-btn"
            onClick={exportHistoryToCSV}
            disabled={filteredHistory.length === 0}
          >
            <FiDownload /> Export CSV
          </button>
        </div>
        
        <div className="toolbar-right">
          <button
            className="refresh-btn"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter History</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
          
          <div className="filter-grid">
            <div className="filter-group">
              <label>Entity Type</label>
              <select 
                value={filters.entity}
                onChange={(e) => setFilters({...filters, entity: e.target.value})}
              >
                <option value="">All Entities</option>
                <option value="user">Users</option>
                <option value="vendor">Vendors</option>
                <option value="product">Products</option>
                <option value="order">Orders</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Action Type</label>
              <select 
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="status_change">Status Change</option>
                <option value="make_admin">Make Admin</option>
                <option value="remove_admin">Remove Admin</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>User/Admin</label>
              <input
                type="text"
                placeholder="Search by name or email"
                value={filters.user}
                onChange={(e) => setFilters({...filters, user: e.target.value})}
              />
            </div>
            
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="filter-stats">
            Showing {filteredHistory.length} of {history.length} entries
          </div>
        </div>
      )}

      {/* Main History Table */}
      <div className="history-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-state">
            <FiClock size={48} />
            <h3>No history found</h3>
            <p>Try adjusting your filters</p>
            {(filters.entity || filters.action || filters.user || filters.startDate || filters.endDate) && (
              <button 
                className="btn-primary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-info">
              <span>Showing {filteredHistory.length} of {history.length} entries</span>
              <span className="export-hint">
                <FiDownload size={12} /> CSV export available
              </span>
            </div>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Entity</th>
                  <th>Action</th>
                  <th>Changed By</th>
                  <th>Path / ID</th>
                  <th>Details</th>
                  <th>View</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="history-row">
                    <td className="time-cell">
                      <div className="time-display">
                        <FiClock size={12} />
                        <div>
                          <div className="time-full">{formatDate(entry.date)}</div>
                          <div className="time-ago">{entry.timeAgo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getEntityBadge(entry.entity)}
                    </td>
                    <td>
                      {getActionBadge(entry.action)}
                    </td>
                    <td>
                      <div className="changed-by">
                        <FiUser size={12} />
                        <div>
                          <div className="changed-by-name">{entry.changedBy || 'System'}</div>
                          {entry.userEmail && <div className="changed-by-email">{entry.userEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="path-cell">
                      <div className="path-display">
                        <span className="path-value">{entry.entityId || entry.path || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="details-cell">
                      <div className="details-display">
                        {entry.details ? (
                          <span className="details-text">{entry.details}</span>
                        ) : (
                          <div className="value-change">
                            {entry.oldValue && (
                              <span className="old-value">
                                <FiTrendingDown /> {JSON.stringify(entry.oldValue).substring(0, 30)}
                                {JSON.stringify(entry.oldValue).length > 30 ? '...' : ''}
                              </span>
                            )}
                            {entry.newValue && (
                              <span className="new-value">
                                <FiTrendingUp /> {JSON.stringify(entry.newValue).substring(0, 30)}
                                {JSON.stringify(entry.newValue).length > 30 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedEntry(entry)}
                        title="View Full Details"
                      >
                        <FiEye /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Details Modal - ALL TEXT WHITE INCLUDING LABELS */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="modal-content history-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2 className="modal-title-text">
                  <FiClock className="me-2" />
                  Action Details
                </h2>
                <div className="entry-id-section">
                  <span className="entry-id-label">Entry ID:</span>
                  <span className="entry-id-value">{selectedEntry.id}</span>
                </div>
              </div>
              <button 
                className="modal-close-blue"
                onClick={() => setSelectedEntry(null)}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="history-info-grid">
                {/* Basic Information */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiClock className="header-icon" />
                    <h3 className="info-card-title">Basic Information</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-row">
                      <span className="info-label">Timestamp:</span>
                      <span className="info-value white-text">{formatDate(selectedEntry.date)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Time Ago:</span>
                      <span className="info-value white-text">{selectedEntry.timeAgo}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Entity:</span>
                      <span className="info-value entity-value">{getEntityBadge(selectedEntry.entity)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Action:</span>
                      <span className="info-value action-value">{getActionBadge(selectedEntry.action)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">ID / Path:</span>
                      <span className="info-value path-value white-text">{selectedEntry.entityId || selectedEntry.path || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Changed By Information */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiUser className="header-icon" />
                    <h3 className="info-card-title">Changed By</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value white-text">{selectedEntry.changedBy || 'System'}</span>
                    </div>
                    {selectedEntry.userEmail && (
                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value white-text">
                          <FiMail size={12} style={{ marginRight: '4px', color: '#3b82f6' }} /> 
                          {selectedEntry.userEmail}
                        </span>
                      </div>
                    )}
                    {selectedEntry.changedByUid && (
                      <div className="info-row">
                        <span className="info-label">UID:</span>
                        <span className="info-value uid-value white-text">{selectedEntry.changedByUid}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Value Changes */}
                {(selectedEntry.oldValue || selectedEntry.newValue) && (
                  <div className="info-card full-width">
                    <div className="info-card-header">
                      <FiEdit className="header-icon" />
                      <h3 className="info-card-title">Value Change</h3>
                    </div>
                    <div className="info-card-body">
                      {selectedEntry.oldValue && (
                        <div className="change-section old">
                          <h4 className="section-subtitle white-text">Previous Value:</h4>
                          <pre className="value-pre old-pre white-text">
                            {JSON.stringify(selectedEntry.oldValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedEntry.newValue && (
                        <div className="change-section new">
                          <h4 className="section-subtitle white-text">New Value:</h4>
                          <pre className="value-pre new-pre white-text">
                            {JSON.stringify(selectedEntry.newValue, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Details */}
                {selectedEntry.details && (
                  <div className="info-card full-width">
                    <div className="info-card-header">
                      <FiAlertCircle className="header-icon" />
                      <h3 className="info-card-title">Detail</h3>
                    </div>
                    <div className="info-card-body">
                      <div className="details-text-large white-text">
                        {selectedEntry.details}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Metadata */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiDatabase className="header-icon" />
                    <h3 className="info-card-title">Metadata</h3>
                  </div>
                  <div className="info-card-body">
                    {selectedEntry.createdAt && (
                      <div className="info-row">
                        <span className="info-label">Metadata At:</span>
                        <span className="info-value white-text">{formatDate(new Date(selectedEntry.createdAt))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary-blue"
                onClick={() => setSelectedEntry(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE CSS WITH ALL TEXT FORCED TO WHITE */}
      <style>{`
        .history-container {
          padding: 24px 20px;
          color: #ffffff;
          background: #0f172a;
          min-height: 100vh;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
        }

        .header-content {
          flex: 1;
        }

        .history-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-icon {
          color: #3b82f6;
        }

        .history-subtitle {
          font-size: 15px;
          color: #94a3b8;
          margin-bottom: 0;
          line-height: 1.5;
        }

        .history-count {
          display: inline-block;
          margin-left: 10px;
          padding: 3px 8px;
          background: #1e293b;
          border-radius: 20px;
          font-size: 12px;
          color: #94a3b8;
        }

        .header-stats {
          display: flex;
          gap: 12px;
        }

        .header-stat-card {
          background: #1e293b;
          border-radius: 10px;
          padding: 12px 16px;
          border: 1px solid #334155;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 120px;
        }

        .stat-icon-small {
          width: 36px;
          height: 36px;
          background: #334155;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: #94a3b8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #1e293b;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #334155;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: #334155;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #3b82f6;
        }

        .stat-content h3 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
          line-height: 1.2;
        }

        .stat-content p {
          margin: 4px 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .stat-trend {
          font-size: 11px;
          color: #64748b;
        }

        .trend-up {
          color: #10b981;
        }

        .trend-down {
          color: #ef4444;
        }

        .total-stat .stat-icon { color: #3b82f6; }
        .today-stat .stat-icon { color: #f59e0b; }
        .users-stat .stat-icon { color: #3b82f6; }
        .products-stat .stat-icon { color: #10b981; }
        .orders-stat .stat-icon { color: #f59e0b; }
        .admin-stat .stat-icon { color: #ec4899; }

        .history-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }

        .toolbar-left {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbar-right {
          display: flex;
          gap: 12px;
        }

        .filter-toggle-btn {
          padding: 10px 16px;
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .filter-toggle-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .filter-toggle-btn:hover {
          background: #334155;
        }

        .filter-active-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-left: 4px;
        }

        .export-btn {
          padding: 10px 16px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .export-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #047857, #059669);
          transform: translateY(-1px);
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .refresh-btn {
          padding: 10px 16px;
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #334155;
        }

        .filter-panel {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .filter-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .clear-filters-btn {
          padding: 6px 12px;
          background: transparent;
          color: #94a3b8;
          border: 1px solid #475569;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: #334155;
          color: #ffffff;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-size: 12px;
          color: #94a3b8;
        }

        .filter-group select,
        .filter-group input {
          padding: 8px 12px;
          background: #0f172a;
          color: #ffffff;
          border: 1px solid #475569;
          border-radius: 6px;
          font-size: 13px;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .filter-stats {
          text-align: right;
          font-size: 12px;
          color: #94a3b8;
          padding-top: 12px;
          border-top: 1px solid #334155;
        }

        .history-table-container {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-info {
          padding: 16px 20px;
          background: #0f172a;
          border-bottom: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #94a3b8;
        }

        .export-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th {
          text-align: left;
          padding: 16px 20px;
          background: #0f172a;
          color: #94a3b8;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #334155;
        }

        .history-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #2d3748;
          color: #ffffff;
          font-size: 14px;
        }

        .history-row:hover {
          background: #2d3748;
        }

        .time-cell .time-display {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .time-full {
          font-size: 13px;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .time-ago {
          font-size: 11px;
          color: #94a3b8;
        }

        .entity-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .action-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .changed-by {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .changed-by-name {
          font-size: 13px;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .changed-by-email {
          font-size: 11px;
          color: #94a3b8;
        }

        .path-cell .path-value {
          font-family: monospace;
          font-size: 12px;
          color: #94a3b8;
          background: #0f172a;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .details-cell .value-change {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .old-value {
          font-size: 11px;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .new-value {
          font-size: 11px;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .details-text {
          font-size: 12px;
          color: #94a3b8;
        }

        .view-btn {
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loader {
          width: 40px;
          height: 40px;
          border: 4px solid #334155;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state svg {
          color: #475569;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          color: #ffffff;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #94a3b8;
          margin-bottom: 20px;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        /* MODAL STYLES - EVERYTHING WHITE */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: #1e293b;
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #334155;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .history-details-modal {
          max-width: 1000px;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: #1e293b;
          z-index: 10;
        }

        .modal-title-section h2 {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff !important;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-title-text {
          color: #ffffff !important;
        }

        .entry-id-section {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .entry-id-label {
          color: #94a3b8;
        }

        .entry-id-value {
          color: #3b82f6;
          font-family: monospace;
          background: #0f172a;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .modal-close-blue {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close-blue:hover {
          background: #334155;
          color: #ffffff;
        }

        .modal-body {
          padding: 24px;
        }

        .history-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .info-card {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          overflow: hidden;
        }

        .info-card.full-width {
          grid-column: 1 / -1;
        }

        .info-card-header {
          padding: 16px;
          background: #1e293b;
          border-bottom: 1px solid #334155;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-card-header .header-icon {
          color: #3b82f6;
        }

        .info-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff !important;
          margin: 0;
        }

        .info-card-body {
          padding: 16px;
        }

        .info-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #2d3748;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          width: 120px;
          color: #ffffff !important;
          font-size: 13px;
          font-weight: 500;
        }

        .info-value {
          flex: 1;
          color: #ffffff !important;
          font-size: 13px;
          font-weight: 400;
        }

        .white-text {
          color: #ffffff !important;
        }

        .uid-value {
          font-family: monospace;
          color: #94a3b8 !important;
        }

        .path-value {
          font-family: monospace;
          color: #3b82f6 !important;
          background: #1e293b;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .change-section {
          margin-bottom: 16px;
        }

        .section-subtitle {
          color: #ffffff !important;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .value-pre {
          background: #1e293b;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #ffffff !important;
          overflow-x: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .old-pre {
          border-left: 3px solid #ef4444;
        }

        .new-pre {
          border-left: 3px solid #10b981;
        }

        .details-text-large {
          font-size: 14px;
          color: #ffffff !important;
          line-height: 1.6;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #334155;
          display: flex;
          justify-content: flex-end;
        }

        .btn-secondary-blue {
          padding: 10px 20px;
          background: #1e293b;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary-blue:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #ffffff;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .history-info-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .header-stats {
            width: 100%;
            justify-content: space-between;
          }
          
          .header-stat-card {
            flex: 1;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}