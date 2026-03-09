import React, { useState, useEffect } from 'react';
import { database, ref, onValue, get, getCurrencySymbols } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  FiPackage,
  FiShoppingBag,
  FiClock,
  FiCheck,
  FiXCircle,
  FiPause,
  FiRefreshCw,
  FiEye,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiTruck,
  FiDollarSign,
  FiDownload,
  FiArrowLeft,
  FiShoppingCart,
  FiAlertCircle
} from 'react-icons/fi';

const MyOrders = ({ user, isAuthenticated }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currencySymbols, setCurrencySymbols] = useState({});
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const [error, setError] = useState(null);

  // Default product image
  const defaultProductImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60';

  // Fetch currency symbols from Firebase
  useEffect(() => {
    const fetchCurrencySymbols = async () => {
      try {
        setLoadingSymbols(true);
        console.log('💰 Fetching currency symbols from Firebase...');
        
        const symbols = await getCurrencySymbols();
        
        if (symbols && Object.keys(symbols).length > 0) {
          console.log('✅ Currency symbols loaded:', symbols);
          setCurrencySymbols(symbols);
        } else {
          console.warn('⚠️ No currency symbols found');
          setCurrencySymbols({});
        }
      } catch (error) {
        console.error('❌ Error fetching currency symbols:', error);
        setCurrencySymbols({});
      } finally {
        setLoadingSymbols(false);
      }
    };

    fetchCurrencySymbols();
  }, []);

  // Fetch orders based on auth state
  useEffect(() => {
    console.log('🔄 MyOrders useEffect - Auth state:', { isAuthenticated, user });
    
    setLoading(true);
    setError(null);
    
    const quotesRef = ref(database, "quotes");

    const unsubscribe = onValue(quotesRef, (snapshot) => {
      const data = snapshot.val();
      setLoading(false);
      
      if (!data) {
        console.log('📭 No orders found in database');
        setOrders([]);
        return;
      }

      console.log('📦 Fetching orders from Firebase...');

      // Filter orders based on authentication state
      let userOrders = [];
      
      if (isAuthenticated && user) {
        // Signed-in user: filter by userId or email
        console.log('👤 Filtering orders for signed-in user:', user.uid, user.email);
        
        userOrders = Object.keys(data)
          .map(key => {
            const orderData = data[key];
            
            const isUserOrder = 
              orderData.userId === user?.uid || 
              orderData.email === user?.email ||
              orderData.userEmail === user?.email ||
              orderData.name === user?.name;

            if (!isUserOrder) return null;

            return formatOrderData(key, orderData);
          })
          .filter(order => order !== null);
      } else {
        // Guest user: show all orders (or filter by session in production)
        console.log('👤 Guest user - showing sample/demo orders');
        
        // For demo purposes, show last 5 orders
        // In production, you'd filter by guest session ID
        userOrders = Object.keys(data)
          .slice(-5) // Last 5 orders for demo
          .map(key => formatOrderData(key, data[key]));
      }

      // Sort by date (newest first)
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log(`✅ Found ${userOrders.length} orders for user`);
      setOrders(userOrders);
    }, (error) => {
      console.error('❌ Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // Format order data helper function
  const formatOrderData = (key, orderData) => {
    // Determine if cart order
    const isCartOrder = orderData.isCartOrder === true || 
                       orderData.source === "cart_checkout" || 
                       (orderData.cartItems && orderData.cartItems.length > 0);

    // Parse cart items
    let cartItems = [];
    if (isCartOrder && orderData.cartItems) {
      cartItems = Array.isArray(orderData.cartItems) ? orderData.cartItems : [];
    }

    // Calculate final total
    let finalTotal = 0;
    if (orderData.totalPrice) {
      finalTotal = parseFloat(orderData.totalPrice);
    } else if (orderData.finalTotal) {
      finalTotal = parseFloat(orderData.finalTotal);
    } else if (orderData.priceBreakdown?.finalTotalLine) {
      const match = orderData.priceBreakdown.finalTotalLine.match(/[\d,]+\.?\d*/);
      if (match) {
        finalTotal = parseFloat(match[0].replace(/,/g, ''));
      }
    }

    return {
      id: key,
      ...orderData,
      cartItems,
      isCartOrder,
      status: (orderData.status || "pending").toLowerCase(),
      name: orderData.name || orderData.customerName || "Customer",
      email: orderData.email || orderData.customerEmail || "",
      phone: orderData.phone || orderData.customerPhone || "",
      product: isCartOrder ? `${cartItems.length} items` : (orderData.product || "Product"),
      productName: orderData.product || orderData.productName || "",
      quantity: orderData.quantity || `${orderData.actualQuantity || 1} ${orderData.unit || ''}`,
      finalTotal: finalTotal,
      currency: orderData.currency || "INR",
      createdAt: orderData.createdAt || orderData.date || orderData.timestamp || "",
      transportType: orderData.transportDetails?.transportType || orderData.transportType || "",
      transportDetails: orderData.transportDetails || {},
      productImage: orderData.productImage || orderData.image || defaultProductImage
    };
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
    let icon = null;
    
    switch(statusLower) {
      case "completed":
      case "delivered":
        className = "status-completed";
        icon = <FiCheck />;
        break;
      case "processing":
      case "confirmed":
        className = "status-processing";
        icon = <FiRefreshCw />;
        break;
      case "pending":
      case "new":
        className = "status-pending";
        icon = <FiClock />;
        break;
      case "hold":
        className = "status-hold";
        icon = <FiPause />;
        break;
      case "cancelled":
        className = "status-cancelled";
        icon = <FiXCircle />;
        break;
      default:
        className = "status-pending";
        icon = <FiClock />;
    }
    
    return (
      <span className={`status-badge ${className}`}>
        {icon}
        {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
      </span>
    );
  };

  const getCurrencySymbol = (currencyCode) => {
    if (!currencyCode) return '';
    const symbol = currencySymbols[currencyCode];
    if (symbol) {
      return symbol;
    }
    console.warn(`⚠️ Currency symbol not found for: ${currencyCode}`);
    return '';
  };

  const formatCurrency = (amount, currency = "INR") => {
    if (!amount || isNaN(amount)) {
      const symbol = getCurrencySymbol(currency);
      return symbol + "0";
    }
    
    const symbol = getCurrencySymbol(currency);
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return symbol + formattedAmount;
  };

  const getProductImageForOrder = (order) => {
    if (order.isCartOrder && order.cartItems && order.cartItems.length > 0) {
      const firstItem = order.cartItems[0];
      return firstItem?.image || firstItem?.productImage || defaultProductImage;
    }
    return order.productImage || order.image || defaultProductImage;
  };

  const getOrderSummary = (order) => {
    if (order.isCartOrder) {
      const items = order.cartItems || [];
      const totalItems = items.length;
      const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.orderQuantity) || 1), 0);
      return {
        main: `${totalItems} items`,
        detail: `${totalQuantity} units total`
      };
    } else {
      return {
        main: order.productName || order.product || "Product",
        detail: order.quantity || "1 unit"
      };
    }
  };

  const handleSignInPrompt = () => {
    navigate('/');
    // You can trigger sign-in modal here if needed
  };

  if (loadingSymbols || loading) {
    return (
      <div className="myorders-container">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myorders-container">
        <div className="error-state">
          <FiAlertCircle size={48} />
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="myorders-container">
      {/* Header */}
      <div className="myorders-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Home
        </button>
        <div className="header-content">
          <h1>
            <FiShoppingBag className="title-icon" />
            My Orders
          </h1>
          <p>
            {isAuthenticated 
              ? "Track and manage all your orders" 
              : "View your recent orders"}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="myorders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={48} />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          orders.map(order => {
            const summary = getOrderSummary(order);
            const isExpanded = selectedOrder?.id === order.id;
            
            return (
              <div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                {/* Order Header */}
                <div className="order-header" onClick={() => setSelectedOrder(isExpanded ? null : order)}>
                  <div className="order-type-badge">
                    {order.isCartOrder ? (
                      <span className="cart-badge">
                        <FiShoppingCart /> Cart
                      </span>
                    ) : (
                      <span className="single-badge">
                        <FiPackage /> Single
                      </span>
                    )}
                  </div>
                  
                  <div className="order-main-info">
                    <div className="order-id">
                      <span className="id-label">Order #</span>
                      <span className="id-value">{order.id.slice(0, 8)}</span>
                    </div>
                    <div className="order-product">
                      <img 
                        src={getProductImageForOrder(order)} 
                        alt="Product"
                        className="order-thumbnail"
                        onError={(e) => e.target.src = defaultProductImage}
                      />
                      <div className="order-product-details">
                        <span className="product-name">{summary.main}</span>
                        <span className="product-quantity">{summary.detail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-status-info">
                    {getStatusBadge(order.status)}
                    <span className="order-date">
                      <FiCalendar />
                      {formatDate(order.createdAt).split(',')[0]}
                    </span>
                  </div>

                  <div className="order-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">
                      {formatCurrency(order.finalTotal, order.currency)}
                    </span>
                  </div>

                  <button className="expand-btn">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>

                {/* Expanded Details - Black Text for Content Sections */}
                {isExpanded && (
                  <div className="order-details">
                    {/* Customer Information */}
                    <div className="details-section">
                      <h4>
                        <FiUser />
                        Customer Information
                      </h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="label">Name:</span>
                          <span className="value black-text">{order.name || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Email:</span>
                          <span className="value black-text">{order.email || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Phone:</span>
                          <span className="value black-text">{order.phone || 'N/A'}</span>
                        </div>
                        {order.country && (
                          <div className="detail-item">
                            <span className="label">Location:</span>
                            <span className="value black-text">
                              {order.city || ''}, {order.state || ''}, {order.country || ''} {order.pincode ? `- ${order.pincode}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="details-section">
                      <h4>
                        <FiShoppingBag />
                        Order Details
                      </h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="label">Order ID:</span>
                          <span className="value order-id-full black-text">{order.id}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Order Type:</span>
                          <span className="value black-text">
                            {order.isCartOrder ? 'Cart Order' : 'Single Product'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Placed on:</span>
                          <span className="value black-text">{formatDate(order.createdAt)}</span>
                        </div>
                        {order.transportType && (
                          <div className="detail-item">
                            <span className="label">Transport:</span>
                            <span className="value transport-type black-text">
                              <FiTruck />
                              {order.transportType === 'road' ? 'Road' :
                               order.transportType === 'air' ? 'Air Freight' :
                               order.transportType === 'ocean' ? 'Ocean Freight' : order.transportType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="details-section">
                      <h4>
                        <FiPackage />
                        Products
                      </h4>
                      
                      {order.isCartOrder ? (
                        <div className="cart-items-list">
                          {order.cartItems && order.cartItems.map((item, idx) => (
                            <div key={idx} className="cart-item">
                              <img 
                                src={item.image || item.productImage || defaultProductImage}
                                alt={item.name}
                                className="item-image"
                                onError={(e) => e.target.src = defaultProductImage}
                              />
                              <div className="item-details">
                                <span className="item-name black-text">{item.name || item.productName}</span>
                                {item.brandName && (
                                  <span className="item-brand black-text">{item.brandName}</span>
                                )}
                                <div className="item-specs">
                                  {item.grade && <span className="black-text">Grade: {item.grade}</span>}
                                  {item.packing && <span className="black-text">Packing: {item.packing}</span>}
                                  <span className="black-text">Qty: {item.orderQuantity || 1} × {item.quantityDisplay || item.selectedQuantity || '1'}</span>
                                </div>
                                {item.priceDisplay && (
                                  <span className="item-price black-text">{item.priceDisplay}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="single-product-detail">
                          <img 
                            src={order.productImage || defaultProductImage}
                            alt={order.productName}
                            className="product-image-large"
                            onError={(e) => e.target.src = defaultProductImage}
                          />
                          <div className="product-details">
                            <h5 className="black-text">{order.productName || order.product}</h5>
                            {order.company && <span className="company black-text">{order.company}</span>}
                            <div className="product-specs">
                              {order.grade && <span className="black-text">Grade: {order.grade}</span>}
                              {order.packing && <span className="black-text">Packing: {order.packing}</span>}
                              <span className="black-text">Quantity: {order.quantity}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="details-section">
                      <h4>
                        <FiDollarSign />
                        Price Breakdown
                      </h4>
                      <div className="price-breakdown">
                        {order.priceBreakdown ? (
                          <>
                            {order.priceBreakdown.originalPrice && (
                              <div className="price-row">
                                <span className="black-text">Original Price:</span>
                                <span className="black-text">{order.priceBreakdown.originalPrice}</span>
                              </div>
                            )}
                            {order.priceBreakdown.transportCostLine && (
                              <div className="price-row">
                                <span className="black-text">Transport Cost:</span>
                                <span className="black-text">{order.priceBreakdown.transportCostLine}</span>
                              </div>
                            )}
                            {order.priceBreakdown.brandingCostLine && (
                              <div className="price-row">
                                <span className="black-text">Branding:</span>
                                <span className="black-text">{order.priceBreakdown.brandingCostLine}</span>
                              </div>
                            )}
                            {order.priceBreakdown.shippingCostLine && (
                              <div className="price-row">
                                <span className="black-text">Shipping:</span>
                                <span className="black-text">{order.priceBreakdown.shippingCostLine}</span>
                              </div>
                            )}
                            {order.priceBreakdown.insuranceCostLine && (
                              <div className="price-row">
                                <span className="black-text">Insurance:</span>
                                <span className="black-text">{order.priceBreakdown.insuranceCostLine}</span>
                              </div>
                            )}
                            {order.priceBreakdown.taxesLine && (
                              <div className="price-row">
                                <span className="black-text">Taxes:</span>
                                <span className="black-text">{order.priceBreakdown.taxesLine}</span>
                              </div>
                            )}
                            <div className="price-row total">
                              <span className="black-text">Final Total:</span>
                              <span className="black-text">{order.priceBreakdown.finalTotalLine}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="price-row">
                              <span className="black-text">Subtotal:</span>
                              <span className="black-text">{formatCurrency(order.subtotal || 0, order.currency)}</span>
                            </div>
                            {order.transportCost > 0 && (
                              <div className="price-row">
                                <span className="black-text">Transport:</span>
                                <span className="black-text">{formatCurrency(order.transportCost, order.currency)}</span>
                              </div>
                            )}
                            {order.brandingCost > 0 && (
                              <div className="price-row">
                                <span className="black-text">Branding:</span>
                                <span className="black-text">{formatCurrency(order.brandingCost, order.currency)}</span>
                              </div>
                            )}
                            {order.shippingCost > 0 && (
                              <div className="price-row">
                                <span className="black-text">Shipping:</span>
                                <span className="black-text">{formatCurrency(order.shippingCost, order.currency)}</span>
                              </div>
                            )}
                            {order.insuranceCost > 0 && (
                              <div className="price-row">
                                <span className="black-text">Insurance:</span>
                                <span className="black-text">{formatCurrency(order.insuranceCost, order.currency)}</span>
                              </div>
                            )}
                            {order.taxes > 0 && (
                              <div className="price-row">
                                <span className="black-text">Taxes:</span>
                                <span className="black-text">{formatCurrency(order.taxes, order.currency)}</span>
                              </div>
                            )}
                            <div className="price-row total">
                              <span className="black-text">Final Total:</span>
                              <span className="black-text">{formatCurrency(order.finalTotal, order.currency)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    {order.additionalInfo && (
                      <div className="details-section">
                        <h4>Additional Information</h4>
                        <p className="additional-info black-text">{order.additionalInfo}</p>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="details-section">
                      <h4>Order Timeline</h4>
                      <div className="timeline">
                        <div className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <span className="timeline-date black-text">{formatDate(order.createdAt)}</span>
                            <span className="timeline-title black-text">Order Placed</span>
                            <span className="timeline-status">{getStatusBadge('pending')}</span>
                          </div>
                        </div>
                        
                        {['processing', 'confirmed'].includes(order.status) && (
                          <div className="timeline-item active">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <span className="timeline-date black-text">Current</span>
                              <span className="timeline-title black-text">Processing</span>
                              <span className="timeline-status">{getStatusBadge('processing')}</span>
                            </div>
                          </div>
                        )}

                        {order.status === 'completed' && (
                          <>
                            <div className="timeline-item completed">
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <span className="timeline-date black-text">{formatDate(order.updatedAt || order.createdAt)}</span>
                                <span className="timeline-title black-text">Completed</span>
                                <span className="timeline-status">{getStatusBadge('completed')}</span>
                              </div>
                            </div>
                          </>
                        )}

                        {order.status === 'cancelled' && (
                          <div className="timeline-item cancelled">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <span className="timeline-date black-text">{formatDate(order.updatedAt || order.createdAt)}</span>
                              <span className="timeline-title black-text">Cancelled</span>
                              <span className="timeline-status">{getStatusBadge('cancelled')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .myorders-container {
          max-width: 1200px;
          margin: 80px auto 40px;
          padding: 20px;
          min-height: calc(100vh - 120px);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #1a1a1a;
          color: #ffffff;
        }

        .myorders-header {
          margin-bottom: 30px;
          position: relative;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #8FB3E2;
          color: #8FB3E2;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 20px;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(143, 179, 226, 0.2);
        }

        .header-content {
          text-align: center;
        }

        .header-content h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #8FB3E2;
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .header-content p {
          color: #aaa;
          font-size: 1.1rem;
        }

        .myorders-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .order-card {
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid rgba(143, 179, 226, 0.2);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .order-card:hover {
          border-color: #8FB3E2;
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4);
        }

        .order-header {
          display: grid;
          grid-template-columns: auto 1fr auto auto auto;
          align-items: center;
          gap: 20px;
          padding: 20px;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(143, 179, 226, 0.2);
        }

        .order-type-badge {
          min-width: 80px;
        }

        .cart-badge, .single-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .cart-badge {
          background: rgba(143, 179, 226, 0.2);
          color: #8FB3E2;
        }

        .single-badge {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .order-main-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .order-id {
          min-width: 120px;
        }

        .id-label {
          color: #aaa;
          font-size: 0.8rem;
          display: block;
        }

        .id-value {
          color: #ffffff;
          font-weight: 600;
          font-family: monospace;
          font-size: 1rem;
        }

        .order-product {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .order-thumbnail {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid rgba(143, 179, 226, 0.3);
        }

        .order-product-details {
          display: flex;
          flex-direction: column;
        }

        .product-name {
          color: #ffffff;
          font-weight: 500;
        }

        .product-quantity {
          color: #aaa;
          font-size: 0.8rem;
        }

        .order-status-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
        }

        .order-date {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #aaa;
          font-size: 0.8rem;
        }

        .order-total {
          text-align: right;
          min-width: 120px;
        }

        .total-label {
          display: block;
          color: #aaa;
          font-size: 0.8rem;
        }

        .total-value {
          color: #8FB3E2;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .expand-btn {
          background: transparent;
          border: none;
          color: #8FB3E2;
          font-size: 1.2rem;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .expand-btn:hover {
          transform: scale(1.1);
        }

        .order-details {
          padding: 30px;
          background: rgba(0, 0, 0, 0.5);
        }

        .details-section {
          margin-bottom: 30px;
        }

        .details-section h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #8FB3E2;
          font-size: 1.1rem;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid rgba(143, 179, 226, 0.2);
        }

        .details-section h4 svg {
          color: #8FB3E2;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .detail-item .label {
          color: #aaa;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .detail-item .value.black-text {
          color: #000000;
          font-weight: 500;
        }

        .detail-item .value.transport-type.black-text {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #000000;
        }

        .order-id-full.black-text {
          font-family: monospace;
          font-size: 0.9rem;
          color: #000000;
          word-break: break-all;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .cart-item {
          display: flex;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(143, 179, 226, 0.2);
          border-radius: 8px;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
        }

        .item-name.black-text {
          color: #000000;
          font-weight: 500;
          display: block;
          margin-bottom: 5px;
        }

        .item-brand.black-text {
          color: #000000;
          font-size: 0.8rem;
          display: block;
          margin-bottom: 5px;
        }

        .item-specs span.black-text {
          color: #000000;
          font-size: 0.8rem;
          margin-right: 15px;
        }

        .item-price.black-text {
          color: #000000;
          font-weight: 500;
        }

        .single-product-detail {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(143, 179, 226, 0.2);
          border-radius: 8px;
        }

        .product-image-large {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          object-fit: cover;
        }

        .product-details {
          flex: 1;
        }

        .product-details h5.black-text {
          color: #000000;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }

        .company.black-text {
          color: #000000;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 10px;
        }

        .product-specs span.black-text {
          color: #000000;
          display: block;
          margin-bottom: 5px;
        }

        .price-breakdown {
          max-width: 400px;
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid rgba(143, 179, 226, 0.2);
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(143, 179, 226, 0.2);
        }

        .price-row:last-child {
          border-bottom: none;
        }

        .price-row span.black-text {
          color: #000000;
        }

        .price-row.total {
          font-weight: 600;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid rgba(143, 179, 226, 0.3);
        }

        .additional-info.black-text {
          color: #000000;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(143, 179, 226, 0.2);
          border-radius: 8px;
          line-height: 1.6;
        }

        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(143, 179, 226, 0.3);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 30px;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-dot {
          position: absolute;
          left: -30px;
          top: 5px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid #8FB3E2;
        }

        .timeline-item.active .timeline-dot {
          background: #2196f3;
          animation: pulse 2s infinite;
        }

        .timeline-item.completed .timeline-dot {
          background: #4caf50;
        }

        .timeline-item.cancelled .timeline-dot {
          background: #f44336;
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .timeline-date.black-text {
          color: #000000;
          font-size: 0.8rem;
        }

        .timeline-title.black-text {
          color: #000000;
          font-weight: 500;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 60px;
          color: #aaa;
        }

        .error-state svg {
          color: #f44336;
          margin-bottom: 20px;
        }

        .empty-state svg, .loading-state svg {
          color: #8FB3E2;
          margin-bottom: 20px;
        }

        .loader {
          border: 3px solid rgba(143, 179, 226, 0.3);
          border-top: 3px solid #8FB3E2;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .empty-state h3, .error-state h3 {
          color: #ffffff;
          margin-bottom: 10px;
        }

        .empty-state p, .error-state p {
          margin-bottom: 30px;
        }

        .btn-primary {
          padding: 12px 30px;
          background: #8FB3E2;
          border: none;
          border-radius: 6px;
          color: #1a1a1a;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background: #7a9fd1;
          transform: translateY(-2px);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge svg {
          width: 14px;
          height: 14px;
        }

        .status-pending {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        .status-processing {
          background: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        }

        .status-hold {
          background: rgba(255, 87, 34, 0.2);
          color: #ff5722;
        }

        .status-completed {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .status-cancelled {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
          }
        }

        /* FIXED MOBILE VIEW STYLES */
        @media (max-width: 768px) {
          .order-header {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 15px;
          }

          .order-type-badge {
            min-width: auto;
            margin-bottom: 5px;
          }

          .order-main-info {
            flex-direction: row;
            align-items: center;
            width: 100%;
          }

          .order-id {
            min-width: 100px;
          }

          .id-value {
            font-size: 0.9rem;
          }

          .order-product {
            flex: 1;
          }

          .order-thumbnail {
            width: 40px;
            height: 40px;
          }

          .product-name {
            font-size: 0.9rem;
          }

          .product-quantity {
            font-size: 0.75rem;
          }

          .order-status-info {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .order-date {
            font-size: 0.75rem;
          }

          .order-total {
            text-align: left;
            width: 100%;
          }

          .total-label {
            display: inline;
            margin-right: 8px;
          }

          .total-value {
            font-size: 1rem;
          }

          .expand-btn {
            position: absolute;
            right: 15px;
            top: 15px;
          }

          .order-header {
            position: relative;
          }

          .single-product-detail {
            flex-direction: column;
          }

          .product-image-large {
            width: 100%;
            height: 200px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .cart-item {
            flex-direction: column;
          }

          .item-image {
            width: 100%;
            height: 150px;
          }
        }

        @media (max-width: 480px) {
          .myorders-container {
            padding: 15px;
            margin-top: 70px;
          }

          .back-btn {
            font-size: 0.8rem;
            padding: 6px 12px;
          }

          .header-content h1 {
            font-size: 1.5rem;
          }

          .header-content p {
            font-size: 0.9rem;
          }

          .order-main-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .order-id {
            margin-bottom: 5px;
          }

          .order-product {
            width: 100%;
          }

          .order-thumbnail {
            width: 35px;
            height: 35px;
          }

          .product-name {
            font-size: 0.85rem;
          }

          .order-total {
            margin-top: 5px;
          }

          .price-breakdown {
            max-width: 100%;
          }

          .price-row {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;