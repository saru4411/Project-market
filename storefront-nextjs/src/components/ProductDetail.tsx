'use client';

import type { Product, CalcResult, ActiveTab, DetailTab } from '@/types';

interface ProductDetailProps {
  selectedProduct: Product;
  selectedThumb: number;
  setSelectedThumb: (idx: number) => void;
  activeDetailTab: DetailTab;
  setActiveDetailTab: (tab: DetailTab) => void;
  calcQty: number;
  setCalcQty: (qty: number) => void;
  buyerState: string;
  setBuyerState: (state: string) => void;
  carrier: string;
  setCarrier: (c: string) => void;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  handleEscrowSizing: () => void;
  isCalculating: boolean;
  calcResult: CalcResult | null;
  handleEscrowCommit: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedProductId: (id: number | null) => void;
}

export default function ProductDetail({
  selectedProduct,
  selectedThumb,
  setSelectedThumb,
  activeDetailTab,
  setActiveDetailTab,
  calcQty,
  setCalcQty,
  buyerState,
  setBuyerState,
  carrier,
  setCarrier,
  paymentMethod,
  setPaymentMethod,
  handleEscrowSizing,
  isCalculating,
  calcResult,
  handleEscrowCommit,
  setActiveTab,
  setSelectedProductId
}: ProductDetailProps) {
  const supplier: Partial<import('@/types').Supplier> = selectedProduct.supplier ?? selectedProduct.Supplier ?? {};

  return (
    <div className="fadeIn">
      {/* Back button */}
      <span className="btn-back-catalog" onClick={() => { setActiveTab('marketplace'); setSelectedProductId(null); }}>
        ← Return to Sourcing Directory
      </span>

      <div className="product-details-grid">
        {/* Left Column: Visual Media Gallery */}
        <div className="product-detail-images">
          <div className="main-detail-img-box">
            <img 
              src={selectedProduct.images && selectedProduct.images[selectedThumb] ? selectedProduct.images[selectedThumb] : selectedProduct.image} 
              className="main-detail-img" 
              alt={selectedProduct.name} 
            />
          </div>
          <div className="thumbnail-row">
            {(selectedProduct.images || [selectedProduct.image]).map((img, idx) => (
              <div 
                key={idx} 
                className={`thumb-box ${selectedThumb === idx ? 'active' : ''}`}
                onClick={() => setSelectedThumb(idx)}
              >
                <img src={img} className="thumb-img" alt="" />
              </div>
            ))}
          </div>

          {/* Sub Tab Info panels */}
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '1.5rem', marginBottom: '1.25rem' }}>
              {(['description', 'supplier', 'shipping'] as import('@/types').DetailTab[]).map(tab => (
                <span 
                  key={tab} 
                  style={{
                    paddingBottom: '0.6rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                    color: activeDetailTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                    borderBottom: activeDetailTab === tab ? '2px solid var(--primary)' : 'none'
                  }}
                  onClick={() => setActiveDetailTab(tab)}
                >
                  {tab === 'shipping' ? 'Logistics Terms' : tab}
                </span>
              ))}
            </div>

            {activeDetailTab === 'description' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <p>{selectedProduct.description}</p>
                <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>📋 HSN classification: <strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.hsn}</strong></div>
                  <div>📦 Lead ex-factory: <strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.leadTime || '15 Days'}</strong></div>
                  <div>⚖️ Unit Weight: <strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.weightPerUnit} Kg</strong></div>
                  <div>🏷️ Packing Unit: <strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.unit}</strong></div>
                </div>
              </div>
            )}

            {activeDetailTab === 'supplier' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{supplier.name}</h4>
                <p>📍 Sourcing Hub: {supplier.location} ({supplier.state})</p>
                <p>📜 Verification: {supplier.iso || 'ISO 9001 Approved Factory'}</p>
                <p>🏛️ GSTIN Credentials: {supplier.gstin}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', display: 'block' }}>Trust Score</span>
                    <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{supplier.trustScore || '98%'}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', display: 'block' }}>Response Rate</span>
                    <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{supplier.responseTime || '< 2 Hours'}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === 'shipping' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <p>Bulk shipments are routed through specialized geographic carriage clusters. Dynamic weight-based freight mapping applies on checkout dispatch:</p>
                <ul style={{ marginTop: '0.6rem', paddingLeft: '1.2rem' }}>
                  <li><strong>V-Trans (Road Carrier)</strong>: High-efficiency sandbox cargo freight at ₹6 per metric unit-Kg.</li>
                  <li><strong>TCI Freight (Cargo Express)</strong>: Heavy bulk freight rates at ₹4 per metric unit-Kg.</li>
                  <li><strong>Delhivery Cargo</strong>: Ultra-fast logistics express networks at ₹18 per metric unit-Kg.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sourcing & Pricing Escalation Panel */}
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verified Factory Catalog</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', marginBottom: '0.8rem', lineHeight: 1.25 }}>{selectedProduct.name}</h1>
          
          {/* Volume Ladders */}
          <div className="pricing-tier-scale">
            {(selectedProduct.tiers || []).map((tier, idx) => {
              const isQtyInTier = calcQty >= tier.min && (!tier.max || calcQty <= tier.max);
              return (
                <div 
                  key={idx} 
                  className={`pricing-tier-card ${isQtyInTier ? 'active' : ''}`}
                >
                  <div className="tier-price">₹{tier.price}</div>
                  <div className="tier-range">{tier.min}{tier.max ? ` - ${tier.max}` : '+'} {selectedProduct.unit}</div>
                </div>
              );
            })}
          </div>

          {/* Sizing Interactive inputs */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>🛠️ Secure SafeTrade Sourcing Calculator</div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sourcing Quantity ({selectedProduct.unit}) *</label>
              <div className="form-input-wrapper">
                <input 
                  type="number" 
                  className="form-input" 
                  value={calcQty} 
                  onChange={(e) => setCalcQty(Math.max(0, parseInt(e.target.value) || 0))}
                  min={selectedProduct.moq}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min Order MOQ: {selectedProduct.moq} units ex-factory.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Buyer State *</label>
                <div className="form-input-wrapper">
                  <select className="form-select" value={buyerState} onChange={(e) => setBuyerState(e.target.value)}>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Assam">Assam</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Carriage Logistics *</label>
                <div className="form-input-wrapper">
                  <select className="form-select" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                    <option value="vtrans">V-Trans (Road Sandbox)</option>
                    <option value="tci">TCI Freight (Bulk Cargo)</option>
                    <option value="delhivery">Delhivery Cargo (Express)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Security Gate *</label>
              <div className="form-input-wrapper">
                <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="NEFT">Bank NEFT Escrow</option>
                  <option value="RTGS">Bank RTGS Escrow</option>
                  <option value="SafeTrade-UPI">SafeTrade Instant UPI</option>
                </select>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ justifyContent: 'center', padding: '0.8rem' }}
              onClick={handleEscrowSizing}
              disabled={isCalculating}
            >
              {isCalculating ? 'Computing GST Tax Grids...' : 'Calculate SafeTrade Sourcing Quote'}
            </button>
          </div>

          {/* Printable Proforma overlay */}
          {calcResult && (
            <div style={{ marginTop: '2rem' }} className="fadeIn">
              
              {/* Dynamic Freight Optimization Grid */}
              {calcResult.shippingOptions && (
                <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🚚 Dynamic Route Optimization Engine
                  </div>
                  
                  {/* Telemetry row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div>🗺️ Est. Distance: <strong style={{ color: 'var(--text-primary)' }}>{calcResult.distanceKm || 0} Km</strong></div>
                    <div>⚖️ Billable Weight: <strong style={{ color: 'var(--text-primary)' }}>{calcResult.chargeableWeight || 0} Kg</strong></div>
                    <div title={`Deadweight: ${calcResult.deadWeight} Kg | Volumetric: ${calcResult.volumetricWeight} Kg`}>
                      📐 Vol. Weight: <strong style={{ color: 'var(--text-primary)' }}>{calcResult.volumetricWeight || 0} Kg</strong>
                    </div>
                  </div>

                  {/* Multi-Carrier cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {calcResult.shippingOptions.map((opt) => {
                      const isSelected = carrier.toLowerCase() === opt.carrier.toLowerCase();
                      return (
                        <div 
                          key={opt.carrier}
                          onClick={() => {
                            setCarrier(opt.carrier);
                            setTimeout(handleEscrowSizing, 50);
                          }}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: isSelected ? '0 0 0 2px rgba(var(--primary-rgb), 0.1), 0 4px 12px rgba(0,0,0,0.05)' : 'none'
                          }}
                          className={`shipping-option-card ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{opt.name}</strong>
                              {opt.isRecommended && (
                                <span style={{ background: '#e6f4ea', color: '#137333', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 800 }}>
                                  ⭐ Recommended
                                </span>
                              )}
                              {opt.isCheapest && (
                                <span style={{ background: '#e8f0fe', color: '#1a73e8', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 800 }}>
                                  💎 Best Cost
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type: {opt.type} | Transit: ~{opt.transitDays} Days</span>
                            {opt.recommendationReason && (
                              <span style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 500 }}>💡 {opt.recommendationReason}</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '1.15rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>₹{opt.cost.toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="invoice-overlay">
                <div className="invoice-header">
                  <div>
                    <div className="invoice-title">Proforma Invoice</div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>SafeTrade Escrow Sourcing Registry</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#1e3a8a' }}>{process.env.NEXT_PUBLIC_APP_NAME || 'INDITRADE B2B'}</strong><br />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {calcResult.parentCode}</span>
                  </div>
                </div>

                <div className="invoice-grid">
                  <div>
                    <div className="invoice-meta-label">Manufacturer Supplier</div>
                    <strong style={{ color: '#0f172a' }}>{supplier.name || 'Verified Supplier'}</strong><br />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {supplier.location || 'Mega Cluster'}</span><br />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>🏛️ GSTIN: {supplier.gstin || 'GSTIN Pending'}</span>
                  </div>
                  <div>
                    <div className="invoice-meta-label">Buyer Sourcing Entity</div>
                    <strong style={{ color: '#0f172a' }}>Verified Buyer Partner</strong><br />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {buyerState} Hub Sourcing Area</span><br />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>🛡️ Escrow Gate: {paymentMethod}</span>
                  </div>
                </div>

                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th style={{ color: '#334155' }}>Product Item Description</th>
                      <th style={{ textAlign: 'right', color: '#334155' }}>Quantity</th>
                      <th style={{ textAlign: 'right', color: '#334155' }}>Ex-Factory Rate</th>
                      <th style={{ textAlign: 'right', color: '#334155' }}>Taxable Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(calcResult.suborders || []).map((sub, idx) => {
                      const unitRate = sub.subtotal / sub.quantity;
                      return (
                        <tr key={idx}>
                          <td>
                            <strong>{sub.productName}</strong><br />
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Logistics: {carrier.toUpperCase()} | Grid: {sub.taxType}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>{sub.quantity} units</td>
                          <td style={{ textAlign: 'right' }}>₹{unitRate.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>₹{sub.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="invoice-total-section">
                  <div className="invoice-total-row">
                    <span>Ex-Factory Subtotal:</span>
                    <strong style={{ textAlign: 'right' }}>₹{calcResult.grandSubtotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="invoice-total-row">
                    <span>Sourcing tax (GST):</span>
                    <strong style={{ textAlign: 'right' }}>₹{calcResult.grandTax.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="invoice-total-row">
                    <span>Weight freight ({carrier.toUpperCase()}):</span>
                    <strong style={{ textAlign: 'right' }}>₹{calcResult.grandFreight.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="invoice-total-row grand">
                    <span>Grand Contract Total:</span>
                    <strong style={{ textAlign: 'right', color: '#1e3a8a' }}>₹{calcResult.grandTotal.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="invoice-watermark">
                  🔐 SafeTrade Verified Sourcing Escrow Active
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', justifyContent: 'center', marginTop: '1.5rem', background: 'var(--success)', border: 'none' }}
                onClick={handleEscrowCommit}
              >
                Fund Escrow & Dispatch Wholesale Contract
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
