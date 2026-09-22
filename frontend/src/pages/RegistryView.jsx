import React, { useState } from 'react';
import { Search, Plus, MapPin, CheckCircle, Layers, FileSpreadsheet, ShieldAlert, ShieldCheck, Map, GitFork, Sprout, Wheat, PlusCircle, Activity, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function RegistryView({ farmers, onRefreshData, lang = 'en' }) {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [activeFarmer, setActiveFarmer] = useState(farmers[0] || null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newFarmerData, setNewFarmerData] = useState({
    name: '',
    phone: '',
    district: 'Mandya',
    tehsil: 'Pandavapura',
    village: 'Hulivana',
    aadhaarNumber: '',
    areaBigha: '4.25',
    primaryCrop: 'Sugarcane (Co 86032)',
    khasraNo: '142/2A'
  });
  const [registering, setRegistering] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [verifyingParcelId, setVerifyingParcelId] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loadingGeoJson, setLoadingGeoJson] = useState(false);

  // Hierarchy & Crop modal states
  const [showHierarchyTree, setShowHierarchyTree] = useState(true);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [selectedParcelForCrop, setSelectedParcelForCrop] = useState('');
  const [cropFormData, setCropFormData] = useState({
    crop_name: 'Sugarcane',
    variety: 'Co 86032',
    season: 'Perennial',
    area_bigha: '4.25',
    crop_stage: 'Vegetative',
    health_status: 'Optimal',
    estimated_yield_quintals: '35.0',
    ndvi_score: '0.82'
  });
  const [addingCrop, setAddingCrop] = useState(false);

  const isKn = lang === 'kn';

  const filteredFarmers = (farmers || []).filter(f => {
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
      setStatusMsg(isKn ? `ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ! ಅಗ್ರಿಸ್ಟಾಕ್ ಐಡಿ: ${res.data.agriStackId}` : `Registered successfully! AgriStack ID assigned: ${res.data.agriStackId}`);
      setShowRegisterModal(false);
      setActiveFarmer(res.data);
      if (onRefreshData) onRefreshData();
    } else {
      setStatusMsg(`Error: ${res.message}`);
    }
  };

  const handleVerifyParcel = async (parcelId) => {
    if (!activeFarmer) return;
    setVerifyingParcelId(parcelId);
    try {
      const res = await api.verifyLandParcel(activeFarmer.id, parcelId, {
        verifiedBy: "Ramesh Chand Sharma (PAT-HP-301)",
        officerRemarks: "Cadastral boundaries cross-referenced with HimBhoomi Jamabandi."
      });
      if (res.success) {
        // Update local activeFarmer state
        setActiveFarmer(prev => ({
          ...prev,
          landParcels: prev.landParcels.map(p => p.parcelId === parcelId ? res.parcel : p)
        }));
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error("Error verifying land parcel:", err);
    } finally {
      setVerifyingParcelId(null);
    }
  };

  const handleFetchGeoJson = async () => {
    if (!activeFarmer) return;
    setLoadingGeoJson(true);
    try {
      const res = await api.getCadastralGeojson(activeFarmer.id);
      setGeoJsonData(res);
    } catch (err) {
      console.error("Error fetching cadastral GeoJSON:", err);
    } finally {
      setLoadingGeoJson(false);
    }
  };

  const handleOpenAddCrop = (parcelId) => {
    setSelectedParcelForCrop(parcelId);
    setShowAddCropModal(true);
  };

  const handleAddCropSubmit = async (e) => {
    e.preventDefault();
    if (!activeFarmer || !selectedParcelForCrop) return;
    setAddingCrop(true);
    try {
      const res = await api.addFarmerCrop(activeFarmer.id, {
        parcelId: selectedParcelForCrop,
        crop_name: cropFormData.crop_name,
        variety: cropFormData.variety,
        season: cropFormData.season,
        area_bigha: cropFormData.area_bigha,
        crop_stage: cropFormData.crop_stage,
        health_status: cropFormData.health_status,
        estimated_yield_quintals: cropFormData.estimated_yield_quintals,
        ndvi_score: cropFormData.ndvi_score
      });

      if (res.success) {
        // Update activeFarmer local state with newly added crop
        setActiveFarmer(prev => {
          const updatedParcels = (prev.landParcels || []).map(p => {
            if (p.parcelId === selectedParcelForCrop) {
              const currentCrops = p.crops || [];
              return { ...p, crops: [...currentCrops, res.crop] };
            }
            return p;
          });
          return { ...prev, landParcels: updatedParcels };
        });
        setShowAddCropModal(false);
        if (onRefreshData) onRefreshData();
      } else {
        alert(res.message || "Failed to add crop.");
      }
    } catch (err) {
      console.error("Error adding crop:", err);
    } finally {
      setAddingCrop(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-success">
              {isKn ? 'HP-ASN ಪ್ರಮುಖ ರಿಜಿಸ್ಟ್ರಿ' : 'HP-ASN Master Registry'}
            </span>
            <span className="badge badge-info">
              {isKn ? 'ಅಗ್ರಿಸ್ಟಾಕ್ ಸಂಯೋಜನೆ' : 'AgriStack Integration'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {isKn ? 'ಏಕೀಕೃತ ರೈತ ಡೇಟಾಬೇಸ್ ಮತ್ತು ಭೂಮಿ ನೋಂದಣಿ (ಹಿಂಭೂಮಿ)' : 'Unified Farmer Database & Land Registry (HimBhoomi)'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            {isKn 
              ? 'ಹಿಮಾಚಲ ಪ್ರದೇಶದ ಪ್ರತಿಯೊಬ್ಬ ರೈತರ ವಿವರ, ಖಸ್ರಾ ಸಮೀಕ್ಷಾ ಪಾರ್ಸೆಲ್ ಮತ್ತು ಬೆಳೆ ದಾಖಲೆಗಳ ಏಕೈಕ ಮಾಸ್ಟರ್ ಡೇಟಾಬೇಸ್.' 
              : "Single master database holding every HP farmer's profile, cadastral survey parcel (Khasra), and crop records."}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRegisterModal(true)}
          >
            <Plus size={16} /> {isKn ? 'ಹೊಸ ರೈತರನ್ನು ನೋಂದಾಯಿಸಿ' : 'Enroll New Farmer'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="glass-card" style={{ padding: '12px 18px', borderLeft: '4px solid var(--primary)', color: '#34d399', fontSize: '0.85rem' }}>
          {statusMsg}
        </div>
      )}

      {/* Main layout: Master List on left, Parcel Detail on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Farmer Directory */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder={isKn ? 'ಹೆಸರು, ಅಗ್ರಿಸ್ಟಾಕ್ ಐಡಿ ಅಥವಾ ಫೋನ್ ಮೂಲಕ ಹುಡುಕಿ...' : 'Search by name, AgriStack ID, or phone...'}
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
              <option value="All">{isKn ? 'ಎಲ್ಲಾ ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಗಳು (31)' : 'All Karnataka Districts (31)'}</option>
              <option value="Mandya">Mandya (ಮಂಡ್ಯ)</option>
              <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
              <option value="Kalaburagi">Kalaburagi (ಕಲಬುರಗಿ)</option>
              <option value="Mysuru">Mysuru (ಮೈಸೂರು)</option>
              <option value="Shivamogga">Shivamogga (ಶಿವಮೊಗ್ಗ)</option>
              <option value="Vijayapura">Vijayapura (ವಿಜಯಪುರ)</option>
              <option value="Kolar">Kolar (ಕೋಲಾರ)</option>
              <option value="Davanagere">Davanagere (ದಾವಣಗೆರೆ)</option>
              <option value="Tumakuru">Tumakuru (ತುಮಕೂರು)</option>
              <option value="Ballari">Ballari (ಬಳ್ಳಾರಿ)</option>
              <option value="Kodagu">Kodagu (ಕೊಡಗು)</option>
              <option value="Udupi">Udupi (ಉಡುಪಿ)</option>
              <option value="Hassan">Hassan (ಹಾಸನ)</option>
              <option value="Raichur">Raichur (ರಾಯಚೂರು)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
            {filteredFarmers.map((f) => {
              const isSelected = activeFarmer?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    setActiveFarmer(f);
                    setGeoJsonData(null);
                  }}
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
                    <span>{f.landParcels?.length || 0} {isKn ? 'ಪಾರ್ಸೆಲ್‌ಗಳು' : 'parcels'}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {isKn ? 'ಗ್ರಾಮ' : 'Village'} {f.village}, {isKn ? 'ತಹಸಿಲ್' : 'Tehsil'} {f.tehsil} • {f.phone}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Farmer Detail & Cadastral GIS Viewer */}
        {activeFarmer ? (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span className="badge badge-success">
                  {isKn ? 'ಹಿಂಭೂಮಿ ಕ್ಯಾಡಸ್ಟ್ರಲ್ ದಾಖಲೆ' : 'HimBhoomi Cadastral Record'}
                </span>
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
                  {isKn ? 'ಆಧಾರ್' : 'Aadhaar'}: {activeFarmer.aadhaarHash}
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
                <span style={{ color: 'var(--text-muted)' }}>{isKn ? 'ನೇರ ಲಾಭ ವರ್ಗಾವಣೆ ಬ್ಯಾಂಕ್: ' : 'Direct Benefit Bank: '}</span>
                <strong>{activeFarmer.bankDetails?.bankName}</strong> ({activeFarmer.bankDetails?.accountNo})
              </div>
              <span className="badge badge-success">{isKn ? 'ಡಿಬಿಟಿ ಸಕ್ರಿಯ' : 'DBT ACTIVE'}</span>
            </div>

            {/* Relational Hierarchy: Farmer ├── Land └── Crop */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitFork size={18} color="#34d399" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#34d399' }}>
                    {isKn ? 'ಡೇಟಾ ಮಾಡೆಲ್ ಶ್ರೇಣಿ: Farmer ├── Land └── Crop' : 'Relational Data Model Hierarchy: Farmer ├── Land └── Crop'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHierarchyTree(!showHierarchyTree)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  {showHierarchyTree ? (isKn ? 'ಶ್ರೇಣಿ ಮರೆಮಾಡಿ' : 'Hide Tree') : (isKn ? 'ಶ್ರೇಣಿ ವೀಕ್ಷಿಸಿ' : 'View Tree')}
                </button>
              </div>

              {showHierarchyTree && (
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  background: 'rgba(0, 0, 0, 0.45)',
                  padding: '14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  lineHeight: '1.6'
                }}>
                  <div style={{ color: '#34d399', fontWeight: 800 }}>
                    👨‍🌾 Farmer: {activeFarmer.name} ({activeFarmer.agriStackId})
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', paddingLeft: '8px' }}>│</div>
                  {(activeFarmer.landParcels || []).map((parcel, pIdx, arr) => {
                    const isLastParcel = pIdx === arr.length - 1;
                    const cropsOnParcel = parcel.crops || [];

                    return (
                      <div key={parcel.parcelId || pIdx} style={{ paddingLeft: '8px' }}>
                        <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                          {isLastParcel ? '└──' : '├──'} 🗺️ Land: Khasra {parcel.khasraNo} ({parcel.parcelId}) • {parcel.areaBigha} Bighas
                        </div>
                        {cropsOnParcel.length > 0 ? (
                          cropsOnParcel.map((c, cIdx, cArr) => {
                            const isLastCrop = cIdx === cArr.length - 1;
                            return (
                              <div key={c.crop_id || cIdx} style={{ paddingLeft: isLastParcel ? '24px' : '28px', color: '#fcd34d' }}>
                                {isLastCrop ? '└──' : '├──'} 🌾 Crop: {c.crop_name} ({c.variety || 'Standard'}) • {c.season} • Stage: {c.crop_stage} • NDVI: <span style={{ color: '#34d399' }}>{c.ndvi_score}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ paddingLeft: isLastParcel ? '24px' : '28px', color: 'var(--text-muted)' }}>
                            └── 🌾 Crop: {parcel.primaryCrop || 'Seasonal Crop'} (Standing)
                          </div>
                        )}
                        {!isLastParcel && <div style={{ color: 'rgba(255,255,255,0.4)' }}>│</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cadastral GeoJSON View Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#34d399" /> 
                {isKn ? 'ನೋಂದಾಯಿತ ಭೂ ಪಾರ್ಸೆಲ್‌ಗಳು (ಖಸ್ರಾ ಕ್ಯಾಡಸ್ಟ್ರಲ್ ದಾಖಲೆಗಳು)' : 'Registered Land Parcels (Khasra Cadastral Records)'}
              </h4>
              <button
                onClick={handleFetchGeoJson}
                disabled={loadingGeoJson}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Map size={14} color="#38bdf8" />
                {loadingGeoJson ? 'Loading...' : (isKn ? 'ಕ್ಯಾಡಸ್ಟ್ರಲ್ ಜಿಯೋಜೈಸನ್ (GIS)' : 'Cadastral GeoJSON (GIS)')}
              </button>
            </div>

            {/* GeoJSON Preview if opened */}
            {geoJsonData && (
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '0.78rem',
                fontFamily: 'monospace'
              }}>
                <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
                  ✔ GeoJSON FeatureCollection: {geoJsonData.features?.length} Polygons
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto', color: 'var(--text-muted)' }}>
                  <pre style={{ margin: 0 }}>{JSON.stringify(geoJsonData, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Land Parcels List with Linked Crops */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeFarmer.landParcels?.map((parcel, idx) => (
                <div key={idx} style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <div>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                        {isKn ? 'ಖಸ್ರಾ ನಂ.' : 'Khasra No.'} {parcel.khasraNo}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                        ({isKn ? 'ಖತೌನಿ' : 'Khatauni'} #{parcel.khatauniNo})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="mono-chip">{parcel.parcelId}</span>
                      {parcel.verificationStatus === 'VERIFIED_HIMBHOOMI_MATCH' ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          ✔ {isKn ? 'ಪಟ್ವಾರಿ ಪರಿಶೀಲನೆ ಪೂರ್ಣ' : 'Patwari Verified'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyParcel(parcel.parcelId)}
                          disabled={verifyingParcelId === parcel.parcelId}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                        >
                          <ShieldCheck size={12} />
                          {verifyingParcelId === parcel.parcelId 
                            ? 'Verifying...' 
                            : (isKn ? 'ಪಟ್ವಾರಿ ದೃಢೀಕರಣ' : 'Verify as Patwari')}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{isKn ? 'ವಿಸ್ತೀರ್ಣ:' : 'Area:'}</span>
                      <div style={{ fontWeight: 600 }}>{parcel.areaBigha} {isKn ? 'ವಿಘಾ' : 'Bighas'} ({parcel.areaHectares} Ha)</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{isKn ? 'ಮುಖ್ಯ ಬೆಳೆ:' : 'Primary Crop:'}</span>
                      <div style={{ fontWeight: 600, color: '#fcd34d' }}>{parcel.primaryCrop}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{isKn ? 'ನೀರಾವರಿ:' : 'Irrigation:'}</span>
                      <div style={{ fontWeight: 600 }}>{parcel.irrigationType}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{isKn ? 'ಮಣ್ಣು ಕಾರ್ಡ್ ಐಡಿ:' : 'Soil Card ID:'}</span>
                      <div className="mono-chip" style={{ color: '#34d399' }}>{parcel.soilHealthId}</div>
                    </div>
                  </div>

                  {/* Standing Crops Section (Crop DocType Linked to this Parcel) */}
                  <div style={{
                    marginTop: '14px',
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.18)',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sprout size={15} /> 
                        {isKn ? 'ಈ ಪಾರ್ಸೆಲ್‌ನಲ್ಲಿ ಬೆಳೆ ದಾಖಲೆಗಳು (Crop Records)' : 'Standing Crops on this Parcel (Crop Records)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddCrop(parcel.parcelId)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                      >
                        <PlusCircle size={12} /> {isKn ? 'ಬೆಳೆ ಸೇರಿಸಿ' : 'Add Crop'}
                      </button>
                    </div>

                    {parcel.crops && parcel.crops.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {parcel.crops.map((crop, cIdx) => (
                          <div key={crop.crop_id || cIdx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '8px',
                            padding: '8px 10px',
                            background: 'rgba(0,0,0,0.35)',
                            borderRadius: '4px',
                            fontSize: '0.78rem'
                          }}>
                            <div>
                              <strong style={{ color: '#fcd34d' }}>{crop.crop_name}</strong>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({crop.variety || 'Standard'})</span>
                              <span className="mono-chip" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>{crop.season}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                                Stage: {crop.crop_stage}
                              </span>
                              <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                                NDVI: {crop.ndvi_score || 0.78}
                              </span>
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                                Yield: {crop.estimated_yield_quintals || '—'} Qtl
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {isKn ? 'ಯಾವುದೇ ಬೆಳೆ ನಮೂದಿಸಿಲ್ಲ. ಬೆಳೆ ಸೇರಿಸಲು ಮೇಲಿನ ಬಟನ್ ಬಳಸಿ.' : 'No crop records explicitly logged yet. Click "Add Crop" to record.'}
                      </div>
                    )}
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
                    color: 'var(--text-dim)',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <span>{isKn ? 'ಕ್ಯಾಡಸ್ಟ್ರಲ್ ಕೇಂದ್ರ:' : 'Cadastral Centroid:'} Lat {parcel.coordinates?.lat}, Lng {parcel.coordinates?.lng}</span>
                    <span style={{ color: '#34d399' }}>
                      ✔ {parcel.officerRemarks || (isKn ? 'ಹಿಂಭೂಮಿ ಪರಿಶೀಲಿತ' : 'HimBhoomi Verified')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
            <p>{isKn ? 'ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ರೈತರನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Select a farmer to inspect records.'}</p>
          </div>
        )}
      </div>

      {/* Enroll Farmer Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              {isKn ? 'ಏಕೀಕೃತ ರೈತ ಡೇಟಾಬೇಸ್‌ಗೆ ರೈತರನ್ನು ನೋಂದಾಯಿಸಿ (ಅಗ್ರಿಸ್ಟಾಕ್)' : 'Enroll Farmer into Unified Farmer Database (AgriStack)'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {isKn 
                ? 'ಅಗ್ರಿಸ್ಟಾಕ್ ಐಡಿ ರಚಿಸುತ್ತದೆ ಮತ್ತು ಹಿಂಭೂಮಿ ಕಂದಾಯ ಕ್ಯಾಡಸ್ಟ್ರಲ್ ದಾಖಲೆಗಳಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ.' 
                : 'Generates AgriStack ID and links to HimBhoomi revenue cadastral records.'}
            </p>

            <form onSubmit={handleRegisterFarmer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ರೈತರ ಪೂರ್ಣ ಹೆಸರು' : 'Farmer Full Name'}
                  </label>
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Mobile Number'}
                  </label>
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಜಿಲ್ಲೆ' : 'District'}
                  </label>
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ತಹಸಿಲ್' : 'Tehsil'}
                  </label>
                  <input
                    required
                    type="text"
                    value={newFarmerData.tehsil}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, tehsil: e.target.value })}
                    placeholder="e.g. Theog"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಗ್ರಾಮ' : 'Village'}
                  </label>
                  <input
                    required
                    type="text"
                    value={newFarmerData.village}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, village: e.target.value })}
                    placeholder="e.g. Fagu"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಆಧಾರ್ ಸಂಖ್ಯೆ' : 'Aadhaar Number'}
                  </label>
                  <input
                    type="text"
                    value={newFarmerData.aadhaarNumber}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, aadhaarNumber: e.target.value })}
                    placeholder="12-digit Aadhaar"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಖಸ್ರಾ ಸಂಖ್ಯೆ' : 'Khasra No.'}
                  </label>
                  <input
                    required
                    type="text"
                    value={newFarmerData.khasraNo}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, khasraNo: e.target.value })}
                    placeholder="310/2"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ವಿಸ್ತೀರ್ಣ (ವಿಘಾ)' : 'Area (Bighas)'}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={newFarmerData.areaBigha}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, areaBigha: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಬೆಳೆ' : 'Crop'}
                  </label>
                  <input
                    required
                    type="text"
                    value={newFarmerData.primaryCrop}
                    onChange={(e) => setNewFarmerData({ ...newFarmerData, primaryCrop: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRegisterModal(false)}
                >
                  {isKn ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="btn btn-primary"
                >
                  {registering 
                    ? (isKn ? 'ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'Registering...') 
                    : (isKn ? 'ಅಗ್ರಿಸ್ಟಾಕ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ' : 'Register in AgriStack')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Crop Modal Dialog (Farmer ├── Land └── Crop) */}
      {showAddCropModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sprout size={20} color="#34d399" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {isKn ? 'ಭೂಮಿಯ ಪಾರ್ಸೆಲ್‌ಗೆ ಬೆಳೆ ನೋಂದಾಯಿಸಿ' : 'Add Crop to Land Parcel'}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {isKn 
                ? `ಪಾರ್ಸೆಲ್ ${selectedParcelForCrop} ಗೆ ಸ್ಟ್ಯಾಂಡಿಂಗ್ ಬೆಳೆ ನಮೂದಿಸಿ (Farmer ├── Land └── Crop)`
                : `Registers a standing crop under parcel ${selectedParcelForCrop} (Hierarchy: Farmer ├── Land └── Crop).`}
            </p>

            <form onSubmit={handleAddCropSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಬೆಳೆಯ ಹೆಸರು' : 'Crop Name'}
                  </label>
                  <input
                    required
                    type="text"
                    value={cropFormData.crop_name}
                    onChange={(e) => setCropFormData({ ...cropFormData, crop_name: e.target.value })}
                    placeholder="e.g. Apple, Wheat, Maize"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ತಳಿ / ತಳಿ ವೈವಿಧ್ಯ' : 'Cultivar / Variety'}
                  </label>
                  <input
                    type="text"
                    value={cropFormData.variety}
                    onChange={(e) => setCropFormData({ ...cropFormData, variety: e.target.value })}
                    placeholder="e.g. Royal Delicious, Himsona"
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಋತು' : 'Agro Season'}
                  </label>
                  <select
                    value={cropFormData.season}
                    onChange={(e) => setCropFormData({ ...cropFormData, season: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Perennial">Perennial</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ವಿಸ್ತೀರ್ಣ (ವಿಘಾಗಳು)' : 'Cultivated Area (Bighas)'}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={cropFormData.area_bigha}
                    onChange={(e) => setCropFormData({ ...cropFormData, area_bigha: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಬೆಳೆಯ ಹಂತ' : 'Crop Stage'}
                  </label>
                  <select
                    value={cropFormData.crop_stage}
                    onChange={(e) => setCropFormData({ ...cropFormData, crop_stage: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  >
                    <option value="Sowing">Sowing</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Ripening">Ripening</option>
                    <option value="Harvested">Harvested</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'ಅಂದಾಜು ಇಳುವರಿ (ಕ್ವಿಂಟಾಲ್)' : 'Est. Yield (Qtl)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={cropFormData.estimated_yield_quintals}
                    onChange={(e) => setCropFormData({ ...cropFormData, estimated_yield_quintals: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isKn ? 'NDVI ಸ್ಕೋರ್' : 'NDVI Score'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={cropFormData.ndvi_score}
                    onChange={(e) => setCropFormData({ ...cropFormData, ndvi_score: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddCropModal(false)}
                >
                  {isKn ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={addingCrop}
                  className="btn btn-primary"
                >
                  {addingCrop 
                    ? (isKn ? 'ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'Adding Crop...') 
                    : (isKn ? 'ಬೆಳೆ ಸೇರಿಸಿ' : 'Register Crop')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
