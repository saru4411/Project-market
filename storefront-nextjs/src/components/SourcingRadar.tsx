'use client';

import React, { useState, useEffect } from 'react';

interface SourcingHubData {
  id: string;
  name: string;
  location: string;
  category: string;
  capacity: string;
  factories: string;
  uptime: string;
  pingMs: number;
  latitude: number; // percentage from top (0-100) for custom grid plot
  longitude: number; // percentage from left (0-100) for custom grid plot
  icon: string;
  color: string;
  popularItems: string[];
}

const HUBS_DATA: SourcingHubData[] = [
  {
    id: 'surat',
    name: 'Surat Textile Hub',
    location: 'Gujarat',
    category: 'Textiles & Apparel',
    capacity: '380,000 meters/day',
    factories: '1,420+ Mills',
    uptime: '99.98%',
    pingMs: 24,
    latitude: 52,
    longitude: 32,
    icon: '🧵',
    color: '#f97316',
    popularItems: ['Banarasi Silk Yarn', 'Khadi Cotton Weave', 'Jacquard Brocade']
  },
  {
    id: 'morbi',
    name: 'Morbi Ceramic Hub',
    location: 'Gujarat',
    category: 'Building Materials',
    capacity: '1,200,000 sqm/day',
    factories: '850+ Factories',
    uptime: '99.95%',
    pingMs: 28,
    latitude: 50,
    longitude: 26,
    icon: '🧱',
    color: '#e0f2fe',
    popularItems: ['Polished Vitrified Tiles', 'Glazed Wall Ceramics', 'Quartz Slabs']
  },
  {
    id: 'tirupur',
    name: 'Tirupur Garment Cluster',
    location: 'Tamil Nadu',
    category: 'Apparel & Knitwear',
    capacity: '500,000 garments/day',
    factories: '1,100+ Units',
    uptime: '99.99%',
    pingMs: 35,
    latitude: 86,
    longitude: 42,
    icon: '👕',
    color: '#10b981',
    popularItems: ['Combed Cotton Hoodies', 'Bio-Washed Plain Tees', 'Organic Jersey Fabric']
  },
  {
    id: 'aligarh',
    name: 'Aligarh Hardware Hub',
    location: 'Uttar Pradesh',
    category: 'Industrial & Hardware',
    capacity: '240,000 security units/day',
    factories: '620+ Units',
    uptime: '99.92%',
    pingMs: 18,
    latitude: 38,
    longitude: 46,
    icon: '🔐',
    color: '#f59e0b',
    popularItems: ['Double Locking Padlocks', 'Brass Hardware Handles', 'Vandal-Proof Mortises']
  },
  {
    id: 'assam',
    name: 'Assam Tea Plantations',
    location: 'Dibrugarh, Assam',
    category: 'Agriculture & Food',
    capacity: '45,000 Kg/day',
    factories: '340+ Estates',
    uptime: '99.90%',
    pingMs: 42,
    latitude: 32,
    longitude: 88,
    icon: '🍃',
    color: '#84cc16',
    popularItems: ['Orthodox Black Tea', 'CTC Blend Premium', 'Organic Green Loose Leaf']
  },
  {
    id: 'moradabad',
    name: 'Moradabad Brassware Hub',
    location: 'Uttar Pradesh',
    category: 'Handicrafts & Decor',
    capacity: '15,000 art pieces/day',
    factories: '480+ Artisans',
    uptime: '99.94%',
    pingMs: 20,
    latitude: 34,
    longitude: 48,
    icon: '🏺',
    color: '#818cf8',
    popularItems: ['Hammered Brass Urns', 'Vintage Copper Decanters', 'Antique Silver Candlesticks']
  }
];

interface LogEntry {
  time: string;
  msg: string;
  type: 'search' | 'select' | 'init' | 'confirm' | 'ping';
}

