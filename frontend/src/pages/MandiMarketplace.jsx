import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, ArrowUpRight, Filter, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function MandiMarketplace() {
  const [rates, setRates] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  useEffect(() => {
    async function loadMandiData() {
      const rRes = await api.getMandiRates();
      if (rRes.success) setRates(rRes.data);
      const sRes = await api.getMandiStats();
      if (sRes.success) setStats(sRes.data);
    }
    loadMandiData();
  }, []);

  const filteredRates = rates.filter(r => 
    selectedDistrict === 'All' || r.district.toLowerCase() === selectedDistrict.toLowerCase()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-success">APMC Live Feeds</span>
              <span className="badge badge-info">e-NAM Connected</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Karnataka APMC Mandi Spot Rates
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Real-time daily modal prices from major APMC markets and agricultural trade hubs across Karnataka districts.
            </p>
          </div>

          {/* District Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
            >
              <option value="All">All Karnataka Mandis (ಎಲ್ಲಾ ಮಾರುಕಟ್ಟೆಗಳು)</option>
              <option value="Mandya">Mandya APMC (Jaggery & Sugarcane)</option>
              <option value="Mysuru">Mysuru Bandipalya APMC (Paddy)</option>
              <option value="Haveri">Byadgi APMC (Red Chilli GI Hub)</option>
              <option value="Shivamogga">Shivamogga APMC (Arecanut Rashi)</option>
              <option value="Kalaburagi">Kalaburagi Nehru Gunj (Tur Dal GI)</option>
              <option value="Vijayapura">Vijayapura APMC (Raisins / Bedana)</option>
              <option value="Kolar">Kolar APMC (Tomato Hub)</option>
              <option value="Belagavi">Belagavi APMC Central Yard (Maize & Veg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Highlights Strip */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOP GAINER TODAY</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              {stats.topGainer}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PREMIUM CASH CROP</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {stats.highestModalPriceCommodity}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>REPORTING MARKETS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              {stats.totalMarketsReporting} Major Karnataka APMC Mandis
            </div>
          </div>
        </div>
      )}

      {/* Mandi Rates Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
          Commodity Price Bulletin ({new Date().toISOString().split('T')[0]})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Market / District</th>
                <th style={{ padding: '10px' }}>Commodity / Variety</th>
                <th style={{ padding: '10px' }}>Min Price (₹/Qtl)</th>
                <th style={{ padding: '10px' }}>Max Price (₹/Qtl)</th>
                <th style={{ padding: '10px' }}>Modal Price</th>
                <th style={{ padding: '10px' }}>Market Trend</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate) => (
                <tr key={rate.mandiId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{rate.marketName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>District {rate.district}</div>
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#38bdf8' }}>{rate.commodity}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rate.variety}</div>
                  </td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>
                    ₹{rate.minPricePerQuintal?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>
                    ₹{rate.maxPricePerQuintal?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                      ₹{rate.modalPricePerQuintal?.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '4px' }}>/ Qtl</span>
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                      <TrendingUp size={12} /> {rate.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
