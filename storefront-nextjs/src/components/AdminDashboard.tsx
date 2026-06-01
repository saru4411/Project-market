'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { PendingSeller } from '@/types';

interface AdminDashboardProps {
  token: string | null;
  gatewayUrl: string;
  triggerAlert: (message: string, type?: 'success' | 'error') => void;
  getAuthHeaders: () => Record<string, string>;
}

export default function AdminDashboard({ token, gatewayUrl, triggerAlert, getAuthHeaders }: AdminDashboardProps) {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // Fetch pending review queue from backend
  const { data: pendingSellers = [], isLoading, refetch } = useQuery<PendingSeller[]>({
    queryKey: ['pendingSellers'],
    queryFn: async () => {
      const res = await fetch(`${gatewayUrl}/auth/seller-pending`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to retrieve pending seller requests');
      return await res.json();
    }
  });

  // Approve seller mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`${gatewayUrl}/auth/seller-approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error during approval');
      return data;
    },
    onSuccess: (data: { message?: string }) => {
      triggerAlert(data.message || 'Successfully approved seller and created supplier profile.');
      queryClient.invalidateQueries({ queryKey: ['pendingSellers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (err: Error) => {
      triggerAlert(err.message, 'error');
    }
  });

  const handleApprove = (userId: number) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (_userId: number) => {
    triggerAlert('Rejected application and requested correction details (Simulated action).');
    setRejectingId(null);
  };

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '2rem auto',
      padding: '1.5rem',
      fontFamily: 'var(--font-sans)',
      color: '#ffffff'
    }}>
      
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            🛡️ Admin Review Central
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            IndiTrade Platform Integrity & Sourcing Document Auditing Portal.
          </p>
        </div>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
          GATEWAY SECURE
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
        marginBottom: '2.5rem'
      }}>
        
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Pending Queue Applications
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: pendingSellers.length > 0 ? '#f59e0b' : '#ffffff' }}>
            {isLoading ? '...' : pendingSellers.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Active Platform Suppliers
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            5 Verified
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            SafeTrade Escrow Volume
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            ₹7,32,300
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            System Audit Status
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: '0.8rem' }}>
            ✅ HEALTHY
          </div>
        </div>

      </div>

      {/* Main Review Section */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          📋 Supplier Application Audit Queue
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Fetching pending seller registrations...
          </div>
        ) : pendingSellers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border)'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#ffffff' }}>
              All Clear! Queue is empty.
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
              Every submitted seller application has been processed. New requests will automatically appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {pendingSellers.map((seller) => (
              <div key={seller.id} style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '3fr 2fr',
                gap: '1.5rem',
                alignItems: 'start'
              }}>
                
                {/* Seller Profile Data */}
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem' }}>
                    🏢 {seller.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📍 <strong>Location</strong>: {seller.location}, {seller.state || 'Gujarat'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ✉️ <strong>Email</strong>: {seller.email}
                    </span>
                  </div>
                  
                  {/* Verification Badges */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(249, 115, 22, 0.1)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      GSTIN: {seller.gstin}
                    </span>
                    <span style={{
                      background: 'rgba(79, 70, 229, 0.1)',
                      color: '#818cf8',
                      border: '1px solid rgba(79, 70, 229, 0.3)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      ISO Standard: {seller.iso || 'ISO Certified MSME'}
                    </span>
                  </div>
                </div>

                {/* Sourcing Docs Audit & Actions */}
                <div style={{
                  borderLeft: '1px solid var(--border)',
                  paddingLeft: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  height: '100%',
                  justifyContent: 'space-between'
                }}>
                  
                  {/* File Placeholders */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      AUDIT DOCUMENTS
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        📄 GST_Certificate_2026.pdf <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(Verified)</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        📄 MSME_Registration_Udyam.pdf <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(Verified)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                    <button
                      onClick={() => handleApprove(seller.id)}
                      disabled={approveMutation.isPending}
                      style={{
                        flex: 2,
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        transition: 'background 0.2s'
                      }}
                    >
                      {approveMutation.isPending && approveMutation.variables === seller.id ? 'Approving...' : '✓ Approve & Provision'}
                    </button>
                    <button
                      onClick={() => setRejectingId(seller.id)}
                      style={{
                        flex: 1,
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      Reject
                    </button>
                  </div>

                </div>

                {/* Reject Confirmation Dialog Overlay */}
                {rejectingId === seller.id && (
                  <div style={{
                    gridColumn: '1 / span 2',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px dashed #ef4444',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>
                      Are you sure you want to reject this seller profile application? Specify feedback forcorrection:
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. GSTIN alphanumeric spelling correction needed."
                      defaultValue="GSTIN code spelling does not match simulated database."
                    />
                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                      <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setRejectingId(null)}>
                        Cancel
                      </button>
                      <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: '#ef4444' }} onClick={() => handleReject(seller.id)}>
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
