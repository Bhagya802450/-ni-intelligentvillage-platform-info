import React, { useState, useEffect } from 'react';
import { Layers, Server, Database, Shield, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function ArchitectureView() {
  const [healthData, setHealthData] = useState(null);
  const [pinging, setPinging] = useState(false);

  const checkHealth = async () => {
    setPinging(true);
    const res = await api.getHealth();
    setPinging(false);
    if (res.status === 'HEALTHY' || res.platform) {
      setHealthData(res);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-success">Architecture Blueprint</span>
              <span className="badge badge-info">Enterprise Architecture</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              End-to-End System Architecture
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Interactive topology showing Client UI, API Gateway with Rate Limiting, Frappe Backend Services, and PostgreSQL + Redis persistence.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={checkHealth}
            disabled={pinging}
          >
            <RefreshCw size={14} className={pinging ? 'spin-anim' : ''} />
            {pinging ? 'Pinging Subsystems...' : 'Ping All Subsystems'}
          </button>
        </div>
      </div>

      {/* Interactive Diagram Pipeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        
        {/* Tier 1: Users */}
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '16px 20px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.05em' }}>LAYER 1 • USERS</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>👨‍🌾 Farmers & 👮‍♂️ Agriculture Officers</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Aadhaar e-KYC / OTP Authenticated & Role-Based Access Control</div>
        </div>

        {/* Arrow */}
        <div style={{ color: 'var(--primary-light)', fontSize: '1.2rem' }}>▼</div>

        {/* Tier 2: React.js Web / Mobile UI */}
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '16px 20px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
          <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em' }}>LAYER 2 • CLIENT INTERFACE</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>⚡ React.js Web & Mobile Portal</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Farmer Self-Service + Officer ERP Inspection Dashboard</div>
        </div>

        {/* Arrow */}
        <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>HTTPS (Encrypted TLS 1.3)</span> ▼
        </div>

        {/* Tier 3: API Gateway & Rate Limiting */}
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '16px 20px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.05em' }}>LAYER 3 • REVERSE PROXY & GATEWAY</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>🛡️ Nginx API Gateway / Load Balancer</div>
          <div style={{ fontSize: '0.78rem', color: '#fcd34d', marginTop: '4px', fontWeight: 600 }}>
            Active Rate Limiting: 120 req/min (Token Bucket Protection)
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>▼</div>

        {/* Tier 4: Frappe Backend REST APIs */}
        <div className="glass-card" style={{ maxWidth: '750px', width: '100%', padding: '24px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.05em' }}>LAYER 4 • APPLICATION BACKEND SERVICES</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px' }}>⚙️ FRAPPE REST BACKEND & ENGINE</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#34d399' }}>• Auth & RBAC</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>IAM & Aadhaar Token verification</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#38bdf8' }}>• Farmer Management</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Unified Master DB & AgriStack</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#fcd34d' }}>• SUADR & Advisory</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Soil, Weather & Pest Intelligence</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#fbbf24' }}>• Scheme & DBT Engine</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Sanctions & Bank Ledger</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#a78bfa' }}>• HP-ASN Gateway</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Consent exchange & crypto audit</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#f43f5e' }}>• Mandi & APMC APIs</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Live daily commodity rates</div>
            </div>
          </div>
        </div>

        {/* Dual Arrows */}
        <div style={{ display: 'flex', gap: '160px', color: '#c084fc', fontSize: '1.2rem' }}>
          <span>↙</span>
          <span>↘</span>
        </div>

        {/* Tier 5: Persistence & Cache Layer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '750px', width: '100%' }}>
          
          {/* PostgreSQL */}
          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>DATABASE BACKBONE</span>
              <Database size={16} color="#38bdf8" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>🐘 PostgreSQL 16</h4>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>• Farmer master profiles</li>
              <li>• Cadastral land & Khasra parcels</li>
              <li>• Crop sowing & harvest records</li>
              <li>• DBT Scheme sanctions & audits</li>
              <li>• HP-ASN SHA-256 transaction ledgers</li>
            </ul>
          </div>

          {/* Redis */}
          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#f43f5e', fontWeight: 700 }}>CACHE & ASYNC QUEUES</span>
              <Zap size={16} color="#f43f5e" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>⚡ Redis 7</h4>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>• Sub-millisecond Mandi price cache</li>
              <li>• Token Bucket Rate Limiting</li>
              <li>• Active session & OTP tokens</li>
              <li>• Weather telemetry micro-cache</li>
              <li>• Background DBT dispatch queues</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Live System Health Report */}
      {healthData && (
        <div className="glass-card" style={{ padding: '20px 24px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Subsystems Live Telemetry Report
            </span>
            <span className="mono-chip">{healthData.timestamp}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
            {Object.entries(healthData.subsystems || {}).map(([key, val]) => (
              <div key={key} style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1')}:
                </span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
