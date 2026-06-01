'use client';

import { useState } from 'react';
import type { User, ActiveTab } from '@/types';

interface SellerOnboardingProps {
  user: User;
  token: string | null;
  gatewayUrl: string;
  triggerAlert: (message: string, type?: 'success' | 'error') => void;
  onAuthSuccess: (token: string, user: User) => void;
  setActiveTab: (tab: ActiveTab) => void;
  handleLogout: () => void;
}

export default function SellerOnboarding({ user, token, gatewayUrl, triggerAlert, onAuthSuccess, setActiveTab, handleLogout }: SellerOnboardingProps) {
  // Determine starting step based on backend sellerStatus
  // 'none' -> Step 1 (Register)
  // 'pending_docs' -> Step 2 (Documents)
  // 'pending_approval' -> Step 3 (Awaiting Approval)
  const getInitialStep = () => {
    if (user?.sellerStatus === 'pending_docs') return 2;
    if (user?.sellerStatus === 'pending_approval') return 3;
    return 1;
  };

  const [step, setStep] = useState(getInitialStep());
  const [loading, setLoading] = useState(false);

  // Step 1 Form Data
  const [companyName, setCompanyName] = useState(user?.name || '');
  const [gstin, setGstin] = useState('');
  const [iso, setIso] = useState('');

  // Step 2 Form Data
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const handleStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gstin.length !== 15) {
      triggerAlert('GSTIN must be exactly 15 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${gatewayUrl}/auth/seller-step1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyName, gstin, iso: iso || undefined }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit registration');

      // Update parent auth state (name, sellerStatus, token)
      onAuthSuccess(data.token, data.user);
      triggerAlert('Step 1 recorded successfully. Please proceed with verifying documents.');
      setStep(2);
    } catch (err) {
      triggerAlert(err instanceof Error ? err.message : 'Failed to register.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploadedFiles.length === 0) {
      triggerAlert('Please upload at least one verification document (e.g. GST Certificate or MSME Letter).', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${gatewayUrl}/auth/seller-step2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit documents');

      onAuthSuccess(data.token, data.user);
      triggerAlert('Seller application submitted successfully! Awaiting administrator validation.');
      setStep(3);
    } catch (err) {
      triggerAlert(err instanceof Error ? err.message : 'Failed to submit documents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedUpload = (type: 'gst' | 'msme' | 'itr') => {
    const fileNames = {
      gst: 'GST_Certificate_2026.pdf',
      msme: 'MSME_Registration_Udyam.pdf',
      itr: 'ITR_Receipt_FY25.pdf'
    };
    
    if (uploadedFiles.includes(fileNames[type])) {
      triggerAlert('This document is already uploaded.', 'error');
      return;
    }

    setUploadedFiles([...uploadedFiles, fileNames[type]]);
    triggerAlert(`Simulated upload successful: ${fileNames[type]} compiled.`);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== fileName));
  };

  return (
    <div style={{
      maxWidth: '850px',
      margin: '3rem auto',
      padding: '2.5rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      fontFamily: 'var(--font-sans)',
      color: '#ffffff'
    }}>
      
      {/* Wizard Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          🏭 Enter the Supplier Workforce
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Onboard your manufacturing enterprise to list products and bid on high-volume RFQ contract boards.
        </p>
      </div>

      {/* Modern Stepper Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        marginBottom: '3rem',
        padding: '0 1rem'
      }}>
        {/* Connecting Line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '5%',
          right: '5%',
          height: '2px',
          background: '#374151',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '5%',
          width: step === 1 ? '0%' : step === 2 ? '45%' : '90%',
          height: '2px',
          background: 'var(--accent)',
          transition: 'width 0.4s ease',
          zIndex: 2
        }} />

        {/* Step 1 Node */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: step >= 1 ? 'var(--accent)' : '#1f2937',
            border: `3px solid ${step >= 1 ? 'rgba(249, 115, 22, 0.4)' : '#374151'}`,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}>
            {step > 1 ? '✓' : '1'}
          </div>
          <span style={{
            marginTop: '0.6rem',
            fontSize: '0.8rem',
            fontWeight: step === 1 ? 700 : 500,
            color: step === 1 ? 'var(--accent)' : 'var(--text-secondary)'
          }}>
            Company Profile
          </span>
        </div>

        {/* Step 2 Node */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: step >= 2 ? 'var(--accent)' : '#1f2937',
            border: `3px solid ${step >= 2 ? 'rgba(249, 115, 22, 0.4)' : '#374151'}`,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}>
            {step > 2 ? '✓' : '2'}
          </div>
          <span style={{
            marginTop: '0.6rem',
            fontSize: '0.8rem',
            fontWeight: step === 2 ? 700 : 500,
            color: step === 2 ? 'var(--accent)' : 'var(--text-secondary)'
          }}>
            Verification Docs
          </span>
        </div>

        {/* Step 3 Node */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: step >= 3 ? 'var(--accent)' : '#1f2937',
            border: `3px solid ${step >= 3 ? 'rgba(249, 115, 22, 0.4)' : '#374151'}`,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}>
            3
          </div>
          <span style={{
            marginTop: '0.6rem',
            fontSize: '0.8rem',
            fontWeight: step === 3 ? 700 : 500,
            color: step === 3 ? 'var(--accent)' : 'var(--text-secondary)'
          }}>
            Review & Launch
          </span>
        </div>
      </div>

      {/* Step Components */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏢 Step 1: Corporate Registry
          </h3>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Registered Entity / Company Name *</label>
            <div className="form-input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Surat Synthetic Silk Mills"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Must match the official name listed on your GST registration certificate.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>15-Digit Sourcing GSTIN *</label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 24AAAFF1234F1Z5"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                15-character alphanumeric GSTIN registration code.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>ISO Certification (Optional)</label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ISO 9001:2015"
                  value={iso}
                  onChange={(e) => setIso(e.target.value)}
                />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Add if your manufacturing center holds quality standards.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.8rem 2.5rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Save & Proceed to Documents ➔'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📂 Step 2: Verification Documentation
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Please submit mock corporate certification documents. Authenticity of MSME credentials protects our escrow trade platform.
          </p>

          {/* Simulated File Dropper */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleSimulatedUpload('gst');
            }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              textAlign: 'center',
              background: dragOver ? 'rgba(249, 115, 22, 0.05)' : 'rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Drag & Drop Corporate Certificates here
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>
              Supports PDF, JPEG, PNG up to 10MB
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={() => handleSimulatedUpload('gst')}
              >
                ➕ Auto-Upload GST Certificate
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={() => handleSimulatedUpload('msme')}
              >
                ➕ Auto-Upload MSME certificate
              </button>
            </div>
          </div>

          {/* Uploaded File List */}
          {uploadedFiles.length > 0 && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.2rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-secondary)' }}>
                UPLOADED DOCUMENTS ({uploadedFiles.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {uploadedFiles.map(file => (
                  <div key={file} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-primary)',
                    padding: '0.6rem 1rem',
                    borderRadius: '4px',
                    borderLeft: '4px solid var(--success)'
                  }}>
                    <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      📄 {file}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.8rem 2rem' }}
              onClick={() => setStep(1)}
              disabled={loading}
            >
              ➔ Go Back
            </button>
            
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.8rem 2.5rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Submitting Application...' : 'Submit Application for Admin Approval ➔'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '2px solid #f59e0b',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              margin: '0 auto 1.5rem',
              animation: 'pulse 2s infinite'
            }}>
              ⏳
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Seller Verification Pending
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your supplier account application is currently in queue. SafeTrade monitors verification times closely.
            </p>
          </div>

          {/* Pulsing Stepper Timeline */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--accent)' }}>
              VERIFICATION TIMELINE STATUS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Point 1 */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</div>
                <div>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Account Registered</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>BuyEway buyer account established.</p>
                </div>
              </div>

              {/* Point 2 */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</div>
                <div>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Corporate Registry Profile Submitted</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Company details and 15-digit GSTIN logged.</p>
                </div>
              </div>

              {/* Point 3 */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</div>
                <div>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Sourcing Verification Documents Compiled</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GST certificates and MSME documentation simulated uploads verified.</p>
                </div>
              </div>

              {/* Point 4 */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  color: '#f59e0b',
                  fontWeight: 'bold',
                  animation: 'pulse 1.5s infinite',
                  fontSize: '1rem'
                }}>●</div>
                <div>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f59e0b' }}>Admin Review & Verification</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SafeTrade officer is reviewing credentials. Usually takes under 2 hours.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Demo Sandbox Quick Instruction Box */}
          <div style={{
            border: '1px solid rgba(79, 70, 229, 0.4)',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem',
            borderLeft: '4px solid var(--accent)'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              🛡️ Demo Sandbox Administrative Bypass
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#ffffff', lineHeight: 1.5, marginBottom: '1rem' }}>
              To test the approval flow in this sandbox, please **logout of this buyer account** and sign back in using the seeded <strong>Admin Credentials</strong>. Once logged in as admin, you can approve this pending application in the Admin Review dashboard!
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '0.8rem 1rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              <div><strong>Admin Email</strong>: admin@buyeway.com</div>
              <div><strong>Admin Password</strong>: admin123</div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, #ef4444 100%)',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                🔓 Logout of Buyer Account
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab('marketplace')}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
              >
                🏠 View Marketplace (Buyer mode)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
