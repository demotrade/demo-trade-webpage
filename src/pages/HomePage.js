import { renderContactSection } from './ContactPage.js';

export function renderHomePage(posts) {

  const latestPosts = posts.slice(0, 3);
  
  const adminTasks = [
    "Egységes kérelmek beadása",
    "Gazdálkodási napló folyamatos vezetése és elektronikus benyújtása",
    "Nitrátjelentés készítése és elektronikus benyújtása",
    "Tápanyag-gazdálkodási terv készítése",
    "Agrárkárenyhítés kapcsán káresemények bejelentése és elszámolása",
    "Gázolaj jövedéki adó visszaigénylése",
    "Kamarai tagdíjbevallás",
    "Földhasználati terv készítése",
    "Monitoring adatszolgáltatás készítése",
    "Növényvédelmi biolabor üzemeltetése",
    "Meteorológiai állomások",
    "Növényvédelmi előrejelzés",
    "Hírlevelek heti rendszerességgel",
    "Pályázatok figyelése, pályázat készítése, menedzselése",
    "Permetezőgépek műszaki felülvizsgálata"
  ];

  return `
    <!-- HERO -->
    <section class="hero" id="hero-section">
      <div class="container">
        <div class="hero-inner">

          <!-- LEFT: text content, badge, buttons -->
          <div class="hero-left">
            <div class="hero-badge">
              <i class="fa-solid fa-award"></i> Akkreditált Szaktanácsadási Központ
            </div>
            <h1>SZAKÉRTELEM A <span>MEZŐGAZDASÁGBAN</span></h1>
            <p>Küldetésünk, hogy minél több termelőnek megkönnyítsük az agrár- és vidékfejlesztéshez kapcsolódó ügyintézését. Szakmai szaktanácsadási központként állunk a gazdálkodók szolgálatában.</p>
            
            <div class="hero-buttons">
              <button class="btn-hero-glass btn-hero-glass-primary" data-page="home" data-section="szolgaltatasok">
                SZOLGÁLTATÁSAINK
              </button>
              <button class="btn-hero-glass" data-page="home" data-section="rolunk">
                RÓLUNK
              </button>
            </div>
          </div>

          <!-- RIGHT: lap_logo.png in glass card -->
          <div class="hero-right">
            <div class="hero-logo-card">
              <img src="/images/lap_logo.png" alt="Demo-Trade Kft. – Szaktanácsadás" />
            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- RÓLUNK SECTION -->
    <section class="section about-section" id="rolunk">
      <div class="container">
        <div class="section-title reveal-on-scroll fade-in-up">
          <span class="subtitle">Demo-Trade Kft.</span>
          <h2>Rólunk</h2>
          <p class="hero-mission-lead">Küldetésünk, hogy minél több termelőnek megkönnyítsük az agrár- és vidékfejlesztéshez kapcsolódó ügyintézését.</p>
        </div>

        <div class="about-grid-container">
          <!-- BAL OLDALI DIV: Cégvezetés, Leírás, 15 elemű felsorolás -->
          <div class="about-col-left reveal-on-scroll slide-in-left">
            <div class="about-header-bar about-header-bar-centered">
              <h3 class="about-main-title">
                <span>Szakmai</span>
                <span>szaktanácsadási</span>
                <span>központ</span>
              </h3>
              <p class="about-sub-title">Akkreditált Uniós Szaktanácsadási Rendszer | Közel 15 év szakmai tapasztalat</p>
            </div>

            <div class="about-bio-box">
              <div class="about-bio-content">
                <h4>Cégvezetés & Szakmai Hátterünk</h4>
                <p>A Demo-Trade Kft. szaktanácsadási tevékenységét közel másfél évtizede, <strong>2007-ben kezdte</strong>. Cégünk vezetője <strong>Moravszki Gábor</strong>, mezőgazdasági szaktanácsadó, növényvédelmi szakmérnök.</p>
              </div>
            </div>

            <div class="about-text-body">
              <p>A Kft. működése kezdetekor, 2007-ben akkreditálta magát az uniós támogatásból működő szaktanácsadási rendszerbe, így kezdetben területi szaktanácsadási központként, majd <strong>2012 decemberétől szakmai szaktanácsadási központként</strong> áll a gazdálkodók szolgálatában.</p>
              
              <p class="about-list-intro">A technológiai és növényvédelmi tanácsadás mellett munkatársaink <strong>550 szerződött gazdálkodó</strong> adminisztratív kötelességeit látják el:</p>
            </div>

            <!-- GREEN CHECKMARK LIST (15 items) -->
            <div class="about-tasks-grid">
              ${adminTasks.map(task => `
                <div class="about-task-item">
                  <div class="task-check-icon">
                    <i class="fa-solid fa-circle-check"></i>
                  </div>
                  <span>${task}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- JOBB OLDALI DIV: Kép, Megyei lefedettség és Terjeszkedési szöveg -->
          <div class="about-col-right reveal-on-scroll slide-in-right">
            <!-- ABOUT IMAGE -->
            <div class="about-image-card">
              <div class="about-image-wrapper">
                <img src="/images/about.png" alt="Demo-Trade Kft. Szaktanácsadás" class="about-image" />
                <div class="about-image-badge">
                  <i class="fa-solid fa-seedling"></i>
                  <span>Agrár- és Vidékfejlesztés</span>
                </div>
              </div>
            </div>

            <!-- REGIONAL COVERAGE -->
            <div class="about-regional-box">
              <h4><i class="fa-solid fa-map-location-dot"></i> Napi szintű területi lefedettségünk</h4>
              <p>A központi iroda három megye gazdálkodóit segíti napi szinten:</p>

              <div class="counties-grid">
                <div class="county-card">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>Szabolcs-Szatmár-Bereg megye</span>
                </div>
                <div class="county-card">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>Hajdú-Bihar megye</span>
                </div>
                <div class="county-card">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>Borsod-Abaúj-Zemplén megye</span>
                </div>
              </div>
            </div>

            <!-- EXPANSION BANNER -->
            <div class="about-expansion-banner">
              <i class="fa-solid fa-chart-line"></i>
              <p>A cég folyamatosan terjeszkedik, hogy minél több termelőnek megkönnyítse az agrár- és vidékfejlesztéshez kapcsolódó ügyeit.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FULL-WIDTH PARALLAX SEPARATOR BANNER -->
    <section class="parallax-separator reveal-on-scroll fade-in-up" id="fruit-parallax">
      <div class="parallax-overlay"></div>
      <div class="container parallax-content">
        <div class="parallax-badge">
          <i class="fa-solid fa-users"></i> Demo-Trade Kft. Közösség
        </div>
        <h2>MÁR TÖBB MINT 550 GAZDÁLKODÓ CSATLAKOZOTT HOZZÁNK!</h2>
        <p class="parallax-subtext">A technológia és növényvédelmi tanácsadás mellett munkatársaink 550 szerződött gazdálkodó adminisztratív kötelességeit látják el.</p>
      </div>
    </section>

    <!-- SZOLGÁLTATÁSOK SECTION -->
    <section class="section services-section" id="szolgaltatasok" style="background: #f8fafc;">
      <div class="container">
        <div class="section-title reveal-on-scroll fade-in-up">
          <span class="subtitle">SZOLGÁLTATÁSOK</span>
          <h2>MIBEN SEGÍTHETÜNK NEKED?</h2>
          <p style="max-width: 800px; margin: 0 auto 1.5rem;">A mezőgazdaságban tevékenykedőket is számos adminisztrációs feladat terheli. Ezen terheken szeretnénk könnyíteni szolgáltatásainkkal. A szaktanácsadáson, a pályázatíráson túl célkitűzésünk az ezekben való segítségnyújtás.</p>
          
          <div style="margin-top: 1rem;">
            <button class="btn btn-primary" data-page="contact">
              <i class="fa-solid fa-envelope-open-text"></i> Vedd fel velünk a kapcsolatot a részletekért!
            </button>
          </div>
        </div>

        <div class="services-grid">
          <!-- CARD 1 -->
          <div class="service-card reveal-on-scroll slide-in-left" id="service-szaktanacsadas">
            <div class="service-card-header">
              <div class="service-icon-wrapper"><i class="fa-solid fa-wheat-awn"></i></div>
              <h3>Mezőgazdasági szaktanácsadás</h3>
            </div>
            <p>A gazdálkodást segítő információk átadásán túl számos szolgáltatással segítjük a gazdálkodókat.</p>
            <ul style="display: none;" aria-hidden="true">
              <li>Egységes kérelmek beadása</li>
              <li>Gazdálkodási napló folyamatos vezetése és elektronikus benyújtása (e-GN)</li>
              <li>Nitrátjelentés készítése és elektronikus benyújtása</li>
              <li>Tápanyag-gazdálkodási terv készítése</li>
              <li>Agrárkárenyhítés kapcsán káresemények bejelentése és elszámolása</li>
              <li>Gázolaj jövedéki adó visszaigénylés</li>
              <li>Kamarai tagdíjbevallás</li>
              <li>Földhasználati terv készítése</li>
              <li>Monitoring adatszolgáltatás készítése</li>
            </ul>

            <button class="btn btn-outline open-service-modal" data-service-idx="0" style="margin-top: auto; width: 100%;">
              <i class="fa-solid fa-circle-info"></i> Részletes feladatok
            </button>
          </div>

          <!-- CARD 2 -->
          <div class="service-card reveal-on-scroll slide-in-left" id="service-novenyvedelem">
            <div class="service-card-header">
              <div class="service-icon-wrapper"><i class="fa-solid fa-microscope"></i></div>
              <h3>Növényvédelmi tanácsadás</h3>
            </div>
            <p>A növényvédelmi biolabor üzemeltetése, meteorológiai állomások, növényvédelmi előrejelzéseken túl heti hírlevéllel segítjük a munkát.</p>
            <ul style="display: none;" aria-hidden="true">
              <li>Növényvédelmi biolabor üzemeltetése</li>
              <li>Meteorológiai állomások adatai és elemzései</li>
              <li>Növényvédelmi előrejelzés</li>
              <li>Hírlevelek heti rendszerességgel</li>
            </ul>

            <button class="btn btn-outline open-service-modal" data-service-idx="1" style="margin-top: auto; width: 100%;">
              <i class="fa-solid fa-circle-info"></i> Részletes feladatok
            </button>
          </div>

          <!-- CARD 3 -->
          <div class="service-card reveal-on-scroll slide-in-right" id="service-palyazatok">
            <div class="service-card-header">
              <div class="service-icon-wrapper"><i class="fa-solid fa-hand-holding-dollar"></i></div>
              <h3>Mezőgazdasági jellegű pályázatok</h3>
            </div>
            <p>A pályázatok figyelése, pályázatok készítése és menedzselése is feladataink közé tartozik.</p>
            <ul style="display: none;" aria-hidden="true">
              <li>Fiatal gazda pályázatok</li>
              <li>Öntözési fejlesztési pályázatok</li>
              <li>Gépbeszerzéses és technológiai pályázatok</li>
            </ul>

            <button class="btn btn-outline open-service-modal" data-service-idx="2" style="margin-top: auto; width: 100%;">
              <i class="fa-solid fa-circle-info"></i> Elérhető pályázati típusok
            </button>
          </div>

          <!-- CARD 4 -->
          <div class="service-card reveal-on-scroll slide-in-right" id="service-permetezo">
            <div class="service-card-header">
              <div class="service-icon-wrapper"><i class="fa-solid fa-spray-can-sparkles"></i></div>
              <h3>Permetezőgépek műszaki felülvizsgálata</h3>
            </div>
            <p>Mobil vizsgaállomásunkkal a permetezőgépek időszakos műszaki felülvizsgálatában is ügyfeleink rendelkezésére állunk.</p>
            <ul style="display: none;" aria-hidden="true">
              <li>Mobil vizsgaállomás üzemeltetése helyszíni méréssel</li>
              <li>Az árutermelésben és szolgáltatásban használt permetezőgépek időszakos műszaki felülvizsgálata</li>
            </ul>

            <button class="btn btn-outline open-service-modal" data-service-idx="3" style="margin-top: auto; width: 100%;">
              <i class="fa-solid fa-circle-info"></i> Részletek a felülvizsgálatról
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- NEWSLETTER & BLOG PROMO SECTION (Directly below Szolgáltatások) -->
    <section class="section blog-promo-section reveal-on-scroll fade-in-up" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 4.5rem 0;">
      <div class="container">
        <div class="blog-promo-card">
          <div class="blog-promo-grid">
            <div class="blog-promo-content">
              <div class="promo-badge">
                <i class="fa-solid fa-bell"></i> Hírlevél & Információs Központ
              </div>
              <h2>Iratkozz fel hírlevelünkre és kísérd figyelemmel blogunkat, hogy ne maradj le a:</h2>
              
              <ul class="promo-check-list">
                <li><i class="fa-solid fa-circle-check"></i> hamarosan elérhető pályázatokról</li>
                <li><i class="fa-solid fa-circle-check"></i> jelenleg lehívható támogatásokról</li>
                <li><i class="fa-solid fa-circle-check"></i> adminisztrációs segítségekről</li>
                <li><i class="fa-solid fa-circle-check"></i> a szakterület legfrissebb híreiről, törvényi változásairól</li>
              </ul>

              <div style="margin-top: 2rem;">
                <button class="btn btn-primary" data-page="blog" style="font-size: 1.05rem; padding: 1rem 2.2rem;">
                  <i class="fa-solid fa-newspaper"></i> Irány a blog!
                </button>
              </div>
            </div>

            <div class="blog-promo-illustration">
              <div class="promo-stat-box">
                <i class="fa-solid fa-paper-plane promo-stat-icon"></i>
                <h3>Naprakész Agrár Hírek</h3>
                <p>Heti rendszerességű tájékoztatók és szakmai elemzések a gazdálkodók szolgálatában.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- SERVICE DETAILS GLASSMODAL -->
    <div class="service-modal-backdrop" id="service-modal-backdrop">
      <div class="service-modal-card" id="service-modal-card">
        <button class="service-modal-close" id="service-modal-close" aria-label="Bezárás">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="service-modal-header">
          <div class="service-modal-icon" id="modal-icon">
            <i class="fa-solid fa-wheat-awn"></i>
          </div>
          <div>
            <h3 id="modal-title">Mezőgazdasági szaktanácsadás</h3>
            <span class="modal-badge">Demo-Trade Kft. Szolgáltatások</span>
          </div>
        </div>

        <p class="service-modal-desc" id="modal-desc">
          A gazdálkodást segítő információk átadásán túl számos szolgáltatással segítjük a gazdálkodókat.
        </p>

        <div class="service-modal-scroll-area">
          <div class="service-modal-body">
            <h4 id="modal-list-title">Részletes feladatok & ügyintézések:</h4>
            <ul class="service-modal-list" id="modal-list">
              <!-- Dynamically populated -->
            </ul>
          </div>
        </div>

        <div class="service-modal-footer">
          <button class="btn btn-primary" id="modal-contact-btn">
            <i class="fa-solid fa-envelope"></i> Kapcsolatfelvétel & Ajánlatkérés <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>


    <!-- CONTACT SECTION (At the bottom of Homepage) -->
    ${renderContactSection()}
  `;
}





