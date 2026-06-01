'use client';

import type { User, ActiveTab } from '@/types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedHub: string;
  setSelectedHub: (hub: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  rfqsCount: number;
  setSelectedProductId: (id: number | null) => void;
  fetchProducts: () => void;
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  selectedHub,
  setSelectedHub,
  searchQuery,
  setSearchQuery,
  userRole,
  setUserRole,
  rfqsCount,
  setSelectedProductId,
  fetchProducts,
  user,
  onLogout,
  onOpenAuth
}: HeaderProps) {
  const isSelector = activeTab === 'intent-selector';

  return (
    <header>
      <div className="header-container">
        <div className="logo-wrapper" onClick={() => { setActiveTab('marketplace'); setSelectedProductId(null); }}>
          <div className="logo-icon">B</div>
          <span>BuyEway</span>
        </div>

        {/* Sourcing Hub Cluster Search Gate - Hide on Intent Selector */}
        {!isSelector ? (
          <div className="search-container">
            <select 
              className="search-hub-select" 
              value={selectedHub} 
              onChange={(e) => setSelectedHub(e.target.value)}
            >
              <option value="">All Sourcing Hubs</option>
              <option value="surat">Surat Textile Hub</option>
              <option value="morbi">Morbi Ceramic Hub</option>
              <option value="tirupur">Tirupur Garments</option>
              <option value="aligarh">Aligarh Hardware</option>
              <option value="assam">Assam Plantations</option>
            </select>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search catalog, HSN, or manufacturer hub..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            />
            <button className="search-button" onClick={fetchProducts}>
              <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              Sourcing Search
            </button>
          </div>
        ) : (
          <div style={{ flex: 1 }} /> // Spacer
        )}

        {/* Navigation link anchors */}
        <div className="nav-actions">
          {!isSelector && (
            <>
              <span 
                className={`nav-link ${activeTab === 'marketplace' ? 'active' : ''}`}
                onClick={() => { setActiveTab('marketplace'); setSelectedProductId(null); }}
              >
                Catalog Directory
              </span>
              <span 
                className={`nav-link ${activeTab === 'rfqs' ? 'active' : ''}`}
                onClick={() => { setActiveTab('rfqs'); setSelectedProductId(null); }}
              >
                RFQ Market Board
                <span className="badge-pill">{rfqsCount}</span>
              </span>
              {user && user.role === 'admin' && (
                <span 
                  className={`nav-link ${activeTab === 'admin-dashboard' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin-dashboard'); setSelectedProductId(null); }}
                  style={{ color: '#818cf8', fontWeight: 'bold' }}
                >
                  🛡️ Admin Central
                </span>
              )}
              {user && user.role === 'supplier' && (
                <span 
                  className={`nav-link ${activeTab === 'supplier-dashboard' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('supplier-dashboard'); setSelectedProductId(null); }}
                  style={{ color: '#10b981', fontWeight: 'bold' }}
                >
                  Seller Central
                </span>
              )}
              {user && user.role === 'buyer' && (
                <span 
                  className={`nav-link ${activeTab === 'seller-onboarding' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('seller-onboarding'); setSelectedProductId(null); }}
                  style={{ 
                    color: user.sellerStatus === 'none' ? 'var(--accent)' : '#f59e0b',
                    fontWeight: 'bold' 
                  }}
                >
                  {user.sellerStatus === 'none' ? 'Become a Seller' : 
                   user.sellerStatus === 'pending_docs' ? 'Onboarding Steps' : '⏳ Onboarding Pending'}
                </span>
              )}
              {!user && (
                <span 
                  className="nav-link"
                  onClick={onOpenAuth}
                  style={{ color: 'var(--accent)', fontWeight: 'bold' }}
                >
                  Become a Seller
                </span>
              )}
            </>
          )}
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="user-badge" style={{
                background: 'rgba(79, 70, 229, 0.15)',
                color: 'var(--accent)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid rgba(79, 70, 229, 0.3)'
              }}>
                👤 {user.name} ({userRole ? userRole.toUpperCase() : 'USER'})
              </span>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={onOpenAuth}>
              Login / Sign Up
            </button>
          )}

          {user && (
            <button 
              className="btn-supplier-toggle" 
              onClick={() => {
                setActiveTab('intent-selector');
                setSelectedProductId(null);
              }}
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
              }}
            >
              💼 Intent Gateway
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
