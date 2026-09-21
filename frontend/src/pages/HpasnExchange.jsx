import React, { useState, useEffect } from 'react';
import { Network, ShieldCheck, Lock, Activity, Send, CheckCircle2, ArrowRight, Zap, Database, Server, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function HpasnExchange({ farmers, lang = 'en' }) {
  const [departments, setDepartments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [redisStats, setRedisStats] = useState(null);
  const [redisQueues, setRedisQueues] = useState(null);
  const [loading, setLoading] = useState(true);

  const isKn = lang === 'kn';

  // New exchange form
  const [systemType, setSystemType] = useState('GOVERNMENT');
  const [whoRequested, setWhoRequested] = useState('Department of Revenue (HimBhoomi Land Records)');
  const [whatData, setWhatData] = useState('Farmer Land Cadastral Registry & Khasra Survey #614/3');
  const [why, setWhy] = useState('Subsidized Micro-Drip Irrigation Entitlement Check');
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || 'FARMER-HP-1001');
  const [wasConsentRequired, setWasConsentRequired] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recentExchange, setRecentExchange] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [dRes, lRes, rRes, qRes] = await Promise.all([
      api.getAsnDepartments(),
      api.getAsnLogs(),
      api.getRedisStatus(),
      api.getRedisQueues()
    ]);
    if (dRes.success) setDepartments(dRes.data);
    if (lRes.success) setLogs(lRes.data);
    if (rRes.success) setRedisStats(rRes);
    if (qRes.success) setRedisQueues(qRes.queues);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerExchange = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await api.exchangeAsn({
      who_requested: whoRequested,
      what_data: whatData,
      why,
      was_consent_required: wasConsentRequired,
      was_access_allowed: true,
      system_type: systemType,
      target_system: "Frappe Backend (PostgreSQL & Redis)",
      query_key: farmerId
    });
    setSubmitting(false);
    if (res.success && res.exchange) {
      setRecentExchange(res.exchange);
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-success">Step 4 — HP-ASN API Layer</span>
              <span className="badge badge-info">Step 5 — Redis Cache & Queues</span>
              <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                Frappe ➔ PostgreSQL
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0' }}>
              {isKn ? 'ಹಿಮಾಚಲ ಪ್ರದೇಶ ಕೃಷಿ ಸೇವಾ ನೆಟ್‌ವರ್ಕ್ (HP-ASN)' : 'HP Agriculture Service Network (HP-ASN)'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '850px' }}>
              {isKn 
                ? 'ಸರ್ಕಾರದ ವ್ಯವಸ್ಥೆಗಳು (ಕಂದಾಯ, ತೋಟಗಾರಿಕೆ) ಮತ್ತು ಪಾಲುದಾರ ವ್ಯವಸ್ಥೆಗಳ (ಬ್ಯಾಂಕಿಂಗ್, ವಿಮೆ) ನಡುವೆ ರೈತರ ಸಮ್ಮತಿ ಹಾಗೂ 6 ಕಡ್ಡಾಯ ಪ್ರಶ್ನೆಗಳೊಂದಿಗೆ ಸುರಕ್ಷಿತ ಡೇಟಾ ವಿನಿಮಯ.'
                : 'Secure inter-system data flow connecting Government and Partner systems with Frappe, PostgreSQL, and Redis. Every exchange records the 6 mandatory questions: Who, What, When, Why, Was consent required, Was access allowed.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#34d399" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cryptographic Audit: </span>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>HMAC-SHA256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Architectural Data Flow Diagram (Government & Partner Systems) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={20} color="#38bdf8" /> Inter-System Data Flow Architecture
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Government System Flow */}
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>🏛️ FLOW A: GOVERNMENT SYSTEM</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px dashed #38bdf8', borderRadius: '6px', fontWeight: 600 }}>
                1. Government System (Dept of Revenue / HimBhoomi / Horticulture)
              </div>
              <div style={{ textAlign: 'center', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800 }}>↓ Encrypted HTTPS / Mutual TLS</div>
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '6px', fontWeight: 700, color: '#34d399' }}>
                2. HP-ASN API Gateway (Consent Verification & HMAC Audit Logging)
              </div>
              <div style={{ textAlign: 'center', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>↓ Frappe REST Protocol</div>
              <div style={{ padding: '8px 12px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366f1', borderRadius: '6px', fontWeight: 600 }}>
                3. Frappe Backend Engine (DocTypes: Farmer, Land, Crop, SUADR)
              </div>
              <div style={{ textAlign: 'center', color: '#6366f1', fontSize: '0.75rem', fontWeight: 800 }}>↓ Permanent Relational ACID</div>
              <div style={{ padding: '8px 12px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontWeight: 700, color: '#f8fafc' }}>
                4. PostgreSQL Database (Permanent Master of Record)
              </div>
            </div>
          </div>

          {/* Partner System Flow */}
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>🤝 FLOW B: PARTNER SYSTEM</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed #f59e0b', borderRadius: '6px', fontWeight: 600 }}>
                1. Partner System (Bank DBT Switch / Crop Insurance / Agri-Fintech)
              </div>
              <div style={{ textAlign: 'center', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>↓ OAuth 2.0 + Consent Token</div>
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '6px', fontWeight: 700, color: '#34d399' }}>
                2. HP-ASN API Gateway (Rate Limiter + Consent Ledger)
              </div>
              <div style={{ textAlign: 'center', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>↓ Frappe REST Protocol</div>
              <div style={{ padding: '8px 12px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366f1', borderRadius: '6px', fontWeight: 600 }}>
                3. Frappe Backend Engine
              </div>
              <div style={{ textAlign: 'center', color: '#6366f1', fontSize: '0.75rem', fontWeight: 800 }}>↓ Permanent & Fast-Access Split</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.76rem', textAlign: 'center' }}>
                  <strong>PostgreSQL</strong><br />Permanent Data
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', fontSize: '0.76rem', color: '#f87171', textAlign: 'center' }}>
                  <strong>Redis</strong><br />Fast Cache / Rate Limit
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Redis Multi-Tier Monitor */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#f87171" /> Step 5 — Redis Fast-Access In-Memory Backbone
          </h3>
          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
            Redis Status: {redisStats?.status || 'ONLINE'} ({redisStats?.version || 'v7.2'})
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* 1. API Rate Limiting */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              1. API Rate Limiting
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              120 req / min
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Token Bucket sliding-window active. Prevents gateway congestion.
            </div>
          </div>

          {/* 2. Fast Cache */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              2. Fast In-Memory Cache
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              {redisStats?.responsibilities?.cache?.cachedKeysCount || 8} Active Keys
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Volatile-LRU policy. Caching SUADR Soil, Weather & Market spot rates.
            </div>
          </div>

          {/* 3. Session-Related Data */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              3. Session-Related Data
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fcd34d', marginTop: '4px' }}>
              {redisStats?.responsibilities?.sessions?.activeSessionsCount || 4} Auth Sessions
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              TTL: 24h. Ephemeral JWT token & user principal state storage.
            </div>
          </div>

          {/* 4. Background Jobs / Queues */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              4. Background Jobs / Queues
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
              4 Active Queues
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              dbt-transfers • advisory-sms • satellite-ndvi • hpasn-audit
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Card: Execute Live Signed Exchange */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#10b981" /> Execute Live Inter-System Exchange via HP-ASN
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Test secure data flow from a Government or Partner system into Frappe Backend and PostgreSQL with Redis caching.
        </p>

        <form onSubmit={handleTriggerExchange} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Requester System Type</label>
            <select
              value={systemType}
              onChange={(e) => {
                setSystemType(e.target.value);
                if (e.target.value === 'PARTNER') {
                  setWhoRequested('HDFC Rural Lending Partner');
                  setWhatData('Standing Apple Crop Area & Soil Health Card');
                  setWhy('Kisan Credit Card (KCC) Limit Appraisal');
                } else {
                  setWhoRequested('Department of Revenue (HimBhoomi Land Records)');
                  setWhatData('Farmer Land Cadastral Registry & Khasra Survey #614/3');
                  setWhy('Subsidized Micro-Drip Irrigation Entitlement Check');
                }
              }}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
            >
              <option value="GOVERNMENT">🏛️ Government System</option>
              <option value="PARTNER">🤝 Partner System</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1. Who Requested?</label>
            <input
              type="text"
              value={whoRequested}
              onChange={(e) => setWhoRequested(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2. What Data?</label>
            <input
              type="text"
              value={whatData}
              onChange={(e) => setWhatData(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>4. Why? (Purpose)</label>
            <input
              type="text"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Farmer</label>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.id || f.farmer_id})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={wasConsentRequired}
                onChange={(e) => setWasConsentRequired(e.target.checked)}
              />
              <strong>5. Was Consent Required?</strong>
            </label>
            <span style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '2px' }}>Aadhaar e-Sign Token Checked</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={submitting}>
              {submitting ? 'Authenticating & Verifying...' : '⚡ Execute HP-ASN Signed Exchange'}
            </button>
          </div>
        </form>

        {recentExchange && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.86rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontWeight: 800, flexWrap: 'wrap' }}>
              <span>✔ Transaction Verified & Signed on HP-ASN</span>
              <span>Latency: {recentExchange.response_latency_ms || 110}ms</span>
            </div>
            <div><strong>Transaction ID:</strong> <span className="mono-chip">{recentExchange.transaction_id}</span></div>
            <div><strong>HMAC-SHA256 Signature:</strong> <span className="mono-chip" style={{ color: '#fcd34d' }}>{recentExchange.hash_signature}</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '4px', fontSize: '0.8rem' }}>
              <div><strong>Who:</strong> {recentExchange.who_requested}</div>
              <div><strong>What:</strong> {recentExchange.what_data}</div>
              <div><strong>Why:</strong> {recentExchange.why}</div>
              <div><strong>Consent Required?</strong> {recentExchange.was_consent_required ? 'YES (Verified)' : 'NO'}</div>
              <div><strong>Access Allowed?</strong> <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>YES</span></div>
            </div>
          </div>
        )}
      </div>

      {/* The 6 Mandatory HP-ASN Questions Audit Log Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              HP-ASN Immutable Audit Trail (6 Mandatory Questions)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Maintains non-repudiation audit records answering: Who, What, When, Why, Consent Required, and Access Allowed.
            </p>
          </div>
          <span className="badge badge-info">{logs.length} Immutable Transactions</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Txn ID</th>
                <th style={{ padding: '10px' }}>1. Who Requested?</th>
                <th style={{ padding: '10px' }}>2. What Data?</th>
                <th style={{ padding: '10px' }}>3. When?</th>
                <th style={{ padding: '10px' }}>4. Why?</th>
                <th style={{ padding: '10px' }}>5. Consent Required?</th>
                <th style={{ padding: '10px' }}>6. Access Allowed?</th>
                <th style={{ padding: '10px' }}>HMAC Signature</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.transaction_id || log.transactionId || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="mono-chip">{log.transaction_id || log.transactionId}</span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{log.who_requested || log.sourceDept}</div>
                    <span className="badge" style={{ fontSize: '0.65rem', marginTop: '2px', background: (log.system_type || '').includes('PARTNER') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: (log.system_type || '').includes('PARTNER') ? '#f59e0b' : '#38bdf8' }}>
                      {log.system_type || 'GOVERNMENT'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#e2e8f0', maxWidth: '200px' }}>
                    {log.what_data || log.dataScope || log.purpose}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(log.when || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8', maxWidth: '180px' }}>
                    {log.why || log.purpose}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    {log.was_consent_required !== false ? (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>YES</span>
                    ) : (
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>NO (Public)</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    {log.was_access_allowed !== false ? (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>ALLOWED</span>
                    ) : (
                      <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>DENIED</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="mono-chip" style={{ fontSize: '0.7rem', color: '#fcd34d' }}>
                      {(log.hash_signature || log.hashSignature || '').substring(0, 14)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
