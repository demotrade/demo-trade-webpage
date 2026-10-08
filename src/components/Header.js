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
        <a href="#" class="brand-logo" id="logo-btn">
          <img src="/images/lap_logo.png" alt="Demo-Trade Kft. Logó" class="brand-logo-img" />
        </a>

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
            <i class="fa-solid fa-bars" id="mobile-toggle-icon"></i>
          </button>
        </div>
      </div>
    </nav>
  `;
}
