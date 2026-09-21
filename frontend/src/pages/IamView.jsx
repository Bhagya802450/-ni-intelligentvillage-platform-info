import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, CheckCircle2, XCircle, UserCheck, ShieldAlert, Cpu, Award } from 'lucide-react';
import { api } from '../services/api';

export default function IamView({ lang = 'en', onSwitchUser }) {
  const [roles, setRoles] = useState([]);
  const [principals, setPrincipals] = useState([]);
  const [selectedRole, setSelectedRole] = useState('VILLAGE_REVENUE_OFFICER');
  const [selectedAction, setSelectedAction] = useState('cadastral:verify_khasra');
  const [evalResult, setEvalResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // e-KYC simulator state
  const [aadhaarInput, setAadhaarInput] = useState('5412-8910-3421');
  const [otpInput, setOtpInput] = useState('123456');
  const [kycResult, setKycResult] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    async function loadIamData() {
      const [rRes, pRes] = await Promise.all([
        api.getRoles(),
        api.getPrincipals()
      ]);
      if (rRes.success) setRoles(rRes.data);
      if (pRes.success) setPrincipals(pRes.data);
    }
    loadIamData();
  }, []);

  const handleEvaluatePolicy = async () => {
    setEvaluating(true);
    try {
      const res = await api.checkPermission(selectedRole, selectedAction);
      setEvalResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleVerifyKyc = async (e) => {
    e.preventDefault();
    setKycLoading(true);
    try {
      const res = await api.verifyAadhaar(aadhaarInput.replace(/-/g, ''), otpInput);
      setKycResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setKycLoading(false);
    }
  };

  const isKn = lang === 'kn';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={28} color="#10b981" />
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                {isKn ? 'ಗುರುತು ಮತ್ತು ಪ್ರವೇಶ ನಿರ್ವಹಣೆ (IAM) ಘಟಕ' : 'Identity & Access Management (IAM) Module'}
              </h1>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                RBAC & AgriStack e-KYC
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9rem', maxWidth: '850px' }}>
              {isKn
                ? 'ರೈತರು, ಕಂದಾಯ ಅಧಿಕಾರಿಗಳು (ಪಟ್ವಾರಿ), ಕೃಷಿ ಅಧಿಕಾರಿಗಳು, ಬ್ಯಾಂಕ್ ನೋಡಲ್ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ರಾಜ್ಯ ನಿರ್ವಾಹಕರಿಗೆ ಸುರಕ್ಷಿತ ಪಾತ್ರ-ಆಧಾರಿತ ಪ್ರವೇಶ ನಿಯಂತ್ರಣ (RBAC) ಮತ್ತು ಆಧಾರ್ ಇ-ಕೆವೈಸಿ ಪರಿಶೀಲನೆ.'
                : 'Enterprise Role-Based Access Control (RBAC) enforcing zero-trust authorization across Farmers, Revenue Officers (Patwaris), Agriculture Officers, Bank Nodal Officers, and State Admins.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>5 Active Roles</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Zero-Trust Authorization</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: RBAC Evaluation Sandbox & Aadhaar e-KYC Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Policy Check Sandbox */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Key size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {isKn ? 'ನೈಜ-ಸಮಯದ ನೀತಿ ಮೌಲ್ಯಮಾಪನ ಎಂಜಿನ್' : 'Real-time Policy Evaluation Engine'}
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {isKn
              ? 'ನಿರ್ದಿಷ್ಟ ಪಾತ್ರ ಮತ್ತು ಕ್ರಿಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಪ್ರವೇಶ ಮೌಲ್ಯಮಾಪನ ನಿಯಮವನ್ನು ಪರೀಕ್ಷಿಸಿ.'
              : 'Test how the backend IAM policy engine grants or denies granular permissions dynamically.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isKn ? 'ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Role):' : 'Select Principal Role:'}
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="FARMER">FARMER (Registered HimBhoomi Farmer)</option>
                <option value="VILLAGE_REVENUE_OFFICER">VILLAGE_REVENUE_OFFICER (Halqua Patwari)</option>
                <option value="AGRICULTURE_OFFICER">AGRICULTURE_OFFICER (ADO / DAO)</option>
                <option value="BANK_NODAL_OFFICER">BANK_NODAL_OFFICER (DBT & NPCI Switch)</option>
                <option value="STATE_ADMIN">STATE_ADMIN (HP-ASN Super Administrator)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isKn ? 'ಕ್ರಿಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (Action):' : 'Requested Action / Resource:'}
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="cadastral:verify_khasra">cadastral:verify_khasra (Patwari Cadastral Sign-off)</option>
                <option value="schemes:approve">schemes:approve (Approve DBT Subsidy Application)</option>
                <option value="schemes:disburse_dbt">schemes:disburse_dbt (Initiate Bank APBS Transfer)</option>
                <option value="banking:verify_npci">banking:verify_npci (Verify Bank Mandate with NPCI)</option>
                <option value="suadr:create_shc">suadr:create_shc (Register Soil Health Lab Card)</option>
                <option value="farmer:read_own">farmer:read_own (View Personal Land & SHC)</option>
                <option value="hpasn:manage_policies">hpasn:manage_policies (Configure Data Exchange SLA)</option>
                <option value="farmer:mandi_trade">farmer:mandi_trade (Place Mandi Sell Offer)</option>
              </select>
            </div>

            <button
              onClick={handleEvaluatePolicy}
              disabled={evaluating}
              className="btn btn-primary"
              style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Cpu size={16} />
              {evaluating ? (isKn ? 'ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Evaluating...') : (isKn ? 'ನೀತಿ ನಿಯಮ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ' : 'Evaluate Access Decision')}
            </button>

            {evalResult && (
              <div style={{
                marginTop: '12px',
                padding: '14px',
                borderRadius: '8px',
                background: evalResult.decision === 'PERMIT' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${evalResult.decision === 'PERMIT' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {evalResult.decision === 'PERMIT' ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <XCircle size={20} color="#ef4444" />
                  )}
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: evalResult.decision === 'PERMIT' ? '#10b981' : '#ef4444' }}>
                    DECISION: {evalResult.decision}
                  </span>
                  <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)' }}>
                    Scope: {evalResult.scope}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0 }}>
                  {evalResult.policyRule}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Aadhaar e-KYC Bridge Simulator */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {isKn ? 'ಆಧಾರ್ ಇ-ಕೆವೈಸಿ ಮತ್ತು ಅಗ್ರಿಸ್ಟಾಕ್ ಐಡಿ ಮಿಂಟರ್' : 'Aadhaar e-KYC & AgriStack ID Bridge'}
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {isKn
              ? 'ಯುಐಡಿಎಐ ಮತ್ತು ಅಗ್ರಿಸ್ಟಾಕ್ ಪ್ರೋಟೋಕಾಲ್ ಮೂಲಕ ರೈತರ ಡಿಜಿಟಲ್ ಗುರುತಿನ ಪರಿಶೀಲನೆ.'
              : 'Federated identity minting linking 12-digit Aadhaar e-KYC to unique Himachal AgriStack ID.'}
          </p>

          <form onSubmit={handleVerifyKyc} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isKn ? 'ಆಧಾರ್ ಸಂಖ್ಯೆ (12 ಅಂಕೆಗಳು):' : 'Aadhaar Number (12 Digits):'}
              </label>
              <input
                type="text"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isKn ? 'ಡೆಮೊ ಒಟಿಪಿ (123456 ನಮೂದಿಸಿ):' : 'Demo UIDAI OTP (Enter 123456):'}
              </label>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={kycLoading}
              className="btn btn-secondary"
              style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <UserCheck size={16} />
              {kycLoading ? (isKn ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying...') : (isKn ? 'ಇ-ಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅಗ್ರಿಸ್ಟಾಕ್ ಐಡಿ ರಚಿಸಿ' : 'Verify e-KYC & Mint AgriStack ID')}
            </button>

            {kycResult && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> {kycResult.message}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>AgriStack ID:</span>
                  <span style={{ fontWeight: 800, color: '#fcd34d', fontFamily: 'monospace' }}>{kycResult.agriStackId}</span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{kycResult.verifiedStatus} (Himachal Pradesh)</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* RBAC Roles Matrix Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Lock size={22} color="#10b981" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {isKn ? 'ಪಾತ್ರಗಳು ಮತ್ತು ಅನುಮತಿಗಳ ಮ್ಯಾಟ್ರಿಕ್ಸ್ (RBAC Matrix)' : 'Roles & Permissions Specification Matrix'}
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Role Code</th>
                <th style={{ padding: '12px 14px' }}>Role Designation</th>
                <th style={{ padding: '12px 14px' }}>Scope</th>
                <th style={{ padding: '12px 14px' }}>Description</th>
                <th style={{ padding: '12px 14px' }}>Authorized Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {r.roleCode}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 600 }}>
                    {r.name}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>{r.scope}</span>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '300px' }}>
                    {r.description}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {r.allowedActions.map((act, aIdx) => (
                        <span key={aIdx} style={{
                          fontSize: '0.72rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#34d399',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          fontFamily: 'monospace'
                        }}>
                          {act}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorized Departmental Principals Directory */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={22} color="#3b82f6" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isKn ? 'ಅಧಿಕೃತ ಇಲಾಖಾ ಅಧಿಕಾರಿಗಳ ಪಟ್ಟಿ' : 'Authorized Departmental Principals & Officials'}
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {principals.length} Verified Identities
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {principals.map((p, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>{p.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: '#38bdf8', margin: '2px 0 0 0' }}>{p.designation}</p>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  {p.role}
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <div><strong>ID:</strong> <span style={{ fontFamily: 'monospace', color: '#fcd34d' }}>{p.id}</span></div>
                <div><strong>Email:</strong> {p.email}</div>
                <div><strong>Jurisdiction:</strong> {Array.isArray(p.jurisdiction) ? p.jurisdiction.join(', ') : p.jurisdiction}</div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(p.permissions || []).slice(0, 3).map((perm, pIdx) => (
                  <span key={pIdx} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-dim)' }}>
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
