(function () {
"use strict";
alert("admin: script loaded");
var STORAGE_KEY = 'physio_clinic_config';
var SESSION_KEY = 'physio_admin_session';
var DEFAULT_PASSWORD = 'admin123';

var config = null;

/* ---------------- CONFIG ---------------- */

function getConfig() {
    return config || {};
}

function loadConfig() {
    return new Promise(function (resolve) {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                config = JSON.parse(stored);
                resolve(config);
                return;
            }
        } catch (e) {}

        fetch('data/config.json')
            .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
            .then(function (json) {
                config = json;
                resolve(config);
            })
            .catch(function () {
                config = {};
                resolve(config);
            });
    });
}

function getAdminPassword() {
    var c = getConfig();
    return (c.adminPassword && String(c.adminPassword).trim()) || DEFAULT_PASSWORD;
}

/* ---------------- LOGIN ---------------- */

function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
}

function setLoggedIn(value) {
    if (value) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
}

/* ---------------- OBJECT HELPERS ---------------- */

function setValue(obj, path, value) {

    var parts = path.replace(/\]/g, '').split(/\.|\[/).filter(Boolean);
    var o = obj;

    for (var i = 0; i < parts.length - 1; i++) {
        var p = parts[i];
        var next = parts[i+1];
        var isArray = /^\d+$/.test(next);
        if (o[p] == null) o[p]=isArray ? [] : {};
        else if (isArray && !Array.isArray(o[p])) o[p] = [];
        o = o[p];
    }

    if(parts.length) o[parts[parts.length - 1]] = value;
}

function getValue(obj, path) {

    var parts = path.replace(/\]/g, '').split(/\.|\[/);
    var o = obj;

    for (var i = 0; i < parts.length; i++) {

        if (o == null)
            return undefined;

        o = o[parts[i]];
    }

    return o;
}

/* ---------------- FORM FILL ---------------- */

function fillFlatFields(form, data) {

    var inputs = form.querySelectorAll('[name]');

    for (var i = 0; i < inputs.length; i++) {

        var el = inputs[i];
        var name = el.getAttribute('name');

        if (!name || name.indexOf('[') >= 0) continue;

        var val = getValue(data, name);

        if (val !== undefined && val !== null) {

            if (el.type === 'checkbox')
                el.checked = !!val;
            else
                el.value = Array.isArray(val) ? val.join('\n') : String(val);
        }
    }
}

/* ---------------- RENDER FUNCTIONS ---------------- */

function renderDoctors(listEl, doctors) {

    var arr = Array.isArray(doctors) ? doctors : [];

    listEl.innerHTML = "";

    arr.forEach(function (d, i) {

        var div = document.createElement('div');

        div.className = 'repeat-block';
        div.dataset.index = i;

        div.innerHTML =
            '<h3>Doctor ' + (i + 1) + '</h3>' +

            '<div class="row"><label>Name</label>' +
            '<input type="text" data-field="name" value="' + escapeAttr(d.name || '') + '"></div>' +

            '<div class="row"><label>Role</label>' +
            '<input type="text" data-field="role" value="' + escapeAttr(d.role || '') + '"></div>' +

            '<div class="row"><label>Experience</label>' +
            '<input type="text" data-field="experience" value="' + escapeAttr(d.experience || '') + '"></div>' +

            '<div class="row"><label>Bio</label>' +
            '<textarea data-field="bio">' + escapeHtml(d.bio || '') + '</textarea></div>' +

            '<div class="row"><label>Image</label>' +
            '<input type="text" data-field="image" value="' + escapeAttr(d.image || '') + '"></div>' +

            '<div class="block-actions">' +
            '<button type="button" class="btn btn-remove-block">Remove</button></div>';

        listEl.appendChild(div);
    });
}

