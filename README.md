# Himachal Pradesh Agriculture Service Network (HP-ASN) & SUADR Platform

An enterprise digital agriculture backbone and unified farmer governance platform integrating **HP-ASN**, **SUADR**, **AgriStack**, **HimBhoomi cadastral records**, **Redis Multi-Tier Caching**, and **Bilingual (English / ಕನ್ನಡ) Agriculture Directory**.

---

## 🏛️ 4 Core Platform Modules (In Simple Words)

| Module | Simple Explanation & Responsibilities | Key Capabilities |
|---|---|---|
| **1. HP Agriculture Service Network (HP-ASN)** | A secure data-exchange network connecting government and partner systems with consent and audit logging. | • Multi-system flows: Government $\rightarrow$ HP-ASN $\rightarrow$ Frappe $\rightarrow$ PostgreSQL & Partner $\rightarrow$ HP-ASN $\rightarrow$ Frappe $\rightarrow$ PostgreSQL & Redis<br>• Logs the **6 mandatory questions** (*Who requested? What data? When? Why? Was consent required? Was access allowed?*)<br>• Cryptographic **HMAC-SHA256** non-repudiation signature |
| **2. Identity & Access Management (IAM)** | Handles user logins, roles, and permissions across Farmers, Officers, and Admins with zero-trust security. | • 3-Tier Hierarchy: `User` ➔ `Farmer`, `Officer`, `Admin`<br>• 5-Step Zero-Trust Pipeline (Bearer JWT $\rightarrow$ AgriStack e-KYC $\rightarrow$ RBAC $\rightarrow$ Cadastral Jurisdiction $\rightarrow$ Action Authorization)<br>• Role-based endpoint isolation & Aadhaar OTP simulation |
| **3. Unified Farmer Database** | Master database holding every farmer's profile, land parcel, and crop records aligned with AgriStack. | • Relational tree: **Farmer (14 attributes)** ➔ **Land (8 attributes)** ➔ **Crop (8 attributes)**<br>• Cadastral GIS polygon integration & Khasra survey mapping<br>• Native Frappe DocTypes and PostgreSQL relational schema |
| **4. State Unified Digital Database (SUADR)** | State-wide store for soil, climate, crops, agronomy, pests, and market prices used by all other modules. | • 6 Core Datasets: `soil_data`, `climate_data`, `crop_master`, `agronomy_data`, `pest_data`, `market_data`<br>• **Karnataka 31 Districts Directory** across 4 divisions and 10 Agro-Climatic Zones with bilingual English + Kannada support |

---

## ⚡ Multi-Tier Infrastructure Topology

```
                    ┌───────────────────────┐ 
                    │       USERS           │ 
                    │ Farmers / Officers    │ 
                    └───────────┬───────────┘ 
                                │ 
                                ▼ 
                    ┌───────────────────────┐ 
                    │   React.js Web App    │ 
                    │ English & ಕನ್ನಡ UI    │ 
                    └───────────┬───────────┘ 
                                │ HTTPS 
                                ▼ 
                    ┌───────────────────────┐ 
                    │   API Gateway /       │ 
                    │   Reverse Proxy       │ 
                    │ Nginx / Load Balancer │ 
                    └───────────┬───────────┘ 
                                │ Rate Limiting (120 req/min)
                                ▼ 
              ┌─────────────────────────────────┐ 
              │          FRAPPE BACKEND         │ 
              │ • 14 Foundational REST APIs     │ 
              │ • 5-Step IAM Zero-Trust Guard   │ 
              │ • HP-ASN Data Exchange Layer    │ 
              │ • SUADR Agricultural Intelligence│ 
              └───────────────┬─────────────────┘ 
                              │ 
                 ┌────────────┴─────────────┐ 
                 │                          │ 
                 ▼                          ▼ 
        ┌─────────────────┐       ┌─────────────────┐ 
        │   PostgreSQL    │       │      Redis      │ 
        │ (Permanent DB)  │       │ (Fast-Access)   │ 
        │ • Farmers       │       │ • Rate Limiting │ 
        │ • Land Parcels  │       │ • Hot Cache     │ 
        │ • Crops         │       │ • 24h Sessions  │ 
        │ • SUADR Masters │       │ • 4 Job Queues  │ 
        │ • HP-ASN Logs   │       │                 │ 
        └─────────────────┘       └─────────────────┘       
```

---

## 🌐 14 Foundational Frappe REST APIs

| # | Method | Endpoint | Purpose |
|---|:---:|---|---|
| 1 | `POST` | `/api/auth/login` | Authenticate Farmer, Officer, or Admin & create Redis session |
| 2 | `GET` | `/api/farmers` | List registered farmers with district & search filters |
| 3 | `POST` | `/api/farmers` | Register new farmer with all 14 canonical attributes |
| 4 | `GET` | `/api/farmers/:id` | View full farmer profile & cadastral holdings |
| 5 | `PUT` | `/api/farmers/:id` | Idempotent full profile update |
| 6 | `GET` | `/api/farmers/:id/land` | View all land parcels owned by a farmer |
| 7 | `POST` | `/api/farmers/:id/land` | Add cadastral land parcel with survey number & GPS coordinates |
| 8 | `GET` | `/api/lands/:id/crops` | View all standing crops registered on a land parcel |
| 9 | `POST` | `/api/lands/:id/crops` | Add standing crop directly to a land parcel |
| 10 | `GET` | `/api/suadr/soil` | SUADR Soil Health dataset (pH, N, P, K, micronutrients) |
| 11 | `GET` | `/api/suadr/climate` | SUADR Weather & Climate dataset |
| 12 | `GET` | `/api/suadr/crops` | SUADR Crop Master catalog |
| 13 | `GET` | `/api/suadr/pests` | SUADR Pest & Disease diagnostics dataset |
| 14 | `GET` | `/api/suadr/market` | SUADR APMC Mandi spot rates & market dataset |

---

## 🚀 How to Run the Platform

### 1. Run Automated Test Suite
Verify that all 4 modules, 14 APIs, Redis integration, and HP-ASN pass 100%:
```powershell
cd backend
npm test
```

### 2. Start the Backend API Gateway
```powershell
cd backend
npm start
```
*API Gateway running on:* `http://localhost:5000`

### 3. Start the Frontend React Development Server
```powershell
cd frontend
npm run dev
```
*Web Application running on:* `http://localhost:5173` (Also available bundled on `http://localhost:5000`)

---

## 🧪 Verification & Non-Repudiation Audit
- **Automated Verification:** `npm test` runs all test suites with **100% PASS (0 errors)**.
- **Git Repository:** Synced and pushed to GitHub:
  👉 `https://github.com/Bhagya802450/-ni-intelligentvillage-platform-info.git` (`main` branch).