export default function SourcingRadar() {
  const [selectedHub, setSelectedHub] = useState<SourcingHubData>(HUBS_DATA[0]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkPingRate, setNetworkPingRate] = useState<number>(99.95);
  const [totalQueries, setTotalQueries] = useState<number>(342890);

  // Generate dynamic Beckn traffic log logs to simulate a real open-network
  useEffect(() => {
    // Initial logs list
    setLogs([
      { time: '02:18:24', msg: 'BAP: Outbound /search broadcasted to Aligarh Gateway Hub.', type: 'search' },
      { time: '02:18:25', msg: 'ONDC BGP: surat-mills-1.com replied to on_search (24ms).', type: 'ping' },
      { time: '02:18:40', msg: 'SafeTrade Escrow: Funds locked in contract escrow for ORD-9872.', type: 'confirm' },
      { time: '02:19:01', msg: 'BGP: morbi-ceramics-2.com dispatched digital invoice on_select.', type: 'select' },
      { time: '02:19:15', msg: 'Gateway Network ping: Tirupur Node registered 35ms latency.', type: 'ping' }
    ]);

    const interval = setInterval(() => {
      const actions = [
        { msg: 'BAP: Outbound /search broadcasted to Morbi Sourcing Hub.', type: 'search' },
        { msg: 'BGP: aligarh-locks-3.com confirmed escrow terms on_init.', type: 'init' },
        { msg: 'ONDC: buyer-app.buyeway.com updated transaction token cash.', type: 'ping' },
        { msg: 'BGP: surat-cotton-mills successfully authenticated on_select (21ms).', type: 'select' },
        { msg: 'SafeTrade Escrow: Contract ORD-1092 fully funded via NEFT transfer.', type: 'confirm' }
      ];

      const chosen = actions[Math.floor(Math.random() * actions.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setLogs(prev => [
        { time: timeStr, msg: chosen.msg, type: chosen.type as any },
        ...prev.slice(0, 7)
      ]);

      setTotalQueries(q => q + Math.floor(Math.random() * 3) + 1);
      setNetworkPingRate(p => {
        const drift = (Math.random() - 0.5) * 0.02;
        return Math.min(100, Math.max(99.5, p + drift));
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            background: 'rgba(249, 115, 22, 0.1)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            display: 'inline-block',
            marginBottom: '0.6rem'
          }}>
            ONDC India Sourcing Telemetry
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Interactive Sourcing Radar Map
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Monitor manufacturing capacities and trace cryptographic open supplier nodes across India in real-time.
          </p>
        </div>

        {/* Aggregate Network Status Indicators */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Active Network Ping
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.15rem' }}>
              {networkPingRate.toFixed(2)}%
            </div>
          </div>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Network Handshakes
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#818cf8', marginTop: '0.15rem' }}>
              {totalQueries.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Side: India Interactive Map Grid */}
        <div style={{
          background: 'radial-gradient(145deg, var(--bg-secondary) 0%, rgba(15, 21, 36, 0.95) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          position: 'relative',
          height: '580px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Subtle grid backdrop */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            pointerEvents: 'none'
          }} />

          {/* Saffron/Blue dynamic glows */}
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '25%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '40%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* SVG Map of India (Stylized Wireframe Outline) */}
          <svg 
            viewBox="0 0 600 700" 
            style={{ 
              width: '100%', 
              height: '100%', 
              maxHeight: '520px',
              opacity: 0.65,
              filter: 'drop-shadow(0 0 20px rgba(79, 70, 229, 0.1))',
              transition: 'all 0.5s ease'
            }}
          >
            {/* Outline path representing India */}
            <path 
              d="M280,50 L290,65 L292,80 L285,92 L275,100 L273,115 L285,125 L295,120 L310,132 L315,148 L308,160 L318,175 L335,160 L350,175 L340,192 L345,210 L370,225 L390,210 L410,220 L425,215 L450,225 L475,230 L520,240 L540,250 L550,265 L545,275 L525,270 L515,285 L520,305 L500,310 L490,295 L475,302 L468,320 L452,328 L430,320 L425,305 L410,300 L380,315 L365,305 L350,312 L345,335 L330,345 L328,370 L345,385 L352,408 L348,435 L356,462 L368,485 L362,510 L350,535 L342,560 L330,590 L318,615 L300,650 L292,670 L285,670 L280,645 L278,610 L265,580 L255,548 L248,515 L245,482 L248,450 L242,420 L238,390 L240,360 L245,330 L238,300 L220,285 L200,280 L185,290 L175,310 L160,325 L145,335 L128,340 L110,342 L105,330 L115,315 L135,312 L150,295 L140,282 L155,270 L172,272 L185,258 L190,240 L182,220 L168,212 L150,218 L138,205 L150,195 L165,190 L180,185 L192,165 L208,155 L220,135 L218,110 L230,95 L242,90 L252,75 L260,65 L275,55 Z" 
              fill="none" 
              stroke="#4f46e5" 
              strokeWidth="2" 
              strokeDasharray="4 4"
            />
          </svg>

          {/* Plot Sourcing Node Markers */}
          {HUBS_DATA.map((hub) => {
            const isSelected = selectedHub.id === hub.id;
            return (
              <div
                key={hub.id}
                onClick={() => setSelectedHub(hub)}
                style={{
                  position: 'absolute',
                  top: `${hub.latitude}%`,
                  left: `${hub.longitude}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Outer ping animation ring */}
                <div style={{
                  position: 'absolute',
                  width: isSelected ? '45px' : '30px',
                  height: isSelected ? '45px' : '30px',
                  borderRadius: '50%',
                  border: `2px solid ${hub.color}`,
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  opacity: 0.85
                }} />

                {/* Inner glowing dot */}
                <div style={{
                  width: isSelected ? '18px' : '12px',
                  height: isSelected ? '18px' : '12px',
                  borderRadius: '50%',
                  background: isSelected 
                    ? `radial-gradient(circle, #ffffff 30%, ${hub.color} 100%)` 
                    : hub.color,
                  boxShadow: `0 0 15px ${hub.color}, 0 0 30px ${hub.color}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />

                {/* Name Label */}
                <div style={{
                  marginTop: '0.4rem',
                  background: 'rgba(8, 12, 20, 0.95)',
                  border: `1px solid ${isSelected ? hub.color : 'rgba(255,255,255,0.1)'}`,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: isSelected ? 800 : 500,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease'
                }}>
                  {hub.icon} {hub.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Cluster statistics panel & Activity Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Cluster Details Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: `1px solid ${selectedHub.color}50`,
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 8px 30px rgba(0,0,0,0.3), 0 0 30px ${selectedHub.color}08`,
            transition: 'all 0.3s ease'
          }}>
            {/* Corner Hub Icon Glow */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '4.5rem',
              opacity: 0.15,
              userSelect: 'none',
              transform: 'rotate(15deg)'
            }}>
              {selectedHub.icon}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.8rem' }}>{selectedHub.icon}</span>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{selectedHub.name}</h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  📍 {selectedHub.location} Cluster Hub
                </div>
              </div>
            </div>

            {/* Hub Properties */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.2rem',
              marginBottom: '1.5rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Daily Output Capacity
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {selectedHub.capacity}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Factory Density
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {selectedHub.factories}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  BGP Node Uptime
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.15rem' }}>
                  📶 {selectedHub.uptime}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Gateway Latency
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#818cf8', marginTop: '0.15rem' }}>
                  ⚡ {selectedHub.pingMs} ms
                </div>
              </div>
            </div>

            {/* Popular Catalog Items */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.6rem' }}>
                ⭐ Core wholesale Listings Sourced
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedHub.popularItems.map((item, idx) => (
                  <span 
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{
                width: '100%', 
                justifyContent: 'center', 
                background: selectedHub.color === '#e0f2fe' ? 'var(--accent)' : selectedHub.color,
                border: 'none',
                padding: '0.7rem'
              }}
            >
              Dispatch Outbound /search Sourcing Query
            </button>
          </div>

          {/* Live Beckn protocol Logs Console */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '240px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                💻 Protocol Handshake Stream
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Live Listener</span>
              </div>
            </div>

            <div style={{
              background: '#04060b',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              border: '1px solid rgba(255,255,255,0.02)'
            }}>
              {logs.map((log, idx) => {
                let color = '#94a3b8'; // grey
                if (log.type === 'search') color = '#f97316'; // orange
                else if (log.type === 'confirm') color = '#10b981'; // green
                else if (log.type === 'select') color = '#818cf8'; // indigo
                else if (log.type === 'init') color = '#f59e0b'; // amber

                return (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', lineBreak: 'anywhere' }}>
                    <span style={{ color: 'var(--text-muted)' }}>[{log.time}]</span>
                    <span style={{ color }}>{log.msg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