function renderServiceList(listEl, items, fields) {
  var arr = Array.isArray(items) ? items : [];
  listEl.innerHTML = '';
  arr.forEach(function (s, i) {
    var div = document.createElement('div');
    div.className = 'repeat-block';
    div.dataset.index = i;
    var html = '<h3>Item ' + (i + 1) + '</h3>';
    fields.forEach(function (f) {
      var val = s[f] || '';
      var tag = f === 'description' ? 'textarea' : 'input';
      var type = f === 'link' ? 'text' : (f === 'description' ? null : 'text');
      html += '<div class="row"><label>' + f.charAt(0).toUpperCase() + f.slice(1) + '</label>';
      if (tag === 'textarea') html += '<textarea data-field="' + f + '">' + escapeHtml(val) + '</textarea>';
      else html += '<input type="' + (type || 'text') + '" data-field="' + f + '" value="' + escapeAttr(val) + '">';
      html += '</div>';
    });
    html += '<div class="block-actions"><button type="button" class="btn btn-text btn-remove-block">Remove</button></div>';
    div.innerHTML = html;
    listEl.appendChild(div);
  });
}

function renderEquipment(listEl, items) {

    var arr = Array.isArray(items) ? items : [];

    listEl.innerHTML = "";

    arr.forEach(function (e, i) {

        var div = document.createElement("div");

        div.className = "repeat-block";
        div.dataset.index = i;

        div.innerHTML =
            '<h3>Equipment ' + (i + 1) + '</h3>' +

            '<div class="row"><label>Title</label>' +
            '<input type="text" data-field="title" value="' + escapeAttr(e.title || '') + '"></div>' +

            '<div class="row"><label>Description</label>' +
            '<textarea data-field="description">' + escapeHtml(e.description || '') + '</textarea></div>' +

            '<div class="row"><label>Image</label>' +
            '<input type="text" data-field="image" value="' + escapeAttr(e.image || '') + '"></div>' +

            '<div class="block-actions"><button type="button" class="btn btn-remove-block">Remove</button></div>';

        listEl.appendChild(div);
    });
}

function renderReviews(listEl, items) {

    var arr = Array.isArray(items) ? items : [];

    listEl.innerHTML = "";

    arr.forEach(function (r, i) {

        var div = document.createElement('div');

        div.className = 'repeat-block';
        div.dataset.index = i;

        div.innerHTML =
            '<h3>Review ' + (i + 1) + '</h3>' +

            '<div class="row"><label>Author</label>' +
            '<input type="text" data-field="author" value="' + escapeAttr(r.author || "") + '"></div>' +

            '<div class="row"><label>Rating</label>' +
            '<input type="number" min="1" max="5" data-field="rating" value="' + (r.rating || 5) + '"></div>' +

            '<div class="row"><label>Text</label>' +
            '<textarea data-field="text">' + escapeHtml(r.text || '') + '</textarea></div>' +

            '<div class="block-actions"><button type="button" class="btn btn-remove-block">Remove</button></div>';

        listEl.appendChild(div);
    });
}

function renderLocations(listEl, items) {

    var arr = Array.isArray(items) ? items : [];

    listEl.innerHTML = "";

    arr.forEach(function (l, i) {

        var div = document.createElement('div');

        div.className = 'repeat-block';
        div.dataset.index = i;

        div.innerHTML =
            '<h3>Location ' + (i + 1) + '</h3>' +

            '<div class="row"><label>Name</label>' +
            '<input type="text" data-field="name" value="' + escapeAttr(l.name || "") + '"></div>' +

            '<div class="row"><label>Address</label>' +
            '<input type="text" data-field="address" value="' + escapeAttr(l.address || "") + '"></div>' +

            '<div class="row"><label>Phone</label>' +
            '<input type="text" data-field="phone" value="' + escapeAttr(l.phone || "") + '"></div>' +

            '<div class="block-actions"><button type="button" class="btn btn-remove-block">Remove</button></div>';

        listEl.appendChild(div);
    });
}

