const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const Farmer = require('../../models/Farmer');

// GET all farmers with optional filter
router.get('/', (req, res) => {
  const { district, block, status, search } = req.query;
  let list = db.get().farmers || [];

  if (district && district !== 'All') {
    list = list.filter(f => (f.district || '').toLowerCase() === district.toLowerCase());
  }

  if (block && block !== 'All') {
    list = list.filter(f => 
      (f.block || f.tehsil || '').toLowerCase() === block.toLowerCase()
    );
  }

  if (status && status !== 'All') {
    list = list.filter(f => (f.status || 'ACTIVE').toUpperCase() === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(f => 
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.farmer_id && f.farmer_id.toLowerCase().includes(q)) ||
      (f.national_farmer_id && f.national_farmer_id.toLowerCase().includes(q)) ||
      (f.agriStackId && f.agriStackId.toLowerCase().includes(q)) ||
      (f.mobile && f.mobile.includes(q)) ||
      (f.phone && f.phone.includes(q)) ||
      (f.village && f.village.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    model: "Unified Farmer Database (AgriStack Aligned)",
    count: list.length,
    data: list
  });
});

// GET specific farmer by ID, farmer_id, or national_farmer_id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  const farmer = (store.farmers || []).find(
    f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
  );

  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer record not found in Unified Farmer Database." });
  }

  // Also pull associated soil cards & schemes
  const soilCards = (store.suadr?.soilProfiles || []).filter(s => 
    farmer.landParcels.some(p => p.soilHealthId === s.shcId)
  );

  const applications = (store.applications || []).filter(a => a.farmerId === farmer.id);

  res.json({
    success: true,
    data: {
      ...farmer,
      soilHealthCards: soilCards,
      schemeApplications: applications
    }
  });
});

