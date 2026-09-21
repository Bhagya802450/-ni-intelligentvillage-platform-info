import React, { useState } from 'react';
import { Search, Plus, MapPin, CheckCircle, Layers, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function RegistryView({ farmers, onRefreshData }) {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [activeFarmer, setActiveFarmer] = useState(farmers[0] || null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newFarmerData, setNewFarmerData] = useState({
    name: '',
    phone: '',
    district: 'Shimla',
    tehsil: 'Theog',
    village: '',
    aadhaarNumber: '',
    areaBigha: '6.5',
    primaryCrop: 'Apple & Peas',
    khasraNo: '310/2'
  });
  const [registering, setRegistering] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const filteredFarmers = farmers.filter(f => {
    const matchDist = selectedDistrict === 'All' || f.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchQ = !search || 
      f.name.toLowerCase().includes(search.toLowerCase()) || 
      f.agriStackId.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search);
    return matchDist && matchQ;
  });

  const handleRegisterFarmer = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setStatusMsg('');

    const res = await api.registerFarmer({
      name: newFarmerData.name,
      phone: newFarmerData.phone,
      district: newFarmerData.district,
      tehsil: newFarmerData.tehsil,
      village: newFarmerData.village,
      aadhaarNumber: newFarmerData.aadhaarNumber,
      category: 'Small & Marginal',
      naturalFarmingPractitioner: true,
      initialLand: {
        khasraNo: newFarmerData.khasraNo,
        khatauniNo: '12',
        areaBigha: newFarmerData.areaBigha,
        irrigationType: 'Micro-Drip & Rainfed',
        primaryCrop: newFarmerData.primaryCrop
      }
    });

    setRegistering(false);
    if (res.success) {
      setStatusMsg(`Registered successfully! AgriStack ID assigned: ${res.data.agriStackId}`);
      setShowRegisterModal(false);
      setActiveFarmer(res.data);
      if (onRefreshData) onRefreshData();
    } else {
      setStatusMsg(`Error: ${res.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-success">HP-ASN Master Registry</span>
            <span className="badge badge-info">AgriStack Integration</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Unified Farmer Database & Land Registry (HimBhoomi)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Single master database holding every HP farmer's profile, cadastral survey parcel (Khasra), and crop records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRegisterModal(true)}
          >
            <Plus size={16} /> Enroll New Farmer
          </button>
        </div>
      </div>

      {/* Main layout: Master List on left, Parcel Detail on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Farmer Directory */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name, AgriStack ID, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All Districts</option>
              <option value="Shimla">Shimla</option>
              <option value="Solan">Solan</option>
              <option value="Kangra">Kangra</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
            {filteredFarmers.map((f) => {
              const isSelected = activeFarmer?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setActiveFarmer(f)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#34d399' : '#fff' }}>
                      {f.name}
                    </span>
                    <span className="mono-chip" style={{ fontSize: '0.72rem' }}>
                      {f.district}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>AgriStack: <strong style={{ color: '#7dd3fc' }}>{f.agriStackId}</strong></span>
                    <span>{f.landParcels?.length || 0} parcels</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Village {f.village}, Tehsil {f.tehsil} • {f.phone}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Farmer Detail & Cadastral GIS Viewer */}
        {activeFarmer ? (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-success">HimBhoomi Cadastral Record</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                  {activeFarmer.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  S/O {activeFarmer.fatherName} • {activeFarmer.category} • DOB: {activeFarmer.dob}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="mono-chip" style={{ fontSize: '0.8rem', color: '#34d399' }}>
                  {activeFarmer.agriStackId}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Aadhaar: {activeFarmer.aadhaarHash}
                </div>
              </div>
            </div>

            {/* Bank details bar */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Direct Benefit Bank: </span>
                <strong>{activeFarmer.bankDetails?.bankName}</strong> ({activeFarmer.bankDetails?.accountNo})
              </div>
              <span className="badge badge-success">DBT ACTIVE</span>
            </div>

            {/* Land Parcels Cadastral Viewer */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#34d399" /> Registered Land Parcels (Khasra Cadastral Records)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeFarmer.landParcels?.map((parcel, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                          Khasra No. {parcel.khasraNo}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                          (Khatauni #{parcel.khatauniNo})
                        </span>
                      </div>
                      <span className="mono-chip">{parcel.parcelId}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Area:</span>
                        <div style={{ fontWeight: 600 }}>{parcel.areaBigha} Bighas ({parcel.areaHectares} Ha)</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Primary Crop:</span>
                        <div style={{ fontWeight: 600, color: '#fcd34d' }}>{parcel.primaryCrop}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Irrigation:</span>
                        <div style={{ fontWeight: 600 }}>{parcel.irrigationType}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Soil Card ID:</span>
                        <div className="mono-chip" style={{ color: '#34d399' }}>{parcel.soilHealthId}</div>
                      </div>
                    </div>

                    {/* Cadastral Geo-Coordinates */}
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)'
                    }}>
                      <span>Cadastral Centroid: Lat {parcel.coordinates?.lat}, Lng {parcel.coordinates?.lng}</span>
                      <span style={{ color: '#34d399' }}>✔ HimBhoomi Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
            <p>Select a farmer to inspect records.</p>
          </div>
        )}
      </div>

      {/* Enroll Farmer Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              Enroll Farmer into Unified Farmer Database (AgriStack)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Generates AgriStack ID and links to HimBhoomi revenue cadastral records.
            </p>

            <form onSubmit={handleRegisterFarmer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farmer Full Name</label>
                  <input
                    required
                    type="text"
                    value={newFarmerData.name}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chand"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mobile Number</label>
                  <input
                    required
                    type="text"
                    value={newFarmerData.phone}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, phone: e.target.value })}
                    placeholder="+91 98160 00000"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>District</label>
                  <select
                    value={newFarmerData.district}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, district: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  >
                    <option value="Shimla">Shimla</option>
                    <option value="Solan">Solan</option>
                    <option value="Kangra">Kangra</option>
                    <option value="Kullu">Kullu</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Village</label>
                  <input
                    required
                    type="text"
                    value={newFarmerData.village}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, village: e.target.value })}
                    placeholder="e.g. Rohru Rural"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aadhaar (Last 4 or 12 digits)</label>
                  <input
                    type="text"
                    value={newFarmerData.aadhaarNumber}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, aadhaarNumber: e.target.value })}
                    placeholder="e.g. 5566"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Khasra Number (HimBhoomi)</label>
                  <input
                    type="text"
                    value={newFarmerData.khasraNo}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, khasraNo: e.target.value })}
                    placeholder="e.g. 112/5"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Land Area (Bighas)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFarmerData.areaBigha}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, areaBigha: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Primary Crop</label>
                  <input
                    type="text"
                    value={newFarmerData.primaryCrop}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, primaryCrop: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={registering}>
                  {registering ? 'Validating AgriStack...' : 'Complete Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
