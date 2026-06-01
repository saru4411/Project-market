'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { loginApi, registerApi } from '@/lib/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: User) => void;
  triggerAlert: (message: string, type?: 'success' | 'error') => void;
  // gatewayUrl retained for prop compatibility but no longer used internally
  gatewayUrl?: string;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, triggerAlert }: AuthModalProps) {
  const [mode, setMode] = useState('login'); // login vs register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [stateName, setStateName] = useState('Gujarat');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data;
      if (mode === 'login') {
        data = await loginApi(email, password);
      } else {
        data = await registerApi({
          email,
          password,
          name,
          location: location || 'Not Specified',
          stateName,
        });
      }

      triggerAlert(mode === 'login' ? 'Successfully logged in!' : 'Successfully registered!');
      onAuthSuccess(data.token, data.user as User);
      onClose();
    } catch (err) {
      triggerAlert(err instanceof Error ? err.message : 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease forwards'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          &times;
        </button>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
          {mode === 'login' ? '🔑 Access Procurement' : '🏭 Create B2B Profile'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          {mode === 'login' ? 'Sign in to access secure escrow checkout & RFP boards.' : 'Onboard your B2B profile on the BuyEway network.'}
        </p>

        {/* Test credentials helper */}
        {mode === 'login' && (
          <div style={{
            background: 'rgba(255,165,0,0.08)',
            border: '1px solid rgba(255,165,0,0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            color: '#f59e0b',
            lineHeight: 1.6
          }}>
            <strong>🧪 Test Credentials:</strong><br />
            Buyer: <code>buyer@buyeway.com</code> / <code>password123</code><br />
            Seller: <code>seller@buyeway.com</code> / <code>password123</code><br />
            Admin: <code>admin@buyeway.com</code> / <code>admin123</code>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {mode === 'register' && (
            <>
              <div className="form-input-wrapper">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Full Name / Business Name *" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="City (e.g. Surat) *" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-input-wrapper">
                  <select 
                    className="form-select" 
                    value={stateName} 
                    onChange={(e) => setStateName(e.target.value)}
                  >
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-input-wrapper">
            <input 
              type="email" 
              className="form-input" 
              placeholder="Email Address *" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-input-wrapper">
            <input 
              type="password" 
              className="form-input" 
              placeholder="Password *" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? '🔐 Login to BuyEway' : '🚀 Join BuyEway'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <span 
                onClick={() => setMode('register')} 
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already registered?{' '}
              <span 
                onClick={() => setMode('login')} 
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Login
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
