import React, { useState, useEffect, createContext, useContext } from 'react';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE = 'http://localhost:8080/api';

// ============================================
// AUTHENTICATION CONTEXT
// ============================================
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// ============================================
// ROLE DEFINITIONS & PERMISSIONS
// ============================================
const ROLES = {
  ADMIN: {
    name: 'Administrator',
    level: 5,
    color: '#ef4444',
    permissions: ['all']
  },
  WAREHOUSE_MANAGER: {
    name: 'Warehouse Manager',
    level: 4,
    color: '#8b5cf6',
    permissions: ['create_transfer', 'cancel_transfer', 'approve_transfer', 'update_status', 'view_transfers', 'view_inventory', 'view_reports']
  },
  LOGISTICS: {
    name: 'Logistics',
    level: 3,
    color: '#3b82f6',
    permissions: ['update_status', 'view_transfers', 'view_inventory', 'view_reports']
  },
  INVENTORY_CLERK: {
    name: 'Inventory Clerk',
    level: 2,
    color: '#10b981',
    permissions: ['create_transfer', 'view_transfers', 'view_inventory', 'view_reports']
  },
  VIEWER: {
    name: 'Viewer',
    level: 1,
    color: '#6b7280',
    permissions: ['view_inventory']
  }
};

// Demo users for testing
const DEMO_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'John Admin', role: 'ADMIN', location: 'ALL' },
  { id: 2, username: 'manager', password: 'manager123', name: 'Sarah Manager', role: 'WAREHOUSE_MANAGER', location: 'WAREHOUSE-NORTH-01' },
  { id: 3, username: 'logistics', password: 'logistics123', name: 'Mike Driver', role: 'LOGISTICS', location: 'DISTRIBUTION-CENTER-MAIN' },
  { id: 4, username: 'clerk', password: 'clerk123', name: 'Emily Clerk', role: 'INVENTORY_CLERK', location: 'WAREHOUSE-SOUTH-02' },
  { id: 5, username: 'viewer', password: 'viewer123', name: 'Bob Viewer', role: 'VIEWER', location: 'STORE-DOWNTOWN-001' },
];

const hasPermission = (user, permission) => {
  if (!user) return false;
  const role = ROLES[user.role];
  if (!role) return false;
  return role.permissions.includes('all') || role.permissions.includes(permission);
};

