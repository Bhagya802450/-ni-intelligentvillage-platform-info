import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Clock, Send, DollarSign, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function SchemesView({ farmer, onRefreshData }) {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    const [sRes, aRes, anRes] = await Promise.all([
      api.getSchemes(),
      api.getApplications(),
      api.getSchemeAnalytics()
    ]);
    if (sRes.success) setSchemes(sRes.data);
    if (aRes.success) setApplications(aRes.data);
    if (anRes.success) setAnalytics(anRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedScheme || !farmer) return;
    setSubmitting(true);
    setMsg('');

    const res = await api.submitApplication(selectedScheme.schemeId, farmer.id, remarks);
    setSubmitting(false);
    if (res.success) {
      setMsg(`Application successfully filed! ID: ${res.data.applicationId}`);
      setSelectedScheme(null);
      setRemarks('');
      loadData();
      if (onRefreshData) onRefreshData();
    } else {
      setMsg(`Error: ${res.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-success">HP Direct Benefit Transfer (DBT)</span>
              <span className="badge badge-info">PFMS & APBS Gateway</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Government Schemes & DBT Sanctions
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Transparent subsidy disbursement for solar pumps, natural farming inputs, and seasonal farmer support.
            </p>
          </div>

          {analytics && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="glass-card" style={{ padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL DISBURSED</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                  ₹{(analytics.metrics.disbursedAmountINR).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </div>

        {msg && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#34d399'
          }}>
            {msg}
          </div>
        )}
      </div>

      {/* Schemes Catalog Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {schemes.map((s) => (
          <div key={s.schemeId} className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="mono-chip">{s.schemeId}</span>
              <span className="badge badge-success">₹{s.annualBenefitAmount?.toLocaleString('en-IN')} Grant</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              {s.name}
            </h3>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {s.description}
            </p>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '4px' }}>
              <strong>Eligibility:</strong> {s.eligibility}
            </div>

            <div style={{ fontSize: '0.76rem', color: '#93c5fd' }}>
              {s.disbursementType}
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: 'auto', fontSize: '0.85rem' }}
              onClick={() => setSelectedScheme(s)}
            >
              Apply as {farmer?.name} ➔
            </button>
          </div>
        ))}
      </div>

      {/* Application Form Modal */}
      {selectedScheme && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              Apply for {selectedScheme.name}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Applying as: <strong>{farmer.name}</strong> (AgriStack ID: {farmer.agriStackId})
            </p>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Required Documents (Pre-verified via HP-ASN):</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {selectedScheme.requiredDocs?.map((doc, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✔ {doc} (Verified via HimBhoomi)
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Applicant Farmer Remarks / Purpose:</label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Installing drip irrigation and SPNF drum setup on Khasra 412/12."
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedScheme(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting to DAO...' : 'Submit DBT Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
