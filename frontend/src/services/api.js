const API_BASE = 'http://localhost:5000/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    return { success: false, message: err.message || "Failed to communicate with API Gateway." };
  }
}

export const api = {
  // Health & Gateway
  getHealth: () => fetchJson('/health'),

  // =========================================================================
  // MODULE 2: Identity & Access Management (IAM)
  // =========================================================================
  login: (role, identifier) => fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, identifier })
  }),
  getUserHierarchy: () => fetchJson('/auth/hierarchy'),
  getRoles: () => fetchJson('/auth/roles'),
  getPrincipals: () => fetchJson('/auth/principals'),
  getCurrentSession: (token) => fetchJson('/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  checkPermission: (role, action) => fetchJson('/auth/check-permission', {
    method: 'POST',
    body: JSON.stringify({ role, action })
  }),
  verifyAadhaar: (aadhaarNumber, otp) => fetchJson('/auth/verify-aadhaar', {
    method: 'POST',
    body: JSON.stringify({ aadhaarNumber, otp })
  }),
  simulatePipeline: (token, requiredRole, requiredPermission) => fetchJson('/auth/pipeline-verify', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ requiredRole, requiredPermission })
  }),
  getGuardedSample: (token) => fetchJson('/auth/guarded-sample', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  }),

  // Concrete Access APIs:
  // Farmer
  getFarmerProfile: (token) => fetchJson('/farmer/profile', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),
  getFarmerLand: (token) => fetchJson('/farmer/land', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),
  getFarmerCrops: (token) => fetchJson('/farmer/crops', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),

  // Officer
  getOfficerFarmers: (token) => fetchJson('/officer/farmers', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),
  officerVerifyFarmer: (token, payload) => fetchJson('/officer/verify-farmer', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: JSON.stringify(payload)
  }),
  officerUpdateFieldInfo: (token, payload) => fetchJson('/officer/update-field-info', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: JSON.stringify(payload)
  }),

  // Admin
  getAdminUsers: (token) => fetchJson('/admin/users', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),
  getAdminRoles: (token) => fetchJson('/admin/roles', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),
  getAdminSystemData: (token) => fetchJson('/admin/system-data', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }),

  // =========================================================================
  // MODULE 3: Unified Farmer Database (Farmer ├── Land └── Crop)
  // =========================================================================
  getFarmers: (district = '', search = '') => fetchJson(`/farmers?district=${district}&search=${search}`),
  getFarmerById: (id) => fetchJson(`/farmers/${id}`),
  getFarmerHierarchy: (farmerId) => fetchJson(`/farmers/${farmerId}/hierarchy`),
  getFarmerLandParcels: (farmerId) => fetchJson(`/farmers/${farmerId}/land`),
  getFarmerCropsList: (farmerId) => fetchJson(`/farmers/${farmerId}/crops`),
  registerFarmer: (payload) => fetchJson('/farmers', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  addLandParcel: (farmerId, parcel) => fetchJson(`/farmers/${farmerId}/land`, {
    method: 'POST',
    body: JSON.stringify(parcel)
  }),
  addFarmerCrop: (farmerId, cropPayload) => fetchJson(`/farmers/${farmerId}/crops`, {
    method: 'POST',
    body: JSON.stringify(cropPayload)
  }),
  updateFarmerCrop: (farmerId, cropId, updatePayload) => fetchJson(`/farmers/${farmerId}/crops/${cropId}`, {
    method: 'PATCH',
    body: JSON.stringify(updatePayload)
  }),
  verifyLandParcel: (farmerId, parcelId, data) => fetchJson(`/farmers/${farmerId}/parcels/${parcelId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getCadastralGeojson: (farmerId) => fetchJson(`/farmers/${farmerId}/cadastral-geojson`),

  // =========================================================================
  // MODULE 4: State Unified Digital Database (SUADR)
  // =========================================================================
  getSoilProfiles: (district = '') => fetchJson(`/suadr/soil?district=${district}`),
  getSoilById: (shcId) => fetchJson(`/suadr/soil/${shcId}`),
  recordSoilSample: (payload) => fetchJson('/suadr/soil', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getAgroZones: () => fetchJson('/suadr/zones'),
  getZoneCrops: (zoneId) => fetchJson(`/suadr/zones/${zoneId}/crops`),
  getTelemetry: () => fetchJson('/suadr/telemetry'),
  ingestTelemetry: (payload) => fetchJson('/suadr/telemetry', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getPests: (crop = '') => fetchJson(`/suadr/pests?crop=${crop}`),
  queryAdvisory: (query) => fetchJson('/suadr/advisory-query', {
    method: 'POST',
    body: JSON.stringify(query)
  }),

  // Multi-State District & Agro-Climatic Directory (Karnataka, Maharashtra, Andhra Pradesh)
  getKarnatakaDistricts: (division = '', zone = '', search = '') => fetchJson(`/suadr/karnataka-districts?division=${division}&zone=${zone}&search=${search}`),
  getKarnatakaDistrict: (idOrName) => fetchJson(`/suadr/karnataka-districts/${encodeURIComponent(idOrName)}`),
  getKarnatakaZones: () => fetchJson('/suadr/karnataka-zones'),
  getMaharashtraDistricts: (division = '', search = '') => fetchJson(`/suadr/maharashtra-districts?division=${division}&search=${search}`),
  getMaharashtraZones: () => fetchJson('/suadr/maharashtra-zones'),
  getAndhraDistricts: (region = '', search = '') => fetchJson(`/suadr/andhra-districts?region=${region}&search=${search}`),
  getAndhraZones: () => fetchJson('/suadr/andhra-zones'),
  getInterstateDistricts: (state = '', search = '') => fetchJson(`/suadr/interstate-districts?state=${state}&search=${search}`),
  getInterstateCorridors: () => fetchJson('/suadr/interstate-corridors'),

  // =========================================================================
  // MODULE 1: HP Agriculture Service Network (HP-ASN)
  // =========================================================================
  getAsnDepartments: () => fetchJson('/hpasn/departments'),
  getAsnPolicies: () => fetchJson('/hpasn/policies'),
  getAsnLogs: () => fetchJson('/hpasn/logs'),
  requestAsnConsent: (payload) => fetchJson('/hpasn/request-consent', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  exchangeAsn: (payload) => fetchJson('/hpasn/exchange', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  verifyAsnSignature: (transactionId, signature) => fetchJson('/hpasn/verify-signature', {
    method: 'POST',
    body: JSON.stringify({ transactionId, signature })
  }),

  // Redis Infrastructure & Performance Monitoring
  getRedisStatus: () => fetchJson('/redis/status'),
  getRedisQueues: () => fetchJson('/redis/queues'),
  getRedisSessions: () => fetchJson('/redis/sessions'),

  // Direct Land & Crop APIs (Step 6)
  getLandsList: () => fetchJson('/lands'),
  getLandById: (landId) => fetchJson(`/lands/${landId}`),
  getLandCrops: (landId) => fetchJson(`/lands/${landId}/crops`),
  addLandCrop: (landId, payload) => fetchJson(`/lands/${landId}/crops`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // SUADR Step 6 aliases
  getSuadrSoil: () => fetchJson('/suadr/soil'),
  getSuadrClimate: () => fetchJson('/suadr/climate'),
  getSuadrCrops: () => fetchJson('/suadr/crops'),
  getSuadrMarket: () => fetchJson('/suadr/market'),

  // Schemes & DBT
  getSchemes: () => fetchJson('/schemes'),
  getApplications: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchJson(`/schemes/applications?${q}`);
  },
  submitApplication: (schemeId, farmerId, remarks) => fetchJson('/schemes/applications', {
    method: 'POST',
    body: JSON.stringify({ schemeId, farmerId, remarks })
  }),
  updateApplicationStatus: (appId, status, remarks, officerName) => fetchJson(`/schemes/applications/${appId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, officerRemarks: remarks, officerName })
  }),
  getSchemeAnalytics: () => fetchJson('/schemes/analytics'),

  // Mandi
  getMandiRates: (district = '', commodity = '') => fetchJson(`/marketplace/mandi-rates?district=${district}&commodity=${commodity}`),
  getMandiStats: () => fetchJson('/marketplace/stats'),

  // S3 Object Storage
  getStorageBuckets: () => fetchJson('/storage/buckets'),
  getStorageFiles: (bucket = '') => fetchJson(`/storage/files?bucket=${bucket}`),

  // Python AI/ML Satellite & Diagnostic Service
  predictNdvi: (payload) => fetchJson('/ml/predict-ndvi', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

