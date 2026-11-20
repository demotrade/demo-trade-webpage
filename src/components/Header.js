export function renderHeader(activePage, searchValue = '') {
  return `
    <div class="top-bar">
      <div class="container">
        <div class="top-bar-info">
          <a href="tel:+36303462848"><i class="fa-solid fa-phone"></i> 36 30 346 2848</a>
          <a href="mailto:demotradekft@gmail.com"><i class="fa-solid fa-envelope"></i> demotradekft@gmail.com</a>
          <span><i class="fa-solid fa-location-dot"></i> Szaktanácsadási Központ</span>
        </div>
        <div class="top-bar-badge">
          <i class="fa-solid fa-award"></i> Akkreditált Szaktanácsadó Szervezet
        </div>
      </div>
    </div>

    <nav class="navbar">
      <div class="container navbar-container">
        <div class="brand-group">
          <a href="#" class="brand-logo" id="logo-btn">
            <img src="/images/lap_logo.png" alt="Demo-Trade Kft. Logó" class="brand-logo-img" />
          </a>
          <a href="/palyazatok" data-page="palyazatok" class="brand-vte-link" title="Vidékfejlesztési Program / VTE">
            <img src="/images/vte-logo.png" alt="VTE Logó" class="brand-vte-img" />
          </a>
        </div>

        <!-- DESKTOP NAV MENU -->
        <ul class="nav-menu" id="nav-menu">
          <li class="nav-item">
            <button data-page="home" data-section="rolunk"><i class="fa-solid fa-users"></i> Rólunk</button>
          </li>
          <li class="nav-item">
            <button data-page="home" data-section="szolgaltatasok"><i class="fa-solid fa-gears"></i> Szolgáltatások</button>
          </li>
          <li class="nav-item ${activePage === 'products' ? 'active' : ''}">
            <button data-page="products"><i class="fa-solid fa-apple-whole"></i> Termékek</button>
          </li>
          <li class="nav-item ${activePage === 'career' ? 'active' : ''}">
            <button data-page="career"><i class="fa-solid fa-briefcase"></i> Karrier</button>
          </li>
          <li class="nav-item ${activePage === 'blog' ? 'active' : ''}">
            <button data-page="blog"><i class="fa-solid fa-newspaper"></i> Blog &amp; Hírek</button>
          </li>
          <li class="nav-item ${activePage === 'palyazatok' ? 'active' : ''}">
            <button data-page="palyazatok"><i class="fa-solid fa-file-invoice-dollar"></i> Pályázatok</button>
          </li>
          <li class="nav-item">
            <button data-page="home" data-section="kapcsolat"><i class="fa-solid fa-address-book"></i> Kapcsolat</button>
          </li>
        </ul>

        <!-- RIGHT ACTIONS: Search Icon Button + Hamburger Toggle (Side-by-side) -->
        <div class="nav-actions">
          <div class="nav-search-container" id="nav-search-container">
            <button class="nav-search-btn" id="nav-search-btn" aria-label="Kereső megnyitása" title="Keresés az oldalon">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
            
            <div class="nav-search-dropdown-box" id="nav-search-dropdown-box" style="display: none;">
              <div class="nav-search-inner">
                <i class="fa-solid fa-magnifying-glass search-inner-icon"></i>
                <input type="text" id="menu-search-input" placeholder="Keresés hírekben, szolgáltatásokban..." autocomplete="off" value="${searchValue}" />
                <button id="close-menu-search" class="close-search-btn" title="Kereső bezárása" aria-label="Bezárás">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div class="search-dropdown" id="search-dropdown" style="display: none;"></div>
            </div>
          </div>

          <button class="mobile-toggle" id="mobile-toggle" aria-label="Menü megnyitása">
            <svg class="mobile-toggle-notch" viewBox="0 0 160 38" preserveAspectRatio="none" aria-hidden="true">
              <path class="notch-fill" d="M 0,6 L 16,6 C 28,6 36,34 52,34 L 108,34 C 124,34 132,6 144,6 L 160,6 L 160,0 L 0,0 Z" />
              <path class="notch-stroke" d="M 0,6 L 16,6 C 28,6 36,34 52,34 L 108,34 C 124,34 132,6 144,6 L 160,6" fill="none" />
            </svg>
            <span class="mobile-toggle-content">
              <i class="fa-solid fa-bars" id="mobile-toggle-icon"></i>
              <span class="mobile-toggle-text">MENÜ</span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  `;
}
