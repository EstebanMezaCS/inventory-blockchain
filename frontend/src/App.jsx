import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080/api';

// ============================================
// PRODUCT CATALOG - Real SKUs
// ============================================
const PRODUCT_CATALOG = {
  // Electronics
  'ELEC-TV-55-4K': { name: 'Smart TV 55" 4K UHD', category: 'Electronics', unit: 'units' },
  'ELEC-TV-65-4K': { name: 'Smart TV 65" 4K UHD', category: 'Electronics', unit: 'units' },
  'ELEC-LAPTOP-PRO': { name: 'Laptop Pro 15.6"', category: 'Electronics', unit: 'units' },
  'ELEC-PHONE-PRO': { name: 'Smartphone Pro Max', category: 'Electronics', unit: 'units' },
  'ELEC-TABLET-10': { name: 'Tablet 10.5"', category: 'Electronics', unit: 'units' },
  'ELEC-HEADPHONE-BT': { name: 'Wireless Headphones', category: 'Electronics', unit: 'units' },
  'ELEC-SPEAKER-BT': { name: 'Bluetooth Speaker', category: 'Electronics', unit: 'units' },
  'ELEC-CHARGER-USB': { name: 'USB-C Fast Charger', category: 'Electronics', unit: 'units' },
  
  // Furniture
  'FURN-CHAIR-OFF': { name: 'Office Chair Ergonomic', category: 'Furniture', unit: 'units' },
  'FURN-DESK-STD': { name: 'Standing Desk 60"', category: 'Furniture', unit: 'units' },
  'FURN-SHELF-5T': { name: 'Storage Shelf 5-Tier', category: 'Furniture', unit: 'units' },
  'FURN-CABINET-2D': { name: 'Filing Cabinet 2-Drawer', category: 'Furniture', unit: 'units' },
  'FURN-TABLE-CONF': { name: 'Conference Table 8ft', category: 'Furniture', unit: 'units' },
  
  // Apparel
  'APRL-SHIRT-M-BLU': { name: 'Dress Shirt Blue (M)', category: 'Apparel', unit: 'units' },
  'APRL-SHIRT-L-BLU': { name: 'Dress Shirt Blue (L)', category: 'Apparel', unit: 'units' },
  'APRL-SHIRT-XL-BLU': { name: 'Dress Shirt Blue (XL)', category: 'Apparel', unit: 'units' },
  'APRL-PANTS-32-BLK': { name: 'Dress Pants Black (32)', category: 'Apparel', unit: 'units' },
  'APRL-PANTS-34-BLK': { name: 'Dress Pants Black (34)', category: 'Apparel', unit: 'units' },
  'APRL-JACKET-M': { name: 'Winter Jacket (M)', category: 'Apparel', unit: 'units' },
  'APRL-SHOES-10-BRN': { name: 'Leather Shoes Brown (10)', category: 'Apparel', unit: 'pairs' },
  
  // Food & Beverage
  'FOOD-RICE-5KG': { name: 'Premium Rice 5kg', category: 'Food & Beverage', unit: 'bags' },
  'FOOD-PASTA-1KG': { name: 'Italian Pasta 1kg', category: 'Food & Beverage', unit: 'packs' },
  'FOOD-OIL-1L': { name: 'Olive Oil 1L', category: 'Food & Beverage', unit: 'bottles' },
  'FOOD-COFFEE-500G': { name: 'Ground Coffee 500g', category: 'Food & Beverage', unit: 'bags' },
  'BEV-WATER-24PK': { name: 'Spring Water 24-Pack', category: 'Food & Beverage', unit: 'cases' },
  'BEV-SODA-12PK': { name: 'Cola 12-Pack', category: 'Food & Beverage', unit: 'cases' },
  
  // Pharmaceuticals
  'PHAR-VITAMIN-C': { name: 'Vitamin C 1000mg (60ct)', category: 'Pharmaceuticals', unit: 'bottles' },
  'PHAR-PAIN-REL': { name: 'Pain Reliever (100ct)', category: 'Pharmaceuticals', unit: 'bottles' },
  'PHAR-BANDAGE-50': { name: 'Adhesive Bandages (50ct)', category: 'Pharmaceuticals', unit: 'boxes' },
  'PHAR-SANITIZER-1L': { name: 'Hand Sanitizer 1L', category: 'Pharmaceuticals', unit: 'bottles' },
  
  // Automotive
  'AUTO-OIL-5W30': { name: 'Motor Oil 5W-30 (5qt)', category: 'Automotive', unit: 'jugs' },
  'AUTO-FILTER-OIL': { name: 'Oil Filter Universal', category: 'Automotive', unit: 'units' },
  'AUTO-BRAKE-PAD': { name: 'Brake Pads (Set)', category: 'Automotive', unit: 'sets' },
  'AUTO-BATTERY-12V': { name: 'Car Battery 12V', category: 'Automotive', unit: 'units' },
  'AUTO-TIRE-205': { name: 'Tire 205/55R16', category: 'Automotive', unit: 'units' },
  
  // Office Supplies
  'OFFC-PAPER-A4': { name: 'Copy Paper A4 (500 sheets)', category: 'Office Supplies', unit: 'reams' },
  'OFFC-PEN-BLK-12': { name: 'Ballpoint Pens Black (12pk)', category: 'Office Supplies', unit: 'packs' },
  'OFFC-STAPLER': { name: 'Heavy Duty Stapler', category: 'Office Supplies', unit: 'units' },
  'OFFC-FOLDER-100': { name: 'Manila Folders (100ct)', category: 'Office Supplies', unit: 'boxes' },
};

