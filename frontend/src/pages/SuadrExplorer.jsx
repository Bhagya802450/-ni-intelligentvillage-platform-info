import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  CloudSun, 
  Bug, 
  Sparkles, 
  Thermometer, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  AlertTriangle,
  MapPin,
  Search,
  Layers,
  Compass,
  Building,
  Sprout,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function SuadrExplorer({ lang = 'en' }) {
  const [activeSubTab, setActiveSubTab] = useState('karnataka');
  const [soilProfiles, setSoilProfiles] = useState([]);
  const [agroZones, setAgroZones] = useState([]);
  const [telemetry, setTelemetry] = useState({});
  const [pests, setPests] = useState([]);
  const [selectedSoil, setSelectedSoil] = useState(null);

  // Karnataka Districts State
  const [karnatakaDistricts, setKarnatakaDistricts] = useState([]);
  const [karnatakaZones, setKarnatakaZones] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const isKn = lang === 'kn';

  // Dynamic Query Form
  const [queryData, setQueryData] = useState({
    district: 'Shimla',
    crop: 'Apple',
    soilPh: '6.2',
    nitrogenLevel: 'Medium'
  });
  const [advisoryResult, setAdvisoryResult] = useState(null);
  const [runningQuery, setRunningQuery] = useState(false);

  useEffect(() => {
    async function loadSuadrData() {
      const sRes = await api.getSoilProfiles();
      if (sRes.success) {
        setSoilProfiles(sRes.data);
        if (sRes.data.length > 0) setSelectedSoil(sRes.data[0]);
      }
      const zRes = await api.getAgroZones();
      if (zRes.success) setAgroZones(zRes.data);
      const tRes = await api.getTelemetry();
      if (tRes.success) setTelemetry(tRes.data);
      const pRes = await api.getPests();
      if (pRes.success) setPests(pRes.data);

      // Load Karnataka 31 Districts & 10 Agro-Climatic Zones
      const kdRes = await api.getKarnatakaDistricts();
      if (kdRes.success) setKarnatakaDistricts(kdRes.data);
      const kzRes = await api.getKarnatakaZones();
      if (kzRes.success) setKarnatakaZones(kzRes.data);
    }
    loadSuadrData();
  }, []);

  const handleRunAdvisory = async (e) => {
    e.preventDefault();
    setRunningQuery(true);
    setAdvisoryResult(null);

    const res = await api.queryAdvisory({
      district: queryData.district,
      crop: queryData.crop,
      soilPh: queryData.soilPh,
      nitrogenLevel: queryData.nitrogenLevel
    });

    setRunningQuery(false);
    if (res.success) {
      setAdvisoryResult(res);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-success">{isKn ? 'SUADR ಎಂಜಿನ್' : 'SUADR Engine'}</span>
              <span className="badge badge-purple">{isKn ? 'ರಾಜ್ಯ ಏಕೀಕೃತ ಡಿಜಿಟಲ್ ಡೇಟಾಬೇಸ್' : 'State Unified Digital Database'}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {isKn ? 'ರಾಜ್ಯ ಏಕೀಕೃತ ಕೃಷಿ ಡಿಜಿಟಲ್ ಡೇಟಾಬೇಸ್ (SUADR)' : 'State Unified Agriculture Digital Database (SUADR)'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              {isKn 
                ? 'ಮಣ್ಣಿನ ಪ್ರೊಫೈಲ್‌ಗಳು, ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಟೆಲಿಮೆಟ್ರಿ, ಕೃಷಿ-ಹವಾಮಾನ ವಲಯಗಳು ಮತ್ತು ಕೀಟ ರೋಗನಿರ್ಣಯವನ್ನು ಸಂಗ್ರಹಿಸುವ ರಾಜ್ಯ-ವ್ಯಾಪಿ ಬೆನ್ನೆಲುಬು.'
                : 'State-wide data backbone storing soil profiles, micro-climate weather telemetry, agro-climatic zones, and pest diagnostics.'}
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setActiveSubTab('karnataka')}
              className={`nav-pill ${activeSubTab === 'karnataka' ? 'active' : ''}`}
              style={{
                background: activeSubTab === 'karnataka' ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(249, 115, 22, 0.25))' : undefined,
                borderColor: activeSubTab === 'karnataka' ? '#eab308' : undefined,
                color: activeSubTab === 'karnataka' ? '#fde047' : undefined
              }}
            >
              <MapPin size={14} color="#eab308" /> {isKn ? 'ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಗಳು (31)' : 'Karnataka Districts (31)'}
            </button>
            <button
              onClick={() => setActiveSubTab('soil')}
              className={`nav-pill ${activeSubTab === 'soil' ? 'active' : ''}`}
            >
              <FlaskConical size={14} /> {isKn ? 'ಮಣ್ಣಿನ ಕಾರ್ಡ್‌ಗಳು' : 'Soil Profiles'}
            </button>
            <button
              onClick={() => setActiveSubTab('zones')}
              className={`nav-pill ${activeSubTab === 'zones' ? 'active' : ''}`}
            >
              <CloudSun size={14} /> {isKn ? 'ಹವಾಮಾನ ಮತ್ತು ವಲಯಗಳು' : 'Climate & Zones'}
            </button>
            <button
              onClick={() => setActiveSubTab('pests')}
              className={`nav-pill ${activeSubTab === 'pests' ? 'active' : ''}`}
            >
              <Bug size={14} /> {isKn ? 'ಕೀಟ ರೋಗನಿರ್ಣಯ' : 'Pest Diagnostic'}
            </button>
            <button
              onClick={() => setActiveSubTab('ai')}
              className={`nav-pill ${activeSubTab === 'ai' ? 'active' : ''}`}
            >
              <Sparkles size={14} /> {isKn ? 'AI ಕೃಷಿ ಸಲಹೆಗಾರ' : 'AI Advisory Engine'}
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 0: Karnataka Districts Directory (31 Districts & 10 Agro-Climatic Zones) */}
      {activeSubTab === 'karnataka' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Banner & Search */}
          <div className="glass-card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(20, 83, 45, 0.2))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-warning" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid #eab308' }}>
                    {isKn ? 'ರಾಜ್ಯ ಕೃಷಿ ಡೈರೆಕ್ಟರಿ' : 'State Agricultural Directory'}
                  </span>
                  <span className="badge badge-success">31 {isKn ? 'ಜಿಲ್ಲೆಗಳು' : 'Districts'}</span>
                  <span className="badge badge-purple">10 {isKn ? 'ಕೃಷಿ-ಹವಾಮಾನ ವಲಯಗಳು' : 'Agro-Climatic Zones'}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {isKn ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯದ 31 ಜಿಲ್ಲೆಗಳ ಕೃಷಿ ಮತ್ತು ಮಣ್ಣಿನ ವಿವರಗಳು' : 'Karnataka State 31 Districts Agricultural & Soil Directory'}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {isKn 
                    ? '4 ಕಂದಾಯ ವಿಭಾಗಗಳು, 10 ಕೃಷಿ-ಹವಾಮಾನ ವಲಯಗಳು, ಮಣ್ಣಿನ ವಿಧಗಳು, ಪ್ರಮುಖ ಬೆಳೆಗಳು, ಮಳೆ ಮತ್ತು ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಗಳು.'
                    : '4 Revenue Divisions, 10 Agro-Climatic Zones, soil classifications, major crops, annual rainfall, and APMC Mandis.'}
                </p>
              </div>

              {/* Division Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Bengaluru Division', 'Mysuru Division', 'Belagavi Division', 'Kalaburagi Division'].map(div => (
                  <button
                    key={div}
                    onClick={() => setSelectedDivision(div)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${selectedDivision === div ? '#eab308' : 'rgba(255,255,255,0.1)'}`,
                      background: selectedDivision === div ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.3)',
                      color: selectedDivision === div ? '#fde047' : '#cbd5e1'
                    }}
                  >
                    {div === 'All' 
                      ? (isKn ? 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು (31)' : 'All Districts (31)')
                      : (isKn 
                          ? div.replace('Division', 'ವಿಭಾಗ').replace('Bengaluru', 'ಬೆಂಗಳೂರು').replace('Mysuru', 'ಮೈಸೂರು').replace('Belagavi', 'ಬೆಳಗಾವಿ').replace('Kalaburagi', 'ಕಲಬುರಗಿ')
                          : div)}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={isKn 
                  ? "ಜಿಲ್ಲೆಯ ಹೆಸರು, ಬೆಳೆ, ಮಣ್ಣು ಅಥವಾ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ (ಉದಾ: Mandya, Ragi, ಮೈಸೂರು, ಅಡಿಕೆ, Belagavi)..." 
                  : "Search district by name, crop, soil, headquarters, or APMC mandi (e.g. Mandya, Ragi, Belagavi, Coffee, Kalaburagi)..."}
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Districts Grid */}
          {(() => {
            const filtered = karnatakaDistricts.filter(d => {
              const matchesDiv = selectedDivision === 'All' || d.division === selectedDivision;
              const q = districtSearch.toLowerCase();
              const matchesSearch = !districtSearch || 
                d.name.toLowerCase().includes(q) ||
                d.name_kn.includes(districtSearch) ||
                d.headquarters.toLowerCase().includes(q) ||
                d.headquarters_kn.includes(districtSearch) ||
                d.soil_type.toLowerCase().includes(q) ||
                d.soil_type_kn.includes(districtSearch) ||
                d.major_crops.some(c => c.toLowerCase().includes(q)) ||
                d.major_crops_kn.some(c => c.includes(districtSearch)) ||
                d.apmc_mandi.toLowerCase().includes(q);
              return matchesDiv && matchesSearch;
            });

            if (filtered.length === 0) {
              return (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {isKn ? 'ಯಾವುದೇ ಜಿಲ್ಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಹುಡುಕಾಟ ಪದವನ್ನು ಬದಲಾಯಿಸಿ.' : 'No Karnataka districts found matching your criteria.'}
                  </p>
                </div>
              );
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {filtered.map(district => (
                  <div
                    key={district.id}
                    className="glass-card"
                    style={{
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255,255,255,0.08)',
                      transition: 'transform 0.2s, border-color 0.2s',
                      background: 'rgba(15, 23, 42, 0.75)'
                    }}
                  >
                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
                              {district.name}
                            </span>
                            <span style={{ fontSize: '0.92rem', color: '#fbbf24', fontWeight: 700 }}>
                              ({district.name_kn})
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            HQ: {district.headquarters} ({district.headquarters_kn}) • {isKn ? district.division_kn : district.division}
                          </span>
                        </div>
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                          {district.id}
                        </span>
                      </div>

                      {/* Zone Badge */}
                      <div style={{ margin: '8px 0 12px 0' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                          <Compass size={11} style={{ display: 'inline', marginRight: '4px' }} />
                          {isKn ? district.agro_climatic_zone_kn : district.agro_climatic_zone}
                        </span>
                      </div>

                      {/* Soil & pH */}
                      <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            <FlaskConical size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {isKn ? 'ಮಣ್ಣಿನ ವಿಧ' : 'Soil Type'}:
                          </span>
                          <span style={{ fontWeight: 600, color: '#34d399' }}>
                            pH {district.soil_ph}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#e2e8f0' }}>
                          {isKn ? district.soil_type_kn : district.soil_type}
                        </div>
                      </div>

                      {/* Major Crops */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          <Sprout size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {isKn ? 'ಪ್ರಮುಖ ಬೆಳೆಗಳು' : 'Major Crops'}:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {(isKn ? district.major_crops_kn : district.major_crops).map((crop, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#6ee7b7',
                                border: '1px solid rgba(16, 185, 129, 0.25)'
                              }}
                            >
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rainfall & Mandi */}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                        <div>
                          <Droplets size={12} style={{ display: 'inline', marginRight: '4px', color: '#38bdf8' }} />
                          <strong>{isKn ? 'ವಾರ್ಷಿಕ ಮಳೆ' : 'Annual Rainfall'}:</strong> {district.annual_rainfall_mm} mm ({district.irrigation_type})
                        </div>
                        <div>
                          <Building size={12} style={{ display: 'inline', marginRight: '4px', color: '#f59e0b' }} />
                          <strong>{isKn ? 'ಪ್ರಮುಖ ಎಪಿಎಂಸಿ' : 'APMC Mandi'}:</strong> {isKn ? district.apmc_mandi_kn : district.apmc_mandi}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div style={{ fontSize: '0.77rem', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                        "{district.key_highlights}"
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: '14px' }}>
                      <button
                        onClick={() => setSelectedDistrict(district)}
                        className="btn btn-outline"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '6px', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#facc15' }}
                      >
                        {isKn ? 'ಸಂಪೂರ್ಣ ಕೃಷಿ ವಿವರ ವೀಕ್ಷಿಸಿ' : 'View Full District Agro Profile'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Modal / Detail Drawer for Selected District */}
          {selectedDistrict && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px'
              }}
              onClick={() => setSelectedDistrict(null)}
            >
              <div
                className="glass-card"
                style={{
                  maxWidth: '650px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '28px',
                  background: '#0f172a',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedDistrict(null)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-warning">{selectedDistrict.id}</span>
                  <span className="badge badge-purple">{selectedDistrict.division}</span>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
                  {selectedDistrict.name} ({selectedDistrict.name_kn})
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  {isKn ? 'ಜಿಲ್ಲಾ ಕೇಂದ್ರ' : 'Headquarters'}: <strong>{selectedDistrict.headquarters} ({selectedDistrict.headquarters_kn})</strong> • Census Code: {selectedDistrict.district_code}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{isKn ? 'ಕೃಷಿ-ಹವಾಮಾನ ವಲಯ' : 'Agro-Climatic Zone'}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>
                      {isKn ? selectedDistrict.agro_climatic_zone_kn : selectedDistrict.agro_climatic_zone}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{isKn ? 'ಮಣ್ಣಿನ ವಿಧ ಮತ್ತು pH' : 'Soil Classification & pH'}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>
                      {isKn ? selectedDistrict.soil_type_kn : selectedDistrict.soil_type} (pH {selectedDistrict.soil_ph})
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{isKn ? 'ವಾರ್ಷಿಕ ಮಳೆ' : 'Annual Rainfall'}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#60a5fa' }}>
                      {selectedDistrict.annual_rainfall_mm} mm
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{isKn ? 'ನೀರಾವರಿ ವ್ಯವಸ್ಥೆ' : 'Irrigation System'}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f59e0b' }}>
                      {selectedDistrict.irrigation_type}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
                    {isKn ? 'ಪ್ರಮುಖ ಬೆಳೆಗಳು (Major Crops)' : 'Major Cultivated Crops'}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedDistrict.major_crops.map((crop, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '16px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {crop} ({selectedDistrict.major_crops_kn[idx] || ''})
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                    {isKn ? 'ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಕೇಂದ್ರ (APMC Mandi Hub)' : 'Primary APMC Wholesale Mandi'}
                  </h4>
                  <div style={{ fontSize: '0.86rem', color: '#fbbf24', padding: '8px 12px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    {selectedDistrict.apmc_mandi} • ({selectedDistrict.apmc_mandi_kn})
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                    {isKn ? 'ಕೃಷಿ ಪ್ರಮುಖಾಂಶಗಳು (Agricultural Highlights)' : 'Agricultural Highlights'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {selectedDistrict.key_highlights}
                  </p>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                  <button onClick={() => setSelectedDistrict(null)} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                    {isKn ? 'ಮುಚ್ಚಿ (Close)' : 'Close Details'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 1: Soil Profiles */}
      {activeSubTab === 'soil' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
              Soil Health Card (SHC) Samples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {soilProfiles.map((soil) => (
                <div
                  key={soil.shcId}
                  onClick={() => setSelectedSoil(soil)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedSoil?.shcId === soil.shcId ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${selectedSoil?.shcId === soil.shcId ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{soil.shcId}</span>
                    <span className="mono-chip">{soil.district} ({soil.tehsil})</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    pH: <strong>{soil.ph}</strong> ({soil.phCategory})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedSoil && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span className="badge badge-info">SHC Test Report</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '4px' }}>
                    {selectedSoil.district} - {selectedSoil.tehsil} Block
                  </h3>
                </div>
                <span className="mono-chip">{selectedSoil.shcId}</span>
              </div>

              {/* Gauges & NPK Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Soil pH</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>{selectedSoil.ph}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{selectedSoil.phCategory}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nitrogen (N)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>{selectedSoil.nitrogenKgHa}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>kg/ha ({selectedSoil.nitrogenRating})</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phosphorus (P)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{selectedSoil.phosphorusKgHa}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>kg/ha ({selectedSoil.phosphorusRating})</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Potassium (K)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>{selectedSoil.potassiumKgHa}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>kg/ha ({selectedSoil.potassiumRating})</div>
                </div>
              </div>

              {/* Agronomy Recommendation */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px'
              }}>
                <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem', marginBottom: '6px' }}>
                  SUADR Agronomy Prescription:
                </div>
                <p style={{ fontSize: '0.88rem', color: '#e5e7eb' }}>
                  {selectedSoil.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Climate & Agro Zones */}
      {activeSubTab === 'zones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Micro-Climate Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {Object.entries(telemetry).map(([district, data]) => (
              <div key={district} className="glass-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>{district}</span>
                  <span className="badge badge-info">{data.condition}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>{data.tempCelsius}°C</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wind: {data.windSpeedKmh} km/h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Humidity: <strong>{data.humidityPercent}%</strong></span>
                  <span>Rain Prob: <strong>{data.rainfallProbPercent}%</strong></span>
                  <span>Frost: <strong style={{ color: data.frostRisk === 'Low' ? '#34d399' : '#fbbf24' }}>{data.frostRisk}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* 4 Agro-Climatic Zones of HP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {agroZones.map((zone) => (
              <div key={zone.zoneId} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="mono-chip" style={{ color: '#34d399' }}>{zone.zoneId}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{zone.altitudeRangeMeters}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  {zone.name}
                </h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <strong>Districts:</strong> {zone.districtsCovered.join(', ')}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#fcd34d' }}>
                  <strong>Major Crops:</strong> {zone.majorCrops.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Pest Diagnostic Knowledge Base */}
      {activeSubTab === 'pests' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {pests.map((p) => (
            <div key={p.pestId} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="badge badge-warning">{p.crop}</span>
                <span className="badge badge-rose" style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af' }}>
                  {p.riskLevel}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                {p.pestName}
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <strong>Symptoms:</strong> {p.symptoms}
              </p>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                  🌱 Natural Farming / SPNF Remedy:
                </div>
                <div style={{ fontSize: '0.82rem', color: '#e5e7eb' }}>
                  {p.naturalRemedy}
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Chemical IPM Alternative:
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {p.chemicalAlternative}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 4: AI Advisory Engine */}
      {activeSubTab === 'ai' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            Interactive SUADR Rule-Based Advisory Generator
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Simulate the AI Agronomy inference engine by selecting region, crop, and soil conditions.
          </p>

          <form onSubmit={handleRunAdvisory} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>District / Climate Zone</label>
              <select
                value={queryData.district}
                onChange={(e) => setQueryData({ ...queryData, district: e.target.value })}
                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
              >
                <option value="Shimla">Shimla (High Hills Wet)</option>
                <option value="Solan">Solan (Mid Hills Sub-Humid)</option>
                <option value="Kangra">Kangra (Sub-Montane)</option>
                <option value="Kullu">Kullu (High Hills)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Target Crop</label>
              <input
                type="text"
                value={queryData.crop}
                onChange={(e) => setQueryData({ ...queryData, crop: e.target.value })}
                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Soil pH</label>
              <input
                type="number"
                step="0.1"
                value={queryData.soilPh}
                onChange={(e) => setQueryData({ ...queryData, soilPh: e.target.value })}
                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={runningQuery}>
                {runningQuery ? 'Processing Rules...' : 'Run SUADR Inference'}
              </button>
            </div>
          </form>

          {advisoryResult && (
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, color: '#34d399' }}>AI Agronomy Advisory Output</span>
                <span className="mono-chip">Confidence: {(advisoryResult.confidenceScore * 100).toFixed(0)}%</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {advisoryResult.agroAdvisories.map((ad, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: '3px solid #10b981' }}>
                    {ad}
                  </div>
                ))}
              </div>

              {advisoryResult.pestAlerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {advisoryResult.pestAlerts.map((pa, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.05)', borderRadius: '4px', borderLeft: '3px solid #f43f5e', color: '#fda4af' }}>
                      {pa}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
