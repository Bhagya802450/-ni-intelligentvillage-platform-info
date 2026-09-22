import React, { useState } from 'react';
import { Key, Lock, User, ShieldCheck, AlertCircle, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, lang = 'en' }) {
  const [role, setRole] = useState('FARMER'); // 'FARMER' | 'OFFICER' | 'ADMIN'
  const [identifier, setIdentifier] = useState('98450 12345');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isKn = lang === 'kn';

  if (!isOpen) return null;

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'FARMER') {
      setIdentifier('98450 12345');
    } else if (newRole === 'OFFICER') {
      setIdentifier('OFF-KA-801');
    } else if (newRole === 'ADMIN') {
      setIdentifier('ADM-KA-001');
    }
  };

  const handleQuickDemoLogin = (demoId, demoRole) => {
    setRole(demoRole);
    setIdentifier(demoId);
    setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.login(role, identifier, password);

      if (res.success && res.token) {
        setSuccessMsg(isKn ? `ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ: ${res.user?.name}` : `Successfully logged in as ${res.user?.name}`);
        // Store session locally and in Redis
        localStorage.setItem('hp_auth_token', res.token);
        localStorage.setItem('hp_auth_user', JSON.stringify(res.user));

        setTimeout(() => {
          onLoginSuccess(res.user, res.token);
          onClose();
        }, 600);
      } else {
        setError(res.message || (isKn ? "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ಪರಿಶೀಲಿಸಿ." : "Login failed. Invalid credentials."));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to communicate with authentication gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 10, 16, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className="glass-card" 
        style={{
          maxWidth: '520px',
          width: '100%',
          background: '#0d1520',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          padding: '32px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}>
            <Key size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              {isKn ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಲಾಗಿನ್' : 'Karnataka Agri Platform Sign In'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {isKn ? 'KA-ASN & SUADR ಏಕೀಕೃತ ಗುರುತು ಮತ್ತು ಭೂಮಿ ಪ್ರವೇಶ' : 'KA-ASN & SUADR Unified Identity & Bhoomi Access Gate'}
            </p>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '5px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          margin: '20px 0'
        }}>
          <button
            type="button"
            onClick={() => handleRoleSelect('FARMER')}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: role === 'FARMER' ? 'var(--primary)' : 'transparent',
              color: role === 'FARMER' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            👨‍🌾 {isKn ? 'ರೈತ' : 'Farmer'}
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('OFFICER')}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: role === 'OFFICER' ? '#3b82f6' : 'transparent',
              color: role === 'OFFICER' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            👮‍♂️ {isKn ? 'ಅಧಿಕಾರಿ' : 'Officer'}
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('ADMIN')}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: role === 'ADMIN' ? '#8b5cf6' : 'transparent',
              color: role === 'ADMIN' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            🛡️ {isKn ? 'ನಿರ್ವಾಹಕ' : 'Admin'}
          </button>
        </div>

        {/* Demo Fast-Login Chips */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
            {isKn ? 'ಡೆಮೊ ಖಾತೆಗಳು (ತ್ವರಿತ ಕ್ಲಿಕ್):' : 'Demo Credentials (1-Click Fill):'}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {role === 'FARMER' && (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('98450 12345', 'FARMER')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.72rem',
                    background: identifier === '98450 12345' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    cursor: 'pointer'
                  }}
                >
                  Basavaraj Patil (Mandya - 98450 12345)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('98160 12345', 'FARMER')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.72rem',
                    background: identifier === '98160 12345' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    cursor: 'pointer'
                  }}
                >
                  Surender Thakur (98160 12345)
                </button>
              </>
            )}

            {role === 'OFFICER' && (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('OFF-KA-801', 'OFFICER')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.72rem',
                    background: identifier === 'OFF-KA-801' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#60a5fa',
                    cursor: 'pointer'
                  }}
                >
                  Dr. H. M. Mallikarjun (JDA - OFF-KA-801)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('OFF-HP-801', 'OFFICER')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.72rem',
                    background: identifier === 'OFF-HP-801' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#60a5fa',
                    cursor: 'pointer'
                  }}
                >
                  Dr. Vikram Chauhan (OFF-HP-801)
                </button>
              </>
            )}

            {role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADM-KA-001', 'ADMIN')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.72rem',
                  background: identifier === 'ADM-KA-001' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#c084fc',
                  cursor: 'pointer'
                }}
              >
                Smt. Rekha Rao (State Admin - ADM-KA-001)
              </button>
            )}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              {role === 'FARMER' 
                ? (isKn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / ಇಮೇಲ್ / ರಾಷ್ಟ್ರೀಯ ರೈತ ID:' : 'Mobile Number / Email / AgriStack ID:') 
                : (isKn ? 'ಅಧಿಕಾರಿ ID / ಇಮೇಲ್:' : 'Official ID / Email:')}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder={role === 'FARMER' ? 'e.g. 98160 12345 or surender.thakur@hpfarmers.in' : 'e.g. OFF-HP-801 or ADM-HP-001'}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              {isKn ? 'ಪಾಸ್‌ವರ್ಡ್ / ಆಧಾರ್ OTP (ಐಚ್ಛಿಕ):' : 'Password / OTP (Optional for Demo):'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#6ee7b7',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (isKn ? 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Authenticating & Issuing Token...') : (
              <>
                {isKn ? 'ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ' : 'Sign In to Account'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.74rem',
          color: 'var(--text-dim)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={14} color="#34d399" />
          <span>Backed by Frappe Authentication & Redis Token Session Engine</span>
        </div>
      </div>
    </div>
  );
}
