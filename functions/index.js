const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8000',
      'https://pocket-infrastructure.web.app',
      'https://pocket-infrastructure.firebaseapp.com'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: 'Too many requests, please try again later.',
});

app.use('/api/reports', limiter);
app.use('/api/upload', strictLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Firestore reference
const db = admin.firestore();

// Storage reference
const bucket = admin.storage().bucket();

// Validation middleware
const validateReport = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
  body('category').optional().isIn(['road', 'traffic', 'infrastructure', 'safety', 'other']).withMessage('Invalid category'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

// Routes

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check Firestore connection
    await db.collection('reports').limit(1).get();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      emulator: process.env.FUNCTIONS_EMULATOR === 'true'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all reports with filtering
app.get('/reports', async (req, res) => {
  try {
    const { category, status, limit = 50, offset = 0, sort = 'newest' } = req.query;

    let query = db.collection('reports');

    // Apply filters
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.orderBy('createdAt', 'asc');
        break;
      case 'most_upvoted':
        query = query.orderBy('upvotes', 'desc');
        break;
      case 'newest':
      default:
        query = query.orderBy('createdAt', 'desc');
        break;
    }

    // Apply pagination
    const snapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();

    const reports = [];
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      });
    });

    // Get total count for pagination
    const totalQuery = db.collection('reports');
    const totalSnapshot = await totalQuery.get();
    const total = totalSnapshot.size;

    res.json({
      reports,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + reports.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
app.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('reports').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    };

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create new report
app.post('/reports', validateReport, upload.single('image'), async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, location, category, latitude, longitude, anonymous = true } = req.body;
    const file = req.file;

    let imageUrl = null;
    let imagePath = null;

    // Process image if provided
    if (file) {
      try {
        // Generate unique filename
        const filename = `reports/${uuidv4()}.webp`;

        // Process image with Sharp (resize and optimize)
        const processedImage = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toBuffer();

        // Upload to Firebase Storage
        const fileUpload = bucket.file(filename);
        await fileUpload.save(processedImage, {
          metadata: {
            contentType: 'image/webp',
            metadata: {
              originalName: file.originalname,
              uploadTime: new Date().toISOString()
            }
          },
          public: true,
        });

        imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        imagePath = filename;
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Continue without image rather than failing
      }
    }

    // Create report document
    const reportData = {
      title: title.trim(),
      description: description.trim(),
      location: location?.trim() || null,
      category: category || 'other',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      imageUrl,
      imagePath,
      status: 'pending',
      upvotes: 0,
      anonymous,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const docRef = await db.collection('reports').add(reportData);

    res.status(201).json({
      id: docRef.id,
      ...reportData,
      createdAt: new Date(),
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Update report (admin functionality)
app.patch('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (status) {
      updateData.status = status;
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await db.collection('reports').doc(id).update(updateData);

    res.json({ message: 'Report updated successfully' });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Upvote report
app.post('/reports/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;

    // Use transaction to safely increment upvotes
    await db.runTransaction(async (transaction) => {
      const docRef = db.collection('reports').doc(id);
      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        throw new Error('Report not found');
      }

      const currentUpvotes = doc.data().upvotes || 0;
      transaction.update(docRef, {
        upvotes: currentUpvotes + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    res.json({ message: 'Report upvoted successfully' });
  } catch (error) {
    console.error('Error upvoting report:', error);
    res.status(500).json({ error: 'Failed to upvote report' });
  }
});

// Get statistics
app.get('/stats', async (req, res) => {
  try {
    const reportsSnapshot = await db.collection('reports').get();
    const totalReports = reportsSnapshot.size;

    // Count by status
    const statusCounts = {};
    reportsSnapshot.forEach(doc => {
      const status = doc.data().status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Count by category
    const categoryCounts = {};
    reportsSnapshot.forEach(doc => {
      const category = doc.data().category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentQuery = db.collection('reports')
      .where('createdAt', '>=', thirtyDaysAgo)
      .orderBy('createdAt', 'desc');

    const recentSnapshot = await recentQuery.get();
    const recentReports = recentSnapshot.size;

    res.json({
      totalReports,
      statusCounts,
      categoryCounts,
      recentReports,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Admin endpoints (would require authentication in production)
app.get('/admin/reports', async (req, res) => {
  try {
    const snapshot = await db.collection('reports')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const reports = [];
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      });
    });

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);