function renderGallery(listEl, items) {

    var arr = Array.isArray(items) ? items : [];

    listEl.innerHTML = "";

    arr.forEach(function (g, i) {

        var div = document.createElement('div');

        div.className = 'repeat-block';
        div.dataset.index = i;

        div.innerHTML =
            '<h3>Image ' + (i + 1) + '</h3>' +

            '<div class="row"><label>Image</label>' +
            '<input type="text" data-field="src" value="' + escapeAttr(g.src || "") + '"></div>' +

            '<div class="row"><label>Alt</label>' +
            '<input type="text" data-field="alt" value="' + escapeAttr(g.alt || "") + '"></div>' +

            '<div class="block-actions"><button type="button" class="btn btn-remove-block">Remove</button></div>';

        listEl.appendChild(div);
    });
}

/* ---------------- COLLECT DATA ---------------- */

function collectBlockArray(container, fieldNames) {

    var arr = [];

    var blocks = container.querySelectorAll('.repeat-block');

    blocks.forEach(function (block) {

        var item = {};

        fieldNames.forEach(function (f) {

            var el = block.querySelector('[data-field="' + f + '"]');

            if (el) {

                var val = el.value;

                if (f === 'rating')
                    val = parseInt(val, 10) || 5;

                item[f] = val;
            }
        });

        arr.push(item);
    });

    return arr;
}

function collectFormData() {
    var form = document.getElementById('admin-form');
    var data = {};
    var inputs = form.querySelectorAll('[name]');

    for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        var name = el.getAttribute('name');
        if (!name) continue;

        if (name.indexOf('[') >= 0) {
            var path = name.replace(/\[(\d+)\]/g, '.$1');
            if (el.type == 'checkbox') setValue(data, path, el.checked);
            else setValue(data, path, el.value);
            continue;
        }

        var val = el.type == 'checkbox' ? el.checked : el.value;
        setValue(data, name, val);
    }


    data.doctors = collectBlockArray(document.getElementById('doctors-block'), ['id', 'name', 'role', 'experience', 'bio', 'image']);
    data.services = {
        physiotherapy: collectBlockArray(document.getElementById('physio-list'), ['title', 'description', 'link']),
        chiropractic: collectBlockArray(document.getElementById('chiro-list'), ['title', 'description', 'link'])
    };
    data.equipment = collectBlockArray(document.getElementById('equipment-list'), ['title', 'description', 'image']);
    data.reviews = collectBlockArray(document.getElementById('reviews-list'), ['author', 'rating', 'text', 'source']);
    data.locations = collectBlockArray(document.getElementById('locations-list'), ['name', 'address', 'phone', 'hours', 'mapUrl', 'image']);
    data.gallery = collectBlockArray(document.getElementById('gallery-list'), ['src', 'alt']);

    if (data.adminPassword === '') delete data.adminPassword;

    return data;
}
/* ---------------- PANEL ---------------- */

function showPanel() {

    var loginScreen = document.getElementById('login-screen');
    var adminPanel = document.getElementById('admin-panel');
    if(!loginScreen || !adminPanel) return;
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    var c = getConfig();

    var form = document.getElementById('admin-form');
    if(!form) return;
    fillFlatFields(form, c);
    if(c.about && c.about.paragraphs) {
        var p0 = form.querySelector('[name="about.paragraphs[0]"]');
        var p1 = form.querySelector('[name="about.paragraphs[1]"]');
        if(p0) p0.value = c.about.paragraphs[0] || '';
        if(p1) p1.value = c.about.paragraphs[1] || '';
    }

    if(c.treatmentStrategy && c.treatmentStrategy.highlights) {
        [0, 1, 2].forEach(function (i) {
            var el = form.querySelector('[name="treatmentStrategy.highlights['+i+']"]');
            if (el) el.value = c.treatmentStrategy.highlights[i] || '';
        });
    }
    var doctorsList = document.getElementById('doctors-list');
    var physioList = document.getElementById('physio-list');
    var chiroList = document.getElementById('chiro-list');
    var equipmentList = document.getElementById('equipment-list');
    var reviewsList = document.getElementById('reviews-list');
    var locationsList = document.getElementById('locations-list');
    var galleryList = document.getElementById('gallery-list');
    if(doctorsList) renderDoctors(doctorsList, c.doctors || []);
    if(physioList) renderServiceList(physioList, (c.services && c.services.physiotherapy) || [], ['title', 'description', 'link']);
    if(chiroList) renderServiceList(chiroList, (c.services && c.services.chiropractic) || [], ['title', 'description', 'link']);
    if(equipmentList) renderEquipment(equipmentList, c.equipment || []);
    if(reviewsList) renderReviews(reviewsList, c.reviews || []);
    if(locationsList) renderLocations(locationsList, c.locations || []);
    if(galleryList) renderGallery(galleryList, c.gallery || []);

    bindAddRemove();
}

