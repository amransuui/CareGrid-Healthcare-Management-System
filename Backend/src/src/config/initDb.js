const { pool } = require('./db');
const bcrypt = require('bcryptjs');

const createTablesSql = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Patients table
  CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    age INTEGER,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    date_of_birth VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    admission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    department VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    bed VARCHAR(50) NOT NULL,
    attending_doctor VARCHAR(150) NOT NULL,
    assigned_nurse VARCHAR(150) NOT NULL,
    diagnosis TEXT,
    status VARCHAR(50) DEFAULT 'stable',
    allergies JSONB DEFAULT '[]'::jsonb,
    medications JSONB DEFAULT '[]'::jsonb,
    admission_type VARCHAR(50) DEFAULT 'elective',
    notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Vitals table
  CREATE TABLE IF NOT EXISTS vitals (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(patient_id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    heart_rate INTEGER NOT NULL,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    temperature NUMERIC(4, 1) NOT NULL,
    spo2 INTEGER NOT NULL,
    respiratory_rate INTEGER NOT NULL,
    notes TEXT,
    recorded_by VARCHAR(150) NOT NULL
  );

  -- Wards table
  CREATE TABLE IF NOT EXISTS wards (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    prefix VARCHAR(50) NOT NULL,
    bed_count INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL
  );

  -- Beds table
  CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(100) PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    patient_id VARCHAR(100),
    last_cleaned TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Care Timeline table
  CREATE TABLE IF NOT EXISTS care_timeline (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(patient_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    author VARCHAR(150) NOT NULL,
    author_role VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    status_label VARCHAR(100) NOT NULL
  );

  -- Blood inventory table
  CREATE TABLE IF NOT EXISTS blood_inventory (
    id VARCHAR(100) PRIMARY KEY,
    blood_group VARCHAR(10) NOT NULL,
    units INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'adequate',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Blood requests table
  CREATE TABLE IF NOT EXISTS blood_requests (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100),
    patient_name VARCHAR(150) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    units_requested INTEGER NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    requested_by VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Medicines inventory table
  CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    category VARCHAR(100),
    stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    min_threshold INTEGER DEFAULT 10,
    price NUMERIC(10, 2) NOT NULL,
    expiry_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Prescriptions table
  CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100),
    patient_name VARCHAR(150) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Billing invoices table
  CREATE TABLE IF NOT EXISTS billing_invoices (
    id VARCHAR(100) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    patient_id VARCHAR(100),
    patient_name VARCHAR(150) NOT NULL,
    admission_date VARCHAR(100),
    discharge_date VARCHAR(100),
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    balance NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Organ donations table
  CREATE TABLE IF NOT EXISTS organ_donations (
    id VARCHAR(100) PRIMARY KEY,
    organ_type VARCHAR(100) NOT NULL,
    donor_id VARCHAR(100),
    donor_name VARCHAR(150) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    preservation_start TIMESTAMP WITH TIME ZONE,
    max_ischemic_hours INTEGER,
    status VARCHAR(50) DEFAULT 'available',
    recipient_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

const seedDatabase = async () => {
  const hashedPassword = await bcrypt.hash('Caregrid@2026', 10);

  // Check if users exist
  const userCheck = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial demo users...');
    const users = [
      { id: 'usr_doc_001', fullName: 'Dr. Shahid Hasan', email: 'shahid.hasan@caregrid.io', phone: '+8801712345601', role: 'doctor' },
      { id: 'usr_nur_001', fullName: 'Ayesha Malik', email: 'ayesha.malik@caregrid.io', phone: '+8801812345602', role: 'nurse' },
      { id: 'usr_bld_001', fullName: 'Fatima Noor', email: 'fatima.noor@caregrid.io', phone: '+8801912345603', role: 'blood_bank_coordinator' },
      { id: 'usr_phr_001', fullName: 'Imran Chowdhury', email: 'imran.chowdhury@caregrid.io', phone: '+8801612345604', role: 'pharmacist' },
      { id: 'usr_bil_001', fullName: 'Rana Khan', email: 'rana.khan@caregrid.io', phone: '+8801512345605', role: 'billing_officer' },
      { id: 'usr_fam_001', fullName: 'Tanvir Ahmed', email: 'tanvir.ahmed@caregrid.io', phone: '+8801312345606', role: 'patient_family' }
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, full_name, email, phone, role, password)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.fullName, u.email, u.phone, u.role, hashedPassword]
      );
    }
  }

  // Check if patients exist
  const patientCheck = await pool.query('SELECT COUNT(*) FROM patients');
  if (parseInt(patientCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial patients...');
    const samplePatients = [
      {
        patientId: 'P-2026-1042',
        fullName: 'Mohammad Rahman',
        age: 55,
        gender: 'male',
        bloodGroup: 'O+',
        dateOfBirth: '1971-04-18',
        phone: '+8801712345001',
        emergencyContact: 'Rafiq Rahman (Son) · +8801712345601',
        department: 'Intensive Care',
        ward: 'ICU Ward A',
        bed: 'ICU-04',
        attendingDoctor: 'Dr. Kamal Hossain',
        assignedNurse: 'Ruma Begum',
        diagnosis: 'Acute Respiratory Distress Syndrome secondary to pneumonia',
        status: 'critical',
        allergies: JSON.stringify(['Penicillin']),
        medications: JSON.stringify([
          { name: 'Meropenem', dosage: '1g', frequency: 'q8h', route: 'IV', status: 'active' },
          { name: 'Norepinephrine', dosage: '0.08 mcg/kg/min', frequency: 'Continuous', route: 'IV infusion', status: 'active' }
        ]),
        admissionType: 'emergency',
        notes: 'Patient intubated on mechanical ventilation. Arterial line in situ.'
      },
      {
        patientId: 'P-2026-1043',
        fullName: 'Nasreen Akhter',
        age: 48,
        gender: 'female',
        bloodGroup: 'B+',
        dateOfBirth: '1978-09-12',
        phone: '+8801812345002',
        emergencyContact: 'Tariq Akhter (Husband) · +8801812345602',
        department: 'Cardiology',
        ward: 'Cardio Ward East',
        bed: 'CARD-12',
        attendingDoctor: 'Dr. Fahmida Yasmin',
        assignedNurse: 'Sumaiya Akter',
        diagnosis: 'Non-ST-elevation myocardial infarction (NSTEMI)',
        status: 'under_observation',
        allergies: JSON.stringify(['NSAIDs']),
        medications: JSON.stringify([
          { name: 'Aspirin', dosage: '75mg', frequency: 'OD', route: 'Oral', status: 'active' },
          { name: 'Clopidogrel', dosage: '75mg', frequency: 'OD', route: 'Oral', status: 'active' },
          { name: 'Atorvastatin', dosage: '80mg', frequency: 'Nocte', route: 'Oral', status: 'active' }
        ]),
        admissionType: 'emergency',
        notes: 'Post-angiography observation. Hemodynamically stable.'
      },
      {
        patientId: 'P-2026-1044',
        fullName: 'Abdur Razzak',
        age: 63,
        gender: 'male',
        bloodGroup: 'A+',
        dateOfBirth: '1963-01-25',
        phone: '+8801912345003',
        emergencyContact: 'Salma Razzak (Wife) · +8801912345603',
        department: 'General Medicine',
        ward: 'General Male Ward',
        bed: 'GEN-08',
        attendingDoctor: 'Dr. Rezaul Karim',
        assignedNurse: 'Shathi Rani',
        diagnosis: 'Type 2 Diabetes Mellitus with hyperosmolar state',
        status: 'stable',
        allergies: JSON.stringify(['No known allergies']),
        medications: JSON.stringify([
          { name: 'Regular Insulin', dosage: 'Sliding scale', frequency: 'TID ac', route: 'SC', status: 'active' },
          { name: 'Metformin', dosage: '500mg', frequency: 'BD', route: 'Oral', status: 'on_hold' }
        ]),
        admissionType: 'scheduled',
        notes: 'Glycemic control improving on insulin protocol.'
      },
      {
        patientId: 'P-2026-1045',
        fullName: 'Shirina Begum',
        age: 39,
        gender: 'female',
        bloodGroup: 'AB+',
        dateOfBirth: '1987-11-04',
        phone: '+8801612345004',
        emergencyContact: 'Jasim Uddin (Brother) · +8801612345604',
        department: 'Neurology',
        ward: 'Neuro Step-Down',
        bed: 'NEUR-05',
        attendingDoctor: 'Dr. Nazma Sultana',
        assignedNurse: 'Nusrat Jahan',
        diagnosis: 'Acute ischemic stroke (Right MCA territory), thrombolysis + 48h',
        status: 'stable',
        allergies: JSON.stringify(['Sulfa drugs']),
        medications: JSON.stringify([
          { name: 'Aspirin', dosage: '300mg', frequency: 'OD', route: 'Oral', status: 'active' }
        ]),
        admissionType: 'transfer',
        notes: 'Neurological deficit improving. Speech therapy initiated.'
      }
    ];

    for (const p of samplePatients) {
      await pool.query(
        `INSERT INTO patients (
          patient_id, full_name, age, gender, blood_group, date_of_birth,
          phone, emergency_contact, department, ward, bed, attending_doctor,
          assigned_nurse, diagnosis, status, allergies, medications,
          admission_type, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (patient_id) DO NOTHING`,
        [
          p.patientId, p.fullName, p.age, p.gender, p.bloodGroup, p.dateOfBirth,
          p.phone, p.emergencyContact, p.department, p.ward, p.bed, p.attendingDoctor,
          p.assignedNurse, p.diagnosis, p.status, p.allergies, p.medications,
          p.admissionType, p.notes
        ]
      );
    }
  }

  // Seed vitals
  const vitalsCheck = await pool.query('SELECT COUNT(*) FROM vitals');
  if (parseInt(vitalsCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial vitals...');
    const vitalsData = [
      { id: 'vit_001', patientId: 'P-2026-1042', heartRate: 118, systolic: 88, diastolic: 54, temperature: 38.6, spo2: 91, respiratoryRate: 26, notes: 'Patient tachypneic on high flow O2', recordedBy: 'Ruma Begum' },
      { id: 'vit_002', patientId: 'P-2026-1043', heartRate: 74, systolic: 122, diastolic: 78, temperature: 36.8, spo2: 98, respiratoryRate: 16, notes: 'Stable rhythm on telemetry', recordedBy: 'Sumaiya Akter' },
      { id: 'vit_003', patientId: 'P-2026-1044', heartRate: 82, systolic: 130, diastolic: 82, temperature: 37.1, spo2: 97, respiratoryRate: 18, notes: 'Post meal blood sugar checked', recordedBy: 'Shathi Rani' }
    ];

    for (const v of vitalsData) {
      await pool.query(
        `INSERT INTO vitals (id, patient_id, heart_rate, systolic, diastolic, temperature, spo2, respiratory_rate, notes, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [v.id, v.patientId, v.heartRate, v.systolic, v.diastolic, v.temperature, v.spo2, v.respiratoryRate, v.notes, v.recordedBy]
      );
    }
  }

  // Seed wards & beds
  const wardCheck = await pool.query('SELECT COUNT(*) FROM wards');
  if (parseInt(wardCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial wards & beds...');
    const wards = [
      { id: 'ward_icu_a', name: 'ICU Ward A', prefix: 'ICU', bedCount: 10, department: 'Intensive Care', floor: '3rd Floor', type: 'Intensive' },
      { id: 'ward_cardio', name: 'Cardio Ward East', prefix: 'CARD', bedCount: 16, department: 'Cardiology', floor: '4th Floor', type: 'Specialized' },
      { id: 'ward_gen_male', name: 'General Male Ward', prefix: 'GEN', bedCount: 24, department: 'General Medicine', floor: '2nd Floor', type: 'General' },
      { id: 'ward_neuro', name: 'Neuro Step-Down', prefix: 'NEUR', bedCount: 12, department: 'Neurology', floor: '5th Floor', type: 'Step-Down' }
    ];

    for (const w of wards) {
      await pool.query(
        `INSERT INTO wards (id, name, prefix, bed_count, department, floor, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [w.id, w.name, w.prefix, w.bedCount, w.department, w.floor, w.type]
      );
    }

    const beds = [
      { id: 'bed_icu_04', number: 'ICU-04', ward: 'ICU Ward A', status: 'occupied', patientId: 'P-2026-1042' },
      { id: 'bed_card_12', number: 'CARD-12', ward: 'Cardio Ward East', status: 'occupied', patientId: 'P-2026-1043' },
      { id: 'bed_gen_08', number: 'GEN-08', ward: 'General Male Ward', status: 'occupied', patientId: 'P-2026-1044' },
      { id: 'bed_gen_09', number: 'GEN-09', ward: 'General Male Ward', status: 'available', patientId: null },
      { id: 'bed_neur_05', number: 'NEUR-05', ward: 'Neuro Step-Down', status: 'occupied', patientId: 'P-2026-1045' },
      { id: 'bed_neur_06', number: 'NEUR-06', ward: 'Neuro Step-Down', status: 'cleaning', patientId: null }
    ];

    for (const b of beds) {
      await pool.query(
        `INSERT INTO beds (id, number, ward, status, patient_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [b.id, b.number, b.ward, b.status, b.patientId]
      );
    }
  }

  // Seed blood inventory
  const bloodCheck = await pool.query('SELECT COUNT(*) FROM blood_inventory');
  if (parseInt(bloodCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial blood inventory & requests...');
    const bloodStocks = [
      { id: 'bld_grp_o_pos', bloodGroup: 'O+', units: 28, status: 'adequate' },
      { id: 'bld_grp_o_neg', bloodGroup: 'O−', units: 4, status: 'critical' },
      { id: 'bld_grp_a_pos', bloodGroup: 'A+', units: 19, status: 'adequate' },
      { id: 'bld_grp_a_neg', bloodGroup: 'A−', units: 7, status: 'low' },
      { id: 'bld_grp_b_pos', bloodGroup: 'B+', units: 31, status: 'adequate' },
      { id: 'bld_grp_b_neg', bloodGroup: 'B−', units: 5, status: 'low' },
      { id: 'bld_grp_ab_pos', bloodGroup: 'AB+', units: 14, status: 'adequate' },
      { id: 'bld_grp_ab_neg', bloodGroup: 'AB−', units: 2, status: 'critical' }
    ];

    for (const bs of bloodStocks) {
      await pool.query(
        `INSERT INTO blood_inventory (id, blood_group, units, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [bs.id, bs.bloodGroup, bs.units, bs.status]
      );
    }

    const bloodReqs = [
      { id: 'breq_001', patientId: 'P-2026-1042', patientName: 'Mohammad Rahman', bloodGroup: 'O+', unitsRequested: 2, urgency: 'stat', requestedBy: 'Dr. Kamal Hossain', status: 'approved' },
      { id: 'breq_002', patientId: 'P-2026-1043', patientName: 'Nasreen Akhter', bloodGroup: 'B+', unitsRequested: 1, urgency: 'urgent', requestedBy: 'Dr. Fahmida Yasmin', status: 'pending' }
    ];

    for (const br of bloodReqs) {
      await pool.query(
        `INSERT INTO blood_requests (id, patient_id, patient_name, blood_group, units_requested, urgency, requested_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [br.id, br.patientId, br.patientName, br.bloodGroup, br.unitsRequested, br.urgency, br.requestedBy, br.status]
      );
    }
  }

  // Seed pharmacy
  const medCheck = await pool.query('SELECT COUNT(*) FROM medicines');
  if (parseInt(medCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial medicines...');
    const medicines = [
      { id: 'med_001', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesics', stock: 450, unit: 'Tablets', minThreshold: 50, price: 2.50, expiryDate: '2027-12-31' },
      { id: 'med_002', name: 'Meropenem 1g IV', genericName: 'Meropenem Trihydrate', category: 'Antibiotics', stock: 65, unit: 'Vials', minThreshold: 20, price: 850.00, expiryDate: '2026-08-30' },
      { id: 'med_003', name: 'Aspirin 75mg', genericName: 'Acetylsalicylic acid', category: 'Cardiovascular', stock: 320, unit: 'Tablets', minThreshold: 40, price: 3.00, expiryDate: '2027-05-15' },
      { id: 'med_004', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', stock: 180, unit: 'Tablets', minThreshold: 30, price: 12.00, expiryDate: '2027-09-20' },
      { id: 'med_005', name: 'Regular Insulin 100IU/ml', genericName: 'Human Soluble Insulin', category: 'Endocrine', stock: 24, unit: 'Vials', minThreshold: 15, price: 420.00, expiryDate: '2026-11-10' }
    ];

    for (const m of medicines) {
      await pool.query(
        `INSERT INTO medicines (id, name, generic_name, category, stock, unit, min_threshold, price, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [m.id, m.name, m.genericName, m.category, m.stock, m.unit, m.minThreshold, m.price, m.expiryDate]
      );
    }
  }

  // Seed billing
  const billCheck = await pool.query('SELECT COUNT(*) FROM billing_invoices');
  if (parseInt(billCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial billing invoices...');
    const sampleBills = [
      {
        id: 'inv_001',
        invoiceNumber: 'INV-2026-0418',
        patientId: 'P-2026-1042',
        patientName: 'Mohammad Rahman',
        admissionDate: '2026-09-30',
        dischargeDate: null,
        items: JSON.stringify([
          { description: 'ICU Bed Charges (2 days)', quantity: 2, unitPrice: 5000, total: 10000 },
          { description: 'Mechanical Ventilation', quantity: 2, unitPrice: 3000, total: 6000 },
          { description: 'Pharmacy & Antibiotics', quantity: 1, unitPrice: 4200, total: 4200 }
        ]),
        totalAmount: 20200.00,
        paidAmount: 10000.00,
        balance: 10200.00,
        status: 'partial'
      },
      {
        id: 'inv_002',
        invoiceNumber: 'INV-2026-0419',
        patientId: 'P-2026-1043',
        patientName: 'Nasreen Akhter',
        admissionDate: '2026-10-01',
        dischargeDate: null,
        items: JSON.stringify([
          { description: 'Coronary Care Unit (1 day)', quantity: 1, unitPrice: 4500, total: 4500 },
          { description: 'ECG & Diagnostic Panel', quantity: 1, unitPrice: 2800, total: 2800 }
        ]),
        totalAmount: 7300.00,
        paidAmount: 7300.00,
        balance: 0.00,
        status: 'paid'
      }
    ];

    for (const b of sampleBills) {
      await pool.query(
        `INSERT INTO billing_invoices (id, invoice_number, patient_id, patient_name, admission_date, discharge_date, items, total_amount, paid_amount, balance, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [b.id, b.invoiceNumber, b.patientId, b.patientName, b.admissionDate, b.dischargeDate, b.items, b.totalAmount, b.paidAmount, b.balance, b.status]
      );
    }
  }

  // Seed organs
  const organCheck = await pool.query('SELECT COUNT(*) FROM organ_donations');
  if (parseInt(organCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial organ donations...');
    const organs = [
      { id: 'org_001', organType: 'Kidney (Left)', donorId: 'D-2026-081', donorName: 'Donor #81 (Deceased)', bloodType: 'O+', maxIschemicHours: 24, status: 'allocated', recipientId: 'P-2026-1042' },
      { id: 'org_002', organType: 'Cornea', donorId: 'D-2026-082', donorName: 'Donor #82 (Deceased)', bloodType: 'B+', maxIschemicHours: 48, status: 'available', recipientId: null }
    ];

    for (const o of organs) {
      await pool.query(
        `INSERT INTO organ_donations (id, organ_type, donor_id, donor_name, blood_type, max_ischemic_hours, status, recipient_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [o.id, o.organType, o.donorId, o.donorName, o.bloodType, o.maxIschemicHours, o.status, o.recipientId]
      );
    }
  }

  // Seed notifications
  const notifCheck = await pool.query('SELECT COUNT(*) FROM notifications');
  if (parseInt(notifCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial notifications...');
    const notifs = [
      { id: 'notif_001', title: 'Critical Vitals Alert', message: 'Patient Mohammad Rahman (P-2026-1042) registered elevated heart rate (118 bpm) and SpO2 91%.', type: 'critical' },
      { id: 'notif_002', title: 'Blood Stock Low', message: 'Blood bank reserve for O− is critically low (4 units remaining).', type: 'warning' },
      { id: 'notif_003', title: 'Lab Results Ready', message: 'Blood culture report ready for Nasreen Akhter (P-2026-1043).', type: 'info' }
    ];

    for (const n of notifs) {
      await pool.query(
        `INSERT INTO notifications (id, title, message, type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [n.id, n.title, n.message, n.type]
      );
    }
  }

  console.log('Database initialization & seeding completed successfully.');
};

const initDb = async () => {
  try {
    console.log('Connecting to Neon PostgreSQL and creating schema...');
    await pool.query(createTablesSql);
    console.log('Schema tables created / verified.');
    await seedDatabase();
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

if (require.main === module) {
  initDb().then(() => {
    console.log('Database initialized. Exiting.');
    process.exit(0);
  }).catch((err) => {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  });
}

module.exports = { initDb };
