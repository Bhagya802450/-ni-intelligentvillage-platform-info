# Himachal Pradesh Agriculture Service Network (HP-ASN) & SUADR Platform

An enterprise digital agriculture backbone and unified farmer governance platform engineered specifically for Himachal Pradesh, integrating **HP-ASN**, **SUADR**, **AgriStack**, **HimBhoomi cadastral records**, and **Direct Benefit Transfer (DBT)**.

---

## 🏛️ System Architecture Topology

```
                    ┌───────────────────────┐ 
                    │       USERS           │ 
                    │ Farmers / Officers    │ 
                    └───────────┬───────────┘ 
                                │ 
                                ▼ 
                    ┌───────────────────────┐ 
                    │      React.js         │ 
                    │   Web / Mobile UI     │ 
                    └───────────┬───────────┘ 
                                │ HTTPS 
                                ▼ 
                    ┌───────────────────────┐ 
                    │   API Gateway /       │ 
                    │   Reverse Proxy       │ 
                    │ Nginx / Load Balancer │ 
                    └───────────┬───────────┘ 
                                │ 
                         Rate Limiting (120 req/min)
                                │ 
                                ▼ 
              ┌─────────────────────────────────┐ 
              │          FRAPPE BACKEND         │ 
              │                                 │ 
              │ • REST APIs                     │ 
              │ • Authentication & RBAC         │ 
              │ • Farmer Management             │ 
              │ • Crop Management               │ 
              │ • Advisory APIs (SUADR Engine)  │ 
              │ • Scheme / DBT APIs             │ 
              │ • Marketplace APIs              │ 
              │ • Officer ERP APIs              │ 
              └───────────────┬─────────────────┘ 
                              │ 
                 ┌────────────┴─────────────┐ 
                 │                          │ 
                 ▼                          ▼ 
        ┌─────────────────┐       ┌─────────────────┐ 
        │   PostgreSQL    │       │      Redis      │ 
        │                 │       │                 │ 
        │ • Farmer data   │       │ • Cache         │ 
        │ • Land data     │       │ • Sessions      │ 
        │ • Crop data     │       │ • Rate limiting │ 
        │ • Schemes       │       │ • Background    │ 
        │ • Transactions  │       │   jobs/queues   │ 
        └─────────────────┘       └─────────────────┘       
```

---

## 🚀 How to Start the Project (Line-by-Line Guide)

You have two simple ways to start the platform:

### Method 1: One-Click Instant Launcher (Windows)
Double-click `start-platform.bat` or run:
```powershell
.\start-platform.bat
```
*(This automatically boots the Backend API Gateway on port 5000 and the React Portal on port 5173).*

---

### Method 2: Manual Line-by-Line Execution

#### Step 1: Start Backend API Gateway
Open a terminal in the project root:
```bash
# Line 1: Move into the backend folder
cd backend

# Line 2: Install dependencies (already pre-installed)
npm install

# Line 3: Run automated test suite to verify all 8 subsystem APIs
npm test

# Line 4: Start the backend server
npm start
```
*Backend runs on: `http://localhost:5000` (Health endpoint: `http://localhost:5000/api/health`)*

#### Step 2: Start Frontend Web Application
Open a second terminal:
```bash
# Line 5: Move into the frontend folder
cd frontend

# Line 6: Install dependencies (already pre-installed)
npm install

# Line 7: Start the Vite development server
npm run dev
```
*Frontend opens on: `http://localhost:5173`*

---

### Method 3: Containerized Multi-Container Run (Docker Compose)
If you have Docker Desktop running:
```bash
# Start all 5 services (Nginx + Backend + Frontend + PostgreSQL 16 + Redis 7)
docker compose up --build
```
*Gateway entrypoint: `http://localhost`*

---

## 🔑 Core Features & Modules

### 1. HP Agriculture Service Network (HP-ASN)
- Inter-departmental consent and data-exchange protocol.
- Securely pulls cadastral maps and jamabandi titles from **Department of Revenue (HimBhoomi)**.
- Integrates with **HP State Cooperative Bank (HPSC)** and NPCI Aadhaar Payment Bridge for DBT disbursement tracing.
- Implements cryptographic **HMAC-SHA256** audit trails for zero-repudiation.

### 2. State Unified Digital Database (SUADR)
- **Soil Profiles**: NPK and micro-nutrient diagnostics per tehsil and district.
- **Micro-Climate Telemetry**: Live temperature, humidity, rainfall probability, and frost warnings.
- **HP Agro-Climatic Zones**: Zone I (Sub-Montane) to Zone IV (High Hills Cold Desert).
- **Rule-based AI Agronomy Advisory**: Generates tailor-made fertilization, irrigation, and natural farming remedies based on soil pH and crop stage.

### 3. Unified Farmer Database (AgriStack Aligned)
- Comprehensive registry with Aadhaar e-KYC hash simulation and auto-generated AgriStack IDs.
- Cadastral Land Parcel Records with Khasra & Khatauni survey numbers, area calculations (Bighas & Hectares), and Geo-coordinates.

### 4. Direct Benefit Transfer (DBT) Schemes Engine
- Complete state machine workflow: `SUBMITTED` ➔ `FIELD_VERIFICATION_PENDING` ➔ `APPROVED_BY_OFFICER` ➔ `DBT_DISBURSED`.
- Schemes included:
  - *HP Mukhyamantri Kisaan Sahayata Yojana (HP-MKSY)*
  - *Prakritik Kheti Khushhal Kisaan Yojana (PK3Y - SPNF)*
  - *HP Saur Sinchayee Yojana (Solar Pump 85% Subsidy)*

### 5. Officer ERP & Field Verification Dashboard
- Designated for District Agriculture Officers (DAO) and Block Technology Managers (BTM).
- Verification queue where officers can inspect land titles, attach site inspection notes, and sanction grants.

---

## 🧪 Testing Backend APIs

To re-run the end-to-end API test suite at any time:
```bash
cd backend
npm test
```

Expected Output:
```
✔ GET /api/health: PASS
✔ POST /api/auth/login (Farmer): PASS
✔ POST /api/auth/login (Officer): PASS
✔ GET /api/farmers: PASS
✔ GET /api/suadr/zones & telemetry: PASS
✔ GET /api/schemes/analytics: PASS
✔ GET /api/hpasn/logs: PASS
✔ GET /api/marketplace/mandi-rates: PASS
ALL BACKEND API TESTS PASSED SUCCESSFULLY! 🚀
```
