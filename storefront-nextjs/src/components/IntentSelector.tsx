'use client';

import type { UserRole } from '@/types';

interface IntentSelectorProps {
  onChooseRole: (role: UserRole) => void;
}

export default function IntentSelector({ onChooseRole }: IntentSelectorProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '2rem',
      animation: 'fadeIn 0.4s ease forwards'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}>
        <span style={{
          color: 'var(--accent)',
          fontWeight: 800,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          background: 'rgba(249, 115, 22, 0.1)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          IndiTrade Intent Gateway
        </span>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginTop: '1.25rem',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          What is your sourcing role today?
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
          Choose your workspace. You can switch seamlessly at any time from your navigation menu.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2.5rem',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Left Option: Buyer/Procurement */}
        <div 
          onClick={() => onChooseRole('buyer')}
          style={{
            background: 'linear-gradient(145deg, var(--bg-secondary) 0%, rgba(79, 70, 229, 0.05) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
          className="intent-card-buyer"
        >
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'var(--primary)',
            filter: 'blur(60px)',
            opacity: 0.15,
            pointerEvents: 'none'
          }} />

          <div style={{ fontSize: '3rem' }}>🛒</div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              I want to Buy / Source
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
              PROCUREMENT & CONTRACT DIRECTORY
            </span>
          </div>

          <ul style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            paddingLeft: '1.2rem',
            lineHeight: 1.8,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            margin: 0
          }}>
            <li>Browse Morbi ceramics, Surat textiles, and mega clusters.</li>
            <li>Post custom RFQs with blueprints and target budgets.</li>
            <li>Secure wholesale deals with SafeTrade Escrow grids.</li>
            <li>Track geographic HSN rates and weight freight shipping.</li>
          </ul>

          <button className="btn-primary" style={{
            marginTop: 'auto',
            justifyContent: 'center',
            padding: '0.8rem',
            fontWeight: 700,
            pointerEvents: 'none' // Click is handled by parent card
          }}>
            Enter Buyer Procurement Portal
          </button>
        </div>

        {/* Right Option: Supplier/Manufacturer */}
        <div 
          onClick={() => onChooseRole('supplier')}
          style={{
            background: 'linear-gradient(145deg, var(--bg-secondary) 0%, rgba(249, 115, 22, 0.05) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
          className="intent-card-supplier"
        >
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'var(--accent)',
            filter: 'blur(60px)',
            opacity: 0.15,
            pointerEvents: 'none'
          }} />

          <div style={{ fontSize: '3rem' }}>🏭</div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              I want to Sell / Manufacture
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
              FACTORY DIRECTORY & SALES WORKSPACE
            </span>
          </div>

          <ul style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            paddingLeft: '1.2rem',
            lineHeight: 1.8,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            margin: 0
          }}>
            <li>Manage registered factory credentials and MSME profiles.</li>
            <li>List catalog products with flexible MOQ volume ladders.</li>
            <li>Bid on buyer RFQs with dynamic custom specifications.</li>
            <li>Access funded escrow orders and carrier verify dispatch.</li>
          </ul>

          <button className="btn-primary" style={{
            marginTop: 'auto',
            justifyContent: 'center',
            padding: '0.8rem',
            fontWeight: 700,
            background: 'var(--accent)',
            border: 'none',
            pointerEvents: 'none' // Click is handled by parent card
          }}>
            Enter Supplier Sales Workspace
          </button>
        </div>
      </div>

      {/* Embedded Dynamic Card Styling */}
      <style jsx global>{`
        .intent-card-buyer:hover {
          transform: translateY(-8px);
          border-color: var(--primary) !important;
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25) !important;
        }
        .intent-card-supplier:hover {
          transform: translateY(-8px);
          border-color: var(--accent) !important;
          box-shadow: 0 12px 30px rgba(249, 115, 22, 0.25) !important;
        }
      `}</style>
    </div>
  );
}
