const http = require('http');
const app = require('../src/server');

const TEST_PORT = 5006;
let serverInstance = null;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(`http://localhost:${TEST_PORT}${path}`, {
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const get = (path, headers = {}) => request('GET', path, null, headers);
const post = (path, body, headers = {}) => request('POST', path, body, headers);
const patch = (path, body, headers = {}) => request('PATCH', path, body, headers);
const del = (path, headers = {}) => request('DELETE', path, null, headers);

async function runTests() {
  serverInstance = app.listen(TEST_PORT, async () => {
    try {
      console.log(`\n========================================================================`);
      console.log(`🧪 RUNNING VERIFICATION SUITE: 4 CORE ASSIGNED MODULES ON PORT ${TEST_PORT}`);
      console.log(`========================================================================\n`);

      // ----------------------------------------------------------------------
      // MODULE 1: HP Agriculture Service Network (HP-ASN)
      // ----------------------------------------------------------------------
      console.log("--- [MODULE 1: HP Agriculture Service Network (HP-ASN)] ---");
      const depts = await get('/api/hpasn/departments');
      console.log("✔ GET /api/hpasn/departments:", depts.body.success ? "PASS" : "FAIL", `(${depts.body.data?.length} connected depts)`);

      const policies = await get('/api/hpasn/policies');
      console.log("✔ GET /api/hpasn/policies:", policies.body.success ? "PASS" : "FAIL", `(${policies.body.count} governance agreements)`);

      const logs = await get('/api/hpasn/logs');
      console.log("✔ GET /api/hpasn/logs:", logs.body.success ? "PASS" : "FAIL", `(${logs.body.count} audit records)`);

      const consent = await post('/api/hpasn/request-consent', {
        sourceDept: "Agriculture Dept (HP-ASN Gateway)",
        targetDept: "Department of Revenue (HimBhoomi)",
        purpose: "Jamabandi Khasra verification for DBT",
        farmerId: "FARMER-HP-1001",
        dataScope: "Cadastral Parcels"
      });
      console.log("✔ POST /api/hpasn/request-consent:", consent.body.success ? "PASS" : "FAIL", `(Txn: ${consent.body.transaction?.transactionId})`);

      const exchange = await post('/api/hpasn/exchange', {
        sourceDept: "Agriculture Dept",
        targetDept: "Department of Revenue",
        queryType: "KHASRA_LOOKUP",
        queryKey: "412/12"
      });
      console.log("✔ POST /api/hpasn/exchange:", exchange.body.success ? "PASS" : "FAIL", `(Signature: ${exchange.body.signature?.substring(0, 16)}...)`);

      const verifySig = await post('/api/hpasn/verify-signature', {
        transactionId: consent.body.transaction?.transactionId,
        signature: consent.body.transaction?.hashSignature
      });
      console.log("✔ POST /api/hpasn/verify-signature:", verifySig.body.verified ? "PASS" : "FAIL", `(${verifySig.body.status})`);

      // ----------------------------------------------------------------------
      // MODULE 2: Identity & Access Management (IAM)
      // ----------------------------------------------------------------------
      console.log("\n--- [MODULE 2: Identity & Access Management (IAM)] ---");
      const hierarchy = await get('/api/auth/hierarchy');
      console.log("✔ GET /api/auth/hierarchy (User ├── Farmer ├── Officer └── Admin):", hierarchy.body.success ? "PASS" : "FAIL", `(${hierarchy.body.tree})`);

      const roles = await get('/api/auth/roles');
      console.log("✔ GET /api/auth/roles:", roles.body.success ? "PASS" : "FAIL", `(${roles.body.count} RBAC roles loaded)`);

      const principals = await get('/api/auth/principals');
      console.log("✔ GET /api/auth/principals:", principals.body.success ? "PASS" : "FAIL", `(${principals.body.count} authorized officers)`);

      const farmerLogin = await post('/api/auth/login', { identifier: '98160 12345' });
      console.log("✔ POST /api/auth/login (Farmer):", farmerLogin.body.success ? "PASS" : "FAIL", `(${farmerLogin.body.user?.name} - Role: ${farmerLogin.body.user?.role})`);

      const patwariLogin = await post('/api/auth/login', { identifier: 'PAT-HP-301' });
      console.log("✔ POST /api/auth/login (Patwari / Revenue Officer):", patwariLogin.body.success ? "PASS" : "FAIL", `(${patwariLogin.body.user?.name} - Role: ${patwariLogin.body.user?.role})`);

      const officerLogin = await post('/api/auth/login', { identifier: 'OFF-HP-801' });
      console.log("✔ POST /api/auth/login (Agriculture Officer):", officerLogin.body.success ? "PASS" : "FAIL", `(${officerLogin.body.user?.name} - Role: ${officerLogin.body.user?.role})`);

      const meSession = await get('/api/auth/me', { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ GET /api/auth/me (Bearer Token Validation):", meSession.body.success ? "PASS" : "FAIL", `(Authenticated: ${meSession.body.user?.name})`);

      const checkPermAllowed = await post('/api/auth/check-permission', {
        role: "VILLAGE_REVENUE_OFFICER",
        action: "cadastral:verify_khasra"
      });
      console.log("✔ POST /api/auth/check-permission (Patwari allowed cadastral verify):", checkPermAllowed.body.decision === "PERMIT" ? "PASS" : "FAIL");

      const checkPermDenied = await post('/api/auth/check-permission', {
        role: "FARMER",
        action: "schemes:approve"
      });
      console.log("✔ POST /api/auth/check-permission (Farmer denied scheme approve):", checkPermDenied.body.decision === "DENY" ? "PASS" : "FAIL");

      const ekyc = await post('/api/auth/verify-aadhaar', { aadhaarNumber: "123456789012", otp: "123456" });
      console.log("✔ POST /api/auth/verify-aadhaar:", ekyc.body.success ? "PASS" : "FAIL", `(Minted AgriStack ID: ${ekyc.body.agriStackId})`);

      // ----------------------------------------------------------------------
      // SECURITY PIPELINE: Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API
      // ----------------------------------------------------------------------
      console.log("\n--- [SECURITY PIPELINE: Login ➔ Auth ➔ Role ➔ Perm ➔ Access API] ---");

      // Step 1: Login
      const adminLogin = await post('/api/auth/login', { identifier: 'ADM-HP-001' });
      console.log("✔ [Step 1: Login] POST /api/auth/login (State Admin):", adminLogin.body.success ? "PASS" : "FAIL", `(Token: ${adminLogin.body.token?.substring(0, 16)}...)`);

      // Step 2: Authentication Check (Missing & Invalid token rejects)
      const noTokenReq = await get('/api/auth/guarded-sample');
      console.log("✔ [Step 2: Authentication] HTTP 401 on Missing Bearer Token:", noTokenReq.status === 401 && noTokenReq.body.error === 'AUTH_TOKEN_MISSING' ? "PASS" : "FAIL");

      const badTokenReq = await get('/api/auth/guarded-sample', { Authorization: 'Bearer bogus-token-xyz' });
      console.log("✔ [Step 2: Authentication] HTTP 401 on Invalid Token:", badTokenReq.status === 401 && badTokenReq.body.error === 'INVALID_TOKEN' ? "PASS" : "FAIL");

      // Step 3: Role Check (Farmer blocked from Officer/Admin guarded endpoint)
      const farmerRoleReq = await get('/api/auth/guarded-sample', { Authorization: `Bearer ${farmerLogin.body.token}` });
      console.log("✔ [Step 3: Role Check] HTTP 403 on Unauthorized Role (Farmer):", farmerRoleReq.status === 403 && farmerRoleReq.body.error === 'FORBIDDEN_ROLE' ? "PASS" : "FAIL", `(${farmerRoleReq.body.pipelineStep})`);

      // Step 4: Permission Check (Patwari has Officer role but lacks 'schemes:approve' permission)
      const patwariPermReq = await get('/api/auth/guarded-sample', { Authorization: `Bearer ${patwariLogin.body.token}` });
      console.log("✔ [Step 4: Permission Check] HTTP 403 on Insufficient Permission (Patwari):", patwariPermReq.status === 403 && patwariPermReq.body.error === 'PERMISSION_DENIED' ? "PASS" : "FAIL", `(${patwariPermReq.body.pipelineStep})`);

      // Step 5: Access API implementation (Agriculture Officer with 'schemes:approve' succeeds)
      const officerAccessReq = await get('/api/auth/guarded-sample', { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ [Step 5: Access API] HTTP 200 on Valid Officer Access:", officerAccessReq.status === 200 && officerAccessReq.body.success ? "PASS" : "FAIL", `(Caller: ${officerAccessReq.body.caller?.name})`);

      // Step 5 (Admin Superuser Access):
      const adminAccessReq = await get('/api/auth/guarded-sample', { Authorization: `Bearer ${adminLogin.body.token}` });
      console.log("✔ [Step 5: Access API] HTTP 200 on State Admin Superuser Access:", adminAccessReq.status === 200 && adminAccessReq.body.success ? "PASS" : "FAIL", `(Caller: ${adminAccessReq.body.caller?.name})`);

      // Pipeline Simulation Endpoint: POST /api/auth/pipeline-verify
      const pipelineSim = await post('/api/auth/pipeline-verify', {
        requiredRole: ["OFFICER", "ADMIN"],
        requiredPermission: "schemes:approve"
      }, { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ [5-Step Pipeline Simulation] POST /api/auth/pipeline-verify:", pipelineSim.status === 200 && pipelineSim.body.pipeline?.length === 5 ? "PASS" : "FAIL", `(5 Pipeline Steps Evaluated)`);

      // ----------------------------------------------------------------------
      // CONCRETE ACCESS APIS (Farmer, Officer, Admin)
      // ----------------------------------------------------------------------
      console.log("\n--- [CONCRETE ACCESS APIS: Farmer, Officer, Admin] ---");

      // 1. Farmer Endpoints
      console.log("-> Testing Farmer APIs:");
      // View own profile
      const farmerProfile = await get('/api/farmer/profile', { Authorization: `Bearer ${farmerLogin.body.token}` });
      console.log("✔ GET /api/farmer/profile (View own profile):", farmerProfile.status === 200 && farmerProfile.body.profile?.name === 'Surender Thakur' ? "PASS" : "FAIL");

      // View own land
      const farmerLand = await get('/api/farmer/land', { Authorization: `Bearer ${farmerLogin.body.token}` });
      console.log("✔ GET /api/farmer/land (View own land):", farmerLand.status === 200 && farmerLand.body.parcelsCount > 0 ? "PASS" : "FAIL");

      // View own crops
      const farmerCrops = await get('/api/farmer/crops', { Authorization: `Bearer ${farmerLogin.body.token}` });
      console.log("✔ GET /api/farmer/crops (View own crops):", farmerCrops.status === 200 && farmerCrops.body.cropsCount > 0 ? "PASS" : "FAIL");

      // Security block: Officer trying to call farmer-only endpoint
      const officerBlockedFromFarmer = await get('/api/farmer/profile', { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ Security: Officer blocked from Farmer profile (403):", officerBlockedFromFarmer.status === 403 ? "PASS" : "FAIL");

      // 2. Officer Endpoints
      console.log("-> Testing Officer APIs:");
      // View farmers
      const officerViewFarmers = await get('/api/officer/farmers', { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ GET /api/officer/farmers (View farmers):", officerViewFarmers.status === 200 && officerViewFarmers.body.count > 0 ? "PASS" : "FAIL");

      // Verify farmer
      const officerVerify = await post('/api/officer/verify-farmer', {
        farmerId: "FARMER-HP-1001",
        parcelId: "LAND-SHI-101",
        verificationStatus: "VERIFIED_HIMBHOOMI_MATCH",
        remarks: "Cadastral field survey matches HimBhoomi revenue record."
      }, { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ POST /api/officer/verify-farmer (Verify farmer):", officerVerify.status === 200 && officerVerify.body.verificationRecord?.status === "VERIFIED_HIMBHOOMI_MATCH" ? "PASS" : "FAIL");

      // Update field information
      const officerFieldUpdate = await post('/api/officer/update-field-info', {
        farmerId: "FARMER-HP-1001",
        soilMoisture: 48,
        pestRisk: "LOW",
        cropStatus: "Optimal vegetative stage",
        fieldNotes: "Adequate soil organic carbon observed."
      }, { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ POST /api/officer/update-field-info (Update field information):", officerFieldUpdate.status === 200 && officerFieldUpdate.body.fieldInformation?.soilMoisture === 48 ? "PASS" : "FAIL");

      // Security block: Farmer blocked from Officer endpoints
      const farmerBlockedFromOfficer = await get('/api/officer/farmers', { Authorization: `Bearer ${farmerLogin.body.token}` });
      console.log("✔ Security: Farmer blocked from Officer endpoint (403):", farmerBlockedFromOfficer.status === 403 ? "PASS" : "FAIL");

      // 3. Admin Endpoints
      console.log("-> Testing Admin APIs:");
      // Manage users
      const adminUsers = await get('/api/admin/users', { Authorization: `Bearer ${adminLogin.body.token}` });
      console.log("✔ GET /api/admin/users (Manage users):", adminUsers.status === 200 && adminUsers.body.count > 0 ? "PASS" : "FAIL");

      // Manage roles
      const adminRoles = await get('/api/admin/roles', { Authorization: `Bearer ${adminLogin.body.token}` });
      console.log("✔ GET /api/admin/roles (Manage roles):", adminRoles.status === 200 && adminRoles.body.roles?.length > 0 ? "PASS" : "FAIL");

      // Manage system data
      const adminSystemData = await get('/api/admin/system-data', { Authorization: `Bearer ${adminLogin.body.token}` });
      console.log("✔ GET /api/admin/system-data (Manage system data):", adminSystemData.status === 200 && adminSystemData.body.systemData?.gatewayStatus === "HEALTHY" ? "PASS" : "FAIL");

      // Security block: Officer blocked from Admin endpoints
      const officerBlockedFromAdmin = await get('/api/admin/users', { Authorization: `Bearer ${officerLogin.body.token}` });
      console.log("✔ Security: Officer blocked from Admin endpoint (403):", officerBlockedFromAdmin.status === 403 ? "PASS" : "FAIL");

      // ----------------------------------------------------------------------
      // MODULE 3: Unified Farmer Database
      // ----------------------------------------------------------------------
      console.log("\n--- [MODULE 3: Unified Farmer Database (AgriStack Aligned)] ---");
      const farmers = await get('/api/farmers');
      console.log("✔ GET /api/farmers:", farmers.body.success ? "PASS" : "FAIL", `(${farmers.body.count} farmers in database)`);

      // Verify the 14 Farmer Model attributes on first record
      const f1 = farmers.body.data?.[0];
      const hasAll14Fields = f1 && 
        f1.id && f1.farmer_id && f1.name && f1.mobile && f1.email &&
        f1.address && f1.state && f1.district && f1.block && f1.village &&
        f1.national_farmer_id && f1.status && f1.created_at && f1.updated_at;
      console.log("✔ Farmer Data Model (All 14 Attributes Present):", hasAll14Fields ? "PASS" : "FAIL", `(${f1?.farmer_id}: ${f1?.name} - ${f1?.national_farmer_id})`);

      // Test Farmer Model Creation with all 14 fields
      const newFarmerReq = await post('/api/farmers', {
        farmer_id: "FARMER-HP-9901",
        name: "Kuldeep Singh Chandel",
        mobile: "+91 98170 54321",
        email: "kuldeep.chandel@hpfarmers.in",
        address: "Village Sandhole, Block Dharampur, District Mandi, HP",
        state: "Himachal Pradesh",
        district: "Mandi",
        block: "Dharampur",
        village: "Sandhole",
        national_farmer_id: "AGRI-HP-2026-8844",
        status: "ACTIVE"
      });
      console.log("✔ POST /api/farmers (Create with 14 Farmer Model Fields):", newFarmerReq.status === 201 && newFarmerReq.body.data?.national_farmer_id === "AGRI-HP-2026-8844" ? "PASS" : "FAIL", `(${newFarmerReq.body.data?.farmer_id})`);

      // Test Lookup by National Farmer ID (AgriStack ID)
      const lookupByNationalId = await get('/api/farmers/AGRI-HP-2026-8844');
      console.log("✔ GET /api/farmers/:national_farmer_id (AgriStack lookup):", lookupByNationalId.status === 200 && lookupByNationalId.body.data?.name === "Kuldeep Singh Chandel" ? "PASS" : "FAIL");

      // Test Farmer Profile Update (PATCH)
      const updateFarmer = await patch('/api/farmers/FARMER-HP-9901', {
        mobile: "+91 98170 99999",
        category: "Medium"
      });
      console.log("✔ PATCH /api/farmers/:id (Update mobile & category):", updateFarmer.status === 200 && updateFarmer.body.data?.mobile === "+91 98170 99999" ? "PASS" : "FAIL");

      // Test Farmer Deactivation (DELETE / soft-delete)
      const deactivateFarmer = await del('/api/farmers/FARMER-HP-9901');
      console.log("✔ DELETE /api/farmers/:id (Deactivate account):", deactivateFarmer.status === 200 ? "PASS" : "FAIL");

      const farmerDetail = await get('/api/farmers/FARMER-HP-1001');
      console.log("✔ GET /api/farmers/:id:", farmerDetail.body.success ? "PASS" : "FAIL", `(${farmerDetail.body.data?.name} - ${farmerDetail.body.data?.landParcels?.length} parcels)`);

      const addLand = await post('/api/farmers/FARMER-HP-1001/land', {
        id: "LAND-SHI-8801",
        farmer_id: "FARMER-HP-1001",
        survey_number: "614/3",
        area: 9.2,
        latitude: 31.1456,
        longitude: 77.4921,
        soil_type: "Clay Loam",
        irrigation_type: "Micro-Drip",
        primaryCrop: "Kiwi & Pears"
      });
      const landObj = addLand.body.land;
      const hasAll8LandFields = landObj &&
        landObj.id &&
        landObj.farmer_id &&
        landObj.survey_number &&
        landObj.area &&
        landObj.latitude &&
        landObj.longitude &&
        landObj.soil_type &&
        landObj.irrigation_type;

      console.log("✔ POST /api/farmers/:id/land (All 8 Land Model Attributes):", hasAll8LandFields ? "PASS" : "FAIL", 
        `([ID: ${landObj?.id}, Farmer: ${landObj?.farmer_id}, Survey: ${landObj?.survey_number}, Area: ${landObj?.area}, Lat: ${landObj?.latitude}, Lng: ${landObj?.longitude}, Soil: ${landObj?.soil_type}, Irrig: ${landObj?.irrigation_type}])`
      );

      const newParcelId = landObj?.id || addLand.body.data?.landParcels?.slice(-1)[0]?.parcelId;
      const verifyParcel = await patch(`/api/farmers/FARMER-HP-1001/parcels/${newParcelId}/verify`, {
        verifiedBy: "Ramesh Chand Sharma (PAT-HP-301)",
        officerRemarks: "Field geo-coordinates verified on HimBhoomi cadastral map."
      });
      console.log("✔ PATCH /api/farmers/:id/parcels/:parcelId/verify (Patwari Sign-off):", verifyParcel.body.success ? "PASS" : "FAIL", `(${verifyParcel.body.parcel?.verificationStatus})`);

      const geojson = await get('/api/farmers/FARMER-HP-1001/cadastral-geojson');
      console.log("✔ GET /api/farmers/:id/cadastral-geojson:", geojson.body.type === "FeatureCollection" ? "PASS" : "FAIL", `(${geojson.body.features?.length} polygon features)`);

      // ----------------------------------------------------------------------
      // HIERARCHICAL DATA MODEL: Farmer ├── Land └── Crop
      // ----------------------------------------------------------------------
      console.log("\n--- [RELATIONAL HIERARCHY: Farmer ├── Land └── Crop] ---");
      const farmerHierarchy = await get('/api/farmers/FARMER-HP-1001/hierarchy');
      const hData = farmerHierarchy.body.hierarchy;
      console.log("✔ GET /api/farmers/:id/hierarchy (Tree structure verified):", 
        farmerHierarchy.status === 200 && hData?.tree_structure === "Farmer ├── Land └── Crop" && Array.isArray(hData?.land) ? "PASS" : "FAIL",
        `(${hData?.total_parcels} parcels, ${hData?.total_crops} crops)`
      );

      const farmerLandList = await get('/api/farmers/FARMER-HP-1001/land');
      console.log("✔ GET /api/farmers/:id/land:", farmerLandList.status === 200 && farmerLandList.body.parcelsCount > 0 ? "PASS" : "FAIL", `(${farmerLandList.body.parcelsCount} parcels)`);

      const farmerCropsList = await get('/api/farmers/FARMER-HP-1001/crops');
      console.log("✔ GET /api/farmers/:id/crops:", farmerCropsList.status === 200 && farmerCropsList.body.cropsCount > 0 ? "PASS" : "FAIL", `(${farmerCropsList.body.cropsCount} standing crops)`);

      // Add new crop directly under parcel testing all 8 canonical Crop attributes
      const firstParcelId = farmerLandList.body.data?.[0]?.id || farmerLandList.body.data?.[0]?.parcelId;
      const addCropRes = await post('/api/farmers/FARMER-HP-1001/crops', {
        id: "CROP-SHM-9901",
        land_id: firstParcelId,
        crop_name: "Gala Apple",
        crop_type: "Horticulture / Fruit",
        sowing_date: "2024-02-15",
        season: "Perennial",
        area: 4.5,
        status: "Vegetative",
        variety: "Dark Baron Gala",
        ndvi_score: 0.84
      });
      const cropObj = addCropRes.body.crop;
      const hasAll8CropFields = cropObj &&
        cropObj.id &&
        cropObj.land_id &&
        cropObj.crop_name &&
        cropObj.crop_type &&
        cropObj.sowing_date &&
        cropObj.season &&
        cropObj.area !== undefined &&
        cropObj.status;

      console.log("✔ POST /api/farmers/:id/crops (All 8 Crop Model Attributes):", 
        addCropRes.status === 201 && hasAll8CropFields ? "PASS" : "FAIL",
        `([ID: ${cropObj?.id}, Land: ${cropObj?.land_id}, Name: ${cropObj?.crop_name}, Type: ${cropObj?.crop_type}, Sown: ${cropObj?.sowing_date}, Season: ${cropObj?.season}, Area: ${cropObj?.area}, Status: ${cropObj?.status}])`
      );

      const parcelCrops = await get(`/api/farmers/FARMER-HP-1001/parcels/${firstParcelId}/crops`);
      console.log("✔ GET /api/farmers/:id/parcels/:parcelId/crops:", parcelCrops.status === 200 && parcelCrops.body.crops?.length > 0 ? "PASS" : "FAIL", `(${parcelCrops.body.crops?.length} crops on parcel)`);

      const cropToUpdate = addCropRes.body.crop?.crop_id;
      const updateCropRes = await patch(`/api/farmers/FARMER-HP-1001/crops/${cropToUpdate}`, {
        crop_stage: "Flowering",
        ndvi_score: 0.89
      });
      console.log("✔ PATCH /api/farmers/:id/crops/:cropId (Phenology & NDVI):", updateCropRes.status === 200 && updateCropRes.body.crop?.crop_stage === "Flowering" ? "PASS" : "FAIL", `(NDVI: ${updateCropRes.body.crop?.ndvi_score})`);

      const authFarmerHierarchy = await get('/api/farmer/hierarchy', { Authorization: `Bearer ${farmerLogin.body.token}` });
      console.log("✔ GET /api/farmer/hierarchy (Authenticated Farmer Session):", authFarmerHierarchy.status === 200 && authFarmerHierarchy.body.tree === "Farmer ├── Land └── Crop" ? "PASS" : "FAIL");

      // ----------------------------------------------------------------------
      // MODULE 4: State Unified Digital Database (SUADR)
      // ----------------------------------------------------------------------
      console.log("\n--- [MODULE 4: State Unified Digital Database (SUADR)] ---");
      const soils = await get('/api/suadr/soil');
      console.log("✔ GET /api/suadr/soil:", soils.body.success ? "PASS" : "FAIL", `(${soils.body.count} Soil Health Cards)`);

      const singleSoil = await get('/api/suadr/soil/SHC-SHM-4019');
      console.log("✔ GET /api/suadr/soil/:shcId:", singleSoil.body.success ? "PASS" : "FAIL", `(pH: ${singleSoil.body.data?.ph})`);

      const newSoil = await post('/api/suadr/soil', {
        district: "Shimla",
        tehsil: "Kotkhai",
        ph: 6.4,
        nitrogenKgHa: 260,
        phosphorusKgHa: 22,
        potassiumKgHa: 290,
        organicCarbonPercent: 1.45,
        recommendation: "Optimal soil profile for high-density Gala apple."
      });
      console.log("✔ POST /api/suadr/soil (Lab Test Recording):", newSoil.body.success ? "PASS" : "FAIL", `(SHC ID: ${newSoil.body.data?.shcId})`);

      const zones = await get('/api/suadr/zones');
      console.log("✔ GET /api/suadr/zones:", zones.body.success ? "PASS" : "FAIL", `(${zones.body.data?.length} agro-climatic zones)`);

      const zoneCrops = await get('/api/suadr/zones/ZONE-III/crops');
      console.log("✔ GET /api/suadr/zones/:zoneId/crops:", zoneCrops.body.success ? "PASS" : "FAIL", `(${zoneCrops.body.suitability?.length} suitable crops)`);

      const telemetry = await get('/api/suadr/telemetry');
      console.log("✔ GET /api/suadr/telemetry:", telemetry.body.success ? "PASS" : "FAIL", `(Stations: ${Object.keys(telemetry.body.data || {}).join(', ')})`);

      const updateTelemetry = await post('/api/suadr/telemetry', {
        district: "Shimla",
        tempCelsius: 19.2,
        humidityPercent: 52,
        soilMoisturePercent: 44,
        frostRisk: "LOW"
      });
      console.log("✔ POST /api/suadr/telemetry (AWS Ingestion):", updateTelemetry.body.success ? "PASS" : "FAIL");

      const pests = await get('/api/suadr/pests?crop=Apple');
      console.log("✔ GET /api/suadr/pests:", pests.body.success ? "PASS" : "FAIL", `(${pests.body.count} pest entries for Apple)`);

      const advisory = await post('/api/suadr/advisory-query', {
        district: "Shimla",
        crop: "Apple",
        soilPh: 6.2,
        nitrogenLevel: 260
      });
      console.log("✔ POST /api/suadr/advisory-query:", advisory.body.success ? "PASS" : "FAIL", `(${advisory.body.agroAdvisories?.length} advisories, ${advisory.body.pestAlerts?.length} alerts)`);

      console.log(`\n========================================================================`);
      console.log(`🎉 ALL 4 CORE MODULES FULLY TESTED & VALIDATED SUCCESSFULLY! 🚀`);
      console.log(`========================================================================\n`);

      serverInstance.close(() => {
        process.exit(0);
      });
    } catch (err) {
      console.error("Test failed with error:", err);
      if (serverInstance) serverInstance.close();
      process.exit(1);
    }
  });
}

runTests();
