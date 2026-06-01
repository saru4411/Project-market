'use client';

import type { Rfq } from '@/types';

interface RfqBoardProps {
  rfqs: Rfq[];
  refreshData: () => void;
  biddingRfqId: number | null;
  setBiddingRfqId: (id: number | null) => void;
  bidPrice: string;
  setBidPrice: (price: string) => void;
  bidLogistics: string;
  setBidLogistics: (logistics: string) => void;
  handleBidSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleFullRfq: (e: React.FormEvent<HTMLFormElement>) => void;
  userRole: string;
}

export default function RfqBoard({
  rfqs,
  refreshData,
  biddingRfqId,
  setBiddingRfqId,
  bidPrice,
  setBidPrice,
  bidLogistics,
  setBidLogistics,
  handleBidSubmit,
  handleFullRfq,
  userRole
}: RfqBoardProps) {
  return (
    <div className="fadeIn">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3.5rem' }}>
        {/* Left Column: Create RFQ */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Broadcast Sourcing Request (RFQ)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '2rem' }}>Broadcast technical specifications to hundreds of verified factories in Morbi, Surat, Tirupur, and Aligarh.</p>
          
          <form onSubmit={handleFullRfq} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sourcing Product / Requirement *</label>
              <div className="form-input-wrapper">
                <input type="text" name="rfq-title" className="form-input" placeholder="e.g. Sourcing 10,000 meters Premium Raw Silk Yarn" required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category Classification *</label>
              <div className="form-input-wrapper">
                <select name="rfq-cat" className="form-select" required>
                  <option value="Textiles & Garments">Textiles & Garments</option>
                  <option value="Home & Ceramics">Home & Ceramics</option>
                  <option value="Hardware & Tools">Hardware & Tools</option>
                  <option value="Agriculture & Food">Agriculture & Food</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quantity Needed *</label>
                <div className="form-input-wrapper">
                  <input type="number" name="rfq-qty" className="form-input" placeholder="e.g. 5000" required min="1" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Budget Unit Price *</label>
                <div className="form-input-wrapper">
                  <span className="form-prefix">₹</span>
                  <input type="number" name="rfq-price" className="form-input" placeholder="Target budget rate" required min="1" />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Technical Specs & packaging Requirements *</label>
              <div className="form-input-wrapper">
                <textarea name="rfq-desc" className="form-input form-textarea" placeholder="Detail weaving counts, ceramic absorption rates, packaging weight limit, delivery state, etc..." required></textarea>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.85rem' }}>
              Broadcast RFQ Sourcing Request
            </button>
          </form>
        </div>

        {/* Right Column: Live RFQ Sourcing Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Live Sourcing Feed</h2>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Factories are actively posting pricing bids. Live updates every 15s.</span>
            </div>
            <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={refreshData}>🔄 Refresh Feed</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {rfqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                📝 Sourcing boards are empty. Sourcing requests broadcasted will appear here.
              </div>
            ) : (
              rfqs.map(r => (
                <div 
                  key={r.id} 
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <span style={{
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: 'var(--accent)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>{r.category}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>⏳ {r.datePosted || '10m ago'}</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{r.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>{r.description}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>Sourcing Qty:<br /><strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{r.quantity} {r.unit || 'Units'}</strong></div>
                    <div>Target Budget:<br /><strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>₹{r.targetPrice || 'Dynamic'}</strong></div>
                    <div>Procurement Buyer:<br /><strong style={{ color: 'var(--text-primary)' }}>{r.buyerName || 'Verified Buyer'}</strong></div>
                  </div>

                  {/* Bids List */}
                  {r.bids && r.bids.length > 0 && (
                    <div style={{ marginTop: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Bids Received ({r.bids.length}):</span>
                      {r.bids.map((b, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderBottom: idx !== r.bids!.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 600 }}>🏭 {b.supplierName || b.supplier}</span>
                          <span style={{ color: 'var(--success)' }}>₹{b.bidPrice} (ex-factory)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bid Proposal Widget */}
                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                    {biddingRfqId === r.id ? (
                      <form onSubmit={handleBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.8rem' }}>
                          <div className="form-input-wrapper">
                            <span className="form-prefix">₹</span>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder="Your Bid Quote" 
                              value={bidPrice}
                              onChange={(e) => setBidPrice(e.target.value)}
                              required 
                            />
                          </div>
                          <div className="form-input-wrapper">
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Logistics terms & lead..." 
                              value={bidLogistics}
                              onChange={(e) => setBidLogistics(e.target.value)}
                              required 
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button type="button" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }} onClick={() => setBiddingRfqId(null)}>Cancel</button>
                          <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Submit Sourcing Bid</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>💬 {r.status || 'Active (0 Bids)'}</span>
                        {userRole === 'supplier' && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              setBiddingRfqId(r.id);
                              setBidPrice(r.targetPrice ? String(r.targetPrice - 10) : '250');
                              setBidLogistics('Dispatched in 7 days via road freight.');
                            }}
                          >
                            Submit Factory Bid Quote
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
