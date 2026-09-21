# Core Modules Specification & Architecture Reference
## Himachal Pradesh Agriculture Service Network (HP-ASN) & State Unified Digital Database (SUADR)

This document details the functional responsibilities, data structures, and API contracts for the core platform modules assigned to the platform:

---

## 1. Module 1: HP Agriculture Service Network (HP-ASN)
### *Secure Data-Exchange & Inter-Departmental Network*

### 📌 Functional Responsibility
- Acts as the **secure data-exchange layer** connecting government departments (Revenue, Horticulture, Agriculture, Banking, and IMD Met).
- Eliminates departmental silos while enforcing **citizen/farmer consent**.
- Implements an immutable audit ledger with **HMAC-SHA256 cryptographic signatures** for zero-repudiation.

### 🏛️ Connected Departments
1. **Department of Revenue (*HimBhoomi / Jamabandi*)**: Cadastral parcel maps, Khasra numbers, land ownership title verification.
2. **Department of Horticulture (*HPMC*)**: Apple orchard grading, cold chain allotments, subsidized rootstock issuance.
3. **HP State Cooperative Bank (*HPSC / NPCI APBS*)**: Direct Benefit Transfer (DBT) bank account validation and settlement tracing.
4. **India Meteorological Department (*IMD Agro-Met*)**: Automatic Weather Station (AWS) micro-climate streams and frost alerts.

### 💻 Code & Schema Files:
- **REST API Router**: [`backend/src/modules/hpasn/hpasnRouter.js`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/src/modules/hpasn/hpasnRouter.js)
- **Frappe DocType**: [`backend/frappe_doctypes/hpasn_log/hpasn_log.json`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/frappe_doctypes/hpasn_log/hpasn_log.json)
- **PostgreSQL Table**: `hpasn_audit_logs` in [`backend/db/schema.sql`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/db/schema.sql)
- **Interactive Portal**: [`frontend/src/pages/HpasnExchange.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/pages/HpasnExchange.jsx)

### 🔌 API Endpoints:
- `GET /api/hpasn/departments`: Lists all connected state partner systems and protocols.
- `GET /api/hpasn/logs`: Retrieves the cryptographic consent audit ledger.
- `POST /api/hpasn/request-consent`: Signs and initiates an inter-departmental data transfer.

---

## 2. Module 2: Identity & Access Management (IAM)
### *Authentication, RBAC & AgriStack / Aadhaar Linkage*

### 📌 Functional Responsibility
- Handles user authentication, session security, and **Role-Based Access Control (RBAC)** across the platform.
- Provides distinct permission tiers:
  - **👨‍🌾 Farmers**: Self-service portal, view my land holdings, apply for DBT schemes, query AI advisory.
  - **👮‍♂️ Agriculture Officers (DAO/BTM)**: Field inspection queue, on-site remarks, grant sanctioning, audit reviews.
  - **🛡️ State Admins**: Subsystem telemetry, rate limit policies, and inter-department API tokens.
- **Aadhaar e-KYC & AgriStack Linkage**: Verifies farmer identities and binds them to national AgriStack IDs (`AGRI-HP-2026-XXXX`).

### 💻 Code & Schema Files:
- **REST API Router**: [`backend/src/modules/auth/authRouter.js`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/src/modules/auth/authRouter.js)
- **RBAC Navbar & Role Switcher**: [`frontend/src/components/Navbar.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/components/Navbar.jsx)
- **PostgreSQL Table**: `users` in [`backend/db/schema.sql`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/db/schema.sql)

### 🔌 API Endpoints:
- `POST /api/auth/login`: Authenticates Farmer (phone / AgriStack ID) or Officer (officer ID / email).
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
  - Geo-coordinates (Latitude & Longitude centroid)

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
- **Real-Time Telemetry**: Live temperature, humidity, rainfall probability, and frost warnings.
- **Pest & Disease Diagnostics**: Knowledge base with natural farming (*SPNF / Jeevamrit / Neemastra*) recipes and chemical IPM alternatives.

### 💻 Code & Schema Files:
- **REST API Router**: [`backend/src/modules/suadr/suadrRouter.js`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/src/modules/suadr/suadrRouter.js)
- **Frappe DocType**: [`backend/frappe_doctypes/suadr_soil_profile/suadr_soil_profile.json`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/frappe_doctypes/suadr_soil_profile/suadr_soil_profile.json)
- **PostgreSQL Table**: `suadr_soil_profiles` in [`backend/db/schema.sql`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/backend/db/schema.sql)
- **Interactive UI**: [`frontend/src/pages/SuadrExplorer.jsx`](file:///c:/Users/Admin/Desktop/ni-intelligentvillage-platform-info/frontend/src/pages/SuadrExplorer.jsx)

### 🔌 API Endpoints:
- `GET /api/suadr/soil`: Soil test profiles with Tehsil/District filters.
- `GET /api/suadr/zones`: HP agro-climatic zones and crop suitability tables.
- `GET /api/suadr/telemetry`: Live micro-climate sensor streams.
- `GET /api/suadr/pests`: Pest diagnostic handbook.
- `POST /api/suadr/advisory-query`: Rule-based agronomy inference engine.

---

## 🔄 Inter-Module Data Flow Diagram

```
       ┌────────────────────────────────────────────────────────┐
       │      MODULE 2: Identity & Access Management (IAM)      │
       │   Aadhaar e-KYC • AgriStack IDs • Farmer & Officer RBAC│
       └───────────────────────────┬────────────────────────────┘
                                   │ Authenticates User Session
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │          MODULE 3: Unified Farmer Database             │
       │   Farmer Profiles • Cadastral Khasra Land Parcels      │
       └──────────────┬──────────────────────────┬──────────────┘
                      │ Linked Land Parcel ID    │ Farmer ID
                      ▼                          ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     MODULE 4: SUADR Database    │   │  MODULE 1: HP-ASN Service Net   │
│ Soil NPK • Climate Telemetry    │   │ Consent Logs • Inter-Dept Data  │
│ Agro Zones • Pest Intelligence  │   │ Revenue (HimBhoomi) ↔ Banking   │
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
