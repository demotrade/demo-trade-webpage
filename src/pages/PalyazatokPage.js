export function renderPalyazatokPage() {
  return `
    <div class="palyazatok-page-wrapper">
      <!-- HERO BANNER -->
      <header class="palyazatok-hero-banner">
        <div class="container">
          <div class="palyazatok-hero-content">
            <div class="palyazatok-hero-badge">
              <i class="fa-solid fa-award"></i> Támogatott Projektek
            </div>
            <h1 class="palyazatok-hero-title">Pályázatok</h1>
            <p class="palyazatok-hero-subtitle">
              A Demo-Trade Kft. európai uniós és hazai társfinanszírozású<br class="hero-sub-break" />agrár- és vidékfejlesztési projektjei.
            </p>
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <section class="palyazatok-main-section">
        <div class="container">

          <!-- PROJEKT KÁRTYA -->
          <article class="palyazat-card" id="palyazat-kap-rd60">
            <div class="palyazat-card-header">
              <h2 class="palyazat-title">
                Szakmai szaktanácsadás a Demo-Trade Kft. Területi<br />Szaktanácsadási Központban
              </h2>
            </div>

            <div class="palyazat-card-body">
              <!-- PROJEKT TÁBLA KÉP (Közvetlenül, tisztán elhelyezve) -->
              <div class="palyazat-board-display">
                <img 
                  src="/palyazatok/palyazati-tabla.png" 
                  alt="Szakmai szaktanácsadás a Demo-Trade Kft. Területi Szaktanácsadási Központban - KAP-RD60-2-24" 
                  class="board-main-image"
                  loading="lazy"
                />
              </div>

              <!-- PROJEKT FŐBB ADATAI -->
              <div class="palyazat-data-grid">
                <div class="data-item">
                  <span class="data-label"><i class="fa-solid fa-building"></i> Kedvezményezett neve:</span>
                  <strong class="data-value">DEMO-TRADE Kereskedelmi és Szolgáltató Kft.</strong>
                </div>

                <div class="data-item">
                  <span class="data-label"><i class="fa-solid fa-bullseye"></i> Pályázati felhívás:</span>
                  <strong class="data-value">Egyedi tudásátadási szolgáltatások támogatása</strong>
                </div>

                <div class="data-item">
                  <span class="data-label"><i class="fa-solid fa-file-contract"></i> Pályázati felhívás azonosítója:</span>
                  <strong class="data-value highlight-code">KAP-RD60-2-24</strong>
                </div>

                <div class="data-item">
                  <span class="data-label"><i class="fa-solid fa-barcode"></i> Projektazonosító:</span>
                  <strong class="data-value highlight-code">3999943774</strong>
                </div>

                <div class="data-item data-item-full grant-amount-box">
                  <div class="grant-amount-inner">
                    <span class="grant-amount-label">
                      <i class="fa-solid fa-coins"></i> Támogatási összeg:
                    </span>
                    <div class="grant-amount-value">
                      213,987 MILLIÓ FORINT
                    </div>
                  </div>
                </div>
              </div>

              <!-- SZÖVEGES RÉSZ (Szöveg helye, később ide jön a részletes leírás) -->
              <div class="palyazat-description-box">
                <h3 class="desc-heading"><i class="fa-solid fa-circle-info"></i> A projekt bemutatása</h3>
                <p class="desc-text">
                  A <strong>DEMO-TRADE Kft.</strong> akkreditált mezőgazdasági és vidékfejlesztési szaktanácsadási központként sikeres támogatást nyert az <em>„Egyedi tudásátadási szolgáltatások támogatása”</em> (KAP-RD60-2-24) című felhívás keretében a térségi gazdálkodók szakmai tudásátadásának és szaktanácsadásának biztosítására.
                </p>
                <div class="palyazat-note">
                  <i class="fa-solid fa-pen-nib"></i>
                  <span>A projekt részletes szöveges bemutatása hamarosan bővül.</span>
                </div>
              </div>

              <!-- ARCULATI ELEM (INFÓBLOKK) -->
              <div class="palyazat-branding-display">
                <img 
                  src="/palyazatok/infoblokk_HU_RGB_szines.png" 
                  alt="Európai Mezőgazdasági Vidékfejlesztési Alap és Magyarország Kormánya - Befektetés a jövőbe" 
                  class="branding-infoblokk-img"
                  loading="lazy"
                />
              </div>

            </div>
          </article>

          <!-- KAPCSOLATFELVÉTEL CTA -->
          <div class="palyazatok-cta-card">
            <div class="cta-content">
              <h3>Kérdése van pályázatokkal vagy szaktanácsadással kapcsolatban?</h3>
              <p>Vegye fel a kapcsolatot szakértő szaktanácsadóinkkal Nyíregyházán, Kisvárdán vagy Tarpán!</p>
            </div>
            <div class="cta-actions">
              <a href="/kapcsolat" data-page="contact" class="btn btn-primary">
                <i class="fa-solid fa-envelope"></i> Kapcsolat
              </a>
              <a href="tel:+36303462848" class="btn btn-outline-white">
                <i class="fa-solid fa-phone"></i> +36 30 346 2848
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  `;
}
