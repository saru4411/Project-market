'use client';

import type { Supplier, Product, Order, Inquiry } from '@/types';

interface SupplierDashboardProps {
  activeSupplierId: number;
  setActiveSupplierId: (id: number) => void;
  suppliers: Supplier[];
  orders: Order[];
  inquiries: Inquiry[];
  products: Product[];
  handleOnboardSupplier: (e: React.FormEvent<HTMLFormElement>) => void;
  newSupName: string;
  setNewSupName: (v: string) => void;
  newSupLoc: string;
  setNewSupLoc: (v: string) => void;
  newSupState: string;
  setNewSupState: (v: string) => void;
  newSupIso: string;
  setNewSupIso: (v: string) => void;
  newSupGstin: string;
  setNewSupGstin: (v: string) => void;
  handleListProduct: (e: React.FormEvent<HTMLFormElement>) => void;
  newProdSupId: string;
  setNewProdSupId: (v: string) => void;
  newProdName: string;
  setNewProdName: (v: string) => void;
  newProdCat: string;
  setNewProdCat: (v: string) => void;
  newProdHub: string;
  setNewProdHub: (v: string) => void;
  newProdMoq: string;
  setNewProdMoq: (v: string) => void;
  newProdUnit: string;
  setNewProdUnit: (v: string) => void;
  newProdPriceMax: string;
  setNewProdPriceMax: (v: string) => void;
  newProdPriceMin: string;
  setNewProdPriceMin: (v: string) => void;
  newProdHsn: string;
  setNewProdHsn: (v: string) => void;
  newProdWeight: string;
  setNewProdWeight: (v: string) => void;
  newProdDesc: string;
  setNewProdDesc: (v: string) => void;
  verifyDispatch: (order: Order) => void;
  downloadSafeTrade: () => void;
}

