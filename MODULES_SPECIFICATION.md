# Core Modules Specification & Architecture Reference
## Himachal Pradesh Agriculture Service Network (HP-ASN) & State Unified Digital Database (SUADR)

This document details the functional responsibilities, data structures, and API contracts for the core platform modules assigned to the platform:

1. **HP Agriculture Service Network (HP-ASN)** - Secure Inter-Departmental Consent-Based Data Exchange
2. **Identity & Access Management (IAM)** - Zero-Trust RBAC, Sessions & Aadhaar / AgriStack e-KYC
3. **Unified Farmer Database** - Master Registry, Cadastral Khasra Parcels & HimBhoomi Sync
4. **State Unified Digital Database (SUADR)** - Soil Health, Micro-Climate Telemetry, Agro-Climatic Zones & Pest Intelligence

---

## 1. Module 1: HP Agriculture Service Network (HP-ASN)
### *Secure Data-Exchange & Inter-Departmental Network*

### 📌 Functional Responsibility
- Acts as the **secure data-exchange layer** connecting government departments (Revenue, Horticulture, Agriculture, Banking, Civil Supplies, and IMD Met).
- Eliminates departmental silos while enforcing **citizen/farmer consent**.
- Implements an immutable audit ledger with **HMAC-SHA256 cryptographic signatures** for non-repudiation.
- Enforces bilateral data sharing agreements and SLA latency standards across Himachal Pradesh state IT infrastructure.

### 🏛️ Connected Departments
1. **Department of Revenue (*HimBhoomi / Jamabandi*)**: Cadastral parcel maps, Khasra numbers, land ownership title verification.
2. **Department of Horticulture (*HPMC*)**: Apple orchard grading, cold atmosphere (CA) stores, subsidized rootstock issuance.
3. **HP State Cooperative Bank (*HPSC / NPCI APBS*)**: Direct Benefit Transfer (DBT) bank account validation and settlement tracing.
4. **India Meteorological Department (*IMD Agro-Met*)**: Automatic Weather Station (AWS) micro-climate streams and frost alerts.
5. **Department of Food & Civil Supplies**: Ration card e-PDS verification and MSP procurement quotas.

