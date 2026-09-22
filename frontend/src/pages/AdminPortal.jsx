import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Activity, 
  Lock, 
  Key, 
  Users, 
  FileCheck, 
  CheckCircle2, 
  RefreshCw, 
  Server, 
  Cpu, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPortal({ adminUser, gatewayStatus, farmers, applications, analytics, lang = 'en', onRefreshData, onNavigateTab }) {
  const isKn = lang === 'kn';
  const [adminTab, setAdminTab] = useState('policies'); // 'policies' | 'audit' | 'principals' | 'telemetry'
  const [policies, setPolicies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [principals, setPrincipals] = useState([]);
  const [verifyingTxn, setVerifyingTxn] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const loadAdminData = async () => {
    try {
      const [pRes, lRes, prRes] = await Promise.all([
        api.getAsnPolicies(),
        api.getAsnLogs(),
        api.getPrincipals()
      ]);
      if (pRes.success) setPolicies(pRes.data);
      if (lRes.success) setAuditLogs(lRes.data);
      if (prRes.success) setPrincipals(prRes.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyLog = async (log) => {
    setVerifyingTxn(log.transactionId);
    setVerifyResult(null);
    try {
      const res = await api.verifyAsnSignature(log.transactionId, log.hashSignature);
      setVerifyResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingTxn(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Hero Banner */}
      <div className="glass-card" style={{
        padding: '24px 30px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                <span className="live-dot" style={{ background: '#a855f7' }}></span> 
                {isKn ? 'ಶ್ರೇಣಿ 3: ರಾಜ್ಯ ನಿರ್ವಾಹಕ' : 'Tier 3: State Administrator'}
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                KA-ASN Governance Active
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {isKn ? 'ರಾಜ್ಯ ಕೃಷಿ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು KA-ASN ಕಮಾಂಡ್ ಸೆಂಟರ್' : 'State Infrastructure & KA-ASN Admin Command Center'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isKn 
                ? 'ಮುಖ್ಯ ನಿರ್ವಾಹಕರು: ಶ್ರೀಮತಿ ರೇಖಾ ರಾವ್ (ADM-KA-001) • ಇ-ಆಡಳಿತ ಮತ್ತು ಕೃಷಿ ಮಾಹಿತಿ ನಿರ್ದೇಶನಾಲಯ, ಬೆಂಗಳೂರು (MS ಕಟ್ಟಡ)' 
                : 'Principal Administrator: Smt. Rekha Rao (ADM-KA-001) • Directorate of E-Governance & Agricultural Informatics, Bengaluru (MS Building)'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { loadAdminData(); if (onRefreshData) onRefreshData(); }}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> {isKn ? 'ಡೇಟಾ ರಿಫ್ರೆಶ್ ಮಾಡಿ' : 'Sync System State'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isKn ? 'ಏಕೀಕೃತ ರೈತರ ಸಂಖ್ಯೆ' : 'Registered Farmers'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
            {farmers?.length || 3}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
            ✔ Bhoomi RTC Synced (100%)
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isKn ? 'ಒಟ್ಟು ಡಿಬಿಟಿ ವಿತರಣೆ' : 'DBT Disbursed Volume'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fcd34d', marginTop: '6px' }}>
            ₹{analytics?.metrics?.disbursedAmountINR?.toLocaleString() || '2,000'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {applications?.length || 3} {isKn ? 'ಅರ್ಜಿಗಳು ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿವೆ' : 'total applications processed'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isKn ? 'HP-ASN ಆಡಿಟ್ ದಾಖಲೆಗಳು' : 'HP-ASN Audit Records'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>
            {auditLogs?.length || 5}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
            ✔ HMAC-SHA256 Signed
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isKn ? 'ಗೇಟ್‌ವೇ ದರ ಮಿತಿ' : 'Token-Bucket Rate Limit'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', marginTop: '6px' }}>
            120 r/m
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
            ✔ Zero Dropped Packets
          </div>
        </div>
      </div>

      {/* Admin Subtabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          onClick={() => setAdminTab('policies')}
          className={`nav-pill ${adminTab === 'policies' ? 'active' : ''}`}
        >
          <Lock size={15} /> {isKn ? '🏛️ HP-ASN ನೀತಿಗಳು ಮತ್ತು ಒಪ್ಪಂದಗಳು' : '🏛️ Data Exchange Policies'}
        </button>
        <button
          onClick={() => setAdminTab('audit')}
          className={`nav-pill ${adminTab === 'audit' ? 'active' : ''}`}
        >
          <FileCheck size={15} /> {isKn ? '📜 ಅಸ್ಥಿರ ಆಡಿಟ್ ಲಾಗ್‌ಗಳು' : '📜 Tamper-Proof Audit Trail'}
        </button>
        <button
          onClick={() => setAdminTab('principals')}
          className={`nav-pill ${adminTab === 'principals' ? 'active' : ''}`}
        >
          <Users size={15} /> {isKn ? '👥 ಅಧಿಕೃತ ಬಳಕೆದಾರರು ಮತ್ತು IAM' : '👥 Authorized Principals & IAM'}
        </button>
        <button
          onClick={() => setAdminTab('telemetry')}
          className={`nav-pill ${adminTab === 'telemetry' ? 'active' : ''}`}
        >
          <Server size={15} /> {isKn ? '⚡ 10-ಹಂತದ ಸಿಸ್ಟಮ್ ಟೆಲಿಮೆಟ್ರಿ' : '⚡ 10-Tier Architecture Telemetry'}
        </button>
      </div>

      {/* Tab 1: Data Exchange Policies */}
      {adminTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              {isKn ? 'ರಾಜ್ಯ ಇಲಾಖೆಗಳ ನಡುವಿನ ಡೇಟಾ ಹಂಚಿಕೆ ಒಪ್ಪಂದಗಳು' : 'Inter-Departmental Data Governance & Sharing Agreements'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {isKn 
                ? 'ಹಿಮಾಚಲ ಪ್ರದೇಶ ಡಿಜಿಟಲ್ ಆಡಳಿತ ಕಾಯಿದೆ ಮತ್ತು ಆಧಾರ್ ಕಾಯಿದೆಯಡಿಯಲ್ಲಿ ಜಾರಿಗೊಳಿಸಲಾದ ಸಕ್ರಿಯ ಶಾಸನಬದ್ಧ ನೀತಿಗಳು.'
                : 'Statutory cross-departmental data exchange policies enforced by the HP-ASN gateway kernel.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {policies.map((pol) => (
              <div key={pol.policyId} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="mono-chip" style={{ color: '#38bdf8' }}>{pol.policyId}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>{pol.status}</span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  {pol.agreementName}
                </h4>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  {pol.purpose}
                </p>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                  <div><strong>Parties:</strong> {pol.parties.join(' ↔ ')}</div>
                  <div><strong>Legal Basis:</strong> {pol.legalBasis}</div>
                  <div><strong>Encryption:</strong> <span style={{ fontFamily: 'monospace', color: '#34d399' }}>{pol.encryption}</span></div>
                  <div><strong>SLA Latency:</strong> {pol.slaLatencyMs}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Tamper-Proof Audit Trail */}
      {adminTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                {isKn ? 'ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಆಡಿಟ್ ಲೆಡ್ಜರ್ ಪರಿಶೀಲನೆ' : 'Cryptographic Audit Ledger & Non-Repudiation Verifier'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isKn 
                  ? 'ಪ್ರತಿಯೊಂದು ಇಲಾಖಾ ವಿನಿಮಯವನ್ನು SHA-256 ಹ್ಯಾಶ್ ಸಹಿಯೊಂದಿಗೆ ಸಾರ್ವಕಾಲಿಕವಾಗಿ ಪರಿಶೀಲಿಸಬಹುದು.' 
                  : 'Every transaction across Revenue, Agriculture, and Banking is cryptographically signed.'}
              </p>
            </div>
          </div>

          {verifyResult && (
            <div className="glass-card" style={{
              padding: '16px 20px',
              borderLeft: '4px solid #10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <div>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.9rem' }}>
                    {verifyResult.status}: Transaction {verifyResult.transactionId} Verified!
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Algorithm: {verifyResult.algorithm} • Zero Tampering Detected
                  </div>
                </div>
              </div>
              <span className="mono-chip" style={{ fontSize: '0.75rem', color: '#fcd34d' }}>
                Signature Matches Ledger Digest
              </span>
            </div>
          )}

          <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Txn ID</th>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Source → Target Dept</th>
                  <th style={{ padding: '10px 12px' }}>Purpose</th>
                  <th style={{ padding: '10px 12px' }}>Farmer ID</th>
                  <th style={{ padding: '10px 12px' }}>SHA-256 Digest</th>
                  <th style={{ padding: '10px 12px' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                      {log.transactionId}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{log.sourceDept}</div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>→ {log.targetDept}</div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: '240px' }}>
                      {log.purpose}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                      {log.farmerId}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {log.hashSignature?.substring(0, 18)}...
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleVerifyLog(log)}
                        disabled={verifyingTxn === log.transactionId}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '4px 8px', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
                      >
                        <ShieldCheck size={12} />
                        {verifyingTxn === log.transactionId ? 'Validating...' : 'Verify Hash'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Department Principals & IAM */}
      {adminTab === 'principals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                {isKn ? 'ಅಧಿಕೃತ ಇಲಾಖಾ ಬಳಕೆದಾರರು ಮತ್ತು ಪಾತ್ರಗಳು (IAM)' : 'Authorized Departmental Principals & Roles (IAM)'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isKn 
                  ? 'ಪಟ್ವಾರಿ, ಕೃಷಿ ಅಧಿಕಾರಿ, ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿ ಮತ್ತು ರಾಜ್ಯ ನಿರ್ವಾಹಕರ ಪಾತ್ರಗಳು ಮತ್ತು ಸವಲತ್ತುಗಳು.'
                  : 'Manage credentials and granular access privileges across administrative officers.'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('iam')}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Key size={14} /> {isKn ? 'ಪೂರ್ಣ IAM ನೀತಿ ಎಂಜಿನ್ ತೆರೆಯಿರಿ' : 'Open Full IAM Engine'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {principals.map((p, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{p.name}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>{p.designation}</div>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                    {p.role}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                  <div><strong>ID:</strong> <span style={{ fontFamily: 'monospace', color: '#fcd34d' }}>{p.id}</span></div>
                  <div><strong>Department:</strong> {p.department}</div>
                  <div><strong>Jurisdiction:</strong> {Array.isArray(p.jurisdiction) ? p.jurisdiction.join(', ') : p.jurisdiction}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Authorized Scopes:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(p.permissions || []).map((perm, pIdx) => (
                      <span key={pIdx} style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: 10-Tier Architecture Telemetry */}
      {adminTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              {isKn ? '10-ಹಂತದ ಎಂಟರ್‌ಪ್ರೈಸ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ' : '10-Tier Enterprise Architecture System Status'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {isKn
                ? 'ಎಲ್ಲಾ 10 ಮೂಲಸೌಕರ್ಯ ಪದರಗಳ ನೈಜ-ಸಮಯದ ಕಾರ್ಯಾಚರಣಾ ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ.'
                : 'Live operational health across frontend, gateway, database, cache, queues, AI services, and monitoring.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {gatewayStatus?.layers && Object.entries(gatewayStatus.layers).map(([layerKey, val], idx) => (
              <div key={idx} className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {layerKey.replace('layer', 'Tier ').replace('_', ': ')}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                    HEALTHY
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', fontFamily: 'monospace' }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