// Location presets
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

// ============================================
// STATUS DEFINITIONS
// ============================================
const TRANSFER_STATUSES = {
  REQUESTED: {
    label: 'Requested',
    color: '#fbbf24',
    bgColor: '#3b2f0a',
    borderColor: '#854d0e',
    icon: '📋',
    description: 'Transfer order created and recorded on blockchain',
    next: 'IN_TRANSIT',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: '#60a5fa',
    bgColor: '#1e3a5f',
    borderColor: '#1d4ed8',
    icon: '🚚',
    description: 'Shipment is on the way to destination',
    next: 'DELIVERED',
  },
  DELIVERED: {
    label: 'Delivered',
    color: '#34d399',
    bgColor: '#0d3320',
    borderColor: '#065f46',
    icon: '✓',
    description: 'Successfully delivered and verified',
    next: null,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#94a3b8',
    bgColor: '#1e293b',
    borderColor: '#475569',
    icon: '✕',
    description: 'Transfer was cancelled',
    next: null,
  },
  FAILED: {
    label: 'Failed',
    color: '#f87171',
    bgColor: '#3b1219',
    borderColor: '#991b1b',
    icon: '!',
    description: 'Transfer failed - see error details',
    next: null,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: '#34d399',
    bgColor: '#0d3320',
    borderColor: '#065f46',
    icon: '✓',
    description: 'Transfer confirmed on blockchain',
    next: 'IN_TRANSIT',
  },
};

