import React, { useState } from 'react';
import { 
  Satellite, 
  Leaf, 
  Bug, 
  TrendingUp, 
  ArrowDown, 
  Database, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Activity,
  Layers
} from 'lucide-react';

export default function AiServicePipeline({ farmer, lang }) {
  const [activeFeature, setActiveFeature] = useState('satellite');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runPipeline = async (feature) => {
    setActiveFeature(feature);
    setLoading(true);
    setResult(null);

    let endpoint = '/api/ml/satellite-analysis';
    let body = {};

    if (feature === 'satellite') {
      endpoint = '/api/ml/satellite-analysis';
      body = { khasra_no: "412/12", latitude: 31.1215, longitude: 77.5321, crop: "Apple" };
    } else if (feature === 'classification') {
      endpoint = '/api/ml/crop-classification';
      body = { altitude_meters: 1950, district: "Shimla" };
    } else if (feature === 'disease') {
      endpoint = '/api/ml/disease-detection';
      body = { crop: "Apple", humidity_percent: 82, temperature_c: 19.5 };
    } else if (feature === 'prediction') {
      endpoint = '/api/ml/prediction';
      body = { area_bigha: 14.5, crop: "Apple", soil_ph: 6.2 };
    }

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-purple">
                <Cpu size={14} /> Python AI Microservice Pipeline
              </span>
              <span className="badge badge-success">Redis Queue Orchestrated</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {lang === 'kn' ? 'ಎಐ ಮೈಕ್ರೋ-ಸರ್ವಿಸ್ ಪೈಪ್‌ಲೈನ್' : 'Python AI & Satellite Service Pipeline'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              End-to-end execution flow: React ➔ Frappe API ➔ Redis Queue ➔ Python AI Service (Satellite, Classification, Disease & Prediction).
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Architecture Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        
        {/* Tier 1: React */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid #38bdf8',
          padding: '10px 24px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          color: '#38bdf8',
          fontSize: '0.95rem'
        }}>
          ⚡ React Web / Mobile Client
        </div>

        <div style={{ color: '#38bdf8', fontSize: '0.9rem' }}>▼ REST HTTPS</div>

        {/* Tier 2: Frappe API */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          padding: '12px 32px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          color: '#34d399',
          fontSize: '1rem',
          textAlign: 'center'
        }}>
          ⚙️ Frappe Backend API Gateway
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>🐘 PostgreSQL (Master DB)</span>
            <span>⚡ Redis (Hot Cache)</span>
            <span>📨 Redis Queue (Async Dispatcher)</span>
          </div>
        </div>

        <div style={{ color: '#c084fc', fontSize: '0.9rem' }}>▼ Delegated via Redis Queue</div>

        {/* Tier 3: Python AI Service */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.12)',
          border: '1px solid #a855f7',
          borderRadius: 'var(--radius-md)',
          padding: '16px 24px',
          maxWidth: '850px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#e879f9', marginBottom: '12px' }}>
            🐍 Python AI Microservice Engine
          </div>

          {/* 4 Feature Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <button
              onClick={() => runPipeline('satellite')}
              className={`btn ${activeFeature === 'satellite' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '10px' }}
            >
              <Satellite size={15} /> 1. Satellite Analysis
            </button>

            <button
              onClick={() => runPipeline('classification')}
              className={`btn ${activeFeature === 'classification' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '10px' }}
            >
              <Leaf size={15} /> 2. Crop Classification
            </button>

            <button
              onClick={() => runPipeline('disease')}
              className={`btn ${activeFeature === 'disease' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '10px' }}
            >
              <Bug size={15} /> 3. Disease Detection
            </button>

            <button
              onClick={() => runPipeline('prediction')}
              className={`btn ${activeFeature === 'prediction' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '10px' }}
            >
              <TrendingUp size={15} /> 4. Yield Prediction
            </button>
          </div>
        </div>

      </div>

      {/* Live Pipeline Execution Output */}
      {loading ? (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: '#38bdf8' }}>Dispatching task through Redis Queue to Python AI Engine...</p>
        </div>
      ) : result && (
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-success">
                <CheckCircle2 size={13} /> {result.pipeline}
              </span>
              <span className="mono-chip">{result.queue_job_id}</span>
            </div>
            <span className="mono-chip" style={{ color: '#fcd34d' }}>Feature: {result.feature}</span>
          </div>

          {/* Dynamic Payload Render based on feature */}
          {activeFeature === 'satellite' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span>Sentinel-2 Multispectral NDVI Score:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{result.ndvi_index}</span>
              </div>
              <div><strong>Khasra Parcel:</strong> {result.khasra_no} (Lat {result.coordinates?.lat}, Lng {result.coordinates?.lng})</div>
              <div><strong>Canopy Status:</strong> <span style={{ color: '#38bdf8', fontWeight: 600 }}>{result.canopy_classification}</span></div>
              <div><strong>Moisture Deficit:</strong> <span style={{ color: '#fcd34d' }}>{result.soil_moisture_stress}</span></div>
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', color: '#e5e7eb' }}>
                <strong>Agronomy Action:</strong> {result.ai_recommendation}
              </div>
            </div>
          )}

          {activeFeature === 'classification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div><strong>District & Altitude:</strong> {result.district} ({result.altitude_m} meters)</div>
              <div><strong>Recommended Primary Crop:</strong> <span style={{ color: '#34d399', fontWeight: 700, fontSize: '1.05rem' }}>{result.recommended_primary_crop}</span></div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '8px' }}>
                {result.suitability_ranking?.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{c.crop}</div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>Suitability: {c.suitability}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{c.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeFeature === 'disease' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div><strong>Crop Analyzed:</strong> {result.target_crop}</div>
              <div><strong>Diagnosed Pathogen:</strong> <span style={{ color: '#f43f5e', fontWeight: 700 }}>{result.diagnosed_pathogen}</span></div>
              <div><strong>Infection Risk Level:</strong> <span className="badge badge-rose" style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af' }}>{result.infection_risk}</span></div>
              <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.08)', borderLeft: '3px solid #f43f5e', color: '#fda4af' }}>
                <strong>Prescribed IPM / Organic Treatment:</strong> {result.prescribed_remedy}
              </div>
            </div>
          )}

          {activeFeature === 'prediction' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PREDICTED HARVEST YIELD</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>{result.predicted_yield_quintals} Qtl</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Across {result.area_bighas} Bighas</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ESTIMATED MANDI REVENUE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>₹{result.estimated_mandi_revenue_inr?.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Based on APMC Modal Spot Rates</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
