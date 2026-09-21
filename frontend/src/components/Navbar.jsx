import React from 'react';
import { ShieldCheck, UserCheck, RefreshCw, Layers, Database, Cpu } from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, activeTab, setActiveTab, gatewayStatus, lang = 'en', setLang }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 18, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Top Banner with Gov & Security Status */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            fontSize: '1.4rem'
          }}>
            🏔️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                HP-ASN <span style={{ color: 'var(--primary-light)' }}>SUADR</span>
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                <span className="live-dot"></span> HP AGRI CORE
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Himachal Pradesh Agriculture Service Network & State Unified Digital Database
            </p>
          </div>
        </div>

        {/* Live Subsystem Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
            <Cpu size={14} color="#34d399" />
            <span style={{ color: 'var(--text-muted)' }}>Gateway:</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>Nginx / Rate Limit</span>
          </div>

          <div className="glass-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
            <Database size={14} color="#38bdf8" />
            <span style={{ color: 'var(--text-muted)' }}>Backbone:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>PostgreSQL + Redis</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}
          >
            🌐 {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>

          {/* Role Switcher Pill */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setCurrentRole('FARMER')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                background: currentRole === 'FARMER' ? 'var(--primary)' : 'transparent',
                color: currentRole === 'FARMER' ? '#fff' : 'var(--text-muted)'
              }}
            >
              👨‍🌾 {lang === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal'}
            </button>
            <button
              onClick={() => setCurrentRole('OFFICER')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                background: currentRole === 'OFFICER' ? '#3b82f6' : 'transparent',
                color: currentRole === 'OFFICER' ? '#fff' : 'var(--text-muted)'
              }}
            >
              👮‍♂️ {lang === 'hi' ? 'कृषि अधिकारी ईआरपी' : 'Agriculture Officer ERP'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <button
          className={`nav-pill ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          {currentRole === 'FARMER' 
            ? (lang === 'hi' ? '🏡 किसान होम' : '🏡 Farmer Home') 
            : (lang === 'hi' ? '📊 अधिकारी कंट्रोल टावर' : '📊 Officer Control Tower')}
        </button>

        <button
          className={`nav-pill ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => setActiveTab('registry')}
        >
          {lang === 'hi' ? '🌾 एकीकृत किसान डेटाबेस एवं भूमि' : '🌾 Unified Farmer DB & Land'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'suadr' ? 'active' : ''}`}
          onClick={() => setActiveTab('suadr')}
        >
          {lang === 'hi' ? '🧪 SUADR मृदा एवं कृषि सलाह' : '🧪 SUADR Soil & Agro Intelligence'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'schemes' ? 'active' : ''}`}
          onClick={() => setActiveTab('schemes')}
        >
          {lang === 'hi' ? '💰 डीबीटी एवं सरकारी योजनाएं' : '💰 DBT & Schemes Engine'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'hpasn' ? 'active' : ''}`}
          onClick={() => setActiveTab('hpasn')}
        >
          {lang === 'hi' ? '🌐 HP-ASN डेटा एक्सचेंज' : '🌐 HP-ASN Data Exchange'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'mandi' ? 'active' : ''}`}
          onClick={() => setActiveTab('mandi')}
        >
          {lang === 'hi' ? '📈 मंडी भाव' : '📈 Mandi Spot Rates'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'ai-pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-pipeline')}
        >
          {lang === 'hi' ? '🧠 AI एवं सैटेलाइट पाइपलाइन' : '🧠 AI & Satellite Pipeline'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          {lang === 'hi' ? '🏗️ 10-स्तरीय आर्किटेक्चर' : '🏗️ 10-Tier Architecture'}
        </button>
      </div>
    </header>
  );
}
