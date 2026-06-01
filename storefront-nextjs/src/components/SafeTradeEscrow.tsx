'use client';

import React, { useState, useEffect } from 'react';

interface EscrowContract {
  id: string;
  material: string;
  value: string;
  qty: string;
  supplier: string;
  hub: string;
  custodian: string;
  status: 'AWAITING-DEPOSIT' | 'DEPOSITED-LOCKED' | 'IN-TRANSIT' | 'INSPECTION-PERIOD' | 'DISPUTED' | 'RESOLVED-RELEASED';
  countdownSeconds: number;
  disputeReason?: string;
  trackingCode?: string;
}

const SEEDED_CONTRACTS: EscrowContract[] = [
  {
    id: 'B2B-CON-872A',
    material: 'Morbi Vitrified Glazed Porcelain Floor Tiles (600x1200mm)',
    qty: '1,500 Sqm',
    value: '7,32,300.00',
    supplier: 'Morbi Ceramic Export-Import Corp',
    hub: 'Morbi Ceramic Hub',
    custodian: 'State Bank of India (SafeTrade Escrow Division)',
    status: 'INSPECTION-PERIOD',
    countdownSeconds: 172800, // 48 hours
    trackingCode: 'TRK-MRB-98A72'
  },
  {
    id: 'B2B-CON-1092',
    material: 'Pure Banarasi Silk Yarn (Wholesale Gold Border Rolls)',
    qty: '100 Rolls',
    value: '85,000.00',
    supplier: 'Surat Premium Textile Mills Ltd',
    hub: 'Surat Textile Hub',
    custodian: 'ICICI Bank Ltd (ONDC Trust Escrow Node)',
    status: 'AWAITING-DEPOSIT',
    countdownSeconds: 0
  },
  {
    id: 'B2B-CON-553F',
    material: 'Heavy-Duty Brass Padlocks (Double Security Cylinders)',
    qty: '500 Pieces',
    value: '1,70,000.00',
    supplier: 'Aligarh Industrial Security Works',
    hub: 'Aligarh Hardware Hub',
    custodian: 'HDFC Bank Ltd (MSME Trade Guarantee Fund)',
    status: 'RESOLVED-RELEASED',
    countdownSeconds: 0,
    trackingCode: 'TRK-ALG-44F12'
  }
];