### 💻 Code & Schema Files:
- **REST API Router**: [`backend/src/modules/hpasn/hpasnRouter.js`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/src/modules/hpasn/hpasnRouter.js)
- **Frappe DocType**: [`backend/frappe_doctypes/hpasn_log/hpasn_log.json`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/frappe_doctypes/hpasn_log/hpasn_log.json)
- **PostgreSQL Table**: `hpasn_audit_logs` in [`backend/db/schema.sql`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/db/schema.sql)
- **Interactive UI**: [`frontend/src/pages/HpasnExchange.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/pages/HpasnExchange.jsx)

### 🔌 API Endpoints:
- `GET /api/hpasn/departments`: Lists all connected state partner systems and protocols.
- `GET /api/hpasn/policies`: Retrieves bilateral data governance agreements, legal basis, and encryption protocols.
- `GET /api/hpasn/logs`: Retrieves the cryptographic consent audit ledger.
- `POST /api/hpasn/request-consent`: Signs and initiates an inter-departmental data transfer with HMAC-SHA256 digest.
- `POST /api/hpasn/exchange`: Simulates live bilateral inter-department data query (e.g. Khasra title lookup).
- `POST /api/hpasn/verify-signature`: Cryptographically validates transaction digest to prove non-repudiation.

---

## 2. Module 2: Identity & Access Management (IAM)
### *Authentication, RBAC & AgriStack / Aadhaar Linkage*

### 📌 Functional Responsibility
- Handles user authentication, session security, and **Role-Based Access Control (RBAC)** across the platform.
- Provides 5 distinct permission tiers:
  1. **👨‍🌾 FARMER**: Access personal land parcels, Soil Health Cards, submit DBT scheme applications, trade on APMC Mandi, and view Sentinel-2 NDVI satellite imagery.
  2. **📜 VILLAGE_REVENUE_OFFICER (Halqua Patwari)**: Inspect cadastral Khasra maps, verify land titles against Jamabandi (HimBhoomi), and issue physical boundary sign-offs.
  3. **👮‍♂️ AGRICULTURE_OFFICER (ADO/DAO)**: Review and approve DBT subsidy applications, record laboratory Soil Health Cards, publish seasonal agronomy advisories.
  4. **🏦 BANK_NODAL_OFFICER**: Validate Aadhaar Payment Bridge System (APBS) mandates, monitor DBT tranche settlements, and manage Kisan Credit Card (KCC) limits.
  5. **🛡️ STATE_ADMIN**: HP-ASN inter-department data exchange governance, tamper-proof audit trail oversight, rate-limiting, and IAM configuration.
- **Aadhaar e-KYC & AgriStack Linkage**: Verifies farmer identities and binds them to national AgriStack IDs (`AGRI-HP-2026-XXXX`).

### 💻 Code & Schema Files:
- **REST API Router**: [`backend/src/modules/auth/authRouter.js`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/src/modules/auth/authRouter.js)
- **Interactive IAM UI**: [`frontend/src/pages/IamView.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/pages/IamView.jsx)
- **RBAC Navbar & Switcher**: [`frontend/src/components/Navbar.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/components/Navbar.jsx)
- **PostgreSQL Table**: `users` in [`backend/db/schema.sql`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/db/schema.sql)

### 🔌 API Endpoints:
- `POST /api/auth/login`: Authenticates Farmer or Officers with assigned roles and permission arrays.
- `GET /api/auth/me`: Validates session Bearer token and returns active permissions.
- `GET /api/auth/roles`: Full RBAC roles and permissions matrix.
- `GET /api/auth/principals`: Directory of authorized departmental officials.
- `POST /api/auth/check-permission`: Policy evaluation engine returning `PERMIT` or `DENY` decisions.
- `POST /api/auth/verify-aadhaar`: Simulates Aadhaar OTP e-KYC bridge and generates verified AgriStack ID.

---

## 3. Module 3: Unified Farmer Database
### *Single Master Database for Farmers, Land Parcels & Crops*

### 📌 Functional Responsibility
- Acts as the **single source of truth (SSOT)** for every farmer in Himachal Pradesh.
- Holds comprehensive demographics, natural farming adoption status (*SPNF*), and DBT-linked bank accounts.
- **Cadastral Land Registry (HimBhoomi Linked)**: Maps individual land parcels with survey numbers:
  - *Khasra Number* (e.g. `412/12`)
  - *Khatauni Number* (e.g. `18`)
  - Operational area in **Bighas** and **Hectares**
  - Irrigation type (Micro-drip, Sprinkler, Kuhl, Rainfed)
  - Geo-coordinates (Centroid Latitude & Longitude)
  - Cadastral GeoJSON boundary polygons for satellite GIS integration
  - Patwari verification status (`VERIFIED_HIMBHOOMI_MATCH`)

### 💻 Code & Schema Files:
- **REST API Router**: [`backend/src/modules/farmers/farmerRouter.js`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/src/modules/farmers/farmerRouter.js)
- **Frappe Master DocType**: [`backend/frappe_doctypes/farmer/farmer.json`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/frappe_doctypes/farmer/farmer.json)
- **Frappe Child DocType**: [`backend/frappe_doctypes/land_parcel/land_parcel.json`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/frappe_doctypes/land_parcel/land_parcel.json)
- **PostgreSQL Tables**: `farmers` and `land_parcels` in [`backend/db/schema.sql`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/db/schema.sql)
- **Interactive UI**: [`frontend/src/pages/RegistryView.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/pages/RegistryView.jsx)

### 🔌 API Endpoints:
- `GET /api/farmers`: Filtered farmer directory (by district, category, search).
- `GET /api/farmers/:id`: Pulls full profile with linked land parcels, soil health cards, and active schemes.
- `POST /api/farmers`: Enrolls new farmer with automatic AgriStack ID assignment.
- `POST /api/farmers/:id/land`: Links cadastral Khasra survey parcel to an existing farmer.
- `PATCH /api/farmers/:id/parcels/:parcelId/verify`: Revenue Officer (Patwari) land verification sign-off.
- `GET /api/farmers/:id/cadastral-geojson`: Generates GeoJSON FeatureCollection polygons for map rendering.

