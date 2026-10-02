const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CareGrid Healthcare Management System API',
    version: '1.0.0',
    description: `
### Welcome to CareGrid Backend REST API Documentation
This interactive Swagger UI allows testing and checking all **GET, DELETE, POST, and PUT** APIs powered by **Neon PostgreSQL**.

Key Features:
- **Patients Management**: Full CRUD (GET all, GET by id, POST new, PUT update, DELETE)
- **Vitals Tracking**: GET vitals, POST readings, DELETE entries
- **Wards & Beds**: GET ward lists, GET bed status, PUT bed allocations, DELETE beds
- **Blood Bank**: GET inventory & requests, POST requests, DELETE requests
- **Pharmacy & Prescriptions**: GET medicines, POST additions, DELETE drugs, GET/DELETE prescriptions
- **Billing & Invoices**: GET invoices, POST bills, PUT payments, DELETE invoices
- **Organ Transplants**: GET available organs, POST listings, DELETE records
- **Notifications**: GET alerts, PUT mark read, DELETE alerts
- **User Authentication**: Register, Login, Current Profile, GET users, DELETE users
    `,
    contact: {
      name: 'CareGrid Support',
      email: 'support@caregrid.io'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from `/api/auth/login`'
      }
    },
    schemas: {
      Patient: {
        type: 'object',
        properties: {
          patientId: { type: 'string', example: 'P-2026-1042' },
          fullName: { type: 'string', example: 'Mohammad Rahman' },
          age: { type: 'integer', example: 55 },
          gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
          bloodGroup: { type: 'string', example: 'O+' },
          dateOfBirth: { type: 'string', example: '1971-04-18' },
          phone: { type: 'string', example: '+8801712345001' },
          emergencyContact: { type: 'string', example: 'Rafiq Rahman (Son) · +8801712345601' },
          department: { type: 'string', example: 'Intensive Care' },
          ward: { type: 'string', example: 'ICU Ward A' },
          bed: { type: 'string', example: 'ICU-04' },
          attendingDoctor: { type: 'string', example: 'Dr. Kamal Hossain' },
          assignedNurse: { type: 'string', example: 'Ruma Begum' },
          diagnosis: { type: 'string', example: 'Acute Respiratory Distress Syndrome secondary to pneumonia' },
          status: { type: 'string', enum: ['stable', 'under_observation', 'critical', 'discharged'], example: 'critical' },
          allergies: { type: 'array', items: { type: 'string' }, example: ['Penicillin'] },
          medications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Meropenem' },
                dosage: { type: 'string', example: '1g' },
                frequency: { type: 'string', example: 'q8h' },
                route: { type: 'string', example: 'IV' },
                status: { type: 'string', example: 'active' }
              }
            }
          },
          admissionType: { type: 'string', enum: ['emergency', 'elective', 'transfer', 'scheduled', 'day_care'], example: 'emergency' },
          notes: { type: 'string', example: 'Patient intubated on mechanical ventilation.' },
          admissionDate: { type: 'string', format: 'date-time' },
          lastUpdated: { type: 'string', format: 'date-time' }
        }
      },
      NewPatientInput: {
        type: 'object',
        required: ['fullName', 'gender', 'bloodGroup', 'department', 'ward', 'bed', 'attendingDoctor', 'assignedNurse'],
        properties: {
          patientId: { type: 'string', example: 'P-2026-9999' },
          fullName: { type: 'string', example: 'Karim Ahmed' },
          age: { type: 'integer', example: 42 },
          gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
          bloodGroup: { type: 'string', example: 'B+' },
          dateOfBirth: { type: 'string', example: '1984-06-15' },
          phone: { type: 'string', example: '+8801700000000' },
          emergencyContact: { type: 'string', example: 'Brother · +8801711111111' },
          department: { type: 'string', example: 'Cardiology' },
          ward: { type: 'string', example: 'Cardio Ward East' },
          bed: { type: 'string', example: 'CARD-12' },
          attendingDoctor: { type: 'string', example: 'Dr. Fahmida Yasmin' },
          assignedNurse: { type: 'string', example: 'Sumaiya Akter' },
          diagnosis: { type: 'string', example: 'Hypertension' },
          status: { type: 'string', enum: ['stable', 'under_observation', 'critical'], example: 'stable' },
          allergies: { type: 'array', items: { type: 'string' }, example: ['No known allergies'] },
          admissionType: { type: 'string', example: 'elective' },
          notes: { type: 'string', example: 'Routine admission for observation.' }
        }
      },
      Vitals: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'vit_001' },
          patientId: { type: 'string', example: 'P-2026-1042' },
          recordedAt: { type: 'string', format: 'date-time' },
          heartRate: { type: 'integer', example: 118 },
          systolic: { type: 'integer', example: 88 },
          diastolic: { type: 'integer', example: 54 },
          temperature: { type: 'number', example: 38.6 },
          spo2: { type: 'integer', example: 91 },
          respiratoryRate: { type: 'integer', example: 26 },
          notes: { type: 'string', example: 'Patient tachypneic on high flow O2' },
          recordedBy: { type: 'string', example: 'Ruma Begum' }
        }
      },
      NewVitalsInput: {
        type: 'object',
        required: ['patientId', 'heartRate', 'systolic', 'diastolic', 'temperature', 'spo2', 'respiratoryRate', 'recordedBy'],
        properties: {
          patientId: { type: 'string', example: 'P-2026-1042' },
          heartRate: { type: 'integer', example: 80 },
          systolic: { type: 'integer', example: 120 },
          diastolic: { type: 'integer', example: 80 },
          temperature: { type: 'number', example: 37.0 },
          spo2: { type: 'integer', example: 98 },
          respiratoryRate: { type: 'integer', example: 18 },
          notes: { type: 'string', example: 'Normal vitals' },
          recordedBy: { type: 'string', example: 'Ruma Begum' }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'shahid.hasan@caregrid.io' },
          password: { type: 'string', example: 'Caregrid@2026' }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['fullName', 'email', 'phone', 'role', 'password'],
        properties: {
          fullName: { type: 'string', example: 'Dr. John Doe' },
          email: { type: 'string', example: 'john.doe@caregrid.io' },
          phone: { type: 'string', example: '+8801700000001' },
          role: { type: 'string', enum: ['doctor', 'nurse', 'blood_bank_coordinator', 'pharmacist', 'billing_officer', 'patient_family'], example: 'doctor' },
          password: { type: 'string', example: 'Caregrid@2026' }
        }
      }
    }
  },
  paths: {
    // Auth endpoints
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user and obtain JWT token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } }
        },
        responses: {
          201: { description: 'User registered' },
          409: { description: 'Email already exists' }
        }
      }
    },
    '/api/auth/users': {
      get: {
        tags: ['Authentication'],
        summary: 'GET all registered users',
        responses: {
          200: { description: 'List of all users' }
        }
      }
    },
    '/api/auth/users/{id}': {
      delete: {
        tags: ['Authentication'],
        summary: 'DELETE user by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'usr_doc_001' }
        ],
        responses: {
          200: { description: 'User deleted' },
          404: { description: 'User not found' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'GET profile of currently authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile' },
          401: { description: 'Unauthorized' }
        }
      }
    },

    // Patient endpoints
    '/api/patients': {
      get: {
        tags: ['Patients'],
        summary: 'GET all patients (with optional search & filters)',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status (stable, critical, under_observation, discharged)' },
          { name: 'department', in: 'query', schema: { type: 'string' }, description: 'Filter by department' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by patient name, ID, or diagnosis' }
        ],
        responses: {
          200: { description: 'List of patients' }
        }
      },
      post: {
        tags: ['Patients'],
        summary: 'POST create a new patient admission',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/NewPatientInput' } } }
        },
        responses: {
          201: { description: 'Patient created' },
          400: { description: 'Invalid input' }
        }
      }
    },
    '/api/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'GET patient by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'P-2026-1042' }
        ],
        responses: {
          200: { description: 'Patient details' },
          404: { description: 'Patient not found' }
        }
      },
      put: {
        tags: ['Patients'],
        summary: 'PUT update existing patient details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'P-2026-1042' }
        ],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object' } } }
        },
        responses: {
          200: { description: 'Patient updated' },
          404: { description: 'Patient not found' }
        }
      },
      delete: {
        tags: ['Patients'],
        summary: 'DELETE patient by ID (and unassign bed)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'P-2026-1042' }
        ],
        responses: {
          200: { description: 'Patient deleted successfully' },
          404: { description: 'Patient not found' }
        }
      }
    },

    // Vitals endpoints
    '/api/vitals': {
      get: {
        tags: ['Vitals'],
        summary: 'GET all recorded vitals readings',
        responses: {
          200: { description: 'List of vitals' }
        }
      },
      post: {
        tags: ['Vitals'],
        summary: 'POST record a new vitals reading for a patient',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/NewVitalsInput' } } }
        },
        responses: {
          201: { description: 'Vitals recorded' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/vitals/patient/{patientId}': {
      get: {
        tags: ['Vitals'],
        summary: 'GET vitals history for a specific patient',
        parameters: [
          { name: 'patientId', in: 'path', required: true, schema: { type: 'string' }, example: 'P-2026-1042' }
        ],
        responses: {
          200: { description: 'Patient vitals readings' }
        }
      }
    },
    '/api/vitals/{id}': {
      delete: {
        tags: ['Vitals'],
        summary: 'DELETE vitals entry by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'vit_001' }
        ],
        responses: {
          200: { description: 'Vitals record deleted' },
          404: { description: 'Not found' }
        }
      }
    },

    // Wards & Beds endpoints
    '/api/wards/wards': {
      get: {
        tags: ['Wards & Beds'],
        summary: 'GET list of all hospital wards',
        responses: {
          200: { description: 'List of wards' }
        }
      }
    },
    '/api/wards/beds': {
      get: {
        tags: ['Wards & Beds'],
        summary: 'GET all beds (filterable by ward or status)',
        parameters: [
          { name: 'ward', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of beds' }
        }
      },
      post: {
        tags: ['Wards & Beds'],
        summary: 'POST create a new bed in a ward',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['number', 'ward'],
                properties: {
                  number: { type: 'string', example: 'GEN-25' },
                  ward: { type: 'string', example: 'General Male Ward' },
                  status: { type: 'string', example: 'available' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Bed created' }
        }
      }
    },
    '/api/wards/beds/{id}': {
      put: {
        tags: ['Wards & Beds'],
        summary: 'PUT update bed status (e.g. available, occupied, cleaning, reserved)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'bed_gen_09' }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'available' },
                  patientId: { type: 'string', example: null }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Bed updated' },
          404: { description: 'Bed not found' }
        }
      },
      delete: {
        tags: ['Wards & Beds'],
        summary: 'DELETE bed by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'bed_gen_09' }
        ],
        responses: {
          200: { description: 'Bed deleted successfully' },
          404: { description: 'Bed not found' }
        }
      }
    },

    // Blood Bank
    '/api/blood/inventory': {
      get: {
        tags: ['Blood Bank'],
        summary: 'GET blood units inventory by blood group',
        responses: {
          200: { description: 'Inventory stock list' }
        }
      }
    },
    '/api/blood/requests': {
      get: {
        tags: ['Blood Bank'],
        summary: 'GET all blood transfusion requests',
        responses: {
          200: { description: 'List of blood requests' }
        }
      },
      post: {
        tags: ['Blood Bank'],
        summary: 'POST submit a new blood request',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patientName', 'bloodGroup', 'unitsRequested', 'urgency', 'requestedBy'],
                properties: {
                  patientId: { type: 'string', example: 'P-2026-1042' },
                  patientName: { type: 'string', example: 'Mohammad Rahman' },
                  bloodGroup: { type: 'string', example: 'O+' },
                  unitsRequested: { type: 'integer', example: 2 },
                  urgency: { type: 'string', enum: ['routine', 'urgent', 'stat'], example: 'urgent' },
                  requestedBy: { type: 'string', example: 'Dr. Kamal Hossain' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Blood request created' }
        }
      }
    },
    '/api/blood/requests/{id}': {
      delete: {
        tags: ['Blood Bank'],
        summary: 'DELETE blood request by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'breq_002' }
        ],
        responses: {
          200: { description: 'Request deleted' },
          404: { description: 'Request not found' }
        }
      }
    },

    // Pharmacy
    '/api/pharmacy/medicines': {
      get: {
        tags: ['Pharmacy'],
        summary: 'GET all pharmacy medicines and stock',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of medicines' }
        }
      },
      post: {
        tags: ['Pharmacy'],
        summary: 'POST add a new medication to pharmacy inventory',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'stock', 'unit', 'price'],
                properties: {
                  name: { type: 'string', example: 'Ceftriaxone 1g IV' },
                  genericName: { type: 'string', example: 'Ceftriaxone Sodium' },
                  category: { type: 'string', example: 'Antibiotics' },
                  stock: { type: 'integer', example: 100 },
                  unit: { type: 'string', example: 'Vials' },
                  minThreshold: { type: 'integer', example: 20 },
                  price: { type: 'number', example: 120.00 },
                  expiryDate: { type: 'string', example: '2027-06-30' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Medicine added' }
        }
      }
    },
    '/api/pharmacy/medicines/{id}': {
      put: {
        tags: ['Pharmacy'],
        summary: 'PUT update medicine stock or price',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'med_001' }
        ],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object' } } }
        },
        responses: {
          200: { description: 'Medicine updated' },
          404: { description: 'Medicine not found' }
        }
      },
      delete: {
        tags: ['Pharmacy'],
        summary: 'DELETE medicine from pharmacy by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'med_001' }
        ],
        responses: {
          200: { description: 'Medicine deleted successfully' },
          404: { description: 'Medicine not found' }
        }
      }
    },
    '/api/pharmacy/prescriptions': {
      get: {
        tags: ['Pharmacy'],
        summary: 'GET all prescriptions',
        responses: {
          200: { description: 'Prescription list' }
        }
      },
      post: {
        tags: ['Pharmacy'],
        summary: 'POST issue new prescription',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patientName', 'doctorName'],
                properties: {
                  patientId: { type: 'string', example: 'P-2026-1042' },
                  patientName: { type: 'string', example: 'Mohammad Rahman' },
                  doctorName: { type: 'string', example: 'Dr. Kamal Hossain' },
                  items: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Prescription created' }
        }
      }
    },
    '/api/pharmacy/prescriptions/{id}': {
      delete: {
        tags: ['Pharmacy'],
        summary: 'DELETE prescription by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'rx_001' }
        ],
        responses: {
          200: { description: 'Prescription deleted' },
          404: { description: 'Prescription not found' }
        }
      }
    },

    // Billing
    '/api/billing': {
      get: {
        tags: ['Billing & Invoices'],
        summary: 'GET all billing invoices (filterable by status or patient)',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'patientId', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of invoices' }
        }
      },
      post: {
        tags: ['Billing & Invoices'],
        summary: 'POST create a new billing invoice',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patientName', 'totalAmount'],
                properties: {
                  patientId: { type: 'string', example: 'P-2026-1042' },
                  patientName: { type: 'string', example: 'Mohammad Rahman' },
                  totalAmount: { type: 'number', example: 15000.00 },
                  paidAmount: { type: 'number', example: 5000.00 },
                  status: { type: 'string', example: 'partial' },
                  items: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Invoice created' }
        }
      }
    },
    '/api/billing/{id}': {
      get: {
        tags: ['Billing & Invoices'],
        summary: 'GET invoice by ID or invoice number',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'inv_001' }
        ],
        responses: {
          200: { description: 'Invoice details' },
          404: { description: 'Invoice not found' }
        }
      },
      put: {
        tags: ['Billing & Invoices'],
        summary: 'PUT record payment on invoice',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'inv_001' }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  paidAmount: { type: 'number', example: 20200.00 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Payment recorded' }
        }
      },
      delete: {
        tags: ['Billing & Invoices'],
        summary: 'DELETE invoice by ID or invoice number',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'inv_001' }
        ],
        responses: {
          200: { description: 'Invoice deleted successfully' },
          404: { description: 'Invoice not found' }
        }
      }
    },

    // Organs
    '/api/organs': {
      get: {
        tags: ['Organ Management'],
        summary: 'GET available organ donor records and allocations',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'bloodType', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Organ donation records' }
        }
      },
      post: {
        tags: ['Organ Management'],
        summary: 'POST register new organ donation listing',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['organType', 'donorName', 'bloodType'],
                properties: {
                  organType: { type: 'string', example: 'Liver' },
                  donorName: { type: 'string', example: 'Donor #83' },
                  bloodType: { type: 'string', example: 'O+' },
                  maxIschemicHours: { type: 'integer', example: 12 },
                  status: { type: 'string', example: 'available' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Organ registered' }
        }
      }
    },
    '/api/organs/{id}': {
      delete: {
        tags: ['Organ Management'],
        summary: 'DELETE organ record by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'org_002' }
        ],
        responses: {
          200: { description: 'Organ record deleted' },
          404: { description: 'Record not found' }
        }
      }
    },

    // Care Timeline
    '/api/timeline/patient/{patientId}': {
      get: {
        tags: ['Care Timeline'],
        summary: 'GET care timeline events for a patient',
        parameters: [
          { name: 'patientId', in: 'path', required: true, schema: { type: 'string' }, example: 'P-2026-1042' }
        ],
        responses: {
          200: { description: 'Timeline events' }
        }
      }
    },
    '/api/timeline': {
      post: {
        tags: ['Care Timeline'],
        summary: 'POST add care event to patient timeline',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patientId', 'event', 'department', 'author'],
                properties: {
                  patientId: { type: 'string', example: 'P-2026-1042' },
                  event: { type: 'string', example: 'Blood sample drawn for arterial blood gas test' },
                  department: { type: 'string', example: 'Intensive Care' },
                  author: { type: 'string', example: 'Ruma Begum' },
                  authorRole: { type: 'string', example: 'Nurse' },
                  status: { type: 'string', example: 'completed' },
                  statusLabel: { type: 'string', example: 'Completed' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Timeline event created' }
        }
      }
    },
    '/api/timeline/{id}': {
      delete: {
        tags: ['Care Timeline'],
        summary: 'DELETE timeline event by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'evt_001' }
        ],
        responses: {
          200: { description: 'Timeline event deleted' },
          404: { description: 'Not found' }
        }
      }
    },

    // Notifications
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'GET all system notifications and clinical alerts',
        responses: {
          200: { description: 'Notification list' }
        }
      },
      post: {
        tags: ['Notifications'],
        summary: 'POST send new notification',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'message'],
                properties: {
                  title: { type: 'string', example: 'Emergency Ward Review' },
                  message: { type: 'string', example: 'Doctor round starting in General Ward at 16:00.' },
                  type: { type: 'string', example: 'info' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Notification created' }
        }
      }
    },
    '/api/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'PUT mark notification as read',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'notif_001' }
        ],
        responses: {
          200: { description: 'Notification marked read' }
        }
      }
    },
    '/api/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'DELETE notification by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'notif_001' }
        ],
        responses: {
          200: { description: 'Notification deleted' },
          404: { description: 'Notification not found' }
        }
      }
    }
  }
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerSpec };
