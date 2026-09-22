import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Leaf, 
  TrendingUp, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Activity,
  Layers,
  AlertTriangle,
  Trees,
  Maximize2,
  Calendar,
  Send,
  Radio,
  FileCheck,
  Compass,
  Eye,
  BarChart3,
  Flame,
  Droplets,
  Sprout
} from 'lucide-react';

export default function AiServicePipeline({ farmer, lang = 'en' }) {
  const isKn = lang === 'kn';
  const [activeModule, setActiveModule] = useState('boundary'); // boundary | trees | health | classification | harvest | alerts
  const [loading, setLoading] = useState(false);

  // Module 5: Field Boundary Segmentation State
  const [m5Input, setM5Input] = useState({
    district: 'Mandya',
    survey_no: '142/2A',
    taluk: 'Pandavapura',
    village: 'Hulivana',
    bhoomi_recorded_acres: 4.25
  });
  const [m5Result, setM5Result] = useState(null);

  // Module 6: Tree Counting & Orchard Mapping State
  const [m6Input, setM6Input] = useState({
    orchard_type: 'Coconut (ತೆಂಗು)',
    district: 'Mandya',
    taluk: 'Maddur',
    area_acres: 5.0
  });
  const [m6Result, setM6Result] = useState(null);

  // Module 7: Crop Health Monitoring State
  const [m7Input, setM7Input] = useState({
    district: 'Mandya',
    survey_no: '142/2A',
    crop: 'Sugarcane (ಕಬ್ಬು)'
  });
  const [m7Result, setM7Result] = useState(null);

  // Module 8: Crop Classification & Acreage State
  const [m8Input, setM8Input] = useState({
    district: 'Mandya',
    survey_no: '142/2A'
  });
  const [m8Result, setM8Result] = useState(null);

  // Module 9: Harvesting Progress Tracking State
  const [m9Input, setM9Input] = useState({
    district: 'Mandya',
    crop: 'Sugarcane (ಕಬ್ಬು)'
  });
  const [m9Result, setM9Result] = useState(null);

  // Module 10: Extreme Event Alerts State
  const [m10Data, setM10Data] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  // Fetch default execution on mount
  useEffect(() => {
    runModule5();
    runModule6();
    runModule7();
    runModule8();
    runModule9();
    fetchModule10();
  }, []);

  const runModule5 = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/field-boundary-segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m5Input)
      });
      const data = await res.json();
      setM5Result(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runModule6 = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/tree-counting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m6Input)
      });
      const data = await res.json();
      setM6Result(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runModule7 = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/crop-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m7Input)
      });
      const data = await res.json();
      setM7Result(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runModule8 = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/crop-classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m8Input)
      });
      const data = await res.json();
      setM8Result(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runModule9 = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/harvesting-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m9Input)
      });
      const data = await res.json();
      setM9Result(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchModule10 = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ai/extreme-event-alerts');
      const data = await res.json();
      setM10Data(data);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerDispatchM10 = async (alertId) => {
    setDispatching(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/extreme-event-alerts/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId })
      });
      const data = await res.json();
      setDispatchStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px 32px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={14} /> {isKn ? 'ಉಪಗ್ರಹ ಮತ್ತು ಎಐ ಕೃಷಿ ಸೂಟ್' : 'Satellite & AI Agronomy Suite'}
              </span>
              <span className="badge badge-success">Modules 5 - 10 {isKn ? 'ಸಂಪೂರ್ಣ ಕಾರ್ಯಾಚರಣೆ' : 'Active'}</span>
              <span className="badge badge-warning">ISRO Cartosat-3 + Sentinel-1/2</span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', color: '#f8fafc' }}>
              {isKn ? 'ಕರ್ನಾಟಕ ಉಪಗ್ರಹ ಮತ್ತು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಕೃಷಿ ನಿರ್ವಹಣಾ ಸೂಟ್' : 'Karnataka Earth Observation & AI Agronomy Command Center'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              {isKn 
                ? 'ಕ್ಷೇತ್ರ ಗಡಿ ವಿಭಜನೆ, ಮರಗಳ ಎಣಿಕೆ ಮತ್ತು ತೋಟಗಾರಿಕೆ ಮ್ಯಾಪಿಂಗ್, ಬೆಳೆ ಆರೋಗ್ಯ, ಬೆಳೆ ವರ್ಗೀಕರಣ ಮತ್ತು ವಿಸ್ತೀರ್ಣ, ಕೊಯ್ಲು ಪ್ರಗತಿ ಮತ್ತು ವಿಪತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆ ಎಚ್ಚರಿಕೆಗಳು.'
                : 'Automated Field Boundary Segmentation, Tree Crown Counting, Multi-Temporal Crop Health (NDVI), Crop Classification & Acreage, Harvesting Progress, and Extreme Event Disaster Early Warnings.'}
            </p>
          </div>
        </div>

        {/* 6 Module Switcher Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          {[
            { id: 'boundary', icon: <Compass size={15} />, num: '5', label: isKn ? '೫. ಕ್ಷೇತ್ರ ಗಡಿ ವಿಭಜನೆ' : '5. Field Boundary Segmentation' },
            { id: 'trees', icon: <Trees size={15} />, num: '6', label: isKn ? '೬. ಮರಗಳ ಎಣಿಕೆ & ತೋಟ' : '6. Tree Counting & Orchards' },
            { id: 'health', icon: <Leaf size={15} />, num: '7', label: isKn ? '೭. ಬೆಳೆ ಆರೋಗ್ಯ (NDVI)' : '7. Crop Health Monitoring' },
            { id: 'classification', icon: <Sprout size={15} />, num: '8', label: isKn ? '೮. ಬೆಳೆ ವರ್ಗೀಕರಣ & ವಿಸ್ತೀರ್ಣ' : '8. Crop Classification & Acreage' },
            { id: 'harvest', icon: <BarChart3 size={15} />, num: '9', label: isKn ? '೯. ಕೊಯ್ಲು ಪ್ರಗತಿ ಟ್ರ್ಯಾಕಿಂಗ್' : '9. Harvesting Progress Tracking' },
            { id: 'alerts', icon: <AlertTriangle size={15} />, num: '10', label: isKn ? '೧೦. ವಿಪತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆ' : '10. Extreme Event Alerts' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${activeModule === m.id ? '#38bdf8' : 'rgba(255,255,255,0.12)'}`,
                background: activeModule === m.id ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.25))' : 'rgba(0,0,0,0.3)',
                color: activeModule === m.id ? '#38bdf8' : '#cbd5e1',
                boxShadow: activeModule === m.id ? '0 4px 12px rgba(56, 189, 248, 0.25)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 5: FIELD BOUNDARY SEGMENTATION                                     */}
      {/* ========================================================================= */}
      {activeModule === 'boundary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಜಿಲ್ಲೆ (District)' : 'Karnataka District'}
                </label>
                <select
                  value={m5Input.district}
                  onChange={(e) => setM5Input({ ...m5Input, district: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="Mandya">Mandya (ಮಂಡ್ಯ)</option>
                  <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
                  <option value="Shivamogga">Shivamogga (ಶಿವಮೊಗ್ಗ)</option>
                  <option value="Vijayapura">Vijayapura (ವಿಜಯಪುರ)</option>
                  <option value="Kolar">Kolar (ಕೋಲಾರ)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಸರ್ವೆ ನಂ. (Survey No)' : 'Bhoomi RTC Survey No'}
                </label>
                <input
                  type="text"
                  value={m5Input.survey_no}
                  onChange={(e) => setM5Input({ ...m5Input, survey_no: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', width: '110px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ದಾಖಲಿತ ಎಕರೆ (Bhoomi RTC Acres)' : 'Bhoomi RTC Acres'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={m5Input.bhoomi_recorded_acres}
                  onChange={(e) => setM5Input({ ...m5Input, bhoomi_recorded_acres: Number(e.target.value) })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', width: '90px' }}
                />
              </div>
            </div>

            <button
              onClick={runModule5}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              <Satellite size={16} /> {loading ? (isKn ? 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Segmenting Field...') : (isKn ? 'ಎಐ ಗಡಿ ವಿಭಜನೆ ಚಲಾಯಿಸಿ' : 'Run AI Boundary Segmentation')}
            </button>
          </div>

          {/* Practical Output Canvas & Metrics */}
          {m5Result && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1fr)', gap: '20px' }}>
              {/* Visual Delineation Canvas */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={18} color="#38bdf8" />
                    {isKn ? 'ಉಪಗ್ರಹ ಇಮೇಜರಿ & ಡಿಲಿನಿಟೆಡ್ ಪಾಲಿಗಾನ್' : 'Satellite Imagery & AI Boundary Polygon'}
                  </h4>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    {m5Result.segmentation_output.discrepancy_flag}
                  </span>
                </div>

                {/* SVG Visual Simulation of High-Res Cadastral Boundary */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '320px',
                  background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Grid overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} />

                  <svg width="100%" height="100%" viewBox="0 0 500 320" style={{ position: 'relative', zIndex: 2 }}>
                    {/* Background Field Base */}
                    <polygon
                      points="120,60 380,50 440,210 390,280 150,270 90,170"
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="6 3"
                    />

                    {/* Official Survey Line (Bhoomi Baseline) */}
                    <polygon
                      points="125,65 375,55 432,205 385,275 155,265 95,168"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Vertex Pins */}
                    {[[120,60], [380,50], [440,210], [390,280], [150,270], [90,170]].map(([vx, vy], idx) => (
                      <g key={idx}>
                        <circle cx={vx} cy={vy} r="5" fill="#38bdf8" />
                        <text x={vx + 8} y={vy + 4} fill="#94a3b8" fontSize="10" fontWeight="bold">V{idx + 1}</text>
                      </g>
                    ))}

                    {/* Center Pin & Text */}
                    <circle cx="260" cy="165" r="7" fill="#ef4444" />
                    <text x="260" y="145" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold">
                      {m5Input.survey_no} • {m5Result.segmentation_output.detected_area_acres} Acres
                    </text>
                    <text x="260" y="195" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                      Confidence: {(m5Result.segmentation_output.edge_confidence_score * 100).toFixed(1)}%
                    </text>
                  </svg>

                  {/* Bottom Map Legend */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    color: '#cbd5e1'
                  }}>
                    <span>🟢 AI Delineated Boundary (DeepLabV3+)</span>
                    <span>🟡 Bhoomi Cadastral Baseline</span>
                    <span>📍 Lat: {m5Result.parcel_metadata.centroid.latitude}</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#cbd5e1', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  ✅ <strong>{isKn ? 'ಕಾರ್ಯಸಾಧ್ಯ ಒಳನೋಟ:' : 'Actionable Insight:'}</strong> {m5Result.actionable_insight}
                </div>
              </div>

              {/* Metrics & GeoJSON Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 14px 0', color: '#f8fafc' }}>
                    {isKn ? 'ವಿಭಜನೆ ಮಾಪನಗಳು (Cadastral Area Analytics)' : 'Cadastral Area & Perimeter Analytics'}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>AI Detected Area</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                        {m5Result.segmentation_output.detected_area_acres} <span style={{ fontSize: '0.8rem' }}>Acres</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        ({m5Result.segmentation_output.detected_area_hectares} Hectares)
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Bhoomi RTC Record</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
                        {m5Result.segmentation_output.bhoomi_recorded_acres} <span style={{ fontSize: '0.8rem' }}>Acres</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>
                        Variance: {m5Result.segmentation_output.discrepancy_percent}%
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Field Perimeter</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                        {m5Result.segmentation_output.perimeter_meters} <span style={{ fontSize: '0.8rem' }}>m</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Fencing & Ditch Boundary</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>AI Confidence Score</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7' }}>
                        {(m5Result.segmentation_output.edge_confidence_score * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ResNet-101 Delineator</div>
                    </div>
                  </div>
                </div>

                {/* GeoJSON Feature Box */}
                <div className="glass-card" style={{ padding: '16px 20px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>GeoJSON Feature Output</span>
                    <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>RFC 7946 Standard</span>
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: '#38bdf8',
                    overflowX: 'auto',
                    maxHeight: '130px'
                  }}>
                    {JSON.stringify(m5Result.segmentation_output.geojson, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 6: TREE COUNTING AND ORCHARD MAPPING                               */}
      {/* ========================================================================= */}
      {activeModule === 'trees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ತೋಟಗಾರಿಕೆ ಬೆಳೆ (Orchard Species)' : 'Karnataka Orchard Species'}
                </label>
                <select
                  value={m6Input.orchard_type}
                  onChange={(e) => setM6Input({ ...m6Input, orchard_type: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="Coconut (ತೆಂಗು)">Coconut Palm (ತೆಂಗು) - Mandya / Tumakuru</option>
                  <option value="Arecanut (ಅಡಿಕೆ)">Arecanut Palm (ಅಡಿಕೆ) - Shivamogga / Chikkamagaluru</option>
                  <option value="Mango (ಮಾವು)">Mango (ಮಾವು) - Ramanagara / Kolar</option>
                  <option value="Coffee (ಕಾಫಿ)">Robusta Coffee (ಕಾಫಿ) - Kodagu</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ತೋಟದ ವಿಸ್ತೀರ್ಣ (Acres)' : 'Orchard Area (Acres)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={m6Input.area_acres}
                  onChange={(e) => setM6Input({ ...m6Input, area_acres: Number(e.target.value) })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', width: '90px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಜಿಲ್ಲೆ (District)' : 'District'}
                </label>
                <select
                  value={m6Input.district}
                  onChange={(e) => setM6Input({ ...m6Input, district: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="Mandya">Mandya</option>
                  <option value="Tumakuru">Tumakuru</option>
                  <option value="Shivamogga">Shivamogga</option>
                  <option value="Ramanagara">Ramanagara</option>
                  <option value="Kodagu">Kodagu</option>
                </select>
              </div>
            </div>

            <button
              onClick={runModule6}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #059669, #047857)' }}
            >
              <Trees size={16} /> {loading ? (isKn ? 'ಗಣತಿ ನಡೆಸಲಾಗುತ್ತಿದೆ...' : 'Running Census...') : (isKn ? 'ಎಐ ಮರ ಗಣತಿ ಚಲಾಯಿಸಿ' : 'Run AI Tree Census')}
            </button>
          </div>

          {/* Practical Output Visualization */}
          {m6Result && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: '20px' }}>
              {/* Crown Detection Visualizer */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trees size={18} color="#34d399" />
                    {isKn ? 'ವೈಮಾನಿಕ ಡ್ರೋನ್ ಕ್ಯಾನೋಪಿ ಮತ್ತು ಮರದ ಗುರುತಿಸುವಿಕೆ' : 'Aerial Drone Tree Crown Bounding Detection'}
                  </h4>
                  <span className="badge badge-success">
                    {m6Result.census_results.total_trees_detected} Trees Detected
                  </span>
                </div>

                {/* SVG High-Res Tree Crown Map */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '320px',
                  background: 'radial-gradient(circle at 50% 50%, #14532d 0%, #064e3b 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  overflow: 'hidden'
                }}>
                  <svg width="100%" height="100%" viewBox="0 0 380 320">
                    {/* Render individual detected tree crowns */}
                    {m6Result.census_results.crown_detections_sample.map((tree, idx) => {
                      const strokeColor = tree.health_status === 'HEALTHY_PRODUCTIVE' ? '#4ade80' : tree.health_status === 'MOISTURE_STRESSED' ? '#fbbf24' : '#ef4444';
                      const fillColor = tree.health_status === 'HEALTHY_PRODUCTIVE' ? 'rgba(74, 222, 128, 0.35)' : tree.health_status === 'MOISTURE_STRESSED' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(239, 68, 68, 0.5)';
                      return (
                        <g key={idx}>
                          <circle
                            cx={tree.grid_x}
                            cy={tree.grid_y}
                            r={tree.crown_radius_px}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth="2"
                          />
                          <circle cx={tree.grid_x} cy={tree.grid_y} r="2.5" fill="#fff" />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legend Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.65)',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.74rem'
                  }}>
                    <span style={{ color: '#4ade80' }}>🟢 {m6Result.census_results.health_breakdown.healthy_productive} Healthy</span>
                    <span style={{ color: '#fbbf24' }}>🟡 {m6Result.census_results.health_breakdown.moisture_nutrient_stressed} Stressed</span>
                    <span style={{ color: '#ef4444' }}>🔴 {m6Result.census_results.health_breakdown.senile_or_dead} Senile/Dead</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#cbd5e1', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  🌳 <strong>{isKn ? 'ತೋಟಗಾರಿಕೆ ಸಲಹೆ:' : 'Horticulture Advisory:'}</strong> {m6Result.advisory}
                </div>
              </div>

              {/* Census Analytics Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 14px 0', color: '#f8fafc' }}>
                    {isKn ? 'ತೋಟದ ಜನಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Census Demographics)' : 'Orchard Census & Density Demographics'}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total Trees Counted</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                        {m6Result.census_results.total_trees_detected}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Across {m6Result.orchard_profile.orchard_area_acres} Acres</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Tree Density</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                        {m6Result.census_results.tree_density_per_acre} <span style={{ fontSize: '0.8rem' }}>/ Acre</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Optimal Spacing Standard</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Canopy Coverage</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
                        {m6Result.census_results.canopy_coverage_percent}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Avg Crown: {m6Result.census_results.average_crown_diameter_meters}m</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Vitality Ratio</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a855f7' }}>
                        {m6Result.census_results.health_breakdown.vitality_ratio_percent}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Peak Economic Yield</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Botanical Species:</div>
                    <div style={{ color: '#f8fafc', fontWeight: 700 }}>{m6Result.orchard_profile.botanical_species}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 7: CROP HEALTH MONITORING                                         */}
      {/* ========================================================================= */}
      {activeModule === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಬೆಳೆ (Target Crop)' : 'Karnataka Crop'}
                </label>
                <select
                  value={m7Input.crop}
                  onChange={(e) => setM7Input({ ...m7Input, crop: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="Sugarcane (ಕಬ್ಬು)">Sugarcane (ಕಬ್ಬು Co 86032) - Mandya</option>
                  <option value="Paddy (ಭತ್ತ)">Paddy (ಭತ್ತ Jaya/Sona Masuri) - Mysuru</option>
                  <option value="Ragi (ರಾಗಿ)">Ragi / Finger Millet (ರಾಗಿ ML-365) - Tumakuru</option>
                  <option value="Maize (ಮೆಕ್ಕೆಜೋಳ)">Maize (ಮೆಕ್ಕೆಜೋಳ) - Davanagere</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಸರ್ವೆ ನಂ.' : 'Survey No'}
                </label>
                <input
                  type="text"
                  value={m7Input.survey_no}
                  onChange={(e) => setM7Input({ ...m7Input, survey_no: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', width: '110px' }}
                />
              </div>
            </div>

            <button
              onClick={runModule7}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              <Leaf size={16} /> {loading ? (isKn ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing Health...') : (isKn ? 'ಸೆಂಟಿನೆಲ್-2 NDVI ಸೂಚ್ಯಂಕ ಪಡೆಯಿರಿ' : 'Fetch Sentinel-2 NDVI Indices')}
            </button>
          </div>

          {/* Practical Output View */}
          {m7Result && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1fr)', gap: '20px' }}>
              {/* Seasonal Phenology Curve Chart */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#34d399" />
                    {isKn ? 'ಋತುವಿನ NDVI ಫಿನಾಲಜಿ ಟೈಮ್-ಸೀರೀಸ್ ವಕ್ರರೇಖೆ' : '6-Month Seasonal NDVI Phenology Time Series'}
                  </h4>
                  <span className="badge badge-success">NDVI {m7Result.live_vegetation_indices.ndvi}</span>
                </div>

                {/* SVG Line Graph */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <svg width="100%" height="100%" viewBox="0 0 460 200">
                    {/* Gridlines */}
                    <line x1="40" y1="20" x2="440" y2="20" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />
                    <line x1="40" y1="70" x2="440" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />
                    <line x1="40" y1="120" x2="440" y2="120" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />
                    <line x1="40" y1="170" x2="440" y2="170" stroke="rgba(255,255,255,0.2)" />

                    <text x="15" y="24" fill="#94a3b8" fontSize="10">0.9</text>
                    <text x="15" y="74" fill="#94a3b8" fontSize="10">0.6</text>
                    <text x="15" y="124" fill="#94a3b8" fontSize="10">0.3</text>
                    <text x="15" y="174" fill="#94a3b8" fontSize="10">0.0</text>

                    {/* Area under curve */}
                    <polygon
                      points="60,150 130,110 205,55 280,35 355,45 430,90 430,170 60,170"
                      fill="rgba(16, 185, 129, 0.2)"
                    />

                    {/* Curve line */}
                    <polyline
                      points="60,150 130,110 205,55 280,35 355,45 430,90"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />

                    {/* Stage markers */}
                    {[
                      { x: 60, y: 150, val: '0.24', label: 'May' },
                      { x: 130, y: 110, val: '0.44', label: 'Jun' },
                      { x: 205, y: 55, val: '0.69', label: 'Jul' },
                      { x: 280, y: 35, val: '0.78', label: 'Aug' },
                      { x: 355, y: 45, val: '0.73', label: 'Sep' },
                      { x: 430, y: 90, val: '0.52', label: 'Oct' }
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                          {pt.val}
                        </text>
                        <text x={pt.x} y="188" textAnchor="middle" fill="#94a3b8" fontSize="10">
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div style={{ marginTop: '14px', fontSize: '0.82rem', color: '#cbd5e1', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  🌾 <strong>{isKn ? 'ಕೃಷಿ ಸಲಹೆ:' : 'Agronomic Advisory:'}</strong> {m7Result.agronomic_advisory}
                </div>
              </div>

              {/* Live Spectral Indices Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 14px 0', color: '#f8fafc' }}>
                    {isKn ? 'ಉಪಗ್ರಹ ರೋಹಿತ ಸೂಚ್ಯಂಕಗಳು (Vegetation Indices)' : 'Live Satellite Vegetation Indices (Sentinel-2)'}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>NDVI (Canopy Vigour)</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                        {m7Result.live_vegetation_indices.ndvi}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>Dense Vigorous Growth</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>NDRE (Red Edge Chlorophyll)</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                        {m7Result.live_vegetation_indices.ndre_chlorophyll_index}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#7dd3fc' }}>Optimal Nitrogen Level</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>EVI (Enhanced Vegetation)</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a855f7' }}>
                        {m7Result.live_vegetation_indices.evi_enhanced_vegetation}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Soil Influence Suppressed</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>NDWI (Water Deficit)</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
                        {m7Result.live_vegetation_indices.ndwi_moisture_stress}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>No Water Stress</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Zonal Stress Ratio:</div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${m7Result.zonal_stress_distribution.optimal_vigour_pct}%`, background: '#10b981' }} title="Optimal" />
                      <div style={{ width: `${m7Result.zonal_stress_distribution.mild_chlorosis_pct}%`, background: '#f59e0b' }} title="Mild Chlorosis" />
                      <div style={{ width: `${m7Result.zonal_stress_distribution.moisture_stress_pct}%`, background: '#ef4444' }} title="Moisture Stress" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                      <span style={{ color: '#34d399' }}>Optimal: {m7Result.zonal_stress_distribution.optimal_vigour_pct}%</span>
                      <span style={{ color: '#facc15' }}>Mild: {m7Result.zonal_stress_distribution.mild_chlorosis_pct}%</span>
                      <span style={{ color: '#f87171' }}>Stressed: {m7Result.zonal_stress_distribution.moisture_stress_pct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 8: CROP CLASSIFICATION AND ACREAGE ESTIMATION                      */}
      {/* ========================================================================= */}
      {activeModule === 'classification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ (Karnataka District)' : 'Select Karnataka District'}
                </label>
                <select
                  value={m8Input.district}
                  onChange={(e) => setM8Input({ ...m8Input, district: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="Mandya">Mandya (ಮಂಡ್ಯ - Sugarcane & Paddy)</option>
                  <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ - Sugarcane & Maize)</option>
                  <option value="Kalaburagi">Kalaburagi (ಕಲಬುರಗಿ - Tur Dal Hub)</option>
                  <option value="Shivamogga">Shivamogga (ಶಿವಮೊಗ್ಗ - Arecanut & Paddy)</option>
                  <option value="Vijayapura">Vijayapura (ವಿಜಯಪುರ - Grapes & Pomegranate)</option>
                </select>
              </div>
            </div>

            <button
              onClick={runModule8}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              <Sprout size={16} /> {loading ? (isKn ? 'ವರ್ಗೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Classifying...') : (isKn ? 'ಬೆಳೆ ವರ್ಗೀಕರಣ & ವಿಸ್ತೀರ್ಣ ಚಲಾಯಿಸಿ' : 'Run Crop Classification & Acreage')}
            </button>
          </div>

          {/* Output Display */}
          {m8Result && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.4fr)', gap: '20px' }}>
              {/* Parcel AI Crop Match */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px 0', color: '#f8fafc' }}>
                  {isKn ? 'ಕ್ಷೇತ್ರ ಮಟ್ಟದ AI ಬೆಳೆ ಗುರುತಿಸುವಿಕೆ' : 'Parcel-Level AI Crop Classification'}
                </h4>

                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.76rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI Classified Crop Type
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {m8Result.target_parcel.ai_classified_crop}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <span className="badge badge-success">Confidence: {(m8Result.target_parcel.confidence_probability * 100).toFixed(1)}%</span>
                    <span className="badge badge-purple">Purity: {(m8Result.target_parcel.spectral_purity_index * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  Deep learning classifier utilizes multi-temporal Sentinel-1 C-Band SAR and Sentinel-2 optical phenology signatures to eliminate cloud obscuration.
                </div>
              </div>

              {/* District Acreage Aggregation Table */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    {m8Result.district_macro_acreage.district} District Acreage Estimation
                  </h4>
                  <span className="badge badge-success">
                    {m8Result.district_macro_acreage.total_cropped_area_ha.toLocaleString()} Total Ha
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {m8Result.district_macro_acreage.crops_breakdown.map((cropItem, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>{cropItem.crop}</span>
                        <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.88rem' }}>
                          {cropItem.acreage_ha.toLocaleString()} ha ({cropItem.pct_gross_cropped}%)
                        </span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${cropItem.pct_gross_cropped * 2}%`, height: '100%', background: idx === 0 ? '#10b981' : idx === 1 ? '#38bdf8' : '#f59e0b' }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                        Estimated District Yield: {cropItem.expected_yield_mt.toLocaleString()} MT
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 9: HARVESTING PROGRESS TRACKING                                    */}
      {/* ========================================================================= */}
      {activeModule === 'harvest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಜಿಲ್ಲೆ (District)' : 'District'}
                </label>
                <select
                  value={m9Input.district}
                  onChange={(e) => setM9Input({ ...m9Input, district: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="Mandya">Mandya (ಮಂಡ್ಯ)</option>
                  <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
                  <option value="Kalaburagi">Kalaburagi (ಕಲಬುರಗಿ)</option>
                  <option value="Davanagere">Davanagere (ದಾವಣಗೆರೆ)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isKn ? 'ಬೆಳೆ (Crop)' : 'Crop'}
                </label>
                <input
                  type="text"
                  value={m9Input.crop}
                  onChange={(e) => setM9Input({ ...m9Input, crop: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', width: '180px' }}
                />
              </div>
            </div>

            <button
              onClick={runModule9}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              <BarChart3 size={16} /> {loading ? (isKn ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Checking Harvest...') : (isKn ? 'ಕೊಯ್ಲು ಪ್ರಗತಿ ಪರಿಶೀಲಿಸಿ' : 'Query Harvest Progress')}
            </button>
          </div>

          {/* Practical Output */}
          {m9Result && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1fr)', gap: '20px' }}>
              {/* Progress Visualizer */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    {m9Result.data.district} {m9Result.data.monitored_crop} Harvest Completion
                  </h4>
                  <span className="badge badge-success" style={{ fontSize: '0.82rem' }}>
                    {m9Result.data.harvest_progress_pct}% Completed
                  </span>
                </div>

                {/* Big Progress Bar */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ height: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${m9Result.data.harvest_progress_pct}%`, background: 'linear-gradient(90deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                      {m9Result.data.harvest_progress_pct}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                    <span>{m9Result.data.harvested_area_ha.toLocaleString()} ha Harvested</span>
                    <span>{m9Result.data.standing_crop_ha.toLocaleString()} ha Standing</span>
                  </div>
                </div>

                {/* Stages Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {m9Result.data.field_stage_breakdown.map((st, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', borderTop: `3px solid ${st.color}` }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.stage}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: st.color, marginTop: '2px' }}>
                        {st.pct}%
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  📡 <strong>Sentinel-1 SAR Evidence:</strong> {m9Result.data.satellite_sar_evidence.interpretation} (Backscatter Drop: {m9Result.data.satellite_sar_evidence.backscatter_drop_db} dB)
                </div>
              </div>

              {/* Velocity & Operational Metrics */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 14px 0', color: '#f8fafc' }}>
                  Harvest Operations & Logistics Velocity
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Daily Harvest Velocity</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                      {m9Result.data.daily_harvest_velocity_ha} <span style={{ fontSize: '0.8rem' }}>ha/day</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Peak Mechanical Reaping</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Estimated Completion</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
                      {m9Result.data.estimated_days_to_completion} <span style={{ fontSize: '0.8rem' }}>Days</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Normal Seasonal Timeline</div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 700, marginBottom: '2px' }}>
                    🔥 Stubble Burning & Biowaste Risk
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#f8fafc' }}>
                    Risk Level: <strong>LOW</strong>. Karnataka Agriculture Department mulching incentive and co-gen sugar mill biomass collection in effect.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 10: EXTREME EVENT ALERTS (Disaster Dashboard)                      */}
      {/* ========================================================================= */}
      {activeModule === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div className="glass-card" style={{ padding: '18px 24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.8))', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-danger">
                    <Radio size={14} /> LIVE EARLY WARNING
                  </span>
                  <span className="badge badge-warning">KSNDMC Telemetry Linked</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  {isKn ? 'ಕರ್ನಾಟಕ ನೈಸರ್ಗಿಕ ವಿಕೋಪ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆ ನಿಯಂತ್ರಣ ಕೊಠಡಿ' : 'Karnataka State Natural Disaster Monitoring & Early Warning Console'}
                </h3>
              </div>
            </div>
          </div>

          {/* Broadcast confirmation toast */}
          {dispatchStatus && (
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', padding: '12px 20px', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.85rem' }}>
              🔔 <strong>Emergency Broadcast Sent:</strong> {dispatchStatus.message} Recipient Farmers Contacted: {dispatchStatus.broadcast_details.recipients_contacted.toLocaleString()} via {dispatchStatus.broadcast_details.telecom_provider} (Delivery Rate: {dispatchStatus.broadcast_details.delivery_rate}).
            </div>
          )}

          {/* Alerts Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {(m10Data?.alerts || []).map(alert => (
              <div
                key={alert.alert_id}
                className="glass-card"
                style={{
                  padding: '20px',
                  border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.5)' : alert.severity === 'WARNING' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
                  background: 'rgba(15, 23, 42, 0.85)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-danger' : alert.severity === 'WARNING' ? 'badge-warning' : 'badge-primary'}`}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    ID: {alert.alert_id}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                  {alert.event_type}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginBottom: '10px' }}>
                  {alert.title_kn}
                </div>

                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <strong>Trigger Criteria: </strong>{alert.trigger_criteria}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '12px' }}>
                  <span>Affected: {alert.affected_districts.join(', ')}</span>
                  <span style={{ color: '#f87171', fontWeight: 700 }}>
                    ~{alert.affected_farmers_estimate.toLocaleString()} Farmers
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 10px', borderRadius: '6px' }}>
                  🛡️ <strong>Protocol: </strong>{alert.action_protocol}
                </div>

                <button
                  onClick={() => triggerDispatchM10(alert.alert_id)}
                  disabled={dispatching}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} /> {isKn ? 'ತುರ್ತು SMS/IVR ಮುನ್ನೆಚ್ಚರಿಕೆ ಪ್ರಸಾರ ಮಾಡಿ' : 'Dispatch Emergency SMS & IVR Broadcast'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
