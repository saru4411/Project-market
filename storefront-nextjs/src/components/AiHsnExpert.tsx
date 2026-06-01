'use client';

import React, { useState } from 'react';

interface SizingAnalysis {
  hsn: string;
  category: string;
  baseTaxRate: number; // percentage
  volumetricFactor: string; // "compact_heavy", "lightweight_bulky", "balanced"
  densityDesc: string;
  matchedGstHeading: string;
}

const PRESETS = [
  { text: "Pure Banarasi Silk Yarn wholesale rolls from Surat hub", desc: "Pure silk weft fabric roll, high density luxury yarn" },
  { text: "Double charged polished vitrified floor tiles Morbi brand size 600x1200mm", desc: "Vitrified glazed porcelain tiles for heavy traffic indoor commercial flooring" },
  { text: "Heavy duty double locking brass padlocks Aligarh security grade", desc: "Industrial locks made of hammered brass with dual protection cylinders" }
];

export default function AiHsnExpert() {
  const [description, setDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [result, setResult] = useState<SizingAnalysis | null>(null);
  
  // Sizing Calculations state
  const [supplierState, setSupplierState] = useState<string>('Gujarat');
  const [buyerState, setBuyerState] = useState<string>('Maharashtra');
  const [unitCost, setUnitCost] = useState<number>(850);
  const [quantity, setQuantity] = useState<number>(100);

  const handleAnalyze = () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    
    // Simulate NLP cognitive model progressive loading steps
    const steps = [
      "Tokenizing product description and loading HSN indexing dictionary...",
      "Resolving standard Indian Tariff schedules (nic2004 Chapter classification)...",
      "Evaluating volumetric packaging profiles and dynamic weight calculations...",
      "Generating dynamic tax structure models and final sizing proforma invoice..."
    ];

    let currentStep = 0;
    setAnalysisStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setAnalysisStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        
        // Compute mockup AI outputs based on matching keywords
        const text = description.toLowerCase();
        let computedResult: SizingAnalysis = {
          hsn: "5208.11.90",
          category: "Textiles & Garments",
          baseTaxRate: 5,
          volumetricFactor: "lightweight_bulky",
          densityDesc: "Lightweight Bulky (Textile fabric - 0.003 m³/Kg)",
          matchedGstHeading: "Knitted or Crocheted Fabrics (Chapter 60/61)"
        };

        if (text.includes('tile') || text.includes('ceramic') || text.includes('glazed') || text.includes('floor') || text.includes('morbi')) {
          computedResult = {
            hsn: "6907.21.00",
            category: "Building Materials & Ceramics",
            baseTaxRate: 18,
            volumetricFactor: "compact_heavy",
            densityDesc: "Compact Heavy (Vitrified porcelain tile - 0.0005 m³/Kg)",
            matchedGstHeading: "Glazed Vitrified Flooring & Ceramics (Chapter 69)"
          };
        } else if (text.includes('silk') || text.includes('banarasi') || text.includes('yarn') || text.includes('surat')) {
          computedResult = {
            hsn: "5007.20.10",
            category: "Textiles & Luxury Silk",
            baseTaxRate: 12,
            volumetricFactor: "balanced",
            densityDesc: "Balanced Midweight (Woven luxury silk yarn - 0.0012 m³/Kg)",
            matchedGstHeading: "Woven Fabrics of Pure Silk (Chapter 50)"
          };
        } else if (text.includes('lock') || text.includes('brass') || text.includes('padlock') || text.includes('aligarh') || text.includes('hardware')) {
          computedResult = {
            hsn: "8301.40.90",
            category: "Industrial Hardware & Metals",
            baseTaxRate: 18,
            volumetricFactor: "compact_heavy",
            densityDesc: "Compact Heavy (Brass cast lock hardware - 0.0004 m³/Kg)",
            matchedGstHeading: "Base Metal Padlocks & Hardware keys (Chapter 83)"
          };
        }

        setResult(computedResult);
        setIsAnalyzing(false);
      }
    }, 900);
  };

  // Perform tax calculations based on selected parameters
  const isInterstate = supplierState !== buyerState;
  const subtotal = unitCost * quantity;
  const taxRate = result ? result.baseTaxRate : 18;
  const totalTax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + totalTax;

  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const igst = totalTax;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{
          color: 'var(--accent)',
          fontWeight: 800,
          fontSize: '0.82rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          background: 'rgba(79, 70, 229, 0.1)',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-block',
          marginBottom: '0.6rem'
        }}>
          AI-Powered Sourcing Classification
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
          AI HSN Sourcing Expert
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
          Evaluate cargo descriptions into standardized HSN codes, logistics packing densities, and regional GST tax rates.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Side: NLP Input console */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              📝 ENTER PRODUCT DESCRIPTIONS & BLUEPRINT SPECS
            </label>
            <textarea
              style={{
                width: '100%',
                height: '130px',
                background: '#04060b',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                fontSize: '0.9rem',
                color: '#ffffff',
                resize: 'none',
                lineHeight: '1.6',
                transition: 'var(--transition)'
              }}
              placeholder="Describe your bulk product in plain English (e.g., '100% combed cotton yarn fabric, bio-washed plain, wholesale hoodies Surat cluster format weight 1.5Kg...')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
              💡 Quick Sourcing Presets
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setDescription(preset.text)}
                  style={{
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid var(--border-light)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  className="preset-btn"
                >
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>#{idx + 1} </span>
                  {preset.text}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !description.trim()}
            style={{
              justifyContent: 'center',
              padding: '0.8rem',
              fontWeight: 700,
              opacity: isAnalyzing || !description.trim() ? 0.6 : 1,
              cursor: isAnalyzing || !description.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isAnalyzing ? '🧠 Core Engine Indexing...' : '🧠 Classify Sourcing Parameters'}
          </button>

          {/* Analyzing Progress Loader */}
          {isAnalyzing && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {/* Spinner */}
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analysisStep}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: AI Classified parameters & Tax Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {result ? (
            <>
              {/* AI Sizing Results Card */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>
                    🟢 HSN CLASSIFICATION COMPLETED
                  </div>
                  <span style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    background: '#04060b',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)'
                  }}>
                    HSN {result.hsn}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Sourcing Category
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>
                      {result.category}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Tariff Schedule GST Rate
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.15rem' }}>
                      {result.baseTaxRate}% base rate ({result.matchedGstHeading})
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Volumetric Logistics Profile
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      📦 {result.densityDesc}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Tax Sizing proforma */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
                  📈 Proforma GST & Invoice Calculator
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Supplier State (Hub)
                    </label>
                    <select
                      style={{
                        width: '100%',
                        background: '#04060b',
                        border: '1px solid var(--border)',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem'
                      }}
                      value={supplierState}
                      onChange={(e) => setSupplierState(e.target.value)}
                    >
                      <option value="Gujarat">Gujarat (Morbi/Surat)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (Aligarh)</option>
                      <option value="Tamil Nadu">Tamil Nadu (Tirupur)</option>
                      <option value="Assam">Assam Plantations</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Buyer Delivery Terminal
                    </label>
                    <select
                      style={{
                        width: '100%',
                        background: '#04060b',
                        border: '1px solid var(--border)',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem'
                      }}
                      value={buyerState}
                      onChange={(e) => setBuyerState(e.target.value)}
                    >
                      <option value="Maharashtra">Maharashtra (Mumbai)</option>
                      <option value="Gujarat">Gujarat (Ahmedabad)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (Noida)</option>
                      <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Unit Price (INR)
                    </label>
                    <input
                      type="number"
                      style={{
                        width: '100%',
                        background: '#04060b',
                        border: '1px solid var(--border)',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: 'white'
                      }}
                      value={unitCost}
                      onChange={(e) => setUnitCost(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Bulk Qty (MOQ)
                    </label>
                    <input
                      type="number"
                      style={{
                        width: '100%',
                        background: '#04060b',
                        border: '1px solid var(--border)',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: 'white'
                      }}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Ledger Invoice Line Items */}
                <div style={{
                  background: '#04060b',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  fontSize: '0.82rem',
                  border: '1px solid rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Ex-Factory Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
                  </div>

                  {isInterstate ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                      <span>Interstate IGST ({taxRate}%):</span>
                      <span>₹{igst.toLocaleString('en-IN')}.00</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                        <span>Intrastate CGST ({taxRate/2}%):</span>
                        <span>₹{cgst.toLocaleString('en-IN')}.00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                        <span>Intrastate SGST ({taxRate/2}%):</span>
                        <span>₹{sgst.toLocaleString('en-IN')}.00</span>
                      </div>
                    </>
                  )}

                  <div style={{ height: '1px', background: 'var(--border)', margin: '0.3rem 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
                    <span>Estimated Proforma:</span>
                    <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              justifyContent: 'center',
              height: '100%'
            }}>
              <span style={{ fontSize: '3rem' }}>🧠</span>
              <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Awaiting Spec Input</div>
              <p style={{ fontSize: '0.82rem', maxWidth: '300px', margin: 0 }}>
                Type a product specification on the left or select a preset to analyze HSN codes and compute taxes instantly.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .preset-btn:hover {
          background: rgba(79, 70, 229, 0.08) !important;
          border-color: var(--accent) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