---

## 4. Module 4: State Unified Digital Database (SUADR)
### *State-Wide Soil, Climate, Crop, Agronomy & Pest Repository*

### 📌 Functional Responsibility
- State-wide foundational data layer utilized by all other platform engines (advisory, DBT schemes, AI models).
- **Soil Health Cards (SHC)**: Stores laboratory test profiles per tehsil:
  - pH Level & Category (Acidic, Neutral, Alkaline)
  - Primary Nutrients: Nitrogen (N), Phosphorus (P), Potassium (K) in kg/ha
  - Micronutrients: Organic Carbon %, Zinc (ppm), Boron (ppm)
  - Regional Agronomy Prescriptions
- **Agro-Climatic Intelligence**: Covers all 4 Himachal elevation zones (Sub-Montane 300m to Cold Desert >2,200m).
- **Crop Suitability Matrix**: Zone-specific recommendations with yield benchmarks.
- **Real-Time Telemetry**: Live Automatic Weather Station (AWS) temperature, humidity, rainfall, and soil moisture telemetry.
- **Pest & Disease Diagnostics**: Knowledge base with natural farming (*SPNF / Jeevamrit / Neemastra*) recipes and chemical IPM alternatives.

### 💻 Code & Schema Files:
- **REST API Router**: [`backend/src/modules/suadr/suadrRouter.js`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/src/modules/suadr/suadrRouter.js)
- **Frappe DocType**: [`backend/frappe_doctypes/suadr_soil_profile/suadr_soil_profile.json`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/frappe_doctypes/suadr_soil_profile/suadr_soil_profile.json)
- **PostgreSQL Table**: `suadr_soil_profiles` in [`backend/db/schema.sql`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/db/schema.sql)
- **Interactive UI**: [`frontend/src/pages/SuadrExplorer.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/pages/SuadrExplorer.jsx)

### 🔌 API Endpoints:
- `GET /api/suadr/soil`: Soil test profiles with Tehsil/District filters.
- `GET /api/suadr/soil/:shcId`: Detailed Soil Health Card with NPK, micronutrients, and advice.
- `POST /api/suadr/soil`: Laboratory registration of newly tested soil samples.
- `GET /api/suadr/zones`: HP agro-climatic zones and crop suitability tables.
- `GET /api/suadr/zones/:zoneId/crops`: Zone-specific crop suitability and expected quintal yields.
- `GET /api/suadr/telemetry`: Live micro-climate AWS sensor streams.
- `POST /api/suadr/telemetry`: Ingestion of automated weather station readings.
- `GET /api/suadr/pests`: Pest diagnostic handbook.
- `POST /api/suadr/advisory-query`: Rule-based agronomy inference engine.

---

## 🔄 Inter-Module Data Flow Diagram

```
       ┌────────────────────────────────────────────────────────┐
       │      MODULE 2: Identity & Access Management (IAM)      │
       │   Aadhaar e-KYC • AgriStack IDs • 5 RBAC User Roles    │
       └───────────────────────────┬────────────────────────────┘
                                   │ Authenticates & Authorizes Action
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │          MODULE 3: Unified Farmer Database             │
       │   Farmer Profiles • Cadastral Khasra Land Parcels      │
       │   Patwari Verification • GeoJSON Boundary Maps        │
       └──────────────┬──────────────────────────┬──────────────┘
                      │ Linked Land Parcel ID    │ Farmer ID
                      ▼                          ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     MODULE 4: SUADR Database    │   │  MODULE 1: HP-ASN Service Net   │
│ Soil NPK • Climate Telemetry    │   │ Consent Logs • Inter-Dept Data  │
│ Agro Zones • Pest Intelligence  │   │ Revenue (HimBhoomi) ↔ Banking   │
│ Crop Suitability • Advisory     │   │ SHA-256 Non-Repudiation Signatures│
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │              Downstream Execution Modules              │
       │  • DBT & Schemes Engine (Income Support & Subsidies)   │
       │  • Python AI Engine (Sentinel-2 NDVI & Predictions)    │
       │  • APMC Mandi Marketplace & Rates                      │
       └────────────────────────────────────────────────────────┘
```
