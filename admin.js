// Sawi's Delight Cakes - Admin Panel (Supabase Version)

let currentEditingCakeId = null;
let businessRow = null;
let allCakes = [];
let allFeatures = [];
let allSteps = [];
let allTestimonials = [];
let allAbout = [];
let filesToUpload = [];

// ─── Init ─────────────────────────────────────────────────────────────────────
async function initAdmin() {
  try {
    const [business, cakes, features, steps, testimonials, about] = await Promise.all([
      fetchBusinessInfo(),
      fetchCakes(),
      fetchFeatures(),
      fetchOrderingSteps(),
      fetchTestimonials(),
      fetchAboutContent()
    ]);

    businessRow = business;
    allCakes = cakes;
    allFeatures = features;
    allSteps = steps;
    allTestimonials = testimonials;
    allAbout = about;

    loadBusinessInfo();
    loadCakes();
    loadFeatures();
    loadOrderingSteps();
    loadTestimonials();
    loadAbout();

    setDbStatus(true);
  } catch (err) {
    console.error('Admin init error:', err);
    setDbStatus(false);
    showAlert('Failed to connect to database: ' + err.message, 'error');
  } finally {
    document.getElementById('pageLoader').classList.add('hidden');
  }
}

function setDbStatus(ok) {
  const status = document.getElementById('dbStatus');
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  status.className = 'db-status ' + (ok ? 'connected' : 'disconnected');
  dot.className = 'status-dot ' + (ok ? 'green' : 'red');
  text.textContent = ok ? 'Connected to Supabase' : 'Connection failed';
}

// ─── Alert System ─────────────────────────────────────────────────────────────
function showAlert(message, type = 'success') {
  const container = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
  alert.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(alert);
  setTimeout(() => { alert.style.opacity = '0'; setTimeout(() => alert.remove(), 300); }, 4000);
}

// ─── Tab Switching ────────────────────────────────────────────────────────────
function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');
  btn.classList.add('active');
}

// ─── Business Info ────────────────────────────────────────────────────────────
function loadBusinessInfo() {
  if (!businessRow) return;
  document.getElementById('businessName').value = businessRow.name || '';
  document.getElementById('businessPhone').value = businessRow.phone || '';
  document.getElementById('businessLocation').value = businessRow.location || '';
  document.getElementById('flavorOptions').value = businessRow.flavors || '';
}

async function saveBusinessInfo() {
  if (!businessRow) return showAlert('No business record found', 'error');
  try {
    const updated = {
      id: businessRow.id,
      name: document.getElementById('businessName').value,
      phone: document.getElementById('businessPhone').value,
      location: document.getElementById('businessLocation').value,
      flavors: document.getElementById('flavorOptions').value
    };
    await updateBusinessInfo(updated);
    businessRow = { ...businessRow, ...updated };
    showAlert('Business info saved!', 'success');
  } catch (err) {
    showAlert('Error saving: ' + err.message, 'error');
  }
}

// ─── Cakes ────────────────────────────────────────────────────────────────────
function loadCakes() {
  const container = document.getElementById('cakeList');
  container.innerHTML = allCakes.map(cake => {
    const images = cake.cake_images || [];
    const details = cake.cake_details || [];
    return `
      <div class="cake-item">
        <h3>${cake.title}</h3>
        <p style="color:#666; margin-bottom:12px; font-size:14px;">${cake.description}</p>
        <p style="color: var(--primary); font-weight:600; font-size:13px; margin-bottom:12px;">
          ${cake.starting_price || details.map(d => d.value).join(' • ') || 'No pricing set'}
        </p>
        <p style="color:#999; font-size:12px; margin-bottom:12px;">📸 ${images.length} image(s)</p>
        <button class="btn btn-primary" onclick="editCake('${cake.id}')">✏️ Edit</button>
      </div>
    `;
  }).join('');
}

function editCake(cakeId) {
  const cake = allCakes.find(c => c.id === cakeId);
  if (!cake) return;
  currentEditingCakeId = cakeId;
  const images = cake.cake_images || [];
  const details = cake.cake_details || [];

  document.getElementById('cakeTitle').value = cake.title;
  document.getElementById('cakeDescription').value = cake.description;
  document.getElementById('cakePrice').value = cake.starting_price || '';

  // Image inputs
  const imgContainer = document.getElementById('cakeImageInputs');
  imgContainer.innerHTML = images.map((img, i) => imageInputHTML(i, img.url, img.alt)).join('');
  if (images.length === 0) imgContainer.innerHTML = imageInputHTML(0, '', '');

  // Detail inputs
  const detailContainer = document.getElementById('cakeDetailInputs');
  detailContainer.innerHTML = details.map((d, i) => detailInputHTML(i, d.label, d.value)).join('');

  document.getElementById('cakeModal').classList.add('active');
}

