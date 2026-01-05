# SEO & Google Search Console setup

Steps to improve discoverability and register the site with Google:

1. Choose a domain and verify ownership
   - Buy a domain and point DNS to Firebase Hosting (see Firebase docs)
   - In Google Search Console, add a new property (Domain or URL-prefix) and verify via DNS or external verification

2. Submit sitemap
   - Ensure `sitemap.xml` is accessible at `https://your-domain/sitemap.xml`
   - In Search Console, submit that sitemap to speed indexing

3. Geotargeting (India)
   - In Search Console > Settings you can set target country. If you serve content specifically for India, set India as target.

4. Analytics
   - Create a Google Analytics 4 property and add the Measurement ID to `lakshu.html` (replace `MEASUREMENT_ID`)
   - Link Analytics and Search Console for better insights

5. Structured data
   - We included basic `WebSite` schema. Enhance with `Organization`, `LocalBusiness`, or `Dataset` if applicable.

6. Continuous monitoring
   - Check Performance > Core Web Vitals and fix issues (first input delay, CLS, largest contentful paint)
   - Use Lighthouse and PageSpeed Insights regularly

Notes
- High rank is not guaranteed; focus on quality content, mobile-first UX, fast pages, and authoritative backlinks.
