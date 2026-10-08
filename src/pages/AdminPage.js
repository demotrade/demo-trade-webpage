export function renderAdminPage(posts, isLoggedIn, editingPostId = null, activeFilter = 'all') {
  if (!isLoggedIn) {
    return `
      <div class="container" style="padding-top: 5rem; padding-bottom: 6rem; max-width: 480px;">
        <div class="admin-card" style="text-align: center; padding: 3rem 2rem;">
          <div style="width: 70px; height: 70px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Admin Belépés</h2>
          <p style="color: var(--gray-600); font-size: 0.95rem; margin-bottom: 2rem;">Kérjük adja meg az adminisztrátori jelszót a szerkesztő eléréséhez!</p>

          <form id="admin-login-form">
            <div class="form-group" style="text-align: left;">
              <label for="admin-password">Jelszó</label>
              <input type="password" id="admin-password" class="form-control" placeholder="Adja meg a jelszót..." required autofocus />
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
  const currentType = editingPost ? (editingPost.type || 'blog') : 'blog';

  const blogCount = posts.filter(p => !p.type || p.type === 'blog').length;
  const careerCount = posts.filter(p => p.type === 'career').length;
  const productCount = posts.filter(p => p.type === 'product').length;

  return `
    <div class="container" style="padding-top: 3rem; padding-bottom: 5rem; max-width: 1240px;">
      <!-- ADMIN HEADER BAR -->
      <div class="admin-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; background: var(--dark); color: #fff; padding: 1.8rem 2.2rem; border-radius: var(--radius-lg);">
        <div>
          <h1 style="color: #fff; font-size: 1.8rem; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-sliders" style="color: #5ce685;"></i> DEMO-TRADE TARTALOMKEZELŐ PANEL
          </h1>
          <p style="color: var(--gray-300); font-size: 0.95rem;">
            Itt hozhat létre és szerkeszthet Blog cikkeket, Álláshirdetéseket (Karrier), valamint Termékeket (pl. Gyümölcsfa oltványok).
          </p>
        </div>
        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <a href="/" target="_blank" class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.4); text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;" title="Weboldal megtekintése új böngészőlapon">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Weboldal Megtekintése
          </a>
          <button class="btn btn-secondary" id="reset-posts-btn" title="Alapértelmezett cikkek és termékek visszaállítása">
            <i class="fa-solid fa-rotate-left"></i> Alapállapot
          </button>
          <button class="btn btn-outline" id="admin-logout-btn" style="color: white; border-color: rgba(255,255,255,0.4);">
            <i class="fa-solid fa-right-from-bracket"></i> Kijelentkezés
          </button>
        </div>
      </div>

      <!-- FORM CARD -->
      <div class="admin-card" style="margin-bottom: 3rem; padding: 2.5rem;">
        <h3 style="font-size: 1.5rem; margin-bottom: 1.8rem; display: flex; align-items: center; gap: 0.6rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.8rem;">
          <i class="fa-solid ${editingPost ? 'fa-pen-to-square' : 'fa-circle-plus'}" style="color: var(--primary);"></i>
          ${editingPost ? 'Tartalom Módosítása' : 'Új Tartalom Létrehozása'}
        </h3>

        <form id="admin-post-form">
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
              <input type="text" id="post-category" class="form-control" list="category-datalist" placeholder="Válasszon vagy írjon be..." value="${editingPost ? editingPost.category : (currentType === 'career' ? 'Szaktanácsadás' : (currentType === 'product' ? 'Gyümölcsfa oltványok' : 'Híreink'))}" required />
              <datalist id="category-datalist">
                <!-- Dynamically populated or rich options -->
                <option value="Híreink">
                <option value="Pályázatok">
                <option value="Műszaki felülvizsgálat">
                <option value="Szaktanácsadás">
                <option value="Növényvédelem">
                <option value="Gyümölcsfa oltványok">
                <option value="Alma oltványok">
                <option value="Csonthéjasok">
                <option value="Növénykondicionálók">
                <option value="Álláslehetőség">
                <option value="Adminisztráció">
              </datalist>
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
          </div>

          <!-- 2. PRODUCT SPECIFIC FIELDS -->
          <div id="product-extra-fields" style="display: ${currentType === 'product' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; background: var(--gray-50); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--gray-200);">
            <div class="form-group" style="margin: 0;">
              <label for="prod-price" style="font-weight: 700;"><i class="fa-solid fa-tag" style="color: var(--accent);"></i> Ár / Érdeklődés Jelleg</label>
              <input type="text" id="prod-price" class="form-control" placeholder="Pl. Egyedi árajánlat / Mennyiségi kedvezmény" value="${editingPost && editingPost.price ? editingPost.price : 'Egyedi árajánlat alapján'}" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label for="prod-badge" style="font-weight: 700;"><i class="fa-solid fa-certificate" style="color: var(--accent);"></i> Kiemelő Címke (Badge)</label>
              <input type="text" id="prod-badge" class="form-control" placeholder="Pl. Minősített I. Osztály, Raktáron..." value="${editingPost && editingPost.badge ? editingPost.badge : 'Minősített Szaporítóanyag'}" />
            </div>
          </div>

          <!-- COVER IMAGE UPLOAD BOX -->
          <div style="background: var(--gray-100); border: 2px dashed var(--gray-300); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
            <div style="font-weight: 700; color: var(--dark); font-size: 1.05rem; margin-bottom: 0.4rem;">
              <i class="fa-solid fa-cloud-arrow-up" style="color: var(--primary); font-size: 1.6rem; display: block; margin: 0 auto 0.4rem;"></i>
              Borítókép (Feltöltés a számítógépről vagy URL)
            </div>
            <p style="color: var(--gray-600); font-size: 0.88rem; margin-bottom: 1rem;">
              Töltsön fel képet a számítógépről, vagy válasszon meglévő URL-t!
            </p>
            
            <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; flex-wrap: wrap;">
              <input type="file" id="post-image-file" class="form-control" accept="image/*" style="max-width: 320px; background: #ffffff;" />
              <span style="color: var(--gray-500); font-weight: 700;">VAGY URL:</span>
              <input type="text" id="post-image" class="form-control" placeholder="/images/gyumolcsfa_oltvanyok.jpg vagy https://..." value="${editingPost ? editingPost.image : '/images/gyumolcsfa_oltvanyok.jpg'}" style="max-width: 380px; background: #ffffff;" required />
            </div>

            <div id="post-image-preview-container" style="margin-top: 1.2rem; ${editingPost && editingPost.image ? '' : 'display: none;'}">
              <span style="font-size: 0.85rem; color: var(--gray-600); display: block; margin-bottom: 0.4rem; font-weight: 600;">Borítókép előnézete:</span>
              <img id="post-image-preview" src="${editingPost ? editingPost.image : ''}" style="max-height: 140px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); border: 2px solid #ffffff; object-fit: cover;" />
            </div>
          </div>

          <!-- EXCERPT -->
          <div class="form-group">
            <label for="post-excerpt" style="font-weight: 700;">Rövid Kivonat (1-2 mondat a kártyára) *</label>
            <textarea id="post-excerpt" class="form-control" style="min-height: 70px;" placeholder="Rövid ízelítő a lista nézethez..." required>${editingPost ? editingPost.excerpt : ''}</textarea>
          </div>

          <!-- VISUAL RICH TEXT EDITOR FOR CONTENT -->
          <div class="form-group">
            <label style="font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
              <span>Részletes Szöveg &amp; Leírás (Formázható Szövegszerkesztő) *</span>
              <span style="font-size: 0.8rem; font-weight: 400; color: var(--gray-500);">Kijelölve használja a formázó gombokat!</span>
            </label>

            <!-- HIDDEN FILE INPUT FOR INLINE EDITOR IMAGES -->
            <input type="file" id="editor-image-file-input" accept="image/*" style="display: none;" />

            <!-- WYSIWYG TOOLBAR -->
            <div class="editor-toolbar" style="background: var(--gray-100); border: 1px solid var(--gray-300); border-bottom: none; border-radius: var(--radius-md) var(--radius-md) 0 0; padding: 0.6rem 0.8rem; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
              <!-- HEADING & FORMAT SELECT -->
              <select id="editor-format-select" class="editor-select" title="Bekezdés stílus (Főcím / Alcím / Normál)" style="height: 32px; font-size: 0.85rem; border: 1px solid var(--gray-300); border-radius: 4px; padding: 0 6px; background: #fff; cursor: pointer;">
                <option value="p">Normál bekezdés</option>
                <option value="h2">Nagy Alcím (H2)</option>
                <option value="h3">Közepes Alcím (H3)</option>
                <option value="h4">Kis Alcím (H4)</option>
              </select>

              <!-- FONT SIZE SELECT -->
              <select id="editor-fontsize-select" class="editor-select" title="Betűméret beállítása" style="height: 32px; font-size: 0.85rem; border: 1px solid var(--gray-300); border-radius: 4px; padding: 0 6px; background: #fff; cursor: pointer;">
                <option value="">Betűméret</option>
                <option value="2">Kisebb (13px)</option>
                <option value="3">Normál (16px)</option>
                <option value="4">Közepes (18px)</option>
                <option value="5">Nagy (22px)</option>
                <option value="6">Kiemelt (28px)</option>
              </select>

              <div style="width: 1px; height: 22px; background: var(--gray-300); margin: 0 0.2rem;"></div>

              <!-- BASIC STYLING -->
              <button type="button" class="editor-btn" data-cmd="bold" title="Félkövér / Vastag (Ctrl+B)"><i class="fa-solid fa-bold"></i></button>
              <button type="button" class="editor-btn" data-cmd="italic" title="Dőlt (Ctrl+I)"><i class="fa-solid fa-italic"></i></button>
              <button type="button" class="editor-btn" data-cmd="underline" title="Aláhúzott (Ctrl+U)"><i class="fa-solid fa-underline"></i></button>
              <button type="button" class="editor-btn" data-cmd="strikeThrough" title="Áthúzott"><i class="fa-solid fa-strikethrough"></i></button>

              <div style="width: 1px; height: 22px; background: var(--gray-300); margin: 0 0.2rem;"></div>

              <!-- ALIGNMENT -->
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
              <button type="button" class="editor-btn" data-cmd="removeFormat" title="Formázás törlése"><i class="fa-solid fa-remove-format"></i></button>
            </div>

            <!-- EDITABLE WYSIWYG AREA -->
            <div id="post-content-editor" contenteditable="true" class="form-control" style="min-height: 280px; max-height: 550px; overflow-y: auto; background: #ffffff; border-radius: 0 0 var(--radius-md) var(--radius-md); padding: 1.2rem; line-height: 1.7;" placeholder="Írja vagy illessze ide a részletes leírást...">
              ${editingPost ? editingPost.content : ''}
            </div>

            <!-- HIDDEN TEXTAREA FOR FORM SUBMISSION -->
            <textarea id="post-content" style="display: none;">${editingPost ? editingPost.content : ''}</textarea>
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