function imageInputHTML(index, url = '', alt = '') {
  return `
    <div class="form-group" style="background: var(--light); padding: 12px; border-radius: 8px; margin-bottom: 8px;" id="imgRow${index}">
      <input type="text" value="${url}" placeholder="Image URL (from Upload tab or web)" style="margin-bottom:6px; width:100%;" id="cakeImgUrl${index}">
      <input type="text" value="${alt}" placeholder="Image description" style="width:100%;" id="cakeImgAlt${index}">
      <button onclick="document.getElementById('imgRow${index}').remove()" style="margin-top:6px; padding:4px 10px; font-size:11px;" class="btn btn-danger">Remove</button>
    </div>
  `;
}

function detailInputHTML(index, label = '', value = '') {
  return `
    <div style="background: var(--light); padding: 12px; border-radius: 8px; margin-bottom: 8px;" id="detailRow${index}">
      <input type="text" value="${label}" placeholder="Label e.g. '1kg (8-12 servings)'" style="margin-bottom:6px; width:100%;" id="detailLabel${index}">
      <input type="text" value="${value}" placeholder="Value e.g. 'KSh 1,800 - 2,200'" style="width:100%;" id="detailValue${index}">
      <button onclick="document.getElementById('detailRow${index}').remove()" style="margin-top:6px; padding:4px 10px; font-size:11px;" class="btn btn-danger">Remove</button>
    </div>
  `;
}

function addImageInput() {
  const c = document.getElementById('cakeImageInputs');
  const idx = c.children.length;
  c.insertAdjacentHTML('beforeend', imageInputHTML(idx));
}

function addDetailInput() {
  const c = document.getElementById('cakeDetailInputs');
  const idx = c.children.length;
  c.insertAdjacentHTML('beforeend', detailInputHTML(idx));
}

