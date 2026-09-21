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
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export default function SuadrExplorer({ lang = 'en' }) {
  const [activeSubTab, setActiveSubTab] = useState('soil');
  const [soilProfiles, setSoilProfiles] = useState([]);
  const [agroZones, setAgroZones] = useState([]);
  const [telemetry, setTelemetry] = useState({});
  const [pests, setPests] = useState([]);
  const [selectedSoil, setSelectedSoil] = useState(null);

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
