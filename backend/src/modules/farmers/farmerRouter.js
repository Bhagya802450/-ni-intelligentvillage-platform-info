const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const Farmer = require('../../models/Farmer');
const Land = require('../../models/Land');
const Crop = require('../../models/Crop');

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

// GET /api/farmers/:id/hierarchy - Visual & Data Model Hierarchy: Farmer ├── Land └── Crop
router.get('/:id/hierarchy', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  const farmer = (store.farmers || []).find(
    f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
  );

  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer not found in Unified Farmer Database." });
  }

  const farmerModel = new Farmer(farmer);
  res.json({
    success: true,
    model: "Unified Farmer Database (AgriStack Aligned)",
    tree: "Farmer ├── Land └── Crop",
    hierarchy: farmerModel.getHierarchy()
  });
});

// GET /api/farmers/:id/land - View Land parcels of a farmer
router.get('/:id/land', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  const farmer = (store.farmers || []).find(
    f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
  );

  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer not found in Unified Farmer Database." });
  }

  res.json({
    success: true,
    farmer_id: farmer.farmer_id,
    farmer_name: farmer.name,
    parcelsCount: (farmer.landParcels || []).length,
    data: farmer.landParcels || []
  });
});

// Add Land Parcel to existing farmer (Land: id, farmer_id, survey_number, area, latitude, longitude, soil_type, irrigation_type)
router.post('/:id/land', (req, res) => {
  const { id } = req.params;
  const { 
    survey_number, khasraNo, 
    khatauniNo, 
    area, areaBigha, 
    latitude, longitude, lat, lng,
    soil_type, soilType,
    irrigation_type, irrigationType, 
    primaryCrop 
  } = req.body;

  const surveyNum = survey_number || khasraNo || "200/1";
  const landArea = Number(area !== undefined ? area : (areaBigha !== undefined ? areaBigha : 4.0));

  let updatedFarmer = null;
  let addedLand = null;

  db.update(store => {
    const farmer = (store.farmers || []).find(
      f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
    );
    if (!farmer) return store;

    const districtPrefix = (farmer.district || 'SHI').substring(0, 3).toUpperCase();
    const parcelId = req.body.id || `LAND-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    const cropName = (primaryCrop || 'Seasonal Crop').split('(')[0].trim();

    const initialCrop = new Crop({
      crop_id: `CROP-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`,
      farmer_id: farmer.farmer_id,
      parcel_id: parcelId,
      crop_name: cropName,
      variety: primaryCrop && primaryCrop.includes('(') ? primaryCrop.split('(')[1].replace(')', '') : 'Standard Cultivar',
      season: cropName.toLowerCase().includes('apple') || cropName.toLowerCase().includes('tea') ? 'Perennial' : 'Kharif',
      area_bigha: landArea,
      crop_stage: 'Vegetative',
      health_status: 'Optimal',
      estimated_yield_quintals: (landArea * 6.5).toFixed(1),
      ndvi_score: 0.78,
      district: farmer.district
    }).toJSON();

    const newParcel = new Land({
      id: parcelId,
      parcelId,
      farmer_id: farmer.farmer_id,
      survey_number: surveyNum,
      khasraNo: surveyNum,
      khatauniNo: khatauniNo || "5",
      area: landArea,
      areaBigha: landArea,
      latitude: Number(latitude !== undefined ? latitude : (lat !== undefined ? lat : (31.1 + Math.random() * 0.5))),
      longitude: Number(longitude !== undefined ? longitude : (lng !== undefined ? lng : (77.1 + Math.random() * 0.5))),
      soil_type: soil_type || soilType || 'Clay Loam',
      irrigation_type: irrigation_type || irrigationType || 'Rainfed',
      primaryCrop: primaryCrop || "Seasonal Crop",
      soilHealthId: `SHC-${districtPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      verificationStatus: "PENDING_PATWARI_VERIFICATION",
      crops: [initialCrop],
      district: farmer.district
    }).toJSON();

    farmer.landParcels = farmer.landParcels || [];
    farmer.landParcels.push(newParcel);
    farmer.updated_at = new Date().toISOString();
    updatedFarmer = farmer;
    addedLand = newParcel;
    return store;
  });

  if (!updatedFarmer) {
    return res.status(404).json({ success: false, message: "Farmer not found." });
  }

  res.status(201).json({
    success: true,
    message: "Land parcel created successfully with all 8 model attributes.",
    model: "Land (id, farmer_id, survey_number, area, latitude, longitude, soil_type, irrigation_type)",
    tree: "Farmer ├── Land └── Crop",
    land: addedLand,
    data: updatedFarmer
  });
});

// GET /api/farmers/:id/crops - View all crops of a farmer
router.get('/:id/crops', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  const farmer = (store.farmers || []).find(
    f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
  );

  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer not found in Unified Farmer Database." });
  }

  const crops = [];
  (farmer.landParcels || []).forEach(p => {
    if (Array.isArray(p.crops)) {
      crops.push(...p.crops);
    }
  });

  res.json({
    success: true,
    farmer_id: farmer.farmer_id,
    farmer_name: farmer.name,
    cropsCount: crops.length,
    data: crops
  });
});

