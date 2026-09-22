import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, CheckCircle2, XCircle, UserCheck, 
  ShieldAlert, Cpu, Award, Users, ArrowDown, Play, Terminal, 
  ArrowRight, Check, AlertTriangle, Layers, Server
} from 'lucide-react';
import { api } from '../services/api';

export default function IamView({ lang = 'en', onSwitchUser, onOpenLogin }) {
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

  // Security Pipeline state: Login -> Authentication -> Role Check -> Permission -> Access API
  const [pipelineCaller, setPipelineCaller] = useState('OFFICER');
  const [pipelineRoleReq, setPipelineRoleReq] = useState('OFFICER');
  const [pipelinePermReq, setPipelinePermReq] = useState('schemes:approve');
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState(null);
  const [guardedApiResponse, setGuardedApiResponse] = useState(null);

  // Concrete Access APIs state (Farmer, Officer, Admin)
  const [roleApiTesting, setRoleApiTesting] = useState(false);
  const [roleApiActiveAction, setRoleApiActiveAction] = useState(null);
  const [roleApiResult, setRoleApiResult] = useState(null);

  const testConcreteEndpoint = async (roleType, actionKey) => {
    setRoleApiTesting(true);
    setRoleApiActiveAction(actionKey);
    setRoleApiResult(null);

    try {
      const creds = {
        'FARMER': '98160 12345',
        'OFFICER': 'OFF-HP-801',
        'ADMIN': 'ADM-HP-001'
      };
      const loginRes = await api.login(null, creds[roleType]);
      const token = loginRes.token;

      let res = null;
      switch (actionKey) {
        case 'farmer_profile':
          res = await api.getFarmerProfile(token);
          break;
        case 'farmer_land':
          res = await api.getFarmerLand(token);
          break;
        case 'farmer_crops':
          res = await api.getFarmerCrops(token);
          break;
        case 'officer_farmers':
          res = await api.getOfficerFarmers(token);
          break;
        case 'officer_verify':
          res = await api.officerVerifyFarmer(token, {
            farmerId: "FARMER-HP-1001",
            parcelId: "LAND-SHI-101",
            verificationStatus: "VERIFIED_HIMBHOOMI_MATCH",
            remarks: "Cadastral field survey matches Bhoomi RTC revenue record."
          });
          break;
        case 'officer_field':
          res = await api.officerUpdateFieldInfo(token, {
            farmerId: "FARMER-HP-1001",
            soilMoisture: 46,
            pestRisk: "LOW",
            cropStatus: "Optimal Growth"
          });
          break;
        case 'admin_users':
          res = await api.getAdminUsers(token);
          break;
        case 'admin_roles':
          res = await api.getAdminRoles(token);
          break;
        case 'admin_system':
          res = await api.getAdminSystemData(token);
          break;
        default:
          break;
      }
      setRoleApiResult(res);
    } catch (e) {
      console.error(e);
      setRoleApiResult({ success: false, error: e.message });
    } finally {
      setRoleApiTesting(false);
    }
  };

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

  const handleRunSecurityPipeline = async () => {
    setPipelineRunning(true);
    setPipelineSteps(null);
    setGuardedApiResponse(null);

    try {
      let token = null;
      let userObj = null;

      // STEP 1: Login
      let step1 = {
        step: 1,
        name: isKn ? "1. ಲಾಗಿನ್ (Login)" : "1. Login",
        status: "COMPLETED",
        passed: true,
        details: "Credentials submitted to /api/auth/login"
      };

      if (pipelineCaller === 'ANONYMOUS') {
        step1 = {
          step: 1,
          name: isKn ? "1. ಲಾಗಿನ್ (Login)" : "1. Login",
          status: "SKIPPED_UNAUTHENTICATED",
          passed: false,
          details: "Anonymous request without login session."
        };
      } else {
        const identifiers = {
          'FARMER': '98160 12345',
          'PATWARI': 'PAT-HP-301',
          'OFFICER': 'OFF-HP-801',
          'ADMIN': 'ADM-HP-001'
        };
        const loginRes = await api.login(null, identifiers[pipelineCaller]);
        if (loginRes.success) {
          token = loginRes.token;
          userObj = loginRes.user;
          step1.details = `Authenticated as ${userObj.name} (${userObj.role}). Issued Bearer token.`;
          step1.token = token;
        } else {
          step1.status = "LOGIN_FAILED";
          step1.passed = false;
          step1.details = loginRes.message || "Invalid credentials";
        }
      }

      // If login failed or anonymous:
      if (!token) {
        const step2 = {
          step: 2,
          name: isKn ? "2. ದೃಢೀಕರಣ (Authentication)" : "2. Authentication",
          status: "HTTP_401_UNAUTHORIZED",
          passed: false,
          error: "AUTH_TOKEN_MISSING",
          details: "No Bearer token present. authGuard.authenticate rejects with HTTP 401."
        };
        const step3 = {
          step: 3,
          name: isKn ? "3. ಪಾತ್ರ ಪರಿಶೀಲನೆ (Role Check)" : "3. Role Check",
          status: "BLOCKED",
          passed: false,
          details: "Blocked due to unauthenticated request."
        };
        const step4 = {
          step: 4,
          name: isKn ? "4. ಅನುಮತಿ (Permission)" : "4. Permission",
          status: "BLOCKED",
          passed: false,
          details: "Blocked due to unauthenticated request."
        };
        const step5 = {
          step: 5,
          name: isKn ? "5. API ಪ್ರವೇಶ ಅನುಷ್ಠಾನ (Access API implementation)" : "5. Access API implementation",
          status: "HTTP_401_DENIED",
          passed: false,
          details: "API execution terminated at Authentication boundary."
        };

        const apiRes = await api.getGuardedSample(null);
        setGuardedApiResponse(apiRes);
        setPipelineSteps([step1, step2, step3, step4, step5]);
        return;
      }

      // STEP 2: Authentication
      const step2 = {
        step: 2,
        name: isKn ? "2. ದೃಢೀಕರಣ (Authentication)" : "2. Authentication",
        status: "AUTHENTICATED",
        passed: true,
        principalId: userObj.id,
        details: `Bearer token verified in IAM directory. Principal: ${userObj.name} (${userObj.id})`
      };

      // STEP 3: Role Check
      const roleMatches = (userRole, reqRole) => {
        if (!userRole || !reqRole) return false;
        const u = userRole.toUpperCase();
        const r = reqRole.toUpperCase();
        if (r === '*' || r === 'USER') return true;
        if (u === r) return true;
        if (r === 'ADMIN' && (u === 'ADMIN' || u === 'STATE_ADMIN')) return true;
        if (r === 'OFFICER' && (u === 'OFFICER' || u.includes('OFFICER') || u === 'VILLAGE_REVENUE_OFFICER' || u === 'AGRICULTURE_OFFICER' || u === 'BANK_NODAL_OFFICER')) return true;
        if (r === 'FARMER' && u === 'FARMER') return true;
        return false;
      };

      const isAdmin = roleMatches(userObj.role, 'ADMIN');
      const isRoleAllowed = isAdmin || roleMatches(userObj.role, pipelineRoleReq);

      const step3 = {
        step: 3,
        name: isKn ? "3. ಪಾತ್ರ ಪರಿಶೀಲನೆ (Role Check)" : "3. Role Check",
        status: isRoleAllowed ? "ROLE_VERIFIED" : "HTTP_403_FORBIDDEN_ROLE",
        passed: isRoleAllowed,
        details: isRoleAllowed
          ? `User role '${userObj.role}' satisfies required role '${pipelineRoleReq}' in hierarchy.`
          : `Access denied. Role '${userObj.role}' does not match required role '${pipelineRoleReq}'.`
      };

      if (!isRoleAllowed) {
        const step4 = {
          step: 4,
          name: isKn ? "4. ಅನುಮತಿ (Permission)" : "4. Permission",
          status: "SKIPPED_ROLE_MISMATCH",
          passed: false,
          details: "Execution halted due to Role Check failure."
        };
        const step5 = {
          step: 5,
          name: isKn ? "5. API ಪ್ರವೇಶ ಅನುಷ್ಠಾನ (Access API implementation)" : "5. Access API implementation",
          status: "HTTP_403_FORBIDDEN",
          passed: false,
          details: "Access denied by requireRole guard."
        };
        const apiRes = await api.getGuardedSample(token);
        setGuardedApiResponse(apiRes);
        setPipelineSteps([step1, step2, step3, step4, step5]);
        return;
      }

      // STEP 4: Permission Check
      const userPerms = userObj.permissions || [];
      const hasPerm = isAdmin || userPerms.includes('*') || userPerms.includes(pipelinePermReq);

      const step4 = {
        step: 4,
        name: isKn ? "4. ಅನುಮತಿ (Permission)" : "4. Permission",
        status: hasPerm ? "PERMISSION_GRANTED" : "HTTP_403_PERMISSION_DENIED",
        passed: hasPerm,
        details: hasPerm
          ? `User holds required permission '${pipelinePermReq}' (Decision: PERMIT).`
          : `User lacks required permission '${pipelinePermReq}'. (Decision: DENY).`
      };

      // STEP 5: Access API Implementation
      const apiRes = await api.getGuardedSample(token);
      setGuardedApiResponse(apiRes);

      const step5 = {
        step: 5,
        name: isKn ? "5. API ಪ್ರವೇಶ ಅನುಷ್ಠಾನ (Access API implementation)" : "5. Access API implementation",
        status: hasPerm ? "HTTP_200_ACCESS_GRANTED" : "HTTP_403_ACCESS_BLOCKED",
        passed: hasPerm,
        details: hasPerm
          ? "Target controller executed successfully! Returning protected resource payload."
          : "Blocked by requirePermission middleware before controller execution."
      };

      setPipelineSteps([step1, step2, step3, step4, step5]);
    } catch (err) {
      console.error(err);
    } finally {
      setPipelineRunning(false);
    }
  };

  useEffect(() => {
    handleRunSecurityPipeline();
  }, [pipelineCaller, pipelineRoleReq, pipelinePermReq]);

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

      {/* User Roles Hierarchy Visualizer Card */}
      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {isKn ? 'ಬಳಕೆದಾರ ಪಾತ್ರಗಳ ಶ್ರೇಣಿ (User Role Hierarchy)' : 'User Role Hierarchy Tree'}
            </h2>
          </div>
          <span className="mono-chip" style={{ color: '#34d399', fontSize: '0.8rem' }}>
            User ├── Farmer ├── Officer └── Admin
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {isKn 
            ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನ ಎಲ್ಲಾ ಬಳಕೆದಾರರು ಈ 3-ಹಂತದ ಅಧಿಕಾರ ರಚನೆಯ ಅಡಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಾರೆ:'
            : 'All authenticated platform principals inherit access according to this 3-tier canonical authority hierarchy:'}
        </p>

        {/* Tree Visual Flow */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Root Level: User */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.3rem' }}>👤</span>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff' }}>User (Root Principal)</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {isKn ? 'ಆಧಾರ್ ಮತ್ತು ಅಗ್ರಿಸ್ಟಾಕ್ ದೃಢೀಕರಿಸಿದ ಮೂಲ ಬಳಕೆದಾರ ಗುರುತು' : 'Root authenticated identity with Aadhaar / AgriStack credentials'}
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>Root Scope</span>
          </div>

          {/* Child Branches: Farmer | Officer | Admin */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            paddingLeft: '20px',
            borderLeft: '2px dashed rgba(56, 189, 248, 0.4)',
            marginLeft: '20px'
          }}>
            {/* Branch 1: Farmer */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#34d399' }}>
                  ├── 👨‍🌾 Farmer
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>FARMER</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKn ? 'ವೈಯಕ್ತಿಕ ಭೂಮಿ ಪಾರ್ಸೆಲ್‌ಗಳು, ಮಣ್ಣು ಕಾರ್ಡ್, ಡಿಬಿಟಿ ಸಬ್ಸಿಡಿ ಅರ್ಜಿ ಮತ್ತು ಮಂಡಿ ವ್ಯಾಪಾರ.' : 'Personal landholdings, Soil Health Cards, DBT subsidy claims, and Mandi spot rate trading.'}
              </p>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Scope: <strong>Individual Beneficiary (Self)</strong>
              </div>
            </div>

            {/* Branch 2: Officer */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#60a5fa' }}>
                  ├── 👮‍♂️ Officer
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>OFFICER</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKn ? 'ಕ್ಷೇತ್ರ ಪರಿಶೀಲನೆ, ಪಟ್ವಾರಿ ಖಸ್ರಾ ದೃಢೀಕರಣ, ಡಿಬಿಟಿ ಮಂಜೂರಾತಿ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳ ಪ್ರಸಾರ.' : 'Field inspections, Patwari Khasra verification, DBT sanctioning (DAO/ADO), and advisory broadcasts.'}
              </p>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Scope: <strong>Tehsil / District Operational ERP</strong>
              </div>
            </div>

            {/* Branch 3: Admin */}
            <div style={{
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#c084fc' }}>
                  └── 🛡️ Admin
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>ADMIN</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKn ? 'HP-ASN ಇಲಾಖಾ ನೀತಿಗಳು, ಅಸ್ಥಿರ ಆಡಿಟ್ ಲೆಡ್ಜರ್, ಗೇಟ್‌ವೇ ದರ ನಿಯಂತ್ರಣ ಮತ್ತು ಸಿಸ್ಟಮ್ ಟೆಲಿಮೆಟ್ರಿ.' : 'Statewide HP-ASN data exchange governance, tamper-proof audit trail, and gateway telemetry.'}
              </p>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Scope: <strong>Statewide Core Infrastructure</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Security Pipeline: Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API */}
      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={24} color="#10b981" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {isKn
                  ? 'ಶೂನ್ಯ-ವಿಶ್ವಾಸ ಭದ್ರತಾ ಪೈಪ್‌ಲೈನ್ (Zero-Trust Security Pipeline)'
                  : 'Zero-Trust Security Pipeline Simulation & API Access'}
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, marginTop: '2px', letterSpacing: '0.5px' }}>
                Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API implementation
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700, borderColor: 'rgba(16, 185, 129, 0.5)', color: '#34d399' }}
              >
                <Key size={16} />
                {isKn ? 'ಖಾತೆ ಲಾಗಿನ್ ತೆರೆಯಿರಿ' : 'Open Login Dialog'}
              </button>
            )}
            <button
              onClick={handleRunSecurityPipeline}
              disabled={pipelineRunning}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 700 }}
            >
              <Play size={16} fill="currentColor" />
              {pipelineRunning
                ? (isKn ? 'ಪೈಪ್‌ಲೈನ್ ಚಾಲನೆಯಲ್ಲಿದೆ...' : 'Executing Pipeline...')
                : (isKn ? 'ಪೈಪ್‌ಲೈನ್ ಚಾಲನೆ ಮಾಡಿ (Live API)' : 'Execute Pipeline (Live API)')}
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          {isKn
            ? 'ಪ್ರತಿಯೊಂದು API ವಿನಂತಿಯು ಲಾಗಿನ್, ಬೇರರ್ ಟೋಕನ್ ದೃಢೀಕರಣ, ಪಾತ್ರ ಶ್ರೇಣಿ ಪರಿಶೀಲನೆ, ಮತ್ತು ಸೂಕ್ಷ್ಮ ಅನುಮತಿ ತಪಾಸಣೆಯನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಪೂರೈಸಬೇಕು.'
            : 'Every incoming request to guarded platform endpoints strictly traverses: Login, Bearer Token Authentication, Hierarchical Role Check, Granular Permission Evaluation, and finally Controller Execution.'}
        </p>

        {/* Pipeline Control Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              {isKn ? '1. ಕಾಲರ್ ಗುರುತು (Caller Principal):' : '1. Test Caller Principal:'}
            </label>
            <select
              value={pipelineCaller}
              onChange={(e) => setPipelineCaller(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.83rem'
              }}
            >
              <option value="OFFICER">👨‍💼 Officer (Dr. Vikram Chauhan - DAO)</option>
              <option value="PATWARI">👮‍♂️ Officer (Ramesh Chand Sharma - Patwari)</option>
              <option value="FARMER">👨‍🌾 Farmer (Surender Thakur)</option>
              <option value="ADMIN">🛡️ Admin (Rajiv Kumar Verma)</option>
              <option value="ANONYMOUS">🚫 Anonymous / Missing Token (Tests 401)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              {isKn ? '2. ಗುರಿ ಅಗತ್ಯವಿರುವ ಪಾತ್ರ (Required Role):' : '2. Target Required Role:'}
            </label>
            <select
              value={pipelineRoleReq}
              onChange={(e) => setPipelineRoleReq(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.83rem'
              }}
            >
              <option value="OFFICER">OFFICER (Tehsil / District Operational ERP)</option>
              <option value="FARMER">FARMER (Individual Beneficiary)</option>
              <option value="ADMIN">ADMIN (Statewide Infrastructure Core)</option>
              <option value="USER">USER (Any Authenticated Platform User)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              {isKn ? '3. ಗುರಿ ಕಡ್ಡಾಯ ಅನುಮತಿ (Required Permission):' : '3. Target Required Permission:'}
            </label>
            <select
              value={pipelinePermReq}
              onChange={(e) => setPipelinePermReq(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.83rem'
              }}
            >
              <option value="schemes:approve">schemes:approve (Approve Subsidy)</option>
              <option value="cadastral:verify_khasra">cadastral:verify_khasra (Verify Khasra)</option>
              <option value="iam:manage_roles">iam:manage_roles (Admin IAM Governance)</option>
              <option value="farmer:read_own">farmer:read_own (Farmer Self Data)</option>
            </select>
          </div>
        </div>

        {/* 5-Step Pipeline Flow Diagram */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { step: 1, label: isKn ? "ಲಾಗಿನ್" : "Login", icon: Key, sub: "Credentials ➔ Token" },
            { step: 2, label: isKn ? "ದೃಢೀಕರಣ" : "Authentication", icon: Lock, sub: "Bearer Token Validation" },
            { step: 3, label: isKn ? "ಪಾತ್ರ ಪರಿಶೀಲನೆ" : "Role Check", icon: Users, sub: "User ├── Farmer ├── Officer └── Admin" },
            { step: 4, label: isKn ? "ಅನುಮತಿ" : "Permission", icon: Shield, sub: "RBAC Capability Permitted" },
            { step: 5, label: isKn ? "API ಪ್ರವೇಶ" : "Access API implementation", icon: Server, sub: "Target Controller (200 OK)" }
          ].map((item, idx) => {
            const stepResult = pipelineSteps?.find(s => s.step === item.step);
            const isDone = stepResult && stepResult.passed;
            const isFailed = stepResult && !stepResult.passed;
            const IconComp = item.icon;

            return (
              <div
                key={item.step}
                style={{
                  background: isDone 
                    ? 'rgba(16, 185, 129, 0.12)' 
                    : isFailed 
                    ? 'rgba(239, 68, 68, 0.12)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${
                    isDone 
                      ? 'rgba(16, 185, 129, 0.5)' 
                      : isFailed 
                      ? 'rgba(239, 68, 68, 0.5)' 
                      : 'rgba(255, 255, 255, 0.08)'
                  }`,
                  borderRadius: '10px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                    STEP 0{item.step}
                  </span>
                  {isDone && <CheckCircle2 size={16} color="#10b981" />}
                  {isFailed && <XCircle size={16} color="#ef4444" />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconComp size={18} color={isDone ? "#10b981" : isFailed ? "#ef4444" : "#38bdf8"} />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isDone ? '#10b981' : isFailed ? '#ef4444' : '#fff' }}>
                    {item.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {item.sub}
                </div>

                {stepResult && (
                  <div style={{
                    marginTop: 'auto',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    background: isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: isDone ? '#34d399' : '#f87171'
                  }}>
                    {stepResult.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pipeline Execution Details & Live JSON */}
        {pipelineSteps && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Terminal size={18} color="#38bdf8" />
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                  {isKn ? 'ಪೈಪ್‌ಲೈನ್ ಹಂತ ವಿವರಗಳು (Step-by-Step Trace)' : 'Pipeline Step-by-Step Trace'}
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pipelineSteps.map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: '10px', fontSize: '0.78rem' }}>
                    <div style={{ color: s.passed ? '#10b981' : '#ef4444', fontWeight: 800, minWidth: '22px' }}>
                      {s.passed ? '✔' : '✖'}
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>{s.name}:</strong>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>{s.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={18} color="#10b981" />
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                    {isKn ? 'ಲೈವ್ API ಪ್ರತಿಕ್ರಿಯೆ (Guarded Endpoint Response)' : 'Live API Response: /api/auth/guarded-sample'}
                  </h4>
                </div>
                <span className={`badge ${guardedApiResponse?.success ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                  {guardedApiResponse?.success ? 'HTTP 200 OK' : 'HTTP 401/403'}
                </span>
              </div>
              <pre style={{
                background: '#090d16',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                color: '#34d399',
                margin: 0,
                maxHeight: '160px',
                overflow: 'auto',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                {JSON.stringify(guardedApiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Concrete Role-Based Access APIs (Farmer, Officer, Admin) */}
      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(59, 130, 246, 0.4)', background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={22} color="#38bdf8" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {isKn
                  ? 'ಪಾತ್ರ ಪ್ರವೇಶ API ಅನುಷ್ಠಾನಗಳು (Role-Based Access APIs)'
                  : 'Guarded Role-Based Access APIs (Farmer, Officer, Admin)'}
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 700, marginTop: '3px' }}>
              Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API
            </div>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            Zero-Trust Strict Pipeline
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {isKn
            ? 'ಪ್ರತಿ ಪಾತ್ರವು (Farmer, Officer, Admin) ಕಡ್ಡಾಯವಾಗಿ ಶ್ರೇಣೀಕೃತ ಲಾಗಿನ್, ದೃಢೀಕರಣ, ಪಾತ್ರ ಪರಿಶೀಲನೆ, ಮತ್ತು ನಿರ್ದಿಷ್ಟ ಅನುಮತಿ ಹೊಂದಿರಬೇಕು.'
            : 'Click any endpoint below to simulate the full security pipeline: Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API.'}
        </p>

        {/* 3 Columns: Farmer, Officer, Admin */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' }}>
          
          {/* Column 1: Farmer */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>👨‍🌾</span>
                <strong style={{ fontSize: '1rem', color: '#34d399' }}>Farmer</strong>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>ROLE: FARMER</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {isKn ? 'ವೈಯಕ್ತಿಕ ಪ್ರೊಫೈಲ್, ನೋಂದಾಯಿತ ಜಮೀನು ಮತ್ತು ಬೆಳೆ ವಿವರಗಳ ಪ್ರವೇಶ.' : 'Beneficiary access to personal identity, land parcels, and crop yields.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'farmer_profile', label: isKn ? '├── View own profile' : '├── View own profile', endpoint: 'GET /api/farmer/profile', perm: 'farmer:view_profile' },
                { key: 'farmer_land', label: isKn ? '├── View own land' : '├── View own land', endpoint: 'GET /api/farmer/land', perm: 'farmer:view_land' },
                { key: 'farmer_crops', label: isKn ? '└── View own crops' : '└── View own crops', endpoint: 'GET /api/farmer/crops', perm: 'farmer:view_crops' }
              ].map(action => (
                <button
                  key={action.key}
                  onClick={() => testConcreteEndpoint('FARMER', action.key)}
                  disabled={roleApiTesting}
                  style={{
                    background: roleApiActiveAction === action.key ? 'rgba(16, 185, 129, 0.25)' : 'rgba(0,0,0,0.35)',
                    border: `1px solid ${roleApiActiveAction === action.key ? '#10b981' : 'var(--border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    textAlign: 'left',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{action.label}</span>
                    <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>Invoke API →</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                    <span>{action.endpoint}</span>
                    <span>[{action.perm}]</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Officer */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.06)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>👮‍♂️</span>
                <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>Officer</strong>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>ROLE: OFFICER</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {isKn ? 'ತಹಸಿಲ್ ರೈತರ ವಿವರಗಳು, ಖಾಸ್ರಾ ಪರಿಶೀಲನೆ ಮತ್ತು ಕ್ಷೇತ್ರ ಮಾಹಿತಿ ಅಪ್ಡೇಟ್.' : 'Field officer ERP for village inspections, title verification, and soil telemetry.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'officer_farmers', label: isKn ? '├── View farmers' : '├── View farmers', endpoint: 'GET /api/officer/farmers', perm: 'officer:view_farmers' },
                { key: 'officer_verify', label: isKn ? '├── Verify farmer' : '├── Verify farmer', endpoint: 'POST /api/officer/verify-farmer', perm: 'officer:verify_farmer' },
                { key: 'officer_field', label: isKn ? '└── Update field information' : '└── Update field information', endpoint: 'POST /api/officer/update-field-info', perm: 'officer:update_field_info' }
              ].map(action => (
                <button
                  key={action.key}
                  onClick={() => testConcreteEndpoint('OFFICER', action.key)}
                  disabled={roleApiTesting}
                  style={{
                    background: roleApiActiveAction === action.key ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0,0,0,0.35)',
                    border: `1px solid ${roleApiActiveAction === action.key ? '#38bdf8' : 'var(--border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    textAlign: 'left',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{action.label}</span>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>Invoke API →</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                    <span>{action.endpoint}</span>
                    <span>[{action.perm}]</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Admin */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.06)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                <strong style={{ fontSize: '1rem', color: '#c084fc' }}>Admin</strong>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>ROLE: ADMIN</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {isKn ? 'ಬಳಕೆದಾರರು, ಪಾತ್ರ ಶ್ರೇಣಿಗಳು ಮತ್ತು ರಾಜ್ಯ ಸಿಸ್ಟಮ್ ಡೇಟಾ ಸಂರಚನೆ.' : 'Statewide core governance, RBAC role definitions, and system data.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'admin_users', label: isKn ? '├── Manage users' : '├── Manage users', endpoint: 'GET /api/admin/users', perm: 'admin:manage_users' },
                { key: 'admin_roles', label: isKn ? '├── Manage roles' : '├── Manage roles', endpoint: 'GET /api/admin/roles', perm: 'admin:manage_roles' },
                { key: 'admin_system', label: isKn ? '└── Manage system data' : '└── Manage system data', endpoint: 'GET /api/admin/system-data', perm: 'admin:manage_system_data' }
              ].map(action => (
                <button
                  key={action.key}
                  onClick={() => testConcreteEndpoint('ADMIN', action.key)}
                  disabled={roleApiTesting}
                  style={{
                    background: roleApiActiveAction === action.key ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0,0,0,0.35)',
                    border: `1px solid ${roleApiActiveAction === action.key ? '#c084fc' : 'var(--border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    textAlign: 'left',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{action.label}</span>
                    <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>Invoke API →</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                    <span>{action.endpoint}</span>
                    <span>[{action.perm}]</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Live Payload Inspector for Selected Concrete Action */}
        {roleApiResult && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <strong style={{ fontSize: '0.9rem', color: '#34d399' }}>
                  {isKn ? 'ಲೈವ್ API ಫಲಿತಾಂಶ (HTTP 200 OK - Pipeline Completed)' : 'Live API Payload: Protected Controller Execution'}
                </strong>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                {roleApiResult.action || 'API ACCESS GRANTED'}
              </span>
            </div>
            <pre style={{
              background: '#090d16',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              color: '#38bdf8',
              margin: 0,
              maxHeight: '180px',
              overflow: 'auto',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {JSON.stringify(roleApiResult, null, 2)}
            </pre>
          </div>
        )}
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
                <option value="FARMER">FARMER (Registered Bhoomi RTC Farmer)</option>
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
              : 'Federated identity minting linking 12-digit Aadhaar e-KYC to unique Karnataka AgriStack ID.'}
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
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{kycResult.verifiedStatus} (Karnataka)</span>
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
