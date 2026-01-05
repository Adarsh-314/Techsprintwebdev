# Firebase Setup (backend + hosting)

Follow these steps to initialize and run the Firebase backend locally, then deploy:

1. Install Firebase CLI
   - npm i -g firebase-tools

2. Login and select/create a project
   - firebase login
   - firebase projects:create your-project-id (or use existing)
   - Update `.firebaserc` with your project id or run `firebase use --add` to set default

3. Initialize (if not already)
   - firebase init
     - Choose: Functions, Hosting, Firestore, Storage
     - Use existing project or new

4. Install dependencies for functions
   - cd functions
   - npm install

5. Build & run emulators for local testing
   - npm run build:public  # copies site files into ./public for hosting
   - firebase emulators:start --only functions,firestore,storage,hosting
   - Open the hosting URL (usually http://localhost:5000) and test uploads from the site

6. Deploy to production
   - npm run build:public
   - firebase deploy --only hosting,functions

Notes & Recommendations
- Enable billing if you plan to use Storage / signed URLs in production at scale.
- Set appropriate Firestore and Storage security rules before going public (anonymous uploads are allowed in this prototype; consider rate-limits and anti-abuse).
- Use the Firebase Console to inspect uploaded files and Firestore documents.

Security & Hardening (added)
- Firestore and Storage security rules have been added (`firestore.rules`, `storage.rules`). Review and tighten them for production.
- The upload function includes server-side validation, image resizing/optimization (sharp), and rate limiting (express-rate-limit) to limit abuse.

CI/CD
- A GitHub Actions workflow (`.github/workflows/firebase-deploy.yml`) is included to deploy on push to `main`. Add `FIREBASE_TOKEN` secret to your repository and update `your-firebase-project-id`.

SEO and Performance
- Added meta tags, sitemap (`public/sitemap.xml`), `robots.txt`, and `manifest.json`. Replace placeholders (`https://example.com/`, GA `MEASUREMENT_ID`) and add icons in `public/icons/` for PWA.
