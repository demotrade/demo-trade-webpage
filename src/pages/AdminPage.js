import { normalizeRichContentHtml } from '../utils/contentNormalizer.js';
import { INITIAL_STAFF, OFFICES_META } from '../data/initialStaff.js';
import { isJobActive } from '../utils/jobStatus.js';
import { getRememberedAdminEmail } from '../utils/adminAuth.js';

export const CATEGORY_OPTIONS_BY_TYPE = {
  blog: [
    'Híreink',
    'Növényvédelem',
    'Pályázatok',
    'Műszaki felülvizsgálat',
    'Szaktanácsadás',
    'alma',
    'fagy',
    'csonthéjasok',
    'Adminisztráció'
  ],
  career: [
    'Szaktanácsadás',
    'Agrármérnök',
    'Növényorvos',
    'Pályázatírás & Adminisztráció',
    'Álláslehetőség'
  ],
  product: [
    'Gyümölcsfa oltványok',
    'Alma oltványok',
    'Cseresznye oltványok',
    'Szilva oltványok',
    'Kajszi oltványok',
    'Meggy oltványok',
    'Csonthéjasok',
    'Növénykondicionálók'
  ]
};

export function renderPasswordEyeSvg(isVisible = false) {
  if (isVisible) {
    // Elegáns, kézzel rajzolt stílusú nyitott szem finom írisz-gyűrűvel és csillanással
    return `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2.2 12.3C4.3 7.7 7.8 5.2 12 5.2C16.2 5.2 19.7 7.7 21.8 12.3C19.7 16.6 16.2 18.8 12 18.8C7.8 18.8 4.3 16.6 2.2 12.3Z" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.2 7.4C3.9 8.4 2.9 9.7 2.2 11.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.55"/>
        <circle cx="12" cy="12" r="3.3" stroke="currentColor" stroke-width="1.65"/>
        <circle cx="13.1" cy="10.9" r="0.85" fill="currentColor"/>
      </svg>
    `;
  }
  // Elegáns, modern rajzolt lehunyt szem ívelt szempillákkal
  return `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2.5 10.6C4.7 14.3 8.1 16.2 12 16.2C15.9 16.2 19.3 14.3 21.5 10.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.4 13.7L3.7 16.3" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
      <path d="M9.6 15.8L8.8 18.9" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
      <path d="M14.4 15.8L15.2 18.9" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
      <path d="M18.6 13.7L20.3 16.3" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
    </svg>
  `;
}

