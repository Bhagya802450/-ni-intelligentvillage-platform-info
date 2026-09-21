-- =========================================================================
-- HP Agriculture Service Network (HP-ASN) & SUADR
-- PostgreSQL Relational Schema for Core Platform & Data Backbone
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity & Access Management (IAM) - User & Role Hierarchy
-- Hierarchy Structure:
-- User
--  ├── Farmer
--  ├── Officer
--  └── Admin

CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR(32) PRIMARY KEY,
    parent_role VARCHAR(32) REFERENCES roles(role_id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed User Hierarchy
INSERT INTO roles (role_id, parent_role, name, description) VALUES
('USER', NULL, 'User (Root)', 'Root authenticated identity principal across Himachal Pradesh platform'),
('FARMER', 'USER', 'Farmer', 'Farmer Beneficiary: Access land parcels, Soil Health Cards, DBT subsidies, APMC Mandi, Sentinel-2 NDVI'),
('OFFICER', 'USER', 'Officer', 'Field & Development Officer: Field inspections, Khasra land verification (Patwari), DBT approval (DAO/ADO)'),
('ADMIN', 'USER', 'Admin', 'State Infrastructure Administrator: HP-ASN governance, tamper-proof audit trail, rate limits, IAM configuration')
ON CONFLICT (role_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(32) NOT NULL REFERENCES roles(role_id),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    agristack_id VARCHAR(64) UNIQUE,
    aadhaar_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Unified Farmer Database (AgriStack Aligned)
CREATE TABLE IF NOT EXISTS farmers (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    state VARCHAR(100) DEFAULT 'Himachal Pradesh',
    district VARCHAR(64) NOT NULL,
    block VARCHAR(64),
    village VARCHAR(100) NOT NULL,
    national_farmer_id VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional AgriStack details & legacy aliases
    phone VARCHAR(20),
    tehsil VARCHAR(64),
    agristack_id VARCHAR(64),
    father_name VARCHAR(150),
    gender VARCHAR(16),
    dob DATE,
    pincode VARCHAR(10),
    farmer_category VARCHAR(64) DEFAULT 'Small & Marginal',
    is_natural_farming BOOLEAN DEFAULT FALSE,
    bank_account_no VARCHAR(32),
    bank_ifsc VARCHAR(16),
    bank_name VARCHAR(100),
    is_dbt_linked BOOLEAN DEFAULT TRUE,
    aadhaar_hash VARCHAR(64)
);

-- 3. Cadastral Land Parcel Records (HimBhoomi Linked)
-- Entity: Land
-- Attributes: id, farmer_id, survey_number, area, latitude, longitude, soil_type, irrigation_type
CREATE TABLE IF NOT EXISTS land_parcels (
    id VARCHAR(64) PRIMARY KEY,
    parcel_id VARCHAR(64),
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    survey_number VARCHAR(64) NOT NULL,
    khasra_no VARCHAR(64),
    khatauni_no VARCHAR(64),
    area NUMERIC(8, 2) NOT NULL,
    area_bigha NUMERIC(8, 2),
    area_hectares NUMERIC(8, 2),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    lat NUMERIC(9, 6),
    lng NUMERIC(9, 6),
    soil_type VARCHAR(64) DEFAULT 'Clay Loam',
    irrigation_type VARCHAR(64) DEFAULT 'Rainfed',
    primary_crop VARCHAR(100),
    soil_health_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- View representing canonical Land entity
CREATE OR REPLACE VIEW lands AS
SELECT 
    id,
    farmer_id,
    survey_number,
    area,
    latitude,
    longitude,
    soil_type,
    irrigation_type,
    created_at
FROM land_parcels;

-- 4. Crop Records (Standing Crops Linked to Farmer & Land Parcel)
-- Hierarchy: Farmer ├── Land └── Crop
CREATE TABLE IF NOT EXISTS crops (
    crop_id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    parcel_id VARCHAR(64) NOT NULL REFERENCES land_parcels(parcel_id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    season VARCHAR(32) NOT NULL CHECK (season IN ('Kharif', 'Rabi', 'Zaid', 'Perennial')),
    sowing_date DATE,
    harvest_date DATE,
    area_bigha NUMERIC(8, 2) NOT NULL,
    crop_stage VARCHAR(32) DEFAULT 'Vegetative' CHECK (crop_stage IN ('Sowing', 'Vegetative', 'Flowering', 'Fruiting', 'Ripening', 'Harvested')),
    health_status VARCHAR(32) DEFAULT 'Optimal' CHECK (health_status IN ('Optimal', 'Moderate Stress', 'Severe Stress')),
    estimated_yield_quintals NUMERIC(8, 2),
    actual_yield_quintals NUMERIC(8, 2),
    ndvi_score NUMERIC(4, 2) DEFAULT 0.76,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. State Unified Digital Database (SUADR) - Soil Profiles & Agro-Intelligence
CREATE TABLE IF NOT EXISTS suadr_soil_profiles (
    shc_id VARCHAR(64) PRIMARY KEY,
    district VARCHAR(64) NOT NULL,
    tehsil VARCHAR(64),
    ph NUMERIC(4, 2) NOT NULL,
    nitrogen_kg_ha NUMERIC(6, 2),
    phosphorus_kg_ha NUMERIC(6, 2),
    potassium_kg_ha NUMERIC(6, 2),
    organic_carbon_pct NUMERIC(4, 2),
    zinc_ppm NUMERIC(5, 2),
    boron_ppm NUMERIC(5, 2),
    last_tested DATE DEFAULT CURRENT_DATE,
    agronomy_recommendation TEXT
);

-- 5. DBT Schemes Catalog
CREATE TABLE IF NOT EXISTS schemes (
    scheme_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(150) NOT NULL,
    annual_benefit_inr NUMERIC(10, 2) NOT NULL,
    disbursement_type VARCHAR(100),
    description TEXT,
    eligibility_criteria TEXT
);

-- 6. Scheme Applications & Officer Verification Workflow
CREATE TABLE IF NOT EXISTS scheme_applications (
    application_id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) REFERENCES schemes(scheme_id),
    farmer_id VARCHAR(64) REFERENCES farmers(farmer_id),
    district VARCHAR(64) NOT NULL,
    applied_amount NUMERIC(10, 2) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(64) NOT NULL CHECK (status IN ('SUBMITTED', 'FIELD_VERIFICATION_PENDING', 'APPROVED_BY_OFFICER', 'REJECTED', 'DBT_DISBURSED')),
    officer_remarks TEXT,
    verified_by VARCHAR(150),
    disbursement_date DATE,
    utr_reference VARCHAR(64)
);

-- 7. HP-ASN Inter-Departmental Consent & Data Exchange Audit Trail
CREATE TABLE IF NOT EXISTS hpasn_audit_logs (
    transaction_id VARCHAR(64) PRIMARY KEY,
    source_department VARCHAR(100) NOT NULL,
    target_department VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    farmer_id VARCHAR(64) REFERENCES farmers(farmer_id),
    consent_granted BOOLEAN DEFAULT TRUE,
    consent_method VARCHAR(100),
    response_latency_ms INT,
    hash_signature VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Mandi & Market Prices
CREATE TABLE IF NOT EXISTS mandi_prices (
    mandi_id VARCHAR(64) PRIMARY KEY,
    market_name VARCHAR(150) NOT NULL,
    district VARCHAR(64) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    arrival_date DATE NOT NULL,
    min_price_per_qtl NUMERIC(8, 2),
    max_price_per_qtl NUMERIC(8, 2),
    modal_price_per_qtl NUMERIC(8, 2),
    trend VARCHAR(32)
);

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_farmers_district ON farmers(district);
CREATE INDEX IF NOT EXISTS idx_farmers_agristack ON farmers(agristack_id);
CREATE INDEX IF NOT EXISTS idx_parcels_farmer ON land_parcels(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_farmer ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_parcel ON crops(parcel_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON scheme_applications(status);
CREATE INDEX IF NOT EXISTS idx_mandi_district_commodity ON mandi_prices(district, commodity);
