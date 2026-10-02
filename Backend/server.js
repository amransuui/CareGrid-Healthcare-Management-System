require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { pool } = require('./src/config/db');
const { initDb } = require('./src/config/initDb');
const { swaggerSpec } = require('./src/config/swagger');
const { errorHandler } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const vitalsRoutes = require('./src/routes/vitalsRoutes');
const wardRoutes = require('./src/routes/wardRoutes');
const bloodRoutes = require('./src/routes/bloodRoutes');
const pharmacyRoutes = require('./src/routes/pharmacyRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const organRoutes = require('./src/routes/organRoutes');
const timelineRoutes = require('./src/routes/timelineRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger UI Documentation
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { background-color: #0f172a; border-bottom: 2px solid #0284c7; }
    .swagger-ui .topbar .topbar-wrapper .link span { display: none; }
    .swagger-ui .topbar .topbar-wrapper .link:after { content: '🏥 CareGrid API Docs'; color: #38bdf8; font-size: 20px; font-weight: bold; }
    .swagger-ui .opblock.opblock-get { border-color: #0284c7; background: rgba(2, 132, 199, 0.05); }
    .swagger-ui .opblock.opblock-delete { border-color: #e11d48; background: rgba(225, 29, 72, 0.05); }
  `,
  customSiteTitle: 'CareGrid API Documentation'
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.use('/docs', (req, res) => res.redirect('/api-docs'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as db_time, current_database() as database');
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: dbRes.rows[0].database,
        serverTime: dbRes.rows[0].db_time
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: err.message
      }
    });
  }
});

// Root welcome route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CareGrid Backend API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 600px; text-align: center; border: 1px solid #334155; }
        h1 { color: #38bdf8; margin-top: 0; }
        p { color: #94a3b8; font-size: 16px; line-height: 1.6; }
        .badge { display: inline-block; background: #0284c7; color: white; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
        .btn { display: inline-block; background: #0284c7; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; transition: background 0.2s; }
        .btn:hover { background: #0369a1; }
        .list { text-align: left; background: #0f172a; padding: 15px 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 14px; }
        .method-get { color: #38bdf8; font-weight: bold; }
        .method-del { color: #f43f5e; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">Neon PostgreSQL Connected</span>
        <h1>🏥 CareGrid API Server</h1>
        <p>Backend service for CareGrid Healthcare Management System is running.</p>
        <div class="list">
          <div><span class="method-get">GET</span> /api/patients</div>
          <div><span class="method-del">DELETE</span> /api/patients/:id</div>
          <div><span class="method-get">GET</span> /api/vitals</div>
          <div><span class="method-del">DELETE</span> /api/vitals/:id</div>
          <div><span class="method-get">GET</span> /api/billing</div>
          <div><span class="method-del">DELETE</span> /api/billing/:id</div>
          <div><span class="method-get">GET</span> /api/pharmacy/medicines</div>
          <div><span class="method-del">DELETE</span> /api/pharmacy/medicines/:id</div>
        </div>
        <a class="btn" href="/api-docs">🚀 Open Swagger API Documentation</a>
      </div>
    </body>
    </html>
  `);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/organs', organRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server after verifying DB initialization
const startServer = async () => {
  try {
    console.log('Verifying Neon PostgreSQL tables...');
    await initDb();
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 CareGrid Backend running on port ${PORT}`);
      console.log(`📡 Neon PostgreSQL Connected successfully`);
      console.log(`📖 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start CareGrid server:', error);
    process.exit(1);
  }
};

startServer();