// ============================================
// PRODUCT CATALOG
// ============================================
const PRODUCT_CATALOG = {
  'ELEC-TV-55-4K': { name: 'Smart TV 55" 4K UHD', category: 'Electronics', unit: 'units', price: 599.99 },
  'ELEC-TV-65-4K': { name: 'Smart TV 65" 4K UHD', category: 'Electronics', unit: 'units', price: 899.99 },
  'ELEC-LAPTOP-PRO': { name: 'Laptop Pro 15.6"', category: 'Electronics', unit: 'units', price: 1299.99 },
  'ELEC-PHONE-PRO': { name: 'Smartphone Pro Max', category: 'Electronics', unit: 'units', price: 999.99 },
  'ELEC-TABLET-10': { name: 'Tablet 10.5"', category: 'Electronics', unit: 'units', price: 449.99 },
  'ELEC-HEADPHONE-BT': { name: 'Wireless Headphones', category: 'Electronics', unit: 'units', price: 199.99 },
  'ELEC-SPEAKER-BT': { name: 'Bluetooth Speaker', category: 'Electronics', unit: 'units', price: 79.99 },
  'ELEC-CHARGER-USB': { name: 'USB-C Fast Charger', category: 'Electronics', unit: 'units', price: 29.99 },
  'FURN-CHAIR-OFF': { name: 'Office Chair Ergonomic', category: 'Furniture', unit: 'units', price: 299.99 },
  'FURN-DESK-STD': { name: 'Standing Desk 60"', category: 'Furniture', unit: 'units', price: 499.99 },
  'FURN-SHELF-5T': { name: 'Storage Shelf 5-Tier', category: 'Furniture', unit: 'units', price: 89.99 },
  'FURN-CABINET-2D': { name: 'Filing Cabinet 2-Drawer', category: 'Furniture', unit: 'units', price: 149.99 },
  'FURN-TABLE-CONF': { name: 'Conference Table 8ft', category: 'Furniture', unit: 'units', price: 799.99 },
  'APRL-SHIRT-M-BLU': { name: 'Dress Shirt Blue (M)', category: 'Apparel', unit: 'units', price: 49.99 },
  'APRL-SHIRT-L-BLU': { name: 'Dress Shirt Blue (L)', category: 'Apparel', unit: 'units', price: 49.99 },
  'APRL-SHIRT-XL-BLU': { name: 'Dress Shirt Blue (XL)', category: 'Apparel', unit: 'units', price: 49.99 },
  'APRL-PANTS-32-BLK': { name: 'Dress Pants Black (32)', category: 'Apparel', unit: 'units', price: 69.99 },
  'APRL-PANTS-34-BLK': { name: 'Dress Pants Black (34)', category: 'Apparel', unit: 'units', price: 69.99 },
  'APRL-JACKET-M': { name: 'Winter Jacket (M)', category: 'Apparel', unit: 'units', price: 129.99 },
  'APRL-SHOES-10-BRN': { name: 'Leather Shoes Brown (10)', category: 'Apparel', unit: 'pairs', price: 159.99 },
  'FOOD-RICE-5KG': { name: 'Premium Rice 5kg', category: 'Food & Beverage', unit: 'bags', price: 12.99 },
  'FOOD-PASTA-1KG': { name: 'Italian Pasta 1kg', category: 'Food & Beverage', unit: 'packs', price: 4.99 },
  'FOOD-OIL-1L': { name: 'Olive Oil 1L', category: 'Food & Beverage', unit: 'bottles', price: 8.99 },
  'FOOD-COFFEE-500G': { name: 'Ground Coffee 500g', category: 'Food & Beverage', unit: 'bags', price: 14.99 },
  'BEV-WATER-24PK': { name: 'Spring Water 24-Pack', category: 'Food & Beverage', unit: 'cases', price: 6.99 },
  'BEV-SODA-12PK': { name: 'Cola 12-Pack', category: 'Food & Beverage', unit: 'cases', price: 5.99 },
  'PHAR-VITAMIN-C': { name: 'Vitamin C 1000mg (60ct)', category: 'Pharmaceuticals', unit: 'bottles', price: 12.99 },
  'PHAR-PAIN-REL': { name: 'Pain Reliever (100ct)', category: 'Pharmaceuticals', unit: 'bottles', price: 9.99 },
  'PHAR-BANDAGE-50': { name: 'Adhesive Bandages (50ct)', category: 'Pharmaceuticals', unit: 'boxes', price: 7.99 },
  'PHAR-SANITIZER-1L': { name: 'Hand Sanitizer 1L', category: 'Pharmaceuticals', unit: 'bottles', price: 8.99 },
  'AUTO-OIL-5W30': { name: 'Motor Oil 5W-30 (5qt)', category: 'Automotive', unit: 'jugs', price: 28.99 },
  'AUTO-FILTER-OIL': { name: 'Oil Filter Universal', category: 'Automotive', unit: 'units', price: 9.99 },
  'AUTO-BRAKE-PAD': { name: 'Brake Pads (Set)', category: 'Automotive', unit: 'sets', price: 49.99 },
  'AUTO-BATTERY-12V': { name: 'Car Battery 12V', category: 'Automotive', unit: 'units', price: 129.99 },
  'AUTO-TIRE-205': { name: 'Tire 205/55R16', category: 'Automotive', unit: 'units', price: 89.99 },
  'OFFC-PAPER-A4': { name: 'Copy Paper A4 (500 sheets)', category: 'Office Supplies', unit: 'reams', price: 8.99 },
  'OFFC-PEN-BLK-12': { name: 'Ballpoint Pens Black (12pk)', category: 'Office Supplies', unit: 'packs', price: 6.99 },
  'OFFC-STAPLER': { name: 'Heavy Duty Stapler', category: 'Office Supplies', unit: 'units', price: 19.99 },
  'OFFC-FOLDER-100': { name: 'Manila Folders (100ct)', category: 'Office Supplies', unit: 'boxes', price: 24.99 },
};