// POST /api/farmers/:id/crops - Add a Crop to a specific Land parcel of a Farmer
router.post('/:id/crops', (req, res) => {
  const { id } = req.params;
  const { parcelId, parcel_id, crop_name, cropName, variety, season, area_bigha, areaBigha, crop_stage, health_status, estimated_yield_quintals, ndvi_score } = req.body;
  const targetParcelId = parcelId || parcel_id;

  if (!targetParcelId) {
    return res.status(400).json({
      success: false,
      message: "Field 'parcelId' is required to link Crop to Land parcel (Farmer ├── Land └── Crop)."
    });
  }

  let addedCrop = null;

  db.update(store => {
    const farmer = (store.farmers || []).find(
      f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
    );
    if (!farmer) return store;

    const parcel = (farmer.landParcels || []).find(
      p => p.parcelId === targetParcelId || p.parcel_id === targetParcelId
    );
    if (!parcel) return store;

    const districtPrefix = (farmer.district || 'HP').substring(0, 3).toUpperCase();
    const cropModel = new Crop({
      crop_id: `CROP-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`,
      farmer_id: farmer.farmer_id,
      parcel_id: parcel.parcelId,
      crop_name: crop_name || cropName || 'Apple',
      variety: variety || 'High Density Cultivar',
      season: season || 'Kharif',
      area_bigha: Number(area_bigha || areaBigha) || Number(parcel.areaBigha) || 4.0,
      crop_stage: crop_stage || 'Vegetative',
      health_status: health_status || 'Optimal',
      estimated_yield_quintals: estimated_yield_quintals !== undefined ? Number(estimated_yield_quintals) : 25.0,
      ndvi_score: ndvi_score !== undefined ? Number(ndvi_score) : 0.81,
      district: farmer.district
    });

    addedCrop = cropModel.toJSON();
    parcel.crops = parcel.crops || [];
    parcel.crops.push(addedCrop);
    farmer.updated_at = new Date().toISOString();
    return store;
  });

  if (!addedCrop) {
    return res.status(404).json({
      success: false,
      message: `Farmer '${id}' or Land Parcel '${targetParcelId}' not found.`
    });
  }

  res.status(201).json({
    success: true,
    message: "Crop successfully registered under Land parcel in Unified Farmer Database.",
    tree: "Farmer ├── Land └── Crop",
    crop: addedCrop
  });
});

// GET /api/farmers/:id/parcels/:parcelId/crops - Crops for specific parcel
router.get('/:id/parcels/:parcelId/crops', (req, res) => {
  const { id, parcelId } = req.params;
  const store = db.get();
  const farmer = (store.farmers || []).find(
    f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
  );

  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer not found." });
  }

  const parcel = (farmer.landParcels || []).find(p => p.parcelId === parcelId || p.parcel_id === parcelId);
  if (!parcel) {
    return res.status(404).json({ success: false, message: `Land Parcel '${parcelId}' not found.` });
  }

  res.json({
    success: true,
    parcelId: parcel.parcelId,
    khasraNo: parcel.khasraNo,
    crops: parcel.crops || []
  });
});

// PATCH /api/farmers/:id/crops/:cropId - Update crop details
router.patch('/:id/crops/:cropId', (req, res) => {
  const { id, cropId } = req.params;
  let updatedCrop = null;

  db.update(store => {
    const farmer = (store.farmers || []).find(
      f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
    );
    if (!farmer) return store;

    for (const parcel of (farmer.landParcels || [])) {
      const crop = (parcel.crops || []).find(c => c.crop_id === cropId || c.cropId === cropId);
      if (crop) {
        ['crop_stage', 'health_status', 'estimated_yield_quintals', 'actual_yield_quintals', 'ndvi_score', 'harvest_date'].forEach(key => {
          if (req.body[key] !== undefined) {
            crop[key] = req.body[key];
          }
        });
        crop.updated_at = new Date().toISOString();
        updatedCrop = crop;
        break;
      }
    }
    return store;
  });

  if (!updatedCrop) {
    return res.status(404).json({ success: false, message: `Crop '${cropId}' not found.` });
  }

  res.json({
    success: true,
    message: "Crop record updated successfully.",
    crop: updatedCrop
  });
});

// PATCH /api/farmers/:id/parcels/:parcelId/verify - Revenue Officer (Patwari) verification
router.patch('/:id/parcels/:parcelId/verify', (req, res) => {
  const { id, parcelId } = req.params;
  const { verifiedBy, officerRemarks, status = "VERIFIED_HIMBHOOMI_MATCH" } = req.body;

  let verifiedParcel = null;

  db.update(store => {
    const farmer = (store.farmers || []).find(
      f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
    );
    if (!farmer) return store;

    const parcel = (farmer.landParcels || []).find(p => p.parcelId === parcelId || p.parcel_id === parcelId);
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
  const farmer = (store.farmers || []).find(
    f => f.id === id || f.farmer_id === id || f.national_farmer_id === id || f.agriStackId === id
  );

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
        cropsCount: (p.crops || []).length,
        crops: p.crops || [],
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
