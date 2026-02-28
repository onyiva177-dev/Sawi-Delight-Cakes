// Sawi's Delight Cakes - Main Application Logic (Supabase Version)

// Hero slide images (static - from images/ folder)
const heroSlides = [
  { image: 'images/hero1.jpg', alt: 'Wedding Cake Display' },
  { image: 'images/hero2.jpg', alt: 'Birthday Celebration' },
  { image: 'images/hero3.jpg', alt: 'Graduation Cake' }
];

// ─── Initialize ───────────────────────────────────────────────────────────────
async function initWebsite() {
  try {
    renderHeroSlideshow();

    // Fetch all data from Supabase in parallel
    const [business, cakes, features, steps, testimonials, about] = await Promise.all([
      fetchBusinessInfo(),
      fetchCakes(),
      fetchFeatures(),
      fetchOrderingSteps(),
      fetchTestimonials(),
      fetchAboutContent()
    ]);

    renderCakes(cakes, business);
    renderFeatures(features);
    renderFlavorOptions(business);
    renderOrderingSteps(steps);
    renderTestimonials(testimonials);
    renderAbout(about);
    renderContactInfo(business);
    initSmoothScroll();
    initScrollAnimations();

  } catch (err) {
    console.error('Failed to load website data:', err);
  } finally {
    // Hide loading overlay
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
    setTimeout(() => { if (overlay) overlay.remove(); }, 600);
  }
}