/* ---------------- ADD / REMOVE ---------------- */

function addBlock(containerId, item, fields, renderFn) {

    var listEl = document.getElementById(containerId);

    var arr = collectBlockArray(listEl, fields);

    arr.push(item || {});

    renderFn(listEl, arr);

    bindAddRemove();
}

function removeBlock(blockEl, containerId, fields, renderFn) {

    var listEl = document.getElementById(containerId);

    var arr = collectBlockArray(listEl, fields);

    var idx = parseInt(blockEl.closest('.repeat-block').dataset.index, 10);

    arr.splice(idx, 1);

    renderOne(listEl, arr);

    bindAddRemove();
}

function bindAddRemove() {

    document.querySelectorAll('.btn-remove-block')
        .forEach(function (btn) {

            btn.onclick = function () {

                var block = this.closest('.repeat-block');
                var list = block.parentElement;
                var id = list.id;
                if(id === 'doctors-list') removeBlock(btn, id, ['id', 'name', 'role', 'experience', 'bio', 'image'], renderDoctors);
                else if(id === 'physio-list') removeBlock(btn, id, ['title', 'description', 'link'], function(el, arr) {renderServiceList(el, arr, ['title', 'description', 'link']); });
                else if(id === 'chiro-list') removeBlock(btn, id, ['title', 'description', 'link'], function(el, arr) {renderServiceList(el, arr, ['title', 'description', 'link']); });
                else if(id === 'equipment-list') removeBlock(btn, id, ['title', 'description', 'image'], renderEquipment);
                else if(id === 'reviews-list') removeBlock(btn, id, ['author', 'rating', 'text', 'source'], renderReviews);
                else if(id === 'locations-list') removeBlock(btn, id, ['name', 'address', 'phone', 'hours', 'mapUrl', 'image'], renderLocations);
                else if(id === 'gallery-list') removeBlock(btn, id, ['src', 'alt'], renderGallery);
            };
        });
}

/* ---------------- SAVE ---------------- */

function saveConfig() {
  config = collectFormData();
  if ((config.adminPassword === undefined || config.adminPassword === '') && getConfig().adminPassword)
    config.adminPassword = getConfig().adminPassword;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config, null, 2));
    var status = document.getElementById('save-status');
    status.textContent = 'Saved. View your site to see changes.';
    status.className = 'save-status saved';
    setTimeout(function () { status.textContent = ''; status.className = 'save-status'; }, 3000);
  } catch (e) {
    document.getElementById('save-status').textContent = 'Save failed.';
    document.getElementById('save-status').className = 'save-status err';
  }
}

function downloadConfig() {

    var data = collectFormData();

    var blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: 'application/json' }
    );

    var a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(a.href);
}

/* ---------------- INIT ---------------- */

