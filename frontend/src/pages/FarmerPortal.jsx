import React, { useState } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  Leaf, 
  Building2, 
  TrendingUp, 
  Send
} from 'lucide-react';
import { api } from '../services/api';

export default function FarmerPortal({ farmer, onApplySchemeSuccess, onNavigateTab }) {
  const [activeTabSub, setActiveTabSub] = useState('overview');
  const [advisoryInput, setAdvisoryInput] = useState('');
  const [advisoryResult, setAdvisoryResult] = useState(null);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [applyingSchemeId, setApplyingSchemeId] = useState(null);
  const [schemeRemarks, setSchemeRemarks] = useState('');
  const [msg, setMsg] = useState('');

  if (!farmer) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
        <p>Loading farmer credentials...</p>
      </div>
    );
  }

  const handleQuickAdvisory = async () => {
    setLoadingAdvisory(true);
    setMsg('');
    const res = await api.queryAdvisory({
      district: farmer.district,
      crop: farmer.landParcels[0]?.primaryCrop || 'Apple',
      soilPh: 6.2,
      nitrogenLevel: 'Medium'
    });
    setLoadingAdvisory(false);
    if (res.success) {
      setAdvisoryResult(res);
    }
  };

  const handleApplyScheme = async (schemeId) => {
    setMsg('');
    const res = await api.submitApplication(schemeId, farmer.id, schemeRemarks || "Applied via Farmer Self-Service Portal.");
    if (res.success) {
      setMsg(`Application successfully submitted! Ref: ${res.data.applicationId}`);
      setApplyingSchemeId(null);
      setSchemeRemarks('');
      if (onApplySchemeSuccess) onApplySchemeSuccess();
    } else {
      setMsg(`Error: ${res.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Farmer Identity & AgriStack Hero Card */}
      <div className="glass-card" style={{
        padding: '24px 32px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 25, 34, 0.9) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Aadhaar Verified
              </span>
              <span className="badge badge-info">
                AgriStack Linked
              </span>
              {farmer.naturalFarmingPractitioner && (
                <span className="badge badge-purple">
                  <Leaf size={12} /> Natural Farming (SPNF)
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
              {farmer.name}
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} color="#10b981" /> 
              Village {farmer.village}, Tehsil {farmer.tehsil}, District {farmer.district}, HP ({farmer.pincode})
            </p>
          </div>

          {/* Identification Chips: 14 Core Model Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              National Farmer ID: <span className="mono-chip" style={{ color: '#38bdf8' }}>{farmer.national_farmer_id || farmer.agriStackId}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Farmer ID: <span className="mono-chip">{farmer.farmer_id || farmer.id}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mobile: <span className="mono-chip">{farmer.mobile || farmer.phone}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Block / Tehsil: <span className="mono-chip">{farmer.block || farmer.tehsil}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`badge ${farmer.status === 'ACTIVE' || !farmer.status ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                STATUS: {farmer.status || 'ACTIVE'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                State: {farmer.state || 'Himachal Pradesh'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Notification Message if any */}
        {msg && (
          <div style={{
            marginTop: '16px',
            padding: '10px 16px',
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

      {/* Grid: 3 Key Action Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Column 1: Cadastral Land & Soil Card (HimBhoomi / SUADR) */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📍 Cadastral Land Parcels
            </h3>
            <span className="mono-chip">{farmer.landParcels?.length || 0} Registered</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {farmer.landParcels?.map((parcel, idx) => (
              <div key={idx} style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.92rem' }}>
                    Khasra No: {parcel.khasraNo}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    Khatauni #{parcel.khatauniNo}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Total Area: <strong style={{ color: '#fff' }}>{parcel.areaBigha} Bighas</strong> ({parcel.areaHectares} Ha)
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Primary Crop: <strong style={{ color: '#fcd34d' }}>{parcel.primaryCrop}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Irrigation: {parcel.irrigationType}</span>
                  <span className="mono-chip">{parcel.soilHealthId}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 'auto',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px dashed rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}>
            <span>HimBhoomi Land Title Verified</span>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => onNavigateTab && onNavigateTab('registry')}
            >
              View CAD Map
            </button>
          </div>
        </div>

        {/* Column 2: SUADR AI Crop & Pest Advisory */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#f59e0b" /> SUADR Smart Advisory
            </h3>
            <span className="badge badge-warning">Real-Time Soil & Climate</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Dynamic agronomy inferences tailored to {farmer.district} weather, soil pH (6.2) & apple blossom stage.
          </p>

          <button 
            className="btn btn-primary"
            onClick={handleQuickAdvisory}
            disabled={loadingAdvisory}
            style={{ width: '100%' }}
          >
            {loadingAdvisory ? 'Analyzing Micro-Climate Telemetry...' : '⚡ Generate Real-Time SUADR Advisory'}
          </button>

          {advisoryResult && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
                Agronomic Recommendations:
              </div>
              {advisoryResult.agroAdvisories.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.82rem', color: '#e5e7eb', paddingLeft: '8px', borderLeft: '2px solid #10b981' }}>
                  {item}
                </div>
              ))}

              <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600, marginTop: '4px' }}>
                Pest & Disease Warnings:
              </div>
              {advisoryResult.pestAlerts.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.82rem', color: '#fca5a5', paddingLeft: '8px', borderLeft: '2px solid #f43f5e' }}>
                  {item}
                </div>
              ))}
            </div>
          )}

          <div style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-dim)'
          }}>
            <span>Soil Health: NPK Medium-High</span>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => onNavigateTab && onNavigateTab('suadr')}
            >
              Soil Health Card ➔
            </button>
          </div>
        </div>

        {/* Column 3: DBT Scheme Tracker & Benefits */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 DBT Scheme Tracker
            </h3>
            <span className="badge badge-success">Direct Bank Credit</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Track application review stages, field inspection status, and bank settlement reference.
          </p>

          {/* Active Application Card */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                HP-MKSY Income Support
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                DISBURSED
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Benefit: <strong style={{ color: '#34d399' }}>₹6,000 / Year</strong> (Tranche 1 Credited)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Bank Ref (UTR): <span className="mono-chip">HPSC202602019948210</span>
            </div>
            
            {/* Progress stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <div style={{ flex: 1, height: '4px', background: '#10b981', borderRadius: '2px' }} title="Submitted"></div>
              <div style={{ flex: 1, height: '4px', background: '#10b981', borderRadius: '2px' }} title="Field Verified"></div>
              <div style={{ flex: 1, height: '4px', background: '#10b981', borderRadius: '2px' }} title="Officer Sanctioned"></div>
              <div style={{ flex: 1, height: '4px', background: '#10b981', borderRadius: '2px' }} title="Bank Disbursed"></div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', textAlign: 'right' }}>
              100% Disbursed via NPCI-APBS
            </div>
          </div>

          {/* Quick Apply Button */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn-accent"
              onClick={() => onNavigateTab && onNavigateTab('schemes')}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              Apply for New Subsidy / Solar Pump ➔
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
