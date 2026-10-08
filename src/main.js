import './styles.css';
import { INITIAL_POSTS } from './data/initialPosts.js';
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderHomePage } from './pages/HomePage.js';
import { renderAboutPage } from './pages/AboutPage.js';
import { renderServicesPage } from './pages/ServicesPage.js';
import { renderBlogPage } from './pages/BlogPage.js';
import { renderContactPage } from './pages/ContactPage.js';
import { renderCareerPage } from './pages/CareerPage.js';
import { renderProductsPage } from './pages/ProductsPage.js';
import { renderAdminPage } from './pages/AdminPage.js';
import { renderImpresszumPage } from './pages/ImpresszumPage.js';
import { renderPrivacyPage } from './pages/PrivacyPage.js';
import { renderNotFoundPage } from './pages/NotFoundPage.js';
import { renderCookieBanner } from './components/CookieBanner.js';
import { supabase } from './utils/supabaseClient.js';

// --- STATE MANAGEMENT ---
let state = {
  activePage: 'home',
  posts: loadPosts(),
  activePostId: null,
  searchTerm: '',
  menuSearchTerm: '',
  selectedCategory: 'all',
  currentPage: 1,
  editingPostId: null,
  isLoggedIn: sessionStorage.getItem('demotrade_admin_logged_in') === 'true',
  productCategory: 'all',
  productSearch: '',
  activeProductId: null,
  adminTableFilter: 'all',
  selectedCvAttachment: null
};

const STAGING_DEV_PASSWORD = 'MoRa!b18jA';

function isStagingUnlocked() {
  return sessionStorage.getItem('demotrade_preview_unlocked') === 'true' || state.isLoggedIn;
}

// Background sync from Supabase Pro database
async function syncPostsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('web_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      state.posts = data;
      localStorage.setItem('demotrade_posts', JSON.stringify(data));
      render();
    }
  } catch (err) {
    console.warn('Supabase posts sync info (fallback to cache):', err);
  }
}

function loadPosts() {
  const saved = localStorage.getItem('demotrade_posts');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const todayDate = new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '');
      const careerItem = parsed.find(p => p.id === 'karrier-mezogazdasagi-szaktanacsado');
      if (careerItem && careerItem.date !== todayDate) {
        careerItem.date = todayDate;
        localStorage.setItem('demotrade_posts', JSON.stringify(parsed));
      }

      // Ensure initial career and fruit tree sapling product entries are present
      const hasCareer = parsed.some(p => p.id === 'karrier-mezogazdasagi-szaktanacsado');
      const hasNewSaplings = parsed.some(p => p.id === 'oltvany-gala-must-alma');
      if (!hasCareer || !hasNewSaplings) {
        const filtered = parsed.filter(p => 
          p.id !== 'karrier-szaktanacsado-novenyorvos' && 
          p.id !== 'karrier-mezogazdasagi-szaktanacsado' &&
          p.id !== 'termek-gyumolcsfa-oltvanyok' &&
          p.id !== 'termek-fagyvedelmi-kondicionalok'
        );
        const initialCareer = INITIAL_POSTS.filter(p => p.type === 'career');
        const initialProducts = INITIAL_POSTS.filter(p => p.type === 'product');
        const userProducts = filtered.filter(p => p.type === 'product' && !INITIAL_POSTS.some(ip => ip.id === p.id));
        const nonProductsNonCareer = filtered.filter(p => p.type !== 'product' && p.type !== 'career');
        const merged = [...initialCareer, ...initialProducts, ...userProducts, ...nonProductsNonCareer];
        localStorage.setItem('demotrade_posts', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch (e) {
      console.error('Error loading posts from localStorage:', e);
    }
  }
  localStorage.setItem('demotrade_posts', JSON.stringify(INITIAL_POSTS));
  return INITIAL_POSTS;
}

