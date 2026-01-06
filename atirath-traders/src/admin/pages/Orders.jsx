import { useEffect, useState } from "react";
import { database, ref, onValue, update } from "../../firebase";
import { 
  FiSearch, 
  FiCalendar, 
  FiEye, 
  FiX, 
  FiCheck, 
  FiClock, 
  FiPause,
  FiXCircle,
  FiEdit,
  FiRefreshCw,
  FiAlertCircle,
  FiDatabase,
  FiUser,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPhone,
  FiMail,
  FiMapPin,
  FiShoppingBag,
  FiBarChart2,
  FiDownload
} from "react-icons/fi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    processing: 0,
    hold: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  useEffect(() => {
    const quotesRef = ref(database, "quotes");

    const unsubscribe = onValue(quotesRef, (snapshot) => {
      const data = snapshot.val();
      setLoading(false);
      
      if (!data) {
        setOrders([]);
        setFilteredOrders([]);
        setStats({
          total: 0,
          today: 0,
          pending: 0,
          processing: 0,
          hold: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0
        });
        return;
      }

      const formatted = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
        status: (data[key].status || "pending").toLowerCase(),
        name: data[key].name || data[key].customerName || "Unnamed Customer",
        email: data[key].email || data[key].customerEmail || "",
        phone: data[key].phone || data[key].customerPhone || "",
        product: data[key].product || data[key].item || data[key].productName || "No product",
        productName: data[key].productName || data[key].product || data[key].item || "",
        price: parseFloat(data[key].price) || 0,
        quantity: parseInt(data[key].quantity) || 1,
        unit: data[key].unit || data[key].quantityUnit || data[key].actualUnit || "",
        grade: data[key].grade || data[key].productGrade || "",
        packing: data[key].packing || data[key].packingType || "",
        state: data[key].state || data[key].deliveryState || "",
        portDestination: data[key].portDestination || data[key].destination || "",
        cif: data[key].cif || data[key].incoterm || "",
        brandRequired: data[key].brandRequired || data[key].customBranding || "",
        company: data[key].company || data[key].companyName || "",
        location: data[key].location || data[key].address || data[key].city || "",
        category: data[key].category || data[key].productCategory || "",
        createdAt: data[key].createdAt || data[key].date || data[key].timestamp || "",
        updatedAt: data[key].updatedAt || data[key].lastUpdated || "",
        baseProductPrice: parseFloat(data[key].baseProductPrice) || 0,
        gradePrice: parseFloat(data[key].gradePrice) || 0,
        packingPrice: parseFloat(data[key].packingPrice) || 0,
        quantityPrice: parseFloat(data[key].quantityPrice) || 0,
        brandingCost: parseFloat(data[key].brandingCost) || 0,
        shippingCost: parseFloat(data[key].shippingCost) || parseFloat(data[key].transportCost) || 0,
        subtotal: parseFloat(data[key].subtotal) || 0,
        finalTotal: parseFloat(data[key].finalTotal) || 0,
        taxes: parseFloat(data[key].taxes) || 0,
        insuranceCost: parseFloat(data[key].insuranceCost) || 0,
        displayValues: data[key].displayValues || {},
        estimatedBill: parseFloat(data[key].estimatedBill) || 0,
        currency: data[key].currency || "INR",
        additionalCharges: parseFloat(data[key].additionalCharges) || 0,
        discount: parseFloat(data[key].discount) || 0,
        totalAmount: parseFloat(data[key].totalAmount) || 0,
        gst: parseFloat(data[key].gst) || 0,
        deliveryCharges: parseFloat(data[key].deliveryCharges) || 0,
        otherCharges: parseFloat(data[key].otherCharges) || 0,
        remarks: data[key].remarks || "",
        paymentStatus: data[key].paymentStatus || "pending",
        paymentMethod: data[key].paymentMethod || ""
      }));

      formatted.sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );

      const now = new Date();
      const todayOrders = formatted.filter((o) => {
        const d = new Date(o.createdAt);
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });

      const statusCounts = {
        pending: 0,
        processing: 0,
        hold: 0,
        completed: 0,
        cancelled: 0
      };

      let totalRevenue = 0;

      formatted.forEach(order => {
        const status = order.status;
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        } else {
          statusCounts.pending++;
        }
        
        if (status === 'completed' || status === 'delivered') {
          const finalValue = getFinalTotalValue(order);
          totalRevenue += finalValue;
        }
      });

      setStats({
        total: formatted.length,
        today: todayOrders.length,
        pending: statusCounts.pending,
        processing: statusCounts.processing,
        hold: statusCounts.hold,
        completed: statusCounts.completed,
        cancelled: statusCounts.cancelled,
        revenue: totalRevenue
      });

      setOrders(formatted);
      setFilteredOrders(formatted);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (search.trim() !== "") {
      result = result.filter((order) => {
        const searchString = search.toLowerCase();
        return (
          (order.name && order.name.toLowerCase().includes(searchString)) ||
          (order.email && order.email.toLowerCase().includes(searchString)) ||
          (order.phone && order.phone.includes(search)) ||
          (order.product && order.product.toLowerCase().includes(searchString)) ||
          (order.item && order.item.toLowerCase().includes(searchString)) ||
          (order.id && order.id.toLowerCase().includes(searchString)) ||
          (order.company && order.company.toLowerCase().includes(searchString))
        );
      });
    }

    setFilteredOrders(result);
  }, [search, orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;
    
    setUpdatingStatus(true);
    try {
      const orderRef = ref(database, `quotes/${orderId}`);

      await update(orderRef, {
        status: newStatus.toLowerCase(),
        updatedAt: new Date().toISOString(),
        updatedBy: "admin"
      });
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus.toLowerCase(),
                updatedAt: new Date().toISOString() 
              }
            : order
        )
      );
      
      setFilteredOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus.toLowerCase(),
                updatedAt: new Date().toISOString() 
              }
            : order
        )
      );
      
      setSelectedOrder(prev => 
        prev && prev.id === orderId 
          ? { 
              ...prev, 
              status: newStatus.toLowerCase(),
              updatedAt: new Date().toISOString() 
            }
          : prev
      );
      
      const oldStatus = orders.find(o => o.id === orderId)?.status;
      if (oldStatus && oldStatus !== newStatus.toLowerCase()) {
        setStats(prev => ({
          ...prev,
          [oldStatus]: Math.max(0, prev[oldStatus] - 1),
          [newStatus.toLowerCase()]: (prev[newStatus.toLowerCase()] || 0) + 1
        }));
      }
      
      setEditingStatus(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status.toLowerCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  const getStatusBadge = (status) => {
    const statusLower = status || "pending";
    let className = "";
    
    switch(statusLower) {
      case "completed":
      case "delivered":
        className = "status-completed";
        break;
      case "processing":
      case "confirmed":
      case "in-progress":
        className = "status-processing";
        break;
      case "pending":
      case "new":
        className = "status-pending";
        break;
      case "hold":
      case "on-hold":
        className = "status-hold";
        break;
      case "cancelled":
      case "rejected":
        className = "status-cancelled";
        break;
      default:
        className = "status-pending";
    }
    
    return (
      <div className={`status-badge ${className}`}>
        <span className="status-dot"></span>
        {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
      </div>
    );
  };

  const statusOptions = [
    { value: "pending", label: "Pending", icon: <FiClock />, color: "#ff9800" },
    { value: "processing", label: "Processing", icon: <FiRefreshCw />, color: "#2196f3" },
    { value: "hold", label: "On Hold", icon: <FiPause />, color: "#ff5722" },
    { value: "completed", label: "Completed", icon: <FiCheck />, color: "#4caf50" },
    { value: "cancelled", label: "Cancelled", icon: <FiXCircle />, color: "#f44336" }
  ];

  const getFinalTotalValue = (order) => {
    if (order.displayValues && order.displayValues.finalTotal) {
      const finalTotalStr = order.displayValues.finalTotal;
      const match = finalTotalStr.match(/[\d,]+\.?\d*/);
      if (match) {
        const numberStr = match[0].replace(/,/g, '');
        return parseFloat(numberStr) || 0;
      }
    }
    
    if (order.finalTotal > 0) {
      return order.finalTotal;
    }
    
    if (order.totalAmount > 0) {
      return order.totalAmount;
    }
    
    if (order.estimatedBill > 0) {
      return order.estimatedBill;
    }
    
    const baseProductPrice = order.baseProductPrice || 0;
    const gradePrice = order.gradePrice || 0;
    const packingPrice = order.packingPrice || 0;
    const brandingCost = order.brandingCost || 0;
    const shippingCost = order.shippingCost || 0;
    const insuranceCost = order.insuranceCost || 0;
    const taxes = order.taxes || 0;
    const additionalCharges = order.additionalCharges || 0;
    const deliveryCharges = order.deliveryCharges || 0;
    const gst = order.gst || 0;
    const discount = order.discount || 0;
    
    let subtotal = baseProductPrice + gradePrice + packingPrice + brandingCost + 
                   shippingCost + insuranceCost + taxes + additionalCharges + deliveryCharges;
    
    if (gst > 0) {
      subtotal += (subtotal * gst) / 100;
    }
    
    if (discount > 0) {
      subtotal -= discount;
    }
    
    return Math.max(0, subtotal);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const parseDisplayValue = (value) => {
    if (!value) return { amount: 0, unit: "" };
    
    const match = value.match(/([¥₹$]?)([0-9,]+(?:\.[0-9]+)?)(?:\/([a-zA-Z]+))?/);
    if (match) {
      const amount = parseFloat(match[2].replace(/,/g, ''));
      const unit = match[3] || "";
      return { amount, unit };
    }
    
    return { amount: 0, unit: "" };
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert("No orders to export!");
      return;
    }

    const csvContent = [
      ['Order ID', 'Customer Name', 'Email', 'Phone', 'Product', 'Quantity', 'Unit', 'Price', 'Final Total Value', 'Status', 'Created Date', 'Last Updated', 'Location', 'Company', 'Category', 'Payment Status', 'Payment Method', 'Remarks'],
      ...orders.map(order => [
        order.id,
        order.name || '',
        order.email || '',
        order.phone || '',
        order.product || order.item || '',
        order.quantity || 1,
        order.unit || '',
        order.price || 0,
        getFinalTotalValue(order),
        order.status,
        formatDate(order.createdAt),
        formatDate(order.updatedAt),
        order.location || '',
        order.company || '',
        order.category || '',
        order.paymentStatus || '',
        order.paymentMethod || '',
        order.remarks || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Exported ${orders.length} orders to CSV file!`);
  };

  return (
    <div className="orders-container">
      {/* Header Section */}
      <div className="orders-header">
        <div className="header-content">
          <h1 className="orders-title">
            <FiShoppingBag className="title-icon" />
            Orders Management
          </h1>
          <p className="orders-subtitle">
            Track and manage all customer orders in real-time
            <span className="order-count">{orders.length} total orders</span>
          </p>
        </div>
        <div className="header-stats">
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiTrendingUp />
            </div>
            <div>
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">Today</div>
            </div>
          </div>
          <div className="header-stat-card">
            <div className="stat-icon-small">
              <FiBarChart2 />
            </div>
            <div>
              <div className="stat-value">{formatCurrency(stats.revenue)}</div>
              <div className="stat-label">Revenue</div>
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
            <p>Total Orders</p>
            <div className="stat-trend">All quotes received</div>
          </div>
        </div>
        
        <div className="stat-card today-stat">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <h3>{stats.today}</h3>
            <p>Today's Orders</p>
            <div className="stat-trend">
              {stats.today > 0 ? 
                <span className="trend-up">↑ {((stats.today/stats.total)*100).toFixed(1)}% of total</span> : 
                <span className="trend-down">No orders today</span>
              }
            </div>
          </div>
        </div>
        
        <div className="stat-card pending-stat">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
            <div className="stat-trend">Awaiting action</div>
          </div>
        </div>
        
        <div className="stat-card processing-stat">
          <div className="stat-icon">
            <FiRefreshCw />
          </div>
          <div className="stat-content">
            <h3>{stats.processing}</h3>
            <p>Processing</p>
            <div className="stat-trend">In progress</div>
          </div>
        </div>

        <div className="stat-card hold-stat">
          <div className="stat-icon">
            <FiPause />
          </div>
          <div className="stat-content">
            <h3>{stats.hold}</h3>
            <p>On Hold</p>
            <div className="stat-trend">Requires attention</div>
          </div>
        </div>

        <div className="stat-card completed-stat">
          <div className="stat-icon">
            <FiCheck />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
            <div className="stat-trend">Successfully delivered</div>
          </div>
        </div>
      </div>

      {/* Toolbar with Search and Export */}
      <div className="orders-toolbar">
        <div className="toolbar-left">
          <button 
            className="export-btn"
            onClick={exportOrdersToCSV}
            disabled={orders.length === 0}
          >
            <FiDownload /> Export CSV
          </button>
        </div>
        <div className="toolbar-right">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders by name, email, phone, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="orders-search"
            />
          </div>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="orders-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={48} />
            <h3>No orders found</h3>
            <p>Try adjusting your search criteria</p>
            <button 
              className="btn-primary"
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="table-info">
              <span>Showing {filteredOrders.length} of {orders.length} orders</span>
              <span className="export-hint">
                <FiDownload size={12} /> CSV export available
              </span>
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Final Value</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const finalValue = getFinalTotalValue(order);
                  
                  return (
                    <tr key={order.id} className="order-row">
                      <td className="order-id">
                        <div className="order-id-display">
                          <span className="id-prefix">#</span>
                          <span className="id-value">{order.id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">
                            <FiUser size={12} />
                            {order.name || "Unnamed Customer"}
                          </div>
                          <div className="customer-contact">
                            {order.email && (
                              <span className="customer-email">
                                <FiMail size={10} />
                                {order.email}
                              </span>
                            )}
                            {order.phone && (
                              <span className="customer-phone">
                                <FiPhone size={10} />
                                {order.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="product-cell">
                        <div className="product-info">
                          <span className="product-name">
                            <FiPackage size={12} />
                            {order.product || order.item || "No product"}
                          </span>
                          {order.category && <span className="product-category">{order.category}</span>}
                        </div>
                      </td>
                      <td className="quantity-cell">
                        <div className="quantity-display">
                          <div className="quantity-value">
                            {order.quantity || "1"}
                            {order.unit && <span className="unit-suffix"> {order.unit}</span>}
                          </div>
                          {order.actualUnit && order.actualUnit !== order.unit && (
                            <div className="actual-unit-note">
                              (Actual: {order.actualUnit})
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="value-cell">
                        <div className="value-display final-value">
                          <FiDollarSign size={12} />
                          {formatCurrency(finalValue)}
                        </div>
                      </td>
                      <td>
                        {editingStatus === order.id ? (
                          <div className="status-edit" style={{ position: 'relative', zIndex: 100 }}>
                            <select
                              value={order.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus !== order.status) {
                                  updateOrderStatus(order.id, newStatus);
                                }
                              }}
                              onBlur={() => setTimeout(() => setEditingStatus(null), 200)}
                              className="status-select"
                              autoFocus
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {updatingStatus && <div className="status-updating">Updating...</div>}
                          </div>
                        ) : (
                          <div className="status-cell">
                            <div className="status-display" onClick={() => setEditingStatus(order.id)}>
                              {getStatusBadge(order.status)}
                              <button 
                                className="status-edit-btn"
                                title="Change Status"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingStatus(order.id);
                                }}
                              >
                                <FiEdit size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="date-cell">
                        <div className="date-display">
                          <FiCalendar size={12} />
                          {formatDate(order.createdAt)}
                        </div>
                        {order.updatedAt && (
                          <div className="updated-indicator" title="Updated">
                            <FiAlertCircle size={10} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="view-btn"
                            onClick={() => setSelectedOrder(order)}
                            title="View Details"
                          >
                            <FiEye /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => {
          setSelectedOrder(null);
          setEditingStatus(null);
        }}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>
                  <FiShoppingBag className="me-2" />
                  Order Details
                </h2>
                <div className="order-id-section">
                  <span className="order-id-label">Order ID:</span>
                  <span className="order-id-value">
                    {selectedOrder.id}
                  </span>
                </div>
              </div>
              <button 
                className="modal-close-blue"
                onClick={() => {
                  setSelectedOrder(null);
                  setEditingStatus(null);
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-grid">
                {/* Customer Information */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiUser className="header-icon" />
                    <h3>Customer Information</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value" style={{color: '#0A2347'}}>
                        {selectedOrder.name || "N/A"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value" style={{color: '#0A2347'}}>
                        {selectedOrder.email || "N/A"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value" style={{color: '#0A2347'}}>
                        {selectedOrder.phone || "N/A"}
                      </span>
                    </div>
                    {selectedOrder.location && (
                      <div className="info-row">
                        <span className="info-label">Location:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.location}
                        </span>
                      </div>
                    )}
                    {selectedOrder.company && (
                      <div className="info-row">
                        <span className="info-label">Company:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.company}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiPackage className="header-icon" />
                    <h3>Order Details</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-row">
                      <span className="info-label">Product:</span>
                      <span className="info-value" style={{color: '#0A2347'}}>
                        {selectedOrder.productName || selectedOrder.product || selectedOrder.item || "N/A"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Quantity:</span>
                      <span className="info-value" style={{color: '#0A2347'}}>
                        {selectedOrder.quantity || "1"} 
                        {selectedOrder.unit && ` ${selectedOrder.unit}`}
                        {selectedOrder.actualUnit && selectedOrder.actualUnit !== selectedOrder.unit && 
                          ` (Actual: ${selectedOrder.actualUnit})`}
                      </span>
                    </div>
                    {selectedOrder.grade && (
                      <div className="info-row">
                        <span className="info-label">Grade:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.grade}
                        </span>
                      </div>
                    )}
                    {selectedOrder.packing && (
                      <div className="info-row">
                        <span className="info-label">Packing:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.packing}
                        </span>
                      </div>
                    )}
                    {selectedOrder.state && (
                      <div className="info-row">
                        <span className="info-label">State:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.state}
                        </span>
                      </div>
                    )}
                    {selectedOrder.portDestination && (
                      <div className="info-row">
                        <span className="info-label">Port/Destination:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.portDestination}
                        </span>
                      </div>
                    )}
                    {selectedOrder.cif && (
                      <div className="info-row">
                        <span className="info-label">CIF:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.cif === "yes" ? "Yes" : selectedOrder.cif === "no" ? "No" : selectedOrder.cif}
                        </span>
                      </div>
                    )}
                    {selectedOrder.brandRequired && (
                      <div className="info-row">
                        <span className="info-label">Brand Required:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.brandRequired === "yes" ? "Yes" : selectedOrder.brandRequired === "no" ? "No" : selectedOrder.brandRequired}
                        </span>
                      </div>
                    )}
                    {selectedOrder.price > 0 && (
                      <div className="info-row">
                        <span className="info-label">Price:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {formatCurrency(selectedOrder.price)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.category && (
                      <div className="info-row">
                        <span className="info-label">Category:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated Bill Details */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiDollarSign className="header-icon" />
                    <h3>Estimated Bill</h3>
                  </div>
                  <div className="info-card-body">
                    {selectedOrder.displayValues && Object.keys(selectedOrder.displayValues).length > 0 ? (
                      <>
                        {selectedOrder.displayValues.baseProductPrice && (
                          <div className="info-row">
                            <span className="info-label">Base Product Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.baseProductPrice}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.gradePrice && (
                          <div className="info-row">
                            <span className="info-label">Grade Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.gradePrice}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.packingPrice && (
                          <div className="info-row">
                            <span className="info-label">Packing Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.packingPrice}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.quantityPrice && (
                          <div className="info-row">
                            <span className="info-label">Quantity Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.quantityPrice}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.brandingCost && (
                          <div className="info-row">
                            <span className="info-label">Branding/Custom Printing:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.brandingCost}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.shippingCost && (
                          <div className="info-row">
                            <span className="info-label">Transport Cost:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.shippingCost}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.insuranceCost && (
                          <div className="info-row">
                            <span className="info-label">Insurance Cost:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.insuranceCost}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.taxes && (
                          <div className="info-row">
                            <span className="info-label">Taxes:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.taxes}
                            </span>
                          </div>
                        )}
                        {selectedOrder.displayValues.subtotal && (
                          <div className="info-row">
                            <span className="info-label">Subtotal:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {selectedOrder.displayValues.subtotal}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedOrder.baseProductPrice > 0 && (
                          <div className="info-row">
                            <span className="info-label">Base Product Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.baseProductPrice)}
                              {selectedOrder.displayValues?.baseProductPrice?.includes('/') && 
                                `/${selectedOrder.displayValues.baseProductPrice.split('/')[1]}`}
                            </span>
                          </div>
                        )}
                        {selectedOrder.gradePrice > 0 && (
                          <div className="info-row">
                            <span className="info-label">Grade Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.gradePrice)}
                              {selectedOrder.displayValues?.gradePrice?.includes('/') && 
                                `/${selectedOrder.displayValues.gradePrice.split('/')[1]}`}
                            </span>
                          </div>
                        )}
                        {selectedOrder.packingPrice > 0 && (
                          <div className="info-row">
                            <span className="info-label">Packing Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.packingPrice)}
                              {selectedOrder.displayValues?.packingPrice?.includes('/') && 
                                `/${selectedOrder.displayValues.packingPrice.split('/')[1]}`}
                            </span>
                          </div>
                        )}
                        {selectedOrder.quantityPrice > 0 && (
                          <div className="info-row">
                            <span className="info-label">Quantity Price:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.quantityPrice)}
                            </span>
                          </div>
                        )}
                        {selectedOrder.brandingCost > 0 && (
                          <div className="info-row">
                            <span className="info-label">Branding/Custom Printing:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.brandingCost)}
                            </span>
                          </div>
                        )}
                        {(selectedOrder.shippingCost > 0 || selectedOrder.transportCost > 0) && (
                          <div className="info-row">
                            <span className="info-label">Transport Cost:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.shippingCost || selectedOrder.transportCost)}
                            </span>
                          </div>
                        )}
                        {selectedOrder.insuranceCost > 0 && (
                          <div className="info-row">
                            <span className="info-label">Insurance Cost:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.insuranceCost)}
                            </span>
                          </div>
                        )}
                        {selectedOrder.taxes > 0 && (
                          <div className="info-row">
                            <span className="info-label">Taxes:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.taxes)}
                            </span>
                          </div>
                        )}
                        {selectedOrder.subtotal > 0 && (
                          <div className="info-row">
                            <span className="info-label">Subtotal:</span>
                            <span className="info-value" style={{color: '#0A2347'}}>
                              {formatCurrency(selectedOrder.subtotal)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedOrder.additionalCharges > 0 && (
                      <div className="info-row">
                        <span className="info-label">Additional Charges:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {formatCurrency(selectedOrder.additionalCharges)}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.deliveryCharges > 0 && (
                      <div className="info-row">
                        <span className="info-label">Delivery Charges:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {formatCurrency(selectedOrder.deliveryCharges)}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.gst > 0 && (
                      <div className="info-row">
                        <span className="info-label">GST ({selectedOrder.gst}%):</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {formatCurrency(((selectedOrder.estimatedBill || 0) * selectedOrder.gst) / 100)}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.discount > 0 && (
                      <div className="info-row">
                        <span className="info-label">Discount:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          -{formatCurrency(selectedOrder.discount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="info-row total-row">
                      <span className="info-label">Final Total:</span>
                      <span className="info-value total-amount" style={{color: '#4ade80'}}>
                        {selectedOrder.displayValues?.finalTotal || 
                         (selectedOrder.finalTotal > 0 ? formatCurrency(selectedOrder.finalTotal) : 
                          selectedOrder.displayValues?.subtotal || 
                          formatCurrency(getFinalTotalValue(selectedOrder)))}
                      </span>
                    </div>
                    
                    {selectedOrder.paymentStatus && (
                      <div className="info-row">
                        <span className="info-label">Payment Status:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.paymentMethod && (
                      <div className="info-row">
                        <span className="info-label">Payment Method:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.remarks && (
                      <div className="info-row">
                        <span className="info-label">Remarks:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {selectedOrder.remarks}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Information */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiRefreshCw className="header-icon" />
                    <h3>Status Information</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-row">
                      <span className="info-label">Current Status:</span>
                      <div className="info-value">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Created:</span>
                      <span className="info-value" style={{color: '#0A2347'}}>
                        {formatDate(selectedOrder.createdAt)}
                      </span>
                    </div>
                    {selectedOrder.updatedAt && (
                      <div className="info-row">
                        <span className="info-label">Last Updated:</span>
                        <span className="info-value" style={{color: '#0A2347'}}>
                          {formatDate(selectedOrder.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary-blue"
                onClick={() => {
                  setSelectedOrder(null);
                  setEditingStatus(null);
                }}
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