// ============================================
// API HOOKS
// ============================================
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/transfers`);
      if (!response.ok) throw new Error('Failed to fetch transfers');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTransfer = async (transferData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });
      if (response.status === 409) {
        throw new Error('Transfer ID already exists');
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create transfer');
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTransfer = async (transferId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/transfers/${transferId}`);
      if (response.status === 404) {
        throw new Error('Transfer not found');
      }
      if (!response.ok) throw new Error('Failed to fetch transfer');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransferStatus = async (transferId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/transfers/${transferId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchTransfers, createTransfer, getTransfer, updateTransferStatus, setError };
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

// Progress Timeline
const StatusTimeline = ({ currentStatus }) => {
  const stages = ['REQUESTED', 'IN_TRANSIT', 'DELIVERED'];
  const currentIndex = stages.indexOf(currentStatus);
  const isCompleted = currentStatus === 'DELIVERED';
  const isFailed = currentStatus === 'FAILED' || currentStatus === 'CANCELLED';

  if (isFailed) {
    return (
      <div style={{
        background: '#1e1e2e',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
      }}>
        <StatusBadge status={currentStatus} />
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
          {TRANSFER_STATUSES[currentStatus]?.description}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {stages.map((stage, index) => {
          const config = TRANSFER_STATUSES[stage];
          const isActive = index <= currentIndex || (currentStatus === 'CONFIRMED' && index === 0);
          const isCurrent = stage === currentStatus || (currentStatus === 'CONFIRMED' && stage === 'REQUESTED');
          
          return (
            <React.Fragment key={stage}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? config.bgColor : '#1e1e2e',
                  border: `2px solid ${isActive ? config.color : '#3a3a4a'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? `0 0 20px ${config.color}40` : 'none',
                }}>
                  {config.icon}
                </div>
                <span style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? config.color : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {config.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '3px',
                  backgroundColor: index < currentIndex ? '#34d399' : '#2a2a4a',
                  margin: '0 12px',
                  marginBottom: '24px',
                  borderRadius: '2px',
                  transition: 'background-color 0.3s ease',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Truncate hash
const truncateHash = (hash, chars = 8) => {
  if (!hash) return '—';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
};

// Get product info
const getProductInfo = (sku) => {
  return PRODUCT_CATALOG[sku] || { name: sku, category: 'Unknown', unit: 'units' };
};

// Transfer Card
const TransferCard = ({ transfer, onClick }) => {
  const statusConfig = TRANSFER_STATUSES[transfer.status] || TRANSFER_STATUSES.REQUESTED;
  
  return (
    <div 
      onClick={() => onClick(transfer)}
      style={{
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        border: `1px solid ${statusConfig.borderColor}40`,
        borderLeft: `4px solid ${statusConfig.color}`,
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 20px 40px ${statusConfig.color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Block number */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '8px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: '700',
        color: '#fff',
      }}>
        Block #{transfer.blockNumber || '?'}
      </div>

      {/* Transfer ID */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', letterSpacing: '1px' }}>
          TRANSFER ID
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>
          {transfer.transferId}
        </div>
      </div>

      {/* Status */}
      <div style={{ marginBottom: '16px' }}>
        <StatusBadge status={transfer.status} size="small" />
      </div>

      {/* Route */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '16px',
        background: '#0f0f1a',
        borderRadius: '10px',
        padding: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>FROM</div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
            {transfer.fromLocation}
          </div>
        </div>
        <div style={{ 
          color: statusConfig.color, 
          fontSize: '20px',
          animation: transfer.status === 'IN_TRANSIT' ? 'pulse 1.5s infinite' : 'none',
        }}>
          →
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>TO</div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
            {transfer.toLocation}
          </div>
        </div>
      </div>

      {/* Hash preview */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#818cf8',
      }}>
        TX: {truncateHash(transfer.txHash, 6)}
      </div>
    </div>
  );
};

// Transfer Detail Modal
const TransferModal = ({ transfer, onClose, onUpdateStatus }) => {
  if (!transfer) return null;

  const statusConfig = TRANSFER_STATUSES[transfer.status] || TRANSFER_STATUSES.REQUESTED;
  const canAdvance = statusConfig.next && !['FAILED', 'CANCELLED', 'DELIVERED'].includes(transfer.status);

  const handleAdvanceStatus = () => {
    if (statusConfig.next) {
      onUpdateStatus(transfer.transferId, statusConfig.next);
    }
  };

  // Parse items from the transfer if available
  const items = transfer.items || [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div 
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '1px solid #2a2a4a',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '700px',
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', letterSpacing: '1px' }}>
              TRANSFER DETAILS
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>
              {transfer.transferId}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#2a2a4a',
              border: 'none',
              borderRadius: '8px',
              color: '#94a3b8',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            ×
          </button>
        </div>

        {/* Status Timeline */}
        <div style={{ 
          background: '#0f0f1a', 
          borderRadius: '16px', 
          padding: '20px', 
          marginBottom: '24px' 
        }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', letterSpacing: '1px' }}>
            TRANSFER STATUS
          </div>
          <StatusTimeline currentStatus={transfer.status} />
          
          {canAdvance && (
            <button
              onClick={handleAdvanceStatus}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                background: `linear-gradient(135deg, ${statusConfig.color}40 0%, ${statusConfig.color}20 100%)`,
                border: `1px solid ${statusConfig.color}`,
                borderRadius: '10px',
                color: statusConfig.color,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Mark as {TRANSFER_STATUSES[statusConfig.next]?.label}
            </button>
          )}
        </div>

        {/* Route Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#0f0f1a', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>FROM LOCATION</div>
            <div style={{ fontSize: '15px', color: '#f1f5f9', fontWeight: '600' }}>{transfer.fromLocation}</div>
          </div>
          <div style={{ background: '#0f0f1a', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>TO LOCATION</div>
            <div style={{ fontSize: '15px', color: '#f1f5f9', fontWeight: '600' }}>{transfer.toLocation}</div>
          </div>
        </div>

        {/* Blockchain Proof */}
        <div style={{ background: '#0f0f1a', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px', letterSpacing: '1px' }}>
            BLOCKCHAIN VERIFICATION
          </div>
          
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '4px' }}>Transaction Hash</div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              color: '#cbd5e1',
              background: '#1a1a2e',
              padding: '10px 12px',
              borderRadius: '8px',
              wordBreak: 'break-all',
            }}>
              {transfer.txHash || 'Pending...'}
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#6366f1', marginBottom: '4px' }}>Items Hash (Keccak256)</div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              color: '#cbd5e1',
              background: '#1a1a2e',
              padding: '10px 12px',
              borderRadius: '8px',
              wordBreak: 'break-all',
            }}>
              {transfer.itemsHash}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1a1a2e', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '9px', color: '#6366f1', marginBottom: '4px' }}>Block Number</div>
              <div style={{ fontFamily: 'monospace', fontSize: '16px', color: '#34d399', fontWeight: '700' }}>
                #{transfer.blockNumber || '—'}
              </div>
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '9px', color: '#6366f1', marginBottom: '4px' }}>Network</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>
                Hardhat Local
              </div>
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '9px', color: '#6366f1', marginBottom: '4px' }}>Contract</div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#cbd5e1' }}>
                {truncateHash(transfer.contractAddress, 4)}
              </div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b', 
          textAlign: 'center',
          borderTop: '1px solid #2a2a4a',
          paddingTop: '16px',
        }}>
          Created: {transfer.createdAt ? new Date(transfer.createdAt).toLocaleString() : 'Unknown'}
        </div>
      </div>
    </div>
  );
};

// SKU Selector Component
const SkuSelector = ({ value, onChange }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const categories = [...new Set(Object.values(PRODUCT_CATALOG).map(p => p.category))];
  
  const filteredProducts = Object.entries(PRODUCT_CATALOG).filter(([sku, product]) => {
    const searchLower = search.toLowerCase();
    return sku.toLowerCase().includes(searchLower) || 
           product.name.toLowerCase().includes(searchLower) ||
           product.category.toLowerCase().includes(searchLower);
  });

  const selectedProduct = PRODUCT_CATALOG[value];

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          background: '#0f0f1a',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          color: value ? '#f1f5f9' : '#64748b',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          {selectedProduct ? (
            <>
              <span style={{ color: '#818cf8', fontFamily: 'monospace', marginRight: '8px' }}>{value}</span>
              {selectedProduct.name}
            </>
          ) : (
            'Select a product SKU...'
          )}
        </span>
        <span style={{ color: '#64748b' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '12px',
          maxHeight: '300px',
          overflow: 'auto',
          zIndex: 100,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #2a2a4a' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0f0f1a',
                border: '1px solid #3a3a5a',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
          
          {filteredProducts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No products found
            </div>
          ) : (
            filteredProducts.slice(0, 20).map(([sku, product]) => (
              <div
                key={sku}
                onClick={() => {
                  onChange(sku);
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #2a2a4a20',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a4a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ 
                  fontSize: '11px', 
                  color: '#818cf8', 
                  fontFamily: 'monospace',
                  marginBottom: '2px',
                }}>
                  {sku}
                </div>
                <div style={{ fontSize: '13px', color: '#f1f5f9' }}>{product.name}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  {product.category} • {product.unit}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Location Selector
const LocationSelector = ({ value, onChange, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const allLocations = [...LOCATIONS.warehouses, ...LOCATIONS.stores, ...LOCATIONS.other];

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={type === 'from' ? 'e.g., WAREHOUSE-NORTH-01' : 'e.g., STORE-DOWNTOWN-001'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#0f0f1a',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          color: '#f1f5f9',
          fontSize: '14px',
          outline: 'none',
        }}
      />
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '12px',
          maxHeight: '200px',
          overflow: 'auto',
          zIndex: 100,
        }}>
          {allLocations.filter(loc => 
            loc.toLowerCase().includes(value.toLowerCase())
          ).map(loc => (
            <div
              key={loc}
              onMouseDown={() => onChange(loc)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#cbd5e1',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a4a'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {loc}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create Transfer Form
const CreateTransferForm = ({ onSuccess, onCancel }) => {
  const { loading, error, createTransfer, setError } = useApi();
  const [formData, setFormData] = useState({
    transferId: `TRF-${Date.now().toString().slice(-6)}`,
    fromLocation: '',
    toLocation: '',
    items: [{ sku: '', qty: 1 }],
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { sku: '', qty: 1 }],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'qty' ? parseInt(value) || 1 : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate SKUs
    const invalidItems = formData.items.filter(item => !item.sku);
    if (invalidItems.length > 0) {
      setError('Please select a product for all items');
      return;
    }
    
    try {
      const result = await createTransfer(formData);
      onSuccess(result);
    } catch (err) {
      // Error handled in useApi
    }
  };

  const totalItems = formData.items.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    }} onClick={onCancel}>
      <div 
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '1px solid #2a2a4a',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '650px',
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#f1f5f9' }}>
            New Transfer Order
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Create a blockchain-verified supply chain transfer
          </div>
        </div>

        {error && (
          <div style={{
            background: '#3b1219',
            border: '1px solid #991b1b',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            color: '#f87171',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Transfer ID */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#64748b',
              marginBottom: '8px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Transfer ID
            </label>
            <input
              type="text"
              value={formData.transferId}
              onChange={(e) => setFormData({ ...formData, transferId: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#0f0f1a',
                border: '1px solid #2a2a4a',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '14px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
              required
            />
          </div>

          {/* Locations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: '#64748b',
                marginBottom: '8px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                From Location
              </label>
              <LocationSelector
                value={formData.fromLocation}
                onChange={(val) => setFormData({ ...formData, fromLocation: val })}
                type="from"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: '#64748b',
                marginBottom: '8px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                To Location
              </label>
              <LocationSelector
                value={formData.toLocation}
                onChange={(val) => setFormData({ ...formData, toLocation: val })}
                type="to"
              />
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '12px' 
            }}>
              <label style={{
                fontSize: '11px',
                color: '#64748b',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                Items ({formData.items.length} products, {totalItems} total units)
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  background: '#2a2a4a',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#818cf8',
                  padding: '8px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => {
              const product = PRODUCT_CATALOG[item.sku];
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginBottom: '12px',
                  alignItems: 'start',
                }}>
                  <div style={{ flex: 3 }}>
                    <SkuSelector
                      value={item.sku}
                      onChange={(sku) => handleItemChange(index, 'sku', sku)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#0f0f1a',
                        border: '1px solid #2a2a4a',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                      required
                    />
                    {product && (
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                        {product.unit}
                      </div>
                    )}
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      style={{
                        background: '#3b1219',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f87171',
                        width: '44px',
                        height: '44px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '14px',
                background: '#2a2a4a',
                border: 'none',
                borderRadius: '10px',
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '14px',
                background: loading 
                  ? '#4a4a6a' 
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating & Recording on Blockchain...' : 'Create Transfer Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stats Card
const StatsCard = ({ label, value, icon, color, subtext }) => (
  <div style={{
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid #2a2a4a',
    borderRadius: '16px',
    padding: '24px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>
          {label}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {subtext}
          </div>
        )}
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

// Filter Tabs
const FilterTabs = ({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    { key: 'all', label: 'All', color: '#818cf8' },
    { key: 'REQUESTED', label: 'Requested', color: '#fbbf24' },
    { key: 'CONFIRMED', label: 'Confirmed', color: '#34d399' },
    { key: 'IN_TRANSIT', label: 'In Transit', color: '#60a5fa' },
    { key: 'DELIVERED', label: 'Delivered', color: '#34d399' },
  ];

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeFilter === filter.key ? `1px solid ${filter.color}` : '1px solid #2a2a4a',
            background: activeFilter === filter.key ? `${filter.color}20` : 'transparent',
            color: activeFilter === filter.key ? filter.color : '#64748b',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {filter.label}
          {counts[filter.key] !== undefined && (
            <span style={{ 
              marginLeft: '6px', 
              opacity: 0.7,
              fontWeight: '400',
            }}>
              ({counts[filter.key]})
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================
export default function SupplyChainDashboard() {
  const [transfers, setTransfers] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchId, setSearchId] = useState('');
  const { loading, error, fetchTransfers, getTransfer, setError } = useApi();

  // Load transfers
  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    const data = await fetchTransfers();
    if (data.length > 0) {
      setTransfers(data);
    } else {
      // Load from localStorage as fallback
      const saved = localStorage.getItem('transfers');
      if (saved) {
        setTransfers(JSON.parse(saved));
      }
    }
  };

  // Save to localStorage
  useEffect(() => {
    if (transfers.length > 0) {
      localStorage.setItem('transfers', JSON.stringify(transfers));
    }
  }, [transfers]);

  const handleTransferCreated = (newTransfer) => {
    setTransfers([newTransfer, ...transfers]);
    setShowCreateForm(false);
  };

  const handleUpdateStatus = (transferId, newStatus) => {
    setTransfers(transfers.map(t => 
      t.transferId === transferId ? { ...t, status: newStatus } : t
    ));
    setSelectedTransfer(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setError(null);
    try {
      const transfer = await getTransfer(searchId.trim());
      setSelectedTransfer(transfer);
      if (!transfers.find(t => t.transferId === transfer.transferId)) {
        setTransfers([transfer, ...transfers]);
      }
    } catch (err) {
      // Error handled
    }
  };

  // Filter transfers
  const filteredTransfers = transfers.filter(t => {
    if (activeFilter === 'all') return true;
    return t.status === activeFilter;
  });

  // Calculate stats
  const stats = {
    total: transfers.length,
    requested: transfers.filter(t => t.status === 'REQUESTED' || t.status === 'CONFIRMED').length,
    inTransit: transfers.filter(t => t.status === 'IN_TRANSIT').length,
    delivered: transfers.filter(t => t.status === 'DELIVERED').length,
    latestBlock: transfers.length > 0 ? Math.max(...transfers.map(t => t.blockNumber || 0)) : 0,
  };

  const filterCounts = {
    all: transfers.length,
    REQUESTED: transfers.filter(t => t.status === 'REQUESTED').length,
    CONFIRMED: transfers.filter(t => t.status === 'CONFIRMED').length,
    IN_TRANSIT: transfers.filter(t => t.status === 'IN_TRANSIT').length,
    DELIVERED: transfers.filter(t => t.status === 'DELIVERED').length,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
      color: '#f1f5f9',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #2a2a4a',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '26px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            SupplyChain Ledger
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Blockchain-verified inventory transfer management
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            padding: '14px 28px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          New Transfer Order
        </button>
      </header>

      <main style={{ padding: '32px 40px' }}>
        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px',
          marginBottom: '32px',
        }}>
          <StatsCard 
            label="TOTAL TRANSFERS" 
            value={stats.total} 
            icon="📦" 
            color="#6366f1"
            subtext="All time"
          />
          <StatsCard 
            label="PENDING" 
            value={stats.requested} 
            icon="📋" 
            color="#fbbf24"
            subtext="Awaiting shipment"
          />
          <StatsCard 
            label="IN TRANSIT" 
            value={stats.inTransit} 
            icon="🚚" 
            color="#60a5fa"
            subtext="On the way"
          />
          <StatsCard 
            label="DELIVERED" 
            value={stats.delivered} 
            icon="✓" 
            color="#34d399"
            subtext="Completed"
          />
          <StatsCard 
            label="LATEST BLOCK" 
            value={`#${stats.latestBlock}`} 
            icon="⛓" 
            color="#a855f7"
            subtext="Blockchain height"
          />
        </div>

        {/* Search */}
        <div style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid #2a2a4a',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px', color: '#f1f5f9' }}>
            Search Transfer by ID
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter Transfer ID (e.g., TRF-001)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                padding: '14px 18px',
                background: '#0f0f1a',
                border: '1px solid #2a2a4a',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '14px 28px',
                background: '#2a2a4a',
                border: 'none',
                borderRadius: '10px',
                color: '#818cf8',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: '12px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <FilterTabs 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />

        {/* Transfers Grid */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0', color: '#f1f5f9' }}>
            {activeFilter === 'all' ? 'All Transfers' : `${TRANSFER_STATUSES[activeFilter]?.label || activeFilter} Transfers`}
            <span style={{ fontWeight: '400', color: '#64748b', marginLeft: '8px' }}>
              ({filteredTransfers.length})
            </span>
          </h2>
          
          {filteredTransfers.length === 0 ? (
            <div style={{
              background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid #2a2a4a',
              borderRadius: '16px',
              padding: '60px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <div style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>
                {activeFilter === 'all' ? 'No transfers yet' : `No ${TRANSFER_STATUSES[activeFilter]?.label.toLowerCase()} transfers`}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                {activeFilter === 'all' 
                  ? 'Create your first transfer order to get started'
                  : 'Transfers will appear here when they reach this status'
                }
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px',
            }}>
              {filteredTransfers.map((transfer) => (
                <TransferCard 
                  key={transfer.transferId} 
                  transfer={transfer} 
                  onClick={setSelectedTransfer}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #2a2a4a',
        padding: '20px 40px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '12px',
      }}>
        Powered by Ethereum • Hardhat Local Network • Spring Boot
      </footer>

      {/* Modals */}
      {selectedTransfer && (
        <TransferModal 
          transfer={selectedTransfer} 
          onClose={() => setSelectedTransfer(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      
      {showCreateForm && (
        <CreateTransferForm 
          onSuccess={handleTransferCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a2e;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #3a3a5a;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #4a4a6a;
        }
      `}</style>
    </div>
  );
}
