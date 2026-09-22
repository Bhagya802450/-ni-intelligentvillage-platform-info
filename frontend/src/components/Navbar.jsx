import React from 'react';
import { ShieldCheck, UserCheck, RefreshCw, Layers, Database, Cpu } from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, activeTab, setActiveTab, gatewayStatus, lang = 'en', setLang, currentUser, onOpenLogin, onLogout }) {
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
            🌾
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                KA-ASN <span style={{ color: 'var(--primary-light)' }}>SUADR</span>
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                <span className="live-dot"></span> KA AGRI CORE
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಸೇವಾ ನೆಟ್‌ವರ್ಕ್ ಮತ್ತು ರಾಜ್ಯ ಏಕೀಕೃತ ಡಿಜಿಟಲ್ ಡೇಟಾಬೇಸ್' : 'Karnataka Agriculture Service Network & State Unified Digital Database'}
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

          {/* Language Switcher: Kannada & English only */}
          <button
            onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 14px', borderColor: 'rgba(245, 158, 11, 0.5)', color: '#fcd34d', fontWeight: 700 }}
          >
            🌐 {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>

          {/* Active User Session & Login Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {currentUser ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '8px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{currentUser.name}</span>
                <span className="badge" style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  background: (currentUser.role || '').includes('FARMER') ? 'rgba(16, 185, 129, 0.2)' : (currentUser.role || '').includes('OFFICER') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                  color: (currentUser.role || '').includes('FARMER') ? '#34d399' : (currentUser.role || '').includes('OFFICER') ? '#60a5fa' : '#c084fc'
                }}>
                  {currentUser.role}
                </span>
                <button
                  onClick={onOpenLogin}
                  className="btn btn-secondary"
                  title="Switch user account"
                  style={{ fontSize: '0.74rem', padding: '3px 8px', marginLeft: '4px' }}
                >
                  🔑 {lang === 'kn' ? 'ಬದಲಾಯಿಸಿ' : 'Switch'}
                </button>
                <button
                  onClick={onLogout}
                  title="Log out of session"
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.74rem', padding: '3px 6px' }}
                >
                  🚪 {lang === 'kn' ? 'ನಿರ್ಗಮಿಸಿ' : 'Logout'}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '6px 14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🔑 {lang === 'kn' ? 'ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign In'}
              </button>
            )}

            {/* Quick Role Switcher Pill */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              padding: '3px 4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-subtle)',
              gap: '3px'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', padding: '0 6px', fontWeight: 800 }}>
                ROLE:
              </span>
              <button
                onClick={() => setCurrentRole('FARMER')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  background: currentRole === 'FARMER' ? 'var(--primary)' : 'transparent',
                  color: currentRole === 'FARMER' ? '#fff' : 'var(--text-muted)'
                }}
              >
                👨‍🌾 {lang === 'kn' ? 'ರೈತ' : 'Farmer'}
              </button>
              <button
                onClick={() => setCurrentRole('OFFICER')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  background: currentRole === 'OFFICER' ? '#3b82f6' : 'transparent',
                  color: currentRole === 'OFFICER' ? '#fff' : 'var(--text-muted)'
                }}
              >
                👮‍♂️ {lang === 'kn' ? 'ಅಧಿಕಾರಿ' : 'Officer'}
              </button>
              <button
                onClick={() => setCurrentRole('ADMIN')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  background: currentRole === 'ADMIN' ? '#8b5cf6' : 'transparent',
                  color: currentRole === 'ADMIN' ? '#fff' : 'var(--text-muted)'
                }}
              >
                🛡️ {lang === 'kn' ? 'ನಿರ್ವಾಹಕ' : 'Admin'}
              </button>
            </div>
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
            ? (lang === 'kn' ? '🏡 ರೈತ ಮುಖಪುಟ' : '🏡 Farmer Home') 
            : currentRole === 'OFFICER'
              ? (lang === 'kn' ? '📊 ಅಧಿಕಾರಿ ನಿಯಂತ್ರಣ ಕೊಠಡಿ' : '📊 Officer Control Tower')
              : (lang === 'kn' ? '🛡️ ರಾಜ್ಯ ನಿರ್ವಾಹಕ ಕಮಾಂಡ್' : '🛡️ State Admin Command')}
        </button>

        <button
          className={`nav-pill ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => setActiveTab('registry')}
        >
          {lang === 'kn' ? '🌾 ಏಕೀಕೃತ ರೈತ ಡೇಟಾಬೇಸ್ ಮತ್ತು ಭೂಮಿ' : '🌾 Unified Farmer DB & Land'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'iam' ? 'active' : ''}`}
          onClick={() => setActiveTab('iam')}
        >
          {lang === 'kn' ? '🛡️ IAM ಮತ್ತು ಪ್ರವೇಶ ನಿಯಂತ್ರಣ' : '🛡️ IAM & Access Control'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'suadr' ? 'active' : ''}`}
          onClick={() => setActiveTab('suadr')}
        >
          {lang === 'kn' ? '🧪 SUADR ಮಣ್ಣು ಮತ್ತು ಕೃಷಿ ಸಲಹೆ' : '🧪 SUADR Soil & Agro Intelligence'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'schemes' ? 'active' : ''}`}
          onClick={() => setActiveTab('schemes')}
        >
          {lang === 'kn' ? '💰 ಡಿಬಿಟಿ ಮತ್ತು ಯೋಜನೆಗಳು' : '💰 DBT & Schemes Engine'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'hpasn' ? 'active' : ''}`}
          onClick={() => setActiveTab('hpasn')}
        >
          {lang === 'kn' ? '🌐 KA-ASN ಡೇಟಾ ವಿನಿಮಯ' : '🌐 KA-ASN Data Exchange'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'mandi' ? 'active' : ''}`}
          onClick={() => setActiveTab('mandi')}
        >
          {lang === 'kn' ? '📈 ಮಾರುಕಟ್ಟೆ ದರಗಳು' : '📈 Mandi Spot Rates'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'ai-pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-pipeline')}
        >
          {lang === 'kn' ? '🛰️ ಉಪಗ್ರಹ & ಎಐ ಕೃಷಿ ಸೂಟ್ (ಮಾಡ್ಯೂಲ್ 5-10)' : '🛰️ Earth Observation & AI Suite (M5-10)'}
        </button>

        <button
          className={`nav-pill ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          {lang === 'kn' ? '🏗️ 10-ಹಂತದ ವಾಸ್ತುಶಿಲ್ಪ' : '🏗️ 10-Tier Architecture'}
        </button>
      </div>
    </header>
  );
}
