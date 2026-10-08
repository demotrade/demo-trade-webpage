export function renderProductsPage(posts, selectedCategory = 'all', searchTerm = '', activeProductId = null) {
  const allProducts = posts.filter(p => p.type === 'product');

  // Extract unique categories
  const categories = ['all', ...new Set(allProducts.map(p => p.category).filter(Boolean))];

  // Filtering
  let filtered = allProducts;
  if (selectedCategory && selectedCategory !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(term)) ||
      (p.content && p.content.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  }

  // Active product for detail modal if selected
  const activeProduct = activeProductId ? allProducts.find(p => p.id === activeProductId) : null;

  return `
    <div class="products-page-wrapper">
      <!-- HERO BANNER -->
      <header class="products-hero-banner">
        <div class="container">
          <div class="products-hero-content">
            <div class="products-hero-badge">
              <i class="fa-solid fa-apple-whole"></i> Mezőgazdasági Kínálatunk
            </div>
            <h1 class="products-hero-title">Gyümölcsfa Oltványok &amp; Termékek</h1>
            <p class="products-hero-subtitle" style="text-align: center;">
              Vírusmentes, prémium minőségű gyümölcsfa oltványok (alma, meggy, szilva, cseresznye), valamint professzionális növénykondicionálók közvetlenül a szaktanácsadói központból.
            </p>
          </div>

          <!-- CATEGORY FILTER BAR -->
          <div class="products-filter-container">
            <div class="product-pills-row">
              ${categories.map(cat => `
                <button class="product-category-pill ${cat === selectedCategory ? 'active' : ''}" data-prod-cat="${cat}">
                  ${cat === 'all' ? 'Összes Termék' : cat}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </header>

      <!-- PRODUCTS GRID SECTION -->
      <section class="products-grid-section">
        <div class="container">
          ${filtered.length === 0 ? `
            <div class="career-empty-card" style="padding: 4rem 2rem;">
              <div class="career-empty-icon">
                <i class="fa-solid fa-boxes-stacked"></i>
              </div>
              <h3>Nem található a keresésnek megfelelő termék</h3>
              <p>Próbáljon meg más kategóriát vagy keresőszót választani, vagy érdeklődjön közvetlenül telefonon!</p>
              <button class="btn btn-outline" id="reset-prod-filter-btn" style="margin-top: 1rem;">
                <i class="fa-solid fa-rotate-left"></i> Keresési szűrők törlése
              </button>
            </div>
          ` : `
            <div class="products-grid">
              ${filtered.map(product => `
                <div class="product-card" id="prod-${product.id}">
                  <div class="product-card-image-box">
                    <img src="${product.image || '/images/gyumolcsfa_oltvanyok.jpg'}" alt="${product.title}" class="product-card-img" />
                    <span class="product-badge-overlay">${product.badge || 'Prémium Minőség'}</span>
                    <span class="product-category-tag">${product.category || 'Termék'}</span>
                  </div>

                  <div class="product-card-body">
                    <h3 class="product-card-title">${product.title}</h3>
                    <p class="product-card-excerpt">${product.excerpt}</p>

                    <div class="product-price-row">
                      <span class="product-price-label">
                        <i class="fa-solid fa-tag"></i> ${product.price || 'Egyedi árajánlat alapján'}
                      </span>
                    </div>

                    <div class="product-card-footer">
                      <button class="btn btn-outline view-product-modal-btn" data-prod-id="${product.id}">
                        <i class="fa-solid fa-circle-info"></i> Részletek
                      </button>
                      <button class="btn btn-primary open-product-inquiry-btn" data-prod-id="${product.id}" data-prod-title="${product.title}">
                        <i class="fa-solid fa-paper-plane"></i> Érdeklődés
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </section>

      <!-- ADVISORY CONSULTATION BANNER -->
      <section class="product-advisory-section">
        <div class="container product-advisory-container">
          <div class="product-advisory-banner">
            <div class="advisory-banner-content">
              <span class="hero-badge" style="background: rgba(255,255,255,0.2);"><i class="fa-solid fa-user-tie"></i> Szakértői Támogatás</span>
              <h2>Szaktanácsadás &amp; Telepítési Tervezés</h2>
              <p>
                Nem csupán oltványt és szaporítóanyagot kínálunk: komplett talajvizsgálatot, tápanyag-gazdálkodási tervet, pályázati segítséget és növényvédelmi technológiát nyújtunk az ültetvény teljes élettartamára.
              </p>
              <div class="advisory-banner-actions">
                <a href="tel:+36303462848" class="btn btn-primary advisory-phone-btn" style="background: #ffffff; color: var(--primary); font-weight: 700;">
                  <i class="fa-solid fa-phone"></i> Hívjon most: 36 30 346 2848
                </a>
                <button class="btn btn-outline advisory-contact-btn" data-page="home" data-section="kapcsolat" style="color: #ffffff; border-color: rgba(255,255,255,0.5);">
                  Kapcsolatfelvétel az irodával
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PRODUCT DETAIL MODAL -->
      <div class="product-modal-backdrop" id="product-detail-modal" style="${activeProduct ? 'display: flex;' : 'display: none;'}">
        ${activeProduct ? `
          <div class="product-modal-card">
            <button class="service-modal-close" id="close-product-modal-btn" aria-label="Bezárás">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="product-modal-header">
              <span class="product-badge-overlay" style="position: static; margin-bottom: 0.5rem; display: inline-block;">${activeProduct.badge || 'Termék'}</span>
              <h2 style="font-size: 1.6rem; color: var(--dark);">${activeProduct.title}</h2>
              <div style="color: var(--gray-500); font-size: 0.9rem; margin-top: 0.3rem;">
                <span class="blog-category" style="margin-right: 0.8rem;">${activeProduct.category}</span>
                <i class="fa-solid fa-tag" style="color: var(--primary);"></i> ${activeProduct.price || 'Egyedi árajánlat'}
              </div>
            </div>

            <div class="product-modal-body-scroll">
              <div class="product-modal-image-cont">
                <img src="${activeProduct.image || '/images/gyumolcsfa_oltvanyok.jpg'}" alt="${activeProduct.title}" class="product-modal-img" />
              </div>

              <div class="product-modal-content-rich">
                ${activeProduct.content}
              </div>
            </div>

            <div class="product-modal-footer">
              <button class="btn btn-primary open-product-inquiry-btn" data-prod-id="${activeProduct.id}" data-prod-title="${activeProduct.title}" style="padding: 0.8rem 1.8rem;">
                <i class="fa-solid fa-envelope"></i> Ajánlatkérés a termékről
              </button>
              <button class="btn btn-outline" id="dismiss-product-modal-btn">
                Bezárás
              </button>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- PRODUCT QUICK INQUIRY MODAL -->
      <div class="product-modal-backdrop" id="product-inquiry-modal" style="display: none;">
        <div class="product-modal-card" style="max-width: 580px;">
          <button class="service-modal-close" id="close-inquiry-modal-btn" aria-label="Bezárás">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="product-modal-header">
            <div class="hero-badge" style="background: var(--primary-light); color: var(--primary); margin-bottom: 0.5rem;"><i class="fa-solid fa-paper-plane"></i> Ajánlatkérés</div>
            <h3 id="inquiry-modal-title" style="font-size: 1.4rem;">Termék Érdeklődés</h3>
            <p style="color: var(--gray-600); font-size: 0.9rem; margin-top: 0.3rem;">Adja meg elérhetőségeit és kérjen tájékoztatást a kívánt fajtáról vagy mennyiségről!</p>
          </div>

          <form id="product-inquiry-form" style="padding: 1.5rem 2rem 2rem;">
            <input type="hidden" id="inquiry-product-name" value="" />
            
            <div class="form-group">
              <label class="form-label">Az Ön Neve *</label>
              <input type="text" id="inquiry-name" class="form-control" placeholder="Pl. Nagy János" required />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">E-mail Cím *</label>
                <input type="email" id="inquiry-email" class="form-control" placeholder="nagy.janos@gmail.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">Telefonszám *</label>
                <input type="tel" id="inquiry-phone" class="form-control" placeholder="+36 30 123 4567" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Üzenet / Kívánt Mennyiség, Fajták *</label>
              <textarea id="inquiry-message" class="form-control" rows="3" placeholder="Pl. Szeretnék árajánlatot kérni 500 db Gala és 200 db Idared oltványra..." required></textarea>
            </div>

            <div class="form-group form-checkbox-group" style="margin-bottom: 1.5rem;">
              <label class="checkbox-container">
                <input type="checkbox" id="inquiry-privacy" required />
                <span class="checkmark"></span>
                <span class="checkbox-label-text" style="font-size: 0.85rem;">
                  Elfogadom az <a href="#" data-page="privacy" target="_blank" style="color: var(--primary); font-weight: 600; text-decoration: underline;">Adatkezelési Tájékoztatót</a>, és hozzájárulok a megadott adataim kezeléséhez. *
                </span>
              </label>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" id="cancel-inquiry-btn">Mégse</button>
              <button type="submit" class="btn btn-primary" id="inquiry-submit-btn">
                <i class="fa-solid fa-paper-plane"></i> Ajánlatkérés Küldése
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
