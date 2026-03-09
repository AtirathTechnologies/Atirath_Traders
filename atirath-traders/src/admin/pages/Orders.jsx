import React, { useEffect, useState } from "react";
import { database, ref, onValue, update, logHistoryAction } from "../../firebase";
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
  FiDownload,
  FiShoppingCart
} from "react-icons/fi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState({ name: 'Admin', email: 'admin@system.com' }); // You should get this from auth context
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    processing: 0,
    hold: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    cartOrders: 0,
    singleOrders: 0
  });

  // Currency symbols mapping
  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'د.إ',
    'SAR': '﷼',
    'THB': '฿',
    'TRY': '₺',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
    'OMR': '﷼'
  };

  // Default product image
  const defaultProductImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60';

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
          revenue: 0,
          cartOrders: 0,
          singleOrders: 0
        });
        return;
      }

      const formatted = Object.keys(data).map((key) => {
        const orderData = data[key];
        
        // Handle cart orders (multiple products)
        const isCartOrder = orderData.isCartOrder === true || 
                           orderData.source === "cart_checkout" || 
                           (orderData.cartItems && orderData.cartItems.length > 0);
        
        // Parse cart items if they exist
        let cartItems = [];
        let productDisplay = "";
        let quantityDisplay = "";
        let finalTotal = 0;
        let orderCurrency = orderData.currency || "INR";
        
        if (isCartOrder && orderData.cartItems) {
          cartItems = Array.isArray(orderData.cartItems) ? orderData.cartItems : [];
          
          // Count total items and quantity
          const itemCount = cartItems.length;
          const totalQuantity = cartItems.reduce((sum, item) => {
            return sum + (parseInt(item.orderQuantity) || 1);
          }, 0);
          
          productDisplay = `${itemCount} items in cart`;
          quantityDisplay = `${totalQuantity} units`;
          
          // Calculate final total from cart - clean numeric value
          if (orderData.totalPrice) {
            finalTotal = parseFloat(orderData.totalPrice);
          } else if (orderData.priceBreakdown && orderData.priceBreakdown.finalTotalLine) {
            // Extract numeric value from string like "₹145.00" or "$145.00"
            const match = orderData.priceBreakdown.finalTotalLine.match(/[\d,]+\.?\d*/);
            if (match) {
              finalTotal = parseFloat(match[0].replace(/,/g, ''));
            }
          } else if (orderData.finalTotal) {
            finalTotal = parseFloat(orderData.finalTotal);
          }
        } else {
          // Single product order
          productDisplay = orderData.product || orderData.item || "No product";
          quantityDisplay = `${orderData.quantity || "1"} ${orderData.unit || orderData.actualUnit || ""}`;
          
          // Calculate final total for single product - clean numeric value
          if (orderData.totalPrice) {
            finalTotal = parseFloat(orderData.totalPrice);
          } else if (orderData.displayValues && orderData.displayValues.finalTotal) {
            // Extract numeric from "₹145.00" or "$145.00"
            const match = orderData.displayValues.finalTotal.match(/[\d,]+\.?\d*/);
            if (match) {
              finalTotal = parseFloat(match[0].replace(/,/g, ''));
            }
          } else if (orderData.priceBreakdown && orderData.priceBreakdown.finalTotalLine) {
            const match = orderData.priceBreakdown.finalTotalLine.match(/[\d,]+\.?\d*/);
            if (match) {
              finalTotal = parseFloat(match[0].replace(/,/g, ''));
            }
          } else if (orderData.finalTotal) {
            finalTotal = parseFloat(orderData.finalTotal);
          }
        }

        return {
          id: key,
          ...orderData,
          cartItems: cartItems,
          isCartOrder: isCartOrder,
          status: (orderData.status || "pending").toLowerCase(),
          name: orderData.name || orderData.customerName || "Unnamed Customer",
          email: orderData.email || orderData.customerEmail || "",
          phone: orderData.phone || orderData.customerPhone || "",
          product: productDisplay,
          productName: orderData.product || orderData.productName || "",
          quantity: quantityDisplay,
          actualQuantity: orderData.actualQuantity || 0,
          unit: orderData.unit || orderData.actualUnit || "",
          grade: orderData.grade || orderData.productGrade || "",
          packing: orderData.packing || orderData.packingType || "",
          state: orderData.state || orderData.deliveryState || "",
          city: orderData.city || "",
          country: orderData.country || "",
          pincode: orderData.pincode || "",
          cifRequired: orderData.cifRequired || orderData.cif || "",
          brandingRequired: orderData.brandingRequired || orderData.brandRequired || "",
          company: orderData.company || orderData.companyName || "",
          category: orderData.category || orderData.productType || "",
          createdAt: orderData.createdAt || orderData.date || orderData.timestamp || "",
          updatedAt: orderData.updatedAt || orderData.lastUpdated || "",
          brandingCost: parseFloat(orderData.brandingCost) || 0,
          shippingCost: parseFloat(orderData.shippingCost) || parseFloat(orderData.transportCost) || 0,
          transportCost: parseFloat(orderData.transportCost) || 0,
          insuranceCost: parseFloat(orderData.insuranceCost) || 0,
          taxes: parseFloat(orderData.taxes) || 0,
          subtotal: parseFloat(orderData.subtotal) || 0,
          finalTotal: finalTotal,
          totalPrice: parseFloat(orderData.totalPrice) || finalTotal,
          displayValues: orderData.displayValues || {},
          priceBreakdown: orderData.priceBreakdown || {},
          transportDetails: orderData.transportDetails || {},
          transportType: orderData.transportDetails?.transportType || orderData.transportType || "",
          currency: orderData.currency || "INR",
          paymentStatus: orderData.paymentStatus || "pending",
          paymentMethod: orderData.paymentMethod || "",
          remarks: orderData.remarks || "",
          additionalInfo: orderData.additionalInfo || "",
          source: orderData.source || "website",
          hasAutoFilled: orderData.hasAutoFilled || false,
          profileUsed: orderData.profileUsed || false,
          orderQuantity: orderData.orderQuantity || 1,
          productImage: orderData.productImage || orderData.image || defaultProductImage
        };
      });

      // Sort by date (newest first)
      formatted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      let cartOrders = 0;
      let singleOrders = 0;

      formatted.forEach(order => {
        const status = order.status;
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        } else {
          statusCounts.pending++;
        }
        
        if (order.isCartOrder) {
          cartOrders++;
        } else {
          singleOrders++;
        }
        
        if (status === 'completed' || status === 'delivered') {
          totalRevenue += order.finalTotal || 0;
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
        revenue: totalRevenue,
        cartOrders: cartOrders,
        singleOrders: singleOrders
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
          (order.id && order.id.toLowerCase().includes(searchString)) ||
          (order.company && order.company.toLowerCase().includes(searchString)) ||
          (order.city && order.city.toLowerCase().includes(searchString)) ||
          (order.country && order.country.toLowerCase().includes(searchString))
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
      
      // Get current order status before updating
      const currentOrder = orders.find(o => o.id === orderId);
      const oldStatus = currentOrder?.status || 'pending';

      await update(orderRef, {
        status: newStatus.toLowerCase(),
        updatedAt: new Date().toISOString(),
        updatedBy: "admin"
      });
      
      // Log to history
      await logHistoryAction({
        entity: 'order',
        entityId: orderId,
        action: 'status_change',
        changedBy: currentAdmin.name,
        userEmail: currentOrder?.email,
        details: `Changed order status from ${oldStatus} to ${newStatus}`,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus }
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
      
      setEditingStatus(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
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
        className = "status-processing";
        break;
      case "pending":
      case "new":
        className = "status-pending";
        break;
      case "hold":
        className = "status-hold";
        break;
      case "cancelled":
        className = "status-cancelled";
        break;
      default:
        className = "status-pending";
    }
    
    return (
      <span className={`status-badge ${className}`}>
        <span className="status-dot"></span>
        {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
      </span>
    );
  };

  const statusOptions = [
    { value: "pending", label: "Pending", icon: <FiClock />, color: "#ff9800" },
    { value: "processing", label: "Processing", icon: <FiRefreshCw />, color: "#2196f3" },
    { value: "hold", label: "On Hold", icon: <FiPause />, color: "#ff5722" },
    { value: "completed", label: "Completed", icon: <FiCheck />, color: "#4caf50" },
    { value: "cancelled", label: "Cancelled", icon: <FiXCircle />, color: "#f44336" }
  ];

  const formatCurrency = (amount, currency = "INR") => {
    if (!amount || isNaN(amount)) {
      const defaultSymbol = currencySymbols[currency] || currencySymbols['INR'];
      return defaultSymbol + "0";
    }
    
    const symbol = currencySymbols[currency] || currencySymbols['INR'];
    
    return symbol + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const extractCurrencySymbol = (value) => {
    if (!value) return "₹";
    if (value.includes('$')) return "$";
    if (value.includes('€')) return "€";
    if (value.includes('£')) return "£";
    if (value.includes('د.إ')) return "د.إ";
    if (value.includes('﷼')) return "﷼";
    if (value.includes('฿')) return "฿";
    if (value.includes('₺')) return "₺";
    if (value.includes('C$')) return "C$";
    if (value.includes('A$')) return "A$";
    if (value.includes('¥')) return "¥";
    return "₹";
  };

  const extractNumericValue = (value) => {
    if (!value) return 0;
    // Remove any currency symbols and commas, keep only numbers and decimal
    const cleanValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert("No orders to export!");
      return;
    }

    const csvContent = [
      ['Order ID', 'Type', 'Customer Name', 'Email', 'Phone', 'Products', 'Total Items', 'Quantity', 'Final Total', 'Currency', 'Status', 'Created Date', 'Country', 'City', 'Company', 'Transport Type', 'CIF', 'Branding'],
      ...orders.map(order => [
        order.id,
        order.isCartOrder ? 'Cart Order' : 'Single Product',
        order.name || '',
        order.email || '',
        order.phone || '',
        order.isCartOrder ? `${order.cartItems?.length || 0} items` : order.product,
        order.isCartOrder ? order.cartItems?.length || 0 : 1,
        order.quantity || '',
        order.finalTotal || 0,
        order.currency || 'INR',
        order.status,
        formatDate(order.createdAt),
        order.country || '',
        order.city || '',
        order.company || '',
        order.transportType || '',
        order.cifRequired || order.cif || '',
        order.brandingRequired || order.brandRequired || ''
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

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Function to get product image for single orders
  const getProductImageForSingleOrder = (order) => {
    if (order.productImage) return order.productImage;
    if (order.image) return order.image;
    if (order.displayValues?.productImage) return order.displayValues.productImage;
    return defaultProductImage;
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
              <div className="stat-value">{formatCurrency(stats.revenue, 'INR')}</div>
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

        <div className="stat-card cart-stat">
          <div className="stat-icon">
            <FiShoppingCart />
          </div>
          <div className="stat-content">
            <h3>{stats.cartOrders}</h3>
            <p>Cart Orders</p>
            <div className="stat-trend">Multiple products</div>
          </div>
        </div>

        <div className="stat-card single-stat">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.singleOrders}</h3>
            <p>Single Orders</p>
            <div className="stat-trend">Individual products</div>
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
              placeholder="Search orders by name, email, phone, product, location..."
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
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Final Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const currencySymbol = currencySymbols[order.currency] || currencySymbols['INR'];
                  
                  return (
                    <React.Fragment key={order.id}>
                      <tr className={`order-row ${isExpanded ? 'expanded' : ''}`}>
                        <td className="order-id">
                          <div className="order-id-display">
                            <span className="id-prefix">#</span>
                            <span className="id-value">{order.id.slice(0, 8)}...</span>
                          </div>
                        </td>
                        <td>
                          <div className="order-type-badge">
                            {order.isCartOrder ? (
                              <span className="cart-badge">
                                <FiShoppingCart size={12} /> Cart
                              </span>
                            ) : (
                              <span className="single-badge">
                                <FiPackage size={12} /> Single
                              </span>
                            )}
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
                              {order.isCartOrder ? (
                                <>
                                  {order.cartItems?.length || 0} items in cart
                                  <button 
                                    className="view-items-btn"
                                    onClick={() => toggleOrderExpand(order.id)}
                                  >
                                    {isExpanded ? 'Hide' : 'View'} Items
                                  </button>
                                </>
                              ) : (
                                order.product
                              )}
                            </span>
                            {order.category && <span className="product-category">{order.category}</span>}
                          </div>
                        </td>
                        <td className="quantity-cell">
                          <div className="quantity-display">
                            {order.isCartOrder ? (
                              <div className="quantity-value">
                                {order.cartItems?.reduce((sum, item) => 
                                  sum + (parseInt(item.orderQuantity) || 1), 0
                                )} units
                              </div>
                            ) : (
                              <div className="quantity-value">
                                {order.quantity}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="value-cell">
                          <div className="value-display final-value">
                            {formatCurrency(order.finalTotal, order.currency)}
                          </div>
                        </td>
                        <td>
                          {editingStatus === order.id ? (
                            <div className="status-edit">
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
                      {isExpanded && order.isCartOrder && order.cartItems && order.cartItems.length > 0 && (
                        <tr className="expanded-items-row">
                          <td colSpan="9">
                            <div className="expanded-items-container">
                              <h4>Cart Items ({order.cartItems.length})</h4>
                              <div className="cart-items-list">
                                {order.cartItems.map((item, index) => {
                                  // Get item price in proper currency
                                  let itemPrice = 0;
                                  if (item.priceDisplay) {
                                    itemPrice = extractNumericValue(item.priceDisplay);
                                  }
                                  
                                  return (
                                    <div key={index} className="cart-item-detail">
                                      <div className="cart-item-header">
                                        <strong>{item.name || item.productName || `Product ${index + 1}`}</strong>
                                        {item.brandName && <span className="item-brand">{item.brandName}</span>}
                                      </div>
                                      <div className="cart-item-details">
                                        {item.grade && <span>Grade: {item.grade}</span>}
                                        {item.packing && <span>Packing: {item.packing}</span>}
                                        <span>Qty: {item.orderQuantity || 1} × {item.quantityDisplay || item.selectedQuantity || '1'}</span>
                                        {item.priceDisplay && (
                                          <span>Price: {item.priceDisplay}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          setExpandedOrder(null);
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
                  <span className="order-id-value">{selectedOrder.id}</span>
                </div>
                {selectedOrder.isCartOrder && (
                  <div className="order-type-tag">
                    <FiShoppingCart /> Cart Order ({selectedOrder.cartItems?.length || 0} items)
                  </div>
                )}
                {!selectedOrder.isCartOrder && (
                  <div className="order-type-tag single">
                    <FiPackage /> Single Product Order
                  </div>
                )}
              </div>
              <button 
                className="modal-close-blue"
                onClick={() => {
                  setSelectedOrder(null);
                  setEditingStatus(null);
                  setExpandedOrder(null);
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
                      <span className="info-value">{selectedOrder.name || "N/A"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedOrder.email || "N/A"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{selectedOrder.phone || "N/A"}</span>
                    </div>
                    {selectedOrder.country && (
                      <div className="info-row">
                        <span className="info-label">Country:</span>
                        <span className="info-value">{selectedOrder.country}</span>
                      </div>
                    )}
                    {selectedOrder.state && (
                      <div className="info-row">
                        <span className="info-label">State:</span>
                        <span className="info-value">{selectedOrder.state}</span>
                      </div>
                    )}
                    {selectedOrder.city && (
                      <div className="info-row">
                        <span className="info-label">City:</span>
                        <span className="info-value">{selectedOrder.city}</span>
                      </div>
                    )}
                    {selectedOrder.pincode && (
                      <div className="info-row">
                        <span className="info-label">Pincode:</span>
                        <span className="info-value">{selectedOrder.pincode}</span>
                      </div>
                    )}
                    {selectedOrder.company && (
                      <div className="info-row">
                        <span className="info-label">Company:</span>
                        <span className="info-value">{selectedOrder.company}</span>
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
                      <span className="info-label">Order Type:</span>
                      <span className="info-value">
                        {selectedOrder.isCartOrder ? (
                          <span className="cart-badge">Cart Order ({selectedOrder.cartItems?.length || 0} items)</span>
                        ) : (
                          <span className="single-badge">Single Product</span>
                        )}
                      </span>
                    </div>
                    
                    {!selectedOrder.isCartOrder && (
                      <>
                        <div className="info-row">
                          <span className="info-label">Product:</span>
                          <span className="info-value">{selectedOrder.productName || selectedOrder.product}</span>
                        </div>
                        {selectedOrder.grade && (
                          <div className="info-row">
                            <span className="info-label">Grade:</span>
                            <span className="info-value">{selectedOrder.grade}</span>
                          </div>
                        )}
                        {selectedOrder.packing && (
                          <div className="info-row">
                            <span className="info-label">Packing:</span>
                            <span className="info-value">{selectedOrder.packing}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedOrder.transportType && (
                      <div className="info-row">
                        <span className="info-label">Transport Type:</span>
                        <span className="info-value">
                          {selectedOrder.transportType === 'road' ? '🚛 Road' :
                           selectedOrder.transportType === 'air' ? '✈️ Air' :
                           selectedOrder.transportType === 'ocean' ? '🚢 Ocean' : selectedOrder.transportType}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.transportDetails && (
                      <>
                        {selectedOrder.transportType === 'road' && (
                          <>
                            {selectedOrder.transportDetails.pickupLocation && (
                              <div className="info-row">
                                <span className="info-label">Pickup:</span>
                                <span className="info-value">
                                  {selectedOrder.transportDetails.pickupLocation.city}, 
                                  {selectedOrder.transportDetails.pickupLocation.state}, 
                                  {selectedOrder.transportDetails.pickupLocation.country}
                                </span>
                              </div>
                            )}
                            {selectedOrder.transportDetails.deliveryLocation && (
                              <div className="info-row">
                                <span className="info-label">Delivery:</span>
                                <span className="info-value">
                                  {selectedOrder.transportDetails.deliveryLocation.city}, 
                                  {selectedOrder.transportDetails.deliveryLocation.state}, 
                                  {selectedOrder.transportDetails.deliveryLocation.country}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {selectedOrder.transportType === 'air' && (
                          <>
                            {selectedOrder.transportDetails.airportOfLoading && (
                              <div className="info-row">
                                <span className="info-label">Loading Airport:</span>
                                <span className="info-value">
                                  {selectedOrder.transportDetails.airportOfLoading.airportName}, 
                                  {selectedOrder.transportDetails.airportOfLoading.country}
                                </span>
                              </div>
                            )}
                            {selectedOrder.transportDetails.airportOfDestination && (
                              <div className="info-row">
                                <span className="info-label">Destination Airport:</span>
                                <span className="info-value">
                                  {selectedOrder.transportDetails.airportOfDestination.airportName}, 
                                  {selectedOrder.transportDetails.airportOfDestination.country}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {selectedOrder.transportType === 'ocean' && (
                          <>
                            {selectedOrder.transportDetails.portOfLoading && (
                              <div className="info-row">
                                <span className="info-label">Loading Port:</span>
                                <span className="info-value">
                                  {selectedOrder.transportDetails.portOfLoading.portName}, 
                                  {selectedOrder.transportDetails.portOfLoading.state}, 
                                  {selectedOrder.transportDetails.portOfLoading.country}
                                </span>
                              </div>
                            )}
                            {selectedOrder.transportDetails.portOfDestination && (
                              <div className="info-row">
                                <span className="info-label">Destination Port:</span>
                                <span className="info-value">
                                  {selectedOrder.transportDetails.portOfDestination.portName}, 
                                  {selectedOrder.transportDetails.portOfDestination.state}, 
                                  {selectedOrder.transportDetails.portOfDestination.country}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                    
                    <div className="info-row">
                      <span className="info-label">CIF Required:</span>
                      <span className="info-value">{selectedOrder.cifRequired || selectedOrder.cif || "No"}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="info-label">Brand Required:</span>
                      <span className="info-value">{selectedOrder.brandingRequired || selectedOrder.brandRequired || "No"}</span>
                    </div>
                    
                    {selectedOrder.additionalInfo && (
                      <div className="info-row">
                        <span className="info-label">Additional Info:</span>
                        <span className="info-value">{selectedOrder.additionalInfo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details with Image - For Single Product Orders */}
                {!selectedOrder.isCartOrder && (
                  <div className="info-card full-width">
                    <div className="info-card-header">
                      <FiPackage className="header-icon" />
                      <h3>Product Details</h3>
                    </div>
                    <div className="info-card-body">
                      <div className="product-detail-card">
                        <div className="product-detail-image">
                          <img 
                            src={getProductImageForSingleOrder(selectedOrder)} 
                            alt={selectedOrder.productName || selectedOrder.product}
                            onError={(e) => {
                              e.target.src = defaultProductImage;
                            }}
                          />
                        </div>
                        <div className="product-detail-content">
                          <h4 className="product-detail-name">{selectedOrder.productName || selectedOrder.product}</h4>
                          {selectedOrder.company && (
                            <div className="product-detail-company">{selectedOrder.company}</div>
                          )}
                          {selectedOrder.brandName && selectedOrder.brandName !== 'General' && (
                            <div className="product-detail-brand">Brand: {selectedOrder.brandName}</div>
                          )}
                          <div className="product-detail-specs">
                            {selectedOrder.grade && (
                              <div className="spec-item">
                                <span className="spec-label">Grade:</span>
                                <span className="spec-value">{selectedOrder.grade}</span>
                              </div>
                            )}
                            {selectedOrder.packing && (
                              <div className="spec-item">
                                <span className="spec-label">Packing:</span>
                                <span className="spec-value">{selectedOrder.packing}</span>
                              </div>
                            )}
                            <div className="spec-item">
                              <span className="spec-label">Quantity:</span>
                              <span className="spec-value">{selectedOrder.quantity}</span>
                            </div>
                            {selectedOrder.orderQuantity && (
                              <div className="spec-item">
                                <span className="spec-label">Order Qty:</span>
                                <span className="spec-value">{selectedOrder.orderQuantity}</span>
                              </div>
                            )}
                            <div className="spec-item">
                              <span className="spec-label">Price:</span>
                              <span className="spec-value price">
                                {formatCurrency(selectedOrder.finalTotal, selectedOrder.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart Items (if cart order) */}
                {selectedOrder.isCartOrder && selectedOrder.cartItems && selectedOrder.cartItems.length > 0 && (
                  <div className="info-card full-width">
                    <div className="info-card-header">
                      <FiShoppingCart className="header-icon" />
                      <h3>Cart Items ({selectedOrder.cartItems.length})</h3>
                    </div>
                    <div className="info-card-body">
                      <div className="cart-items-grid">
                        {selectedOrder.cartItems.map((item, index) => {
                          const itemCurrency = extractCurrencySymbol(item.priceDisplay);
                          const itemPrice = extractNumericValue(item.priceDisplay);
                          
                          return (
                            <div key={index} className="cart-item-detail-card">
                              <div className="cart-item-image">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    onError={(e) => {
                                      e.target.src = defaultProductImage;
                                    }}
                                  />
                                )}
                              </div>
                              <div className="cart-item-content">
                                <h5>{item.name || item.productName}</h5>
                                <div className="cart-item-meta">
                                  {item.brandName && <span className="meta-brand">{item.brandName}</span>}
                                  {item.companyName && <span className="meta-company">{item.companyName}</span>}
                                </div>
                                <div className="cart-item-specs">
                                  {item.grade && <span className="spec">Grade: {item.grade}</span>}
                                  {item.packing && <span className="spec">Packing: {item.packing}</span>}
                                  {item.quantityDisplay && <span className="spec">Qty/Unit: {item.quantityDisplay}</span>}
                                  <span className="spec">Order Qty: {item.orderQuantity || 1}</span>
                                </div>
                                {item.priceDisplay && (
                                  <div className="cart-item-price">
                                    Price: {item.priceDisplay}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="info-card">
                  <div className="info-card-header">
                    <FiDollarSign className="header-icon" />
                    <h3>Price Breakdown</h3>
                  </div>
                  <div className="info-card-body">
                    {selectedOrder.priceBreakdown && (
                      <>
                        {selectedOrder.priceBreakdown.originalPrice && (
                          <div className="info-row">
                            <span className="info-label">Original Price:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.originalPrice}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.itemCount && (
                          <div className="info-row">
                            <span className="info-label">Items:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.itemCount}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.totalQuantity && (
                          <div className="info-row">
                            <span className="info-label">Total Quantity:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.totalQuantity}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.transportTypeLine && (
                          <div className="info-row">
                            <span className="info-label">Transport:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.transportTypeLine}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.transportCostLine && (
                          <div className="info-row">
                            <span className="info-label">Transport Cost:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.transportCostLine}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.brandingCostLine && (
                          <div className="info-row">
                            <span className="info-label">Branding:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.brandingCostLine}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.shippingCostLine && (
                          <div className="info-row">
                            <span className="info-label">Shipping:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.shippingCostLine}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.insuranceCostLine && (
                          <div className="info-row">
                            <span className="info-label">Insurance:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.insuranceCostLine}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.taxesLine && (
                          <div className="info-row">
                            <span className="info-label">Taxes:</span>
                            <span className="info-value">{selectedOrder.priceBreakdown.taxesLine}</span>
                          </div>
                        )}
                        {selectedOrder.priceBreakdown.finalTotalLine && (
                          <div className="info-row total-row">
                            <span className="info-label">Final Total:</span>
                            <span className="info-value total-amount">
                              {selectedOrder.priceBreakdown.finalTotalLine}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {!selectedOrder.priceBreakdown && (
                      <>
                        {selectedOrder.brandingCost > 0 && (
                          <div className="info-row">
                            <span className="info-label">Branding Cost:</span>
                            <span className="info-value">{formatCurrency(selectedOrder.brandingCost, selectedOrder.currency)}</span>
                          </div>
                        )}
                        {selectedOrder.transportCost > 0 && (
                          <div className="info-row">
                            <span className="info-label">Transport Cost:</span>
                            <span className="info-value">{formatCurrency(selectedOrder.transportCost, selectedOrder.currency)}</span>
                          </div>
                        )}
                        {selectedOrder.shippingCost > 0 && (
                          <div className="info-row">
                            <span className="info-label">Shipping Cost:</span>
                            <span className="info-value">{formatCurrency(selectedOrder.shippingCost, selectedOrder.currency)}</span>
                          </div>
                        )}
                        {selectedOrder.insuranceCost > 0 && (
                          <div className="info-row">
                            <span className="info-label">Insurance Cost:</span>
                            <span className="info-value">{formatCurrency(selectedOrder.insuranceCost, selectedOrder.currency)}</span>
                          </div>
                        )}
                        {selectedOrder.taxes > 0 && (
                          <div className="info-row">
                            <span className="info-label">Taxes:</span>
                            <span className="info-value">{formatCurrency(selectedOrder.taxes, selectedOrder.currency)}</span>
                          </div>
                        )}
                        {selectedOrder.subtotal > 0 && (
                          <div className="info-row">
                            <span className="info-label">Subtotal:</span>
                            <span className="info-value">{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="info-row total-row">
                      <span className="info-label">Final Total:</span>
                      <span className="info-value total-amount">
                        {formatCurrency(selectedOrder.finalTotal, selectedOrder.currency)}
                      </span>
                    </div>
                    
                    <div className="info-row">
                      <span className="info-label">Currency:</span>
                      <span className="info-value">{selectedOrder.currency || "INR"}</span>
                    </div>
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
                      <span className="info-value">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.updatedAt && (
                      <div className="info-row">
                        <span className="info-label">Last Updated:</span>
                        <span className="info-value">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Source:</span>
                      <span className="info-value">{selectedOrder.source || "website"}</span>
                    </div>
                    {selectedOrder.hasAutoFilled && (
                      <div className="info-row">
                        <span className="info-label">Auto-filled:</span>
                        <span className="info-value">Yes {selectedOrder.profileUsed ? '(from profile)' : ''}</span>
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
                  setExpandedOrder(null);
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