function savePosts(posts, postToSync = null) {
  state.posts = posts;
  localStorage.setItem('demotrade_posts', JSON.stringify(posts));

  // Sync with Supabase Pro Database if post provided
  if (postToSync) {
    supabase.from('web_posts').upsert({
      id: postToSync.id,
      type: postToSync.type || 'blog',
      title: postToSync.title,
      category: postToSync.category,
      author: postToSync.author,
      date: postToSync.date,
      image: postToSync.image,
      excerpt: postToSync.excerpt,
      content: postToSync.content,
      location: postToSync.location || null,
      jobType: postToSync.jobType || null,
      deadline: postToSync.deadline || null,
      price: postToSync.price || null,
      badge: postToSync.badge || null,
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('Supabase post upsert notice:', error.message);
    });
  }
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'triangle-exclamation'}"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// --- SEARCH INDEX DATA ---
function normalizeStr(str) {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const STATIC_SEARCH_ITEMS = [
  {
    id: 'rolunk',
    category: 'Rólunk',
    icon: 'fa-solid fa-users',
    title: 'Rólunk - Szakmai szaktanácsadási központ',
    text: 'Küldetésünk, hogy minél több termelőnek megkönnyítsük az agrár- és vidékfejlesztéshez kapcsolódó ügyintézését.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-bio',
    category: 'Rólunk',
    icon: 'fa-solid fa-user-tie',
    title: 'Moravszki Gábor - Cégvezető',
    text: 'Mezőgazdasági szaktanácsadó, növényvédelmi szakmérnök. Akkreditált uniós szaktanácsadó 2007 óta.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-megyek',
    category: 'Rólunk',
    icon: 'fa-solid fa-map-location-dot',
    title: 'Megyei lefedettség (Szabolcs, Hajdú, Borsod)',
    text: 'Szabolcs-Szatmár-Bereg megye, Hajdú-Bihar megye, Borsod-Abaúj-Zemplén megye gazdálkodóinak segítsége.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-egyseges-kerelem',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-file-signature',
    title: 'Egységes kérelmek beadása',
    text: 'Szerződött gazdálkodók egységes kérelmeinek benyújtása és adminisztratív kötelességei.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-gazdalkodasi-naplo',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-book-open',
    title: 'Gazdálkodási napló (e-GN) vezetése',
    text: 'Gazdálkodási napló folyamatos vezetése és elektronikus benyújtása.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-nitratjelentres',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-file-lines',
    title: 'Nitrátjelentés készítése',
    text: 'Nitrátjelentés készítése és elektronikus benyújtása a hatóságok felé.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-tapanyag',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-flask',
    title: 'Tápanyag-gazdálkodási terv készítése',
    text: 'Tápanyag-gazdálkodási terv készítése talajvizsgálati adatok alapján.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-agrkarenyhites',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-cloud-sun-rain',
    title: 'Agrárkárenyhítés & Káresemények bejelentése',
    text: 'Agrárkárenyhítés kapcsán káresemények bejelentése és elszámolása.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-gazolaj',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-gas-pump',
    title: 'Gázolaj jövedéki adó visszaigénylése',
    text: 'Mezőgazdasági gázolaj jövedéki adó visszaigénylésének teljes körű ügyintézése.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-kamarai-tagdij',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-building',
    title: 'Kamarai tagdíjbevallás',
    text: 'Nemzeti Agrárgazdasági Kamarai tagdíjbevallás elkészítése.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-foldhasznalat',
    category: 'Rólunk / Adminisztráció',
    icon: 'fa-solid fa-vector-square',
    title: 'Földhasználati terv készítése',
    text: 'Földhasználati terv és adatszolgáltatás készítése.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'rolunk-biolabor',
    category: 'Rólunk / Szolgáltatás',
    icon: 'fa-solid fa-microscope',
    title: 'Növényvédelmi biolabor üzemeltetése',
    text: 'Növényvédelmi biolaboratórium, növényegészségügy és előrejelzés.',
    targetPage: 'home',
    targetElementId: 'rolunk'
  },
  {
    id: 'szolgaltatasok-main',
    category: 'Szolgáltatások',
    icon: 'fa-solid fa-gears',
    title: 'Szolgáltatásaink főoldala',
    text: 'Mezőgazdasági szaktanácsadás, növényvédelem, pályázatok, permetezőgép felülvizsgálat.',
    targetPage: 'home',
    targetElementId: 'szolgaltatasok'
  },
  {
    id: 'service-szaktanacsadas',
    category: 'Szolgáltatás',
    icon: 'fa-solid fa-wheat-awn',
    title: 'Mezőgazdasági szaktanácsadás',
    text: 'Technológiai és gazdálkodási szaktanácsadás, e-GN, támogatások igénylése.',
    targetPage: 'home',
    targetElementId: 'service-szaktanacsadas'
  },
  {
    id: 'service-novenyvedelem',
    category: 'Szolgáltatás',
    icon: 'fa-solid fa-bug-slash',
    title: 'Növényvédelmi tanácsadás',
    text: 'Integrált növényvédelem, receptírás, biolabor, növényvédelmi előrejelzés.',
    targetPage: 'home',
    targetElementId: 'service-novenyvedelem'
  },
  {
    id: 'service-palyazatok',
    category: 'Szolgáltatás',
    icon: 'fa-solid fa-hand-holding-dollar',
    title: 'Mezőgazdasági jellegű pályázatok',
    text: 'Pályázatok figyelése, pályázat készítése, menedzselése, vidékfejlesztés.',
    targetPage: 'home',
    targetElementId: 'service-palyazatok'
  },
  {
    id: 'service-permetezo',
    category: 'Szolgáltatás',
    icon: 'fa-solid fa-spray-can',
    title: 'Permetezőgépek műszaki felülvizsgálata',
    text: 'Permetezőgépek kötelező időszaki műszaki felülvizsgálata és mérése.',
    targetPage: 'home',
    targetElementId: 'service-permetezo'
  },
  {
    id: 'contact-info',
    category: 'Kapcsolat',
    icon: 'fa-solid fa-address-book',
    title: 'Kapcsolatfelvétel & Elérhetőségek',
    text: 'Telefon: 36 30 346 2848 | Email: demotradekft@gmail.com | Nyitvatartás: H-P 08:00-16:30',
    targetPage: 'contact',
    targetElementId: 'kapcsolat'
  },
  {
    id: 'privacy-info',
    category: 'Jogi információk',
    icon: 'fa-solid fa-shield-halved',
    title: 'Adatkezelési Tájékoztató (GDPR)',
    text: 'A Demo-Trade Kft. adatkezelési szabályzata, cookie tájékoztató és letölthető hivatalos PDF dokumentum.',
    targetPage: 'privacy',
    targetElementId: null
  },
  {
    id: 'career-info',
    category: 'Karrier',
    icon: 'fa-solid fa-briefcase',
    title: 'Karrier - Álláslehetőségek & Jelentkezés',
    text: 'Csatlakozzon agrár szaktanácsadói és növényorvosi csapatunkhoz. Aktuális nyitott pozíciók és online önéletrajz beküldés.',
    targetPage: 'career',
    targetElementId: null
  },
  {
    id: 'products-info',
    category: 'Termékek',
    icon: 'fa-solid fa-apple-whole',
    title: 'Termékek - Gyümölcsfa Oltványok & Növénykondicionálók',
    text: 'Vírusmentes minősített alma, cseresznye, meggy és szilva oltványok, valamint professzionális növényvédelmi anyagok.',
    targetPage: 'products',
    targetElementId: null
  }
];

// --- RENDER APP ---
function render() {
  const app = document.getElementById('app');
  
  let mainContent = '';
  switch (state.activePage) {
    case 'home':
      mainContent = renderHomePage(state.posts.filter(p => !p.type || p.type === 'blog'));
      break;
    case 'about':
      // Rólunk is on homepage section
      state.activePage = 'home';
      mainContent = renderHomePage(state.posts.filter(p => !p.type || p.type === 'blog'));
      break;
    case 'services':
      // Szolgáltatások is on homepage section
      state.activePage = 'home';
      mainContent = renderHomePage(state.posts.filter(p => !p.type || p.type === 'blog'));
      break;
    case 'career':
    case 'karrier':
    case 'allas':
      mainContent = renderCareerPage(state.posts);
      break;
    case 'products':
    case 'termekek':
      mainContent = renderProductsPage(state.posts, state.productCategory, state.productSearch, state.activeProductId);
      break;
    case 'blog':
      mainContent = renderBlogPage(state.posts.filter(p => !p.type || p.type === 'blog'), state.activePostId, state.searchTerm, state.selectedCategory, state.currentPage);
      break;
    case 'contact':
      mainContent = renderContactPage();
      break;
    case 'impresszum':
      mainContent = renderImpresszumPage();
      break;
    case 'privacy':
    case 'adatkezeles':
      mainContent = renderPrivacyPage();
      break;
    case 'admin':
      mainContent = renderAdminPage(state.posts, state.isLoggedIn, state.editingPostId, state.adminTableFilter);
      break;
    case 'not-found':
      mainContent = renderNotFoundPage();
      break;
    default:
      mainContent = renderNotFoundPage();
  }

  const isGatedPage = ['career', 'karrier', 'allas', 'allashirdetes', 'products', 'termekek', 'oltvanyok'].includes(state.activePage);
  const stagingUnlocked = isStagingUnlocked();

  let stagingHtml = '';
  if (isGatedPage) {
    if (!stagingUnlocked) {
      document.body.style.overflow = 'hidden';
      stagingHtml = `
        <div class="staging-gate-overlay" id="staging-gate-overlay">
          <div class="staging-gate-card">
            <div class="staging-icon">
              <i class="fa-solid fa-person-digging"></i>
            </div>
            <div class="staging-badge">
              <i class="fa-solid fa-lock"></i> Előkészület alatt
            </div>
            <h2>Az oldal még kialakítás alatt van, nézzen vissza később!</h2>
            <p>
              Ezen a menüponton jelenleg a legfrissebb információk feltöltése és szakmai előkészítése zajlik. Hamarosan elérhetővé válik minden látogatónk számára!
            </p>

            <div style="display: flex; gap: 0.8rem; justify-content: center; margin-bottom: 1.5rem;">
              <button type="button" class="btn btn-primary" id="staging-back-home-btn">
                <i class="fa-solid fa-house"></i> Vissza a Főoldalra
              </button>
            </div>

            <div class="staging-dev-box">
              <div class="staging-dev-title">
                <i class="fa-solid fa-key"></i> Fejlesztői teszt hozzáférés
              </div>
              <form class="staging-form" id="staging-unlock-form">
                <input 
                  type="password" 
                  id="staging-password-input" 
                  class="form-control" 
                  placeholder="Fejlesztői jelszó..." 
                  autocomplete="current-password"
                  required 
                />
                <button type="submit" class="btn btn-outline" style="white-space: nowrap;">
                  <i class="fa-solid fa-unlock"></i> Feloldás
                </button>
              </form>
              <div id="staging-error-msg" style="display: none; color: #dc2626; font-size: 0.85rem; margin-top: 0.6rem; font-weight: 600;">
                <i class="fa-solid fa-circle-exclamation"></i> Helytelen fejlesztői jelszó! Próbálja újra.
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      document.body.style.overflow = '';
      stagingHtml = `
        <div class="dev-unlocked-floating-badge" id="dev-lock-again-btn" title="Kattintson ide a fejlesztői előnézet újrazárolásához">
          <i class="fa-solid fa-unlock-keyhole"></i> Fejlesztői előnézet aktív &bull; Zárolás
        </div>
      `;
    }
  } else {
    document.body.style.overflow = '';
  }

  app.innerHTML = `
    ${renderHeader(state.activePage, state.menuSearchTerm)}
    <main id="main-content">
      ${mainContent}
    </main>
    ${renderFooter()}
    ${renderCookieBanner()}
    ${stagingHtml}
  `;

  attachEventListeners();
  initScrollObserver();
  initParallaxScroll();
}


function initScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}


function executeTargetNavigation(targetPage, targetElementId) {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  state.menuSearchTerm = '';
  
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) searchInput.value = '';

  const targetElMissing = targetElementId ? !document.getElementById(targetElementId) : false;
  const needsRender = state.activePage !== targetPage || state.activePostId !== null || targetElMissing;

  setPageState(targetPage, null, true);

  if (needsRender) {
    render();
  }

  setTimeout(() => {
    if (targetElementId) {
      const el = document.getElementById(targetElementId);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });

        el.classList.remove('highlight-search-target');
        void el.offsetWidth;
        el.classList.add('highlight-search-target');
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 120);
}

const SERVICES_DATA = [
  {
    title: 'Mezőgazdasági szaktanácsadás',
    icon: 'fa-solid fa-wheat-awn',
    desc: 'A gazdálkodást segítő információk átadásán túl számos szolgáltatással segítjük a gazdálkodókat.',
    listTitle: 'Részletes feladatok & adminisztrációs kötelezettségek:',
    items: [
      'Egységes kérelmek beadása',
      'Gazdálkodási napló folyamatos vezetése és elektronikus benyújtása',
      'Nitrátjelentés készítése és elektronikus benyújtása',
      'Tápanyag-gazdálkodási terv készítése',
      'Agrárkárenyhítés kapcsán káresemények bejelentése és elszámolása',
      'Gázolaj jövedéki adó visszaigénylés',
      'Kamarai tagdíjbevallás',
      'Földhasználati terv készítése',
      'Monitoring adatszolgáltatás készítése',
      'Egyéb adatszolgáltatások'
    ]
  },
  {
    title: 'Növényvédelmi tanácsadás',
    icon: 'fa-solid fa-microscope',
    desc: 'A növényvédelmi biolabor üzemeltetése, meteorológiai állomások, növényvédelmi előrejelzéseken túl heti hírlevéllel segítjük a munkát.',
    listTitle: 'Növényvédelmi szolgáltatásaink:',
    items: [
      'Növényvédelmi biolabor üzemeltetése',
      'Meteorológiai állomások adatai és elemzései',
      'Növényvédelmi előrejelzés',
      'Hírlevelek heti rendszerességgel'
    ]
  },
  {
    title: 'Mezőgazdasági jellegű pályázatok',
    icon: 'fa-solid fa-hand-holding-dollar',
    desc: 'A pályázatok figyelése, pályázatok készítése és menedzselése is feladataink közé tartozik.',
    listTitle: 'Mezőgazdasági jellegű pályázatok típusai:',
    items: [
      'Fiatal gazda pályázatok',
      'Öntözési fejlesztési pályázatok',
      'Gépbeszerzéses és technológiai pályázatok stb.'
    ]
  },
  {
    title: 'Permetezőgépek műszaki felülvizsgálata',
    icon: 'fa-solid fa-spray-can-sparkles',
    desc: 'Mobil vizsgaállomásunkkal a permetezőgépek időszakos műszaki felülvizsgálatában is ügyfeleink rendelkezésére állunk.',
    listTitle: 'Felülvizsgálati szolgáltatásaink:',
    items: [
      'Mobil vizsgaállomás üzemeltetése helyszíni méréssel',
      'Az árutermelésben és szolgáltatásban használt permetezőgépek időszakos műszaki felülvizsgálata'
    ]
  }
];

function openServiceModal(data) {
  const backdrop = document.getElementById('service-modal-backdrop');
  const iconEl = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const listTitleEl = document.getElementById('modal-list-title');
  const listEl = document.getElementById('modal-list');

  if (!backdrop) return;

  if (iconEl) iconEl.innerHTML = `<i class="${data.icon}"></i>`;
  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.desc;
  if (listTitleEl) listTitleEl.textContent = data.listTitle;

  if (listEl) {
    listEl.innerHTML = data.items.map(item => `
      <li><i class="fa-solid fa-circle-check"></i> ${item}</li>
    `).join('');
  }

  backdrop.style.display = 'flex';
  void backdrop.offsetWidth;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Push history state so browser/mobile back button gracefully closes modal without 404
  window.history.pushState({ modalOpen: true, page: state.activePage, postId: state.activePostId }, '', window.location.href);
}

function closeServiceModal(triggerBack = false) {
  const backdrop = document.getElementById('service-modal-backdrop');
  if (backdrop && backdrop.classList.contains('open')) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      backdrop.style.display = 'none';
    }, 350);

    if (triggerBack && window.history.state && window.history.state.modalOpen) {
      window.history.back();
    }
  }
}

function initParallaxScroll() {
  const parallax = document.getElementById('fruit-parallax');
  if (!parallax) return;

  function onScroll() {
    const rect = parallax.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
      const centerPos = (rect.top + rect.height / 2) - (windowHeight / 2);
      const speed = 0.40;
      const yOffset = centerPos * speed;
      parallax.style.backgroundPositionY = `calc(50% + ${yOffset}px)`;
    }
  }

  if (window._parallaxHandler) {
    window.removeEventListener('scroll', window._parallaxHandler);
  }
  window._parallaxHandler = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setPageState(page, postId = null, push = true) {
  state.activePage = page;
  state.activePostId = postId;

  if (push) {
    let url = '/';
    if (page === 'blog' && postId) {
      url = `/#blog/${postId}`;
    } else if (page && page !== 'home') {
      url = `/#${page}`;
    }
    window.history.pushState({ page, postId }, '', url);
  }
}

function initHistoryState() {
  const hash = (window.location.hash || '').trim();
  const rawPathname = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').trim();

  // 1. Check Hash first if present and not just "#"
  if (hash && hash !== '#') {
    if (hash.startsWith('#blog/')) {
      const postId = hash.replace('#blog/', '').trim();
      const postExists = state.posts.some(p => p.id === postId);
      if (postExists) {
        state.activePage = 'blog';
        state.activePostId = postId;
      } else {
        state.activePage = 'blog';
        state.activePostId = null;
      }
      return;
    }

    const cleanHash = hash.replace('#', '').toLowerCase();
    const hashRouteMap = {
      '': 'home',
      'home': 'home',
      'about': 'home',
      'rolunk': 'home',
      'services': 'home',
      'szolgaltatasok': 'home',
      'career': 'career',
      'karrier': 'career',
      'allas': 'career',
      'allashirdetes': 'career',
      'products': 'products',
      'termekek': 'products',
      'oltvanyok': 'products',
      'blog': 'blog',
      'hirek': 'blog',
      'contact': 'contact',
      'kapcsolat': 'contact',
      'impresszum': 'impresszum',
      'privacy': 'privacy',
      'adatkezeles': 'privacy',
      'admin': 'admin'
    };

    if (hashRouteMap[cleanHash] !== undefined) {
      state.activePage = hashRouteMap[cleanHash];
      state.activePostId = null;
    } else {
      // Safe fallback for in-page anchors
      state.activePage = 'home';
      state.activePostId = null;
    }
    return;
  }

  // 2. If no hash, check Pathname (e.g. /rolunk, /blog, /nemletezo, /404)
  if (!rawPathname || rawPathname === 'index.html') {
    state.activePage = 'home';
    state.activePostId = null;
    return;
  }

  if (rawPathname.startsWith('blog/')) {
    const postId = rawPathname.replace('blog/', '').trim();
    const postExists = state.posts.some(p => p.id === postId);
    if (postExists) {
      state.activePage = 'blog';
      state.activePostId = postId;
    } else {
      state.activePage = 'blog';
      state.activePostId = null;
    }
    return;
  }

  const pathRouteMap = {
    'home': 'home',
    'about': 'home',
    'rolunk': 'home',
    'services': 'home',
    'szolgaltatasok': 'home',
    'career': 'career',
    'karrier': 'career',
    'allas': 'career',
    'allashirdetes': 'career',
    'products': 'products',
    'termekek': 'products',
    'oltvanyok': 'products',
    'blog': 'blog',
    'hirek': 'blog',
    'contact': 'contact',
    'kapcsolat': 'contact',
    'impresszum': 'impresszum',
    'privacy': 'privacy',
    'adatkezeles': 'privacy',
    'admin': 'admin'
  };

  const cleanPath = rawPathname.toLowerCase();
  if (pathRouteMap[cleanPath] !== undefined) {
    state.activePage = pathRouteMap[cleanPath];
    state.activePostId = null;
  } else {
    state.activePage = 'not-found';
    state.activePostId = null;
  }
}

window.addEventListener('popstate', (e) => {
  const backdrop = document.getElementById('service-modal-backdrop');
  if (backdrop && backdrop.classList.contains('open')) {
    closeServiceModal(false);
    return;
  }

  initHistoryState();
  render();
  window.scrollTo(0, 0);
});

window.addEventListener('hashchange', () => {
  initHistoryState();
  render();
  window.scrollTo(0, 0);
});

// --- EVENT BINDING ---
function attachEventListeners() {
  // Navigation buttons & links (including data-section)
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = el.getAttribute('data-page');
      const section = el.getAttribute('data-section');

      if (section && page === 'home') {
        executeTargetNavigation('home', section);
      } else {
        setPageState(page, null, true);
        render();
        window.scrollTo(0, 0);
      }
    });
  });

  // Open Service Modal
  document.querySelectorAll('.open-service-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-service-idx'), 10);
      const data = SERVICES_DATA[idx];
      if (data) {
        openServiceModal(data);
      }
    });
  });

  // Modal close events
  const modalCloseBtn = document.getElementById('service-modal-close');
  const modalBackdrop = document.getElementById('service-modal-backdrop');
  const modalContactBtn = document.getElementById('modal-contact-btn');

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => closeServiceModal(true));
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeServiceModal(true);
      }
    });
  }

  if (modalContactBtn) {
    modalContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeServiceModal(true);
      setTimeout(() => {
        setPageState('home', null, true);
        executeTargetNavigation('home', 'kapcsolat');
      }, 200);
    });
  }

  // Contact Form Submission Handler with Anti-bot Honeypot & GDPR verification
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('contact-submit-btn');
      const origBtnText = submitBtn ? submitBtn.innerHTML : 'Üzenet küldése';
      
      const name = document.getElementById('contact-name')?.value.trim();
      const email = document.getElementById('contact-email')?.value.trim();
      const phone = document.getElementById('contact-phone')?.value.trim();
      const subject = document.getElementById('contact-subject')?.value;
      const message = document.getElementById('contact-message')?.value.trim();
      const honeypot = document.getElementById('contact-hp-website')?.value.trim();
      const privacyConsent = document.getElementById('contact-privacy-consent')?.checked;
      const formRenderedTime = parseInt(document.getElementById('contact-form-rendered-time')?.value || '0', 10);

      // 1. Anti-bot honeypot check (hidden field only filled by spam bots)
      if (honeypot) {
        console.warn('Bot detected via honeypot field.');
        showToast('Köszönjük érdeklődését! Üzenetét sikeresen továbbítottuk e-mailben!');
        contactForm.reset();
        return;
      }

      // 2. Anti-bot submission speed check (must be at least 1.2 seconds)
      if (formRenderedTime && Date.now() - formRenderedTime < 1200) {
        console.warn('Submission too fast, suspected automated bot.');
        showToast('Kérjük, várjon egy pillanatot az elküldés előtt!', 'error');
        return;
      }

      // 3. GDPR Privacy policy acceptance check
      if (!privacyConsent) {
        showToast('Kérjük fogadja el az Adatkezelési tájékoztatót a továbbítás előtt!', 'error');
        return;
      }

      if (!name || !email || !message) {
        showToast('Kérjük töltse ki a kötelező mezőket!', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Küldés folyamatban...';
      }

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, phone, subject, message, honeypot, privacyConsent })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showToast(result.message || 'Köszönjük! Üzenetét sikeresen továbbítottuk e-mailben!');
          contactForm.reset();
        } else {
          showToast(result.message || 'Hiba történt az üzenet küldésekor.', 'error');
        }
      } catch (err) {
        console.error('Contact form submit error:', err);
        showToast('Köszönjük érdeklődését! Üzenetét mentettük.', 'success');
        contactForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnText;
        }
      }
    });
  }

  // --- COOKIE BANNER EVENT HANDLERS ---
  const cookieAcceptAllBtn = document.getElementById('cookie-accept-all-btn');
  if (cookieAcceptAllBtn) {
    cookieAcceptAllBtn.addEventListener('click', () => {
      localStorage.setItem('demotrade_cookie_consent', 'all');
      const banner = document.getElementById('cookie-banner');
      if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(30px)';
        banner.style.transition = 'all 0.3s ease';
        setTimeout(() => banner.remove(), 300);
      }
      showToast('Sütik és adatvédelmi beállítások elmentve!');
    });
  }

  const cookieEssentialBtn = document.getElementById('cookie-essential-btn');
  if (cookieEssentialBtn) {
    cookieEssentialBtn.addEventListener('click', () => {
      localStorage.setItem('demotrade_cookie_consent', 'essential');
      const banner = document.getElementById('cookie-banner');
      if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(30px)';
        banner.style.transition = 'all 0.3s ease';
        setTimeout(() => banner.remove(), 300);
      }
      showToast('Csak a működéshez elengedhetetlen sütik engedélyezve.');
    });
  }

  // Re-open cookie banner from footer
  const footerCookieBtn = document.getElementById('footer-cookie-btn');
  if (footerCookieBtn) {
    footerCookieBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('demotrade_cookie_consent');
      render();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeServiceModal();
    }
  });

  // Footer Admin Belépés button
  const footerAdminBtn = document.getElementById('footer-admin-btn');
  if (footerAdminBtn) {
    footerAdminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setPageState('admin', null, true);
      render();
      window.scrollTo(0, 0);
    });
  }


  // --- MENU LIVE SEARCH LOGIC ---
  const menuSearchInput = document.getElementById('menu-search-input');
  const searchDropdown = document.getElementById('search-dropdown');
  const navSearchBtn = document.getElementById('nav-search-btn');
  const searchDropdownBox = document.getElementById('nav-search-dropdown-box');
  const closeMenuSearchBtn = document.getElementById('close-menu-search');

  if (navSearchBtn && searchDropdownBox) {
    navSearchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = searchDropdownBox.style.display === 'block';
      if (isOpen) {
        searchDropdownBox.style.display = 'none';
        navSearchBtn.classList.remove('active');
      } else {
        searchDropdownBox.style.display = 'block';
        navSearchBtn.classList.add('active');
        setTimeout(() => {
          if (menuSearchInput) menuSearchInput.focus();
        }, 50);
      }
    });

    if (closeMenuSearchBtn) {
      closeMenuSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchDropdownBox.style.display = 'none';
        navSearchBtn.classList.remove('active');
        state.menuSearchTerm = '';
        if (menuSearchInput) menuSearchInput.value = '';
        if (searchDropdown) {
          searchDropdown.style.display = 'none';
          searchDropdown.innerHTML = '';
        }
      });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      const container = document.getElementById('nav-search-container');
      if (container && !container.contains(e.target)) {
        searchDropdownBox.style.display = 'none';
        navSearchBtn.classList.remove('active');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchDropdownBox) {
        searchDropdownBox.style.display = 'none';
        navSearchBtn.classList.remove('active');
      }
    });
  }

  if (menuSearchInput && searchDropdown) {
    const handleSearchInput = (val) => {
      state.menuSearchTerm = val;
      const normalizedQuery = normalizeStr(val.trim());

      if (!normalizedQuery) {
        searchDropdown.style.display = 'none';
        searchDropdown.innerHTML = '';
        return;
      }

      // 1. Search in static sections
      const matchedStatic = STATIC_SEARCH_ITEMS.filter(item => {
        return normalizeStr(item.title).includes(normalizedQuery) ||
               normalizeStr(item.text).includes(normalizedQuery) ||
               normalizeStr(item.category).includes(normalizedQuery);
      });

      // 2. Search in posts / career / products
      const matchedPosts = state.posts.filter(post => {
        return normalizeStr(post.title).includes(normalizedQuery) ||
               normalizeStr(post.excerpt).includes(normalizedQuery) ||
               normalizeStr(post.content).includes(normalizedQuery) ||
               normalizeStr(post.category).includes(normalizedQuery);
      }).map(post => {
        const type = post.type || 'blog';
        if (type === 'career') {
          return {
            id: `job-${post.id}`,
            category: 'Karrier / Állás',
            icon: 'fa-solid fa-briefcase',
            title: post.title,
            text: post.excerpt,
            targetPage: 'career',
            postId: post.id
          };
        } else if (type === 'product') {
          return {
            id: `prod-${post.id}`,
            category: 'Termékek & Oltványok',
            icon: 'fa-solid fa-apple-whole',
            title: post.title,
            text: post.excerpt,
            targetPage: 'products',
            postId: post.id
          };
        }
        return {
          id: `post-${post.id}`,
          category: 'Blog cikk',
          icon: 'fa-solid fa-newspaper',
          title: post.title,
          text: post.excerpt,
          targetPage: 'blog',
          postId: post.id
        };
      });

      const allMatches = [...matchedStatic, ...matchedPosts];

      if (allMatches.length === 0) {
        searchDropdown.innerHTML = `
          <div class="search-no-results">
            <i class="fa-solid fa-magnifying-glass"></i>
            Nincs találat a következőre: <strong>"${val}"</strong>
          </div>
        `;
        searchDropdown.style.display = 'block';
        return;
      }

      // Group matches by category
      const grouped = {};
      allMatches.forEach(item => {
        const cat = item.category.split('/')[0].trim();
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      let dropdownHTML = '';
      for (const [categoryName, items] of Object.entries(grouped)) {
        dropdownHTML += `
          <div class="search-result-group">
            <div class="search-group-header">${categoryName}</div>
            ${items.map(item => `
              <button class="search-result-item" data-target-page="${item.targetPage}" data-target-element="${item.targetElementId || ''}" data-post-id="${item.postId || ''}">
                <div class="result-icon">
                  <i class="${item.icon}"></i>
                </div>
                <div class="result-content">
                  <h5>${item.title}</h5>
                  <p>${item.text}</p>
                </div>
              </button>
            `).join('')}
          </div>
        `;
      }

      searchDropdown.innerHTML = dropdownHTML;
      searchDropdown.style.display = 'block';

      // Attach click listeners to result items
      searchDropdown.querySelectorAll('.search-result-item').forEach(itemBtn => {
        itemBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetPage = itemBtn.getAttribute('data-target-page');
          const targetElement = itemBtn.getAttribute('data-target-element');
          const postId = itemBtn.getAttribute('data-post-id');

          if (searchDropdownBox) searchDropdownBox.style.display = 'none';
          if (navSearchBtn) navSearchBtn.classList.remove('active');

          if (targetPage === 'blog' && postId) {
            setPageState('blog', postId, true);
            state.menuSearchTerm = '';
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (targetPage === 'products' && postId) {
            state.activeProductId = postId;
            setPageState('products', null, true);
            state.menuSearchTerm = '';
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (targetPage === 'career' && postId) {
            setPageState('career', null, true);
            state.menuSearchTerm = '';
            render();
            setTimeout(() => {
              const el = document.getElementById(`job-${postId}`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            executeTargetNavigation(targetPage, targetElement);
          }
        });
      });
    };

    menuSearchInput.addEventListener('input', (e) => {
      handleSearchInput(e.target.value);
    });

    menuSearchInput.addEventListener('focus', (e) => {
      if (e.target.value.trim()) {
        handleSearchInput(e.target.value);
      }
    });
  }

  // Admin Login form submit
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('admin-password').value;
      if (pass === 'MoRa!b18jA') {
        state.isLoggedIn = true;
        sessionStorage.setItem('demotrade_admin_logged_in', 'true');
        setPageState('admin', null, true);
        showToast('Sikeres belépés az Admin Panelre!');
        render();
      } else {
        showToast('Hibás jelszó!', 'error');
      }
    });
  }

  // Admin Logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.isLoggedIn = false;
      sessionStorage.removeItem('demotrade_admin_logged_in');
      setPageState('home', null, true);
      showToast('Kijelentkezve.');
      render();
    });
  }

  // Logo button
  const logoBtn = document.getElementById('logo-btn');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.activePage === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setPageState('home', null, true);
        render();
        window.scrollTo(0, 0);
      }
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // If search popup is open, close it
      if (searchDropdownBox) {
        searchDropdownBox.style.display = 'none';
        if (navSearchBtn) navSearchBtn.classList.remove('active');
      }

      const isOpening = !navMenu.classList.contains('is-active');
      navMenu.classList.toggle('is-active');
      
      const toggleIcon = document.getElementById('mobile-toggle-icon');
      if (toggleIcon) {
        toggleIcon.className = isOpening ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    // Close mobile menu when clicking any nav item
    navMenu.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        navMenu.classList.remove('is-active');
        const toggleIcon = document.getElementById('mobile-toggle-icon');
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-bars';
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu && navMenu.classList.contains('is-active')) {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
          navMenu.classList.remove('is-active');
          const toggleIcon = document.getElementById('mobile-toggle-icon');
          if (toggleIcon) toggleIcon.className = 'fa-solid fa-bars';
        }
      }
    });
  }

  // View single blog post
  document.querySelectorAll('.view-post-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = btn.getAttribute('data-id');
      setPageState('blog', postId, true);
      render();
      window.scrollTo(0, 0);
    });
  });

  // Blog Pagination buttons
  document.querySelectorAll('.blog-page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pageNum = parseInt(btn.getAttribute('data-page-num'), 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== state.currentPage) {
        state.currentPage = pageNum;
        render();
        const blogContainer = document.querySelector('.blog-list-container');
        if (blogContainer) {
          const yOffset = -80;
          const y = blogContainer.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  });

  // Blog live search input
  const blogSearchInput = document.getElementById('blog-search');
  if (blogSearchInput) {
    blogSearchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value;
      state.currentPage = 1;
      render();
      const input = document.getElementById('blog-search');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  // Back to blog listing
  const backBtn = document.querySelector('.back-to-blog-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        setPageState('blog', null, true);
        render();
        window.scrollTo(0, 0);
      }
    });
  }

  // Social Share Handlers
  const currentUrl = window.location.href;

  document.querySelectorAll('.share-btn-fb').forEach(btn => {
    btn.addEventListener('click', () => {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    });
  });

  document.querySelectorAll('.share-btn-in').forEach(btn => {
    btn.addEventListener('click', () => {
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
      window.open(shareUrl, '_blank', 'width=600,height=500,noopener,noreferrer');
    });
  });

  document.querySelectorAll('.share-btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('Cikk hivatkozása másolva a vágólapra!');
      }).catch(() => {
        showToast('Nem sikerült a másolás.', 'error');
      });
    });
  });

  // Blog search input inside blog page
  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value;
      state.currentPage = 1;
      render();
      const newSearch = document.getElementById('blog-search');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });
  }

  // Category filter pills
  document.querySelectorAll('.pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      state.selectedCategory = pill.getAttribute('data-category');
      state.currentPage = 1;
      render();
    });
  });

  // Blog pagination buttons
  document.querySelectorAll('.blog-page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pageNum = parseInt(btn.getAttribute('data-page-num'), 10);
      if (pageNum && !isNaN(pageNum)) {
        state.currentPage = pageNum;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });



  // Helper: Client-side Image Compression (Canvas resize & JPEG quality)
  const compressImageFile = (file, maxWidth = 1200, quality = 0.82) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Admin File Upload for Cover Image (Only file upload, auto-optimized)
  const imageFileInput = document.getElementById('post-image-file');
  const imageUrlInput = document.getElementById('post-image');
  const imagePreviewCont = document.getElementById('post-image-preview-container');
  const imagePreview = document.getElementById('post-image-preview');
  const imageFilenameEl = document.getElementById('post-image-filename');

  if (imageFileInput && imageUrlInput) {
    const updatePreview = (src) => {
      if (imagePreviewCont && imagePreview) {
        if (src) {
          imagePreview.src = src;
          imagePreviewCont.style.display = 'block';
        } else {
          imagePreviewCont.style.display = 'none';
        }
      }
    };

    imageFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (imageFilenameEl) imageFilenameEl.textContent = 'Kép feldolgozása és optimalizálása...';
        try {
          const optimizedDataUrl = await compressImageFile(file, 1200, 0.82);
          imageUrlInput.value = optimizedDataUrl;
          updatePreview(optimizedDataUrl);
          const sizeKb = Math.round((optimizedDataUrl.length * 0.75) / 1024);
          if (imageFilenameEl) {
            imageFilenameEl.innerHTML = `<span style="color: var(--primary); font-weight: 700;"><i class="fa-solid fa-circle-check"></i> ${file.name}</span> (~${sizeKb} KB, optimalizálva)`;
          }
          showToast('Kép sikeresen optimalizálva és betöltve!');
        } catch (err) {
          console.error('Image compression error:', err);
          // Fallback to direct FileReader
          const reader = new FileReader();
          reader.onload = (evt) => {
            imageUrlInput.value = evt.target.result;
            updatePreview(evt.target.result);
            if (imageFilenameEl) imageFilenameEl.textContent = file.name;
            showToast('Kép sikeresen betöltve!');
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }

  // WYSIWYG Editor Toolbar Handlers
  const editorArea = document.getElementById('post-content-editor');
  const editorFileInput = document.getElementById('editor-image-file-input');

  if (editorArea) {
    document.querySelectorAll('.editor-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd');
        const val = btn.getAttribute('data-val') || null;

        if (cmd === 'createLink') {
          const url = prompt('Adja meg a hivatkozás URL-jét:', 'https://');
          if (url) document.execCommand(cmd, false, url);
        } else {
          document.execCommand(cmd, false, val);
        }
        editorArea.focus();
      });
    });

    // Format Block (H2, H3, H4, p) dropdown handler
    const formatSelect = document.getElementById('editor-format-select');
    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        const tag = e.target.value;
        document.execCommand('formatBlock', false, `<${tag}>`);
        editorArea.focus();
      });
    }

    // Font Size (1-7) dropdown handler
    const fontSizeSelect = document.getElementById('editor-fontsize-select');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', (e) => {
        const size = e.target.value;
        if (size) {
          document.execCommand('fontSize', false, size);
        }
        editorArea.focus();
      });
    }

    const insertImgBtn = document.getElementById('editor-insert-img-btn');
    if (insertImgBtn && editorFileInput) {
      insertImgBtn.addEventListener('click', (e) => {
        e.preventDefault();
        editorFileInput.click();
      });

      editorFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const optimizedBase64 = await compressImageFile(file, 1000, 0.80);
            editorArea.focus();
            document.execCommand('insertHTML', false, `<img src="${optimizedBase64}" alt="Cikk kép" style="max-width:100%; height:auto; border-radius:8px; margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`);
            showToast('Kép optimalizálva és beillesztve a leírásba!');
          } catch (err) {
            console.error('Editor image error:', err);
            const reader = new FileReader();
            reader.onload = (evt) => {
              const base64 = evt.target.result;
              editorArea.focus();
              document.execCommand('insertHTML', false, `<img src="${base64}" alt="Cikk kép" style="max-width:100%; height:auto; border-radius:8px; margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`);
              showToast('Kép beillesztve a leírásba!');
            };
            reader.readAsDataURL(file);
          }
          editorFileInput.value = '';
        }
      });
    }
  }

  // ==========================================
  // CAREER PAGE EVENT HANDLERS
  // ==========================================
  // 1. "Jelentkezés" button on job cards -> scroll & preselect
  document.querySelectorAll('.apply-to-job-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const jobTitle = btn.getAttribute('data-job-title');
      const select = document.getElementById('career-position');
      if (select && jobTitle) {
        let found = false;
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value === jobTitle) {
            select.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          const opt = new Option(jobTitle, jobTitle, true, true);
          select.add(opt);
        }
      }

      const formSection = document.getElementById('karrier-jelentkezes');
      if (formSection) {
        const yOffset = -70;
        const y = formSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    });
  });

  // 2. CV File dropzone handling
  const cvDropzone = document.getElementById('cv-dropzone');
  const cvFileInput = document.getElementById('career-cv-file');
  const dropzonePrompt = document.getElementById('dropzone-prompt');
  const dropzoneFileInfo = document.getElementById('dropzone-file-info');
  const cvFilename = document.getElementById('cv-filename');
  const cvFilesize = document.getElementById('cv-filesize');
  const removeCvBtn = document.getElementById('remove-cv-btn');

  if (cvDropzone && cvFileInput) {
    cvDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#remove-cv-btn')) return;
      cvFileInput.click();
    });

    const handleFile = (file) => {
      if (!file) return;

      const validExts = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExts.includes(fileExt)) {
        showToast('Kérjük csak PDF vagy Word (.doc, .docx) formátumú önéletrajzot töltsön fel!', 'error');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast('A fájl mérete nem haladhatja meg a 10 MB-ot!', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        // extract base64 data
        const base64Data = evt.target.result.split(',')[1];
        state.selectedCvAttachment = {
          filename: file.name,
          content: base64Data,
          contentType: file.type || 'application/pdf'
        };

        if (cvFilename) cvFilename.textContent = file.name;
        if (cvFilesize) {
          const sizeKb = (file.size / 1024).toFixed(1);
          cvFilesize.textContent = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(2)} MB` : `${sizeKb} KB`;
        }

        if (dropzonePrompt) dropzonePrompt.style.display = 'none';
        if (dropzoneFileInfo) dropzoneFileInfo.style.display = 'flex';
        showToast('Önéletrajz csatolva!');
      };
      reader.readAsDataURL(file);
    };

    cvFileInput.addEventListener('change', (e) => {
      handleFile(e.target.files[0]);
    });

    cvDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      cvDropzone.classList.add('dragover');
    });

    cvDropzone.addEventListener('dragleave', () => {
      cvDropzone.classList.remove('dragover');
    });

    cvDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      cvDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    if (removeCvBtn) {
      removeCvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedCvAttachment = null;
        cvFileInput.value = '';
        if (dropzonePrompt) dropzonePrompt.style.display = 'block';
        if (dropzoneFileInfo) dropzoneFileInfo.style.display = 'none';
      });
    }
  }

  // 3. Career Application Form submission
  const careerForm = document.getElementById('career-application-form');
  if (careerForm) {
    careerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('career-name')?.value.trim();
      const email = document.getElementById('career-email')?.value.trim();
      const phone = document.getElementById('career-phone')?.value.trim();
      const position = document.getElementById('career-position')?.value;
      const message = document.getElementById('career-message')?.value.trim();
      const privacy = document.getElementById('career-privacy')?.checked;
      const honeypot = document.getElementById('career-hp-fax')?.value.trim();
      const submitBtn = document.getElementById('career-submit-btn');

      if (honeypot) {
        console.warn('Bot detected via honeypot.');
        showToast('Köszönjük! Jelentkezését sikeresen rögzítettük!');
        careerForm.reset();
        return;
      }

      if (!privacy) {
        showToast('Kérjük fogadja el az Adatkezelési tájékoztatót a jelentkezéshez!', 'error');
        return;
      }

      if (!name || !email || !message) {
        showToast('Kérjük töltse ki a kötelező mezőket!', 'error');
        return;
      }

      if (!state.selectedCvAttachment) {
        showToast('Kérjük csatolja fényképes szakmai önéletrajzát!', 'error');
        return;
      }

      const origBtnText = submitBtn ? submitBtn.innerHTML : 'Jelentkezés Beküldése';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Jelentkezés és önéletrajz küldése...';
      }

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'career',
            name,
            email,
            phone,
            position,
            message,
            attachment: state.selectedCvAttachment,
            privacyConsent: true
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          showToast(result.message || 'Köszönjük! Jelentkezését és önéletrajzát sikeresen továbbítottuk!');
          careerForm.reset();
          state.selectedCvAttachment = null;
          if (dropzonePrompt) dropzonePrompt.style.display = 'block';
          if (dropzoneFileInfo) dropzoneFileInfo.style.display = 'none';
        } else {
          showToast(result.message || 'Hiba történt a jelentkezés küldésekor.', 'error');
        }
      } catch (err) {
        console.error('Career submit error:', err);
        showToast('Köszönjük! Jelentkezését rögzítettük és hamarosan felvesszük Önnel a kapcsolatot!', 'success');
        careerForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnText;
        }
      }
    });
  }

  // ==========================================
  // PRODUCTS PAGE EVENT HANDLERS
  // ==========================================
  // Category pills filter
  document.querySelectorAll('.product-category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      state.productCategory = pill.getAttribute('data-prod-cat');
      render();
    });
  });

  // Product search live input
  const prodSearchInput = document.getElementById('product-search-input');
  if (prodSearchInput) {
    prodSearchInput.addEventListener('input', (e) => {
      state.productSearch = e.target.value;
      render();
      const input = document.getElementById('product-search-input');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  // Reset filter button
  const resetProdFilterBtn = document.getElementById('reset-prod-filter-btn');
  if (resetProdFilterBtn) {
    resetProdFilterBtn.addEventListener('click', () => {
      state.productCategory = 'all';
      state.productSearch = '';
      render();
    });
  }

  // Product Detail Modal Open
  document.querySelectorAll('.view-product-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-prod-id');
      state.activeProductId = prodId;
      render();
    });
  });

  // Product Detail Modal Close
  const closeProdModalBtn = document.getElementById('close-product-modal-btn');
  const dismissProdModalBtn = document.getElementById('dismiss-product-modal-btn');
  const prodDetailModal = document.getElementById('product-detail-modal');

  const closeProductDetailModal = () => {
    state.activeProductId = null;
    render();
  };

  if (closeProdModalBtn) closeProdModalBtn.addEventListener('click', closeProductDetailModal);
  if (dismissProdModalBtn) dismissProdModalBtn.addEventListener('click', closeProductDetailModal);
  if (prodDetailModal) {
    prodDetailModal.addEventListener('click', (e) => {
      if (e.target === prodDetailModal) closeProductDetailModal();
    });
  }

  // Product Quick Inquiry Modal
  const inquiryModal = document.getElementById('product-inquiry-modal');
  const closeInquiryModalBtn = document.getElementById('close-inquiry-modal-btn');
  const cancelInquiryBtn = document.getElementById('cancel-inquiry-btn');
  const inquiryModalTitle = document.getElementById('inquiry-modal-title');
  const inquiryProdNameInput = document.getElementById('inquiry-product-name');

  document.querySelectorAll('.open-product-inquiry-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodTitle = btn.getAttribute('data-prod-title');
      if (inquiryModal) {
        if (inquiryModalTitle) inquiryModalTitle.textContent = `Ajánlatkérés: ${prodTitle}`;
        if (inquiryProdNameInput) inquiryProdNameInput.value = prodTitle;
        inquiryModal.style.display = 'flex';
      }
    });
  });

  const closeInquiryModal = () => {
    if (inquiryModal) inquiryModal.style.display = 'none';
  };

  if (closeInquiryModalBtn) closeInquiryModalBtn.addEventListener('click', closeInquiryModal);
  if (cancelInquiryBtn) cancelInquiryBtn.addEventListener('click', closeInquiryModal);
  if (inquiryModal) {
    inquiryModal.addEventListener('click', (e) => {
      if (e.target === inquiryModal) closeInquiryModal();
    });
  }

  // Product Inquiry Form Submit
  const inquiryForm = document.getElementById('product-inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('inquiry-name')?.value.trim();
      const email = document.getElementById('inquiry-email')?.value.trim();
      const phone = document.getElementById('inquiry-phone')?.value.trim();
      const productName = inquiryProdNameInput?.value || 'Általános termék';
      const message = document.getElementById('inquiry-message')?.value.trim();
      const submitBtn = document.getElementById('inquiry-submit-btn');

      if (!name || !email || !message) {
        showToast('Kérjük töltse ki a kötelező mezőket!', 'error');
        return;
      }

      const origBtnText = submitBtn ? submitBtn.innerHTML : 'Ajánlatkérés Küldése';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Küldés folyamatban...';
      }

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'product',
            name,
            email,
            phone,
            productName,
            message,
            privacyConsent: true
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          showToast(result.message || 'Köszönjük érdeklődését! Ajánlatkérését sikeresen elküldtük!');
          inquiryForm.reset();
          closeInquiryModal();
        } else {
          showToast(result.message || 'Hiba történt a küldéskor.', 'error');
        }
      } catch (err) {
        console.error('Inquiry error:', err);
        showToast('Köszönjük! Érdeklődését továbbítottuk, hamarosan visszahívjuk!', 'success');
        closeInquiryModal();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnText;
        }
      }
    });
  }

  // ==========================================
  // ADMIN PANEL ENHANCED EVENT HANDLERS
  // ==========================================
  // Content Type Selector Toggle in Admin Form
  document.querySelectorAll('input[name="post-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const type = e.target.value;
      document.querySelectorAll('.type-pill').forEach(pill => {
        pill.classList.toggle('active', pill.querySelector('input').value === type);
      });

      const careerFields = document.getElementById('career-extra-fields');
      const prodFields = document.getElementById('product-extra-fields');
      const titleLabel = document.getElementById('label-post-title');
      const titleInput = document.getElementById('post-title');
      const catInput = document.getElementById('post-category');

      if (careerFields) careerFields.style.display = type === 'career' ? 'grid' : 'none';
      if (prodFields) prodFields.style.display = type === 'product' ? 'grid' : 'none';

      if (titleLabel && titleInput) {
        if (type === 'career') {
          titleLabel.textContent = 'Pozíció Megnevezése *';
          titleInput.placeholder = 'Pl. Mezőgazdasági Szaktanácsadó...';
          if (!catInput.value || catInput.value === 'Híreink') catInput.value = 'Szaktanácsadás';
        } else if (type === 'product') {
          titleLabel.textContent = 'Termék / Oltvány Neve *';
          titleInput.placeholder = 'Pl. Jonagold Alma Oltvány (M9)...';
          if (!catInput.value || catInput.value === 'Híreink') catInput.value = 'Gyümölcsfa oltványok';
        } else {
          titleLabel.textContent = 'Cikk Címe *';
          titleInput.placeholder = 'Pl. Növényvédelmi előrejelzés...';
          if (!catInput.value) catInput.value = 'Híreink';
        }
      }
    });
  });

  // Admin Table Filter Pills
  document.querySelectorAll('.admin-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminTableFilter = btn.getAttribute('data-filter');
      render();
    });
  });

  // Admin Live Preview Modal Handlers (Előkép / Megtekintési lehetőség)
  const previewModal = document.getElementById('admin-preview-modal');
  const previewPostBtn = document.getElementById('preview-post-btn');
  const closeAdminPreviewBtn = document.getElementById('close-admin-preview-btn');
  const dismissAdminPreviewBtn = document.getElementById('dismiss-admin-preview-btn');
  const publishFromPreviewBtn = document.getElementById('publish-from-preview-btn');

  const openAdminPreview = (customPost = null) => {
    if (!previewModal) return;

    let title, type, category, author, image, excerpt, content, metaExtra = '';

    if (customPost) {
      title = customPost.title;
      type = customPost.type || 'blog';
      category = customPost.category || 'Általános';
      author = customPost.author || 'Demo-Trade Kft.';
      image = customPost.image || '/images/hero.png';
      excerpt = customPost.excerpt || '';
      content = customPost.content || '';
      if (type === 'career') {
        metaExtra = `${customPost.location || ''} &bull; ${customPost.jobType || ''}`;
      } else if (type === 'product') {
        metaExtra = `${customPost.price || ''} &bull; ${customPost.badge || ''}`;
      }
    } else {
      title = document.getElementById('post-title')?.value.trim() || 'Cím nélküli tartalom';
      type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';
      category = document.getElementById('post-category')?.value.trim() || 'Kategória';
      author = document.getElementById('post-author')?.value.trim() || 'Moravszki Gábor';
      image = document.getElementById('post-image')?.value.trim() || (type === 'product' ? '/images/gyumolcsfa_oltvanyok.jpg' : (type === 'career' ? '/images/karrier_csapat.jpg' : '/images/hero.png'));
      excerpt = document.getElementById('post-excerpt')?.value.trim() || '';
      content = editorArea ? editorArea.innerHTML.trim() : document.getElementById('post-content')?.value.trim();

      if (type === 'career') {
        const loc = document.getElementById('job-location')?.value.trim();
        const jType = document.getElementById('job-type-field')?.value.trim();
        metaExtra = [loc, jType].filter(Boolean).join(' &bull; ');
      } else if (type === 'product') {
        const pr = document.getElementById('prod-price')?.value.trim();
        const bg = document.getElementById('prod-badge')?.value.trim();
        metaExtra = [pr, bg].filter(Boolean).join(' &bull; ');
      }
    }

    const typeBadge = document.getElementById('preview-modal-type-badge');
    const customTop = document.getElementById('preview-modal-custom-top');
    const customBottom = document.getElementById('preview-modal-custom-bottom');

    if (customTop) customTop.innerHTML = '';
    if (customBottom) customBottom.innerHTML = '';

    if (typeBadge) {
      if (type === 'career') {
        typeBadge.className = 'admin-type-badge badge-career';
        typeBadge.innerHTML = '<i class="fa-solid fa-briefcase"></i> Álláshirdetés Előnézet';

        if (customTop) {
          const loc = document.getElementById('job-location')?.value.trim() || 'Nyíregyháza';
          const jType = document.getElementById('job-type-field')?.value.trim() || 'Teljes munkaidő';
          const dLine = document.getElementById('job-deadline')?.value.trim() || 'Folyamatos felvétel';
          customTop.innerHTML = `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.4rem; display: flex; gap: 1.2rem; flex-wrap: wrap; align-items: center; font-size: 0.9rem;">
              <span><i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> <strong>Helyszín:</strong> ${loc}</span>
              <span><i class="fa-regular fa-clock" style="color: var(--primary);"></i> <strong>Munkaidő:</strong> ${jType}</span>
              <span><i class="fa-regular fa-calendar-check" style="color: var(--primary);"></i> <strong>Határidő:</strong> ${dLine}</span>
            </div>
          `;
        }

        if (customBottom) {
          customBottom.innerHTML = `
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 1.2rem 1.5rem; text-align: center; color: var(--gray-600); font-size: 0.9rem;">
              <i class="fa-solid fa-file-arrow-up" style="color: var(--primary); font-size: 1.4rem; display: block; margin-bottom: 0.4rem;"></i>
              <strong>Beépített Jelentkezési Űrlap Minta:</strong> A látogatók ezen hirdetés alatt közvetlenül tudják majd feltölteni szakmai önéletrajzukat és elküldeni pályázatukat a rendszeren keresztül.
            </div>
          `;
        }
      } else if (type === 'product') {
        typeBadge.className = 'admin-type-badge badge-product';
        typeBadge.innerHTML = '<i class="fa-solid fa-apple-whole"></i> Termékhirdetés Előnézet';

        if (customTop) {
          const pr = document.getElementById('prod-price')?.value.trim() || 'Egyedi árajánlat alapján';
          const bg = document.getElementById('prod-badge')?.value.trim() || 'Minősített Oltvány';
          customTop.innerHTML = `
            <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 1.2rem 1.4rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span class="product-badge-overlay" style="position: static; display: inline-block; margin-bottom: 0.4rem;">${bg}</span>
                <div style="font-size: 1.3rem; font-weight: 800; color: #c2410c;">
                  <i class="fa-solid fa-tag"></i> ${pr}
                </div>
              </div>
              <button type="button" class="btn btn-primary" style="pointer-events: none; opacity: 0.9;">
                <i class="fa-solid fa-paper-plane"></i> Ajánlatkérés a termékről (Vásárlói Gomb)
              </button>
            </div>
          `;
        }
      } else {
        typeBadge.className = 'admin-type-badge badge-blog';
        typeBadge.innerHTML = '<i class="fa-solid fa-newspaper"></i> Blog Cikk Előnézet';
      }
    }

    const titleEl = document.getElementById('preview-modal-title');
    if (titleEl) titleEl.textContent = title;

    const metaEl = document.getElementById('preview-modal-meta');
    if (metaEl) {
      metaEl.innerHTML = `<span><strong>${category}</strong> &bull; ${author} &bull; ${metaExtra}</span>`;
    }

    const imgEl = document.getElementById('preview-modal-img');
    if (imgEl) imgEl.src = image;

    const excerptBox = document.getElementById('preview-modal-excerpt-box');
    if (excerptBox) {
      excerptBox.textContent = excerpt || '(Nincs rövid kivonat megadva)';
    }

    const contentRich = document.getElementById('preview-modal-content-rich');
    if (contentRich) {
      contentRich.innerHTML = content || '<p><em>Nincs részletes tartalom megadva.</em></p>';
    }

    previewModal.style.display = 'flex';
  };

  if (previewPostBtn) {
    previewPostBtn.addEventListener('click', () => openAdminPreview());
  }

  const closeAdminPreview = () => {
    if (previewModal) previewModal.style.display = 'none';
  };

  if (closeAdminPreviewBtn) closeAdminPreviewBtn.addEventListener('click', closeAdminPreview);
  if (dismissAdminPreviewBtn) dismissAdminPreviewBtn.addEventListener('click', closeAdminPreview);
  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) closeAdminPreview();
    });
  }

  if (publishFromPreviewBtn) {
    publishFromPreviewBtn.addEventListener('click', () => {
      closeAdminPreview();
      const adminForm = document.getElementById('admin-post-form');
      if (adminForm) {
        adminForm.requestSubmit ? adminForm.requestSubmit() : adminForm.submit();
      }
    });
  }

  // Preview button in admin table rows
  document.querySelectorAll('.preview-item-table-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = state.posts.find(p => p.id === id);
      if (item) openAdminPreview(item);
    });
  });

  // Admin form submission (Add / Edit) with Type & Extras + Supabase Pro Sync
  const adminForm = document.getElementById('admin-post-form');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('post-id')?.value;
      const type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';
      const title = document.getElementById('post-title')?.value.trim();
      const category = document.getElementById('post-category')?.value.trim() || 'Híreink';
      const author = document.getElementById('post-author')?.value.trim() || 'Moravszki Gábor';
      let image = document.getElementById('post-image')?.value.trim() || (type === 'product' ? '/images/gyumolcsfa_oltvanyok.jpg' : (type === 'career' ? '/images/karrier_csapat.jpg' : '/images/hero.png'));
      const excerpt = document.getElementById('post-excerpt')?.value.trim();
      const content = editorArea ? editorArea.innerHTML.trim() : document.getElementById('post-content')?.value.trim();
      const date = new Date().toLocaleDateString('hu-HU');

      // Type-specific extras
      const location = document.getElementById('job-location')?.value.trim();
      const jobType = document.getElementById('job-type-field')?.value.trim();
      const deadline = document.getElementById('job-deadline')?.value.trim();
      const price = document.getElementById('prod-price')?.value.trim();
      const badge = document.getElementById('prod-badge')?.value.trim();

      if (!content || content === '<br>') {
        showToast('Kérjük adja meg a részletes szöveges leírást!', 'error');
        return;
      }

      // If a new image was selected (base64 data URL), upload it to Supabase Pro Storage
      if (image && image.startsWith('data:image')) {
        showToast('Kép feltöltése a Supabase felhőtárhelyre...', 'info');
        try {
          const upRes = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: image,
              filename: title || 'post-image',
              folder: type === 'product' ? 'termekek' : (type === 'career' ? 'karrier' : 'blog')
            })
          });
          const upData = await upRes.json();
          if (upRes.ok && upData.success && upData.publicUrl) {
            image = upData.publicUrl;
          }
        } catch (upErr) {
          console.warn('Image upload to Supabase notice (fallback to local data):', upErr);
        }
      }

      let savedPostObj = null;

      if (id) {
        const updatedPosts = state.posts.map(p => {
          if (p.id === id) {
            savedPostObj = {
              ...p,
              type,
              title,
              category,
              author,
              image,
              excerpt,
              content,
              location,
              jobType,
              deadline,
              price,
              badge
            };
            return savedPostObj;
          }
          return p;
        });
        savePosts(updatedPosts, savedPostObj);
        showToast('Tartalom sikeresen frissítve a Supabase felhőben!');
      } else {
        const prefix = type === 'career' ? 'job-' : (type === 'product' ? 'prod-' : 'post-');
        savedPostObj = {
          id: prefix + Date.now(),
          type,
          title,
          category,
          author,
          date,
          image,
          excerpt,
          content,
          location,
          jobType,
          deadline,
          price,
          badge
        };
        savePosts([savedPostObj, ...state.posts], savedPostObj);
        showToast('Új bejegyzés sikeresen közzétéve a Supabase felhőben!');
      }

      state.editingPostId = null;
      render();
    });
  }

  // Admin Edit button
  document.querySelectorAll('.edit-post-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingPostId = btn.getAttribute('data-id');
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Admin Cancel edit
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      state.editingPostId = null;
      render();
    });
  }

  // Admin Delete button (Syncs with Supabase)
  document.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Biztosan törölni szeretné ezt a bejegyzést?')) {
        const filtered = state.posts.filter(p => p.id !== id);
        savePosts(filtered);

        // Delete from Supabase
        supabase.from('web_posts').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase delete notice:', error.message);
        });

        showToast('Bejegyzés törölve!');
        if (state.editingPostId === id) state.editingPostId = null;
        render();
      }
    });
  });

  // Admin Reset posts button
  const resetBtn = document.getElementById('reset-posts-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Visszaállítja a gyári demo cikkeket, állásokat és termékeket?')) {
        savePosts(INITIAL_POSTS);
        state.editingPostId = null;
        showToast('Alapértelmezett bejegyzések és termékek visszaállítva!');
        render();
      }
    });
  }

  // --- STAGING GATE VEIL EVENT LISTENERS ---
  const stagingBackHomeBtn = document.getElementById('staging-back-home-btn');
  if (stagingBackHomeBtn) {
    stagingBackHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.overflow = '';
      setPageState('home', null, true);
      render();
      window.scrollTo(0, 0);
    });
  }

  const stagingUnlockForm = document.getElementById('staging-unlock-form');
  if (stagingUnlockForm) {
    stagingUnlockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pwInput = document.getElementById('staging-password-input');
      const errBox = document.getElementById('staging-error-msg');
      const val = pwInput ? pwInput.value.trim() : '';

      if (val === STAGING_DEV_PASSWORD) {
        sessionStorage.setItem('demotrade_preview_unlocked', 'true');
        showToast('Fejlesztői hozzáférés feloldva!');
        render();
      } else {
        if (errBox) errBox.style.display = 'block';
        if (pwInput) {
          pwInput.classList.add('error');
          pwInput.focus();
          pwInput.select();
        }
      }
    });
  }

  const devLockAgainBtn = document.getElementById('dev-lock-again-btn');
  if (devLockAgainBtn) {
    devLockAgainBtn.addEventListener('click', () => {
      sessionStorage.removeItem('demotrade_preview_unlocked');
      showToast('Fejlesztői előnézet zárolva.');
      render();
    });
  }
}

// Initial render
initHistoryState();
render();
syncPostsFromSupabase();
