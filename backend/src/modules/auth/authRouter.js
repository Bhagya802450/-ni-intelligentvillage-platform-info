const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');

// Login endpoint for Farmers and Officers
router.post('/login', (req, res) => {
  const { role, identifier, password } = req.body;
  const store = db.get();

  if (role === 'OFFICER') {
    const officer = store.officers.find(
      o => o.id.toLowerCase() === (identifier || '').trim().toLowerCase() ||
           o.email.toLowerCase() === (identifier || '').trim().toLowerCase()
    );
    if (!officer) {
      return res.status(401).json({ success: false, message: "Officer credentials not found in HP-ASN registry." });
    }
    return res.json({
      success: true,
      user: { ...officer, role: "OFFICER" },
      token: `jwt-token-officer-${officer.id}-${Date.now()}`
    });
  }

  // Farmer login
  const farmer = store.farmers.find(
    f => f.phone.replace(/[\s-]/g, '').includes((identifier || '').replace(/[\s-]/g, '')) ||
         f.agriStackId.toLowerCase() === (identifier || '').trim().toLowerCase() ||
         f.id.toLowerCase() === (identifier || '').trim().toLowerCase()
  );

  if (!farmer) {
    return res.status(401).json({ success: false, message: "Farmer not registered. Use demo credentials or register." });
  }

  return res.json({
    success: true,
    user: { ...farmer, role: "FARMER" },
    token: `jwt-token-farmer-${farmer.id}-${Date.now()}`
  });
});

// Aadhaar OTP Verification Simulation for AgriStack linkage
router.post('/verify-aadhaar', (req, res) => {
  const { aadhaarNumber, otp } = req.body;

  if (!aadhaarNumber || aadhaarNumber.length < 12) {
    return res.status(400).json({ success: false, message: "Invalid 12-digit Aadhaar number." });
  }

  if (otp && otp !== "123456") {
    return res.status(400).json({ success: false, message: "Invalid OTP. Use demo OTP 123456." });
  }

  const generatedAgriStackId = `AGRI-HP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  return res.json({
    success: true,
    message: "Aadhaar e-KYC Verified successfully via UIDAI / AgriStack Bridge.",
    agriStackId: generatedAgriStackId,
    verifiedStatus: "AUTHENTICATED",
    ekycDetails: {
      state: "Himachal Pradesh",
      status: "ACTIVE",
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
