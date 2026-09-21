const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const Land = require('../../models/Land');
const Crop = require('../../models/Crop');

// GET /api/lands - List all cadastral land parcels
router.get('/', (req, res) => {
  const store = db.get();
  const allLands = [];

  for (const farmer of (store.farmers || [])) {
    for (const parcel of (farmer.landParcels || [])) {
      const landInstance = new Land({
        ...parcel,
        farmer_id: farmer.farmer_id || farmer.id,
        farmer_name: farmer.name
      });
      allLands.push({
        ...landInstance.toJSON(),
        farmer_name: farmer.name,
        farmer_id: farmer.farmer_id || farmer.id,
        cropsCount: (parcel.crops || []).length
      });
    }
  }

  res.json({
    success: true,
    count: allLands.length,
    data: allLands
  });
});

// GET /api/lands/:id - Get specific land parcel by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  let foundParcel = null;
  let ownerFarmer = null;

  for (const farmer of (store.farmers || [])) {
    const parcel = (farmer.landParcels || []).find(p => 
      p.id === id || p.parcelId === id || p.parcel_id === id || p.khasraNo === id || p.survey_number === id
    );
    if (parcel) {
      foundParcel = parcel;
      ownerFarmer = farmer;
      break;
    }
  }

  if (!foundParcel) {
    return res.status(404).json({ success: false, message: `Land parcel '${id}' not found.` });
  }

  const landInstance = new Land({
    ...foundParcel,
    farmer_id: ownerFarmer.farmer_id || ownerFarmer.id
  });

  res.json({
    success: true,
    farmer: {
      farmer_id: ownerFarmer.farmer_id,
      name: ownerFarmer.name,
      mobile: ownerFarmer.mobile || ownerFarmer.phone
    },
    data: landInstance.toJSON(),
    crops: foundParcel.crops || []
  });
});

// GET /api/lands/:id/crops - View all standing crops for a specific land parcel
router.get('/:id/crops', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  let targetParcel = null;
  let targetFarmer = null;

  for (const farmer of (store.farmers || [])) {
    const parcel = (farmer.landParcels || []).find(p => 
      p.id === id || p.parcelId === id || p.parcel_id === id || p.khasraNo === id || p.survey_number === id
    );
    if (parcel) {
      targetParcel = parcel;
      targetFarmer = farmer;
      break;
    }
  }

  if (!targetParcel) {
    return res.status(404).json({ success: false, message: `Land parcel '${id}' not found.` });
  }

  const crops = (targetParcel.crops || []).map(c => {
    const cropInstance = new Crop({
      ...c,
      land_id: targetParcel.id || targetParcel.parcelId
    });
    return cropInstance.toJSON();
  });

  res.json({
    success: true,
    land_id: targetParcel.id || targetParcel.parcelId,
    survey_number: targetParcel.survey_number || targetParcel.khasraNo,
    farmer_id: targetFarmer.farmer_id || targetFarmer.id,
    farmer_name: targetFarmer.name,
    count: crops.length,
    data: crops
  });
});

// POST /api/lands/:id/crops - Add new standing crop to specific land parcel (Crop: id, land_id, crop_name, crop_type, sowing_date, season, area, status)
router.post('/:id/crops', (req, res) => {
  const { id } = req.params;
  const { crop_name, cropName, crop_type, cropType, sowing_date, sowingDate, season, area, areaBigha, status } = req.body;

  const validation = Crop.validate({
    ...req.body,
    land_id: id
  });

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Crop validation failed.",
      errors: validation.errors
    });
  }

  const cropInstance = new Crop({
    ...req.body,
    land_id: id,
    crop_name: crop_name || cropName || 'Apple',
    crop_type: crop_type || cropType || 'Horticulture / Fruit',
    sowing_date: sowing_date || sowingDate || '2025-02-15',
    season: season || 'Perennial',
    area: Number(area !== undefined ? area : (areaBigha !== undefined ? areaBigha : 2.5)),
    status: status || 'Vegetative'
  });

  const newCrop = cropInstance.toJSON();
  let found = false;
  let targetFarmer = null;

  db.update(store => {
    for (const farmer of (store.farmers || [])) {
      const parcel = (farmer.landParcels || []).find(p => 
        p.id === id || p.parcelId === id || p.parcel_id === id || p.khasraNo === id || p.survey_number === id
      );
      if (parcel) {
        parcel.crops = parcel.crops || [];
        parcel.crops.push(newCrop);
        found = true;
        targetFarmer = farmer;
        break;
      }
    }
    return store;
  });

  if (!found) {
    return res.status(404).json({ success: false, message: `Land parcel '${id}' not found in database.` });
  }

  res.status(201).json({
    success: true,
    message: "Standing Crop successfully registered on Land parcel.",
    model: "Crop (8 Canonical Attributes)",
    land_id: id,
    farmer_id: targetFarmer.farmer_id || targetFarmer.id,
    data: newCrop
  });
});

module.exports = router;
