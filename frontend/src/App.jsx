import React, { useState, useEffect, createContext, useContext } from 'react';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ============================================
// CONTEXTS
// ============================================
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
const ToastContext = createContext();
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  const { theme, themeName } = useTheme();

  const typeConfig = {
    success: { bg: theme.colors.status.delivered.bg, color: theme.colors.status.delivered.color, icon: '✓' },
    error: { bg: theme.colors.status.error.bg, color: theme.colors.status.error.color, icon: '✕' },
    warning: { bg: theme.colors.status.requested.bg, color: theme.colors.status.requested.color, icon: '⚠' },
    info: { bg: theme.colors.status.inTransit.bg, color: theme.colors.status.inTransit.color, icon: 'ℹ' }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px'
    }}>
      {toasts.map(toast => {
        const config = typeConfig[toast.type] || typeConfig.info;
        return (
          <div
            key={toast.id}
            style={{
              padding: '14px 18px',
              background: theme.colors.bg.secondary,
              borderRadius: '12px',
              border: `1px solid ${config.color}40`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: config.bg,
              color: config.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              flexShrink: 0
            }}>
              {toast.icon || config.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', color: theme.colors.text.primary, fontSize: '14px', marginBottom: '2px' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.text.muted,
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};


// ============================================
// THEME DEFINITIONS
// ============================================
const themes = {
  professional: {
    name: 'Professional',
    colors: {
      bg: { primary: '#111113', secondary: '#18181b', tertiary: '#1f1f23', hover: '#27272a' },
      border: { subtle: 'rgba(255,255,255,0.06)', default: 'rgba(255,255,255,0.1)' },
      text: { primary: '#fafafa', secondary: '#a1a1aa', tertiary: '#71717a', muted: '#52525b' },
      accent: { primary: '#fafafa', secondary: '#a1a1aa' },
      status: {
        requested: { color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
        confirmed: { color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
        inTransit: { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
        delivered: { color: '#059669', bg: 'rgba(5,150,105,0.1)' },
        cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
        failed: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
        error: { color: '#f87171', bg: 'rgba(220,38,38,0.1)' },
      },
      roles: { ADMINISTRATOR: '#dc2626', MANAGER: '#7c3aed', WAREHOUSE_CLERK: '#2563eb', AUDITOR: '#059669', VIEWER: '#6b7280' }
    },
    icons: {
      status: { REQUESTED: '○', CONFIRMED: '◉', IN_TRANSIT: '◎', DELIVERED: '●', CANCELLED: '○', FAILED: '○' },
      nav: { dashboard: '', transfers: '', 'new-transfer': '', inventory: '', reports: '', audit: '', suppliers: '', analytics: '', documents: '', users: '' },
      stats: { total: '', pending: '', inTransit: '', delivered: '', lowStock: '' }
    },
    useGradients: false,
  },
  vibrant: {
    name: 'Vibrant',
    colors: {
      bg: { primary: '#0a0a0f', secondary: '#12121a', tertiary: '#1a1a2e', hover: '#252540' },
      border: { subtle: 'rgba(139,92,246,0.15)', default: 'rgba(139,92,246,0.25)' },
      text: { primary: '#f1f5f9', secondary: '#cbd5e1', tertiary: '#94a3b8', muted: '#64748b' },
      accent: { primary: '#8b5cf6', secondary: '#6366f1' },
      status: {
        requested: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
        confirmed: { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
        inTransit: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
        delivered: { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
        cancelled: { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
        failed: { color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
        error: { color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
      },
      roles: { ADMINISTRATOR: '#ef4444', MANAGER: '#a855f7', WAREHOUSE_CLERK: '#3b82f6', AUDITOR: '#10b981', VIEWER: '#6b7280' }
    },
    icons: {
      status: { REQUESTED: '📋', CONFIRMED: '✓', IN_TRANSIT: '🚚', DELIVERED: '✓', CANCELLED: '✕', FAILED: '✕' },
      nav: { dashboard: '📊', transfers: '📦', 'new-transfer': '➕', inventory: '📋', reports: '📈', audit: '🔍', suppliers: '🏭', analytics: '📉', documents: '📁', users: '👥' },
      stats: { total: '📦', pending: '📋', inTransit: '🚚', delivered: '✓', lowStock: '⚠️' }
    },
    useGradients: true,
  }
};

// ============================================
// PERMISSION HELPER
// ============================================
const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  if (user.permissions.includes('users.create') && user.permissions.includes('users.delete')) return true; // Admin
  return user.permissions.includes(permission);
};

const isAdmin = (user) => {
  return user?.role?.name === 'ADMINISTRATOR' || user?.permissions?.includes('users.create');
};

// ============================================
// PRODUCT CATALOG
// ============================================
const PRODUCT_CATALOG = {
  'ELEC-TV-55-4K': { name: 'Smart TV 55" 4K UHD', category: 'Electronics', unit: 'units', price: 599.99 },
  'ELEC-LAPTOP-PRO': { name: 'Laptop Pro 15.6"', category: 'Electronics', unit: 'units', price: 1299.99 },
  'ELEC-PHONE-PRO': { name: 'Smartphone Pro Max', category: 'Electronics', unit: 'units', price: 999.99 },
  'ELEC-TABLET-10': { name: 'Tablet 10.5"', category: 'Electronics', unit: 'units', price: 449.99 },
  'ELEC-HEADPHONE-BT': { name: 'Wireless Headphones', category: 'Electronics', unit: 'units', price: 199.99 },
  'ELEC-SPEAKER-SMART': { name: 'Smart Speaker', category: 'Electronics', unit: 'units', price: 129.99 },
  'ELEC-WATCH-SMART': { name: 'Smart Watch Pro', category: 'Electronics', unit: 'units', price: 349.99 },
  'ELEC-CAMERA-DSLR': { name: 'DSLR Camera 24MP', category: 'Electronics', unit: 'units', price: 899.99 },
  'FURN-CHAIR-OFF': { name: 'Office Chair Ergonomic', category: 'Furniture', unit: 'units', price: 299.99 },
  'FURN-DESK-STD': { name: 'Standing Desk 60"', category: 'Furniture', unit: 'units', price: 499.99 },
  'FURN-SHELF-BOOK': { name: 'Bookshelf 5-Tier', category: 'Furniture', unit: 'units', price: 149.99 },
  'FURN-SOFA-3SEAT': { name: '3-Seater Sofa', category: 'Furniture', unit: 'units', price: 799.99 },
  'APPL-FRIDGE-LG': { name: 'Refrigerator Large', category: 'Appliances', unit: 'units', price: 1299.99 },
  'APPL-WASHER-FRONT': { name: 'Front Load Washer', category: 'Appliances', unit: 'units', price: 699.99 },
  'APPL-MICRO-1100W': { name: 'Microwave 1100W', category: 'Appliances', unit: 'units', price: 149.99 },
  'APPL-COFFEE-AUTO': { name: 'Automatic Coffee Maker', category: 'Appliances', unit: 'units', price: 249.99 },
  'CLTH-TSHIRT-BLU-M': { name: 'T-Shirt Blue Medium', category: 'Clothing', unit: 'units', price: 24.99 },
  'CLTH-JEANS-BLK-32': { name: 'Jeans Black 32"', category: 'Clothing', unit: 'units', price: 59.99 },
  'CLTH-JACKET-WIN-L': { name: 'Winter Jacket Large', category: 'Clothing', unit: 'units', price: 149.99 },
  'CLTH-SNEAKER-WHT': { name: 'Sneakers White', category: 'Clothing', unit: 'pairs', price: 89.99 },
  'FOOD-COFFEE-500G': { name: 'Ground Coffee 500g', category: 'Food & Beverage', unit: 'bags', price: 14.99 },
  'FOOD-TEA-GREEN-100': { name: 'Green Tea 100 bags', category: 'Food & Beverage', unit: 'boxes', price: 12.99 },
  'FOOD-SNACK-MIX-1KG': { name: 'Trail Mix 1kg', category: 'Food & Beverage', unit: 'bags', price: 19.99 },
  'FOOD-WATER-24PK': { name: 'Bottled Water 24-Pack', category: 'Food & Beverage', unit: 'cases', price: 9.99 },
  'AUTO-OIL-5W30': { name: 'Motor Oil 5W-30 (5qt)', category: 'Automotive', unit: 'jugs', price: 28.99 },
  'AUTO-TIRE-ALL-17': { name: 'All-Season Tire 17"', category: 'Automotive', unit: 'units', price: 159.99 },
  'AUTO-BATTERY-12V': { name: 'Car Battery 12V', category: 'Automotive', unit: 'units', price: 129.99 },
  'AUTO-WIPER-22': { name: 'Wiper Blades 22"', category: 'Automotive', unit: 'pairs', price: 24.99 },
  'SPRT-YOGA-MAT': { name: 'Yoga Mat Premium', category: 'Sports', unit: 'units', price: 39.99 },
  'SPRT-DUMBELL-SET': { name: 'Dumbbell Set 5-25lb', category: 'Sports', unit: 'sets', price: 199.99 },
  'SPRT-BIKE-MTN': { name: 'Mountain Bike 27.5"', category: 'Sports', unit: 'units', price: 599.99 },
  'SPRT-TENT-4P': { name: 'Camping Tent 4-Person', category: 'Sports', unit: 'units', price: 179.99 },
  'TOOL-DRILL-CORD': { name: 'Cordless Drill 20V', category: 'Tools', unit: 'units', price: 129.99 },
  'TOOL-SAW-CIRC': { name: 'Circular Saw 7.25"', category: 'Tools', unit: 'units', price: 99.99 },
  'TOOL-HAMMER-16OZ': { name: 'Hammer 16oz', category: 'Tools', unit: 'units', price: 19.99 },
  'TOOL-WRENCH-SET': { name: 'Wrench Set 10pc', category: 'Tools', unit: 'sets', price: 49.99 },
  'HLTH-VITAMIN-D3': { name: 'Vitamin D3 1000IU', category: 'Health', unit: 'bottles', price: 12.99 },
  'HLTH-FIRSTAID-KIT': { name: 'First Aid Kit 100pc', category: 'Health', unit: 'kits', price: 29.99 },
  'HLTH-MASK-N95-50': { name: 'N95 Masks 50-Pack', category: 'Health', unit: 'boxes', price: 49.99 },
  'HLTH-SANITIZER-1L': { name: 'Hand Sanitizer 1L', category: 'Health', unit: 'bottles', price: 8.99 },
};

const LOCATIONS = {
  warehouses: ['WAREHOUSE-NORTH-01', 'WAREHOUSE-SOUTH-02', 'WAREHOUSE-EAST-03', 'WAREHOUSE-WEST-04'],
  stores: ['STORE-DOWNTOWN-001', 'STORE-MALL-002', 'STORE-SUBURB-003', 'STORE-AIRPORT-004'],
  other: ['DISTRIBUTION-CENTER-MAIN', 'DISTRIBUTION-CENTER-REGIONAL', 'RETAIL-OUTLET-005', 'RETAIL-OUTLET-006', 'SUPPLIER-LOCAL-A', 'SUPPLIER-INTL-A', 'QUALITY-CONTROL', 'RETURNS-CENTER']
};

const ALL_LOCATIONS = [...LOCATIONS.warehouses, ...LOCATIONS.stores, ...LOCATIONS.other];

const TRANSFER_STATUSES = {
  REQUESTED: { label: 'Requested', key: 'requested' },
  CONFIRMED: { label: 'Confirmed', key: 'confirmed' },
  IN_TRANSIT: { label: 'In Transit', key: 'inTransit' },
  DELIVERED: { label: 'Delivered', key: 'delivered' },
  CANCELLED: { label: 'Cancelled', key: 'cancelled' },
  FAILED: { label: 'Failed', key: 'failed' },
};

// ============================================
// SHARED COMPONENTS
// ============================================
const Card = ({ children, style = {} }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.useGradients ? `linear-gradient(145deg, ${theme.colors.bg.secondary} 0%, ${theme.colors.bg.tertiary} 100%)` : theme.colors.bg.secondary,
      border: `1px solid ${theme.colors.border.subtle}`,
      borderRadius: '12px', padding: '24px', ...style
    }}>
      {children}
    </div>
  );
};

const useTableStyles = () => {
  const { theme } = useTheme();
  return {
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '500', color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${theme.colors.border.subtle}` },
    td: { padding: '14px 16px', fontSize: '13px', color: theme.colors.text.secondary, borderBottom: `1px solid ${theme.colors.border.subtle}` }
  };
};

const useInputStyles = () => {
  const { theme } = useTheme();
  return {
    label: { display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: theme.colors.text.secondary },
    input: { width: '100%', padding: '10px 14px', background: theme.colors.bg.primary, border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', color: theme.colors.text.primary, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
  };
};

const StatusBadge = ({ status }) => {
  const { theme, themeName } = useTheme();
  const config = TRANSFER_STATUSES[status];
  const statusColors = theme.colors.status[config?.key || 'cancelled'];
  const icon = theme.icons.status[status] || '';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: statusColors.bg, color: statusColors.color, fontSize: '12px', fontWeight: '500' }}>{themeName === 'vibrant' && icon} {config?.label || status}</span>;
};

const RoleBadge = ({ role }) => {
  const { theme } = useTheme();
  const roleName = typeof role === 'string' ? role : role?.name || 'Unknown';
  const roleColor = theme.colors.roles[roleName] || theme.colors.roles.VIEWER;
  return <span style={{ padding: '4px 10px', borderRadius: '6px', background: `${roleColor}15`, color: roleColor, fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>{roleName.replace('_', ' ')}</span>;
};

const StatsCard = ({ title, value, icon, color }) => {
  const { theme, themeName } = useTheme();
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {themeName === 'vibrant' && <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{icon}</div>}
        <div>
          <div style={{ fontSize: '13px', color: theme.colors.text.tertiary, marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: color || theme.colors.text.primary }}>{value}</div>
        </div>
      </div>
    </Card>
  );
};

const ThemeToggle = () => {
  const { themeName, setThemeName } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px' }}>
      <span style={{ fontSize: '12px', color: themeName === 'professional' ? '#a1a1aa' : '#94a3b8' }}>Pro</span>
      <div onClick={() => setThemeName(themeName === 'professional' ? 'vibrant' : 'professional')} style={{ width: '44px', height: '24px', borderRadius: '12px', background: themeName === 'vibrant' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#3f3f46', cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease' }}>
        <div style={{ position: 'absolute', top: '2px', left: themeName === 'vibrant' ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ fontSize: '12px', color: themeName === 'professional' ? '#a1a1aa' : '#94a3b8' }}>Vibrant</span>
    </div>
  );
};

// ============================================
// FIXED NOTIFICATION BELL COMPONENT
// Replace your existing NotificationBell component with this
// ============================================

const NotificationBell = ({ userId }) => {
  const { theme, themeName } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    transferUpdates: true,
    inventoryAlerts: true,
    orderUpdates: true,
    systemAlerts: true,
    emailNotifications: false
  });

  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadPreferences();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/user/${userId}/count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/preferences/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/user/${userId}/read-all`, { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const updatePreference = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    try {
      await fetch(`${API_BASE}/notifications/preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
    } catch (err) {
      console.error('Failed to update preference:', err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const priorityColors = {
    URGENT: theme.colors.status.error.color,
    HIGH: theme.colors.status.requested.color,
    NORMAL: theme.colors.text.secondary,
    LOW: theme.colors.text.muted
  };

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) loadNotifications(); }}
        style={{
          background: isOpen ? theme.colors.bg.tertiary : 'transparent',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: theme.colors.text.secondary
        }}
      >
        <span style={{ fontSize: '18px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: theme.colors.status.error.color,
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel - Rendered as Portal outside sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
          />
          
          {/* Panel - Fixed position in main content area */}
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '270px',
            width: '380px',
            maxHeight: '500px',
            background: theme.colors.bg.secondary,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border.default}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            zIndex: 999,
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px',
              borderBottom: `1px solid ${theme.colors.border.subtle}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>
                  {themeName === 'vibrant' && '🔔 '}Notifications
                </h3>
                {unreadCount > 0 && (
                  <span style={{ fontSize: '12px', color: theme.colors.text.muted }}>
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  style={{
                    background: showPreferences ? theme.colors.bg.tertiary : 'transparent',
                    border: 'none',
                    color: theme.colors.text.muted,
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  ⚙️
                </button>
              </div>
            </div>

            {/* Preferences Panel */}
            {showPreferences && (
              <div style={{ padding: '16px', borderBottom: `1px solid ${theme.colors.border.subtle}`, background: theme.colors.bg.primary }}>
                <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '12px' }}>
                  Notification Preferences
                </div>
                {[
                  { key: 'transferUpdates', label: 'Transfer Updates', icon: '📦' },
                  { key: 'inventoryAlerts', label: 'Inventory Alerts', icon: '⚠️' },
                  { key: 'orderUpdates', label: 'Order Updates', icon: '📋' },
                  { key: 'systemAlerts', label: 'System Alerts', icon: '🔧' }
                ].map(pref => (
                  <label key={pref.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>
                      {themeName === 'vibrant' && pref.icon + ' '}{pref.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences[pref.key]}
                      onChange={e => updatePreference(pref.key, e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                ))}
              </div>
            )}

            {/* Notifications List */}
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: theme.colors.text.muted }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
                  <div>No notifications</div>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: `1px solid ${theme.colors.border.subtle}`,
                      background: n.isRead ? 'transparent' : `${theme.colors.accent.primary}08`,
                      cursor: n.isRead ? 'default' : 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: theme.colors.bg.tertiary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        {n.icon || '📌'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                          <span style={{
                            fontWeight: n.isRead ? '400' : '500',
                            color: theme.colors.text.primary,
                            fontSize: '13px'
                          }}>
                            {n.title}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: theme.colors.text.muted,
                            whiteSpace: 'nowrap'
                          }}>
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                        {n.message && (
                          <div style={{
                            fontSize: '12px',
                            color: theme.colors.text.tertiary,
                            marginTop: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {n.message}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: theme.colors.bg.tertiary,
                            fontSize: '10px',
                            color: theme.colors.text.muted
                          }}>
                            {n.type}
                          </span>
                          {n.priority !== 'NORMAL' && (
                            <span style={{
                              fontSize: '10px',
                              color: priorityColors[n.priority]
                            }}>
                              ● {n.priority}
                            </span>
                          )}
                          {!n.isRead && (
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: theme.colors.accent.primary,
                              marginLeft: 'auto'
                            }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// ============================================
// SIDEBAR
// ============================================
const Sidebar = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const { theme, themeName, setThemeName } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'new-transfer', label: 'New Transfer' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'reports', label: 'Reports' },
    { id: 'audit', label: 'Audit' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'documents', label: 'Documents' },
    { id: 'users', label: 'Users' },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.id === 'users') return user?.role?.name === 'ADMINISTRATOR' || user?.permissions?.includes('users.create');
    return true;
  });

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: theme.colors.bg.secondary,
      borderRight: `1px solid ${theme.colors.border.subtle}`,
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Logo and Notifications */}
      <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border.subtle}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: theme.colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {themeName === 'vibrant' && '📦'} Supply Chain
          </h1>
          {/* Notification Bell */}
          <NotificationBell userId={user?.id} />
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: theme.colors.text.muted }}>Blockchain Ledger</p>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', color: theme.colors.text.muted }}>Pro</span>
          <button
            onClick={() => setThemeName(themeName === 'professional' ? 'vibrant' : 'professional')}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              background: themeName === 'vibrant' 
                ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`
                : theme.colors.bg.tertiary,
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.3s'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '3px',
              left: themeName === 'vibrant' ? '23px' : '3px',
              transition: 'left 0.3s'
            }} />
          </button>
          <span style={{ fontSize: '12px', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.muted }}>Vibrant</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        {filteredNavItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '4px',
                background: isActive 
                  ? (theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}20, ${theme.colors.accent.secondary}20)` : theme.colors.bg.tertiary)
                  : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: isActive ? (themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary) : theme.colors.text.secondary,
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              {themeName === 'vibrant' && (
                <span style={{ fontSize: '16px' }}>{theme.icons.nav[item.id]}</span>
              )}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{ 
        padding: '16px', 
        borderTop: `1px solid ${theme.colors.border.subtle}`,
        background: theme.colors.bg.primary
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: theme.useGradients 
              ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`
              : theme.colors.bg.tertiary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '500', color: theme.colors.text.primary, fontSize: '14px' }}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: theme.colors.roles?.[user?.role?.name] || theme.colors.text.muted,
              fontWeight: '500'
            }}>
              {user?.role?.name?.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: theme.colors.bg.tertiary,
            border: 'none',
            borderRadius: '8px',
            color: theme.colors.text.secondary,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};


// ============================================
// INVENTORY GENERATOR
// ============================================
const generateInventory = () => {
  const inventory = [];
  let id = 1;
  ALL_LOCATIONS.forEach(location => {
    const skus = Object.keys(PRODUCT_CATALOG);
    const selectedSkus = skus.filter(() => Math.random() > 0.4).slice(0, 15);
    selectedSkus.forEach(sku => {
      inventory.push({ id: id++, sku, location, quantity: Math.floor(Math.random() * 100) + 5, minStock: Math.floor(Math.random() * 20) + 5 });
    });
  });
  return inventory;
};

// ============================================
// DASHBOARD PAGE
// ============================================
// ============================================
// ENHANCED DASHBOARD PAGE
// Replace your existing DashboardPage component
// ============================================

// ============================================
// LOGIN PAGE
// ============================================
const LoginPage = ({ onLogin }) => {
  const { theme, themeName, setThemeName } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'ADMINISTRATOR', name: 'System Admin' },
    { username: 'manager', password: 'manager123', role: 'MANAGER', name: 'Operations Manager' },
    { username: 'clerk', password: 'clerk123', role: 'WAREHOUSE_CLERK', name: 'Warehouse Staff' },
    { username: 'auditor', password: 'auditor123', role: 'AUDITOR', name: 'Internal Auditor' },
    { username: 'viewer', password: 'viewer123', role: 'VIEWER', name: 'Guest Viewer' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const userData = await response.json();
        onLogin(userData);
      } else {
        // Fallback to demo accounts for testing
        const demo = demoAccounts.find(a => a.username === username && a.password === password);
        if (demo) {
          onLogin({
            id: Math.random().toString(36).substr(2, 9),
            username: demo.username,
            name: demo.name,
            role: demo.role,
            email: `${demo.username}@supplychain.com`
          });
        } else {
          setError('Invalid username or password');
        }
      }
    } catch (err) {
      // Fallback to demo accounts when API unavailable
      const demo = demoAccounts.find(a => a.username === username && a.password === password);
      if (demo) {
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          username: demo.username,
          name: demo.name,
          role: demo.role,
          email: `${demo.username}@supplychain.com`
        });
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (account) => {
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.bg.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ThemeToggle />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: theme.colors.bg.secondary,
        borderRadius: '16px',
        border: `1px solid ${theme.colors.border.subtle}`,
        padding: '40px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: theme.useGradients 
              ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`
              : theme.colors.bg.tertiary,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>
            📦
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: '8px'
          }}>
            SupplyChain Ledger
          </h1>
          <p style={{ color: theme.colors.text.muted, fontSize: '14px' }}>
            Blockchain-powered inventory management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: theme.colors.status.error.bg,
              border: `1px solid ${theme.colors.status.error.color}40`,
              borderRadius: '8px',
              color: theme.colors.status.error.color,
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: theme.colors.text.secondary,
              marginBottom: '8px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.colors.bg.tertiary,
                border: `1px solid ${theme.colors.border.default}`,
                borderRadius: '8px',
                color: theme.colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: theme.colors.text.secondary,
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.colors.bg.tertiary,
                border: `1px solid ${theme.colors.border.default}`,
                borderRadius: '8px',
                color: theme.colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: theme.useGradients
                ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`
                : theme.colors.text.primary,
              border: 'none',
              borderRadius: '8px',
              color: theme.useGradients ? 'white' : theme.colors.bg.primary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: `1px dashed ${theme.colors.border.default}`,
              borderRadius: '8px',
              color: theme.colors.text.secondary,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
          </button>

          {showDemoAccounts && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: theme.colors.bg.tertiary,
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '12px',
                color: theme.colors.text.muted,
                marginBottom: '12px'
              }}>
                Click to auto-fill credentials:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {demoAccounts.map((account) => (
                  <button
                    key={account.username}
                    onClick={() => quickLogin(account)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: theme.colors.bg.secondary,
                      border: `1px solid ${theme.colors.border.subtle}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', color: theme.colors.text.primary, fontWeight: '500' }}>
                        {account.name}
                      </div>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>
                        {account.username} / {account.password}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      background: `${theme.colors.roles[account.role]}20`,
                      color: theme.colors.roles[account.role],
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {account.role.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: theme.colors.text.muted
        }}>
          Secured with blockchain verification
        </p>
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD PAGE
// ============================================
const DashboardPage = ({ transfers, inventory, user }) => {
  const { theme, themeName } = useTheme();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [supplierStats, setSupplierStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, activityRes, suppliersRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/kpis`),
        fetch(`${API_BASE}/activity-logs?limit=10`),
        fetch(`${API_BASE}/suppliers/stats`),
        fetch(`${API_BASE}/analytics/orders/by-status`)
      ]);

      if (analyticsRes.ok) setStats(await analyticsRes.json());
      if (activityRes.ok) setRecentActivity(await activityRes.json());
      if (suppliersRes.ok) setSupplierStats(await suppliersRes.json());
      if (ordersRes.ok) setOrderStats(await ordersRes.json());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from transfers
  const transferStats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === 'REQUESTED' || t.status === 'CONFIRMED').length,
    inTransit: transfers.filter(t => t.status === 'IN_TRANSIT').length,
    delivered: transfers.filter(t => t.status === 'DELIVERED').length,
    cancelled: transfers.filter(t => t.status === 'CANCELLED').length
  };

  // Low stock items
  const lowStockItems = inventory.filter(item => item.quantity < 25).slice(0, 5);

  // Recent transfers
  const recentTransfers = transfers.slice(0, 5);

  // Status colors
  const statusConfig = {
    REQUESTED: { color: theme.colors.status.requested.color, bg: theme.colors.status.requested.bg, label: 'Requested' },
    CONFIRMED: { color: theme.colors.status.confirmed.color, bg: theme.colors.status.confirmed.bg, label: 'Confirmed' },
    IN_TRANSIT: { color: theme.colors.status.inTransit.color, bg: theme.colors.status.inTransit.bg, label: 'In Transit' },
    DELIVERED: { color: theme.colors.status.delivered.color, bg: theme.colors.status.delivered.bg, label: 'Delivered' },
    CANCELLED: { color: theme.colors.status.error.color, bg: theme.colors.status.error.bg, label: 'Cancelled' }
  };

  // Format time ago
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Quick action buttons
  const quickActions = [
    { id: 'new-transfer', label: 'New Transfer', icon: '📦', color: theme.colors.accent.primary },
    { id: 'inventory', label: 'View Inventory', icon: '📋', color: '#10b981' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭', color: '#f59e0b' },
    { id: 'reports', label: 'Reports', icon: '📊', color: '#8b5cf6' }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>
          {themeName === 'vibrant' && '📊 '}Dashboard
        </h1>
        <p style={{ color: theme.colors.text.tertiary, marginTop: '8px', fontSize: '14px' }}>
          Welcome back, {user?.firstName || user?.username || 'User'}
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: action.id }))}
            style={{
              padding: '16px',
              background: theme.colors.bg.secondary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = theme.colors.border.subtle;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '24px' }}>{action.icon}</span>
            <span style={{ fontSize: '12px', color: theme.colors.text.secondary, fontWeight: '500' }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Transfers */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.bg.tertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📦
            </div>
            <div>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted }}>Total Transfers</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>{transferStats.total}</div>
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: theme.colors.status.requested.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ⏳
            </div>
            <div>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted }}>Pending</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.requested.color }}>{transferStats.pending}</div>
            </div>
          </div>
        </Card>

        {/* In Transit */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: theme.colors.status.inTransit.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🚚
            </div>
            <div>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted }}>In Transit</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.inTransit.color }}>{transferStats.inTransit}</div>
            </div>
          </div>
        </Card>

        {/* Delivered */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: theme.colors.status.delivered.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ✅
            </div>
            <div>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted }}>Delivered</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.delivered.color }}>{transferStats.delivered}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Inventory Items</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>{inventory.length}</div>
        </Card>
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Low Stock Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: theme.colors.status.error.color }}>{lowStockItems.length}</div>
        </Card>
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Active Suppliers</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>{stats?.activeSuppliers || supplierStats?.total || 0}</div>
        </Card>
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Success Rate</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: theme.colors.status.delivered.color }}>
            {transferStats.total > 0 ? Math.round((transferStats.delivered / transferStats.total) * 100) : 0}%
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Recent Transfers */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>
              {themeName === 'vibrant' && '📦 '}Recent Transfers
            </h3>
            <span style={{ fontSize: '12px', color: theme.colors.text.muted }}>{transfers.length} total</span>
          </div>
          
          {recentTransfers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.colors.text.muted }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
              <div>No transfers yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentTransfers.map(transfer => {
                const statusCfg = statusConfig[transfer.status] || statusConfig.REQUESTED;
                return (
                  <div key={transfer.transferId} style={{
                    padding: '12px',
                    background: theme.colors.bg.primary,
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>
                        {transfer.transferId}
                      </div>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginTop: '2px' }}>
                        {transfer.fromLocation} → {transfer.toLocation}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: statusCfg.bg,
                      color: statusCfg.color,
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {statusCfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>
              {themeName === 'vibrant' && '⚠️ '}Low Stock Alerts
            </h3>
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              background: lowStockItems.length > 0 ? theme.colors.status.error.bg : theme.colors.status.delivered.bg,
              color: lowStockItems.length > 0 ? theme.colors.status.error.color : theme.colors.status.delivered.color,
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {lowStockItems.length} items
            </span>
          </div>
          
          {lowStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.colors.status.delivered.color }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div>All stock levels healthy</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockItems.map(item => (
                <div key={item.sku} style={{
                  padding: '12px',
                  background: theme.colors.bg.primary,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${theme.colors.status.error.color}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: theme.colors.text.primary }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: theme.colors.status.error.color, marginTop: '2px' }}>
                        {item.quantity} left at {item.location}
                      </div>
                    </div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: theme.colors.status.error.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}>
                      ⚠️
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Activity Feed & Transfer Status Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Activity Feed */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>
              {themeName === 'vibrant' && '📋 '}Recent Activity
            </h3>
          </div>
          
          {recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.colors.text.muted }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              <div>No recent activity</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentActivity.slice(0, 6).map((activity, idx) => (
                <div key={activity.id || idx} style={{
                  padding: '12px 0',
                  borderBottom: idx < recentActivity.length - 1 ? `1px solid ${theme.colors.border.subtle}` : 'none',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'start'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: theme.colors.bg.tertiary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {activity.action === 'LOGIN' ? '🔑' : 
                     activity.action === 'CREATE' ? '➕' : 
                     activity.action === 'UPDATE' ? '✏️' : 
                     activity.action === 'DELETE' ? '🗑️' : '📌'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: theme.colors.text.primary }}>
                      <span style={{ fontWeight: '500' }}>{activity.username || 'User'}</span>
                      <span style={{ color: theme.colors.text.muted }}> {activity.action?.toLowerCase()} </span>
                      <span>{activity.entityType?.toLowerCase()}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginTop: '2px' }}>
                      {timeAgo(activity.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Transfer Status Distribution */}
        <Card>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>
              {themeName === 'vibrant' && '📊 '}Transfer Status
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { status: 'DELIVERED', count: transferStats.delivered, label: 'Delivered' },
              { status: 'IN_TRANSIT', count: transferStats.inTransit, label: 'In Transit' },
              { status: 'CONFIRMED', count: transfers.filter(t => t.status === 'CONFIRMED').length, label: 'Confirmed' },
              { status: 'REQUESTED', count: transfers.filter(t => t.status === 'REQUESTED').length, label: 'Requested' },
              { status: 'CANCELLED', count: transferStats.cancelled, label: 'Cancelled' }
            ].map(item => {
              const cfg = statusConfig[item.status];
              const percentage = transferStats.total > 0 ? (item.count / transferStats.total) * 100 : 0;
              return (
                <div key={item.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{item.label}</span>
                    <span style={{ fontSize: '12px', color: theme.colors.text.muted }}>{item.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: theme.colors.bg.tertiary,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: cfg?.color || theme.colors.text.muted,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: theme.colors.bg.primary,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.status.delivered.color }}>
                {transferStats.total > 0 ? Math.round((transferStats.delivered / transferStats.total) * 100) : 0}%
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>Success Rate</div>
            </div>
            <div style={{ width: '1px', background: theme.colors.border.subtle }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.status.inTransit.color }}>
                {transferStats.pending + transferStats.inTransit}
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>Active</div>
            </div>
            <div style={{ width: '1px', background: theme.colors.border.subtle }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.text.primary }}>
                {transferStats.total}
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>Total</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// TRANSFERS PAGE
// ============================================
const TransfersPage = ({ transfers, setTransfers, user }) => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();
  const [filter, setFilter] = useState('ALL');

  const filteredTransfers = filter === 'ALL' ? transfers : transfers.filter(t => t.status === filter);

  const updateStatus = async (transferId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/transfers/${transferId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setTransfers(transfers.map(t => t.transferId === transferId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>{themeName === 'vibrant' && '📦 '}Transfers</h1>
      </div>
      <Card>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['ALL', 'REQUESTED', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(status => (
            <button key={status} onClick={() => setFilter(status)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', background: filter === status ? (theme.useGradients ? theme.colors.accent.primary : theme.colors.text.primary) : theme.colors.bg.tertiary, color: filter === status ? (theme.useGradients ? 'white' : theme.colors.bg.primary) : theme.colors.text.secondary }}>
              {status === 'ALL' ? 'All' : TRANSFER_STATUSES[status]?.label} {status === 'ALL' ? transfers.length : transfers.filter(t => t.status === status).length}
            </button>
          ))}
        </div>
        <table style={tableStyles.table}>
          <thead><tr><th style={tableStyles.th}>ID</th><th style={tableStyles.th}>From</th><th style={tableStyles.th}>To</th><th style={tableStyles.th}>Status</th><th style={tableStyles.th}>Block</th><th style={tableStyles.th}>Date</th><th style={tableStyles.th}>Actions</th></tr></thead>
          <tbody>
            {filteredTransfers.map(transfer => (
              <tr key={transfer.transferId}>
                <td style={tableStyles.td}><span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>{transfer.transferId}</span></td>
                <td style={tableStyles.td}>{transfer.fromLocation}</td>
                <td style={tableStyles.td}>{transfer.toLocation}</td>
                <td style={tableStyles.td}><StatusBadge status={transfer.status} /></td>
                <td style={tableStyles.td}>#{transfer.blockNumber || '—'}</td>
                <td style={tableStyles.td}>{transfer.createdAt ? new Date(transfer.createdAt).toLocaleDateString() : '—'}</td>
                <td style={tableStyles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {transfer.status === 'REQUESTED' && <button onClick={() => updateStatus(transfer.transferId, 'CONFIRMED')} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', background: theme.colors.bg.tertiary, color: theme.colors.text.secondary, fontSize: '12px', cursor: 'pointer' }}>Confirmed</button>}
                    {transfer.status === 'CONFIRMED' && <button onClick={() => updateStatus(transfer.transferId, 'IN_TRANSIT')} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', background: theme.colors.bg.tertiary, color: theme.colors.text.secondary, fontSize: '12px', cursor: 'pointer' }}>In Transit</button>}
                    {transfer.status === 'IN_TRANSIT' && <button onClick={() => updateStatus(transfer.transferId, 'DELIVERED')} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', background: theme.colors.status.delivered.bg, color: theme.colors.status.delivered.color, fontSize: '12px', cursor: 'pointer' }}>Delivered</button>}
                    {['REQUESTED', 'CONFIRMED'].includes(transfer.status) && <button onClick={() => updateStatus(transfer.transferId, 'CANCELLED')} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', background: theme.colors.status.error.bg, color: theme.colors.status.error.color, fontSize: '12px', cursor: 'pointer' }}>Cancel</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ============================================
// NEW TRANSFER PAGE
// ============================================
const NewTransferPage = ({ onTransferCreated }) => {
  const { theme, themeName } = useTheme();
  const inputStyles = useInputStyles();
  const [formData, setFormData] = useState({ transferId: `TRF-${Date.now().toString().slice(-6)}`, fromLocation: '', toLocation: '', items: [{ sku: '', qty: 1 }] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'qty' ? parseInt(value) || 1 : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => setFormData({ ...formData, items: [...formData.items, { sku: '', qty: 1 }] });
  const handleRemoveItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create transfer');
      }

      onTransferCreated(data);
      setSuccess(`Transfer ${data.transferId} created successfully`);
      setFormData({ transferId: `TRF-${Date.now().toString().slice(-6)}`, fromLocation: '', toLocation: '', items: [{ sku: '', qty: 1 }] });
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        // Demo mode fallback
        const mockTransfer = { ...formData, status: 'REQUESTED', createdAt: new Date().toISOString(), blockNumber: Math.floor(Math.random() * 100) + 100 };
        onTransferCreated(mockTransfer);
        setSuccess(`Transfer ${mockTransfer.transferId} created (demo mode)`);
        setFormData({ transferId: `TRF-${Date.now().toString().slice(-6)}`, fromLocation: '', toLocation: '', items: [{ sku: '', qty: 1 }] });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>{themeName === 'vibrant' && '➕ '}New Transfer</h1>
        <p style={{ color: theme.colors.text.tertiary, marginTop: '8px', fontSize: '14px' }}>Create a blockchain-verified transfer request</p>
      </div>
      <Card style={{ maxWidth: '640px' }}>
        {error && <div style={{ background: theme.colors.status.error.bg, border: `1px solid ${theme.colors.status.error.color}30`, borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', color: theme.colors.status.error.color, fontSize: '13px' }}>{error}</div>}
        {success && <div style={{ background: theme.colors.status.delivered.bg, border: `1px solid ${theme.colors.status.delivered.color}30`, borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', color: theme.colors.status.delivered.color, fontSize: '13px' }}>{themeName === 'vibrant' && '✓ '}{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}><label style={inputStyles.label}>Transfer ID</label><input type="text" value={formData.transferId} onChange={(e) => setFormData({ ...formData, transferId: e.target.value })} style={inputStyles.input} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div><label style={inputStyles.label}>From Location</label><select value={formData.fromLocation} onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })} style={inputStyles.input} required><option value="">Select location</option><optgroup label="Warehouses">{LOCATIONS.warehouses.map(loc => <option key={loc} value={loc}>{loc}</option>)}</optgroup><optgroup label="Stores">{LOCATIONS.stores.map(loc => <option key={loc} value={loc}>{loc}</option>)}</optgroup><optgroup label="Other">{LOCATIONS.other.map(loc => <option key={loc} value={loc}>{loc}</option>)}</optgroup></select></div>
            <div><label style={inputStyles.label}>To Location</label><select value={formData.toLocation} onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })} style={inputStyles.input} required><option value="">Select location</option><optgroup label="Warehouses">{LOCATIONS.warehouses.map(loc => <option key={loc} value={loc}>{loc}</option>)}</optgroup><optgroup label="Stores">{LOCATIONS.stores.map(loc => <option key={loc} value={loc}>{loc}</option>)}</optgroup><optgroup label="Other">{LOCATIONS.other.map(loc => <option key={loc} value={loc}>{loc}</option>)}</optgroup></select></div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><label style={{ ...inputStyles.label, marginBottom: 0 }}>Items</label><button type="button" onClick={handleAddItem} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '6px', color: theme.colors.text.secondary, fontSize: '12px', cursor: 'pointer' }}>+ Add Item</button></div>
            {formData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <select value={item.sku} onChange={(e) => handleItemChange(index, 'sku', e.target.value)} style={{ ...inputStyles.input, flex: 2 }} required><option value="">Select product</option>{Object.entries(PRODUCT_CATALOG).map(([sku, product]) => <option key={sku} value={sku}>{sku} — {product.name}</option>)}</select>
                <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} style={{ ...inputStyles.input, flex: 1 }} placeholder="Qty" required />
                {formData.items.length > 1 && <button type="button" onClick={() => handleRemoveItem(index)} style={{ padding: '10px 14px', background: 'transparent', border: `1px solid ${theme.colors.status.error.color}30`, borderRadius: '6px', color: theme.colors.status.error.color, cursor: 'pointer' }}>✕</button>}
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: theme.useGradients ? 'white' : theme.colors.bg.primary, fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Creating...' : 'Create Transfer'}</button>
        </form>
      </Card>
    </div>
  );
};

// ============================================
// INVENTORY PAGE (ENHANCED WITH PAGINATION & DETAILS)
// ============================================
const InventoryPage = ({ inventory }) => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();
  const inputStyles = useInputStyles();
  
  // State
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, LOW, IN_STOCK
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortBy, setSortBy] = useState('sku');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get unique categories
  const categories = [...new Set(Object.values(PRODUCT_CATALOG).map(p => p.category))].sort();

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const product = PRODUCT_CATALOG[item.sku];
    const matchesSearch = search === '' || 
      item.sku.toLowerCase().includes(search.toLowerCase()) || 
      product?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === 'ALL' || item.location === locationFilter;
    const matchesCategory = categoryFilter === 'ALL' || product?.category === categoryFilter;
    const isLowStock = item.quantity <= item.minStock;
    const matchesStock = stockFilter === 'ALL' || 
      (stockFilter === 'LOW' && isLowStock) || 
      (stockFilter === 'IN_STOCK' && !isLowStock);
    return matchesSearch && matchesLocation && matchesCategory && matchesStock;
  });

  // Sort inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    const productA = PRODUCT_CATALOG[a.sku];
    const productB = PRODUCT_CATALOG[b.sku];
    let comparison = 0;
    
    switch (sortBy) {
      case 'sku':
        comparison = a.sku.localeCompare(b.sku);
        break;
      case 'name':
        comparison = (productA?.name || '').localeCompare(productB?.name || '');
        break;
      case 'location':
        comparison = a.location.localeCompare(b.location);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'value':
        const valueA = a.quantity * (productA?.price || 0);
        const valueB = b.quantity * (productB?.price || 0);
        comparison = valueA - valueB;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = sortedInventory.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, locationFilter, categoryFilter, stockFilter, itemsPerPage]);

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Generate fake hash for demo purposes
  const generateItemHash = (item) => {
    const data = `${item.sku}-${item.location}-${item.id}`;
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += Math.floor(Math.random() * 16).toString(16);
    }
    return hash;
  };

  // Get placeholder image URL based on category
  const getProductImage = (sku) => {
    const product = PRODUCT_CATALOG[sku];
    const category = product?.category || 'Other';
    const categoryImages = {
      'Electronics': '📱',
      'Furniture': '🪑',
      'Appliances': '🔌',
      'Clothing': '👕',
      'Food & Beverage': '☕',
      'Automotive': '🚗',
      'Sports': '⚽',
      'Tools': '🔧',
      'Health': '💊',
      'Other': '📦'
    };
    return categoryImages[category] || '📦';
  };

  // Sort indicator
  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return <span style={{ color: theme.colors.text.muted, marginLeft: '4px' }}>↕</span>;
    return <span style={{ color: theme.colors.accent.primary, marginLeft: '4px' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // Stats
  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.quantity * (PRODUCT_CATALOG[item.sku]?.price || 0)), 0);
  const lowStockCount = filteredInventory.filter(item => item.quantity <= item.minStock).length;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
          {themeName === 'vibrant' && '📋 '}Inventory
        </h1>
        <p style={{ color: theme.colors.text.tertiary, marginTop: '8px', fontSize: '14px' }}>
          Manage and track inventory across all locations
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Items</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>{totalItems.toLocaleString()}</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Quantity</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>{totalQuantity.toLocaleString()}</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Value</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: theme.colors.status.delivered.color }}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Low Stock Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: lowStockCount > 0 ? theme.colors.status.error.color : theme.colors.text.primary }}>{lowStockCount}</div>
        </Card>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by SKU or product name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ ...inputStyles.input, minWidth: '250px', flex: 1 }} 
          />
          <select 
            value={locationFilter} 
            onChange={e => setLocationFilter(e.target.value)} 
            style={{ ...inputStyles.input, minWidth: '200px' }}
          >
            <option value="ALL">All Locations</option>
            {ALL_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)} 
            style={{ ...inputStyles.input, minWidth: '150px' }}
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            value={stockFilter} 
            onChange={e => setStockFilter(e.target.value)} 
            style={{ ...inputStyles.input, minWidth: '130px' }}
          >
            <option value="ALL">All Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="IN_STOCK">In Stock</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ ...tableStyles.th, cursor: 'pointer' }} onClick={() => handleSort('sku')}>
                  SKU <SortIndicator column="sku" />
                </th>
                <th style={{ ...tableStyles.th, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Product <SortIndicator column="name" />
                </th>
                <th style={tableStyles.th}>Category</th>
                <th style={{ ...tableStyles.th, cursor: 'pointer' }} onClick={() => handleSort('location')}>
                  Location <SortIndicator column="location" />
                </th>
                <th style={{ ...tableStyles.th, cursor: 'pointer' }} onClick={() => handleSort('quantity')}>
                  Quantity <SortIndicator column="quantity" />
                </th>
                <th style={tableStyles.th}>Status</th>
                <th style={{ ...tableStyles.th, cursor: 'pointer' }} onClick={() => handleSort('value')}>
                  Value <SortIndicator column="value" />
                </th>
                <th style={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInventory.map(item => {
                const product = PRODUCT_CATALOG[item.sku];
                const isLowStock = item.quantity <= item.minStock;
                const itemValue = (product?.price || 0) * item.quantity;
                
                return (
                  <tr key={item.id} style={{ transition: 'background 0.2s' }}>
                    <td style={tableStyles.td}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary,
                        fontSize: '12px'
                      }}>
                        {item.sku}
                      </span>
                    </td>
                    <td style={tableStyles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{getProductImage(item.sku)}</span>
                        <span>{product?.name || item.sku}</span>
                      </div>
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ 
                        padding: '3px 8px', 
                        background: theme.colors.bg.tertiary, 
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: theme.colors.text.secondary
                      }}>
                        {product?.category || 'Other'}
                      </span>
                    </td>
                    <td style={{ ...tableStyles.td, color: theme.colors.text.tertiary, fontSize: '12px' }}>
                      {item.location}
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: isLowStock ? theme.colors.status.error.color : theme.colors.text.primary 
                      }}>
                        {item.quantity.toLocaleString()}
                      </span>
                      <span style={{ color: theme.colors.text.muted, fontSize: '11px', marginLeft: '4px' }}>
                        {product?.unit}
                      </span>
                    </td>
                    <td style={tableStyles.td}>
                      {isLowStock ? (
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          background: theme.colors.status.error.bg,
                          color: theme.colors.status.error.color, 
                          fontSize: '11px', 
                          fontWeight: '500',
                          borderRadius: '4px'
                        }}>
                          {themeName === 'vibrant' && '⚠️'} Low Stock
                        </span>
                      ) : (
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          background: theme.colors.status.delivered.bg,
                          color: theme.colors.status.delivered.color, 
                          fontSize: '11px',
                          fontWeight: '500',
                          borderRadius: '4px'
                        }}>
                          {themeName === 'vibrant' && '✓'} In Stock
                        </span>
                      )}
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontWeight: '500' }}>
                        ${itemValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={tableStyles.td}>
                      <button
                        onClick={() => setSelectedItem(item)}
                        style={{
                          padding: '6px 12px',
                          background: theme.colors.bg.tertiary,
                          border: 'none',
                          borderRadius: '6px',
                          color: theme.colors.text.secondary,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${theme.colors.border.subtle}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: theme.colors.text.muted }}>
              Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedInventory.length)} of {sortedInventory.length}
            </span>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              style={{ ...inputStyles.input, width: 'auto', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                background: currentPage === 1 ? theme.colors.bg.tertiary : theme.colors.bg.hover,
                border: 'none',
                borderRadius: '6px',
                color: currentPage === 1 ? theme.colors.text.muted : theme.colors.text.secondary,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                background: currentPage === 1 ? theme.colors.bg.tertiary : theme.colors.bg.hover,
                border: 'none',
                borderRadius: '6px',
                color: currentPage === 1 ? theme.colors.text.muted : theme.colors.text.secondary,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '8px 14px',
                    background: currentPage === pageNum 
                      ? (theme.useGradients ? theme.colors.accent.primary : theme.colors.text.primary)
                      : theme.colors.bg.tertiary,
                    border: 'none',
                    borderRadius: '6px',
                    color: currentPage === pageNum ? 'white' : theme.colors.text.secondary,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: currentPage === pageNum ? '600' : '400'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                background: currentPage === totalPages ? theme.colors.bg.tertiary : theme.colors.bg.hover,
                border: 'none',
                borderRadius: '6px',
                color: currentPage === totalPages ? theme.colors.text.muted : theme.colors.text.secondary,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                background: currentPage === totalPages ? theme.colors.bg.tertiary : theme.colors.bg.hover,
                border: 'none',
                borderRadius: '6px',
                color: currentPage === totalPages ? theme.colors.text.muted : theme.colors.text.secondary,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Last
            </button>
          </div>
        </div>
      </Card>

      {/* Item Details Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            {(() => {
              const product = PRODUCT_CATALOG[selectedItem.sku];
              const isLowStock = selectedItem.quantity <= selectedItem.minStock;
              const itemHash = generateItemHash(selectedItem);
              
              return (
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        background: theme.useGradients 
                          ? `linear-gradient(135deg, ${theme.colors.accent.primary}20, ${theme.colors.accent.secondary}20)`
                          : theme.colors.bg.tertiary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px'
                      }}>
                        {getProductImage(selectedItem.sku)}
                      </div>
                      <div>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: theme.colors.text.primary }}>
                          {product?.name || selectedItem.sku}
                        </h2>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '14px',
                          color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary 
                        }}>
                          {selectedItem.sku}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: theme.colors.text.muted,
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div style={{ marginBottom: '24px' }}>
                    {isLowStock ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: theme.colors.status.error.bg,
                        color: theme.colors.status.error.color,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        ⚠️ Low Stock Alert - Below minimum threshold
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: theme.colors.status.delivered.bg,
                        color: theme.colors.status.delivered.color,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        ✓ Stock Level Normal
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ 
                      padding: '16px', 
                      background: theme.colors.bg.primary, 
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border.subtle}`
                    }}>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Category
                      </div>
                      <div style={{ fontSize: '16px', color: theme.colors.text.primary, fontWeight: '500' }}>
                        {product?.category || 'Other'}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: theme.colors.bg.primary, 
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border.subtle}`
                    }}>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Location
                      </div>
                      <div style={{ fontSize: '16px', color: theme.colors.text.primary, fontWeight: '500' }}>
                        {selectedItem.location}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: theme.colors.bg.primary, 
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border.subtle}`
                    }}>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Current Quantity
                      </div>
                      <div style={{ 
                        fontSize: '24px', 
                        color: isLowStock ? theme.colors.status.error.color : theme.colors.text.primary, 
                        fontWeight: '600' 
                      }}>
                        {selectedItem.quantity.toLocaleString()}
                        <span style={{ fontSize: '14px', color: theme.colors.text.muted, marginLeft: '6px', fontWeight: '400' }}>
                          {product?.unit}
                        </span>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: theme.colors.bg.primary, 
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border.subtle}`
                    }}>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Minimum Stock
                      </div>
                      <div style={{ fontSize: '24px', color: theme.colors.text.primary, fontWeight: '600' }}>
                        {selectedItem.minStock}
                        <span style={{ fontSize: '14px', color: theme.colors.text.muted, marginLeft: '6px', fontWeight: '400' }}>
                          {product?.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div style={{ 
                    padding: '20px', 
                    background: theme.useGradients 
                      ? `linear-gradient(135deg, ${theme.colors.accent.primary}10, ${theme.colors.accent.secondary}10)`
                      : theme.colors.bg.primary,
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border.subtle}`,
                    marginBottom: '24px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: theme.colors.text.secondary, textTransform: 'uppercase' }}>
                      {themeName === 'vibrant' && '💰 '}Financial Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Unit Price</div>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.text.primary }}>
                          ${(product?.price || 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Value</div>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.status.delivered.color }}>
                          ${((product?.price || 0) * selectedItem.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Reorder Value</div>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.text.secondary }}>
                          ${((product?.price || 0) * selectedItem.minStock).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Hash */}
                  <div style={{ 
                    padding: '20px', 
                    background: theme.colors.bg.primary,
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border.subtle}`,
                    marginBottom: '24px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: theme.colors.text.secondary, textTransform: 'uppercase' }}>
                      {themeName === 'vibrant' && '⛓️ '}Blockchain Verification
                    </h4>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '6px' }}>Item Hash (SHA-256)</div>
                      <div style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '11px', 
                        color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary,
                        background: theme.colors.bg.tertiary,
                        padding: '12px',
                        borderRadius: '6px',
                        wordBreak: 'break-all'
                      }}>
                        {itemHash}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '6px' }}>Record ID</div>
                      <div style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '12px', 
                        color: theme.colors.text.secondary 
                      }}>
                        INV-{selectedItem.id.toString().padStart(6, '0')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setSelectedItem(null)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: theme.colors.bg.tertiary,
                        border: 'none',
                        borderRadius: '8px',
                        color: theme.colors.text.secondary,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Copy hash to clipboard
                        navigator.clipboard.writeText(itemHash);
                        alert('Hash copied to clipboard!');
                      }}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: theme.useGradients 
                          ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`
                          : theme.colors.text.primary,
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      {themeName === 'vibrant' && '📋 '}Copy Hash
                    </button>
                  </div>
                </>
              );
            })()}
          </Card>
        </div>
      )}
    </div>
  );
};