// ─── Hero Slideshow ───────────────────────────────────────────────────────────
function renderHeroSlideshow() {
  const container = document.getElementById('heroSlideshow');
  if (!container) return;
  container.innerHTML = heroSlides.map((slide, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image: url('${slide.image}')"></div>
  `).join('');
  let current = 0;
  const slides = container.querySelectorAll('.hero-slide');
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
}

// ─── Cakes ────────────────────────────────────────────────────────────────────
function renderCakes(cakes, business) {
  const container = document.getElementById('cakeCategories');
  if (!container || !cakes.length) return;
  const phone = business ? business.phone.replace(/[^0-9]/g, '') : '254797486557';

  container.innerHTML = cakes.map((cake, cakeIndex) => {
    const images = cake.cake_images || [];
    const details = cake.cake_details || [];

    const slidesHTML = images.map((img, i) => `
      <div class="cake-image-slide ${i === 0 ? 'active' : ''}">
        <img src="${img.url}" alt="${img.alt}" loading="lazy">
      </div>
    `).join('');

    const dotsHTML = images.length > 1 ? `
      <div class="slide-nav">
        ${images.map((_, idx) => `
          <span class="slide-dot ${idx === 0 ? 'active' : ''}" data-cake="${cakeIndex}" data-slide="${idx}"></span>
        `).join('')}
      </div>
    ` : '';

    const detailsHTML = details.map(d => `
      <div class="detail-item">
        <span class="detail-label">${d.label}</span>
        <span class="detail-value">${d.value}</span>
      </div>
    `).join('');

    const priceHTML = cake.starting_price ? `<p class="price">${cake.starting_price}</p>` : '';

    return `
      <div class="cake-card" data-cake-index="${cakeIndex}">
        <div class="cake-image-container">
          ${slidesHTML}
          ${dotsHTML}
        </div>
        <div class="cake-content">
          <h3 class="cake-title">${cake.title}</h3>
          <p class="cake-description">${cake.description}</p>
          <div class="cake-details">${detailsHTML}</div>
          ${priceHTML}
          <div class="cake-cta">
            <a href="https://wa.me/${phone}?text=I'm%20interested%20in%20${encodeURIComponent(cake.title)}"
               class="btn btn-primary btn-small" target="_blank">Order Now</a>
            <a href="tel:${business ? business.phone : '+254797486557'}" class="btn btn-secondary btn-small">Call Us</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initCakeSlideshows(cakes);

  document.querySelectorAll('.slide-dot').forEach(dot => {
    dot.addEventListener('click', function () {
      goToCakeSlide(parseInt(this.dataset.cake), parseInt(this.dataset.slide));
    });
  });
}

function initCakeSlideshows(cakes) {
  cakes.forEach((cake, cakeIndex) => {
    const images = cake.cake_images || [];
    if (images.length > 1) {
      let current = 0;
      setInterval(() => {
        current = (current + 1) % images.length;
        goToCakeSlide(cakeIndex, current);
      }, 4000 + cakeIndex * 500);
    }
  });
}

function goToCakeSlide(cakeIndex, slideIndex) {
  const card = document.querySelector(`[data-cake-index="${cakeIndex}"]`);
  if (!card) return;
  card.querySelectorAll('.cake-image-slide').forEach(s => s.classList.remove('active'));
  card.querySelectorAll('.slide-dot').forEach(d => d.classList.remove('active'));
  const slide = card.querySelectorAll('.cake-image-slide')[slideIndex];
  const dot = card.querySelectorAll('.slide-dot')[slideIndex];
  if (slide) slide.classList.add('active');
  if (dot) dot.classList.add('active');
}

// ─── Features ─────────────────────────────────────────────────────────────────
function renderFeatures(features) {
  const container = document.getElementById('featuresGrid');
  if (!container || !features.length) return;
  container.innerHTML = features.map(f => `
    <div class="feature-item">
      <div class="feature-icon">${f.icon}</div>
      <h4 class="feature-title">${f.title}</h4>
      <p class="feature-desc">${f.description}</p>
    </div>
  `).join('');
}

// ─── Flavors ──────────────────────────────────────────────────────────────────
function renderFlavorOptions(business) {
  const el = document.getElementById('flavorOptions');
  if (el && business) el.textContent = business.flavors;
}

// ─── Ordering Steps ───────────────────────────────────────────────────────────
function renderOrderingSteps(steps) {
  const container = document.getElementById('processSteps');
  if (!container || !steps.length) return;
  container.innerHTML = steps.map(s => `
    <div class="process-step">
      <div class="step-number">${s.step_number}</div>
      <h4 class="step-title">${s.title}</h4>
      <p class="step-desc">${s.description}</p>
    </div>
  `).join('');
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function renderTestimonials(testimonials) {
  const container = document.getElementById('testimonialGrid');
  if (!container || !testimonials.length) return;
  container.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="quote-icon">"</div>
      <div class="stars">${'⭐'.repeat(t.stars)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <p class="testimonial-author">- ${t.author}</p>
      <p class="testimonial-event">${t.event}</p>
    </div>
  `).join('');
}

// ─── About ────────────────────────────────────────────────────────────────────
function renderAbout(aboutRows) {
  const container = document.getElementById('aboutContent');
  if (!container || !aboutRows.length) return;
  container.innerHTML = aboutRows.map(r => `<p>${r.content}</p>`).join('');
}

// ─── Contact Info ─────────────────────────────────────────────────────────────
function renderContactInfo(business) {
  if (!business) return;
  const phone = business.phone;
  const phoneNum = phone.replace(/[^0-9]/g, '');

  const locationAddress = document.getElementById('locationAddress');
  if (locationAddress) locationAddress.innerHTML = business.location.replace(/,/g, '<br>');

  const whatsappLink = document.getElementById('whatsappLink');
  if (whatsappLink) { whatsappLink.href = `https://wa.me/${phoneNum}`; whatsappLink.textContent = phone; }

  const phoneLink = document.getElementById('phoneLink');
  if (phoneLink) { phoneLink.href = `tel:${phone}`; phoneLink.textContent = phone; }

  const footerLocation = document.getElementById('footerLocation');
  if (footerLocation) footerLocation.textContent = business.location;

  const footerWhatsapp = document.getElementById('footerWhatsapp');
  if (footerWhatsapp) { footerWhatsapp.href = `https://wa.me/${phoneNum}`; footerWhatsapp.textContent = phone; }

  // Update all WhatsApp links dynamically
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    if (link.href.includes('254797486557')) {
      link.href = link.href.replace('254797486557', phoneNum);
    }
  });
}

// ─── Smooth Scroll ────────────────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ─── Scroll Animations ────────────────────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.cake-card, .feature-item, .testimonial-card, .process-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWebsite);
} else {
  initWebsite();
}
