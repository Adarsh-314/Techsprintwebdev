# Manual Testing Checklist

1. Local setup
   - Run `cd functions && npm install`
   - Run `npm run build:public` from repo root
   - Start emulators: `firebase emulators:start --only functions,firestore,storage,hosting`

2. Upload flow
   - Open `http://localhost:5000/lakshu.html`
   - Fill the upload form with Title, Description, select Region (Union Territory) and attach an image
   - Expect: Upload status shows success; new report appears at top with image displayed

3. Union Territory tag & filter
   - Upload a UT report with today's date — expect `🔥 Union Territory — Recent` badge
   - Toggle the 'Show only Union Territories' checkbox — non-UT reports should hide

4. API tests (curl)
   - List: `curl "http://localhost:5000/api/reports"`
   - Upload (example):
     curl -X POST "http://localhost:5000/api/reports" -F "title=Test" -F "description=desc" -F "region=Union Territory" -F "image=@./test.jpg"

5. Abuse prevention
   - Try multiple uploads to trigger rate limiter (10 uploads per hour limit). After limit is exceeded, expect 429 response with rate-limit message.

6. SEO checks
   - Ensure `http://localhost:5000/robots.txt` and `/sitemap.xml` are reachable
   - Check that the page includes meta description and structured data via browser devtools

7. Security rules
   - When ready, test Firestore and Storage rules using emulator or console.

Report any failures or unexpected errors here.