export function renderAdminPage(posts, isLoggedIn, editingPostId = null, activeFilter = 'all', staffList = INITIAL_STAFF, editingStaffId = null, adminTab = 'content', newType = null) {
  if (!isLoggedIn) {
    return `
      <div class="container" style="padding-top: 5rem; padding-bottom: 6rem; max-width: 480px;">
        <div class="admin-card" style="text-align: center; padding: 3rem 2rem;">
          <div style="width: 70px; height: 70px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Admin Belépés</h2>
          <p style="color: var(--gray-600); font-size: 0.95rem; margin-bottom: 2rem;">Kérjük, jelentkezzen be az e-mail címével és a jelszavával a szerkesztő eléréséhez!</p>

          <form id="admin-login-form" novalidate>
            <div class="form-group" style="text-align: left;">
              <label for="admin-email">E-mail cím</label>
              <input type="email" id="admin-email" class="form-control" placeholder="admin@demotradekft.hu" value="${String(getRememberedAdminEmail()).replace(/"/g, '&quot;').replace(/</g, '&lt;')}" autocomplete="username" required />
            </div>
            <div class="form-group" style="text-align: left;">
              <label for="admin-password">Jelszó</label>
              <div class="password-field-wrapper">
                <input type="password" id="admin-password" class="form-control" placeholder="Adja meg a jelszót..." autocomplete="current-password" required />
                <button type="button" class="password-eye-toggle" data-target-input="admin-password" aria-label="Jelszó megjelenítése vagy elrejtése" title="Jelszó megjelenítése / elrejtése">
                  ${renderPasswordEyeSvg(false)}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              <i class="fa-solid fa-right-to-bracket"></i> Belépés
            </button>
          </form>
        </div>
      </div>
    `;
  }

  const editingPost = editingPostId ? posts.find(p => p.id === editingPostId) : null;
  const currentType = editingPost ? (editingPost.type || 'blog') : (['blog', 'career', 'product'].includes(newType) ? newType : 'blog');
  const defaultCatForType = currentType === 'career' ? 'Szaktanácsadás' : (currentType === 'product' ? 'Gyümölcsfa oltványok' : 'Híreink');
  const currentCategory = editingPost && editingPost.category ? editingPost.category : defaultCatForType;
  const baseCategories = CATEGORY_OPTIONS_BY_TYPE[currentType] || CATEGORY_OPTIONS_BY_TYPE.blog;
  const categoryOptions = baseCategories.includes(currentCategory)
    ? baseCategories
    : [currentCategory, ...baseCategories];

  const blogCount = posts.filter(p => !p.type || p.type === 'blog').length;
  const careerCount = posts.filter(p => p.type === 'career').length;
  const productCount = posts.filter(p => p.type === 'product').length;
  const activeStaff = Array.isArray(staffList) && staffList.length > 0 ? staffList : INITIAL_STAFF;
  const editingStaff = editingStaffId ? activeStaff.find(s => s.id === editingStaffId) : null;

  return `
    <div class="container" style="padding-top: 3rem; padding-bottom: 5rem; max-width: 1240px;">
      <!-- ADMIN HEADER BAR -->
      <div class="admin-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; background: var(--dark); color: #fff; padding: 1.8rem 2.2rem; border-radius: var(--radius-lg);">
        <div>
          <h1 style="color: #fff; font-size: 1.8rem; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-sliders" style="color: #5ce685;"></i> DEMO-TRADE TARTALOMKEZELŐ PANEL
          </h1>
          <p style="color: var(--gray-300); font-size: 0.95rem;">
            Itt hozhat létre és szerkeszthet Blog cikkeket, Álláshirdetéseket, Termékeket, valamint a Munkatársak és Irodák elérhetőségeit.
          </p>
        </div>
        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <a href="/" target="_blank" class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.4); text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;" title="Weboldal megtekintése új böngészőlapon">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Weboldal Megtekintése
          </a>
          <button class="btn btn-outline" id="admin-logout-btn" style="color: white; border-color: rgba(255,255,255,0.4);">
            <i class="fa-solid fa-right-from-bracket"></i> Kijelentkezés
          </button>
        </div>
      </div>

      <!-- ADMIN TAB BAR: Tartalmak / Munkatársak -->
      <div class="admin-tabs" role="tablist" style="margin-bottom: 2rem;">
        <button type="button" role="tab" class="admin-tab-btn ${adminTab !== 'staff' ? 'active' : ''}" data-admin-tab="content" aria-selected="${adminTab !== 'staff'}">
          <i class="fa-solid fa-newspaper"></i> Tartalmak <span class="admin-tab-count">${posts.length}</span>
        </button>
        <button type="button" role="tab" class="admin-tab-btn ${adminTab === 'staff' ? 'active' : ''}" data-admin-tab="staff" aria-selected="${adminTab === 'staff'}">
          <i class="fa-solid fa-users-gear"></i> Munkatársak <span class="admin-tab-count">${activeStaff.length}</span>
        </button>
      </div>


      ${adminTab !== 'staff' ? `
      <!-- FORM CARD -->
      <div class="admin-card" style="margin-bottom: 3rem; padding: 2.5rem;">
        <h3 style="font-size: 1.5rem; margin-bottom: 1.8rem; display: flex; align-items: center; gap: 0.6rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.8rem;">
          <i class="fa-solid ${editingPost ? 'fa-pen-to-square' : 'fa-circle-plus'}" style="color: var(--primary);"></i>
          ${editingPost ? 'Tartalom Módosítása' : 'Új Tartalom Létrehozása'}
        </h3>

        <form id="admin-post-form" novalidate data-current-type="${currentType}">
          <input type="hidden" id="post-id" value="${editingPost ? editingPost.id : ''}" />

          <!-- STEP 1: CONTENT TYPE SELECTOR (PROMINENT TABS) -->
          <div style="margin-bottom: 1.8rem;">
            <label style="font-weight: 700; display: block; margin-bottom: 0.6rem; font-size: 1rem; color: var(--dark);">
              Tartalom Típusa <span style="color: var(--primary); font-size: 0.85rem; font-weight: normal;">(Válassza ki, hová kerüljön a bejegyzés!)</span> *
            </label>
            <div class="type-selector-group">
              <label class="type-pill ${currentType === 'blog' ? 'active' : ''}">
                <input type="radio" name="post-type" value="blog" ${currentType === 'blog' ? 'checked' : ''} style="display: none;" />
                <i class="fa-solid fa-newspaper"></i> Blog Cikk
              </label>

              <label class="type-pill ${currentType === 'career' ? 'active' : ''}">
                <input type="radio" name="post-type" value="career" ${currentType === 'career' ? 'checked' : ''} style="display: none;" />
                <i class="fa-solid fa-briefcase"></i> Álláshirdetés (Karrier)
              </label>

              <label class="type-pill ${currentType === 'product' ? 'active' : ''}">
                <input type="radio" name="post-type" value="product" ${currentType === 'product' ? 'checked' : ''} style="display: none;" />
                <i class="fa-solid fa-apple-whole"></i> Termékhirdetés (pl. Oltvány)
              </label>
            </div>
          </div>

          <!-- COMMON TITLE, CATEGORY, AUTHOR ROW -->
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;" class="admin-grid-3">
            <div class="form-group" style="margin: 0;">
              <label for="post-title" id="label-post-title" style="font-weight: 700;">
                ${currentType === 'career' ? 'Pozíció Megnevezése *' : (currentType === 'product' ? 'Termék / Oltvány Neve *' : 'Cikk Címe *')}
              </label>
              <input type="text" id="post-title" class="form-control" placeholder="${currentType === 'career' ? 'Pl. Mezőgazdasági Szaktanácsadó...' : (currentType === 'product' ? 'Pl. Jonagold Alma Oltvány (M9)...' : 'Pl. Növényvédelmi előrejelzés...')}" value="${editingPost ? editingPost.title : ''}" required />
            </div>

            <div class="form-group" style="margin: 0;">
              <label for="post-category" style="font-weight: 700;">Kategória *</label>
              <select id="post-category" class="form-control" style="cursor: pointer;" required>
                ${categoryOptions.map(cat => `
                  <option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>${cat}</option>
                `).join('')}
                <option value="__custom__">+ Egyéb (saját kategória megadása)...</option>
              </select>
              <input type="text" id="post-category-custom" class="form-control" placeholder="Írja be az egyedi kategóriát..." style="display: none; margin-top: 0.5rem;" />
            </div>

            <div class="form-group" style="margin: 0;">
              <label for="post-author" style="font-weight: 700;">Szerző / Kapcsolattartó *</label>
              <input type="text" id="post-author" class="form-control" placeholder="Moravszki Gábor" value="${editingPost ? editingPost.author : 'Moravszki Gábor'}" required />
            </div>
          </div>

          <!-- TYPE-SPECIFIC EXTRA FIELDS ROW -->
          <!-- 1. CAREER SPECIFIC FIELDS -->
          <div id="career-extra-fields" style="display: ${currentType === 'career' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; background: var(--gray-50); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--gray-200);">
            <div class="form-group" style="margin: 0;">
              <label for="job-location" style="font-weight: 700;"><i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> Munkavégzés Helye</label>
              <input type="text" id="job-location" class="form-control" placeholder="Pl. Nyíregyháza és Szabolcs megye" value="${editingPost && editingPost.location ? editingPost.location : 'Nyíregyháza és környéke'}" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label for="job-type-field" style="font-weight: 700;"><i class="fa-regular fa-clock" style="color: var(--primary);"></i> Munkaidő / Jelleg</label>
              <input type="text" id="job-type-field" class="form-control" placeholder="Pl. Teljes munkaidő (Főállás)" value="${editingPost && editingPost.jobType ? editingPost.jobType : 'Teljes munkaidő (Főállás)'}" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label for="job-deadline" style="font-weight: 700;"><i class="fa-regular fa-calendar-check" style="color: var(--primary);"></i> Határidő</label>
              <input type="text" id="job-deadline" class="form-control" placeholder="Pl. Folyamatos felvétel" value="${editingPost && editingPost.deadline ? editingPost.deadline : 'Folyamatos felvétel'}" />
            </div>
            <div class="form-group" style="margin: 0; grid-column: 1 / -1;">
              <label class="job-active-switch" for="job-active-checkbox" style="display: flex; align-items: center; gap: 0.7rem; cursor: pointer; background: #fff; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); padding: 0.85rem 1.1rem; margin: 0; font-weight: 700; color: var(--dark);">
                <input type="checkbox" id="job-active-checkbox" ${(!editingPost || isJobActive(editingPost)) ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary); cursor: pointer;" />
                <span>Aktív hirdetés &ndash; megjelenik a Karrier oldalon
                  <span style="display: block; font-weight: 500; font-size: 0.82rem; color: var(--gray-600); margin-top: 0.1rem;">Ha kikapcsolja, a hirdetés szövege megmarad, de az oldalon a „Jelenleg nincs szabad pozíciónk” felirat látszik. Később egy kattintással újra bekapcsolható.</span>
                </span>
              </label>
            </div>
          </div>

          <!-- 2. PRODUCT SPECIFIC FIELDS -->
          <div id="product-extra-fields" style="display: ${currentType === 'product' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; background: var(--gray-50); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--gray-200);">
            <div class="form-group" style="margin: 0;">
              <label for="prod-price" style="font-weight: 700;"><i class="fa-solid fa-tag" style="color: var(--accent);"></i> Ár (pl. 2.890 Ft / db)</label>
              <input type="text" id="prod-price" class="form-control" placeholder="Pl. 2.890 Ft / db vagy Egyedi árajánlat alapján" value="${editingPost && editingPost.price ? editingPost.price : 'Egyedi árajánlat alapján'}" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label for="prod-badge" style="font-weight: 700;"><i class="fa-solid fa-certificate" style="color: var(--accent);"></i> Kiemelő címke (a termékkártya sarkában jelenik meg)</label>
              <input type="text" id="prod-badge" class="form-control" placeholder="Pl. Minősített I. Osztály, Raktáron..." value="${editingPost && editingPost.badge ? editingPost.badge : 'Minősített Szaporítóanyag'}" />
            </div>
          </div>

          <!-- COVER IMAGE UPLOAD BOX (FILE ONLY, NO URL) -->
          <div style="background: var(--gray-100); border: 2px dashed var(--gray-300); border-radius: var(--radius-md); padding: 1.8rem; text-align: center; margin-bottom: 1.5rem;">
            <div style="font-weight: 700; color: var(--dark); font-size: 1.05rem; margin-bottom: 0.4rem;">
              <i class="fa-solid fa-cloud-arrow-up" style="color: var(--primary); font-size: 1.8rem; display: block; margin: 0 auto 0.5rem;"></i>
              Borítókép Feltöltése a Számítógépről
            </div>
            <p style="color: var(--gray-600); font-size: 0.88rem; margin-bottom: 1.2rem;">
              Válasszon ki egy képet a számítógépéről (JPG, PNG, WebP). A rendszer automatikusan optimalizálja.
            </p>
            
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.8rem;">
              <label for="post-image-file" class="btn btn-outline" style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.6rem; background: #fff;">
                <i class="fa-solid fa-folder-open" style="color: var(--primary);"></i> Fájl Kiválasztása...
              </label>
              <input type="file" id="post-image-file" accept="image/*" style="display: none;" />
              <input type="hidden" id="post-image" value="${editingPost ? editingPost.image : (currentType === 'product' ? '/images/gyumolcsfa_oltvanyok.jpg' : (currentType === 'career' ? '/images/karrier_csapat.jpg' : '/images/hero.png'))}" />
              <div id="post-image-filename" style="font-size: 0.85rem; color: var(--gray-600); font-weight: 500;">
                ${editingPost && editingPost.image ? 'Jelenlegi kép beállítva' : 'Nincs új fájl kiválasztva (alapértelmezett kép lesz használva, ha nem tölt fel újat)'}
              </div>
            </div>

            <div id="post-image-preview-container" style="margin-top: 1.2rem; ${editingPost && editingPost.image ? '' : 'display: none;'}">
              <span style="font-size: 0.85rem; color: var(--gray-600); display: block; margin-bottom: 0.4rem; font-weight: 600;">Kép előnézete:</span>
              <img id="post-image-preview" src="${editingPost ? editingPost.image : ''}" style="max-height: 160px; max-width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-md); border: 2px solid #ffffff; object-fit: contain; background: #fff;" />
            </div>
          </div>

          <!-- EXCERPT -->
          <div class="form-group">
            <label for="post-excerpt" style="font-weight: 700;">Rövid Kivonat (1-2 mondat a kártyára) *</label>
            <textarea id="post-excerpt" class="form-control" style="min-height: 70px;" placeholder="Rövid ízelítő a lista nézethez..." required>${editingPost ? editingPost.excerpt : ''}</textarea>
          </div>

          <!-- VISUAL RICH TEXT EDITOR FOR CONTENT -->
          <div class="form-group">
            <label style="font-weight: 700; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem;">
              <span>Részletes Szöveg &amp; Leírás (Formázható Szövegszerkesztő) *</span>
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--primary); background: var(--primary-light); padding: 0.2rem 0.65rem; border-radius: 999px;">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Alapértelmezett: Montserrat &bull; Sorkizárt &bull; Középre igazított táblázatok
              </span>
            </label>

            <!-- HIDDEN FILE INPUT FOR INLINE EDITOR IMAGES -->
            <input type="file" id="editor-image-file-input" accept="image/*" style="display: none;" />

            <!-- WYSIWYG TOOLBAR -->
            <div class="editor-toolbar" style="background: var(--gray-100); border: 1px solid var(--gray-300); border-bottom: none; border-radius: var(--radius-md) var(--radius-md) 0 0; padding: 0.6rem 0.8rem; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
              <!-- HEADING & FORMAT SELECT -->
              <select id="editor-format-select" class="editor-select" title="Bekezdés stílus (Főcím / Alcím / Normál)" style="height: 32px; font-size: 0.85rem; border: 1px solid var(--gray-300); border-radius: 4px; padding: 0 6px; background: #fff; cursor: pointer;">
                <option value="p">Normál bekezdés (Montserrat)</option>
                <option value="h2">Nagy Alcím (H2)</option>
                <option value="h3">Közepes Alcím (H3)</option>
                <option value="h4">Kis Alcím (H4)</option>
              </select>

              <div style="width: 1px; height: 22px; background: var(--gray-300); margin: 0 0.2rem;"></div>

              <!-- BASIC STYLING -->
              <button type="button" class="editor-btn" data-cmd="bold" title="Félkövér / Vastag (Ctrl+B)"><i class="fa-solid fa-bold"></i></button>
              <button type="button" class="editor-btn" data-cmd="italic" title="Dőlt (Ctrl+I)"><i class="fa-solid fa-italic"></i></button>
              <button type="button" class="editor-btn" data-cmd="underline" title="Aláhúzott (Ctrl+U)"><i class="fa-solid fa-underline"></i></button>
              <button type="button" class="editor-btn" data-cmd="strikeThrough" title="Áthúzott"><i class="fa-solid fa-strikethrough"></i></button>

              <div style="width: 1px; height: 22px; background: var(--gray-300); margin: 0 0.2rem;"></div>

              <!-- ALIGNMENT (including Justify / Sorkizárt) -->
              <button type="button" class="editor-btn" data-cmd="justifyFull" title="Sorkizárt igazítás (Alapértelmezett)"><i class="fa-solid fa-align-justify"></i></button>
              <button type="button" class="editor-btn" data-cmd="justifyLeft" title="Balra zárás"><i class="fa-solid fa-align-left"></i></button>
              <button type="button" class="editor-btn" data-cmd="justifyCenter" title="Középre zárás"><i class="fa-solid fa-align-center"></i></button>
              <button type="button" class="editor-btn" data-cmd="justifyRight" title="Jobbra zárás"><i class="fa-solid fa-align-right"></i></button>

              <div style="width: 1px; height: 22px; background: var(--gray-300); margin: 0 0.2rem;"></div>

              <!-- LISTS -->
              <button type="button" class="editor-btn" data-cmd="insertUnorderedList" title="Felsorolás (Pontok)"><i class="fa-solid fa-list-ul"></i></button>
              <button type="button" class="editor-btn" data-cmd="insertOrderedList" title="Számozott lista"><i class="fa-solid fa-list-ol"></i></button>

              <div style="width: 1px; height: 22px; background: var(--gray-300); margin: 0 0.2rem;"></div>

              <!-- COLORS -->
              <button type="button" class="editor-btn editor-color-btn" data-cmd="foreColor" data-val="#2d7d46" title="Zöld szövegszín (Demo-Trade)" style="color: #2d7d46; font-weight: bold;">
                <i class="fa-solid fa-font"></i> <span style="display:inline-block; width:8px; height:8px; background:#2d7d46; border-radius:50%;"></span>
              </button>
              <button type="button" class="editor-btn editor-color-btn" data-cmd="foreColor" data-val="#f27922" title="Narancs szövegszín (Kiemelés)" style="color: #f27922; font-weight: bold;">
                <i class="fa-solid fa-font"></i> <span style="display:inline-block; width:8px; height:8px; background:#f27922; border-radius:50%;"></span>
              </button>
              <button type="button" class="editor-btn editor-color-btn" data-cmd="foreColor" data-val="#1e293b" title="Alapértelmezett sötét szövegszín" style="color: #1e293b;">
                <i class="fa-solid fa-font"></i> <span style="display:inline-block; width:8px; height:8px; background:#1e293b; border-radius:50%;"></span>
              </button>
              <button type="button" class="editor-btn" data-cmd="hiliteColor" data-val="#fef08a" title="Sárga kiemelő marker"><i class="fa-solid fa-highlighter" style="color: #ca8a04;"></i></button>

              <div style="width: 1px; height: 22px; background: var(--gray-300); margin: 0 0.2rem;"></div>

              <!-- LINK & IMAGE UPLOAD & CLEAR -->
              <button type="button" class="editor-btn" data-cmd="createLink" title="Hivatkozás / Link beszúrása"><i class="fa-solid fa-link"></i> Link</button>
              <button type="button" class="editor-btn" id="editor-insert-img-btn" style="background: #e6f4ea; border-color: var(--primary); color: var(--primary); font-weight: 700;" title="Kép feltöltése a számítógépről"><i class="fa-solid fa-image"></i> + Kép feltöltése</button>
              <button type="button" class="editor-btn" id="editor-normalize-btn" title="Bemásolt szöveg és táblázat formázásának egységesítése (Montserrat + Sorkizárt)"><i class="fa-solid fa-wand-magic-sparkles"></i> Egységesítés</button>
              <button type="button" class="editor-btn" data-cmd="removeFormat" title="Kijelölt formázás törlése"><i class="fa-solid fa-remove-format"></i></button>
            </div>

            <!-- EDITABLE WYSIWYG AREA -->
            <div id="post-content-editor" contenteditable="true" class="form-control article-content" style="max-width: 100%; min-height: 280px; max-height: 550px; overflow-y: auto; background: #ffffff; border-radius: 0 0 var(--radius-md) var(--radius-md); padding: 1.4rem; font-family: var(--font-body); font-size: 1.05rem; line-height: 1.8; text-align: justify;" placeholder="Írja vagy illessze ide a részletes leírást...">
              ${editingPost ? normalizeRichContentHtml(editingPost.content) : ''}
            </div>

            <!-- HIDDEN TEXTAREA FOR FORM SUBMISSION -->
            <textarea id="post-content" style="display: none;">${editingPost ? normalizeRichContentHtml(editingPost.content) : ''}</textarea>
          </div>

          <!-- ========================================== -->
          <!-- FACEBOOK MEGOSZTÁS & OPTIMALIZÁLÁS SZEKCIÓ -->
          <!-- ========================================== -->
          <div class="admin-fb-section" style="margin-top: 2rem; background: #f0f4f9; border: 2px solid #cbd5e1; border-radius: var(--radius-lg); padding: 1.8rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.8rem;">
                <div style="width: 44px; height: 44px; background: #1877f2; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                  <i class="fa-brands fa-facebook-f"></i>
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 1.2rem; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
                    Facebook Posztolás &amp; Optimalizálás
                    <span style="font-size: 0.75rem; background: #e0e7ff; color: #3730a3; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600;">@demotradekft</span>
                  </h4>
                  <p style="margin: 0.2rem 0 0; font-size: 0.85rem; color: #64748b;">
                    Automatikus, méretre és figyelemfelkeltésre optimalizált bejegyzés a hivatalos Demo-Trade Kft. Facebook oldalra.
                  </p>
                </div>
              </div>

              <!-- FŐ KAPCSOLÓ (SWITCH) -->
              <label style="display: inline-flex; align-items: center; gap: 0.6rem; cursor: pointer; font-weight: 700; color: #1e293b; background: #fff; padding: 0.6rem 1.2rem; border-radius: 999px; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05); user-select: none;">
                <input type="checkbox" id="fb-publish-checkbox" style="width: 18px; height: 18px; accent-color: #1877f2; cursor: pointer;" />
                <span><i class="fa-brands fa-facebook" style="color: #1877f2;"></i> Közzététel a Facebook oldalon is</span>
              </label>
            </div>

            <!-- LENYÍLÓ FACEBOOK SZERKESZTŐ ÉS ÉLŐ ELŐNÉZET -->
            <div id="fb-options-panel" style="display: none;">
              <!-- FIGYELMEZTETÉS / TIPPEK AZ OPTIMÁLIS KÉPRE -->
              <div style="background: #eef2ff; border-left: 4px solid #4f46e5; padding: 0.8rem 1.2rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.85rem; color: #312e81; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem;">
                <div>
                  <strong><i class="fa-solid fa-wand-magic-sparkles"></i> Facebook képarány tipp:</strong> 
                  Az ideális Facebook kép mérete <strong>1200 x 630 px</strong> (fekvő) vagy <strong>1080 x 1080 px</strong> (négyzetes). A rendszer automatikusan a feltöltött főképből generálja a posztot.
                </div>
                <button type="button" id="fb-auto-generate-btn" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.35rem 0.8rem; background: #fff; border-color: #c7d2fe; color: #4338ca;">
                  <i class="fa-solid fa-arrows-rotate"></i> Szöveg újragenerálása űrlapból
                </button>
              </div>

              <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.8rem;" class="admin-grid-2">
                <!-- BAL OLDAL: SZERKESZTHETŐ FACEBOOK SZÖVEG -->
                <div>
                  <div class="form-group" style="margin-bottom: 1rem;">
                    <label for="fb-custom-message" style="font-weight: 700; color: #1e293b; display: flex; justify-content: space-between;">
                      <span>Facebook Poszt Szövege (Szerkeszthető)</span>
                      <span id="fb-char-counter" style="font-size: 0.8rem; font-weight: normal; color: #64748b;">0 karakter</span>
                    </label>
                    <textarea id="fb-custom-message" class="form-control" style="min-height: 190px; font-family: inherit; font-size: 0.92rem; line-height: 1.6; resize: vertical;" placeholder="A bejegyzés szövege a Facebook falra..."></textarea>
                    <small style="color: #64748b; font-size: 0.8rem; display: block; margin-top: 0.4rem;">
                      💡 A cím, ár és elérhetőségek alapján automatikusan összeállítottuk. Tetszés szerint bővítheti emojikkal vagy hashtagekkel!
                    </small>
                  </div>

                  <!-- KÖZVETLEN MEGOSZTÁS GOMB TARTALÉKNAK (Facebook Share Dialog) -->
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.9rem 1.1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                    <span style="font-size: 0.82rem; color: #475569;">
                      <i class="fa-solid fa-circle-info" style="color: #1877f2;"></i> Kézi megosztó ablak megnyitása:
                    </span>
                    <button type="button" id="fb-manual-share-btn" class="btn btn-outline" style="font-size: 0.82rem; padding: 0.4rem 0.9rem; border-color: #1877f2; color: #1877f2;">
                      <i class="fa-solid fa-arrow-up-right-from-square"></i> Kézi Megosztás Megnyitása
                    </button>
                  </div>
                </div>

                <!-- JOBB OLDAL: FACEBOOK HÍRFOLYAM ÉLŐ ELŐNÉZET KÁRTYA -->
                <div>
                  <label style="font-weight: 700; color: #1e293b; display: block; margin-bottom: 0.5rem;">
                    Élő Facebook Hírfolyam Előnézet
                  </label>
                  
                  <!-- MOCK FACEBOOK FEED CARD -->
                  <div class="fb-preview-mockup" style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 1px solid #dadde1; overflow: hidden; font-family: Helvetica, Arial, sans-serif;">
                    <!-- HEADER -->
                    <div style="padding: 12px 14px; display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="/images/hero.png" alt="Demo-Trade Kft." style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb;" />
                        <div>
                          <div style="font-weight: 700; font-size: 0.9rem; color: #050505; display: flex; align-items: center; gap: 4px;">
                            Demo-Trade Kft.
                            <i class="fa-solid fa-circle-check" style="color: #1877f2; font-size: 0.8rem;" title="Hivatalos Oldal"></i>
                          </div>
                          <div style="font-size: 0.75rem; color: #65676b; display: flex; align-items: center; gap: 4px;">
                            <span>Most</span> &bull; <i class="fa-solid fa-earth-americas" style="font-size: 0.7rem;"></i>
                          </div>
                        </div>
                      </div>
                      <div style="color: #65676b; font-size: 1.1rem; cursor: pointer;">
                        <i class="fa-solid fa-ellipsis"></i>
                      </div>
                    </div>

                    <!-- POST MESSAGE BODY IN MOCK -->
                    <div id="fb-preview-message-body" style="padding: 4px 14px 12px; font-size: 0.9rem; color: #050505; white-space: pre-line; word-break: break-word; line-height: 1.45;">
                      Új ajánlat a kínálatunkban!
                    </div>

                    <!-- POST IMAGE IN MOCK -->
                    <div style="background: #f0f2f5; position: relative; max-height: 250px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                      <img id="fb-preview-img" src="" alt="Facebook előnézet" style="width: 100%; height: 230px; object-fit: cover; display: block;" />
                    </div>

                    <!-- POST LINK FOOTER BAR -->
                    <div style="background: #f0f2f5; padding: 10px 14px; border-top: 1px solid #e4e6eb;">
                      <div style="font-size: 0.72rem; color: #65676b; text-transform: uppercase; letter-spacing: 0.5px;">demotradekft.hu</div>
                      <div id="fb-preview-link-title" style="font-weight: 700; font-size: 0.95rem; color: #050505; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                        Gép / Termék megnevezése
                      </div>
                      <div id="fb-preview-link-desc" style="font-size: 0.8rem; color: #65676b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">
                        Kattintson a weboldal megtekintéséhez
                      </div>
                    </div>

                    <!-- MOCK LIKES & COMMENTS BAR -->
                    <div style="padding: 10px 14px; border-top: 1px solid #e4e6eb; display: flex; justify-content: space-around; color: #65676b; font-size: 0.85rem; font-weight: 600;">
                      <div style="display: flex; align-items: center; gap: 6px;"><i class="fa-regular fa-thumbs-up"></i> Tetszik</div>
                      <div style="display: flex; align-items: center; gap: 6px;"><i class="fa-regular fa-comment"></i> Hozzászólás</div>
                      <div style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-share"></i> Megosztás</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTION BUTTONS: PREVIEW + SAVE + CANCEL -->
          <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; align-items: center;">
            <button type="submit" class="btn btn-primary" id="save-post-btn" style="padding: 0.9rem 2.2rem; font-size: 1rem;">
              <i class="fa-solid fa-floppy-disk"></i> ${editingPost ? 'Módosítások Mentése' : 'Végleges Közzététel'}
            </button>

            <!-- PROMINENT PREVIEW BUTTON (As requested: előkép/megtekintési lehetőség) -->
            <button type="button" class="btn btn-secondary" id="preview-post-btn" style="padding: 0.9rem 1.8rem; font-size: 1rem;">
              <i class="fa-solid fa-eye"></i> Előnézet Megtekintése
            </button>

            ${editingPost ? `
              <button type="button" class="btn btn-outline" id="cancel-edit-btn" style="padding: 0.9rem 1.8rem;">
                Mégse
              </button>
            ` : ''}
          </div>
        </form>
      </div>

      <!-- EXISTING CONTENT TABLE WITH TABS -->
      <div class="admin-card" style="padding: 2.2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <h3 style="font-size: 1.5rem; margin: 0;">
            <i class="fa-solid fa-list-check" style="color: var(--primary);"></i> Rendszerben lévő Tartalmak (${posts.length})
          </h3>

          <!-- FILTER TABS FOR TABLE -->
          <div class="admin-table-filter-pills">
            <button class="admin-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
              Összes (${posts.length})
            </button>
            <button class="admin-filter-pill ${activeFilter === 'blog' ? 'active' : ''}" data-filter="blog">
              <i class="fa-solid fa-newspaper"></i> Hírek (${blogCount})
            </button>
            <button class="admin-filter-pill ${activeFilter === 'career' ? 'active' : ''}" data-filter="career">
              <i class="fa-solid fa-briefcase"></i> Karrier (${careerCount})
            </button>
            <button class="admin-filter-pill ${activeFilter === 'product' ? 'active' : ''}" data-filter="product">
              <i class="fa-solid fa-apple-whole"></i> Termékek (${productCount})
            </button>
          </div>
        </div>

        <div class="admin-table-container" style="overflow-x: auto;">
          <table class="admin-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--gray-100); text-align: left;">
                <th style="padding: 0.8rem; border-bottom: 2px solid var(--gray-200);">Kép</th>
                <th style="padding: 0.8rem; border-bottom: 2px solid var(--gray-200);">Típus</th>
                <th style="padding: 0.8rem; border-bottom: 2px solid var(--gray-200);">Cím &amp; Kategória</th>
                <th style="padding: 0.8rem; border-bottom: 2px solid var(--gray-200);">Szerző &amp; Dátum</th>
                <th style="padding: 0.8rem; border-bottom: 2px solid var(--gray-200); text-align: right;">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const filteredPosts = posts.filter(p => {
                  if (activeFilter === 'all') return true;
                  if (activeFilter === 'blog') return !p.type || p.type === 'blog';
                  return p.type === activeFilter;
                });

                if (filteredPosts.length === 0) {
                  return `
                    <tr>
                      <td colspan="5" style="text-align: center; color: var(--gray-500); padding: 2.5rem;">
                        Ebben a kategóriában jelenleg nincs tartalom.
                      </td>
                    </tr>
                  `;
                }

                return filteredPosts.map(post => {
                  const type = post.type || 'blog';
                  let typeBadgeClass = 'badge-blog';
                  let typeLabel = 'Blog Cikk';
                  let typeIcon = 'fa-newspaper';

                  if (type === 'career') {
                    typeBadgeClass = 'badge-career';
                    typeLabel = 'Álláshirdetés';
                    typeIcon = 'fa-briefcase';
                  } else if (type === 'product') {
                    typeBadgeClass = 'badge-product';
                    typeLabel = 'Termék';
                    typeIcon = 'fa-apple-whole';
                  }

                  return `
                    <tr style="border-bottom: 1px solid var(--gray-200);">
                      <td style="width: 70px; padding: 0.8rem;">
                        <img src="${post.image || '/images/hero.png'}" alt="" style="width: 56px; height: 42px; object-fit: cover; border-radius: var(--radius-sm);" />
                      </td>
                      <td style="padding: 0.8rem; white-space: nowrap;">
                        <span class="admin-type-badge ${typeBadgeClass}">
                          <i class="fa-solid ${typeIcon}"></i> ${typeLabel}
                        </span>
                        ${type === 'career' ? (isJobActive(post) ? `
                          <div style="margin-top: 0.4rem;"><span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.74rem; font-weight: 700; color: #15803d; background: #dcfce7; padding: 0.15rem 0.6rem; border-radius: 999px;"><i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> Aktív (látható)</span></div>
                        ` : `
                          <div style="margin-top: 0.4rem;"><span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.74rem; font-weight: 700; color: #b45309; background: #fef3c7; padding: 0.15rem 0.6rem; border-radius: 999px;"><i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> Inaktív (rejtett)</span></div>
                        `) : ''}
                      </td>
                      <td style="padding: 0.8rem;">
                        <div style="font-weight: 700; color: var(--dark); font-size: 0.95rem;">${post.title}</div>
                        <span class="blog-category" style="font-size: 0.72rem; display: inline-block; margin-top: 0.2rem;">${post.category || 'Általános'}</span>
                      </td>
                      <td style="padding: 0.8rem; font-size: 0.85rem; white-space: nowrap;">
                        <div style="font-weight: 600;">${post.author || 'Demo-Trade Kft.'}</div>
                        <div style="color: var(--gray-500);">${post.date}</div>
                      </td>
                      <td style="text-align: right; padding: 0.8rem; white-space: nowrap;">
                        ${type === 'career' ? `
                          <button class="action-btn toggle-job-btn" data-id="${post.id}" style="margin-right: 0.4rem; padding: 0.4rem 0.8rem; font-size: 0.82rem; border-radius: 6px; font-weight: 700; ${isJobActive(post) ? 'background: #fef3c7; border: 1px solid #fcd34d; color: #92400e;' : 'background: #dcfce7; border: 1px solid #86efac; color: #166534;'}" title="${isJobActive(post) ? 'Hirdetés elrejtése az oldalról (a szöveg megmarad)' : 'Hirdetés újra megjelenítése az oldalon'}">
                            <i class="fa-solid ${isJobActive(post) ? 'fa-eye-slash' : 'fa-eye'}"></i> ${isJobActive(post) ? 'Inaktiválás' : 'Aktiválás'}
                          </button>
                        ` : ''}
                        <button class="action-btn preview-item-table-btn" data-id="${post.id}" style="margin-right: 0.4rem; padding: 0.4rem 0.7rem; font-size: 0.82rem; background: var(--gray-100); border: 1px solid var(--gray-300); border-radius: 6px;" title="Megtekintés">
                          <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="action-btn action-btn-edit edit-post-btn" data-id="${post.id}" style="margin-right: 0.4rem; padding: 0.4rem 0.8rem; font-size: 0.82rem;">
                          <i class="fa-solid fa-pen"></i> Szerkesztés
                        </button>
                        <button class="action-btn action-btn-delete delete-post-btn" data-id="${post.id}" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;">
                          <i class="fa-solid fa-trash"></i> Törlés
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('');
              })()}
            </tbody>
          </table>
        </div>
      </div>
      `: ''}

      ${adminTab === 'staff' ? `
      <!-- ========================================================= -->
      <!-- MUNKATÁRSAINK & IRODÁK KEZELÉSE SZEKCIÓ                   -->
      <!-- ========================================================= -->
      <div class="admin-card" id="admin-staff-section" style="margin-top: 3rem; padding: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 1rem; margin-bottom: 1.8rem;">
          <div>
            <h3 style="font-size: 1.5rem; margin: 0; display: flex; align-items: center; gap: 0.6rem;">
              <i class="fa-solid fa-users-gear" style="color: var(--primary);"></i>
              Munkatársaink &amp; Irodák Kezelése (${activeStaff.length} fő)
            </h3>
            <p style="color: var(--gray-600); font-size: 0.9rem; margin-top: 0.3rem; text-align: left !important;">
              Itt adhat hozzá új munkatársat, módosíthatja a meglévők nevét, beosztását, telefonszámát vagy irodai besorolását. A változások azonnal megjelennek a Főoldalon, a Kapcsolat oldalon és az Impresszumban is.
            </p>
          </div>
        </div>

        <!-- STAFF ADD / EDIT FORM -->
        <form id="admin-staff-form" novalidate style="background: var(--gray-50); border: 1.5px solid ${editingStaff ? 'var(--primary)' : 'var(--gray-200)'}; border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2.2rem;">
          <input type="hidden" id="staff-id" value="${editingStaff ? editingStaff.id : ''}" />
          <div style="font-weight: 800; color: var(--dark); font-size: 1.05rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid ${editingStaff ? 'fa-user-pen' : 'fa-user-plus'}" style="color: var(--primary);"></i>
            ${editingStaff ? `Munkatárs adatainak szerkesztése: ${editingStaff.name}` : 'Új munkatárs felvétele az irodához'}
          </div>

          <div style="display: grid; grid-template-columns: 1.1fr 1.2fr 1.3fr 1.1fr auto; gap: 1rem; align-items: end;" class="admin-staff-form-grid">
            <div class="form-group" style="margin: 0;">
              <label for="staff-office" style="font-weight: 700;">Iroda *</label>
              <select id="staff-office" class="form-control" style="cursor: pointer; background: #fff;" required>
                ${OFFICES_META.map(off => `
                  <option value="${off.id}" ${editingStaff && editingStaff.office === off.id ? 'selected' : ''}>
                    ${off.title} (${off.tag})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label for="staff-name" style="font-weight: 700;">Teljes Név *</label>
              <input type="text" id="staff-name" class="form-control" style="background: #fff;" placeholder="Pl. Kovács János" value="${editingStaff ? editingStaff.name : ''}" required />
            </div>

            <div class="form-group" style="margin: 0;">
              <label for="staff-role" style="font-weight: 700;">Beosztás / Feladatkör *</label>
              <input type="text" id="staff-role" class="form-control" style="background: #fff;" placeholder="Pl. szaktanácsadó, növényorvos" value="${editingStaff ? editingStaff.role : 'szaktanácsadó'}" required />
            </div>

            <div class="form-group" style="margin: 0;">
              <label for="staff-phone" style="font-weight: 700;">Telefonszám *</label>
              <input type="text" id="staff-phone" class="form-control" style="background: #fff;" placeholder="Pl. +36 30 123 4567" value="${editingStaff ? editingStaff.phone : '+36 30 '}" required />
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button type="submit" class="btn btn-primary" style="padding: 0.8rem 1.3rem; white-space: nowrap;">
                <i class="fa-solid ${editingStaff ? 'fa-floppy-disk' : 'fa-plus'}"></i>
                ${editingStaff ? 'Mentés' : 'Hozzáadás'}
              </button>
              ${editingStaff ? `
                <button type="button" class="btn btn-outline" id="cancel-staff-edit-btn" style="padding: 0.8rem 1rem; background: #fff;">
                  Mégse
                </button>
              ` : ''}
            </div>
          </div>
        </form>

        <!-- 3-COLUMN OFFICE STAFF CARDS OVERVIEW -->
        <div class="offices-grid" style="margin-top: 0;">
          ${OFFICES_META.map(office => {
            const members = activeStaff.filter(m => m.office === office.id);
            return `
              <div class="office-card" style="padding: 1.5rem; background: #f8fafc;">
                <div class="office-header" style="margin-bottom: 1rem; padding-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <h3 style="font-size: 1.1rem;">${office.title}</h3>
                    <span class="office-tag">${office.tag} &bull; ${members.length} fő</span>
                  </div>
                </div>

                <div class="staff-list" style="gap: 0.8rem;">
                  ${members.length === 0 ? `
                    <div style="text-align: center; color: var(--gray-500); font-size: 0.88rem; padding: 1.5rem 0.5rem; border: 1px dashed var(--gray-300); border-radius: 8px;">
                      Nincs munkatárs ebben az irodában.
                    </div>
                  ` : members.map((person, idx) => `
                    <div class="staff-card" style="background: #ffffff; padding: 0.9rem 1rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; ${editingStaffId === person.id ? 'border: 2px solid var(--primary); box-shadow: 0 0 0 3px var(--primary-glow);' : ''}">
                      <div class="staff-details" style="min-width: 0; flex: 1;">
                        <h4 style="font-size: 0.98rem;">${person.name}</h4>
                        <p class="staff-role" style="font-size: 0.82rem; margin-bottom: 0.25rem;">${person.role}</p>
                        <span class="staff-phone" style="font-size: 0.86rem;"><i class="fa-solid fa-phone"></i> ${person.phone}</span>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 0.35rem; flex-shrink: 0;">
                        <div style="display: flex; gap: 0.3rem; justify-content: flex-end;">
                          <button type="button" class="action-btn move-staff-btn" data-id="${person.id}" data-dir="up" ${idx === 0 ? 'disabled' : ''} style="padding: 0.28rem 0.5rem; font-size: 0.75rem; background: var(--gray-100); border: 1px solid var(--gray-300); border-radius: 5px; ${idx === 0 ? 'opacity: 0.35; cursor: default;' : ''}" title="Mozgatás feljebb">
                            <i class="fa-solid fa-arrow-up"></i>
                          </button>
                          <button type="button" class="action-btn move-staff-btn" data-id="${person.id}" data-dir="down" ${idx === members.length - 1 ? 'disabled' : ''} style="padding: 0.28rem 0.5rem; font-size: 0.75rem; background: var(--gray-100); border: 1px solid var(--gray-300); border-radius: 5px; ${idx === members.length - 1 ? 'opacity: 0.35; cursor: default;' : ''}" title="Mozgatás lejjebb">
                            <i class="fa-solid fa-arrow-down"></i>
                          </button>
                        </div>
                        <div style="display: flex; gap: 0.3rem; justify-content: flex-end;">
                          <button type="button" class="action-btn action-btn-edit edit-staff-btn" data-id="${person.id}" style="padding: 0.32rem 0.55rem; font-size: 0.78rem;" title="Munkatárs szerkesztése">
                            <i class="fa-solid fa-pen"></i>
                          </button>
                          <button type="button" class="action-btn action-btn-delete delete-staff-btn" data-id="${person.id}" style="padding: 0.32rem 0.55rem; font-size: 0.78rem;" title="Munkatárs törlése">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      `: ''}

      <!-- LIVE PREVIEW MODAL (Előkép / Megtekintési Lehetőség) -->
      <div class="product-modal-backdrop" id="admin-preview-modal" style="display: none;">
        <div class="product-modal-card" style="max-width: 900px;">
          <button class="service-modal-close" id="close-admin-preview-btn" aria-label="Előnézet bezárása">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div style="padding: 1.5rem 2rem 1rem; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem;">
            <div>
              <span class="admin-type-badge badge-blog" id="preview-modal-type-badge"><i class="fa-solid fa-eye"></i> ELŐNÉZET</span>
              <h2 id="preview-modal-title" style="font-size: 1.5rem; margin-top: 0.4rem; color: var(--dark);">Bejegyzés Előnézete</h2>
            </div>
            <div id="preview-modal-meta" style="color: var(--gray-500); font-size: 0.88rem;"></div>
          </div>

          <div class="product-modal-body-scroll" style="padding: 2rem;">
            <div id="preview-modal-custom-top" style="margin-bottom: 1.2rem;"></div>

            <div id="preview-modal-image-cont" style="text-align: center; margin-bottom: 1.5rem; background: #f8fafc; border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 0.6rem;">
              <img id="preview-modal-img" src="" alt="Előnézet kép" style="max-height: 260px; max-width: 100%; object-fit: contain; margin: 0 auto; display: block; border-radius: var(--radius-sm); box-shadow: var(--shadow-sm);" />
            </div>

            <div id="preview-modal-excerpt-box" style="background: var(--primary-light); padding: 1.2rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary); margin-bottom: 1.5rem; font-weight: 500;">
            </div>

            <div id="preview-modal-content-rich" class="article-content" style="line-height: 1.8;">
            </div>

            <div id="preview-modal-custom-bottom" style="margin-top: 2rem;"></div>
          </div>

          <div class="product-modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn btn-outline" id="dismiss-admin-preview-btn">
              <i class="fa-solid fa-pen"></i> Vissza a szerkesztéshez
            </button>
            <button type="button" class="btn btn-primary" id="publish-from-preview-btn">
              <i class="fa-solid fa-circle-check"></i> Előnézet rendben van, Közzététel!
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