async function saveCake() {
  if (!currentEditingCakeId) return;
  const btn = document.getElementById('saveCakeBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  try {
    // Gather cake data
    const cakeData = {
      title: document.getElementById('cakeTitle').value,
      description: document.getElementById('cakeDescription').value,
      starting_price: document.getElementById('cakePrice').value || null
    };
    await updateCake(currentEditingCakeId, cakeData);

    // Gather images
    const imgContainer = document.getElementById('cakeImageInputs');
    const images = [];
    imgContainer.querySelectorAll('[id^="cakeImgUrl"]').forEach((input, i) => {
      const url = input.value.trim();
      const altInput = imgContainer.querySelector(`#cakeImgAlt${input.id.replace('cakeImgUrl', '')}`);
      if (url) images.push({ url, alt: altInput ? altInput.value : '' });
    });
    await updateCakeImages(currentEditingCakeId, images);

    // Gather details
    const detailContainer = document.getElementById('cakeDetailInputs');
    const details = [];
    detailContainer.querySelectorAll('[id^="detailLabel"]').forEach((input) => {
      const idx = input.id.replace('detailLabel', '');
      const valInput = detailContainer.querySelector(`#detailValue${idx}`);
      if (input.value.trim() && valInput && valInput.value.trim()) {
        details.push({ label: input.value.trim(), value: valInput.value.trim() });
      }
    });
    await updateCakeDetails(currentEditingCakeId, details);

    // Refresh local data
    allCakes = await fetchCakes();
    loadCakes();
    closeCakeModal();
    showAlert('Cake saved successfully!', 'success');
  } catch (err) {
    showAlert('Error saving cake: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Cake';
  }
}

function closeCakeModal() {
  document.getElementById('cakeModal').classList.remove('active');
  currentEditingCakeId = null;
}

// ─── Features ─────────────────────────────────────────────────────────────────
function loadFeatures() {
  const container = document.getElementById('featureList');
  if (!allFeatures.length) { container.innerHTML = '<p style="color:#999;">No features yet. Add one!</p>'; return; }
  container.innerHTML = allFeatures.map(f => `
    <div class="list-item">
      <div class="list-item-content">
        <div style="font-size:2rem; margin-bottom:8px;">${f.icon}</div>
        <strong>${f.title}</strong><br>
        <span style="color:#666; font-size:14px;">${f.description}</span>
      </div>
      <div class="list-item-actions">
        <button class="btn btn-secondary" onclick="openEditFeatureModal('${f.id}')">✏️</button>
        <button class="btn btn-danger" onclick="removeFeature('${f.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openAddFeatureModal() {
  document.getElementById('genericModalTitle').textContent = 'Add Feature';
  document.getElementById('genericModalBody').innerHTML = `
    <div class="form-group"><label>Emoji Icon</label><input type="text" id="gIcon" placeholder="✨" value="✨"></div>
    <div class="form-group"><label>Title</label><input type="text" id="gTitle" placeholder="Custom Feature"></div>
    <div class="form-group"><label>Description</label><input type="text" id="gDesc" placeholder="Feature description"></div>
  `;
  document.getElementById('genericSaveBtn').onclick = async () => {
    try {
      await addFeature({
        icon: document.getElementById('gIcon').value,
        title: document.getElementById('gTitle').value,
        description: document.getElementById('gDesc').value,
        sort_order: allFeatures.length
      });
      allFeatures = await fetchFeatures();
      loadFeatures();
      closeGenericModal();
      showAlert('Feature added!', 'success');
    } catch (e) { showAlert('Error: ' + e.message, 'error'); }
  };
  document.getElementById('genericModal').classList.add('active');
}

function openEditFeatureModal(id) {
  const f = allFeatures.find(x => x.id === id);
  if (!f) return;
  document.getElementById('genericModalTitle').textContent = 'Edit Feature';
  document.getElementById('genericModalBody').innerHTML = `
    <div class="form-group"><label>Emoji Icon</label><input type="text" id="gIcon" value="${f.icon}"></div>
    <div class="form-group"><label>Title</label><input type="text" id="gTitle" value="${f.title}"></div>
    <div class="form-group"><label>Description</label><input type="text" id="gDesc" value="${f.description}"></div>
  `;
  document.getElementById('genericSaveBtn').onclick = async () => {
    try {
      await updateFeature(id, {
        icon: document.getElementById('gIcon').value,
        title: document.getElementById('gTitle').value,
        description: document.getElementById('gDesc').value
      });
      allFeatures = await fetchFeatures();
      loadFeatures();
      closeGenericModal();
      showAlert('Feature updated!', 'success');
    } catch (e) { showAlert('Error: ' + e.message, 'error'); }
  };
  document.getElementById('genericModal').classList.add('active');
}

async function removeFeature(id) {
  if (!confirm('Remove this feature?')) return;
  try {
    await deleteFeature(id);
    allFeatures = await fetchFeatures();
    loadFeatures();
    showAlert('Feature removed.', 'warning');
  } catch (e) { showAlert('Error: ' + e.message, 'error'); }
}

// ─── Ordering Steps ───────────────────────────────────────────────────────────
function loadOrderingSteps() {
  const container = document.getElementById('stepList');
  if (!allSteps.length) { container.innerHTML = '<p style="color:#999;">No steps yet.</p>'; return; }
  container.innerHTML = allSteps.map(s => `
    <div class="list-item">
      <div class="list-item-content">
        <strong>Step ${s.step_number}: ${s.title}</strong><br>
        <span style="color:#666; font-size:14px;">${s.description}</span>
      </div>
      <div class="list-item-actions">
        <button class="btn btn-secondary" onclick="openEditStepModal('${s.id}')">✏️</button>
        <button class="btn btn-danger" onclick="removeStep('${s.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openAddStepModal() {
  const nextNum = allSteps.length + 1;
  document.getElementById('genericModalTitle').textContent = 'Add Ordering Step';
  document.getElementById('genericModalBody').innerHTML = `
    <div class="form-group"><label>Step Number</label><input type="number" id="gNum" value="${nextNum}"></div>
    <div class="form-group"><label>Title</label><input type="text" id="gTitle" placeholder="Step title"></div>
    <div class="form-group"><label>Description</label><textarea id="gDesc" placeholder="Step description"></textarea></div>
  `;
  document.getElementById('genericSaveBtn').onclick = async () => {
    try {
      await addOrderingStep({
        step_number: parseInt(document.getElementById('gNum').value),
        title: document.getElementById('gTitle').value,
        description: document.getElementById('gDesc').value
      });
      allSteps = await fetchOrderingSteps();
      loadOrderingSteps();
      closeGenericModal();
      showAlert('Step added!', 'success');
    } catch (e) { showAlert('Error: ' + e.message, 'error'); }
  };
  document.getElementById('genericModal').classList.add('active');
}

function openEditStepModal(id) {
  const s = allSteps.find(x => x.id === id);
  if (!s) return;
  document.getElementById('genericModalTitle').textContent = 'Edit Step';
  document.getElementById('genericModalBody').innerHTML = `
    <div class="form-group"><label>Step Number</label><input type="number" id="gNum" value="${s.step_number}"></div>
    <div class="form-group"><label>Title</label><input type="text" id="gTitle" value="${s.title}"></div>
    <div class="form-group"><label>Description</label><textarea id="gDesc">${s.description}</textarea></div>
  `;
  document.getElementById('genericSaveBtn').onclick = async () => {
    try {
      await updateOrderingStep(id, {
        step_number: parseInt(document.getElementById('gNum').value),
        title: document.getElementById('gTitle').value,
        description: document.getElementById('gDesc').value
      });
      allSteps = await fetchOrderingSteps();
      loadOrderingSteps();
      closeGenericModal();
      showAlert('Step updated!', 'success');
    } catch (e) { showAlert('Error: ' + e.message, 'error'); }
  };
  document.getElementById('genericModal').classList.add('active');
}

async function removeStep(id) {
  if (!confirm('Remove this step?')) return;
  try {
    await deleteOrderingStep(id);
    allSteps = await fetchOrderingSteps();
    loadOrderingSteps();
    showAlert('Step removed.', 'warning');
  } catch (e) { showAlert('Error: ' + e.message, 'error'); }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function loadTestimonials() {
  const container = document.getElementById('testimonialList');
  if (!allTestimonials.length) { container.innerHTML = '<p style="color:#999;">No testimonials yet.</p>'; return; }
  container.innerHTML = allTestimonials.map(t => `
    <div class="list-item">
      <div class="list-item-content">
        <div style="color: var(--primary); margin-bottom:6px;">${'⭐'.repeat(t.stars)}</div>
        <p style="font-style:italic; color:#666; font-size:14px; margin-bottom:8px;">"${t.text.substring(0, 100)}..."</p>
        <strong>${t.author}</strong> — <span style="color: var(--primary); font-size:13px;">${t.event}</span>
      </div>
      <div class="list-item-actions">
        <button class="btn btn-secondary" onclick="openEditTestimonialModal('${t.id}')">✏️</button>
        <button class="btn btn-danger" onclick="removeTestimonial('${t.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openAddTestimonialModal() {
  document.getElementById('genericModalTitle').textContent = 'Add Testimonial';
  document.getElementById('genericModalBody').innerHTML = testimonialFormHTML(5, '', '', '');
  document.getElementById('genericSaveBtn').onclick = async () => {
    try {
      await addTestimonial({
        stars: parseInt(document.getElementById('gStars').value),
        text: document.getElementById('gText').value,
        author: document.getElementById('gAuthor').value,
        event: document.getElementById('gEvent').value,
        sort_order: allTestimonials.length
      });
      allTestimonials = await fetchTestimonials();
      loadTestimonials();
      closeGenericModal();
      showAlert('Testimonial added!', 'success');
    } catch (e) { showAlert('Error: ' + e.message, 'error'); }
  };
  document.getElementById('genericModal').classList.add('active');
}

function openEditTestimonialModal(id) {
  const t = allTestimonials.find(x => x.id === id);
  if (!t) return;
  document.getElementById('genericModalTitle').textContent = 'Edit Testimonial';
  document.getElementById('genericModalBody').innerHTML = testimonialFormHTML(t.stars, t.text, t.author, t.event);
  document.getElementById('genericSaveBtn').onclick = async () => {
    try {
      await updateTestimonial(id, {
        stars: parseInt(document.getElementById('gStars').value),
        text: document.getElementById('gText').value,
        author: document.getElementById('gAuthor').value,
        event: document.getElementById('gEvent').value
      });
      allTestimonials = await fetchTestimonials();
      loadTestimonials();
      closeGenericModal();
      showAlert('Testimonial updated!', 'success');
    } catch (e) { showAlert('Error: ' + e.message, 'error'); }
  };
  document.getElementById('genericModal').classList.add('active');
}

function testimonialFormHTML(stars, text, author, event) {
  return `
    <div class="form-group">
      <label>Star Rating</label>
      <select id="gStars">${[5,4,3,2,1].map(n => `<option value="${n}" ${n==stars?'selected':''}>${'⭐'.repeat(n)} (${n})</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Review Text</label><textarea id="gText" rows="4">${text}</textarea></div>
    <div class="form-group"><label>Author Name</label><input type="text" id="gAuthor" value="${author}" placeholder="Grace M."></div>
    <div class="form-group"><label>Event</label><input type="text" id="gEvent" value="${event}" placeholder="Birthday Party, January 2025"></div>
  `;
}

async function removeTestimonial(id) {
  if (!confirm('Remove this testimonial?')) return;
  try {
    await deleteTestimonial(id);
    allTestimonials = await fetchTestimonials();
    loadTestimonials();
    showAlert('Testimonial removed.', 'warning');
  } catch (e) { showAlert('Error: ' + e.message, 'error'); }
}

// ─── About ────────────────────────────────────────────────────────────────────
function loadAbout() {
  const container = document.getElementById('aboutFields');
  if (!allAbout.length) { container.innerHTML = '<p style="color:#999;">No about content found.</p>'; return; }
  container.innerHTML = allAbout.map(row => `
    <div class="form-group">
      <label>Paragraph ${row.paragraph_number}</label>
      <textarea id="aboutPara${row.id}" rows="4">${row.content}</textarea>
      <button class="btn btn-success" onclick="saveAboutParagraph('${row.id}')" style="margin-top:8px; padding:8px 16px; font-size:13px;">💾 Save Paragraph ${row.paragraph_number}</button>
    </div>
  `).join('');
}

async function saveAboutParagraph(id) {
  const content = document.getElementById(`aboutPara${id}`).value;
  try {
    await updateAboutParagraph(id, content);
    showAlert('Paragraph saved!', 'success');
  } catch (e) { showAlert('Error: ' + e.message, 'error'); }
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function previewUploadImages(event) {
  filesToUpload = Array.from(event.target.files);
  const preview = document.getElementById('uploadPreview');
  if (!filesToUpload.length) { preview.innerHTML = ''; document.getElementById('uploadBtn').style.display = 'none'; return; }

  preview.innerHTML = `
    <p style="margin-bottom:12px; font-weight:600;">Selected ${filesToUpload.length} file(s):</p>
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:8px;">
      ${filesToUpload.map(f => `
        <div style="text-align:center;">
          <img src="${URL.createObjectURL(f)}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; border:2px solid #eee;">
          <p style="font-size:11px; color:#666; margin-top:4px; word-break:break-all;">${f.name}</p>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('uploadBtn').style.display = 'inline-block';
}

async function uploadImages() {
  const btn = document.getElementById('uploadBtn');
  btn.disabled = true;
  btn.textContent = 'Uploading...';
  const links = [];

  for (const file of filesToUpload) {
    try {
      const path = `cakes/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const url = await uploadCakeImage(file, path);
      links.push({ name: file.name, url });
    } catch (e) {
      showAlert(`Failed to upload ${file.name}: ${e.message}`, 'error');
    }
  }

  if (links.length) {
    document.getElementById('uploadedLinks').innerHTML = `
      <h3 style="margin-bottom:16px;">✅ Uploaded Image URLs — Copy & paste into cake image fields:</h3>
      ${links.map(l => `
        <div style="background: var(--light); padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; display:flex; align-items:center; gap:12px;">
          <img src="${l.url}" style="width:48px; height:48px; object-fit:cover; border-radius:6px; flex-shrink:0;">
          <div style="flex:1; min-width:0;">
            <p style="font-size:12px; color:#666; margin-bottom:4px;">${l.name}</p>
            <input type="text" value="${l.url}" readonly onclick="this.select()" style="width:100%; font-size:12px; padding:6px; border:1px solid #ddd; border-radius:4px; background:white; cursor:pointer;">
          </div>
        </div>
      `).join('')}
    `;
    showAlert(`${links.length} image(s) uploaded! URLs are ready to copy.`, 'success');
  }

  btn.disabled = false;
  btn.textContent = '⬆️ Upload Images';
}

// ─── Generic Modal ────────────────────────────────────────────────────────────
function closeGenericModal() {
  document.getElementById('genericModal').classList.remove('active');
}

// Close modals on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
    currentEditingCakeId = null;
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
