document.addEventListener('DOMContentLoaded', () => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const THREE_MONTHS_DAYS = 90; // ~3 months

  const reportsListEl = document.getElementById('reports-list');
  const filterCheckbox = document.getElementById('filter-ut');
  const uploadForm = document.getElementById('upload-form');
  const uploadStatus = document.getElementById('upload-status');
  const backendStatusEl = document.getElementById('backend-status');
  const previewImg = document.getElementById('image-preview');
  const fileInput = uploadForm?.querySelector('input[name="image"]');

  // Project id from meta tag (set in lakshu.html during local dev) or fallback
  const metaProj = document.querySelector('meta[name="firebase-project-id"]')?.content || 'your-firebase-project-id';
  const FUNCTIONS_EMULATOR_BASE = `http://127.0.0.1:5001/${metaProj}/us-central1/api`;

  // Check backend health and update UI
  async function checkBackend() {
    if (!backendStatusEl) return;
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        backendStatusEl.textContent = json.emulator ? 'Backend: Connected (emulator)' : 'Backend: Connected';
        backendStatusEl.classList.remove('warn', 'err'); backendStatusEl.classList.add('ok');
        return true;
      }
    } catch (err) {
      // try direct functions emulator
    }

    // Try direct health endpoint (useful when page served by Live Preview)
    try {
      const direct = await fetch(`${FUNCTIONS_EMULATOR_BASE}/health`, { cache: 'no-store' });
      if (direct.ok) {
        backendStatusEl.textContent = 'Backend: Connected (direct functions emulator)';
        backendStatusEl.classList.remove('warn', 'err'); backendStatusEl.classList.add('ok');
        return true;
      }
    } catch (err) {
      console.warn('Backend health check failed:', err);
    }

    backendStatusEl.textContent = 'Backend: Not reachable — open via emulator hosting (http://localhost:5000) or start emulators';
    backendStatusEl.classList.remove('ok'); backendStatusEl.classList.add('err');
    return false;
  }

  // Run initial check and repeat periodically
  checkBackend();
  setInterval(checkBackend, 15000);

  // Preview selected image
  if (fileInput && previewImg) {
    fileInput.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (!f) { previewImg.style.display = 'none'; previewImg.src = ''; return; }
      if (!f.type.startsWith('image/')) { previewImg.style.display = 'none'; previewImg.src = ''; return; }
      const url = URL.createObjectURL(f);
      previewImg.src = url; previewImg.style.display = 'block';
    });
  }

  function makeReportElement(r) {
    const article = document.createElement('article');
    article.className = 'report';
    article.dataset.region = r.region || '';
    if (r.createdAt) article.dataset.date = r.createdAt;

    const title = document.createElement('h3');
    title.textContent = r.title || 'Untitled report';

    const p = document.createElement('p');
    p.textContent = r.description || '';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const dateSpan = document.createElement('span');
    dateSpan.className = 'date';
    dateSpan.textContent = r.createdAt || '';
    const regionSpan = document.createElement('span');
    regionSpan.className = 'region';
    regionSpan.textContent = r.region || '';
    const tagPlaceholder = document.createElement('span');
    tagPlaceholder.className = 'tag-placeholder';

    meta.appendChild(dateSpan);
    meta.appendChild(regionSpan);
    meta.appendChild(tagPlaceholder);

    article.appendChild(title);
    if (r.imageUrl) {
      const img = document.createElement('img');
      img.src = r.imageUrl;
      img.alt = r.title || '';
      img.loading = 'lazy';
      img.style.maxWidth = '100%';
      img.style.marginTop = '8px';
      article.appendChild(img);
    }
    article.appendChild(p);
    article.appendChild(meta);

    // Tagging
    if (/union territory/i.test(r.region || '')) {
      if (r.createdAt) {
        const reportDate = new Date(r.createdAt + 'T00:00:00');
        const diffDays = Math.floor((Date.now() - reportDate.getTime()) / MS_PER_DAY);
        if (diffDays <= THREE_MONTHS_DAYS) {
          const tag = document.createElement('span');
          tag.className = 'special-tag';
          tag.textContent = '🔥 Union Territory — Recent';
          tagPlaceholder.appendChild(tag);
          article.classList.add('is-special');
        }
      }
    }

    return article;
  }

  async function fetchReports() {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      renderReports(data);
    } catch (err) {
      console.warn('Failed to fetch reports from API, falling back to static items.', err);
      // If API not available, leave existing static items in place and process them
      const staticReports = Array.from(document.querySelectorAll('.report')).map(el => ({
        title: el.querySelector('h3')?.textContent || '',
        description: el.querySelector('p')?.textContent || '',
        region: el.dataset.region || el.querySelector('.region')?.textContent || '',
        createdAt: el.dataset.date || el.querySelector('.date')?.textContent || ''
      }));
      renderReports(staticReports);
    }
  }

  function renderReports(items) {
    reportsListEl.innerHTML = '';
    items.forEach(it => {
      const el = makeReportElement(it);
      reportsListEl.appendChild(el);
    });
    applyFilter();
  }

  function applyFilter() {
    const checked = filterCheckbox?.checked;
    const all = reportsListEl.querySelectorAll('.report');
    all.forEach(r => {
      if (checked) {
        if (!r.classList.contains('is-special')) r.classList.add('hidden');
        else r.classList.remove('hidden');
      } else {
        r.classList.remove('hidden');
      }
    });
  }

  if (filterCheckbox) {
    filterCheckbox.addEventListener('change', () => applyFilter());
  }

  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = uploadForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      uploadStatus.textContent = 'Uploading...';

      // Client-side validation to give immediate feedback
      const titleEl = uploadForm.querySelector('#title');
      const descEl = uploadForm.querySelector('#description');
      const regionEl = uploadForm.querySelector('#region');
      const fileEl = uploadForm.querySelector('input[name="image"]');

      const title = (titleEl?.value || '').trim();
      const description = (descEl?.value || '').trim();
      const region = (regionEl?.value || '').trim();
      const file = fileEl?.files?.[0] || null;

      if (!title || title.length < 3) { uploadStatus.textContent = 'Title must be at least 3 characters.'; btn.disabled = false; return; }
      if (!description || description.length < 10) { uploadStatus.textContent = 'Description must be at least 10 characters.'; btn.disabled = false; return; }
      if (!region) { uploadStatus.textContent = 'Please select a region.'; btn.disabled = false; return; }
      if (!file) { uploadStatus.textContent = 'Please attach an image.'; btn.disabled = false; return; }
      if (!file.type.startsWith('image/')) { uploadStatus.textContent = 'File must be an image.'; btn.disabled = false; return; }
      const MAX = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX) { uploadStatus.textContent = 'Image too large (max 5MB).'; btn.disabled = false; return; }

      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('region', region);
      fd.append('image', file);

      try {
        // Prefer XHR for progress reporting; keep fallback logic for static servers
        function xhrPostWithProgress(url, formData, onProgress) {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                const ct = xhr.getResponseHeader('content-type') || '';
                const body = ct.includes('application/json') ? JSON.parse(xhr.responseText || '{}') : (xhr.responseText || '');
                resolve({ status: xhr.status, body, raw: xhr.responseText });
              }
            };
            xhr.upload.onprogress = (e) => { if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(formData);
          });
        }

        // Try hosting route first
        let primary = await xhrPostWithProgress('/api/reports', fd, p => uploadStatus.textContent = `Uploading... ${p}%`);

        // If primary returned HTML or non-JSON and indicates file server, try direct functions emulator
        if (primary && primary.status >= 400) {
          const bodyText = typeof primary.body === 'string' ? primary.body : JSON.stringify(primary.body);
          if (bodyText.includes('File not found') || bodyText.includes('___vscode_livepreview') || bodyText.includes('Cannot POST')) {
            console.warn('Primary endpoint returned file-server HTML; trying direct functions emulator URL fallback');
            const alt = await xhrPostWithProgress(`${FUNCTIONS_EMULATOR_BASE}/reports`, fd, p => uploadStatus.textContent = `Uploading (direct)... ${p}%`);
            primary = alt;
            primary._triedDirect = true;
          }
        }

        // Handle result
        if (!primary || primary.status < 200 || primary.status >= 300) {
          const body = primary ? primary.body : '';
          if (primary && primary._triedDirect && typeof body === 'string' && body.includes('File not found')) {
            uploadStatus.textContent = 'Upload failed: Could not reach backend. Open via emulator hosting (http://localhost:5000) or start emulators.';
            return;
          }
          const errMsg = body && body.error ? body.error : (typeof body === 'string' ? body : `Status ${primary ? primary.status : 'no response'}`);
          uploadStatus.textContent = `Upload failed: ${errMsg}`;
          console.error('Upload failed:', primary);
          return;
        }

        const saved = primary.body;
        uploadStatus.textContent = 'Uploaded successfully ✅';
        const node = makeReportElement({
          title: saved.title,
          description: saved.description,
          region: saved.region,
          imageUrl: saved.imageUrl || null,
          createdAt: saved.createdAt || new Date().toISOString().split('T')[0]
        });
        reportsListEl.prepend(node);
        uploadForm.reset();
        if (previewImg) { previewImg.style.display = 'none'; previewImg.src = ''; }
        applyFilter();
      } catch (err) {
        console.error('Upload error:', err);
        uploadStatus.textContent = `Upload failed: ${err?.message || 'Network error'}. Try again.`;
      } finally {
        btn.disabled = false;
        setTimeout(() => { uploadStatus.textContent = ''; }, 4000);
      }
    });
  }

  fetchReports();
});
