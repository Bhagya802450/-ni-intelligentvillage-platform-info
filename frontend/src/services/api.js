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

  // Auth & AgriStack
  login: (role, identifier) => fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, identifier })
  }),
  verifyAadhaar: (aadhaarNumber, otp) => fetchJson('/auth/verify-aadhaar', {
    method: 'POST',
    body: JSON.stringify({ aadhaarNumber, otp })
  }),

  // Unified Farmer Database
  getFarmers: (district = '', search = '') => fetchJson(`/farmers?district=${district}&search=${search}`),
  getFarmerById: (id) => fetchJson(`/farmers/${id}`),
  registerFarmer: (payload) => fetchJson('/farmers', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  addLandParcel: (farmerId, parcel) => fetchJson(`/farmers/${farmerId}/land`, {
    method: 'POST',
    body: JSON.stringify(parcel)
  }),

  // SUADR
  getSoilProfiles: (district = '') => fetchJson(`/suadr/soil?district=${district}`),
  getSoilById: (shcId) => fetchJson(`/suadr/soil/${shcId}`),
  getAgroZones: () => fetchJson('/suadr/zones'),
  getTelemetry: () => fetchJson('/suadr/telemetry'),
  getPests: (crop = '') => fetchJson(`/suadr/pests?crop=${crop}`),
  queryAdvisory: (query) => fetchJson('/suadr/advisory-query', {
    method: 'POST',
    body: JSON.stringify(query)
  }),

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

  // HP-ASN Inter-Department Exchange
  getAsnDepartments: () => fetchJson('/hpasn/departments'),
  getAsnLogs: () => fetchJson('/hpasn/logs'),
  requestAsnConsent: (payload) => fetchJson('/hpasn/request-consent', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Mandi
  getMandiRates: (district = '', commodity = '') => fetchJson(`/marketplace/mandi-rates?district=${district}&commodity=${commodity}`),
  getMandiStats: () => fetchJson('/marketplace/stats')
};
