-- Enable PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Departments / Agencies
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., Corporation Road Dept, Metro Water, TNEB
    contact_email VARCHAR(255) NOT NULL,
    head_officer_name VARCHAR(100)
);

-- 2. Infrastructure Projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id INT REFERENCES departments(id),
    work_type VARCHAR(100) NOT NULL, -- Resurfacing, Pipe Trenching, Cable Laying
    planned_start DATE NOT NULL,
    planned_end DATE NOT NULL,
    actual_start DATE,
    actual_end DATE,
    status VARCHAR(50) DEFAULT 'PROPOSED', -- PROPOSED, APPROVED, ACTIVE, COMPLETED, DISPUTED, CANCELLED
    is_emergency BOOLEAN DEFAULT FALSE,
    emergency_reason TEXT,
    contractor_name VARCHAR(100),
    contractor_phone VARCHAR(20),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Conflicts & Decision Audit Trail
CREATE TABLE conflicts (
    id SERIAL PRIMARY KEY,
    new_project_id INT REFERENCES projects(id),
    existing_project_id INT REFERENCES projects(id),
    conflict_type VARCHAR(100) NOT NULL, -- REPEAT_EXCAVATION_RISK, SPATIAL_SCHEDULE_OVERLAP
    status VARCHAR(50) DEFAULT 'FLAGGED', -- FLAGGED, RESOLVED, OVERRIDDEN
    reasoning_text TEXT,
    decided_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Complaints & Utility Outages
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id), -- Nullable if standalone issue
    department_id INT REFERENCES departments(id),
    category VARCHAR(50) NOT NULL, -- PUBLIC_WORKS, WATER_SUPPLY, ELECTRICITY
    issue_type VARCHAR(100) NOT NULL, -- Pothole, Pipe Burst, Power Outage
    description TEXT,
    is_gps_verified BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, RESOLVED, ESCALATED
    escalation_level INT DEFAULT 1, -- Level 1: Field Officer, Level 2: Zonal Supervisor
    sla_deadline TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Resident Disruption Subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    channel VARCHAR(20) DEFAULT 'SMS', -- SMS or WHATSAPP
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Municipal Departments
INSERT INTO departments (id, name, contact_email, head_officer_name) VALUES
(1, 'Corporation Road Department', 'roads@corporation.gov.in', 'Chief Engineer - Roads'),
(2, 'Chennai Metro Water', 'water@metrowater.gov.in', 'Superintending Engineer - Water'),
(3, 'TNEB Electricity Board', 'power@tneb.gov.in', 'Executive Engineer - Power');

-- Seed Projects for Kancheepuram / Chennai
INSERT INTO projects (title, description, department_id, work_type, planned_start, planned_end, actual_start, actual_end, status, is_emergency, latitude, longitude) VALUES
('Main Road Resurfacing', 'Resurfacing of main road stretch', 1, 'Resurfacing', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '30 days', 'COMPLETED', FALSE, 12.8398, 80.0452),
('Underground Water Pipeline Trenching', 'Laying new pipelines for Metro Water', 2, 'Pipe Trenching', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days', NULL, NULL, 'PROPOSED', FALSE, 12.8398, 80.0452),
('Fiber Optic Cable Trenching', 'Telecom infrastructure upgrade', 3, 'Cable Laying', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days', NULL, 'ACTIVE', FALSE, 12.8405, 80.0460),
('Drainage Repair', 'Fixing blocked storm drains', 1, 'Pipe Trenching', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '6 days', NULL, NULL, 'PROPOSED', FALSE, 12.8405, 80.0460),
('Emergency Main Pipe Repair', 'Fixing burst water main causing flooding', 2, 'Pipe Trenching', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE, NULL, 'ACTIVE', TRUE, 12.8420, 80.0480);
