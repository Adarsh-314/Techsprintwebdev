# Pocket Infrastructure Backend

A comprehensive Firebase backend for the Pocket Infrastructure citizen reporting platform.

## Features

### API Endpoints
- `GET /health` - Health check endpoint
- `GET /reports` - Fetch reports with filtering and pagination
- `GET /reports/:id` - Fetch single report
- `POST /reports` - Create new report with image upload
- `PATCH /reports/:id` - Update report status (admin)
- `POST /reports/:id/upvote` - Upvote a report
- `GET /stats` - Get platform statistics
- `GET /admin/reports` - Admin dashboard data

### Security Features
- Rate limiting (100 requests/15min, 10 uploads/min)
- Input validation and sanitization
- Image processing and optimization (Sharp)
- CORS protection
- Helmet security headers
- Firestore and Storage security rules

### Image Processing
- Automatic resizing (max 1200x1200px)
- WebP conversion for optimization
- Quality compression (80%)
- File size validation (max 10MB)

## Setup Instructions

### 1. Install Dependencies
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Install project dependencies
npm install

# Install functions dependencies
cd functions
npm install
```

### 2. Firebase Project Setup
```bash
# Login to Firebase
firebase login

# Initialize or use existing project
firebase use --add your-project-id

# Enable required services in Firebase Console:
# - Firestore Database
# - Cloud Storage
# - Cloud Functions
# - Hosting
```

### 3. Environment Configuration
Create `.env` file in functions directory:
```
PROJECT_ID=your-project-id
```

### 4. Deploy Backend
```bash
# Build frontend for hosting
npm run build:public

# Start emulators for local testing
npm run start:emulator

# Deploy to production
firebase deploy --only functions,firestore,storage
firebase deploy --only hosting
```

## API Documentation

### Create Report
```http
POST /api/reports
Content-Type: multipart/form-data

Form Data:
- title: string (5-100 chars)
- description: string (10-1000 chars)
- location: string (optional)
- category: string (road|traffic|infrastructure|safety|other)
- latitude: number (optional)
- longitude: number (optional)
- image: file (optional, max 10MB)
- anonymous: boolean (default: true)
```

### Get Reports
```http
GET /api/reports?category=road&status=pending&limit=20&offset=0&sort=newest
```

### Health Check
```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T...",
  "emulator": true
}
```

## Security Rules

### Firestore Rules
- Public read access to reports
- Validated create operations
- Admin-only updates/deletes
- Rate limiting per IP

### Storage Rules
- Public read access to images
- Authenticated uploads for users
- Anonymous uploads with rate limiting
- Image validation (type, size)

## Development

### Local Testing
```bash
# Start all emulators
firebase emulators:start

# Test API endpoints
curl http://localhost:5001/your-project-id/us-central1/api/health
```

### File Structure
```
functions/
├── index.js          # Main API endpoints
├── package.json      # Dependencies
└── .env             # Environment variables

public/              # Built frontend files
├── index.html
├── styles.css
├── script.js
└── ...

scripts/
└── copy-to-public.js # Build script
```

## Production Deployment

1. Update Firebase project ID in all configuration files
2. Set up proper domain and SSL certificates
3. Configure monitoring and alerts
4. Set up CI/CD pipeline
5. Enable billing for production usage
6. Review and tighten security rules

## Monitoring

- Firebase Console for function logs and performance
- Firestore usage monitoring
- Storage usage and costs
- API rate limiting metrics

## Contributing

1. Test all changes locally with emulators
2. Update documentation for API changes
3. Ensure security rules are not bypassed
4. Test rate limiting and validation
5. Update deployment scripts if needed</content>
<parameter name="filePath">c:\Users\shrey\Techsprintwebdev\BACKEND-README.md