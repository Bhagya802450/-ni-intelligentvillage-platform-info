import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  Filter, 
  Check, 
  X, 
  FileText, 
  ArrowRight,
  ClipboardCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function OfficerPortal({ 
  officer, 
  applications, 
  farmers, 
  analytics, 
  onRefreshData 
}) {
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const filteredApps = applications.filter(app => {
    const matchDist = filterDistrict === 'All' || app.district.toLowerCase() === filterDistrict.toLowerCase();
    const matchStat = filterStatus === 'All' || app.status === filterStatus;
    return matchDist && matchStat;
  });

  const handleUpdateStatus = async (appId, newStatus) => {
    setProcessingId(appId);
    setActionMessage('');
    const res = await api.updateApplicationStatus(
      appId, 
      newStatus, 
      officerNotes || `Actioned by ${officer.name} (${officer.designation})`, 
      officer.name
    );
    setProcessingId(null);
    if (res.success) {
      setActionMessage(`Application ${appId} successfully transitioned to ${newStatus}`);
      setSelectedApp(null);
      setOfficerNotes('');
      if (onRefreshData) onRefreshData();
    } else {
      setActionMessage(`Error: ${res.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Officer ERP Header */}
      <div className="glass-card" style={{
        padding: '24px 32px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 25, 34, 0.9) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info">
                Official Government ERP Access
              </span>
              <span className="badge badge-success">
                Bhoomi RTC / HP-ASN Connected
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {officer.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {officer.designation} • District {officer.district} • Jurisdiction: {officer.jurisdiction.join(', ')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="mono-chip" style={{ color: '#93c5fd' }}>Officer ID: {officer.id}</div>
            <div className="mono-chip">{officer.email}</div>
          </div>
        </div>

        {actionMessage && (
          <div style={{
            marginTop: '16px',
            padding: '10px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#93c5fd'
          }}>
            {actionMessage}
          </div>
        )}
      </div>

      {/* KPI Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '6px' }}>
            <span>REGISTERED FARMERS</span>
            <Users size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {analytics?.metrics?.totalRegisteredFarmers || farmers?.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
            100% AgriStack Seeded
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '6px' }}>
            <span>PENDING FIELD CHECKS</span>
            <AlertTriangle size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
            {applications.filter(a => a.status === 'FIELD_VERIFICATION_PENDING').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting On-Site Verification
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '6px' }}>
            <span>SANCTIONED FOR PAYOUT</span>
            <ClipboardCheck size={16} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>
            {applications.filter(a => a.status === 'APPROVED_BY_OFFICER').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ready for Banking Switch
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '6px' }}>
            <span>TOTAL DBT DISBURSED</span>
            <DollarSign size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
            ₹{(analytics?.metrics?.disbursedAmountINR || 6000).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
            Direct to Aadhaar Bank Acct
          </div>
        </div>
      </div>

      {/* Field Verification & Scheme Sanctioning Queue */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              📋 Field Verification & DBT Sanction Queue
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Inspect farmer land titles, attach officer verification remarks, and approve DBT disbursements.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All Districts (ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು)</option>
              <option value="Mandya">Mandya (ಮಂಡ್ಯ)</option>
              <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
              <option value="Kalaburagi">Kalaburagi (ಕಲಬುರಗಿ)</option>
              <option value="Shivamogga">Shivamogga (ಶಿವಮೊಗ್ಗ)</option>
              <option value="Mysuru">Mysuru (ಮೈಸೂರು)</option>
              <option value="Vijayapura">Vijayapura (ವಿಜಯಪುರ)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="FIELD_VERIFICATION_PENDING">Pending Verification</option>
              <option value="APPROVED_BY_OFFICER">Officer Approved</option>
              <option value="DBT_DISBURSED">DBT Disbursed</option>
            </select>
          </div>
        </div>

        {/* Table of Applications */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>App ID</th>
                <th style={{ padding: '10px' }}>Farmer / District</th>
                <th style={{ padding: '10px' }}>Scheme</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Current Status</th>
                <th style={{ padding: '10px' }}>Officer Remarks</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.applicationId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="mono-chip">{app.applicationId}</span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 600 }}>{app.farmerName}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      District {app.district} • {app.farmerId}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 500, color: '#e5e7eb' }}>{app.schemeName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{app.department}</div>
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#34d399' }}>
                    ₹{app.appliedAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {app.status === 'FIELD_VERIFICATION_PENDING' && (
                      <span className="badge badge-warning">PENDING CHECK</span>
                    )}
                    {app.status === 'APPROVED_BY_OFFICER' && (
                      <span className="badge badge-info">SANCTIONED</span>
                    )}
                    {app.status === 'DBT_DISBURSED' && (
                      <span className="badge badge-success">DISBURSED</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '240px' }}>
                    {app.officerRemarks || "No remarks entered."}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {app.status === 'FIELD_VERIFICATION_PENDING' && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          onClick={() => setSelectedApp(app)}
                        >
                          Verify & Approve
                        </button>
                      )}

                      {app.status === 'APPROVED_BY_OFFICER' && (
                        <button
                          className="btn btn-accent"
                          style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          onClick={() => handleUpdateStatus(app.applicationId, 'DBT_DISBURSED')}
                          disabled={processingId === app.applicationId}
                        >
                          Disburse DBT
                        </button>
                      )}

                      {app.status === 'DBT_DISBURSED' && (
                        <span className="mono-chip" style={{ fontSize: '0.72rem', color: '#34d399' }}>
                          UTR: {app.utrReference?.substring(0, 10)}...
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Officer Field Verification: {selectedApp.applicationId}
              </h3>
              <button 
                onClick={() => setSelectedApp(null)} 
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', marginBottom: '16px' }}>
              <div><strong>Farmer:</strong> {selectedApp.farmerName} ({selectedApp.farmerId})</div>
              <div><strong>District:</strong> {selectedApp.district}</div>
              <div><strong>Scheme:</strong> {selectedApp.schemeName}</div>
              <div><strong>Grant Amount:</strong> ₹{selectedApp.appliedAmount?.toLocaleString('en-IN')}</div>
              
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Field Verification & Site Inspection Notes:
                </label>
                <textarea
                  rows="3"
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="e.g. Cadastral parcel verified on Bhoomi RTC. Geo-tagged borewell and crop status confirmed in field."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleUpdateStatus(selectedApp.applicationId, 'APPROVED_BY_OFFICER')}
                disabled={processingId === selectedApp.applicationId}
              >
                Sign & Sanction Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
