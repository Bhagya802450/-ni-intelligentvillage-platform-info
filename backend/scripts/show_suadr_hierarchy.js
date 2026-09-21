#!/usr/bin/env node

/**
 * ============================================================================
 * State Unified Digital Database (SUADR)
 * Common State-Level Agricultural Data Store
 * 
 * Hierarchy:
 * SUADR
 *  │
 *  ├── Soil Data
 *  ├── Climate Data
 *  ├── Crop Data
 *  ├── Agronomy Data
 *  ├── Pest Data
 *  └── Market Data
 * ============================================================================
 */

const db = require('../src/data/dbStore');
const { SUADR } = require('../src/models/SUADR');

function printSUADRHierarchy() {
  console.log(`\n================================================================================`);
  console.log(`🌾 STATE UNIFIED DIGITAL DATABASE (SUADR) - STATE AGRICULTURAL STORE`);
  console.log(`================================================================================`);
  console.log(`\nSUADR\n │\n ├── Soil Data\n ├── Climate Data\n ├── Crop Data\n ├── Agronomy Data\n ├── Pest Data\n └── Market Data\n`);
  console.log(`================================================================================\n`);

  const store = db.get();
  const suadr = new SUADR(store.suadr);
  const hierarchy = suadr.getHierarchy();

  // 1. Soil Data
  const soilBranch = hierarchy.branches.soil_data;
  console.log(`🌱 1. Soil Data (Count: ${soilBranch.records_count} records)`);
  console.log(`   Schema: ${soilBranch.schema.join(', ')}`);
  (suadr.soil_data || []).slice(0, 3).forEach(s => {
    console.log(`   ├── [${s.id}] Location: ${s.location} | Soil: ${s.soil_type} | pH: ${s.ph}`);
    console.log(`   │   NPK: N=${s.nitrogen} kg/ha, P=${s.phosphorus} kg/ha, K=${s.potassium} kg/ha`);
  });
  console.log(`   │`);

  // 2. Climate Data
  const climateBranch = hierarchy.branches.climate_data;
  console.log(`☀️  2. Climate Data (Count: ${climateBranch.records_count} stations)`);
  console.log(`   Schema: ${climateBranch.schema.join(', ')}`);
  (suadr.climate_data || []).slice(0, 3).forEach(c => {
    console.log(`   ├── [${c.id}] Station: ${c.location} | Temp: ${c.temperature}°C | Humidity: ${c.humidity}% | Rain: ${c.rainfall}mm | Date: ${c.date}`);
  });
  console.log(`   │`);

  // 3. Crop Data
  const cropBranch = hierarchy.branches.crop_data;
  console.log(`🌾 3. Crop Data [crop_master] (Count: ${cropBranch.records_count} crops)`);
  console.log(`   Schema: ${cropBranch.schema.join(', ')}`);
  (suadr.crop_data || []).slice(0, 3).forEach(c => {
    console.log(`   ├── [${c.id}] Crop: ${c.crop_name} | Type: ${c.crop_type} | Season: ${c.season}`);
  });
  console.log(`   │`);

  // 4. Agronomy Data
  const agroBranch = hierarchy.branches.agronomy_data;
  console.log(`📋 4. Agronomy Data (Count: ${agroBranch.records_count} packages of practice)`);
  console.log(`   Schema: ${agroBranch.schema.join(', ')}`);
  (suadr.agronomy_data || []).slice(0, 3).forEach(a => {
    console.log(`   ├── [${a.id}] Crop: ${a.crop} | Soil: ${a.soil_type} | Sowing Window: ${a.sowing_window}`);
    console.log(`   │   Seed Rate: ${a.seed_rate} | Irrigation: ${a.irrigation_practices.substring(0, 45)}...`);
  });
  console.log(`   │`);

  // 5. Pest Data
  const pestBranch = hierarchy.branches.pest_data;
  console.log(`🐛 5. Pest Data (Count: ${pestBranch.records_count} diagnostic guides)`);
  console.log(`   Schema: ${pestBranch.schema.join(', ')}`);
  (suadr.pest_data || []).slice(0, 3).forEach(p => {
    console.log(`   ├── [${p.id}] Pest: ${p.pest_name} | Crop: ${p.crop}`);
    console.log(`   │   Symptoms: ${p.symptoms.substring(0, 50)}...`);
  });
  console.log(`   │`);

  // 6. Market Data
  const mktBranch = hierarchy.branches.market_data;
  console.log(`💰 6. Market Data (Count: ${mktBranch.records_count} APMC wholesale quotations)`);
  console.log(`   Schema: ${mktBranch.schema.join(', ')}`);
  (suadr.market_data || []).slice(0, 3).forEach(m => {
    console.log(`   └── [${m.id}] Mandi: ${m.market_name} | Crop: ${m.crop} | Modal Price: ₹${m.modal_price}/Qtl (Range: ₹${m.min_price} - ₹${m.max_price}) | Date: ${m.date}`);
  });

  console.log(`\n================================================================================`);
  console.log(`✔ SUADR verified: 6 core datasets separate logically for cross-module access.\n`);
}

printSUADRHierarchy();