function init() {
    loadConfig().then(function () {

        if (isLoggedIn()) {
            showPanel();
            return;
        }

        var loginScreen = document.getElementById('login-screen');
        if(loginScreen) loginScreen.style.display = 'flex';
        var form = document.getElementById('login-form');
        if(!form) return;

        form.onsubmit = function (e) {
            e.preventDefault();

            var pwdEl = document.getElementById('admin-password');
            var pwd = pwdEl ? pwdEl.value : '';
            var errEl = document.getElementById('login-error');
            var expected = getAdminPassword();
            if (pwd === expected) {
                setLoggedIn(true);
                if(errEl) errEl.style.display = 'none';
                try { showPanel(); } catch (err) { if (errEl) {errEl.textContent = 'Error Loading panel.'; errEl.style.display = 'block'; } }


            } else {

                if(errEl) { errEl.style.display = 'block'; errEl.textContent = 'Wrong password.'; }
            }
        };
    }).catch(function () {
        var loginScreen = document.getElementById('login-screen');
        if(loginScreen) = loginScreen.style.display = 'flex';
    });

    var btnSave = document.getElementById('btn-save');
    if(btnSave) btnSave.onclick = saveConfig;

    var btnDownload = document.getElementById('btn-download');
    if(btnDownload) btnDownload.onclick = downloadConfig;
    var btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.onclick = function () {
        setLoggedIn(false);
        var ap = document.getElementById('admin-panel');
        if(ap) ap.style.display = 'none';
        var ls = document.getElementById('login-screen');
        if(ls) ls.style.display = 'flex';
        var pw = document.getElementById('admin-password');
        if(pw) pw.value = '';
        var err = document.getElementById('login-error');
        if(err) err.style.display = 'none';
    };
    var btnAddDoctor = document.getElementById('btn-add-doctor');
    if(btnAddDoctor) btnAddDoctor.onclick = function () {
    addBlock('doctors-list', { id: String(Date.now()), name: '', role: '', experience: '', bio: '', image: ''}, ['id', 'name', 'role', 'experience', 'bio', 'image'], renderDoctors);
    };
    var btnAddPhysio = document.getElementById('btn-add-physio');
    if(btnAddPhysio) btnAddPhysio.onclick = function () {
    addBlock('physio-list', { title: '', description: '', link: '#' }, ['title', 'description', 'link'], function (el, arr) { renderService(el, arr, ['title', 'description', 'link']); });
    };
    var btnAddChiro = document.getElementById('btn-add-chiro');
    if(btnAddChiro) btnAddChiro.onclick = function () {
    addBlock('chiro-list', { title: '', description: '', link: '#' }, ['title', 'description', 'link'], function (el, arr) { renderService(el, arr, ['title', 'description', 'link']); });
    };
    var btnAddEquipment = document.getElementById('btn-add-equipment');
    if(btnAddEquipment) btnAddEquipment.onclick = function () {
    addBlock('equipment-list', { title: '', description: '', image: ''}, ['title', 'description', 'image'], renderEquipment);
    };
    var btnAddReview = document.getElementById('btn-add-review');
    if(btnAddReview) btnAddReview.onclick = function () {
    addBlock('reviews-list', { author: '', rating: 5, text: '', source: 'Google Review'}, ['author', 'rating', 'text', 'source'], renderReview);
    };
    var btnAddLocation = document.getElementById('btn-add-location');
    if(btnAddLocation) btnAddLocation.onclick = function () {
    addBlock('locations-list', { name: '', address: '', phone: '', hours: '', mapUrl: '', image: ''}, ['name', 'address', 'phone', 'hours', 'mapUrl', 'image'], renderLocations);
    };
    var btnAddGallery = document.getElementById('btn-add-gallery');
    if(btnAddGallery) btnAddGallery.onclick = function () {
    addBlock('gallery-list', { src: '', alt: ''}, ['src', 'alt'], renderGallery);
    };


}

function escapeAttr(s) {

    if (s == null) return "";

    return String(s)
        .replace(/&/g,'&amp;')
        .replace(/"/g,'&quot;')
        .replace(/</g,'&#39;');
        .replace(/</g,'&lt;');
        .replace(/</g,'&gt;');
}

function escapeHtml(s) {

    if (s == null) return "";

    var div = document.createElement('div');

    div.textContent = s;

    return div.innerHTML;
}

init();

})();