// ============================================
// LOCATIONS
// ============================================
const LOCATIONS = {
  warehouses: [
    'WAREHOUSE-NORTH-01',
    'WAREHOUSE-SOUTH-02',
    'WAREHOUSE-EAST-03',
    'WAREHOUSE-WEST-04',
    'DISTRIBUTION-CENTER-MAIN',
    'DISTRIBUTION-CENTER-REGIONAL',
  ],
  stores: [
    'STORE-DOWNTOWN-001',
    'STORE-MALL-002',
    'STORE-SUBURB-003',
    'STORE-AIRPORT-004',
    'RETAIL-OUTLET-005',
    'RETAIL-OUTLET-006',
  ],
  other: [
    'SUPPLIER-INTL-A',
    'SUPPLIER-LOCAL-B',
    'RETURNS-CENTER',
    'QUALITY-CONTROL',
  ]
};

const ALL_LOCATIONS = [...LOCATIONS.warehouses, ...LOCATIONS.stores, ...LOCATIONS.other];

// ============================================
// STATUS DEFINITIONS
// ============================================
const TRANSFER_STATUSES = {
  REQUESTED: { label: 'Requested', color: '#fbbf24', bgColor: '#3b2f0a', borderColor: '#854d0e', icon: '📋', next: 'CONFIRMED' },
  CONFIRMED: { label: 'Confirmed', color: '#34d399', bgColor: '#0d3320', borderColor: '#065f46', icon: '✓', next: 'IN_TRANSIT' },
  IN_TRANSIT: { label: 'In Transit', color: '#60a5fa', bgColor: '#1e3a5f', borderColor: '#1d4ed8', icon: '🚚', next: 'DELIVERED' },
  DELIVERED: { label: 'Delivered', color: '#34d399', bgColor: '#0d3320', borderColor: '#065f46', icon: '✓', next: null },
  CANCELLED: { label: 'Cancelled', color: '#94a3b8', bgColor: '#1e293b', borderColor: '#475569', icon: '✕', next: null },
  FAILED: { label: 'Failed', color: '#f87171', bgColor: '#3b1219', borderColor: '#991b1b', icon: '!', next: null },
};

