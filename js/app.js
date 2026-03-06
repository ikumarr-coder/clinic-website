(function() {
    'use strict';

    /*function assetUrl(path) {
      if (!path) return "";

      // If already absolute URL
      if (path.startsWith("http")) return path;

      // Find the script that loaded app.js
      const base = document
        .querySelector('script[src*="app.js"]')
        ?.src?.replace(/\/js\/app\.js$/, "") || "";

      // Build full URL
      return base ? base + "/" + path.replace(/^\//, "") : path;
    }*/
    function assetUrl(path) {
      if (!path) return '';

      // If already absolute URL
      if (path.startsWith('http')) return path;

      // Find the script that loaded app.js
      const scriptEl = document.querySelector('script[src*="app.js"]');
      const base = (scriptEl && scriptEl.src) ? scriptEl.src.replace(/\/js\/app\.js.*$/, '') : '' ;

      return base ? base + '/'+path.replace(/^\//,'') : path;
    }


    // Fallback data when config.json is not available (e.g. file://)
    var fallback = {
      developer: {
        name: '',
        email: '',
        website: ''
      },

      clinic: {
        name: 'Your Clinic Name',
        phone: 'Your Phone',
        email: 'your@email.com',
        whatsapp: '',
        address: '',
        logo: ''
        },
        hero: {
          title: 'We Enhance Your Recovery and Performance',
          subtitle: 'Active rehabilitation. Beyond pain relief.',
          ctaText: 'Book Appointment'
        },

      about: {
        title: 'Welcome',
        intro: 'We believe in active rehabilitation.',
        paragraphs: [
          'Our goal is to take you beyond pain relief.',
          'We tailor treatment plans to your needs.'
        ]
      },

      treatmentStrategy: {
        title: 'Our Treatment Strategy',
        description: 'We respect your time and provide thorough examination.',
        highlights: [
          'Manual therapy and exercise programs',
          'Modern diagnostic tools',
          'Regular progress assessments'
        ]
      },

      doctors: [
        {
          id: '1',
          name: 'Dr. Your Name',
          role: 'Physiotherapist',
          experience: '10+ Years',
          bio: 'Short bio.',
          image: 'images/doctors/doctor1.jpg'
        }
      ],

      services: {
        physiotherapy: [{
          title: 'Service',
          description: 'Description.',
          link: '#'
        }],
        chiropractic: [{
          title: 'Service',
          description: 'Description.',
          link: '#'
        }]
      },

      equipment: [
        {
          title: 'Equipment',
          description: 'Description.',
          image: 'images/equipment/1.jpg'
        }
      ],

      reviews: [
        {
          author: 'Patient',
          rating: 5,
          text: 'Excellent treatment.',
          source: 'Google Review'
        }
      ],

      locations: [
        {
          name: 'Main Branch',
          address: 'Your address',
          phone: 'Branch phone',
          hours: '8 AM - 8 PM',
          mapUrl: 'https://www.google.com/maps',
          image: 'images/locations/1.jpg'
        }
      ],

      gallery: [
        {
          src: 'images/gallery/1.jpg',
          alt: 'Clinic'
        }
      ]
    };

    var STORAGE_KEY = "physio_clinic_config";

    var data = null;

function getData() {
  return data || fallback;
}

// Render doctors
function renderDoctors() {
  var d = getData().doctors || [];
  var grid = document.getElementById('doctors-grid');

  if (!grid) return;

  grid.innerHTML = d.map(function (doc) {

    var imgPath = doc.image ? assetUrl(doc.image) : "";

    var imgHtml = imgPath
      ? '<img src="' + imgPath + '" alt="' + escapeHtml(doc.name) + '" loading="lazy" ' +
        'onerror="this.style.display=\'none\'; var s=this.nextElementSibling; if(s){s.style.display=\'flex\'; s.textContent=\'No image\';}">' +
        '<span class="no-img" style="display:none;"></span>'
      : '<span class="no-img">No image</span>';

    return (
      '<div class="doctor-card">' +
        '<div class="doctor-img-wrap">' + imgHtml + '</div>' +
        '<div class="doctor-card-body">' +
          '<h3>' + escapeHtml(doc.name) + '</h3>' +
          '<p class="role">' + escapeHtml(doc.role) + '</p>' +
          (doc.experience ? '<p class="experience">' + escapeHtml(doc.experience) + '</p>' : '') +
          (doc.bio ? '<p class="bio">' + escapeHtml(doc.bio) + '</p>' : '') +
        '</div>' +
      '</div>'
    );
  }).join('');
}

// Escape HTML to prevent injection
function escapeHtml(s) {
  if (!s) return '';
  var div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderServices() {
  var d = getData();

  var physio = (d.services && d.services.physiotherapy) || [];
  var chiro = (d.services && d.services.chiropractic) || [];

  var phEl = document.getElementById('services-physio');
  var chEl = document.getElementById('services-chiro');

  if (phEl) {
    phEl.innerHTML = physio.map(function (s) {
      return (
        '<div class="service-card">' +
          '<h3>' + escapeHtml(s.title) + '</h3>' +
          '<p>' + escapeHtml(s.description) + '</p>' +
          (s.link
            ? '<a href="' + escapeHtml(s.link) + '">Read more</a>'
            : '') +
        '</div>'
      );
    }).join('');
  }

  if (chEl) {
    chEl.innerHTML = chiro.map(function (s) {
      return (
        '<div class="service-card">' +
          '<h3>' + escapeHtml(s.title) + '</h3>' +
          '<p>' + escapeHtml(s.description) + '</p>' +
          (s.link
            ? '<a href="' + escapeHtml(s.link) + '">Read more</a>'
            : '') +
        '</div>'
      );
    }).join('');
  }
}


function renderEquipment() {
  var list = getData().equipment || [];
  var grid = document.getElementById('equipment-grid');

  if (!grid) return;

  grid.innerHTML = list.map(function (eq) {

    var imgPath = eq.image ? assetUrl(eq.image) : '';

    var imgHtml = imgPath
      ? '<img src="' + imgPath + '" alt="' + escapeHtml(eq.title) +
        '" loading="lazy" onerror="this.style.display=\'none\'; var s=this.nextElementSibling; if(s)s.style.display=\'flex\';">' +
        '<span class="no-img" style="display:none;">No image</span>'
      : '<span class="no-img">No image</span>';

    return (
      '<div class="equipment-card">' +
        '<div class="equipment-img-wrap">' + imgHtml + '</div>' +
        '<div class="equipment-card-body">' +
          '<h3>' + escapeHtml(eq.title) + '</h3>' +
          '<p>' + escapeHtml(eq.description) + '</p>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function renderServices() {
  var d = getData();

  var physio = (d.services && d.services.physiotherapy) || [] : [];
  var chiro = (d.services && d.services.chiropractic) || [] : [];

  var phEl = document.getElementById('services-physio');
  var chEl = document.getElementById('services-chiro');

  if (phEl) {
    phEl.innerHTML = physio.map(function (s) {
      return (
        '<div class="service-card">' +
          '<h3>' + escapeHtml(s.title) + '</h3>' +
          '<p>' + escapeHtml(s.description) + '</p>' +
          (s.link
            ? '<a href="' + escapeHtml(s.link) + '">Read more</a>'
            : '') +
        '</div>'
      );
    }).join('');
  }

  if (chEl) {
    chEl.innerHTML = chiro.map(function (s) {
      return (
        '<div class="service-card">' +
          '<h3>' + escapeHtml(s.title) + '</h3>' +
          '<p>' + escapeHtml(s.description) + '</p>' +
          (s.link
            ? '<a href="' + escapeHtml(s.link) + '">Read more</a>'
            : '') +
        '</div>'
      );
    }).join('');
  }
}


function renderEquipment() {
  var list = getData().equipment || [];
  var grid = document.getElementById('equipment-grid');

  if (!grid) return;

  grid.innerHTML = list.map(function (eq) {

    var imgPath = eq.image ? assetUrl(eq.image) : '';

    var imgHtml = imgPath
      ? '<img src="' + imgPath + '" alt="' + escapeHtml(eq.title) +
        '" loading="lazy" onerror="this.style.display=\'none\'; var s=this.nextElementSibling; if(s)s.style.display=\'flex\';">' +
        '<span class="no-img" style="display:none;">No image</span>'
      : '<span class="no-img">No image</span>';

    return (
      '<div class="equipment-card">' +
        '<div class="equipment-img-wrap">' + imgHtml + '</div>' +
        '<div class="equipment-card-body">' +
          '<h3>' + escapeHtml(eq.title) + '</h3>' +
          '<p>' + escapeHtml(eq.description) + '</p>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function renderGallery() {
  var list = getData().gallery || [];
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;

  grid.innerHTML = list.map(function (g) {
    var src = g.src ? assetUrl(g.src) : "";

    var content = src
      ? '<img src="' + src + '" alt="' + escapeHtml(g.alt || "Gallery") + '" loading="lazy" onerror="this.style.display=\'none\'; var s=this.nextElementSibling; if(s) s.style.display=\'flex\';">' +
        '<span class="no-img" style="display:none;">No image</span>'
      : '<span class="no-img">No image</span>';

    return '<div class="gallery-item">' + content + '</div>';
  }).join("");
}


function renderLocations() {
  var list = getData().locations || [];
  var grid = document.getElementById("locations-grid");
  if (!grid) return;

  grid.innerHTML = list.map(function (loc) {
    var imgPath = loc.image ? assetUrl(loc.image) : "";

    var imgHtml = imgPath
      ? '<img src="' + imgPath + '" alt="' + escapeHtml(loc.name) + '" loading="lazy" onerror="this.style.display=\'none\'; var s=this.nextElementSibling; if(s) s.style.display=\'flex\';">' +
        '<span class="no-img" style="display:none;">Location</span>'
      : '<span class="no-img">Location</span>';

    return '<div class="location-card">' +
      '<div class="location-img-wrap">' + imgHtml + '</div>' +
      '<div class="location-card-body">' +
      '<h3>' + escapeHtml(loc.name) + '</h3>' +
      '<p>' + escapeHtml(loc.address) + '</p>' +
      '<p><a href="tel:' + escapeHtml(loc.phone) + '">' + escapeHtml(loc.phone) + '</a></p>' +
      '<p>' + escapeHtml(loc.hours) + '</p>' +
      (loc.mapUrl
        ? '<a href="' + escapeHtml(loc.mapUrl) + '" target="_blank" rel="noopener">Get Directions</a>'
        : '') +
      '</div></div>';
  }).join("");
}

function renderReviews() {
  var list = getData().reviews;
  var container = document.getElementById('reviews-container');
  if (!container) return;

  container.innerHTML = list.map(function (r) {
    var rating = r.rating || 5;
    var stars = '*'.repeat(rating) + '☆'.repeat(5 - rating);

    return '<div class="review-card">' +
      '<p class="stars">' + stars + '</p>' +
      '<p class="text">' + escapeHtml(r.text) + '</p>' +
      '<p class="author">• ' + escapeHtml(r.author) + '</p>' +
      '<p class="source">' + escapeHtml(r.source || '') + '</p>' +
      '</div>';
  }).join('');
}

function applyStaticContent() {
  var d = getData();
  var clinic = d.clinic || {};

  var set = function (id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  };

  var sethref = function (id, value, prefix) {
    var el = document.getElementById(id);
    if (!el) return;

    if (prefix === "tel:") {
      el.href = "tel:" + (value || "").replace(/\D/g, "");
    } else if (prefix === "mailto:") {
      el.href = "mailto:" + (value || "");
    } else if (prefix === "whatsapp") {
      el.href = "https://wa.me/" + (value || "").replace(/\D/g, "");
    } else {
      el.href = value || "#";
    }
  };

  set('clinic-name', clinic.name);

  var logoImg = document.getElementById('logo-img');
  var nameEl = document.getElementById('clinic-name');

  if (logoImg && nameEl) {
    var logoPath = clinic.logo ? assetUrl(clinic.logo) : "";

    if (logoPath) {
      logoImg.src = logoPath;
      logoImg.alt = (clinic.name || "") + " Logo";
      logoImg.style.display = "";

      logoImg.onerror = function () {
        logoImg.style.display = "none";
        nameEl.style.display = "";
      };

      nameEl.style.display = "none";
    } else {
      logoImg.style.display = "none";
      nameEl.style.display = "";
    }
  }

  set('header-phone', clinic.phone);
  set('hero-title', (d.hero || {}).title);
  set('hero-subtitle', (d.hero || {}).subtitle);
  set('hero-cta', (d.hero || {}).ctaText);

  set('about-title', (d.about || {}).title);
  set('about-intro', (d.about || {}).intro);

  set('strategy-title', (d.treatmentStrategy || {}).title);
  set('strategy-desc', (d.treatmentStrategy || {}).description);

  set('footer-name', clinic.name);
  set('contact-phone', clinic.phone);
  set('contact-email', clinic.email);

  sethref('header-phone', clinic.phone, "tel:");
  sethref('contact-phone', clinic.phone, "tel:");
  sethref('contact-email', clinic.email, "mailto:");
  sethref('contact-whatsapp', clinic.whatsapp, "whatsapp");

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var dev = d.developer || {};
  var devName = (dev.name || "").trim();
  var developerEl = document.getElementById('developer-credit');

  if (developerEl) {
    if (devName) {
      var link =
        (dev.website || "").trim() ||
        ((dev.email || "").trim() ? "mailto:" + dev.email : "");

      if (link) {
        developerEl.innerHTML =
          '<a href="' +
          escapeHtml(link) +
          '" target="_blank" rel="noopener">' +
          escapeHtml(devName) +
          "</a>";
      } else {
        developerEl.textContent = devName;
      }
    } else {
      developerEl.parentElement.style.display = "none";
    }
  }

  var aboutParas = (d.about && d.about.paragraphs) ? (Array.isArray(d.about.paragraphs) ? d.about.paragraphs : []) : [];
  var aboutContainer = document.getElementById('about-paragraphs');

  if (aboutContainer) {
    aboutContainer.innerHTML = aboutParas
      .map(function (p) {
        return '<p>' + escapeHtml(p) + '</p>';
      })
      .join('');
  }

  var highlights = (d.treatmentStrategy && d.treatmentStrategy.highlights) ? (Array.isArray(d.treatmentStrategy.highlights) ? d.treatmentStrategy.highlights : []) : [];
  var listEl = document.getElementById('strategy-list');

  if (listEl) {
    listEl.innerHTML = highlights
      .map(function (h) {
        return '<li>' + escapeHtml(h) + '</li>';
      })
      .join('');
  }
}

// Navigation Toggle
function initNav() {
  var toggle = document.querySelector('.nav-toggle');
  var list = document.querySelector('.nav-list');

  if (toggle && list) {
    toggle.addEventListener('click', function () {
      var open = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });

    document.addEventListener('click', function (e) {
      if (!list.contains(e.target) && !toggle.contains(e.target)) {
        list.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}


// Contact Form
function initContactForm() {
  var form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = (form.querySelector('#name') || {}).value || '';
      var ph = (form.querySelector('#phone') || {}).value || '';

      var msg = 'Hi, I would like to book an appointment.';

      if (name) msg += ' Name: ' + name;
      if (ph) msg += ' Phone: ' + ph;

      var whatsapp = (getData()?.clinic || {}).whatsapp || '';

      if (whatsapp) {
        window.open(
          'https://wa.me/' +
            whatsapp.replace(/\D/g, '') +
            '?text=' +
            encodeURIComponent(msg),
          '_blank'
        );
      } else {
        alert('Thank you. We will contact you soon.');
      }
    });
  }
}

function run() {
  applyStaticContent();
  renderDoctors();
  renderServices();
  renderEquipment();
  renderGallery();
  renderLocations();
  renderReviews();
  initNav();
  initContactForm();
}

function tryRun() {
    try {
        run();
    } catch (err) {
        data = fallback;
        try { run(); } catch (e) {}
    }

}
// Load config: admin saves go to localStorage first,
// otherwise load data/config.json
try {
  var stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    var parsed = JSON.parse(stored);

    if (parsed && typeof parsed === 'object') {
      data = parsed;
      tryRun();
      return;
    }
  }

} catch (e) {}
var configPath = 'data/config.json';
fetch(configPath)
    .then(function (r) {return r.ok ? r.json() : Promise.reject(); } )
    .then(function (json) {data = json; tryRun(); } )
    .catch(function () {data = fallback; tryRun(); } );
}) ();