import React, { useState, useEffect } from 'react';
import { Network, ShieldCheck, Lock, Activity, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function HpasnExchange({ farmers, lang = 'en' }) {
  const [departments, setDepartments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isKn = lang === 'kn';

  // New exchange form
  const [targetDept, setTargetDept] = useState('Revenue Dept (HimBhoomi / Jamabandi Land Records)');
  const [purpose, setPurpose] = useState('Cadastral Khasra Boundary & Title Verification');
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || 'FARMER-HP-1001');
  const [submitting, setSubmitting] = useState(false);
  const [recentTxn, setRecentTxn] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [dRes, lRes] = await Promise.all([
      api.getAsnDepartments(),
      api.getAsnLogs()
    ]);
    if (dRes.success) setDepartments(dRes.data);
    if (lRes.success) setLogs(lRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerExchange = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await api.requestAsnConsent({
      sourceDept: "Agriculture Dept (HP-ASN Gateway)",
      targetDept,
      purpose,
      farmerId
    });
    setSubmitting(false);
    if (res.success) {
      setRecentTxn(res.transaction);
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-success">{isKn ? 'HP-ASN ಪ್ರೋಟೋಕಾಲ್' : 'HP-ASN Protocol'}</span>
              <span className="badge badge-info">{isKn ? 'ಇಲಾಖಾ ನಡುವಿನ ಡೇಟಾ ವಿನಿಮಯ' : 'Inter-Department Data Exchange'}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {isKn ? 'ಹಿಮಾಚಲ ಪ್ರದೇಶ ಕೃಷಿ ಸೇವಾ ನೆಟ್‌ವರ್ಕ್ (HP-ASN)' : 'HP Agriculture Service Network (HP-ASN)'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              {isKn 
                ? 'ಕಂದಾಯ, ತೋಟಗಾರಿಕೆ, ಬ್ಯಾಂಕಿಂಗ್ ಮತ್ತು ಹವಾಮಾನ ಇಲಾಖೆಗಳನ್ನು ರೈತರ ಸಮ್ಮತಿ ಮತ್ತು ಅಸ್ಥಿರ ಆಡಿಟ್ ಲಾಗಿಂಗ್‌ನೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಸುರಕ್ಷಿತ ಡೇಟಾ ಬೆನ್ನೆಲುಬು.'
                : 'Secure data backbone connecting Revenue, Horticulture, Banking, and Met departments with farmer consent and immutable audit logging.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#34d399" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isKn ? 'ಭದ್ರತೆ: ' : 'Security: '}</span>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>HMAC-SHA256 Signed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Departments Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {departments.map((dept) => (
          <div key={dept.deptCode} className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="mono-chip" style={{ color: '#38bdf8' }}>{dept.deptCode}</span>
              <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>{dept.status}</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              {dept.name}
            </h4>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Protocol: <span className="mono-chip">{dept.apiProtocol}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <strong>Payload Scope:</strong> {dept.dataShared.join(' • ')}
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Card: Trigger Consent & Data Exchange */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#10b981" /> Execute Consent-Based Exchange via HP-ASN
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Simulates an inter-departmental request (e.g. pulling land verification from HimBhoomi or bank validation from HPSC).
        </p>

        <form onSubmit={handleTriggerExchange} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Department</label>
            <select
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
            >
              <option value="Revenue Dept (HimBhoomi Land Records)">Revenue Dept (HimBhoomi Land Records)</option>
              <option value="Horticulture Dept (HPMC & Nursery Registry)">Horticulture Dept (HPMC & Nursery)</option>
              <option value="HP State Cooperative Bank (DBT Switch)">HP State Cooperative Bank (DBT Switch)</option>
              <option value="IMD (HP Agro-Met Telemetry)">IMD (HP Agro-Met Telemetry)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exchange Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farmer Identifier</label>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
            >
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.id} - {f.district})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Signing Consent...' : '⚡ Initiate Signed Exchange'}
            </button>
          </div>
        </form>

        {recentTxn && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontWeight: 700 }}>
              <span>✔ Transaction Verified & Settled on HP-ASN</span>
              <span>Latency: {recentTxn.responseLatencyMs}ms</span>
            </div>
            <div><strong>Txn ID:</strong> <span className="mono-chip">{recentTxn.transactionId}</span></div>
            <div><strong>Cryptographic Signature:</strong> <span className="mono-chip" style={{ color: '#fcd34d' }}>{recentTxn.hashSignature}</span></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Consent Method: {recentTxn.consentMethod} • Timestamp: {recentTxn.timestamp}
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
          HP-ASN Immutable Audit Trail
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Transaction ID</th>
                <th style={{ padding: '10px' }}>Departments</th>
                <th style={{ padding: '10px' }}>Purpose / Scope</th>
                <th style={{ padding: '10px' }}>Farmer ID</th>
                <th style={{ padding: '10px' }}>Latency</th>
                <th style={{ padding: '10px' }}>Consent Hash</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.transactionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="mono-chip">{log.transactionId}</span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{log.sourceDept}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>➔ {log.targetDept}</div>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#e5e7eb' }}>
                    {log.purpose}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="mono-chip">{log.farmerId}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#38bdf8' }}>
                    {log.responseLatencyMs}ms
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="mono-chip" style={{ fontSize: '0.72rem', color: '#fcd34d' }}>
                      {log.hashSignature?.substring(0, 16)}...
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      {log.status}
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