export default function SafeTradeEscrow() {
  const [contracts, setContracts] = useState<EscrowContract[]>(SEEDED_CONTRACTS);
  const [selectedContract, setSelectedContract] = useState<EscrowContract>(SEEDED_CONTRACTS[0]);
  
  // Simulated UPI Escrow deposit state
  const [upiUpiId, setUpiId] = useState<string>('buyeway@sbi-escrow');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  
  // Dispute logging fields
  const [disputeText, setDisputeText] = useState<string>('');
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);

  // Live countdown timer hook for active INSPECTION-PERIOD contracts
  useEffect(() => {
    const timer = setInterval(() => {
      setContracts(prev => prev.map(c => {
        if (c.status === 'INSPECTION-PERIOD' && c.countdownSeconds > 0) {
          const nextSec = c.countdownSeconds - 1;
          if (c.id === selectedContract.id) {
            setSelectedContract(curr => ({ ...curr, countdownSeconds: nextSec }));
          }
          return { ...c, countdownSeconds: nextSec };
        }
        return c;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedContract.id]);

  const updateContractStatus = (id: string, newStatus: EscrowContract['status'], extraFields = {}) => {
    setContracts(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, status: newStatus, ...extraFields };
        if (selectedContract.id === id) {
          setSelectedContract(updated);
        }
        return updated;
      }
      return c;
    }));
  };

  const handleFundEscrow = (id: string) => {
    setIsDepositing(true);
    setTimeout(() => {
      updateContractStatus(id, 'DEPOSITED-LOCKED');
      setIsDepositing(false);
    }, 1500);
  };

  const handleDispatch = (id: string) => {
    updateContractStatus(id, 'IN-TRANSIT', { trackingCode: 'TRK-SIM-' + Math.floor(Math.random()*90000+10000) });
  };

  const handleDeliver = (id: string) => {
    updateContractStatus(id, 'INSPECTION-PERIOD', { countdownSeconds: 172800 });
  };

  const handleRaiseDispute = () => {
    if (!disputeText.trim()) return;
    updateContractStatus(selectedContract.id, 'DISPUTED', { disputeReason: disputeText });
    setDisputeText('');
    setShowDisputeModal(false);
  };

  const handleReleaseFunds = (id: string) => {
    updateContractStatus(id, 'RESOLVED-RELEASED');
  };

  const handleAcceptSettlement = (id: string) => {
    // simulated settlement (10% rebate)
    const valFloat = parseFloat(selectedContract.value.replace(/,/g, ''));
    const settledValue = (valFloat * 0.9).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    updateContractStatus(id, 'RESOLVED-RELEASED', { value: settledValue });
  };

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return 'Inspection Period Expired';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{
          color: '#10b981',
          fontWeight: 800,
          fontSize: '0.82rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-block',
          marginBottom: '0.6rem'
        }}>
          SafeTrade Smart Escrow Hub
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
          SafeTrade Escrow & Dispute Resolver
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
          Lock procurement funds in trade-guaranteed escrows, track real-time dispatches, manage inspection intervals, and resolve quality disputes.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Side: Active Contracts Sidebar list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📜 ACTIVE ESCROW CONTRACTS ({contracts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contracts.map(c => {
              const isSelected = selectedContract.id === c.id;
              let statusColor = '#94a3b8'; // grey
              if (c.status === 'INSPECTION-PERIOD') statusColor = 'var(--primary)';
              else if (c.status === 'RESOLVED-RELEASED') statusColor = 'var(--success)';
              else if (c.status === 'AWAITING-DEPOSIT') statusColor = '#f59e0b';
              else if (c.status === 'DISPUTED') statusColor = '#ef4444';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContract(c)}
                  style={{
                    background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isSelected ? '0 4px 15px rgba(79, 70, 229, 0.15)' : 'none'
                  }}
                  className="contract-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {c.id}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: `${statusColor}15`,
                      color: statusColor,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      border: `1px solid ${statusColor}30`
                    }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    marginBottom: '0.6rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {c.material.split('(')[0]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{c.value}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Qty: {c.qty.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Contract detail & control terminal */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          minHeight: '520px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  SafeTrade Escrow Agreement
                </h2>
                <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  ({selectedContract.id})
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                🛡️ Custodian Node: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedContract.custodian}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Secured Contract Value
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                ₹{selectedContract.value}
              </span>
            </div>
          </div>

          {/* Sourced Item Description Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '1.5rem',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Wholesale Product Specifications
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                {selectedContract.material}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Factory Manufacturer Node
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                🏭 {selectedContract.supplier} ({selectedContract.hub.split(' ')[0]})
              </div>
            </div>
          </div>

          {/* Workflow Interactive Step Status Tracker */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              🎯 ESCROW TRANSACTION TIMELINE STATUS
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              position: 'relative'
            }}>
              {[
                { name: 'Fund Escrow', active: true, done: selectedContract.status !== 'AWAITING-DEPOSIT' },
                { name: 'Ship Cargo', active: selectedContract.status !== 'AWAITING-DEPOSIT', done: ['IN-TRANSIT', 'INSPECTION-PERIOD', 'DISPUTED', 'RESOLVED-RELEASED'].includes(selectedContract.status) },
                { name: 'Quality Inspect', active: ['IN-TRANSIT', 'INSPECTION-PERIOD', 'DISPUTED', 'RESOLVED-RELEASED'].includes(selectedContract.status), done: ['INSPECTION-PERIOD', 'DISPUTED', 'RESOLVED-RELEASED'].includes(selectedContract.status) },
                { name: 'Disburse Funds', active: ['INSPECTION-PERIOD', 'DISPUTED', 'RESOLVED-RELEASED'].includes(selectedContract.status), done: selectedContract.status === 'RESOLVED-RELEASED' }
              ].map((step, idx) => (
                <div key={idx} style={{
                  background: step.done ? 'rgba(16, 185, 129, 0.08)' : step.active ? 'rgba(79, 70, 229, 0.05)' : '#04060b',
                  border: `1px solid ${step.done ? 'var(--success)' : step.active ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  padding: '0.75rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: step.done ? 'var(--success)' : step.active ? 'var(--accent)' : 'var(--border)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.4rem auto'
                  }}>
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: step.done ? 'var(--success)' : step.active ? '#ffffff' : 'var(--text-muted)'
                  }}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive State Actions & Countdowns */}
          <div style={{
            background: '#04060b',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Case 1: Awaiting Deposit */}
            {selectedContract.status === 'AWAITING-DEPOSIT' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.4rem' }}>
                  ⏳ Deposit Awaiting Funding
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Ensure you lock the agreement values in the SBI central Trade escrow to notify the Surat manufacturer node to begin raw loading.
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleFundEscrow(selectedContract.id)}
                    disabled={isDepositing}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                      opacity: isDepositing ? 0.7 : 1
                    }}
                  >
                    {isDepositing ? '📡 Contacting Bank Gateway...' : '💳 Simulate UPI Escrow Funding'}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    UPI Target: <strong>{upiUpiId}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Case 2: Deposited / Locked */}
            {selectedContract.status === 'DEPOSITED-LOCKED' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.4rem' }}>
                  🔒 Escrow Capital Secured (Funded)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Funds are cryptographically verified and locked in the escrow ledger. The manufacturer node has been dispatched.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => handleDispatch(selectedContract.id)}
                >
                  🚚 Simulate Factory Dispatch (Generate Manifest Logs)
                </button>
              </div>
            )}

            {/* Case 3: In Transit */}
            {selectedContract.status === 'IN-TRANSIT' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#818cf8', marginBottom: '0.4rem' }}>
                  🚚 Cargo In Transit
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Track code: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{selectedContract.trackingCode}</strong>. Volumetric cargo is logged via road freight V-Trans.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleDeliver(selectedContract.id)}
                >
                  📦 Log Terminal Receipt & Start Inspection Period
                </button>
              </div>
            )}

            {/* Case 4: Inspection Countdown timer Active */}
            {selectedContract.status === 'INSPECTION-PERIOD' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                      ⏱️ 48-Hour Digital Inspection countdown Active
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', margin: 0 }}>
                      Inspect sourced ceramics for shipping hairline fractures. Lock/Hold or Release to pay.
                    </p>
                  </div>
                  {/* Glowing Timer */}
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: 'var(--primary)',
                    background: 'rgba(249,115,22,0.1)',
                    border: '1px solid var(--primary)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    boxShadow: '0 0 10px rgba(249,115,22,0.1)'
                  }}>
                    {formatCountdown(selectedContract.countdownSeconds)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleReleaseFunds(selectedContract.id)}
                    style={{ background: 'var(--success)', border: 'none' }}
                  >
                    🤝 Release Escrow Funds to Factory
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowDisputeModal(true)}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    ⚠️ Lodge Sourcing Dispute / Raise Claim
                  </button>
                </div>
              </div>
            )}

            {/* Case 5: Quality Dispute Raised */}
            {selectedContract.status === 'DISPUTED' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.4rem' }}>
                  ⚠️ Escrow Claim Dispute Lodged
                </h4>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.25rem'
                }}>
                  <strong>Dispute Statement:</strong> {selectedContract.disputeReason}
                  <div style={{ marginTop: '0.5rem', color: '#ffffff' }}>
                    📢 <strong>Supplier Settlement Offer:</strong> Morbi Node 1 offers a <strong>10% Rebate</strong> (refund of ₹{ (parseFloat(selectedContract.value.replace(/,/g, '')) * 0.1).toLocaleString('en-IN') }) to resolve the claim.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleAcceptSettlement(selectedContract.id)}
                    style={{ background: 'var(--success)', border: 'none' }}
                  >
                    Accept 10% Rebate & Release Escrow
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleReleaseFunds(selectedContract.id)}
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Release Full Sourcing Payment anyway
                  </button>
                </div>
              </div>
            )}

            {/* Case 6: Escrow Resolved & Released */}
            {selectedContract.status === 'RESOLVED-RELEASED' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.4rem' }}>
                  ✅ Escrow Disbursed (Completed)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Funds successfully unlocked and credited to the factory supplier. ONDC Smart Escrow Receipt compiled.
                </p>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--success)',
                  borderRadius: '6px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TX STATUS:</span>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>SUCCESS / PARSED</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>LEDGER ID:</span>
                    <span>SBI-ESC-ONDC-{selectedContract.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TOTAL CREDITED:</span>
                    <span>₹{selectedContract.value}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quality Dispute Modal */}
      {showDisputeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444', margin: 0 }}>
              ⚠️ Lodge Sourcing Quality Dispute
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Describe the cargo issues (e.g. hairline ceramic cracks, fabric dye density mismatches) to raise a formal hold.
            </p>

            <textarea
              style={{
                width: '100%',
                height: '100px',
                background: '#04060b',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                color: 'white',
                fontSize: '0.85rem',
                resize: 'none'
              }}
              placeholder="Provide photo proof statement (e.g., '14 ceramic wall tiles cracked on delivery due to insufficient roadside pallet strapping V-Trans...')"
              value={disputeText}
              onChange={(e) => setDisputeText(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowDisputeModal(false)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleRaiseDispute}
                disabled={!disputeText.trim()}
                style={{ background: '#ef4444', border: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                File Sourcing Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