export default function SupplierDashboard({
  activeSupplierId,
  setActiveSupplierId,
  suppliers,
  orders,
  inquiries,
  products,
  handleOnboardSupplier,
  newSupName,
  setNewSupName,
  newSupLoc,
  setNewSupLoc,
  newSupState,
  setNewSupState,
  newSupIso,
  setNewSupIso,
  newSupGstin,
  setNewSupGstin,
  handleListProduct,
  newProdSupId,
  setNewProdSupId,
  newProdName,
  setNewProdName,
  newProdCat,
  setNewProdCat,
  newProdHub,
  setNewProdHub,
  newProdMoq,
  setNewProdMoq,
  newProdUnit,
  setNewProdUnit,
  newProdPriceMax,
  setNewProdPriceMax,
  newProdPriceMin,
  setNewProdPriceMin,
  newProdHsn,
  setNewProdHsn,
  newProdWeight,
  setNewProdWeight,
  newProdDesc,
  setNewProdDesc,
  verifyDispatch,
  downloadSafeTrade
}: SupplierDashboardProps) {
  const activeSupplierOrders = orders.filter(o => o.supplierId == activeSupplierId || o.SupplierId == activeSupplierId);
  const salesVolume = activeSupplierOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const activeInquiriesCount = inquiries.filter(i => i.supplierId == activeSupplierId).length;

  return (
    <div className="fadeIn">
      {/* Supplier Hub selector workspace */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 2rem', marginBottom: '2.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Sourcing Session</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>Active Manufacturing Workspace</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '45%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Active Mill Profile:</span>
          <div className="form-input-wrapper" style={{ maxWidth: '350px', flex: 1 }}>
            <select 
              className="form-select" 
              value={activeSupplierId} 
              onChange={(e) => setActiveSupplierId(parseInt(e.target.value))}
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard metrics grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '2rem' }}>📊</span>
          <div>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{salesVolume.toLocaleString('en-IN')}
            </strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sales Volume</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '2rem' }}>📈</span>
          <div>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
              {activeSupplierOrders.length}
            </strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Contracts</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '2rem' }}>💬</span>
          <div>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
              {activeInquiriesCount}
            </strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>RFQ Inquiry Leads</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🛡️</span>
          <div>
            <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Verified GSTIN</strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Trust Verification</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3.5rem' }}>
        {/* Left Column: Factory Onboarding & Listing Creator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* 1. Supplier Register */}
          <div style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(249, 115, 22, 0.03) 100%)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>🏭 MSME Sourcing Supplier Registry</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Onboard a new manufacturing cluster profile, verify business GSTIN registry, and begin listing wholesale rates ex-factory.</p>
            
            <form onSubmit={handleOnboardSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-input-wrapper">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Company / Mill Sourcing Name *" 
                  value={newSupName} 
                  onChange={(e) => setNewSupName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-input-wrapper">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="City Location (e.g. Morbi, Gujarat) *" 
                  value={newSupLoc} 
                  onChange={(e) => setNewSupLoc(e.target.value)} 
                  required 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-input-wrapper">
                  <select className="form-select" value={newSupState} onChange={(e) => setNewSupState(e.target.value)}>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
                <div className="form-input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="ISO/MSME Certifications" 
                    value={newSupIso} 
                    onChange={(e) => setNewSupIso(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-input-wrapper">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="15-digit Sourcing GSTIN Registry *" 
                  value={newSupGstin} 
                  onChange={(e) => setNewSupGstin(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.65rem' }}>Register Sourcing Profile</button>
            </form>
          </div>

          {/* 2. Listing Creator */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>List a New Wholesale Product</h3>
            
            <form onSubmit={handleListProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Associate Supplier Profile *</label>
                <div className="form-input-wrapper">
                  <select className="form-select" value={newProdSupId} onChange={(e) => setNewProdSupId(e.target.value)} required>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Wholesale Product Name *</label>
                <div className="form-input-wrapper">
                  <input type="text" className="form-input" placeholder="e.g. Vitrified Ivory Glazed Floor Tiles" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Sourcing Category *</label>
                  <div className="form-input-wrapper">
                    <select className="form-select" value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)} required>
                      <option value="Textiles & Garments">Textiles & Garments</option>
                      <option value="Home & Ceramics">Home & Ceramics</option>
                      <option value="Hardware & Tools">Hardware & Tools</option>
                      <option value="Agriculture & Food">Agriculture & Food</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Manufacturing Cluster Hub *</label>
                  <div className="form-input-wrapper">
                    <select className="form-select" value={newProdHub} onChange={(e) => setNewProdHub(e.target.value)} required>
                      <option value="surat">Surat Sourcing Hub</option>
                      <option value="morbi">Morbi Ceramic Hub</option>
                      <option value="tirupur">Tirupur Garments Cluster</option>
                      <option value="aligarh">Aligarh Hardware Hub</option>
                      <option value="assam">Assam Plantations</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">MOQ scale size *</label>
                  <div className="form-input-wrapper">
                    <input type="number" className="form-input" placeholder="e.g. 500" value={newProdMoq} onChange={(e) => setNewProdMoq(e.target.value)} required min="1" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Packaging Metric *</label>
                  <div className="form-input-wrapper">
                    <select className="form-select" value={newProdUnit} onChange={(e) => setNewProdUnit(e.target.value)} required>
                      <option value="Pieces">Pieces</option>
                      <option value="Meters">Meters</option>
                      <option value="Kg">Kg</option>
                      <option value="Sqm">Sqm (Tiles)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Max Rate Price (MOQ) *</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">₹</span>
                    <input type="number" className="form-input" placeholder="Price for MOQ" value={newProdPriceMax} onChange={(e) => setNewProdPriceMax(e.target.value)} required min="1" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Min Rate Price (Bulk) *</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">₹</span>
                    <input type="number" className="form-input" placeholder="Price for bulk scale" value={newProdPriceMin} onChange={(e) => setNewProdPriceMin(e.target.value)} required min="1" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">HSN Code *</label>
                  <div className="form-input-wrapper">
                    <input type="text" className="form-input" placeholder="e.g. 69072100" value={newProdHsn} onChange={(e) => setNewProdHsn(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Unit Weight (Kg) *</label>
                  <div className="form-input-wrapper">
                    <input type="number" className="form-input" value={newProdWeight} onChange={(e) => setNewProdWeight(e.target.value)} required step="0.1" />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Technical Specs & description *</label>
                <div className="form-input-wrapper">
                  <textarea className="form-input form-textarea" style={{ minHeight: '65px' }} placeholder="Specify weave thread limits, ceramic backing type..." value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} required></textarea>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem' }}>List Product to Directory</button>
            </form>
          </div>

        </div>

        {/* Right Column: Sourcing inquiry leads & active escrow orders */}
        <div>
          {/* 1. Sourcing leads list */}
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>Wholesale Lead Inbox</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Incoming direct customer inquiries generated from catalog listings and search matches.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {inquiries.filter(i => i.supplierId == activeSupplierId).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                📥 Sourcing inquiry lead inbox is empty.
              </div>
            ) : (
              inquiries.filter(i => i.supplierId == activeSupplierId).map(i => (
                <div 
                  key={i.id} 
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.1rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>👤 {i.buyerName}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏳ {i.date}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.2rem' }}>Item Match: {i.productName}</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45 }}>{i.message}</p>
                </div>
              ))
            )}
          </div>

          {/* 2. Active SafeTrade Escrow orders */}
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '3.5rem', marginBottom: '0.4rem' }}>SafeTrade Escrow Contracts</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Active wholesale orders with secured banking funds pending dispatch verification.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeSupplierOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                🔐 SafeTrade Escrow dashboard is currently empty.
              </div>
            ) : (
              activeSupplierOrders.map(o => (
                <div 
                  key={o.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem',
                    borderLeft: '4px solid var(--success)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{o.orderCode || o.id}</span>
                    <span style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--success)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>{o.status || 'Escrow Funded'}</span>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: '#ffffff' }}>{o.productName}</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.8rem' }}>
                    <div>Quantity Ordered:<br /><strong style={{ color: 'var(--text-primary)' }}>{o.quantity} units</strong></div>
                    <div>Grand Contract:<br /><strong style={{ color: 'var(--primary)' }}>₹{(o.total || 0).toLocaleString('en-IN')}</strong></div>
                    <div>Buyer Location:<br /><strong style={{ color: 'var(--text-primary)' }}>{o.buyerName}</strong></div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem' }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', background: 'var(--accent)', border: 'none' }}
                      onClick={() => verifyDispatch(o)}
                      disabled={o.status === 'Factory Dispatched'}
                    >
                      {o.status === 'Factory Dispatched' ? 'Carrier Dispatched' : 'Verify Factory Dispatch'}
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.4rem 1rem', fontSize: '0.78rem' }}
                      onClick={downloadSafeTrade}
                    >
                      Print SafeTrade Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sourcing Listings Manager List */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '3.5rem', marginBottom: '1rem' }}>Active Sourcing Directory Listings</h3>
          <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <table style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Product Listing</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>MOQ scale</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Sourcing Hub</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => (p.supplier && p.supplier.id == activeSupplierId) || (p.Supplier && p.Supplier.id == activeSupplierId)).length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      (No listings found under this supplier profile session)
                    </td>
                  </tr>
                ) : (
                  products.filter(p => (p.supplier && p.supplier.id == activeSupplierId) || (p.Supplier && p.Supplier.id == activeSupplierId)).map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>{p.category}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>{p.moq} {p.unit}</td>
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--primary)' }}>{p.hub ? p.hub.toUpperCase() : 'HUB'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