// ============================================
// MOCK INVENTORY DATA
// ============================================
const generateInventory = () => {
  const inventory = [];
  ALL_LOCATIONS.forEach(location => {
    Object.keys(PRODUCT_CATALOG).forEach(sku => {
      if (Math.random() > 0.3) {
        inventory.push({
          id: `${location}-${sku}`,
          location,
          sku,
          quantity: Math.floor(Math.random() * 200) + 10,
          minStock: Math.floor(Math.random() * 20) + 5,
          lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
  });
  return inventory;
};

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
    color: '#f1f5f9',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
    borderRight: '1px solid #2a2a4a',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    marginLeft: '260px',
    padding: '24px 32px',
    minHeight: '100vh',
  },
  card: {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid #2a2a4a',
    borderRadius: '16px',
    padding: '24px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#0f0f1a',
    border: '1px solid #2a2a4a',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  buttonSecondary: {
    padding: '12px 24px',
    background: '#2a2a4a',
    border: 'none',
    borderRadius: '10px',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    color: '#64748b',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '1px solid #2a2a4a',
    color: '#64748b',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #2a2a4a20',
    color: '#cbd5e1',
    fontSize: '14px',
  },
};

// ============================================
// COMPONENTS
// ============================================

// Status Badge
const StatusBadge = ({ status, size = 'normal' }) => {
  const config = TRANSFER_STATUSES[status] || TRANSFER_STATUSES.REQUESTED;
  const isSmall = size === 'small';
  return (
    <span style={{
      padding: isSmall ? '3px 8px' : '6px 14px',
      borderRadius: '20px',
      fontSize: isSmall ? '10px' : '12px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      backgroundColor: config.bgColor,
      color: config.color,
      border: `1px solid ${config.borderColor}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

// Role Badge
const RoleBadge = ({ role }) => {
  const config = ROLES[role] || ROLES.VIEWER;
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: `${config.color}20`,
      color: config.color,
      border: `1px solid ${config.color}40`,
    }}>
      {config.name}
    </span>
  );
};

// Login Page
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = DEMO_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      ...styles.container,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ ...styles.card, width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            SupplyChain Ledger
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div style={{
            background: '#3b1219',
            border: '1px solid #991b1b',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#f87171',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter username"
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" style={{ ...styles.button, width: '100%' }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '32px', padding: '16px', background: '#0f0f1a', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
            Demo Accounts
          </div>
          {DEMO_USERS.map(user => (
            <div key={user.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #2a2a4a20',
              fontSize: '12px',
            }}>
              <span style={{ color: '#cbd5e1' }}>{user.username} / {user.password}</span>
              <RoleBadge role={user.role} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sidebar Navigation
const Sidebar = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', permission: null },
    { id: 'transfers', label: 'Transfers', icon: '📦', permission: 'view_transfers' },
    { id: 'new-transfer', label: 'New Transfer', icon: '➕', permission: 'create_transfer' },
    { id: 'inventory', label: 'Inventory', icon: '📋', permission: 'view_inventory' },
    { id: 'reports', label: 'Reports', icon: '📈', permission: 'view_reports' },
    { id: 'users', label: 'Users', icon: '👥', permission: 'all' },
  ];

  const visibleItems = navItems.filter(item => 
    !item.permission || hasPermission(user, item.permission)
  );

  return (
    <div style={styles.sidebar}>
      <div style={{ padding: '0 20px', marginBottom: '32px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SupplyChain
        </h1>
        <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
          Blockchain Ledger
        </p>
      </div>

      <nav style={{ flex: 1 }}>
        {visibleItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 20px',
              background: currentPage === item.id ? 'linear-gradient(90deg, #6366f120 0%, transparent 100%)' : 'transparent',
              border: 'none',
              borderLeft: currentPage === item.id ? '3px solid #6366f1' : '3px solid transparent',
              color: currentPage === item.id ? '#f1f5f9' : '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #2a2a4a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${ROLES[user.role]?.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{user.name}</div>
            <RoleBadge role={user.role} />
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            ...styles.buttonSecondary,
            width: '100%',
            padding: '10px',
            fontSize: '13px',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

// Stats Card
const StatsCard = ({ label, value, icon, color, subtext }) => (
  <div style={styles.card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>{value}</div>
        {subtext && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{subtext}</div>}
      </div>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}>
        {icon}
      </div>
    </div>
  </div>
);

// Dashboard Page
const DashboardPage = ({ transfers, inventory, user }) => {
  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => ['REQUESTED', 'CONFIRMED'].includes(t.status)).length,
    inTransit: transfers.filter(t => t.status === 'IN_TRANSIT').length,
    delivered: transfers.filter(t => t.status === 'DELIVERED').length,
    lowStock: inventory.filter(i => i.quantity <= i.minStock).length,
  };

  const recentTransfers = transfers.slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Here's what's happening with your supply chain today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatsCard label="Total Transfers" value={stats.total} icon="📦" color="#6366f1" subtext="All time" />
        <StatsCard label="Pending" value={stats.pending} icon="📋" color="#fbbf24" subtext="Awaiting action" />
        <StatsCard label="In Transit" value={stats.inTransit} icon="🚚" color="#3b82f6" subtext="On the way" />
        <StatsCard label="Delivered" value={stats.delivered} icon="✓" color="#10b981" subtext="Completed" />
        <StatsCard label="Low Stock" value={stats.lowStock} icon="⚠️" color="#ef4444" subtext="Need attention" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Recent Transfers</h3>
          {recentTransfers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No transfers yet
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Transfer ID</th>
                  <th style={styles.th}>Route</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransfers.map(t => (
                  <tr key={t.transferId}>
                    <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{t.transferId}</span></td>
                    <td style={styles.td}>{t.fromLocation} → {t.toLocation}</td>
                    <td style={styles.td}><StatusBadge status={t.status} size="small" /></td>
                    <td style={styles.td}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Low Stock Alerts</h3>
          {inventory.filter(i => i.quantity <= i.minStock).slice(0, 5).map(item => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #2a2a4a20',
            }}>
              <div>
                <div style={{ fontSize: '13px', color: '#f1f5f9' }}>{PRODUCT_CATALOG[item.sku]?.name || item.sku}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{item.location}</div>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#3b121920',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                {item.quantity} left
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Transfers Page
const TransfersPage = ({ transfers, setTransfers, user }) => {
  const [filter, setFilter] = useState('all');
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const filteredTransfers = filter === 'all' 
    ? transfers 
    : transfers.filter(t => t.status === filter);

  const handleStatusUpdate = async (transferId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/transfers/${transferId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setTransfers(transfers.map(t => 
          t.transferId === transferId ? { ...t, status: newStatus } : t
        ));
        setSelectedTransfer(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const canUpdateStatus = (transfer) => {
    if (hasPermission(user, 'all')) return true;
    if (transfer.status === 'DELIVERED' || transfer.status === 'CANCELLED' || transfer.status === 'FAILED') return false;
    if (hasPermission(user, 'approve_transfer') && transfer.status === 'REQUESTED') return true;
    if (hasPermission(user, 'update_status') && ['CONFIRMED', 'IN_TRANSIT'].includes(transfer.status)) return true;
    return false;
  };

  const canCancel = (transfer) => {
    if (transfer.status === 'DELIVERED' || transfer.status === 'CANCELLED' || transfer.status === 'FAILED') return false;
    return hasPermission(user, 'cancel_transfer');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>Transfers</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'REQUESTED', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === status ? '1px solid #6366f1' : '1px solid #2a2a4a',
              background: filter === status ? '#6366f120' : 'transparent',
              color: filter === status ? '#818cf8' : '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {status === 'all' ? 'All' : TRANSFER_STATUSES[status]?.label || status}
            <span style={{ marginLeft: '6px', opacity: 0.7 }}>
              ({status === 'all' ? transfers.length : transfers.filter(t => t.status === status).length})
            </span>
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Transfer ID</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Block</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.map(t => (
              <tr key={t.transferId} style={{ cursor: 'pointer' }} onClick={() => setSelectedTransfer(t)}>
                <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{t.transferId}</span></td>
                <td style={styles.td}>{t.fromLocation}</td>
                <td style={styles.td}>{t.toLocation}</td>
                <td style={styles.td}><StatusBadge status={t.status} size="small" /></td>
                <td style={styles.td}>#{t.blockNumber || '—'}</td>
                <td style={styles.td}>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td style={styles.td} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {canUpdateStatus(t) && TRANSFER_STATUSES[t.status]?.next && (
                      <button
                        onClick={() => handleStatusUpdate(t.transferId, TRANSFER_STATUSES[t.status].next)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#6366f120',
                          color: '#818cf8',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        → {TRANSFER_STATUSES[TRANSFER_STATUSES[t.status].next]?.label}
                      </button>
                    )}
                    {canCancel(t) && (
                      <button
                        onClick={() => handleStatusUpdate(t.transferId, 'CANCELLED')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#3b121920',
                          color: '#f87171',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTransfer && (
        <TransferModal 
          transfer={selectedTransfer} 
          onClose={() => setSelectedTransfer(null)}
          onStatusUpdate={handleStatusUpdate}
          canUpdate={canUpdateStatus(selectedTransfer)}
          canCancel={canCancel(selectedTransfer)}
        />
      )}
    </div>
  );
};

// Transfer Modal
const TransferModal = ({ transfer, onClose, onStatusUpdate, canUpdate, canCancel }) => {
  const statusConfig = TRANSFER_STATUSES[transfer.status];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{ ...styles.card, maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>TRANSFER DETAILS</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>{transfer.transferId}</div>
          </div>
          <button onClick={onClose} style={{ ...styles.buttonSecondary, padding: '8px 12px' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#0f0f1a', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>FROM</div>
            <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '600' }}>{transfer.fromLocation}</div>
          </div>
          <div style={{ background: '#0f0f1a', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>TO</div>
            <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '600' }}>{transfer.toLocation}</div>
          </div>
        </div>

        <div style={{ background: '#0f0f1a', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>BLOCKCHAIN PROOF</div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '4px' }}>Transaction Hash</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#cbd5e1', background: '#1a1a2e', padding: '8px', borderRadius: '6px', wordBreak: 'break-all' }}>
              {transfer.txHash || 'Pending...'}
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '4px' }}>Items Hash</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#cbd5e1', background: '#1a1a2e', padding: '8px', borderRadius: '6px', wordBreak: 'break-all' }}>
              {transfer.itemsHash}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '4px' }}>Block #</div>
              <div style={{ fontSize: '16px', color: '#34d399', fontWeight: '700' }}>#{transfer.blockNumber || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '4px' }}>Status</div>
              <StatusBadge status={transfer.status} />
            </div>
          </div>
        </div>

        {(canUpdate || canCancel) && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {canUpdate && statusConfig?.next && (
              <button
                onClick={() => onStatusUpdate(transfer.transferId, statusConfig.next)}
                style={styles.button}
              >
                Mark as {TRANSFER_STATUSES[statusConfig.next]?.label}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onStatusUpdate(transfer.transferId, 'CANCELLED')}
                style={{ ...styles.buttonSecondary, background: '#3b121940', color: '#f87171' }}
              >
                Cancel Transfer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// New Transfer Page
const NewTransferPage = ({ onTransferCreated }) => {
  const [formData, setFormData] = useState({
    transferId: `TRF-${Date.now().toString().slice(-6)}`,
    fromLocation: '',
    toLocation: '',
    items: [{ sku: '', qty: 1 }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { sku: '', qty: 1 }] });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'qty' ? parseInt(value) || 1 : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.status === 409) {
        throw new Error('Transfer ID already exists');
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create transfer');
      }

      const result = await response.json();
      onTransferCreated(result);
      setSuccess(`Transfer ${result.transferId} created successfully! Block #${result.blockNumber}`);
      setFormData({
        transferId: `TRF-${Date.now().toString().slice(-6)}`,
        fromLocation: '',
        toLocation: '',
        items: [{ sku: '', qty: 1 }],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>
        New Transfer Request
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Create a blockchain-verified supply chain transfer
      </p>

      <div style={{ ...styles.card, maxWidth: '700px' }}>
        {error && (
          <div style={{ background: '#3b1219', border: '1px solid #991b1b', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#f87171' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#0d3320', border: '1px solid #065f46', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#34d399' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Transfer ID</label>
            <input
              type="text"
              value={formData.transferId}
              onChange={(e) => setFormData({ ...formData, transferId: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={styles.label}>From Location</label>
              <select
                value={formData.fromLocation}
                onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                style={styles.input}
                required
              >
                <option value="">Select location...</option>
                <optgroup label="Warehouses">
                  {LOCATIONS.warehouses.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </optgroup>
                <optgroup label="Stores">
                  {LOCATIONS.stores.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </optgroup>
                <optgroup label="Other">
                  {LOCATIONS.other.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label style={styles.label}>To Location</label>
              <select
                value={formData.toLocation}
                onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                style={styles.input}
                required
              >
                <option value="">Select location...</option>
                <optgroup label="Warehouses">
                  {LOCATIONS.warehouses.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </optgroup>
                <optgroup label="Stores">
                  {LOCATIONS.stores.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </optgroup>
                <optgroup label="Other">
                  {LOCATIONS.other.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </optgroup>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ ...styles.label, marginBottom: 0 }}>Items</label>
              <button type="button" onClick={handleAddItem} style={{ ...styles.buttonSecondary, padding: '6px 12px', fontSize: '12px' }}>
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <select
                  value={item.sku}
                  onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                  style={{ ...styles.input, flex: 2 }}
                  required
                >
                  <option value="">Select product...</option>
                  {Object.entries(PRODUCT_CATALOG).map(([sku, product]) => (
                    <option key={sku} value={sku}>{sku} - {product.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Qty"
                  required
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    style={{ ...styles.buttonSecondary, padding: '12px', background: '#3b121920', color: '#f87171' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.button, width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Transfer & Recording on Blockchain...' : 'Create Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inventory Page
const InventoryPage = ({ inventory }) => {
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [...new Set(Object.values(PRODUCT_CATALOG).map(p => p.category))];

  const filteredInventory = inventory.filter(item => {
    if (locationFilter !== 'all' && item.location !== locationFilter) return false;
    if (categoryFilter !== 'all' && PRODUCT_CATALOG[item.sku]?.category !== categoryFilter) return false;
    if (searchTerm) {
      const product = PRODUCT_CATALOG[item.sku];
      const searchLower = searchTerm.toLowerCase();
      if (!item.sku.toLowerCase().includes(searchLower) && 
          !product?.name.toLowerCase().includes(searchLower) &&
          !item.location.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const totalValue = filteredInventory.reduce((sum, item) => {
    const price = PRODUCT_CATALOG[item.sku]?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>Inventory</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Total Value: <span style={{ color: '#34d399', fontWeight: '700' }}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search SKU, product, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...styles.input, flex: '1 1 300px' }}
        />
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ ...styles.input, flex: '0 0 200px' }}>
          <option value="all">All Locations</option>
          {ALL_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...styles.input, flex: '0 0 180px' }}>
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.slice(0, 50).map(item => {
              const product = PRODUCT_CATALOG[item.sku];
              const isLowStock = item.quantity <= item.minStock;
              return (
                <tr key={item.id}>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{item.sku}</span></td>
                  <td style={styles.td}>{product?.name || item.sku}</td>
                  <td style={styles.td}>{item.location}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600', color: isLowStock ? '#f87171' : '#f1f5f9' }}>
                      {item.quantity}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}> {product?.unit}</span>
                  </td>
                  <td style={styles.td}>
                    {isLowStock ? (
                      <span style={{ color: '#f87171', fontSize: '12px', fontWeight: '600' }}>⚠️ Low Stock</span>
                    ) : (
                      <span style={{ color: '#34d399', fontSize: '12px' }}>✓ In Stock</span>
                    )}
                  </td>
                  <td style={styles.td}>${((product?.price || 0) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredInventory.length > 50 && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '13px' }}>
            Showing 50 of {filteredInventory.length} items
          </div>
        )}
      </div>
    </div>
  );
};

// Reports Page
const ReportsPage = ({ transfers, inventory }) => {
  const locationStats = ALL_LOCATIONS.slice(0, 8).map(location => {
    const items = inventory.filter(i => i.location === location);
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * (PRODUCT_CATALOG[i.sku]?.price || 0)), 0);
    const lowStockCount = items.filter(i => i.quantity <= i.minStock).length;
    return { location, totalQty, totalValue, lowStockCount, itemCount: items.length };
  });

  const maxValue = Math.max(...locationStats.map(s => s.totalValue));

  const transfersByStatus = Object.keys(TRANSFER_STATUSES).map(status => ({
    status,
    count: transfers.filter(t => t.status === status).length,
    config: TRANSFER_STATUSES[status],
  }));

  const categoryStats = Object.entries(
    inventory.reduce((acc, item) => {
      const category = PRODUCT_CATALOG[item.sku]?.category || 'Other';
      if (!acc[category]) acc[category] = { qty: 0, value: 0 };
      acc[category].qty += item.quantity;
      acc[category].value += item.quantity * (PRODUCT_CATALOG[item.sku]?.price || 0);
      return acc;
    }, {})
  ).map(([category, data]) => ({ category, ...data }));

  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>Reports & Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Stock Value by Location */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Stock Value by Location</h3>
          {locationStats.map(stat => (
            <div key={stat.location} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{stat.location}</span>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
                  ${stat.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div style={{ height: '8px', background: '#0f0f1a', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(stat.totalValue / maxValue) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  borderRadius: '4px',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Transfer Status Distribution */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Transfer Status Distribution</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {transfersByStatus.filter(s => s.count > 0).map(({ status, count, config }) => (
              <div key={status} style={{
                flex: '1 1 calc(50% - 12px)',
                background: config.bgColor,
                border: `1px solid ${config.borderColor}`,
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{config.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: config.color }}>{count}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{config.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Category Breakdown */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Inventory by Category</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.sort((a, b) => b.value - a.value).map(cat => (
                <tr key={cat.category}>
                  <td style={styles.td}>{cat.category}</td>
                  <td style={styles.td}>{cat.qty.toLocaleString()}</td>
                  <td style={styles.td}>${cat.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Summary */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Low Stock by Location</h3>
          {locationStats.filter(s => s.lowStockCount > 0).map(stat => (
            <div key={stat.location} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #2a2a4a20',
            }}>
              <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{stat.location}</span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                background: '#3b121920',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                {stat.lowStockCount} items
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Users Page (Admin Only)
const UsersPage = () => {
  const [users, setUsers] = useState(DEMO_USERS);

  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>User Management</h1>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Location</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{user.username}</span></td>
                <td style={styles.td}><RoleBadge role={user.role} /></td>
                <td style={styles.td}>{user.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...styles.card, marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Role Permissions</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Create</th>
              <th style={styles.th}>Cancel</th>
              <th style={styles.th}>Approve</th>
              <th style={styles.th}>Update Status</th>
              <th style={styles.th}>View Transfers</th>
              <th style={styles.th}>View Inventory</th>
              <th style={styles.th}>View Reports</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ROLES).map(([key, role]) => (
              <tr key={key}>
                <td style={styles.td}><RoleBadge role={key} /></td>
                <td style={styles.td}>{hasPermission({ role: key }, 'create_transfer') ? '✓' : '—'}</td>
                <td style={styles.td}>{hasPermission({ role: key }, 'cancel_transfer') ? '✓' : '—'}</td>
                <td style={styles.td}>{hasPermission({ role: key }, 'approve_transfer') ? '✓' : '—'}</td>
                <td style={styles.td}>{hasPermission({ role: key }, 'update_status') ? '✓' : '—'}</td>
                <td style={styles.td}>{hasPermission({ role: key }, 'view_transfers') ? '✓' : '—'}</td>
                <td style={styles.td}>{hasPermission({ role: key }, 'view_inventory') ? '✓' : '—'}</td>
                <td style={styles.td}>{hasPermission({ role: key }, 'view_reports') ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transfers, setTransfers] = useState([]);
  const [inventory] = useState(() => generateInventory());

  // Load transfers from API
  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/transfers`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setTransfers(data))
        .catch(() => {
          const saved = localStorage.getItem('transfers');
          if (saved) setTransfers(JSON.parse(saved));
        });
    }
  }, [user]);

  // Save transfers to localStorage
  useEffect(() => {
    if (transfers.length > 0) {
      localStorage.setItem('transfers', JSON.stringify(transfers));
    }
  }, [transfers]);

  const handleLogin = (user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('dashboard');
  };

  const handleTransferCreated = (newTransfer) => {
    setTransfers([newTransfer, ...transfers]);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage transfers={transfers} inventory={inventory} user={user} />;
      case 'transfers':
        return hasPermission(user, 'view_transfers') 
          ? <TransfersPage transfers={transfers} setTransfers={setTransfers} user={user} />
          : <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Access Denied</div>;
      case 'new-transfer':
        return hasPermission(user, 'create_transfer')
          ? <NewTransferPage onTransferCreated={handleTransferCreated} />
          : <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Access Denied</div>;
      case 'inventory':
        return hasPermission(user, 'view_inventory')
          ? <InventoryPage inventory={inventory} />
          : <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Access Denied</div>;
      case 'reports':
        return hasPermission(user, 'view_reports')
          ? <ReportsPage transfers={transfers} inventory={inventory} />
          : <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Access Denied</div>;
      case 'users':
        return hasPermission(user, 'all')
          ? <UsersPage />
          : <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Access Denied</div>;
      default:
        return <DashboardPage transfers={transfers} inventory={inventory} user={user} />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, hasPermission: (perm) => hasPermission(user, perm) }}>
      <div style={styles.container}>
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user} 
          onLogout={handleLogout} 
        />
        <main style={styles.mainContent}>
          {renderPage()}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