// ============================================
// REPORTS PAGE
// ============================================
const ReportsPage = ({ transfers, inventory }) => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();
  const locationStats = ALL_LOCATIONS.slice(0, 8).map(location => {
    const items = inventory.filter(i => i.location === location);
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * (PRODUCT_CATALOG[i.sku]?.price || 0)), 0);
    const lowStockCount = items.filter(i => i.quantity <= i.minStock).length;
    return { location, totalValue, lowStockCount };
  });
  const maxValue = Math.max(...locationStats.map(s => s.totalValue));
  const transfersByStatus = Object.keys(TRANSFER_STATUSES).map(status => ({ status, count: transfers.filter(t => t.status === status).length, config: TRANSFER_STATUSES[status] }));
  const categoryStats = Object.entries(inventory.reduce((acc, item) => { const category = PRODUCT_CATALOG[item.sku]?.category || 'Other'; if (!acc[category]) acc[category] = { qty: 0, value: 0 }; acc[category].qty += item.quantity; acc[category].value += item.quantity * (PRODUCT_CATALOG[item.sku]?.price || 0); return acc; }, {})).map(([category, data]) => ({ category, ...data }));

  return (
    <div>
      <div style={{ marginBottom: '32px' }}><h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>{themeName === 'vibrant' && '📈 '}Reports</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <Card>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>{themeName === 'vibrant' && '📊 '}Stock Value by Location</h3>
          {locationStats.map(stat => (
            <div key={stat.location} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{stat.location}</span><span style={{ fontSize: '12px', color: themeName === 'vibrant' ? theme.colors.status.delivered.color : theme.colors.text.primary, fontWeight: '500' }}>${stat.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></div>
              <div style={{ height: '8px', background: theme.colors.bg.primary, borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${(stat.totalValue / maxValue) * 100}%`, height: '100%', background: theme.useGradients ? `linear-gradient(90deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.tertiary, borderRadius: '4px' }} /></div>
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>{themeName === 'vibrant' && '📦 '}Transfer Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {transfersByStatus.filter(s => ['REQUESTED', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED'].includes(s.status)).map(({ status, count, config }) => {
              const statusColors = theme.colors.status[config.key];
              return (
                <div key={status} style={{ background: theme.colors.bg.primary, border: `1px solid ${theme.colors.border.subtle}`, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: statusColors?.color || theme.colors.text.primary, marginBottom: '4px' }}>{count}</div>
                  <div style={{ fontSize: '11px', color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{config.label}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>Inventory by Category</h3>
          <table style={tableStyles.table}><thead><tr><th style={tableStyles.th}>Category</th><th style={tableStyles.th}>Items</th><th style={tableStyles.th}>Value</th></tr></thead><tbody>{categoryStats.sort((a, b) => b.value - a.value).map(cat => <tr key={cat.category}><td style={tableStyles.td}>{cat.category}</td><td style={tableStyles.td}>{cat.qty.toLocaleString()}</td><td style={tableStyles.td}>${cat.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td></tr>)}</tbody></table>
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>{themeName === 'vibrant' && '⚠️ '}Low Stock by Location</h3>
          {locationStats.filter(s => s.lowStockCount > 0).length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text.muted, fontSize: '14px' }}>No low stock alerts</div> : locationStats.filter(s => s.lowStockCount > 0).map(stat => <div key={stat.location} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.colors.border.subtle}` }}><span style={{ color: theme.colors.text.secondary, fontSize: '13px' }}>{stat.location}</span><span style={{ padding: '4px 10px', borderRadius: '6px', background: theme.colors.status.error.bg, color: theme.colors.status.error.color, fontSize: '12px', fontWeight: '500' }}>{stat.lowStockCount} items</span></div>)}
        </Card>
      </div>
    </div>
  );
};

// ============================================
// USERS PAGE (FULL MANAGEMENT)
// ============================================
const UsersPage = () => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();
  const inputStyles = useInputStyles();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  
  // Modal states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', fullName: '', roleId: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissionCodes: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes, permsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/roles`),
        fetch(`${API_BASE}/permissions`),
        fetch(`${API_BASE}/activity-logs?limit=50`)
      ]);
      
      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (permsRes.ok) setPermissions(await permsRes.json());
      if (logsRes.ok) setActivityLogs(await logsRes.json());
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser?.id?.toString() || '' },
        body: JSON.stringify({ ...userForm, roleId: parseInt(userForm.roleId) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create user');
      setUsers([...users, data]);
      setShowCreateUser(false);
      setUserForm({ username: '', email: '', password: '', fullName: '', roleId: '' });
      setSuccess('User created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/users/${showEditUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser?.id?.toString() || '' },
        body: JSON.stringify({ email: userForm.email, fullName: userForm.fullName, roleId: parseInt(userForm.roleId), isActive: userForm.isActive })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update user');
      setUsers(users.map(u => u.id === showEditUser.id ? data : u));
      setShowEditUser(null);
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser?.id?.toString() || '' }
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u));
        setSuccess('User deactivated');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const createRole = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create role');
      setRoles([...roles, data]);
      setShowCreateRole(false);
      setRoleForm({ name: '', description: '', permissionCodes: [] });
      setSuccess('Role created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditUser = (user) => {
    setUserForm({ email: user.email, fullName: user.fullName, roleId: user.role?.id?.toString() || '', isActive: user.isActive });
    setShowEditUser(user);
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>{themeName === 'vibrant' && '👥 '}User Management</h1>
      </div>

      {success && <div style={{ background: theme.colors.status.delivered.bg, border: `1px solid ${theme.colors.status.delivered.color}30`, borderRadius: '8px', padding: '12px', marginBottom: '20px', color: theme.colors.status.delivered.color, fontSize: '13px' }}>{success}</div>}
      {error && <div style={{ background: theme.colors.status.error.bg, border: `1px solid ${theme.colors.status.error.color}30`, borderRadius: '8px', padding: '12px', marginBottom: '20px', color: theme.colors.status.error.color, fontSize: '13px' }}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['users', 'roles', 'permissions', 'activity'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize', background: activeTab === tab ? (theme.useGradients ? theme.colors.accent.primary : theme.colors.text.primary) : theme.colors.bg.tertiary, color: activeTab === tab ? 'white' : theme.colors.text.secondary }}>{tab}</button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>Users ({users.length})</h3>
            <button onClick={() => { setUserForm({ username: '', email: '', password: '', fullName: '', roleId: '' }); setShowCreateUser(true); }} style={{ padding: '8px 16px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '6px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>+ Add User</button>
          </div>
          <table style={tableStyles.table}>
            <thead><tr><th style={tableStyles.th}>ID</th><th style={tableStyles.th}>Username</th><th style={tableStyles.th}>Full Name</th><th style={tableStyles.th}>Email</th><th style={tableStyles.th}>Role</th><th style={tableStyles.th}>Status</th><th style={tableStyles.th}>Actions</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.5 }}>
                  <td style={tableStyles.td}>{user.id}</td>
                  <td style={tableStyles.td}><span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>{user.username}</span></td>
                  <td style={tableStyles.td}>{user.fullName}</td>
                  <td style={tableStyles.td}>{user.email}</td>
                  <td style={tableStyles.td}><RoleBadge role={user.role} /></td>
                  <td style={tableStyles.td}><span style={{ color: user.isActive ? theme.colors.status.delivered.color : theme.colors.status.error.color }}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditUser(user)} style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', background: theme.colors.bg.tertiary, color: theme.colors.text.secondary, fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                      {user.isActive && user.id !== currentUser?.id && <button onClick={() => deleteUser(user.id)} style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', background: theme.colors.status.error.bg, color: theme.colors.status.error.color, fontSize: '12px', cursor: 'pointer' }}>Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>Roles ({roles.length})</h3>
            <button onClick={() => { setRoleForm({ name: '', description: '', permissionCodes: [] }); setShowCreateRole(true); }} style={{ padding: '8px 16px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '6px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>+ Add Role</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {roles.map(role => (
              <div key={role.id} style={{ background: theme.colors.bg.primary, border: `1px solid ${theme.colors.border.subtle}`, borderRadius: '10px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: theme.colors.text.primary }}>{role.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.colors.text.muted }}>{role.description}</p>
                  </div>
                  {role.isSystemRole && <span style={{ padding: '2px 8px', background: theme.colors.accent.primary + '20', color: theme.colors.accent.primary, fontSize: '10px', borderRadius: '4px' }}>System</span>}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.text.tertiary }}>
                  <strong>{role.permissions?.length || 0}</strong> permissions
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(role.permissions || []).slice(0, 5).map(p => <span key={p} style={{ padding: '2px 6px', background: theme.colors.bg.tertiary, borderRadius: '4px', fontSize: '10px', color: theme.colors.text.muted }}>{p}</span>)}
                  {(role.permissions || []).length > 5 && <span style={{ padding: '2px 6px', fontSize: '10px', color: theme.colors.text.muted }}>+{role.permissions.length - 5} more</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <Card>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: theme.colors.text.primary }}>All Permissions ({permissions.length})</h3>
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <div key={category} style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: theme.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{category}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
                {perms.map(p => (
                  <div key={p.id} style={{ padding: '12px', background: theme.colors.bg.primary, borderRadius: '8px', border: `1px solid ${theme.colors.border.subtle}` }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>{p.code}</div>
                    <div style={{ fontSize: '13px', color: theme.colors.text.secondary, marginTop: '4px' }}>{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: theme.colors.text.primary }}>Recent Activity</h3>
          <table style={tableStyles.table}>
            <thead><tr><th style={tableStyles.th}>Time</th><th style={tableStyles.th}>User</th><th style={tableStyles.th}>Action</th><th style={tableStyles.th}>Entity</th><th style={tableStyles.th}>ID</th></tr></thead>
            <tbody>
              {activityLogs.map(log => (
                <tr key={log.id}>
                  <td style={tableStyles.td}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={tableStyles.td}>{log.username}</td>
                  <td style={tableStyles.td}><span style={{ padding: '2px 8px', background: theme.colors.bg.tertiary, borderRadius: '4px', fontSize: '11px' }}>{log.action}</span></td>
                  <td style={tableStyles.td}>{log.entityType}</td>
                  <td style={tableStyles.td}><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.entityId}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {activityLogs.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text.muted }}>No activity logs yet</div>}
        </Card>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: theme.colors.text.primary }}>Create New User</h3>
            <form onSubmit={createUser}>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Username</label><input value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} style={inputStyles.input} required /></div>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Email</label><input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={inputStyles.input} required /></div>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Password</label><input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={inputStyles.input} required /></div>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Full Name</label><input value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} style={inputStyles.input} required /></div>
              <div style={{ marginBottom: '24px' }}><label style={inputStyles.label}>Role</label><select value={userForm.roleId} onChange={e => setUserForm({ ...userForm, roleId: e.target.value })} style={inputStyles.input} required><option value="">Select role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateUser(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Create User</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: theme.colors.text.primary }}>Edit User: {showEditUser.username}</h3>
            <form onSubmit={updateUser}>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Email</label><input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={inputStyles.input} required /></div>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Full Name</label><input value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} style={inputStyles.input} required /></div>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Role</label><select value={userForm.roleId} onChange={e => setUserForm({ ...userForm, roleId: e.target.value })} style={inputStyles.input} required><option value="">Select role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
              <div style={{ marginBottom: '24px' }}><label style={{ ...inputStyles.label, display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" checked={userForm.isActive} onChange={e => setUserForm({ ...userForm, isActive: e.target.checked })} /> Active</label></div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowEditUser(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 24px 0', color: theme.colors.text.primary }}>Create New Role</h3>
            <form onSubmit={createRole}>
              <div style={{ marginBottom: '16px' }}><label style={inputStyles.label}>Role Name</label><input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} style={inputStyles.input} placeholder="e.g., SUPERVISOR" required /></div>
              <div style={{ marginBottom: '24px' }}><label style={inputStyles.label}>Description</label><input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} style={inputStyles.input} placeholder="Role description" /></div>
              <div style={{ marginBottom: '24px' }}>
                <label style={inputStyles.label}>Permissions</label>
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px', textTransform: 'uppercase' }}>{category}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {perms.map(p => (
                        <label key={p.code} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: roleForm.permissionCodes.includes(p.code) ? theme.colors.accent.primary + '20' : theme.colors.bg.primary, border: `1px solid ${roleForm.permissionCodes.includes(p.code) ? theme.colors.accent.primary : theme.colors.border.subtle}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                          <input type="checkbox" checked={roleForm.permissionCodes.includes(p.code)} onChange={e => {
                            if (e.target.checked) setRoleForm({ ...roleForm, permissionCodes: [...roleForm.permissionCodes, p.code] });
                            else setRoleForm({ ...roleForm, permissionCodes: roleForm.permissionCodes.filter(c => c !== p.code) });
                          }} />
                          {p.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateRole(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Create Role</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};


// ============================================
// AUDIT PAGE (BLOCK EXPLORER + COMPLIANCE)
// ============================================
const AuditPage = () => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();
  const inputStyles = useInputStyles();

  const [activeTab, setActiveTab] = useState('explorer');
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [blockchainSummary, setBlockchainSummary] = useState(null);
  const [complianceStats, setComplianceStats] = useState(null);
  const [volumeData, setVolumeData] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    fromLocation: '',
    toLocation: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const [transfersRes, summaryRes, statsRes, volumeRes] = await Promise.all([
        fetch(`${API_BASE}/audit/transfers`),
        fetch(`${API_BASE}/audit/blockchain/summary`),
        fetch(`${API_BASE}/audit/compliance/stats`),
        fetch(`${API_BASE}/audit/compliance/volume?days=30`)
      ]);

      if (transfersRes.ok) setTransfers(await transfersRes.json());
      if (summaryRes.ok) setBlockchainSummary(await summaryRes.json());
      if (statsRes.ok) setComplianceStats(await statsRes.json());
      if (volumeRes.ok) setVolumeData(await volumeRes.json());
    } catch (err) {
      console.error('Failed to load audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.fromLocation) params.append('fromLocation', filters.fromLocation);
    if (filters.toLocation) params.append('toLocation', filters.toLocation);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    try {
      const res = await fetch(`${API_BASE}/audit/transfers?${params}`);
      if (res.ok) setTransfers(await res.json());
    } catch (err) {
      console.error('Failed to filter:', err);
    }
  };

  const loadTransferDetails = async (transferId) => {
    try {
      const res = await fetch(`${API_BASE}/audit/transfers/${transferId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTransfer(data);
      }
    } catch (err) {
      console.error('Failed to load details:', err);
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', fromLocation: '', toLocation: '', startDate: '', endDate: '' });
    loadAuditData();
  };

  // Get unique locations from transfers
  const locations = [...new Set([
    ...transfers.map(t => t.fromLocation),
    ...transfers.map(t => t.toLocation)
  ])].filter(Boolean).sort();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Loading audit data...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
          {themeName === 'vibrant' && '🔍 '}Audit & Compliance
        </h1>
        <p style={{ color: theme.colors.text.tertiary, marginTop: '8px', fontSize: '14px' }}>
          Blockchain explorer, transaction history, and compliance reports
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'explorer', label: 'Block Explorer', icon: '⛓️' },
          { id: 'transactions', label: 'Transactions', icon: '📋' },
          { id: 'compliance', label: 'Compliance', icon: '✓' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              background: activeTab === tab.id 
                ? (theme.useGradients ? theme.colors.accent.primary : theme.colors.text.primary) 
                : theme.colors.bg.tertiary,
              color: activeTab === tab.id ? 'white' : theme.colors.text.secondary
            }}
          >
            {themeName === 'vibrant' && tab.icon + ' '}{tab.label}
          </button>
        ))}
      </div>

      {/* Block Explorer Tab */}
      {activeTab === 'explorer' && (
        <div>
          {/* Blockchain Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Network Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }}></span>
                <span style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.status.delivered.color }}>Connected</span>
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Latest Block</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>
                #{blockchainSummary?.latestBlock || 0}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Total Transactions</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>
                {blockchainSummary?.totalTransactions || 0}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Pending</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.requested.color }}>
                {blockchainSummary?.pendingTransfers || 0}
              </div>
            </Card>
          </div>

          {/* Recent Blocks */}
          <Card>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '500', color: theme.colors.text.primary }}>
              {themeName === 'vibrant' && '⛓️ '}Recent Blockchain Transactions
            </h3>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  <th style={tableStyles.th}>Block #</th>
                  <th style={tableStyles.th}>Transfer ID</th>
                  <th style={tableStyles.th}>Transaction Hash</th>
                  <th style={tableStyles.th}>From → To</th>
                  <th style={tableStyles.th}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transfers.filter(t => t.txHash).slice(0, 20).map(transfer => (
                  <tr key={transfer.id} onClick={() => loadTransferDetails(transfer.transferId)} style={{ cursor: 'pointer' }}>
                    <td style={tableStyles.td}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: theme.colors.bg.tertiary, 
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                      }}>
                        #{transfer.blockNumber}
                      </span>
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>
                        {transfer.transferId}
                      </span>
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: theme.colors.text.tertiary }}>
                        {transfer.txHash?.substring(0, 20)}...
                      </span>
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontSize: '12px' }}>{transfer.fromLocation}</span>
                      <span style={{ color: theme.colors.text.muted, margin: '0 4px' }}>→</span>
                      <span style={{ fontSize: '12px' }}>{transfer.toLocation}</span>
                    </td>
                    <td style={tableStyles.td}>
                      {transfer.createdAt ? new Date(transfer.createdAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transfers.filter(t => t.txHash).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text.muted }}>
                No blockchain transactions yet
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          {/* Filters */}
          <Card style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
              Filter Transactions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={inputStyles.label}>Status</label>
                <select 
                  value={filters.status} 
                  onChange={e => setFilters({...filters, status: e.target.value})}
                  style={inputStyles.input}
                >
                  <option value="">All</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={inputStyles.label}>From Location</label>
                <select 
                  value={filters.fromLocation} 
                  onChange={e => setFilters({...filters, fromLocation: e.target.value})}
                  style={inputStyles.input}
                >
                  <option value="">All</option>
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label style={inputStyles.label}>To Location</label>
                <select 
                  value={filters.toLocation} 
                  onChange={e => setFilters({...filters, toLocation: e.target.value})}
                  style={inputStyles.input}
                >
                  <option value="">All</option>
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label style={inputStyles.label}>Start Date</label>
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={e => setFilters({...filters, startDate: e.target.value})}
                  style={inputStyles.input}
                />
              </div>
              <div>
                <label style={inputStyles.label}>End Date</label>
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={e => setFilters({...filters, endDate: e.target.value})}
                  style={inputStyles.input}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={applyFilters} style={{
                  padding: '10px 20px',
                  background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>Apply</button>
                <button onClick={clearFilters} style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: '8px',
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>Clear</button>
              </div>
            </div>
          </Card>

          {/* Transaction List */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: theme.colors.text.primary }}>
                Transaction History ({transfers.length})
              </h3>
              <button
                onClick={() => {
                  const csv = [
                    ['Transfer ID', 'From', 'To', 'Status', 'Block', 'Tx Hash', 'Date'].join(','),
                    ...transfers.map(t => [
                      t.transferId,
                      t.fromLocation,
                      t.toLocation,
                      t.status,
                      t.blockNumber || '',
                      t.txHash || '',
                      t.createdAt || ''
                    ].join(','))
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `audit-report-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                style={{
                  padding: '8px 16px',
                  background: theme.colors.bg.tertiary,
                  border: 'none',
                  borderRadius: '6px',
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {themeName === 'vibrant' && '📥 '}Export CSV
              </button>
            </div>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  <th style={tableStyles.th}>Transfer ID</th>
                  <th style={tableStyles.th}>From</th>
                  <th style={tableStyles.th}>To</th>
                  <th style={tableStyles.th}>Status</th>
                  <th style={tableStyles.th}>Block</th>
                  <th style={tableStyles.th}>Date</th>
                  <th style={tableStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(transfer => (
                  <tr key={transfer.id}>
                    <td style={tableStyles.td}>
                      <span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>
                        {transfer.transferId}
                      </span>
                    </td>
                    <td style={tableStyles.td}>{transfer.fromLocation}</td>
                    <td style={tableStyles.td}>{transfer.toLocation}</td>
                    <td style={tableStyles.td}><StatusBadge status={transfer.status} /></td>
                    <td style={tableStyles.td}>
                      {transfer.blockNumber ? `#${transfer.blockNumber}` : '—'}
                    </td>
                    <td style={tableStyles.td}>
                      {transfer.createdAt ? new Date(transfer.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={tableStyles.td}>
                      <button
                        onClick={() => loadTransferDetails(transfer.transferId)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          background: theme.colors.bg.tertiary,
                          color: theme.colors.text.secondary,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Total Transfers</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>
                {complianceStats?.totalTransfers || 0}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginTop: '4px' }}>
                {complianceStats?.last7Days || 0} this week
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Completion Rate</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.delivered.color }}>
                {complianceStats?.completionRate || 0}%
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginTop: '4px' }}>
                Successfully delivered
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Cancellation Rate</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.error.color }}>
                {complianceStats?.cancellationRate || 0}%
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginTop: '4px' }}>
                Transfers cancelled
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>Blockchain Verified</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>
                {complianceStats?.blockchainVerified || 0}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginTop: '4px' }}>
                On-chain records
              </div>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Volume Chart */}
            <Card>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
                {themeName === 'vibrant' && '📈 '}Transfer Volume (30 Days)
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', paddingTop: '20px' }}>
                {volumeData.slice(-30).map((day, i) => {
                  const maxCount = Math.max(...volumeData.map(d => d.count), 1);
                  const height = (day.count / maxCount) * 160;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${height}px`,
                          background: theme.useGradients 
                            ? `linear-gradient(180deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` 
                            : theme.colors.text.tertiary,
                          borderRadius: '4px 4px 0 0',
                          minHeight: day.count > 0 ? '4px' : '0'
                        }}
                        title={`${day.date}: ${day.count} transfers`}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: theme.colors.text.muted }}>
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
                Status Breakdown
              </h3>
              {complianceStats?.statusBreakdown && Object.entries(complianceStats.statusBreakdown).map(([status, count]) => {
                const total = complianceStats.totalTransfers || 1;
                const percentage = Math.round((count / total) * 100);
                const statusConfig = {
                  REQUESTED: { color: theme.colors.status.requested.color },
                  CONFIRMED: { color: theme.colors.status.confirmed.color },
                  IN_TRANSIT: { color: theme.colors.status.inTransit.color },
                  DELIVERED: { color: theme.colors.status.delivered.color },
                  CANCELLED: { color: theme.colors.status.cancelled.color },
                  FAILED: { color: theme.colors.status.error.color }
                };
                const color = statusConfig[status]?.color || theme.colors.text.secondary;
                
                return (
                  <div key={status} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{status}</span>
                      <span style={{ fontSize: '13px', color, fontWeight: '500' }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '6px', background: theme.colors.bg.primary, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          {/* Location Activity */}
          <Card style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
              {themeName === 'vibrant' && '📍 '}Location Activity
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {complianceStats?.locationActivity && Object.entries(complianceStats.locationActivity)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([location, count]) => (
                  <div key={location} style={{
                    padding: '16px',
                    background: theme.colors.bg.primary,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border.subtle}`
                  }}>
                    <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>{location}</div>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.text.primary }}>{count}</div>
                    <div style={{ fontSize: '11px', color: theme.colors.text.tertiary }}>transfers originated</div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: theme.colors.text.primary }}>Transfer Details</h3>
                <span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary }}>
                  {selectedTransfer.transfer?.transferId}
                </span>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.text.muted,
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >×</button>
            </div>

            {/* Transfer Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>FROM</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedTransfer.transfer?.fromLocation}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>TO</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedTransfer.transfer?.toLocation}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>STATUS</div>
                <StatusBadge status={selectedTransfer.transfer?.status} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>BLOCKCHAIN</div>
                <span style={{ color: selectedTransfer.blockchainVerified ? theme.colors.status.delivered.color : theme.colors.text.muted }}>
                  {selectedTransfer.blockchainVerified ? '✓ Verified' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Blockchain Details */}
            {selectedTransfer.transfer?.txHash && (
              <div style={{
                background: theme.colors.bg.primary,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: theme.colors.text.secondary, marginBottom: '12px' }}>
                  {themeName === 'vibrant' && '⛓️ '}Blockchain Record
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>Block Number</div>
                  <div style={{ fontFamily: 'monospace', color: theme.colors.text.primary }}>#{selectedTransfer.transfer?.blockNumber}</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>Transaction Hash</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: theme.colors.text.primary, wordBreak: 'break-all' }}>
                    {selectedTransfer.transfer?.txHash}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>Items Hash</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: theme.colors.text.tertiary, wordBreak: 'break-all' }}>
                    {selectedTransfer.transfer?.itemsHash}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: theme.colors.text.secondary, marginBottom: '12px' }}>
                Timeline
              </div>
              {selectedTransfer.timeline?.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary,
                    marginTop: '4px'
                  }} />
                  <div>
                    <div style={{ fontSize: '13px', color: theme.colors.text.primary }}>{event.description}</div>
                    <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedTransfer(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.bg.tertiary,
                border: 'none',
                borderRadius: '8px',
                color: theme.colors.text.secondary,
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Close
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============================================
// SUPPLIERS PAGE
// ============================================
const SuppliersPage = () => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();
  const inputStyles = useInputStyles();

  // State
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [supplierForm, setSupplierForm] = useState({
    supplierCode: '',
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    paymentTerms: 'Net 30',
    leadTimeDays: 7,
    notes: ''
  });

  const [orderForm, setOrderForm] = useState({
    supplierId: '',
    shippingAddress: '',
    notes: '',
    shippingCost: 0,
    items: [{ sku: '', quantity: 1, unitCost: 0 }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, ordersRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/suppliers`),
        fetch(`${API_BASE}/suppliers/orders`),
        fetch(`${API_BASE}/suppliers/stats`)
      ]);

      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create supplier');
      setSuppliers([...suppliers, data]);
      setShowCreateSupplier(false);
      setSupplierForm({ supplierCode: '', name: '', contactName: '', email: '', phone: '', address: '', city: '', country: '', paymentTerms: 'Net 30', leadTimeDays: 7, notes: '' });
      setSuccess('Supplier created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateSupplierStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setSuppliers(suppliers.map(s => s.id === id ? { ...s, status } : s));
        setSuccess(`Supplier ${status === 'ACTIVE' ? 'activated' : 'deactivated'}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSupplierDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/suppliers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSupplier(data);
      }
    } catch (err) {
      console.error('Failed to load supplier details:', err);
    }
  };

  const createOrder = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/suppliers/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          supplierId: parseInt(orderForm.supplierId),
          shippingCost: parseFloat(orderForm.shippingCost) || 0,
          items: orderForm.items.map(item => ({
            ...item,
            quantity: parseInt(item.quantity),
            unitCost: parseFloat(item.unitCost)
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create order');
      setOrders([data, ...orders]);
      setShowCreateOrder(false);
      setOrderForm({ supplierId: '', shippingAddress: '', notes: '', shippingCost: 0, items: [{ sku: '', quantity: 1, unitCost: 0 }] });
      setSuccess('Purchase order created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/suppliers/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const updated = await response.json();
        setOrders(orders.map(o => o.id === id ? updated : o));
        setSuccess(`Order status updated to ${status}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addOrderItem = () => {
    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, { sku: '', quantity: 1, unitCost: 0 }]
    });
  };

  const removeOrderItem = (index) => {
    setOrderForm({
      ...orderForm,
      items: orderForm.items.filter((_, i) => i !== index)
    });
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...orderForm.items];
    newItems[index][field] = value;
    setOrderForm({ ...orderForm, items: newItems });
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = search === '' || 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.supplierCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Rating stars component
  const RatingStars = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} style={{ color: '#fbbf24' }}>★</span>);
      } else if (i === fullStars && hasHalf) {
        stars.push(<span key={i} style={{ color: '#fbbf24' }}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: theme.colors.text.muted }}>★</span>);
      }
    }
    return <span style={{ fontSize: '14px' }}>{stars} <span style={{ color: theme.colors.text.secondary, fontSize: '12px', marginLeft: '4px' }}>{(rating || 0).toFixed(1)}</span></span>;
  };

  // Status badge for orders
  const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
      DRAFT: { color: theme.colors.text.muted, bg: theme.colors.bg.tertiary },
      PENDING: { color: theme.colors.status.requested.color, bg: theme.colors.status.requested.bg },
      CONFIRMED: { color: theme.colors.status.confirmed.color, bg: theme.colors.status.confirmed.bg },
      SHIPPED: { color: theme.colors.status.inTransit.color, bg: theme.colors.status.inTransit.bg },
      DELIVERED: { color: theme.colors.status.delivered.color, bg: theme.colors.status.delivered.bg },
      CANCELLED: { color: theme.colors.status.cancelled.color, bg: theme.colors.status.cancelled.bg }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '6px',
        background: config.bg,
        color: config.color,
        fontSize: '11px',
        fontWeight: '500'
      }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Loading suppliers...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
          {themeName === 'vibrant' && '🏭 '}Supplier Portal
        </h1>
        <p style={{ color: theme.colors.text.tertiary, marginTop: '8px', fontSize: '14px' }}>
          Manage suppliers, products, and purchase orders
        </p>
      </div>

      {success && <div style={{ background: theme.colors.status.delivered.bg, border: `1px solid ${theme.colors.status.delivered.color}30`, borderRadius: '8px', padding: '12px', marginBottom: '20px', color: theme.colors.status.delivered.color, fontSize: '13px' }}>{success}</div>}
      {error && <div style={{ background: theme.colors.status.error.bg, border: `1px solid ${theme.colors.status.error.color}30`, borderRadius: '8px', padding: '12px', marginBottom: '20px', color: theme.colors.status.error.color, fontSize: '13px' }}>{error}</div>}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Suppliers</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>{stats?.totalSuppliers || 0}</div>
          <div style={{ fontSize: '12px', color: theme.colors.status.delivered.color }}>{stats?.activeSuppliers || 0} active</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Purchase Orders</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>{stats?.totalOrders || 0}</div>
          <div style={{ fontSize: '12px', color: theme.colors.status.requested.color }}>{stats?.pendingOrders || 0} pending</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Spent</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.delivered.color }}>
            ${(stats?.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.text.tertiary }}>All time</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Delivered Orders</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>{stats?.deliveredOrders || 0}</div>
          <div style={{ fontSize: '12px', color: theme.colors.text.tertiary }}>{stats?.draftOrders || 0} drafts</div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
          { id: 'orders', label: 'Purchase Orders', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              background: activeTab === tab.id 
                ? (theme.useGradients ? theme.colors.accent.primary : theme.colors.text.primary)
                : theme.colors.bg.tertiary,
              color: activeTab === tab.id ? 'white' : theme.colors.text.secondary
            }}
          >
            {themeName === 'vibrant' && tab.icon + ' '}{tab.label}
          </button>
        ))}
      </div>

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyles.input, width: '250px' }}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ ...inputStyles.input, width: '150px' }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateSupplier(true)}
              style={{
                padding: '10px 20px',
                background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              + Add Supplier
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {filteredSuppliers.map(supplier => (
              <div
                key={supplier.id}
                style={{
                  padding: '20px',
                  background: theme.colors.bg.primary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border.subtle}`,
                  opacity: supplier.status === 'INACTIVE' ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: theme.colors.text.primary }}>{supplier.name}</h3>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary }}>
                      {supplier.supplierCode}
                    </span>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: supplier.status === 'ACTIVE' ? theme.colors.status.delivered.bg : theme.colors.bg.tertiary,
                    color: supplier.status === 'ACTIVE' ? theme.colors.status.delivered.color : theme.colors.text.muted,
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {supplier.status}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <RatingStars rating={supplier.rating} />
                </div>

                <div style={{ fontSize: '13px', color: theme.colors.text.secondary, marginBottom: '8px' }}>
                  <div>{supplier.contactName}</div>
                  <div style={{ color: theme.colors.text.tertiary }}>{supplier.email}</div>
                  <div style={{ color: theme.colors.text.tertiary }}>{supplier.city}, {supplier.country}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ padding: '4px 8px', background: theme.colors.bg.tertiary, borderRadius: '4px', fontSize: '11px', color: theme.colors.text.muted }}>
                    {supplier.paymentTerms}
                  </span>
                  <span style={{ padding: '4px 8px', background: theme.colors.bg.tertiary, borderRadius: '4px', fontSize: '11px', color: theme.colors.text.muted }}>
                    {supplier.leadTimeDays} days lead time
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => loadSupplierDetails(supplier.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: theme.colors.bg.tertiary,
                      border: 'none',
                      borderRadius: '6px',
                      color: theme.colors.text.secondary,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => updateSupplierStatus(supplier.id, supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    style={{
                      padding: '8px 12px',
                      background: supplier.status === 'ACTIVE' ? theme.colors.status.error.bg : theme.colors.status.delivered.bg,
                      border: 'none',
                      borderRadius: '6px',
                      color: supplier.status === 'ACTIVE' ? theme.colors.status.error.color : theme.colors.status.delivered.color,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {supplier.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text.muted }}>
              No suppliers found
            </div>
          )}
        </Card>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text.primary }}>
              Purchase Orders ({orders.length})
            </h3>
            <button
              onClick={() => setShowCreateOrder(true)}
              style={{
                padding: '10px 20px',
                background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              + Create Order
            </button>
          </div>

          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>PO Number</th>
                <th style={tableStyles.th}>Supplier</th>
                <th style={tableStyles.th}>Status</th>
                <th style={tableStyles.th}>Items</th>
                <th style={tableStyles.th}>Total</th>
                <th style={tableStyles.th}>Expected</th>
                <th style={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={tableStyles.td}>
                    <span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>
                      {order.poNumber}
                    </span>
                  </td>
                  <td style={tableStyles.td}>{order.supplier?.name}</td>
                  <td style={tableStyles.td}><OrderStatusBadge status={order.status} /></td>
                  <td style={tableStyles.td}>{order.items?.length || 0} items</td>
                  <td style={tableStyles.td}>
                    <span style={{ fontWeight: '500' }}>${(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td style={tableStyles.td}>
                    {order.expectedDelivery || '—'}
                  </td>
                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {order.status === 'DRAFT' && (
                        <button onClick={() => updateOrderStatus(order.id, 'PENDING')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: theme.colors.status.requested.bg, color: theme.colors.status.requested.color, fontSize: '11px', cursor: 'pointer' }}>
                          Submit
                        </button>
                      )}
                      {order.status === 'PENDING' && (
                        <button onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: theme.colors.status.confirmed.bg, color: theme.colors.status.confirmed.color, fontSize: '11px', cursor: 'pointer' }}>
                          Confirm
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => updateOrderStatus(order.id, 'SHIPPED')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: theme.colors.status.inTransit.bg, color: theme.colors.status.inTransit.color, fontSize: '11px', cursor: 'pointer' }}>
                          Shipped
                        </button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: theme.colors.status.delivered.bg, color: theme.colors.status.delivered.color, fontSize: '11px', cursor: 'pointer' }}>
                          Delivered
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: theme.colors.bg.tertiary, color: theme.colors.text.secondary, fontSize: '11px', cursor: 'pointer' }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text.muted }}>
              No purchase orders yet
            </div>
          )}
        </Card>
      )}

      {/* Create Supplier Modal */}
      {showCreateSupplier && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 24px 0', color: theme.colors.text.primary }}>Add New Supplier</h3>
            <form onSubmit={createSupplier}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={inputStyles.label}>Supplier Code *</label>
                  <input value={supplierForm.supplierCode} onChange={e => setSupplierForm({ ...supplierForm, supplierCode: e.target.value })} style={inputStyles.input} placeholder="SUP-XXX" required />
                </div>
                <div>
                  <label style={inputStyles.label}>Company Name *</label>
                  <input value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} style={inputStyles.input} required />
                </div>
                <div>
                  <label style={inputStyles.label}>Contact Name</label>
                  <input value={supplierForm.contactName} onChange={e => setSupplierForm({ ...supplierForm, contactName: e.target.value })} style={inputStyles.input} />
                </div>
                <div>
                  <label style={inputStyles.label}>Email</label>
                  <input type="email" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} style={inputStyles.input} />
                </div>
                <div>
                  <label style={inputStyles.label}>Phone</label>
                  <input value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} style={inputStyles.input} />
                </div>
                <div>
                  <label style={inputStyles.label}>Payment Terms</label>
                  <select value={supplierForm.paymentTerms} onChange={e => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })} style={inputStyles.input}>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={inputStyles.label}>Address</label>
                  <input value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} style={inputStyles.input} />
                </div>
                <div>
                  <label style={inputStyles.label}>City</label>
                  <input value={supplierForm.city} onChange={e => setSupplierForm({ ...supplierForm, city: e.target.value })} style={inputStyles.input} />
                </div>
                <div>
                  <label style={inputStyles.label}>Country</label>
                  <input value={supplierForm.country} onChange={e => setSupplierForm({ ...supplierForm, country: e.target.value })} style={inputStyles.input} />
                </div>
                <div>
                  <label style={inputStyles.label}>Lead Time (days)</label>
                  <input type="number" value={supplierForm.leadTimeDays} onChange={e => setSupplierForm({ ...supplierForm, leadTimeDays: parseInt(e.target.value) })} style={inputStyles.input} min="1" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={inputStyles.label}>Notes</label>
                  <textarea value={supplierForm.notes} onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })} style={{ ...inputStyles.input, minHeight: '80px', resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowCreateSupplier(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Create Supplier</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 24px 0', color: theme.colors.text.primary }}>Create Purchase Order</h3>
            <form onSubmit={createOrder}>
              <div style={{ marginBottom: '16px' }}>
                <label style={inputStyles.label}>Supplier *</label>
                <select value={orderForm.supplierId} onChange={e => setOrderForm({ ...orderForm, supplierId: e.target.value })} style={inputStyles.input} required>
                  <option value="">Select supplier</option>
                  {suppliers.filter(s => s.status === 'ACTIVE').map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.supplierCode})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={inputStyles.label}>Shipping Address *</label>
                <select value={orderForm.shippingAddress} onChange={e => setOrderForm({ ...orderForm, shippingAddress: e.target.value })} style={inputStyles.input} required>
                  <option value="">Select destination</option>
                  {ALL_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ ...inputStyles.label, marginBottom: 0 }}>Order Items *</label>
                  <button type="button" onClick={addOrderItem} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '6px', color: theme.colors.text.secondary, fontSize: '12px', cursor: 'pointer' }}>+ Add Item</button>
                </div>
                {orderForm.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select value={item.sku} onChange={e => updateOrderItem(index, 'sku', e.target.value)} style={{ ...inputStyles.input, flex: 2 }} required>
                      <option value="">Select product</option>
                      {Object.entries(PRODUCT_CATALOG).map(([sku, product]) => (
                        <option key={sku} value={sku}>{sku} — {product.name}</option>
                      ))}
                    </select>
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateOrderItem(index, 'quantity', e.target.value)} style={{ ...inputStyles.input, flex: 1 }} min="1" required />
                    <input type="number" placeholder="Unit Cost" value={item.unitCost} onChange={e => updateOrderItem(index, 'unitCost', e.target.value)} style={{ ...inputStyles.input, flex: 1 }} min="0" step="0.01" required />
                    {orderForm.items.length > 1 && (
                      <button type="button" onClick={() => removeOrderItem(index)} style={{ padding: '10px', background: 'transparent', border: `1px solid ${theme.colors.status.error.color}30`, borderRadius: '6px', color: theme.colors.status.error.color, cursor: 'pointer' }}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={inputStyles.label}>Shipping Cost</label>
                  <input type="number" value={orderForm.shippingCost} onChange={e => setOrderForm({ ...orderForm, shippingCost: e.target.value })} style={inputStyles.input} min="0" step="0.01" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={inputStyles.label}>Notes</label>
                <textarea value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })} style={{ ...inputStyles.input, minHeight: '60px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateOrder(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Create Order</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: theme.colors.text.primary }}>{selectedSupplier.supplier?.name}</h3>
                <span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary }}>
                  {selectedSupplier.supplier?.supplierCode}
                </span>
              </div>
              <button onClick={() => setSelectedSupplier(null)} style={{ background: 'transparent', border: 'none', color: theme.colors.text.muted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Contact</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedSupplier.supplier?.contactName}</div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '13px' }}>{selectedSupplier.supplier?.email}</div>
                <div style={{ color: theme.colors.text.tertiary, fontSize: '13px' }}>{selectedSupplier.supplier?.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Location</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedSupplier.supplier?.address}</div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '13px' }}>{selectedSupplier.supplier?.city}, {selectedSupplier.supplier?.country}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Rating</div>
                <RatingStars rating={selectedSupplier.supplier?.rating} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Terms</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedSupplier.supplier?.paymentTerms} • {selectedSupplier.supplier?.leadTimeDays} days lead time</div>
              </div>
            </div>

            {/* Products */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.colors.text.secondary }}>Products ({selectedSupplier.products?.length || 0})</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {selectedSupplier.products?.map(product => (
                  <div key={product.id} style={{ padding: '12px', background: theme.colors.bg.primary, borderRadius: '8px', border: `1px solid ${theme.colors.border.subtle}` }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary }}>{product.sku}</div>
                    <div style={{ fontSize: '13px', color: theme.colors.text.primary, marginTop: '4px' }}>${product.unitCost?.toFixed(2)}</div>
                    <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>Min: {product.minOrderQty} units</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.colors.text.secondary }}>Recent Orders ({selectedSupplier.orders?.length || 0})</h4>
              {selectedSupplier.orders?.slice(0, 5).map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.colors.border.subtle}` }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', color: theme.colors.text.primary }}>{order.poNumber}</span>
                    <div style={{ fontSize: '12px', color: theme.colors.text.muted }}>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Draft'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <OrderStatusBadge status={order.status} />
                    <div style={{ fontSize: '13px', color: theme.colors.text.primary, marginTop: '4px' }}>${(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedSupplier(null)} style={{ width: '100%', padding: '12px', background: theme.colors.bg.tertiary, border: 'none', borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer', marginTop: '24px' }}>Close</button>
          </Card>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: theme.colors.text.primary }}>Purchase Order</h3>
                <span style={{ fontFamily: 'monospace', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary }}>
                  {selectedOrder.poNumber}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: theme.colors.text.muted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <OrderStatusBadge status={selectedOrder.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Supplier</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedOrder.supplier?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Ship To</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedOrder.shippingAddress}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Order Date</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Expected Delivery</div>
                <div style={{ color: theme.colors.text.primary }}>{selectedOrder.expectedDelivery || '—'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.colors.text.secondary }}>Items</h4>
              <table style={{ ...tableStyles.table, fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={tableStyles.th}>SKU</th>
                    <th style={tableStyles.th}>Qty</th>
                    <th style={tableStyles.th}>Unit Cost</th>
                    <th style={tableStyles.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, i) => (
                    <tr key={i}>
                      <td style={tableStyles.td}><span style={{ fontFamily: 'monospace' }}>{item.sku}</span></td>
                      <td style={tableStyles.td}>{item.quantity}</td>
                      <td style={tableStyles.td}>${item.unitCost?.toFixed(2)}</td>
                      <td style={tableStyles.td}>${item.totalCost?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: theme.colors.bg.primary, borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: theme.colors.text.secondary }}>Subtotal</span>
                <span style={{ color: theme.colors.text.primary }}>${(selectedOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: theme.colors.text.secondary }}>Tax</span>
                <span style={{ color: theme.colors.text.primary }}>${(selectedOrder.tax || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: theme.colors.text.secondary }}>Shipping</span>
                <span style={{ color: theme.colors.text.primary }}>${(selectedOrder.shippingCost || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${theme.colors.border.subtle}` }}>
                <span style={{ color: theme.colors.text.primary, fontWeight: '600' }}>Total</span>
                <span style={{ color: theme.colors.status.delivered.color, fontWeight: '600', fontSize: '18px' }}>${(selectedOrder.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{ width: '100%', padding: '12px', background: theme.colors.bg.tertiary, border: 'none', borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer', marginTop: '24px' }}>Close</button>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============================================
// ANALYTICS PAGE
// ============================================
const AnalyticsPage = () => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();

  // State
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [transfersByStatus, setTransfersByStatus] = useState([]);
  const [transfersByLocation, setTransfersByLocation] = useState([]);
  const [dailyTransfers, setDailyTransfers] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [monthlySpend, setMonthlySpend] = useState([]);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endpoints = [
        `${API_BASE}/analytics/kpis`,
        `${API_BASE}/analytics/transfers/by-status`,
        `${API_BASE}/analytics/transfers/by-location`,
        `${API_BASE}/analytics/transfers/daily?days=30`,
        `${API_BASE}/analytics/suppliers/top?limit=5`,
        `${API_BASE}/analytics/orders/by-status`,
        `${API_BASE}/analytics/orders/monthly-spend?months=6`,
        `${API_BASE}/analytics/performance`
      ];

      const responses = await Promise.all(endpoints.map(url => fetch(url)));
      const data = await Promise.all(responses.map(res => res.ok ? res.json() : null));

      setKpis(data[0]);
      setTransfersByStatus(data[1] || []);
      setTransfersByLocation(data[2] || []);
      setDailyTransfers(data[3] || []);
      setTopSuppliers(data[4] || []);
      setOrdersByStatus(data[5] || []);
      setMonthlySpend(data[6] || []);
      setPerformance(data[7]);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Chart colors
  const chartColors = {
    primary: themeName === 'vibrant' ? theme.colors.accent.primary : '#fafafa',
    secondary: themeName === 'vibrant' ? theme.colors.accent.secondary : '#a1a1aa',
    success: theme.colors.status.delivered.color,
    warning: theme.colors.status.requested.color,
    danger: theme.colors.status.error.color,
    info: theme.colors.status.inTransit.color
  };

  const statusColors = {
    REQUESTED: chartColors.warning,
    CONFIRMED: chartColors.success,
    IN_TRANSIT: chartColors.info,
    DELIVERED: chartColors.success,
    CANCELLED: theme.colors.text.muted,
    FAILED: chartColors.danger,
    DRAFT: theme.colors.text.muted,
    PENDING: chartColors.warning,
    SHIPPED: chartColors.info
  };

  // Simple Bar Chart Component
  const BarChart = ({ data, dataKey, nameKey, color, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey] || 0), 1);
    
    return (
      <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '20px' }}>
        {data.map((item, i) => {
          const value = item[dataKey] || 0;
          const barHeight = (value / maxValue) * (height - 40);
          
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', color: theme.colors.text.secondary, marginBottom: '4px' }}>
                {value}
              </div>
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  background: typeof color === 'function' ? color(item) : (color || chartColors.primary),
                  borderRadius: '4px 4px 0 0',
                  minHeight: value > 0 ? '4px' : '0',
                  transition: 'height 0.3s ease'
                }}
                title={`${item[nameKey]}: ${value}`}
              />
              <div style={{ 
                fontSize: '9px', 
                color: theme.colors.text.muted, 
                marginTop: '6px',
                textAlign: 'center',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item[nameKey]}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Donut Chart Component
  const DonutChart = ({ data, dataKey, nameKey, size = 160 }) => {
    const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
    let currentAngle = 0;
    const colors = [chartColors.success, chartColors.warning, chartColors.info, chartColors.danger, theme.colors.text.muted, chartColors.secondary];

    const segments = data.map((item, i) => {
      const value = item[dataKey] || 0;
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        ...item,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: statusColors[item[nameKey]] || colors[i % colors.length]
      };
    });

    // Create SVG path for each segment
    const createArc = (startAngle, endAngle, innerRadius, outerRadius) => {
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;

      const x1 = size / 2 + outerRadius * Math.cos(startRad);
      const y1 = size / 2 + outerRadius * Math.sin(startRad);
      const x2 = size / 2 + outerRadius * Math.cos(endRad);
      const y2 = size / 2 + outerRadius * Math.sin(endRad);
      const x3 = size / 2 + innerRadius * Math.cos(endRad);
      const y3 = size / 2 + innerRadius * Math.sin(endRad);
      const x4 = size / 2 + innerRadius * Math.cos(startRad);
      const y4 = size / 2 + innerRadius * Math.sin(startRad);

      return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <svg width={size} height={size}>
          {segments.map((seg, i) => (
            seg.percentage > 0 && (
              <path
                key={i}
                d={createArc(seg.startAngle, seg.endAngle, size * 0.25, size * 0.45)}
                fill={seg.color}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          ))}
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={theme.colors.text.primary}
            fontSize="24"
            fontWeight="600"
          >
            {total}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 18}
            textAnchor="middle"
            fill={theme.colors.text.muted}
            fontSize="10"
          >
            total
          </text>
        </svg>
        <div style={{ flex: 1 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: seg.color }} />
              <span style={{ flex: 1, fontSize: '12px', color: theme.colors.text.secondary }}>{seg[nameKey]}</span>
              <span style={{ fontSize: '12px', color: theme.colors.text.primary, fontWeight: '500' }}>{seg[dataKey]}</span>
              <span style={{ fontSize: '11px', color: theme.colors.text.muted }}>({seg.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Line Sparkline Component
  const Sparkline = ({ data, dataKey, height = 60, color }) => {
    const values = data.map(d => d[dataKey] || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = height - ((v - min) / range) * (height - 10) - 5;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        <polyline
          points={points}
          fill="none"
          stroke={color || chartColors.primary}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {values.map((v, i) => {
          const x = (i / (values.length - 1)) * 100;
          const y = height - ((v - min) / range) * (height - 10) - 5;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={y}
              r="3"
              fill={color || chartColors.primary}
              style={{ opacity: i === values.length - 1 ? 1 : 0 }}
            />
          );
        })}
      </svg>
    );
  };

  // KPI Card Component
  const KPICard = ({ title, value, subtitle, icon, trend, color }) => (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '32px', fontWeight: '600', color: color || theme.colors.text.primary }}>{value}</div>
          {subtitle && <div style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginTop: '4px' }}>{subtitle}</div>}
        </div>
        {themeName === 'vibrant' && icon && (
          <div style={{ 
            fontSize: '24px', 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.colors.accent.primary}20, ${theme.colors.accent.secondary}20)`,
            borderRadius: '12px'
          }}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ 
          marginTop: '12px', 
          fontSize: '12px', 
          color: trend >= 0 ? chartColors.success : chartColors.danger 
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
        </div>
      )}
    </Card>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Loading analytics...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
          {themeName === 'vibrant' && '📊 '}Analytics Dashboard
        </h1>
        <p style={{ color: theme.colors.text.tertiary, marginTop: '8px', fontSize: '14px' }}>
          Real-time insights and performance metrics
        </p>
      </div>

      {/* Main KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard 
          title="Total Transfers" 
          value={kpis?.totalTransfers || 0}
          subtitle={`${kpis?.deliveredTransfers || 0} delivered`}
          icon="📦"
          color={themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary}
        />
        <KPICard 
          title="Delivery Rate" 
          value={`${kpis?.deliveryRate || 0}%`}
          subtitle="Successfully completed"
          icon="✓"
          color={chartColors.success}
        />
        <KPICard 
          title="Blockchain Verified" 
          value={kpis?.blockchainVerified || 0}
          subtitle={`${kpis?.blockchainRate || 0}% on-chain`}
          icon="⛓️"
          color={themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary}
        />
        <KPICard 
          title="Total Spend" 
          value={`$${((kpis?.totalPurchaseValue || 0) / 1000).toFixed(1)}K`}
          subtitle={`${kpis?.totalPurchaseOrders || 0} orders`}
          icon="💰"
          color={chartColors.success}
        />
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPICard 
          title="Active Suppliers" 
          value={kpis?.activeSuppliers || 0}
          subtitle={`of ${kpis?.totalSuppliers || 0} total`}
          icon="🏭"
        />
        <KPICard 
          title="Pending Transfers" 
          value={kpis?.pendingTransfers || 0}
          subtitle="Awaiting action"
          icon="⏳"
          color={chartColors.warning}
        />
        <KPICard 
          title="Total Users" 
          value={kpis?.totalUsers || 0}
          subtitle={`${kpis?.recentLogins || 0} recent logins`}
          icon="👥"
        />
        <KPICard 
          title="Cancellation Rate" 
          value={`${kpis?.cancellationRate || 0}%`}
          subtitle={`${kpis?.cancelledTransfers || 0} cancelled`}
          icon="✕"
          color={kpis?.cancellationRate > 10 ? chartColors.danger : theme.colors.text.tertiary}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
            {themeName === 'vibrant' && '📈 '}Transfer Volume (30 Days)
          </h3>
          <BarChart 
            data={dailyTransfers.slice(-15)} 
            dataKey="count" 
            nameKey="date"
            color={chartColors.primary}
            height={180}
          />
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
            {themeName === 'vibrant' && '📊 '}Transfers by Status
          </h3>
          <DonutChart 
            data={transfersByStatus} 
            dataKey="count" 
            nameKey="status"
          />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
            {themeName === 'vibrant' && '📍 '}Top Locations by Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transfersByLocation.slice(0, 8).map((loc, i) => {
              const maxTotal = Math.max(...transfersByLocation.map(l => l.total || 0), 1);
              const percentage = ((loc.total || 0) / maxTotal) * 100;
              
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{loc.location}</span>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                      <span style={{ color: chartColors.info }}>↑ {loc.incoming}</span>
                      <span style={{ color: chartColors.warning }}>↓ {loc.outgoing}</span>
                      <span style={{ color: theme.colors.text.primary, fontWeight: '500' }}>{loc.total}</span>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: theme.colors.bg.primary, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: theme.useGradients 
                        ? `linear-gradient(90deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`
                        : theme.colors.text.tertiary,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
            {themeName === 'vibrant' && '📋 '}Orders by Status
          </h3>
          <DonutChart 
            data={ordersByStatus} 
            dataKey="count" 
            nameKey="status"
            size={140}
          />
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
            {themeName === 'vibrant' && '💰 '}Monthly Purchase Spend
          </h3>
          <BarChart 
            data={monthlySpend} 
            dataKey="total" 
            nameKey="month"
            color={chartColors.success}
            height={180}
          />
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
            {themeName === 'vibrant' && '⭐ '}Top Suppliers
          </h3>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Supplier</th>
                <th style={tableStyles.th}>Rating</th>
                <th style={tableStyles.th}>Orders</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map((supplier, i) => (
                <tr key={i}>
                  <td style={tableStyles.td}>
                    <div>
                      <div style={{ color: theme.colors.text.primary, fontSize: '13px' }}>{supplier.name}</div>
                      <div style={{ color: theme.colors.text.muted, fontSize: '11px' }}>{supplier.country}</div>
                    </div>
                  </td>
                  <td style={tableStyles.td}>
                    <span style={{ color: '#fbbf24' }}>★</span>
                    <span style={{ marginLeft: '4px', color: theme.colors.text.primary }}>{(supplier.rating || 0).toFixed(1)}</span>
                  </td>
                  <td style={tableStyles.td}>{supplier.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
          {themeName === 'vibrant' && '🎯 '}Performance Metrics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: theme.colors.bg.primary, borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', fontWeight: '600', color: chartColors.primary }}>{performance?.avgTransfersPerDay || 0}</div>
            <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginTop: '4px' }}>Avg Transfers/Day</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: theme.colors.bg.primary, borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', fontWeight: '600', color: chartColors.success }}>${(performance?.avgOrderValue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginTop: '4px' }}>Avg Order Value</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: theme.colors.bg.primary, borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', fontWeight: '600', color: chartColors.success }}>{performance?.onTimeDeliveryRate || 0}%</div>
            <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginTop: '4px' }}>On-Time Delivery</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: theme.colors.bg.primary, borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', fontWeight: '600', color: chartColors.info }}>{performance?.avgSupplierResponseDays || 0}</div>
            <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginTop: '4px' }}>Avg Response (Days)</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================
// DOCUMENTS PAGE
// ============================================
const DocumentsPage = () => {
  const { theme, themeName } = useTheme();
  const tableStyles = useTableStyles();
  const inputStyles = useInputStyles();

  // State
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Modal states
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    fileName: '',
    fileType: '',
    fileSize: 0,
    category: 'OTHER',
    transferId: '',
    supplierId: '',
    purchaseOrderId: '',
    tags: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, catsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/documents`),
        fetch(`${API_BASE}/documents/categories`),
        fetch(`${API_BASE}/documents/stats`)
      ]);

      if (docsRes.ok) setDocuments(await docsRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          supplierId: uploadForm.supplierId ? parseInt(uploadForm.supplierId) : null,
          purchaseOrderId: uploadForm.purchaseOrderId ? parseInt(uploadForm.purchaseOrderId) : null,
          tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()).filter(t => t) : []
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to upload document');

      setDocuments([data, ...documents]);
      setShowUpload(false);
      setUploadForm({ name: '', description: '', fileName: '', fileType: '', fileSize: 0, category: 'OTHER', transferId: '', supplierId: '', purchaseOrderId: '', tags: '' });
      setSuccess('Document uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadData(); // Refresh stats
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        setSuccess('Document deleted');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = search === '' ||
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.documentCode?.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory && doc.status !== 'DELETED';
  });

  // Category icons and colors
  const categoryConfig = {
    INVOICE: { icon: '📄', color: '#10b981' },
    CONTRACT: { icon: '📝', color: '#6366f1' },
    SHIPPING: { icon: '🚚', color: '#f59e0b' },
    CERTIFICATE: { icon: '📜', color: '#8b5cf6' },
    REPORT: { icon: '📊', color: '#3b82f6' },
    RECEIPT: { icon: '🧾', color: '#14b8a6' },
    MANUAL: { icon: '📖', color: '#64748b' },
    IMAGE: { icon: '🖼️', color: '#ec4899' },
    OTHER: { icon: '📁', color: '#71717a' }
  };

  // File type icons
  const getFileIcon = (fileType) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📗';
    if (fileType.includes('word') || fileType.includes('document')) return '📘';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
    return '📄';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Loading documents...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
          {themeName === 'vibrant' && '📁 '}Document Management
        </h1>
        <p style={{ color: theme.colors.text.tertiary, marginTop: '8px', fontSize: '14px' }}>
          Upload, organize, and manage all your documents
        </p>
      </div>

      {success && <div style={{ background: theme.colors.status.delivered.bg, border: `1px solid ${theme.colors.status.delivered.color}30`, borderRadius: '8px', padding: '12px', marginBottom: '20px', color: theme.colors.status.delivered.color, fontSize: '13px' }}>{success}</div>}
      {error && <div style={{ background: theme.colors.status.error.bg, border: `1px solid ${theme.colors.status.error.color}30`, borderRadius: '8px', padding: '12px', marginBottom: '20px', color: theme.colors.status.error.color, fontSize: '13px' }}>{error}</div>}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Documents</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>{stats?.totalDocuments || 0}</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Active</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.status.delivered.color }}>{stats?.activeDocuments || 0}</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Total Size</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.primary }}>{stats?.totalSizeMB || 0} MB</div>
        </Card>
        <Card>
          <div style={{ fontSize: '12px', color: theme.colors.text.muted, marginBottom: '4px' }}>Categories</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: theme.colors.text.primary }}>{categories.length}</div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyles.input, minWidth: '200px', flex: 1, maxWidth: '300px' }}
            />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ ...inputStyles.input, minWidth: '150px' }}
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  background: viewMode === 'grid' ? theme.colors.bg.tertiary : 'transparent',
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: '6px',
                  color: theme.colors.text.secondary,
                  cursor: 'pointer'
                }}
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  background: viewMode === 'list' ? theme.colors.bg.tertiary : 'transparent',
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: '6px',
                  color: theme.colors.text.secondary,
                  cursor: 'pointer'
                }}
              >
                ☰
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              padding: '10px 20px',
              background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            + Upload Document
          </button>
        </div>
      </Card>

      {/* Documents Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredDocuments.map(doc => {
            const catConfig = categoryConfig[doc.category] || categoryConfig.OTHER;
            return (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDocument(doc)}
                style={{ 
                  padding: '20px',
                  background: theme.colors.bg.secondary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border.subtle}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.colors.border.default}
                onMouseLeave={e => e.currentTarget.style.borderColor = theme.colors.border.subtle}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: `${catConfig.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: theme.colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </h4>
                    <div style={{ fontSize: '11px', color: theme.colors.text.muted, fontFamily: 'monospace' }}>
                      {doc.documentCode}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.fileName}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: `${catConfig.color}20`,
                    color: catConfig.color,
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {catConfig.icon} {doc.category}
                  </span>
                  <span style={{ fontSize: '11px', color: theme.colors.text.muted }}>
                    {formatFileSize(doc.fileSize)}
                  </span>
                </div>

                {doc.tags && doc.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {doc.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} style={{
                        padding: '2px 6px',
                        background: theme.colors.bg.tertiary,
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: theme.colors.text.muted
                      }}>
                        #{tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span style={{ fontSize: '10px', color: theme.colors.text.muted }}>+{doc.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Documents List View */}
      {viewMode === 'list' && (
        <Card>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Document</th>
                <th style={tableStyles.th}>Category</th>
                <th style={tableStyles.th}>Size</th>
                <th style={tableStyles.th}>Uploaded</th>
                <th style={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => {
                const catConfig = categoryConfig[doc.category] || categoryConfig.OTHER;
                return (
                  <tr key={doc.id}>
                    <td style={tableStyles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{getFileIcon(doc.fileType)}</span>
                        <div>
                          <div style={{ color: theme.colors.text.primary, fontSize: '13px' }}>{doc.name}</div>
                          <div style={{ color: theme.colors.text.muted, fontSize: '11px', fontFamily: 'monospace' }}>{doc.documentCode}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: `${catConfig.color}20`,
                        color: catConfig.color,
                        fontSize: '11px'
                      }}>
                        {catConfig.icon} {doc.category}
                      </span>
                    </td>
                    <td style={tableStyles.td}>{formatFileSize(doc.fileSize)}</td>
                    <td style={tableStyles.td}>
                      <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}</div>
                      <div style={{ fontSize: '11px', color: theme.colors.text.muted }}>{doc.uploadedBy}</div>
                    </td>
                    <td style={tableStyles.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setSelectedDocument(doc)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: theme.colors.bg.tertiary, color: theme.colors.text.secondary, fontSize: '11px', cursor: 'pointer' }}>View</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: theme.colors.status.error.bg, color: theme.colors.status.error.color, fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredDocuments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text.muted }}>No documents found</div>
          )}
        </Card>
      )}

      {filteredDocuments.length === 0 && viewMode === 'grid' && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <div>No documents found</div>
            <button
              onClick={() => setShowUpload(true)}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: theme.colors.bg.tertiary,
                border: 'none',
                borderRadius: '8px',
                color: theme.colors.text.secondary,
                cursor: 'pointer'
              }}
            >
              Upload your first document
            </button>
          </div>
        </Card>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 24px 0', color: theme.colors.text.primary }}>Upload Document</h3>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '16px' }}>
                <label style={inputStyles.label}>Document Name *</label>
                <input value={uploadForm.name} onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })} style={inputStyles.input} placeholder="Invoice #123" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={inputStyles.label}>File Name *</label>
                  <input value={uploadForm.fileName} onChange={e => setUploadForm({ ...uploadForm, fileName: e.target.value })} style={inputStyles.input} placeholder="document.pdf" required />
                </div>
                <div>
                  <label style={inputStyles.label}>Category *</label>
                  <select value={uploadForm.category} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })} style={inputStyles.input} required>
                    {categories.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={inputStyles.label}>File Type</label>
                  <select value={uploadForm.fileType} onChange={e => setUploadForm({ ...uploadForm, fileType: e.target.value })} style={inputStyles.input}>
                    <option value="">Select type</option>
                    <option value="application/pdf">PDF</option>
                    <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel</option>
                    <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word</option>
                    <option value="image/jpeg">JPEG Image</option>
                    <option value="image/png">PNG Image</option>
                    <option value="text/plain">Text</option>
                  </select>
                </div>
                <div>
                  <label style={inputStyles.label}>File Size (bytes)</label>
                  <input type="number" value={uploadForm.fileSize} onChange={e => setUploadForm({ ...uploadForm, fileSize: parseInt(e.target.value) || 0 })} style={inputStyles.input} placeholder="1024" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={inputStyles.label}>Description</label>
                <textarea value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} style={{ ...inputStyles.input, minHeight: '80px', resize: 'vertical' }} placeholder="Optional description..." />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={inputStyles.label}>Tags (comma separated)</label>
                <input value={uploadForm.tags} onChange={e => setUploadForm({ ...uploadForm, tags: e.target.value })} style={inputStyles.input} placeholder="invoice, supplier, 2024" />
              </div>

              <div style={{ marginBottom: '16px', padding: '16px', background: theme.colors.bg.primary, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '12px' }}>Link to (optional)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ ...inputStyles.label, fontSize: '11px' }}>Transfer ID</label>
                    <input value={uploadForm.transferId} onChange={e => setUploadForm({ ...uploadForm, transferId: e.target.value })} style={{ ...inputStyles.input, fontSize: '12px' }} placeholder="TRF-001" />
                  </div>
                  <div>
                    <label style={{ ...inputStyles.label, fontSize: '11px' }}>Supplier ID</label>
                    <input type="number" value={uploadForm.supplierId} onChange={e => setUploadForm({ ...uploadForm, supplierId: e.target.value })} style={{ ...inputStyles.input, fontSize: '12px' }} placeholder="1" />
                  </div>
                  <div>
                    <label style={{ ...inputStyles.label, fontSize: '11px' }}>PO ID</label>
                    <input type="number" value={uploadForm.purchaseOrderId} onChange={e => setUploadForm({ ...uploadForm, purchaseOrderId: e.target.value })} style={{ ...inputStyles.input, fontSize: '12px' }} placeholder="1" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowUpload(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${theme.colors.border.default}`, borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Upload</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Document Details Modal */}
      {selectedDocument && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: `${(categoryConfig[selectedDocument.category] || categoryConfig.OTHER).color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px'
                }}>
                  {getFileIcon(selectedDocument.fileType)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: theme.colors.text.primary }}>{selectedDocument.name}</h3>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: themeName === 'vibrant' ? theme.colors.accent.primary : theme.colors.text.secondary }}>
                    {selectedDocument.documentCode}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDocument(null)} style={{ background: 'transparent', border: 'none', color: theme.colors.text.muted, fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {selectedDocument.description && (
              <div style={{ marginBottom: '20px', padding: '12px', background: theme.colors.bg.primary, borderRadius: '8px', fontSize: '13px', color: theme.colors.text.secondary }}>
                {selectedDocument.description}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>File Name</div>
                <div style={{ fontSize: '13px', color: theme.colors.text.primary }}>{selectedDocument.fileName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Category</div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: `${(categoryConfig[selectedDocument.category] || categoryConfig.OTHER).color}20`,
                  color: (categoryConfig[selectedDocument.category] || categoryConfig.OTHER).color,
                  fontSize: '12px'
                }}>
                  {(categoryConfig[selectedDocument.category] || categoryConfig.OTHER).icon} {selectedDocument.category}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>File Size</div>
                <div style={{ fontSize: '13px', color: theme.colors.text.primary }}>{formatFileSize(selectedDocument.fileSize)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Version</div>
                <div style={{ fontSize: '13px', color: theme.colors.text.primary }}>v{selectedDocument.version}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Uploaded By</div>
                <div style={{ fontSize: '13px', color: theme.colors.text.primary }}>{selectedDocument.uploadedBy || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Upload Date</div>
                <div style={{ fontSize: '13px', color: theme.colors.text.primary }}>{selectedDocument.createdAt ? new Date(selectedDocument.createdAt).toLocaleString() : '—'}</div>
              </div>
            </div>

            {/* Associations */}
            {(selectedDocument.transferId || selectedDocument.supplierName || selectedDocument.poNumber) && (
              <div style={{ marginBottom: '20px', padding: '16px', background: theme.colors.bg.primary, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '12px' }}>Linked To</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedDocument.transferId && (
                    <span style={{ padding: '6px 12px', background: theme.colors.status.inTransit.bg, color: theme.colors.status.inTransit.color, borderRadius: '6px', fontSize: '12px' }}>
                      📦 Transfer: {selectedDocument.transferId}
                    </span>
                  )}
                  {selectedDocument.supplierName && (
                    <span style={{ padding: '6px 12px', background: theme.colors.bg.tertiary, color: theme.colors.text.secondary, borderRadius: '6px', fontSize: '12px' }}>
                      🏭 Supplier: {selectedDocument.supplierName}
                    </span>
                  )}
                  {selectedDocument.poNumber && (
                    <span style={{ padding: '6px 12px', background: theme.colors.status.requested.bg, color: theme.colors.status.requested.color, borderRadius: '6px', fontSize: '12px' }}>
                      📋 PO: {selectedDocument.poNumber}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedDocument.tags && selectedDocument.tags.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '8px' }}>Tags</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedDocument.tags.map((tag, i) => (
                    <span key={i} style={{
                      padding: '4px 10px',
                      background: theme.colors.bg.tertiary,
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: theme.colors.text.secondary
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hash */}
            <div style={{ marginBottom: '20px', padding: '12px', background: theme.colors.bg.primary, borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: theme.colors.text.muted, marginBottom: '4px' }}>Document Hash (SHA-256)</div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: theme.colors.text.tertiary, wordBreak: 'break-all' }}>
                {selectedDocument.hash}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setSelectedDocument(null)} style={{ flex: 1, padding: '12px', background: theme.colors.bg.tertiary, border: 'none', borderRadius: '8px', color: theme.colors.text.secondary, cursor: 'pointer' }}>Close</button>
              <button 
                onClick={() => {
                  // Simulate download - in real app, this would fetch from server
                  const blob = new Blob([`Document: ${selectedDocument.name}\nCode: ${selectedDocument.documentCode}\nFile: ${selectedDocument.fileName}\nHash: ${selectedDocument.hash}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = selectedDocument.fileName || 'document.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }} 
                style={{ flex: 1, padding: '12px', background: theme.useGradients ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` : theme.colors.text.primary, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
              >
                {themeName === 'vibrant' && '📥 '}Download
              </button>
              <button onClick={() => { deleteDocument(selectedDocument.id); setSelectedDocument(null); }} style={{ padding: '12px 24px', background: theme.colors.status.error.bg, border: 'none', borderRadius: '8px', color: theme.colors.status.error.color, cursor: 'pointer' }}>Delete</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};



// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('theme') || 'professional');
  const [user, setUser] = useState(() => { const saved = localStorage.getItem('user'); return saved ? JSON.parse(saved) : null; });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transfers, setTransfers] = useState([]);
  const [inventory] = useState(() => generateInventory());
  const theme = themes[themeName];

  useEffect(() => { localStorage.setItem('theme', themeName); }, [themeName]);

useEffect(() => {
    const handleNavigate = (e) => setCurrentPage(e.detail);
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  useEffect(() => {
    if (user) {
      // Load transfers from API
      fetch(`${API_BASE}/transfers`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setTransfers(data))
        .catch(() => {
          const saved = localStorage.getItem('transfers');
          if (saved) setTransfers(JSON.parse(saved));
        });
    }
  }, [user]);

  useEffect(() => { if (transfers.length > 0) localStorage.setItem('transfers', JSON.stringify(transfers)); }, [transfers]);

  const handleLogin = (userData) => { setUser(userData); localStorage.setItem('user', JSON.stringify(userData)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('user'); setCurrentPage('dashboard'); };
  const handleTransferCreated = (newTransfer) => setTransfers([newTransfer, ...transfers]);

  if (!user) return <ThemeContext.Provider value={{ theme, themeName, setThemeName }}><LoginPage onLogin={handleLogin} /></ThemeContext.Provider>;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage transfers={transfers} inventory={inventory} user={user} />;
      case 'transfers': return hasPermission(user, 'transfers.read') ? <TransfersPage transfers={transfers} setTransfers={setTransfers} user={user} /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'new-transfer': return hasPermission(user, 'transfers.create') ? <NewTransferPage onTransferCreated={handleTransferCreated} /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'inventory': return hasPermission(user, 'inventory.read') ? <InventoryPage inventory={inventory} /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'reports': return hasPermission(user, 'reports.view') ? <ReportsPage transfers={transfers} inventory={inventory} /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'audit': return hasPermission(user, 'audit.view') ? <AuditPage /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'suppliers': return hasPermission(user, 'inventory.read') ? <SuppliersPage /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'analytics': return hasPermission(user, 'reports.view') ? <AnalyticsPage /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'documents': return hasPermission(user, 'inventory.read') ? <DocumentsPage /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      case 'users': return isAdmin(user) ? <UsersPage /> : <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.text.muted }}>Access Denied</div>;
      default: return <DashboardPage transfers={transfers} inventory={inventory} user={user} />;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName }}>
      <ToastProvider>
        <AuthContext.Provider value={{ user, hasPermission: (perm) => hasPermission(user, perm) }}>
          <div style={{ minHeight: '100vh', background: theme.colors.bg.primary, color: theme.colors.text.primary, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", transition: 'background 0.3s ease' }}>
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} onLogout={handleLogout} />
            <main style={{ marginLeft: '250px', padding: '32px 40px', minHeight: '100vh' }}>{renderPage()}</main>
          </div>
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(100px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>
        </AuthContext.Provider>
      </ToastProvider>
    </ThemeContext.Provider>
  );
};

