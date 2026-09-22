import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FarmerPortal from './pages/FarmerPortal';
import OfficerPortal from './pages/OfficerPortal';
import RegistryView from './pages/RegistryView';
import SuadrExplorer from './pages/SuadrExplorer';
import SchemesView from './pages/SchemesView';
import HpasnExchange from './pages/HpasnExchange';
import MandiMarketplace from './pages/MandiMarketplace';
import ArchitectureView from './pages/ArchitectureView';
import AiServicePipeline from './pages/AiServicePipeline';
import IamView from './pages/IamView';
import AdminPortal from './pages/AdminPortal';
import LoginModal from './components/LoginModal';
import { api } from './services/api';

export default function App() {
  const [currentRole, setCurrentRole] = useState('FARMER'); // 'FARMER' | 'OFFICER' | 'ADMIN'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState('en'); // 'en' | 'kn'
  
  // User Authentication & Session State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('hp_auth_token') || null;
  });

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    if (user.role && (user.role.includes('OFFICER') || user.role === 'VILLAGE_REVENUE_OFFICER' || user.role === 'AGRICULTURE_OFFICER' || user.role === 'BANK_NODAL_OFFICER')) {
      setCurrentRole('OFFICER');
      setOfficer(prev => ({
        ...prev,
        id: user.id || prev.id,
        name: user.name || prev.name,
        email: user.email || prev.email,
        designation: user.role
      }));
    } else if (user.role && (user.role.includes('ADMIN') || user.role === 'STATE_ADMIN')) {
      setCurrentRole('ADMIN');
      setAdminUser(prev => ({
        ...prev,
        id: user.id || prev.id,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    } else {
      setCurrentRole('FARMER');
    }
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('hp_auth_token');
    localStorage.removeItem('hp_auth_user');
    setCurrentUser(null);
    setAuthToken(null);
  };

  const [farmers, setFarmers] = useState([]);
  const [officer, setOfficer] = useState({
    id: "OFF-KA-801",
    name: "Dr. H. M. Mallikarjun",
    designation: "Joint Director of Agriculture (JDA)",
    district: "Mandya",
    jurisdiction: ["Mandya", "Maddur", "Pandavapura", "Srirangapatna"],
    email: "jda.mandya@kaagri.gov.in",
    role: "OFFICER"
  });
  const [adminUser, setAdminUser] = useState({
    id: "ADM-KA-001",
    name: "Smt. Rekha Rao",
    designation: "State System Administrator & KA-ASN Nodal Officer",
    department: "Directorate of Agriculture / e-Governance Govt of Karnataka",
    district: "State HQ (Bengaluru MS Building)",
    email: "admin.kaasn@karnataka.gov.in",
    role: "ADMIN"
  });
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      const [fRes, aRes, anRes, gRes] = await Promise.all([
        api.getFarmers(),
        api.getApplications(),
        api.getSchemeAnalytics(),
        api.getHealth()
      ]);

      if (fRes.success) setFarmers(fRes.data);
      if (aRes.success) setApplications(aRes.data);
      if (anRes.success) setAnalytics(anRes);
      if (gRes.status) setGatewayStatus(gRes);
    } catch (err) {
      console.error("Error loading platform data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const activeFarmer = farmers.find(f => (f.state && f.state.toLowerCase() === 'karnataka') || f.district === 'Mandya' || f.id === 'FARMER-KA-1001') || farmers[0] || null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation & Subsystem Header */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gatewayStatus={gatewayStatus}
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px', flex: 1 }}>
        {loading ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Connecting to HP-ASN Gateway & SUADR Data Backbone...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              currentRole === 'FARMER' ? (
                <FarmerPortal
                  farmer={activeFarmer}
                  onApplySchemeSuccess={loadAllData}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              ) : currentRole === 'OFFICER' ? (
                <OfficerPortal
                  officer={officer}
                  applications={applications}
                  farmers={farmers}
                  analytics={analytics}
                  onRefreshData={loadAllData}
                />
              ) : (
                <AdminPortal
                  adminUser={adminUser}
                  gatewayStatus={gatewayStatus}
                  farmers={farmers}
                  applications={applications}
                  analytics={analytics}
                  lang={lang}
                  onRefreshData={loadAllData}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )
            )}

            {/* Unified Farmer Registry Tab */}
            {activeTab === 'registry' && (
              <RegistryView
                farmers={farmers}
                onRefreshData={loadAllData}
                lang={lang}
              />
            )}

            {/* IAM Identity & Access Management */}
            {activeTab === 'iam' && (
              <IamView lang={lang} onOpenLogin={() => setIsLoginOpen(true)} />
            )}

            {/* SUADR Soil & Climate Tab */}
            {activeTab === 'suadr' && (
              <SuadrExplorer lang={lang} />
            )}

            {/* Schemes & DBT Engine */}
            {activeTab === 'schemes' && (
              <SchemesView
                farmer={activeFarmer}
                onRefreshData={loadAllData}
                lang={lang}
              />
            )}

            {/* HP-ASN Inter-Department Exchange */}
            {activeTab === 'hpasn' && (
              <HpasnExchange
                farmers={farmers}
                lang={lang}
              />
            )}

            {/* Mandi Rates */}
            {activeTab === 'mandi' && (
              <MandiMarketplace />
            )}

            {/* System Architecture View */}
            {activeTab === 'architecture' && (
              <ArchitectureView />
            )}

            {/* Python AI Service Pipeline (React -> Frappe API -> Redis Queue -> Python AI) */}
            {activeTab === 'ai-pipeline' && (
              <AiServicePipeline farmer={activeFarmer} lang={lang} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        background: 'rgba(5, 10, 15, 0.8)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            Karnataka Agriculture Service Network (KA-ASN) • State Unified Digital Agri Database (SUADR)
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>AgriStack Compatible</span>
            <span>Bhoomi RTC Cadastral Sync</span>
            <span>Parihara DBT Integrated</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Login / Account Switch Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />
    </div>
  );
}