// Register new farmer in Unified Farmer Database
router.post('/', (req, res) => {
  const validation = Farmer.validate(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Farmer validation failed in Unified Farmer Database.",
      errors: validation.errors
    });
  }

  const farmerInstance = new Farmer(req.body);
  const newFarmer = farmerInstance.toJSON();

  // If initial land parcel was provided in payload, attach it
  if (req.body.initialLand) {
    const il = req.body.initialLand;
    const districtPrefix = (newFarmer.district || 'SHI').substring(0, 3).toUpperCase();
    newFarmer.landParcels = [
      {
        parcelId: `LAND-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`,
        khasraNo: il.khasraNo || "101/1",
        khatauniNo: il.khatauniNo || "1",
        areaBigha: Number(il.areaBigha) || 5.0,
        areaHectares: ((Number(il.areaBigha) || 5.0) * 0.08).toFixed(2),
        irrigationType: il.irrigationType || "Rainfed",
        primaryCrop: il.primaryCrop || "Wheat / Maize",
        soilHealthId: `SHC-${districtPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
        verificationStatus: "PENDING_PATWARI_VERIFICATION",
        coordinates: { lat: 31.1048, lng: 77.1734 }
      }
    ];
  }

  db.update(store => {
    store.farmers = store.farmers || [];
    store.farmers.unshift(newFarmer);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Farmer registered in Unified Farmer Database (AgriStack linked).",
    data: newFarmer
  });
});

// Update farmer profile
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  let updatedRecord = null;

  db.update(store => {
    const farmer = (store.farmers || []).find(f => 
      f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
    );
    if (!farmer) return store;

    const fields = ['name', 'mobile', 'phone', 'email', 'address', 'state', 'district', 'block', 'tehsil', 'village', 'status', 'category'];
    fields.forEach(fld => {
      if (req.body[fld] !== undefined) {
        farmer[fld] = req.body[fld];
      }
    });

    if (req.body.mobile) farmer.phone = req.body.mobile;
    if (req.body.phone) farmer.mobile = req.body.phone;
    if (req.body.block) farmer.tehsil = req.body.block;
    if (req.body.tehsil) farmer.block = req.body.tehsil;

    farmer.updated_at = new Date().toISOString();
    updatedRecord = farmer;
    return store;
  });

  if (!updatedRecord) {
    return res.status(404).json({ success: false, message: `Farmer '${id}' not found in database.` });
  }

  res.json({
    success: true,
    message: "Farmer profile updated successfully.",
    data: updatedRecord
  });
});

// Deactivate farmer (soft delete)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let deactivated = false;

  db.update(store => {
    const farmer = (store.farmers || []).find(f => 
      f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
    );
    if (farmer) {
      farmer.status = "INACTIVE";
      farmer.updated_at = new Date().toISOString();
      deactivated = true;
    }
    return store;
  });

  if (!deactivated) {
    return res.status(404).json({ success: false, message: `Farmer '${id}' not found in database.` });
  }

  res.json({
    success: true,
    message: `Farmer '${id}' account status marked as INACTIVE.`
  });
});

// Add Land Parcel to existing farmer
router.post('/:id/land', (req, res) => {
  const { id } = req.params;
  const { khasraNo, khatauniNo, areaBigha, irrigationType, primaryCrop } = req.body;

  let updatedFarmer = null;

  db.update(store => {
    const farmer = store.farmers.find(f => f.id === id);
    if (!farmer) return store;

    const newParcel = {
      parcelId: `LAND-${farmer.district.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      khasraNo: khasraNo || "200/1",
      khatauniNo: khatauniNo || "5",
      areaBigha: Number(areaBigha) || 4.0,
      areaHectares: ((Number(areaBigha) || 4.0) * 0.08).toFixed(2),
      irrigationType: irrigationType || "Rainfed",
      primaryCrop: primaryCrop || "Seasonal Crop",
      soilHealthId: `SHC-${farmer.district.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      verificationStatus: "PENDING_PATWARI_VERIFICATION",
      coordinates: { lat: 31.1 + Math.random() * 0.5, lng: 77.1 + Math.random() * 0.5 }
    };

    farmer.landParcels.push(newParcel);
    updatedFarmer = farmer;
    return store;
  });

  if (!updatedFarmer) {
    return res.status(404).json({ success: false, message: "Farmer not found." });
  }

  res.status(201).json({
    success: true,
    message: "Cadastral land parcel added successfully to Unified Farmer Database.",
    data: updatedFarmer
  });
});

// PATCH /api/farmers/:id/parcels/:parcelId/verify - Revenue Officer (Patwari) verification
router.patch('/:id/parcels/:parcelId/verify', (req, res) => {
  const { id, parcelId } = req.params;
  const { verifiedBy, officerRemarks, status = "VERIFIED_HIMBHOOMI_MATCH" } = req.body;

  let verifiedParcel = null;

  db.update(store => {
    const farmer = store.farmers.find(f => f.id === id);
    if (!farmer) return store;

    const parcel = (farmer.landParcels || []).find(p => p.parcelId === parcelId);
    if (!parcel) return store;

    parcel.verificationStatus = status;
    parcel.verifiedBy = verifiedBy || "Ramesh Chand Sharma (PAT-HP-301)";
    parcel.verifiedAt = new Date().toISOString();
    parcel.officerRemarks = officerRemarks || "Physical boundary verified with Halqua Cadastral Sheet & Jamabandi.";
    verifiedParcel = parcel;
    return store;
  });

  if (!verifiedParcel) {
    return res.status(404).json({ success: false, message: "Farmer or Land Parcel not found." });
  }

  res.json({
    success: true,
    message: "Land Parcel successfully verified by Revenue Officer (Patwari).",
    parcel: verifiedParcel
  });
});

// GET /api/farmers/:id/cadastral-geojson - Returns GeoJSON boundary features for parcel
router.get('/:id/cadastral-geojson', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  const farmer = store.farmers.find(f => f.id === id);

  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer not found." });
  }

  const features = (farmer.landParcels || []).map((p, idx) => {
    const lat = p.coordinates?.lat || 31.1215;
    const lng = p.coordinates?.lng || 77.5321;
    const delta = 0.002 * (idx + 1);

    return {
      type: "Feature",
      properties: {
        parcelId: p.parcelId,
        khasraNo: p.khasraNo,
        khatauniNo: p.khatauniNo,
        areaBigha: p.areaBigha,
        areaHectares: p.areaHectares,
        primaryCrop: p.primaryCrop,
        irrigationType: p.irrigationType,
        farmerName: farmer.name,
        verificationStatus: p.verificationStatus || "VERIFIED_HIMBHOOMI_MATCH"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [lng - delta, lat - delta],
          [lng + delta, lat - delta],
          [lng + delta, lat + delta],
          [lng - delta, lat + delta],
          [lng - delta, lat - delta]
        ]]
      }
    };
  });

  res.json({
    type: "FeatureCollection",
    farmerId: farmer.id,
    farmerName: farmer.name,
    features
  });
});

module.exports = router;
