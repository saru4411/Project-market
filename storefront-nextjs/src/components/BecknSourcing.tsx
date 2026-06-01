'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/apiClient';

interface BecknItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  unit: string;
  moq: number;
  weightPerUnit: number;
  image: string;
}

interface BecknProvider {
  provider: string;
  provider_id: string;
  location: string;
  trustScore: string;
  items: BecknItem[];
}

interface BecknQuoteBreakup {
  title: string;
  price: {
    currency: string;
    value: string;
  };
}

interface BecknOrderState {
  id?: string;
  provider?: { id: string; descriptor: { name: string } };
  items?: Array<{ id: string; descriptor: { name: string }; price: { value: string }; quantity: { count: number } }>;
  quote?: {
    price: { value: string };
    breakup: BecknQuoteBreakup[];
  };
  billing?: any;
  fulfillment?: any;
  payment?: {
    type: string;
    status: string;
  };
  status?: string;
  tracking_id?: string;
}

export default function BecknSourcing() {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('Gujarat');
  
  // State pipeline
  const [activeStep, setActiveStep] = useState<'search' | 'select' | 'init' | 'confirm'>('search');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [searchProviders, setSearchProviders] = useState<BecknProvider[]>([]);
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Selected item metrics
  const [selectedItem, setSelectedItem] = useState<BecknItem | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<BecknProvider | null>(null);

  // Sourced states
  const [selectQuote, setSelectQuote] = useState<BecknOrderState | null>(null);
  const [initContract, setInitContract] = useState<BecknOrderState | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<BecknOrderState | null>(null);

  // Shipping Inputs
  const [billingName, setBillingName] = useState('IndiProcure B2B Ltd');
  const [billingGstin, setBillingGstin] = useState('24AAAAB1234C1Z1');
  const [shippingArea, setShippingArea] = useState('Maharashtra Logistics Terminal');
  const [shippingCity, setShippingCity] = useState('Mumbai');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // ── Protocol Poller Loop ──────────────────────────────────────────────────
  const startPolling = (txId: string, action: 'search' | 'select' | 'init' | 'confirm') => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsPolling(true);
    let attempts = 0;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 8) { // Timeout after 8 seconds
        stopPolling();
        triggerAlert('Protocol polling timeout. Indian supplier nodes busy.', 'error');
        return;
      }

      try {
        const res: any = await apiRequest(`/beckn/results?transaction_id=${txId}&action=${action}`, {
          method: 'GET',
          auth: true
        });

        if (res.data) {
          if (action === 'search' && Array.isArray(res.data) && res.data.length > 0) {
            setSearchProviders(res.data);
            stopPolling();
            triggerAlert('Asynchronous open network catalogs aggregated successfully!');
          } else if (action === 'select' && res.data) {
            setSelectQuote(res.data);
            stopPolling();
            setActiveStep('select');
            triggerAlert('Wholesale ex-factory pricing quote signed by supplier!');
          } else if (action === 'init' && res.data) {
            setInitContract(res.data);
            stopPolling();
            setActiveStep('init');
            triggerAlert('SafeTrade contract initialized successfully!');
          } else if (action === 'confirm' && res.data) {
            setConfirmOrder(res.data);
            stopPolling();
            setActiveStep('confirm');
            triggerAlert('Wholesale contract confirmed and escrow funded!');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1000);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchProviders([]);
    const txId = crypto.randomUUID();
    setTransactionId(txId);

    try {
      await apiRequest('/beckn/search', {
        method: 'POST',
        auth: true,
        body: { text: searchText, category, location, transaction_id: txId }
      });
      triggerAlert('Broadcasting Beckn search across decentralized supplier clusters...');
      startPolling(txId, 'search');
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const handleSelectItem = async (provider: BecknProvider, item: BecknItem) => {
    if (!transactionId) return;
    setSelectedItem(item);
    setSelectedProvider(provider);

    try {
      await apiRequest('/beckn/select', {
        method: 'POST',
        auth: true,
        body: { item_id: item.id, supplier_id: provider.provider_id, transaction_id: transactionId }
      });
      triggerAlert('Initiating item quote selection handshake asynchronously...');
      startPolling(transactionId, 'select');
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const handleInitContract = async () => {
    if (!transactionId || !selectedItem || !selectedProvider) return;

    try {
      await apiRequest('/beckn/init', {
        method: 'POST',
        auth: true,
        body: {
          transaction_id: transactionId,
          item_id: selectedItem.id,
          supplier_id: selectedProvider.provider_id,
          billing: { name: billingName, gstin: billingGstin },
          shipping: { area: shippingArea, city: shippingCity }
        }
      });
      triggerAlert('Initializing contract dispatch terms...');
      startPolling(transactionId, 'init');
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const handleConfirmOrder = async () => {
    if (!transactionId || !selectedItem || !selectedProvider) return;

    try {
      await apiRequest('/beckn/confirm', {
        method: 'POST',
        auth: true,
        body: {
          transaction_id: transactionId,
          item_id: selectedItem.id,
          supplier_id: selectedProvider.provider_id
        }
      });
      triggerAlert('Funding SafeTrade B2B Escrow and locking order confirmation...');
      startPolling(transactionId, 'confirm');
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const resetFlow = () => {
    setActiveStep('search');
    setTransactionId(null);
    setSearchProviders([]);
    setSelectedItem(null);
    setSelectedProvider(null);
    setSelectQuote(null);
    setInitContract(null);
    setConfirmOrder(null);
    setSearchText('');
  };

  return (
    <div className="fadeIn" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(30, 58, 138, 0.08) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ background: 'var(--primary)', color: 'white', fontWeight: 900, fontSize: '0.72rem', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '10px', marginRight: '0.5rem', letterSpacing: '0.05em' }}>Beckn Protocol</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.5rem', marginBottom: '0.4rem' }}>ONDC Open Sourcing Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>Discover, quote, and transact directly with verified manufacturing clusters across India asynchronously.</p>
        </div>
        {activeStep !== 'search' && (
          <button className="btn-secondary" onClick={resetFlow}>
            🔄 Return to Search Console
          </button>
        )}
      </div>

      {/* Alert toast */}
      {alert && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, background: alert.type === 'success' ? '#15803d' : '#b91c1c', color: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }} className="fadeIn">
          {alert.type === 'success' ? '🛡️' : '⚠️'} {alert.text}
        </div>
      )}

      {/* Dynamic Workflow Progress Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        {[
          { id: 'search', label: '1. Discover Nodes' },
          { id: 'select', label: '2. Negotiate Quote' },
          { id: 'init', label: '3. Initialize Escrow' },
          { id: 'confirm', label: '4. Contract Confirmed' }
        ].map((step) => {
          const isCurrent = activeStep === step.id;
          const isPast = ['search', 'select', 'init', 'confirm'].indexOf(activeStep) >= ['search', 'select', 'init', 'confirm'].indexOf(step.id);
          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', opacity: isPast ? 1 : 0.4 }}>
              <span style={{ fontSize: '0.72rem', color: isCurrent ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Workflow Step</span>
              <strong style={{ fontSize: '0.92rem', color: isCurrent ? 'var(--primary)' : 'var(--text-primary)', borderBottom: isCurrent ? '2px solid var(--primary)' : 'none', paddingBottom: '0.3rem' }}>{step.label}</strong>
            </div>
          );
        })}
      </div>

      {/* Active Step Panels */}
      
      {/* STEP 1: SEARCH & DISCOVER */}
      {activeStep === 'search' && (
        <div>
          {/* Query Form */}
          <form onSubmit={handleSearch} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔍 Decentralized Sourcing Broadcast Console</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Wholesale Product catalog *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Silk fabric, Floor tiles, Brass locks..." 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Industrial Hub Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="Textiles">Textiles & Apparel</option>
                  <option value="Ceramics">Building Materials</option>
                  <option value="Hardware">Industrial & Locks</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Hub State</label>
                <select className="form-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="Gujarat">Gujarat Clusters</option>
                  <option value="Uttar Pradesh">Uttar Pradesh Clusters</option>
                  <option value="Tamil Nadu">Tamil Nadu Clusters</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '1rem' }} disabled={isPolling}>
              {isPolling ? '📡 Broadcasting Cryptographic Handshakes (Polling)...' : 'Broadcast Decentralized Beckn Search'}
            </button>
          </form>

          {/* Polling Loader */}
          {isPolling && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0', background: 'var(--bg-secondary)', border: '1px dotted var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div className="pulse" style={{ width: '40px', height: '40px', background: 'rgba(30, 58, 138, 0.2)', border: '4px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Listening for Supplier Webhooks...</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validating incoming Ed25519 signatures & BLAKE2b digests in real-time</span>
              </div>
            </div>
          )}

          {/* Results Listings */}
          {!isPolling && searchProviders.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>📡 Decentralized Nodes Responded:</h3>
              {searchProviders.map((prov) => (
                <div key={prov.provider_id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {/* Supplier Info Header */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>🏭 {prov.provider}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '1rem' }}>📍 {prov.location}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem' }}>Trust Score: <strong style={{ color: 'var(--success)' }}>{prov.trustScore}</strong></span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', padding: '1.5rem' }}>
                    {prov.items.map((item) => (
                      <div key={item.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', gap: '1rem' }}>
                        <img src={item.image} style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} alt="" />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                          <div>
                            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', lineHeight: 1.3 }}>{item.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min MOQ: {item.moq} {item.unit} | {item.weightPerUnit} Kg/u</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{item.price.toFixed(2)}</strong>
                            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleSelectItem(prov, item)}>
                              Select Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isPolling && searchProviders.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '4rem 0', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <span>📡 No active open network sourcing broadcast active.</span>
              <span style={{ fontSize: '0.8rem' }}>Enter a query above to scan the Indian supplier network.</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SELECT (QUOTE SHEET) */}
      {activeStep === 'select' && selectQuote && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
          
          {/* Item details */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem' }}>Selected Open-Network Item</h2>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <img src={selectedItem?.image} style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} alt="" />
              <div>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>{selectedItem?.name}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Supplier: <strong>{selectedProvider?.provider}</strong></span><br />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Location: 📍 {selectedProvider?.location}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div>📦 Negotiated Qty: <strong style={{ color: 'var(--text-primary)' }}>50 {selectedItem?.unit}</strong></div>
              <div>⚖️ Unit Weight: <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.weightPerUnit} Kg</strong></div>
            </div>

            {/* Input Billing & Shipping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>📍 Dispatch & Billing Credentials</strong>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Billing Entity Name</label>
                <input type="text" className="form-input" value={billingName} onChange={(e) => setBillingName(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Buyer GSTIN Credential</label>
                <input type="text" className="form-input" value={billingGstin} onChange={(e) => setBillingGstin(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Shipping Destination</label>
                  <input type="text" className="form-input" value={shippingArea} onChange={(e) => setShippingArea(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} />
                </div>
              </div>
            </div>

            <button className="btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '1rem' }} onClick={handleInitContract} disabled={isPolling}>
              {isPolling ? '📡 Initiating Contract (Polling)...' : 'Configure Logistics & Init Contract'}
            </button>
          </div>

          {/* Quote breakdown */}
          <div className="invoice-overlay" style={{ marginTop: 0 }}>
            <div className="invoice-header">
              <div>
                <div className="invoice-title">ONDC Sourced Quote</div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Decentralized Handshake Sizing</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#1e3a8a' }}>{selectedProvider?.provider.toUpperCase()}</strong><br />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tx ID: {transactionId?.slice(0, 8)}</span>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Component Description</th>
                  <th style={{ textAlign: 'right' }}>Wholesale Rate</th>
                </tr>
              </thead>
              <tbody>
                {selectQuote.quote?.breakup.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.title}</strong></td>
                    <td style={{ textAlign: 'right' }}>₹{parseFloat(item.price.value).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-total-section">
              <div className="invoice-total-row grand">
                <span>Decentralized Total:</span>
                <strong style={{ textAlign: 'right', color: '#1e3a8a' }}>₹{parseFloat(selectQuote.quote?.price.value || "0").toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="invoice-watermark" style={{ background: 'rgba(59, 130, 246, 0.06)', color: 'var(--primary)' }}>
              🔒 Cryptographically Signed Quote Verified
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: INIT (TERMS & DRAFT CONTRACT) */}
      {activeStep === 'init' && initContract && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
          
          {/* Sourcing terms */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.6rem' }}>SafeTrade Escrow Terms</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span>Manufacturer Node:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedProvider?.provider}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span>Contract Billing Name:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{billingName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span>GSTIN Verification:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{billingGstin}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span>Dispatch Hub Terminal:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{shippingArea} ({shippingCity})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span>Payment Escrow Gateway:</span>
                <strong style={{ color: 'var(--primary)' }}>{initContract.payment?.type || "SafeTrade UPI Escrow"}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span>Payment Gate Status:</span>
                <span style={{ color: '#b45309', background: '#fef3c7', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>PENDING ESCROW FUND</span>
              </div>
            </div>

            <button className="btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '1rem', background: 'var(--success)', border: 'none' }} onClick={handleConfirmOrder} disabled={isPolling}>
              {isPolling ? '📡 Locking Escrow (Polling)...' : 'Fund SafeTrade Escrow & Confirm Contract'}
            </button>
          </div>

          {/* Draft Contract */}
          <div className="invoice-overlay" style={{ marginTop: 0 }}>
            <div className="invoice-header">
              <div>
                <div className="invoice-title">ONDC Sourcing Agreement</div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Draft Sourced Contract Terms</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.25rem 0', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Consignor (Supplier)</span><br />
                <strong>{selectedProvider?.provider}</strong><br />
                <span>📍 {selectedProvider?.location}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Consignee (Buyer)</span><br />
                <strong>{billingName}</strong><br />
                <span>📍 {shippingArea}, {shippingCity}</span>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Decentralized Sourced Item</th>
                  <th style={{ textAlign: 'right' }}>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{selectedItem?.name}</strong><br />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: 50 units | Weight: {((selectedItem?.weightPerUnit || 1) * 50).toFixed(1)} Kg</span>
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                    <strong>₹{parseFloat(selectQuote?.quote?.price.value || "0").toLocaleString('en-IN')}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-watermark" style={{ background: 'rgba(245, 158, 11, 0.06)', color: '#d97706' }}>
              🛡️ Escrow Handshake Authorized & Signed
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRM (SUCCESSFULLY COMPLETED RECEIPT) */}
      {activeStep === 'confirm' && confirmOrder && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }} className="fadeIn">
            
            {/* Success icon */}
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', color: '#15803d' }}>
              🛡️
            </div>

            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--success)', margin: '0 0 0.5rem 0' }}>Sourcing Contract Sealed!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>Your SafeTrade B2B Escrow has been funded. The open-network supplier node has accepted your dispatch request successfully.</p>
            </div>

            {/* Receipt telemetry */}
            <div style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.88rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>ONDC Order Code:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{confirmOrder.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Decentralized Tracking ID:</span>
                <strong style={{ color: 'var(--primary)' }}>{confirmOrder.tracking_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Wholesale Supplier:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedProvider?.provider}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Decentralized Items:</span>
                <strong style={{ color: 'var(--text-primary)' }}>50 x {selectedItem?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>SafeTrade Escrow Balance:</span>
                <strong style={{ color: 'var(--success)' }}>₹{parseFloat(selectQuote?.quote?.price.value || "0").toLocaleString('en-IN')} (FUNDED)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dispatch Status:</span>
                <span style={{ color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>READY FOR DELIVERY</span>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={resetFlow}>
              🔄 Initiate Another Sourcing Request
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
