const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');

// GET all farmers with optional filter
router.get('/', (req, res) => {
  const { district, search } = req.query;
  let list = db.get().farmers;

  if (district && district !== 'All') {
    list = list.filter(f => f.district.toLowerCase() === district.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.agriStackId.toLowerCase().includes(q) ||
      f.phone.includes(q) ||
      f.village.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: list.length, data: list });
});

// GET specific farmer by ID or AgriStack ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const store = db.get();
  const farmer = store.farmers.find(
    f => f.id === id || f.agriStackId === id
  );

  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer record not found in Unified Farmer Database." });
  }

  // Also pull associated soil cards & schemes
  const soilCards = store.suadr.soilProfiles.filter(s => 
    farmer.landParcels.some(p => p.soilHealthId === s.shcId)
  );

  const applications = store.applications.filter(a => a.farmerId === farmer.id);

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
  const {
    name, fatherName, phone, district, tehsil, village, pincode,
    category, aadhaarNumber, naturalFarmingPractitioner, initialLand
  } = req.body;

  if (!name || !phone || !district) {
    return res.status(400).json({ success: false, message: "Name, phone number, and district are mandatory." });
  }

  const newFarmerId = `FARMER-HP-${Math.floor(1000 + Math.random() * 9000)}`;
  const agriStackId = `AGRI-HP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newFarmer = {
    id: newFarmerId,
    agriStackId,
    aadhaarHash: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : "XXXX-XXXX-9999",
    name,
    fatherName: fatherName || "N/A",
    phone,
    gender: req.body.gender || "Male",
    dob: req.body.dob || "1985-01-01",
    district,
    tehsil: tehsil || "Sadar",
    village: village || "Rural",
    pincode: pincode || "171001",
    category: category || "Small & Marginal",
    naturalFarmingPractitioner: !!naturalFarmingPractitioner,
    bankDetails: {
      accountNo: "XXXXXXXX" + Math.floor(1000 + Math.random() * 9000),
      ifsc: "HPSC0000101",
      bankName: "HP State Cooperative Bank",
      dbtLinked: true
    },
    landParcels: initialLand ? [
      {
        parcelId: `LAND-${district.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        khasraNo: initialLand.khasraNo || "101/1",
        khatauniNo: initialLand.khatauniNo || "1",
        areaBigha: Number(initialLand.areaBigha) || 5.0,
        areaHectares: ((Number(initialLand.areaBigha) || 5.0) * 0.08).toFixed(2),
        irrigationType: initialLand.irrigationType || "Rainfed",
        primaryCrop: initialLand.primaryCrop || "Wheat / Maize",
        soilHealthId: `SHC-${district.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        coordinates: { lat: 31.1048, lng: 77.1734 }
      }
    ] : [],
    createdAt: new Date().toISOString()
  };

  db.update(store => {
    store.farmers.unshift(newFarmer);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Farmer registered in Unified Farmer Database (AgriStack linked).",
    data: newFarmer
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
      coordinates: { lat: 31.1 + Math.random() * 0.5, lng: 77.1 + Math.random() * 0.5 }
    };

    farmer.landParcels.push(newParcel);
    updatedFarmer = farmer;
    return store;
  });

  if (!updatedFarmer) {
    return res.status(404).json({ success: false, message: "Farmer not found." });
  }

  res.json({
    success: true,
    message: "Land parcel linked to HimBhoomi cadastral records.",
    data: updatedFarmer
  });
});

module.exports = router;
