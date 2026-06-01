'use client';

import type { Product, SourcingHub, ActiveTab } from '@/types';

interface MarketplaceProps {
  hubs: SourcingHub[];
  selectedHub: string;
  handleHubSelect: (hubId: string) => void;
  products: Product[];
  selectedCategories: string[];
  handleCategorySelect: (cat: string) => void;
  setSelectedProductId: (id: number | null) => void;
  setCalcQty: (qty: number) => void;
  setCalcResult: (result: null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  handleFastRfq: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function Marketplace({
  hubs,
  selectedHub,
  handleHubSelect,
  products,
  selectedCategories,
  handleCategorySelect,
  setSelectedProductId,
  setCalcQty,
  setCalcResult,
  setActiveTab,
  handleFastRfq
}: MarketplaceProps) {
  return (
    <div className="fadeIn">
      {/* Premium Sourcing Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <span className="hero-tag">A National B2B Sourcing Hub</span>
          <h1 className="hero-title">Direct Procurement From India's Mega Manufacturing Ecosystems</h1>
          <p className="hero-desc">Connecting global B2B procurement professionals with verified Indian factories, MSME mills, and geographic craft clusters. Transparent HSN tracking and Secure SafeTrade Escrow grids.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setActiveTab('rfqs')}>
              <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Broadcast Sourcing RFQ
            </button>
            <button className="btn-secondary" onClick={() => {
              const el = document.getElementById('wholesale-listings-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Factory Catalogs
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-box">
            <div className="stat-num">5,800+</div>
            <div className="stat-lbl">Verified Factories</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">1.4L+</div>
            <div className="stat-lbl">Active Buyers</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">₹9.2 Cr</div>
            <div className="stat-lbl">Trade Volume</div>
          </div>
        </div>
      </div>

      {/* Sourcing Hubs Grid Clusters */}
      <div className="section-title-wrapper">
        <div>
          <h2 className="section-title">Specialized Manufacturing Clusters</h2>
          <p className="section-subtitle">Procure bulk materials directly from iconic geographic manufacturing hubs.</p>
        </div>
      </div>
      <div className="hubs-grid">
        {hubs.map(h => (
          <div 
            key={h.id} 
            className={`hub-card ${selectedHub === h.id ? 'active' : ''}`}
            onClick={() => handleHubSelect(h.id)}
          >
            <div className="hub-icon-wrapper">{h.icon}</div>
            <div className="hub-name">{h.name}</div>
            <div className="hub-location">📍 {h.location}</div>
            <div className="hub-stats-badge">{h.count}</div>
          </div>
        ))}
      </div>

      {/* Sourcing Catalog Lists */}
      <div className="section-title-wrapper" id="wholesale-listings-grid">
        <div>
          <h2 className="section-title">Verified Wholesale Catalog Directory</h2>
          <p className="section-subtitle">Ex-factory pricing ladders, custom minimum quantities, and registered GST profiles.</p>
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div className="filter-group">
            <h4 className="filter-group-title">Sourcing Categories</h4>
            {['Textiles & Garments', 'Home & Ceramics', 'Hardware & Tools', 'Agriculture & Food'].map(cat => (
              <label key={cat} className="filter-option">
                <input 
                  type="checkbox" 
                  className="filter-checkbox" 
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategorySelect(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4 className="filter-group-title">Sourcing Protections</h4>
            <label className="filter-option" style={{ cursor: 'default' }}>
              <input type="checkbox" className="filter-checkbox" checked disabled />
              GSTIN Registered
            </label>
            <label className="filter-option" style={{ cursor: 'default' }}>
              <input type="checkbox" className="filter-checkbox" checked disabled />
              SafeTrade Escrow
            </label>
          </div>

          <div className="filter-group" style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '2rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>🛡️ SafeTrade Guarantee</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.4rem', lineHeight: 1.4 }}>Procure safely. Sourcing quotes undergo secure weight verification and ex-factory tier checking. Escrow funds released only upon certified transport dispatch.</p>
          </div>
        </aside>

        {/* Listings Grid */}
        <div className="products-grid">
          {products.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              📦 No wholesale products match the active sourcing search parameters.
            </div>
          ) : (
            products.map(p => {
              const tiers = p.tiers || [];
              const priceMax = tiers.length > 0 ? tiers[0].price : 850;
              const priceMin = tiers.length > 1 ? tiers[tiers.length - 1].price : priceMax;
              return (
                <div 
                  key={p.id} 
                  className="product-card"
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setCalcQty(p.moq);
                    setCalcResult(null);
                    setActiveTab('product-detail');
                  }}
                >
                  <div className="product-img-wrapper">
                    <img src={p.image} className="product-img" alt={p.name} />
                    <div className="badge-verification">
                      <svg style={{ width: '12px', height: '12px', fill: 'currentColor' }} viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Verified GST
                    </div>
                    <div className="product-hub-tag">{p.hub ? p.hub.toUpperCase() : 'HUB'}</div>
                  </div>
                  <div className="product-info">
                    <div className="product-moq">MOQ: <span>{p.moq} {p.unit}</span></div>
                    <h3 className="product-name">{p.name}</h3>
                    <div className="product-price-range">₹{priceMin} - ₹{priceMax}</div>
                    
                    <div className="product-supplier">
                      <div className="supplier-compact">
                        <span className="sup-name">{p.supplier ? p.supplier.name : (p.Supplier ? p.Supplier.name : 'Indian Factory')}</span>
                        <span className="sup-loc">{p.supplier ? p.supplier.location : (p.Supplier ? p.Supplier.location : 'Cluster Sourced')}</span>
                      </div>
                      <span className="trust-badge">{p.supplier ? p.supplier.trustScore : (p.Supplier ? p.Supplier.trustScore : '98%')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sourcing RFQ Quick Broadcast Widget */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '3rem', marginTop: '4rem' }}>
        <div style={{ maxWidth: '48%' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.8rem' }}>Sourcing Custom Specifications?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>Broadcast your exact technical blueprints, packing requirements, and target pricing. Sourcing bids will be compiled from verified manufacturers within hours.</p>
        </div>
        <form onSubmit={handleFastRfq} style={{ flex: 1, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>⚡ Fast Buyer RFQ Sourcing Broadcast</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-input-wrapper">
              <input type="text" name="fast-rfq-prod" className="form-input" placeholder="Product name (e.g. Surat Cotton Saree)" required />
            </div>
            <div className="form-input-wrapper">
              <input type="number" name="fast-rfq-qty" className="form-input" placeholder="Quantity needed" required min="1" />
            </div>
          </div>
          <div className="form-input-wrapper">
            <textarea name="fast-rfq-desc" className="form-input form-textarea" style={{ minHeight: '70px' }} placeholder="Add specifications (e.g. bio-washed grade, HSN requirements, shipping city)..."></textarea>
          </div>
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Broadcast Sourcing Bid Offer</button>
        </form>
      </div>
    </div>
  );
}
