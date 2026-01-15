# Government Citizen Reporting Platform

A comprehensive web application for citizens to report issues to government authorities, featuring a professional government-style interface, mobile-responsive design, and secure Firebase backend.

## 🚀 Features

- **Government-Style Design**: Professional appearance with official color scheme and layout
- **Mobile Responsive**: Optimized for all devices with mobile-first approach
- **Secure Backend**: Firebase Functions API with comprehensive security
- **Image Upload**: Secure file uploads with processing and validation
- **Real-time Reports**: Live report submission and management
- **Admin Dashboard**: Administrative endpoints for report management
- **SEO Optimized**: Meta tags, sitemap, and PWA support
- **Automated Deployment**: GitHub Actions CI/CD pipeline

## 🛠️ Tech Stack

### Frontend
- HTML5 with semantic structure
- CSS3 with government color variables
- JavaScript ES6+ with Firebase integration
- Responsive design with mobile-first approach
- Smooth animations and transitions

### Backend
- Firebase Functions (Node.js)
- Express.js API server
- Firestore database
- Cloud Storage for file uploads
- Security middleware (Helmet, CORS, rate limiting)
- Image processing with Sharp

## 📁 Project Structure

```
├── functions/              # Firebase Functions backend
│   ├── index.js           # Main API server
│   └── package.json       # Backend dependencies
├── scripts/               # Build and utility scripts
├── .github/workflows/     # GitHub Actions CI/CD
├── lakshu.html           # Main HTML page
├── styles.css            # Government-themed styles
├── script.js             # Frontend Firebase integration
├── menu.js               # Navigation functionality
├── animations.js         # UI animations
├── firebase.json         # Firebase configuration
├── firestore.rules       # Database security rules
├── storage.rules         # Storage security rules
└── package.json          # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd Techsprintwebdev
npm install
cd functions && npm install
```

### 2. Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize project (or use existing)
firebase init

# Select: Functions, Hosting, Firestore, Storage
```

### 3. Local Development
```bash
# Build public files
npm run build:public

# Start emulators
firebase emulators:start

# Open http://localhost:5000
```

### 4. Deploy to Production
```bash
# Build and deploy
npm run build:public
firebase deploy
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Submit new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Admin Endpoints
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/admin/reports/:id/status` - Update report status

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Server-side validation for all inputs
- **Image Processing**: Automatic resizing and optimization
- **CORS Protection**: Configured for secure cross-origin requests
- **Helmet Security**: Security headers and protections
- **Firestore Rules**: Database-level security
- **Storage Rules**: File upload security

## 📱 Mobile Responsiveness

- Hamburger menu for mobile navigation
- Responsive grid layouts
- Touch-friendly buttons and forms
- Optimized typography and spacing
- Mobile-first CSS approach

## 🎨 Government Styling

- Official color palette (--gov-primary, --gov-secondary, etc.)
- Professional typography
- Government seal and branding
- Accessible design patterns
- Consistent spacing and layout

## 🚀 Deployment

### Automated (GitHub Actions)
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Requires `FIREBASE_TOKEN` secret in repository settings

### Manual Deployment
```bash
npm run build:public
firebase deploy --only functions,firestore:rules,storage:rules,hosting
```

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Test API endpoints locally
firebase emulators:start
curl http://localhost:5001/your-project/us-central1/api/health
```

## 📊 Monitoring

- Firebase Console for logs and metrics
- Real-time database monitoring
- Storage usage tracking
- Function performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with emulators
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [Firebase Setup Guide](README-FIREBASE-SETUP.md)
- Review [Testing Documentation](TESTING.md)
- Check [SEO Setup](SEO-SETUP.md)

---

Built with ❤️ for citizen engagement and government transparency.