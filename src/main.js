import './styles.css';
import { INITIAL_POSTS } from './data/initialPosts.js';
import { INITIAL_STAFF } from './data/initialStaff.js';
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderHomePage } from './pages/HomePage.js';
import { renderAboutPage } from './pages/AboutPage.js';
import { renderServicesPage } from './pages/ServicesPage.js';
import { renderBlogPage } from './pages/BlogPage.js';
import { renderContactPage } from './pages/ContactPage.js';
import { renderCareerPage } from './pages/CareerPage.js';
import { renderProductsPage } from './pages/ProductsPage.js';
import { renderAdminPage, CATEGORY_OPTIONS_BY_TYPE, renderPasswordEyeSvg } from './pages/AdminPage.js';
import { renderImpresszumPage } from './pages/ImpresszumPage.js';
import { renderPrivacyPage } from './pages/PrivacyPage.js';
import { renderNotFoundPage } from './pages/NotFoundPage.js';
import { renderCookieBanner } from './components/CookieBanner.js';
import { supabase } from './utils/supabaseClient.js';
import { normalizeRichContentHtml } from './utils/contentNormalizer.js';
import { isJobActive, getActiveJobs, JOB_ACTIVE_MARK, JOB_INACTIVE_MARK } from './utils/jobStatus.js';
import { adminSignIn, adminSignOut, getAdminSession, getAdminAccessToken, isAdminUser } from './utils/adminAuth.js';

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
  isLoggedIn: false,
  authReady: false,
  productCategory: 'all',
  productSearch: '',
  activeProductId: null,
  adminTableFilter: 'all',
  selectedCvAttachment: null,
  staff: loadStaff(),
  editingStaffId: null,
  adminTab: 'content',
  adminNewType: null
};


function getPostsSignature(list) {
  if (!Array.isArray(list)) return '';
  return [...list]
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map(p => `${p.id}_${p.title || ''}_${p.category || ''}_${p.price || ''}_${(p.excerpt || '').length}_${(p.content || '').length}`)
    .join('|');
}

// Background sync from Supabase Pro database
async function syncPostsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('web_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Compare order-independent content signatures to detect if database data ACTUALLY changed
      const currentSignature = getPostsSignature(state.posts);
      const incomingSignature = getPostsSignature(data);

      state.posts = data;
      localStorage.setItem('demotrade_posts', JSON.stringify(data));
      updateJobPostingSchema();

      // ONLY re-render if the database content differs AND the active page actually displays posts
      const postDependentPages = ['blog', 'career', 'karrier', 'allas', 'products', 'termekek', 'admin'];
      if (currentSignature !== incomingSignature && postDependentPages.includes(state.activePage)) {
        render();
      }
    }
  } catch (err) {
    console.warn('Supabase posts sync info (fallback to cache):', err);
  }
}

// --- MUNKATÁRSAK (STAFF) KEZELÉSE: localStorage cache + Supabase `web_staff` tábla ---
function loadStaff() {
  try {
    const saved = localStorage.getItem('demotrade_staff');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Staff cache read error:', e);
  }
  return INITIAL_STAFF.map(s => ({ ...s }));
}

function getStaffSignature(list) {
  return (Array.isArray(list) ? list : [])
    .map(s => `${s.id}|${s.office}|${s.name}|${s.role}|${s.phone}`)
    .join('~');
}

async function syncStaffFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('web_staff')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return; // tábla hiányzik / üres: marad a gyorsítótár vagy az alapértelmezett lista

    const incoming = data.map(r => ({ id: r.id, office: r.office, name: r.name, role: r.role, phone: r.phone }));
    const changed = getStaffSignature(state.staff) !== getStaffSignature(incoming);
    state.staff = incoming;
    localStorage.setItem('demotrade_staff', JSON.stringify(incoming));

    const staffPages = ['home', 'contact', 'impresszum', 'admin'];
    if (changed && staffPages.includes(state.activePage)) {
      render();
    }
  } catch (err) {
    console.warn('Supabase staff sync info (fallback to cache):', err);
  }
}

async function saveStaff(list) {
  state.staff = list;
  localStorage.setItem('demotrade_staff', JSON.stringify(list));

  try {
    const rows = list.map((s, idx) => ({
      id: s.id,
      office: s.office,
      name: s.name,
      role: s.role,
      phone: s.phone,
      sort_order: idx,
      updated_at: new Date().toISOString()
    }));

    const { error: upErr } = await supabase.from('web_staff').upsert(rows);
    if (upErr) throw upErr;

    // A törölt munkatársak eltávolítása az adatbázisból is
    const keepIds = list.map(s => s.id);
    const { data: existing } = await supabase.from('web_staff').select('id');
    const toDelete = (existing || []).map(r => r.id).filter(id => !keepIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('web_staff').delete().in('id', toDelete);
    }
    return true;
  } catch (err) {
    console.warn('Supabase staff save notice:', err && err.message ? err.message : err);
    return false;
  }
}

function sanitizeStaffText(value) {
  return String(value || '').replace(/[<>"]/g, '').replace(/\s+/g, ' ').trim();
}

function loadPosts() {
  const saved = localStorage.getItem('demotrade_posts');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);

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

// Mentés a böngészőbe + (ha adott) a közös tárolóba. Igazat ad vissza, ha a közös tárolóba is sikerült írni.
async function savePosts(posts, postToSync = null) {
  state.posts = posts;
  localStorage.setItem('demotrade_posts', JSON.stringify(posts));

  if (!postToSync) return true;

  try {
    const { error } = await supabase.from('web_posts').upsert({
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
    });
    if (error) {
      console.warn('Post save notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Post save notice:', err);
    return false;
  }
}

// Érthető visszajelzés mentés után (sikeres / csak helyben mentett)
function reportSaveResult(ok, successMsg, successTitle) {
  if (ok) {
    return showToast(successMsg, 'success', successTitle);
  }
  return showToast(
    'A bejegyzés ebben a böngészőben elmentődött, de a weboldalra (a közös tárolóba) nem sikerült feltölteni, ezért a látogatók még nem látják. Kérjük, ellenőrizze az internetkapcsolatot, és mentse el újra. Ha a hiba ismétlődik, jelentkezzen ki és be újra, vagy értesítse a weboldal készítőjét.',
    'error',
    'A közzététel nem sikerült'
  );
}

// --- UNIFIED MODAL SYSTEM (Replaces browser alerts, confirms, prompts & toasts) ---
function showModalDialog({
  type = 'success',
  title = null,
  message = '',
  confirmText = 'Rendben',
  cancelText = null,
  showInput = false,
  inputDefault = '',
  inputPlaceholder = ''
}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('app-dialog-backdrop');
    if (existing) existing.remove();

    const defaultTitles = {
      success: 'Sikeres művelet',
      error: 'Figyelmeztetés / Hiba',
      warning: 'Megerősítés szükséges',
      confirm: 'Megerősítés szükséges',
      info: 'Tájékoztatás',
      prompt: 'Adat megadása'
    };

    const icons = {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-triangle-exclamation',
      warning: 'fa-solid fa-circle-exclamation',
      confirm: 'fa-solid fa-circle-question',
      info: 'fa-solid fa-circle-info',
      prompt: 'fa-solid fa-link'
    };

    const resolvedTitle = title || defaultTitles[type] || 'Értesítés';
    const resolvedIcon = icons[type] || icons.info;

    const backdrop = document.createElement('div');
    backdrop.className = 'app-dialog-backdrop';
    backdrop.id = 'app-dialog-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    backdrop.innerHTML = `
      <div class="app-dialog-card">
        <button type="button" class="app-dialog-close-x" id="app-dialog-close-x" aria-label="Bezárás">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="app-dialog-icon type-${type}">
          <i class="${resolvedIcon}"></i>
        </div>
        <h3 class="app-dialog-title">${resolvedTitle}</h3>
        <p class="app-dialog-message">${message}</p>
        ${showInput ? `
          <div class="app-dialog-input-wrap">
            <input type="text" id="app-dialog-input" class="form-control" value="${inputDefault}" placeholder="${inputPlaceholder}" />
          </div>
        ` : ''}
        <div class="app-dialog-actions">
          ${cancelText ? `
            <button type="button" class="btn btn-outline" id="app-dialog-cancel-btn">${cancelText}</button>
          ` : ''}
          <button type="button" class="btn btn-primary" id="app-dialog-confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('is-open'));

    const inputEl = backdrop.querySelector('#app-dialog-input');
    const confirmBtn = backdrop.querySelector('#app-dialog-confirm-btn');
    const cancelBtn = backdrop.querySelector('#app-dialog-cancel-btn');
    const closeXBtn = backdrop.querySelector('#app-dialog-close-x');

    if (inputEl) {
      setTimeout(() => {
        inputEl.focus();
        inputEl.select();
      }, 40);
    } else if (confirmBtn) {
      setTimeout(() => confirmBtn.focus(), 40);
    }

    let closed = false;
    const cleanup = (result) => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey);
      backdrop.classList.remove('is-open');
      setTimeout(() => backdrop.remove(), 220);
      resolve(result);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup(showInput ? null : false);
      } else if (e.key === 'Enter' && showInput) {
        e.preventDefault();
        cleanup(inputEl ? inputEl.value.trim() : '');
      }
    };
    document.addEventListener('keydown', onKey);

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        cleanup(showInput ? (inputEl ? inputEl.value.trim() : '') : true);
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => cleanup(showInput ? null : false));
    }
    if (closeXBtn) {
      closeXBtn.addEventListener('click', () => cleanup(showInput ? null : false));
    }
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        cleanup(showInput ? null : false);
      }
    });
  });
}

function showToast(message, type = 'success', customTitle = null) {
  return showModalDialog({
    type,
    title: customTitle,
    message,
    confirmText: 'Rendben'
  });
}

function showModalConfirm(message, title = 'Megerősítés szükséges') {
  return showModalDialog({
    type: 'confirm',
    title,
    message,
    confirmText: 'Igen, végrehajtás',
    cancelText: 'Mégse'
  });
}

function showModalPrompt(message, defaultValue = 'https://', title = 'Hivatkozás beszúrása') {
  return showModalDialog({
    type: 'prompt',
    title,
    message,
    confirmText: 'Beszúrás',
    cancelText: 'Mégse',
    showInput: true,
    inputDefault: defaultValue,
    inputPlaceholder: 'https://...'
  });
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
      mainContent = renderHomePage(state.posts.filter(p => !p.type || p.type === 'blog'), state.staff);
      break;
    case 'about':
      // Rólunk is on homepage section
      state.activePage = 'home';
      mainContent = renderHomePage(state.posts.filter(p => !p.type || p.type === 'blog'), state.staff);
      break;
    case 'services':
      // Szolgáltatások is on homepage section
      state.activePage = 'home';
      mainContent = renderHomePage(state.posts.filter(p => !p.type || p.type === 'blog'), state.staff);
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
      mainContent = renderContactPage(state.staff);
      break;
    case 'impresszum':
      mainContent = renderImpresszumPage(state.staff);
      break;
    case 'privacy':
    case 'adatkezeles':
      mainContent = renderPrivacyPage();
      break;
    case 'admin':
      mainContent = state.authReady
        ? renderAdminPage(state.posts, state.isLoggedIn, state.editingPostId, state.adminTableFilter, state.staff, state.editingStaffId, state.adminTab, state.adminNewType)
        : '<div class="container" style="padding: 8rem 1.5rem; text-align: center; color: var(--gray-600);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i><p style="margin-top: 1rem; text-align: center;">Betöltés...</p></div>';
      break;
    case 'not-found':
      mainContent = renderNotFoundPage();
      break;
    default:
      mainContent = renderNotFoundPage();
  }

  document.body.style.overflow = '';

  // Megakadályozzuk az ismételt belépési animációkat (villanást) a második rendernél
  if (window._hasRenderedOnce) {
    document.body.classList.add('initial-load-done');
  } else {
    window._hasRenderedOnce = true;
    setTimeout(() => {
      document.body.classList.add('initial-load-done');
    }, 950);
  }

  app.innerHTML = `
    ${renderHeader(state.activePage, state.menuSearchTerm)}
    <main id="main-content">
      ${mainContent}
    </main>
    ${renderFooter()}
    ${renderCookieBanner()}
  `;

  attachEventListeners();
  initScrollObserver();
  initParallaxScroll();
  updatePageSeoMeta();
  updateJobPostingSchema();
}

// Ha nincs aktív álláshirdetés, a JobPosting strukturált adat is kikerül az oldalról,
// hogy a Google ne hirdessen már betöltött / inaktív pozíciót.
let _originalLdJson = null;
function updateJobPostingSchema() {
  const el = document.querySelector('script[type="application/ld+json"]');
  if (!el) return;
  if (_originalLdJson === null) _originalLdJson = el.textContent;
  try {
    const data = JSON.parse(_originalLdJson);
    if (getActiveJobs(state.posts).length === 0 && Array.isArray(data['@graph'])) {
      data['@graph'] = data['@graph'].filter(node => node['@type'] !== 'JobPosting');
    }
    el.textContent = JSON.stringify(data);
  } catch (err) {
    console.warn('JobPosting schema update skipped:', err);
  }
}

function updatePageSeoMeta() {
  const baseUrl = 'https://demotradekft.hu';
  let title = 'Demo-Trade Kft. | Mezőgazdasági Szaktanácsadási Központ - Nyíregyháza, Kisvárda, Tarpa';
  let description = 'Akkreditált Uniós Mezőgazdasági Szaktanácsadási Központ Nyíregyházán, Kisvárdán és Tarpán. 550+ gazdálkodó szakmai támogatása Szabolcs-Szatmár-Bereg, Hajdú-Bihar és Borsod-Abaúj-Zemplén vármegyében: agrárpályázatok, növényvédelem, e-GN gazdálkodási napló, nitrátjelentés, permetezőgép felülvizsgálat és minősített gyümölcsfa oltványok.';
  let canonicalUrl = `${baseUrl}/`;

  if (state.activePage === 'blog') {
    if (state.activePostId) {
      const post = (state.posts || []).find(p => p.id === state.activePostId);
      if (post) {
        title = `${post.title} | Demo-Trade Kft. Szaktanácsadás`;
        description = (post.excerpt || description).replace(/<[^>]*>/g, '').slice(0, 260);
        canonicalUrl = `${baseUrl}/#blog/${post.id}`;
      }
    } else {
      title = 'Agrár Hírek & Növényvédelmi Előrejelzések | Demo-Trade Kft.';
      description = 'Heti növényvédelmi előrejelzések, fagyvédelmi szaktanácsok, agrárpályázati hírek és jogszabályi változások a Demo-Trade Kft. szakértőitől.';
      canonicalUrl = `${baseUrl}/hirek`;
    }
  } else if (state.activePage === 'products' || state.activePage === 'termekek') {
    title = 'Gyümölcsfa Oltványok & Mezőgazdasági Termékek | Demo-Trade Kft.';
    description = 'Vírusmentes, I. osztályú minősített gyümölcsfa oltványok (Gala Must alma, Bigarreau Burlat cseresznye, Čačanska Lepotica szilva, Ceglédi Óriás kajszi) és ültetvénytelepítési szaktanácsadás.';
    canonicalUrl = `${baseUrl}/termekek`;
  } else if (state.activePage === 'career' || state.activePage === 'karrier') {
    title = 'Karrier & Nyitott Pozíciók – Mezőgazdasági Szaktanácsadó | Demo-Trade Kft.';
    description = 'Csatlakozzon a Demo-Trade Kft. akkreditált mezőgazdasági szaktanácsadói és növényorvosi csapatához Nyíregyházán vagy Kisvárdán!';
    canonicalUrl = `${baseUrl}/karrier`;
  } else if (state.activePage === 'contact') {
    title = 'Kapcsolat & Területi Irodák (Nyíregyháza, Kisvárda, Tarpa) | Demo-Trade Kft.';
    description = 'Vegye fel a kapcsolatot a Demo-Trade Kft. nyíregyházi központi, valamint kisvárdai és tarpai területi irodáinak szaktanácsadóival és növényorvosaival!';
    canonicalUrl = `${baseUrl}/kapcsolat`;
  } else if (state.activePage === 'impresszum') {
    title = 'Impresszum & Cégadatok | Demo-Trade Kft.';
    description = 'A Demo-Trade Kft. hivatalos cégadatai, székhelyei (Nyíregyháza, Tarpa), adószáma és szaktanácsadó munkatársainak elérhetőségei.';
    canonicalUrl = `${baseUrl}/impresszum`;
  } else if (state.activePage === 'privacy' || state.activePage === 'adatkezeles') {
    title = 'Adatkezelési Tájékoztató (GDPR) | Demo-Trade Kft.';
    description = 'A Demo-Trade Kft. hivatalos adatkezelési szabályzata és adatvédelmi tájékoztatója.';
    canonicalUrl = `${baseUrl}/adatkezeles`;
  }

  document.title = title;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) descMeta.setAttribute('content', description);
  const canonEl = document.getElementById('canonical-link') || document.querySelector('link[rel="canonical"]');
  if (canonEl) canonEl.setAttribute('href', canonicalUrl);
  const ogTitle = document.getElementById('og-title') || document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  const ogDesc = document.getElementById('og-desc') || document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);
  const ogUrl = document.getElementById('og-url') || document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
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
        if (post.type === 'career' && !isJobActive(post)) return false;
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

  // Bespoke Hand-Drawn Password Eye Toggle buttons
  document.querySelectorAll('.password-eye-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target-input');
      const input = targetId ? document.getElementById(targetId) : null;
      if (!input) return;

      const isNowVisible = input.type === 'password';
      input.type = isNowVisible ? 'text' : 'password';
      btn.classList.toggle('is-visible', isNowVisible);
      btn.innerHTML = renderPasswordEyeSvg(isNowVisible);
      input.focus();
    });
  });

  // Admin belépés (Supabase Auth: e-mail cím + jelszó). A jelszó nincs a kódban, a hitelesítést a szerver végzi.
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('admin-email')?.value || '').trim();
      const pass = document.getElementById('admin-password')?.value || '';
      if (!email) {
        showToast('Kérjük, adja meg a belépéshez használt e-mail címét!', 'error', 'Hiányzó e-mail cím');
        return;
      }
      if (!pass) {
        showToast('Kérjük, írja be a jelszavát a belépéshez!', 'error', 'Hiányzó jelszó');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Belépés...';
      }

      const result = await adminSignIn(email, pass);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }

      if (!result.ok) {
        showToast(result.message, 'error', 'Sikertelen belépés');
        const passField = document.getElementById('admin-password');
        if (passField) {
          passField.value = '';
          passField.focus();
        }
        return;
      }

      state.isLoggedIn = true;
      lastUserActivity = Date.now();
      setPageState('admin', null, true);
      render();
      showToast('Sikeres belépés az Admin Panelre!', 'success', 'Üdvözöljük!');
    });
  }

  // Admin Logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await adminSignOut();
      state.isLoggedIn = false;
      state.editingPostId = null;
      state.editingStaffId = null;
      setPageState('home', null, true);
      render();
      showToast('Sikeresen kijelentkezett.');
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
    // Enter = új <p> bekezdés; a formázás CSS-alapú, így a szövegszín mentés után sem vész el
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      document.execCommand('styleWithCSS', false, true);
    } catch (err) { /* régi böngésző: marad az alapértelmezett */ }

    // Automatikus formázás-egységesítés beillesztéskor (Word, Excel, PDF, Apple Pages, Web)
    editorArea.addEventListener('paste', (e) => {
      e.preventDefault();
      const clipboard = e.clipboardData || window.clipboardData;
      if (!clipboard) return;

      const htmlData = clipboard.getData('text/html');
      const textData = clipboard.getData('text/plain');

      let cleanedHtml = '';
      if (htmlData && htmlData.trim()) {
        cleanedHtml = normalizeRichContentHtml(htmlData);
      } else if (textData && textData.trim()) {
        // Sima szöveg beillesztésekor a bekezdéseket sorkizárt <p> tagekké alakítjuk
        cleanedHtml = textData
          .split(/\r?\n\s*\r?\n/)
          .map(block => block.replace(/\r?\n/g, ' ').trim())
          .filter(Boolean)
          .map(p => `<p style="text-align: justify;">${p}</p>`)
          .join('');
      }

      if (cleanedHtml) {
        document.execCommand('insertHTML', false, cleanedHtml);
      }
    });

    const normalizeBtn = document.getElementById('editor-normalize-btn');
    if (normalizeBtn) {
      normalizeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        editorArea.innerHTML = normalizeRichContentHtml(editorArea.innerHTML);
        showToast(
          'A szöveg és a táblázatok formázása sikeresen egységesítve lett (Montserrat betűtípus, sorkizárt bekezdések, középre igazított táblázatok)!',
          'info',
          'Formázás egységesítve'
        );
      });
    }

    document.querySelectorAll('.editor-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd');
        const val = btn.getAttribute('data-val') || null;

        if (cmd === 'createLink') {
          const sel = window.getSelection();
          const savedRange = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
          const url = await showModalPrompt('Adja meg a beszúrni kívánt hivatkozás (link) teljes URL-jét:', 'https://', 'Hivatkozás beszúrása');
          if (url) {
            editorArea.focus();
            if (savedRange && sel) {
              sel.removeAllRanges();
              sel.addRange(savedRange);
            }
            document.execCommand(cmd, false, url);
          }
        } else if (cmd === 'removeFormat') {
          document.execCommand(cmd, false, val);
          editorArea.innerHTML = normalizeRichContentHtml(editorArea.innerHTML);
          editorArea.focus();
        } else {
          document.execCommand(cmd, false, val);
          editorArea.focus();
        }
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
  const getResolvedCategoryValue = () => {
    const catSelect = document.getElementById('post-category');
    const catCustom = document.getElementById('post-category-custom');
    if (!catSelect) return 'Híreink';
    if (catSelect.value === '__custom__') {
      return (catCustom ? catCustom.value.trim() : '') || 'Általános';
    }
    return catSelect.value.trim() || 'Híreink';
  };

  const catSelectEl = document.getElementById('post-category');
  const catCustomEl = document.getElementById('post-category-custom');
  if (catSelectEl && catCustomEl) {
    catSelectEl.addEventListener('change', () => {
      if (catSelectEl.value === '__custom__') {
        catCustomEl.style.display = 'block';
        catCustomEl.focus();
      } else {
        catCustomEl.style.display = 'none';
      }
    });
  }

  // Admin lapfülek (Tartalmak / Munkatársak)
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-admin-tab');
      if (tab && tab !== state.adminTab) {
        state.adminTab = tab;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Tartalomtípus (Blog / Álláshirdetés / Termék) váltása: az űrlap mindig üresen töltődik újra
  // az új típushoz, így a korábban szerkesztésre megnyitott tartalom nem "ragad" be.
  const postFormEl = document.getElementById('admin-post-form');
  document.querySelectorAll('input[name="post-type"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const type = e.target.value;
      const prevType = (postFormEl && postFormEl.dataset.currentType) || 'blog';
      if (type === prevType) return;

      // Új (nem szerkesztett) tartalomnál csak akkor kérdezünk rá, ha már írtak bele valamit
      if (!state.editingPostId) {
        const typedSomething = Boolean(
          document.getElementById('post-title')?.value.trim() ||
          document.getElementById('post-excerpt')?.value.trim() ||
          (document.getElementById('post-content-editor')?.textContent || '').trim() ||
          (document.getElementById('post-image')?.value || '').startsWith('data:image')
        );
        if (typedSomething) {
          const ok = await showModalConfirm(
            'A típus váltásakor a már beírt szöveg és a kiválasztott kép törlődik, és üres űrlap töltődik be. Folytatja?',
            'Beírt tartalom törlése'
          );
          if (!ok) {
            // vissza az előző típusra
            document.querySelectorAll('input[name="post-type"]').forEach(r => { r.checked = r.value === prevType; });
            document.querySelectorAll('.type-pill').forEach(pill => {
              pill.classList.toggle('active', pill.querySelector('input').value === prevType);
            });
            return;
          }
        }
      }

      state.editingPostId = null;
      state.adminNewType = type;
      render();
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
      content = normalizeRichContentHtml(customPost.content || '');
      if (type === 'career') {
        metaExtra = `${customPost.location || ''} &bull; ${customPost.jobType || ''}`;
      } else if (type === 'product') {
        metaExtra = `${customPost.price || ''} &bull; ${customPost.badge || ''}`;
      }
    } else {
      title = document.getElementById('post-title')?.value.trim() || 'Cím nélküli tartalom';
      type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';
      category = getResolvedCategoryValue() || 'Kategória';
      author = document.getElementById('post-author')?.value.trim() || 'Moravszki Gábor';
      image = document.getElementById('post-image')?.value.trim() || (type === 'product' ? '/images/gyumolcsfa_oltvanyok.jpg' : (type === 'career' ? '/images/karrier_csapat.jpg' : '/images/hero.png'));
      excerpt = document.getElementById('post-excerpt')?.value.trim() || '';
      const rawContent = editorArea ? editorArea.innerHTML.trim() : document.getElementById('post-content')?.value.trim();
      content = normalizeRichContentHtml(rawContent);

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

  // Facebook Post Interactivity & Live Preview
  const fbCheckbox = document.getElementById('fb-publish-checkbox');
  const fbOptionsPanel = document.getElementById('fb-options-panel');
  const fbTextarea = document.getElementById('fb-custom-message');
  const fbCounter = document.getElementById('fb-char-counter');
  const fbAutoBtn = document.getElementById('fb-auto-generate-btn');
  const fbManualShareBtn = document.getElementById('fb-manual-share-btn');
  const fbPreviewMsg = document.getElementById('fb-preview-message-body');
  const fbPreviewImg = document.getElementById('fb-preview-img');
  const fbPreviewLinkTitle = document.getElementById('fb-preview-link-title');
  const fbPreviewLinkDesc = document.getElementById('fb-preview-link-desc');

  const generateFacebookTemplate = () => {
    const type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';
    const title = document.getElementById('post-title')?.value.trim() || 'Új Hirdetés';
    const category = getResolvedCategoryValue() || 'Híreink';
    const excerpt = document.getElementById('post-excerpt')?.value.trim() || '';
    const price = document.getElementById('prod-price')?.value.trim();
    const loc = document.getElementById('job-location')?.value.trim();
    const jobType = document.getElementById('job-type-field')?.value.trim();

    let text = '';
    if (type === 'product') {
      text = `🌱 ÚJ TERMÉK AJÁNLATUNK | DEMO-TRADE KFT.\n\n` +
        `Megnevezés: ${title}\n` +
        `Kategória: ${category}\n` +
        (price ? `💰 Ár / Feltételek: ${price}\n` : '') +
        (excerpt ? `\n📌 ${excerpt}\n` : '') +
        `\n👉 Részletek és megrendelés a weboldalunkon!\n` +
        `📞 Érdeklődjön szakértőinknél: +36 30 346 2848 | demo.trade.mg@gmail.com\n\n` +
        `#demotrade #mezogazdasag #gyumolcstermesztes #oltvany #novenyvedelem`;
    } else if (type === 'career') {
      text = `💼 ÁLLÁSLEHETŐSÉG A DEMO-TRADE CSAPATÁBAN!\n\n` +
        `Nyitott pozíció: ${title}\n` +
        (loc ? `📍 Munkavégzés helye: ${loc}\n` : '') +
        (jobType ? `⏱ Munkaidő: ${jobType}\n` : '') +
        (excerpt ? `\n📌 ${excerpt}\n` : '') +
        `\n👉 Jelentkezzen közvetlenül weboldalunkon önéletrajz feltöltésével!\n` +
        `📞 Kapcsolat: +36 30 346 2848 | demo.trade.mg@gmail.com\n\n` +
        `#allas #karrier #mezogazdasag #demotrade #nyiregyhaza`;
    } else {
      text = `📢 HÍREK & SZAKMAI TÁJÉKOZTATÓ | DEMO-TRADE KFT.\n\n` +
        `${title}\n` +
        `Téma: ${category}\n` +
        (excerpt ? `\n${excerpt}\n` : '') +
        `\n👉 Olvassa el a teljes szakmai összefoglalót weboldalunkon!\n` +
        `#demotrade #mezogazdasag #szaktanacsadas #hirek`;
    }
    return text;
  };

  const updateFacebookPreviewCard = () => {
    const title = document.getElementById('post-title')?.value.trim() || 'Hirdetés megnevezése';
    const excerpt = document.getElementById('post-excerpt')?.value.trim() || 'Kattintson a részletekért!';
    const type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';
    const currentImg = document.getElementById('post-image')?.value.trim() || (type === 'product' ? '/images/gyumolcsfa_oltvanyok.jpg' : (type === 'career' ? '/images/karrier_csapat.jpg' : '/images/hero.png'));

    if (fbPreviewMsg && fbTextarea) {
      fbPreviewMsg.textContent = fbTextarea.value || 'Írjon bejegyzést...';
    }
    if (fbPreviewImg) {
      fbPreviewImg.src = currentImg;
    }
    if (fbPreviewLinkTitle) {
      fbPreviewLinkTitle.textContent = title;
    }
    if (fbPreviewLinkDesc) {
      fbPreviewLinkDesc.textContent = excerpt;
    }
    if (fbCounter && fbTextarea) {
      fbCounter.textContent = `${fbTextarea.value.length} karakter`;
    }
  };

  if (fbCheckbox && fbOptionsPanel) {
    fbCheckbox.addEventListener('change', () => {
      if (fbCheckbox.checked) {
        fbOptionsPanel.style.display = 'block';
        if (fbTextarea && (!fbTextarea.value || fbTextarea.value.trim() === '')) {
          fbTextarea.value = generateFacebookTemplate();
        }
        updateFacebookPreviewCard();
      } else {
        fbOptionsPanel.style.display = 'none';
      }
    });
  }

  if (fbAutoBtn && fbTextarea) {
    fbAutoBtn.addEventListener('click', () => {
      fbTextarea.value = generateFacebookTemplate();
      updateFacebookPreviewCard();
      showToast('Facebook sablon frissítve az űrlap adataiból!', 'info');
    });
  }

  if (fbTextarea) {
    fbTextarea.addEventListener('input', updateFacebookPreviewCard);
  }

  // Update image preview on file input changes
  const postImgInput = document.getElementById('post-image');
  if (postImgInput && fbPreviewImg) {
    // Whenever post image preview updates
    const origPreviewObserver = new MutationObserver(() => {
      if (postImgInput.value) fbPreviewImg.src = postImgInput.value;
    });
    origPreviewObserver.observe(postImgInput, { attributes: true, attributeFilter: ['value'] });
  }

  // Manual fallback Facebook Share Dialog
  if (fbManualShareBtn) {
    fbManualShareBtn.addEventListener('click', () => {
      const shareUrl = encodeURIComponent(window.location.origin + '/');
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, 'fb-share-dialog', 'width=626,height=436');
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
      const category = getResolvedCategoryValue();
      const author = document.getElementById('post-author')?.value.trim() || 'Moravszki Gábor';
      let image = document.getElementById('post-image')?.value.trim() || (type === 'product' ? '/images/gyumolcsfa_oltvanyok.jpg' : (type === 'career' ? '/images/karrier_csapat.jpg' : '/images/hero.png'));
      const excerpt = document.getElementById('post-excerpt')?.value.trim();
      const rawContent = editorArea ? editorArea.innerHTML.trim() : document.getElementById('post-content')?.value.trim();
      const content = normalizeRichContentHtml(rawContent);
      const date = new Date().toLocaleDateString('hu-HU');

      // Type-specific extras
      const location = document.getElementById('job-location')?.value.trim();
      const jobType = document.getElementById('job-type-field')?.value.trim();
      const deadline = document.getElementById('job-deadline')?.value.trim();
      const price = document.getElementById('prod-price')?.value.trim();
      const badge = type === 'career'
        ? (document.getElementById('job-active-checkbox')?.checked === false ? JOB_INACTIVE_MARK : JOB_ACTIVE_MARK)
        : document.getElementById('prod-badge')?.value.trim();

      if (!title) {
        showToast('Kérjük, adja meg a bejegyzés címét / megnevezését!', 'error', 'Hiányzó cím');
        return;
      }

      if (!excerpt) {
        showToast('Kérjük, adja meg a rövid kivonatot (1–2 mondatos összefoglalót)!', 'error', 'Hiányzó kivonat');
        return;
      }

      if (!content || content === '<br>') {
        showToast('Kérjük, adja meg a részletes szöveges leírást!', 'error', 'Hiányzó leírás');
        return;
      }

      // Új kép: a bejelentkezett admin saját jogával töltjük fel közvetlenül a Supabase tárolóba
      // (nincs külön "feltöltő végpont" és nincs titkos kulcs a kódban).
      if (image && image.startsWith('data:image')) {
        showToast('Kép feltöltése folyamatban...', 'info');
        try {
          const imgBlob = await (await fetch(image)).blob();
          const imgExt = imgBlob.type.includes('png') ? 'png' : (imgBlob.type.includes('webp') ? 'webp' : 'jpg');
          const imgFolder = type === 'product' ? 'termekek' : (type === 'career' ? 'karrier' : 'blog');
          const imgName = normalizeStr(title || 'post-image').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 40) || 'upload';
          const storagePath = imgFolder + '/' + Date.now() + '-' + imgName + '.' + imgExt;

          const { error: upErr } = await supabase.storage
            .from('webpage-images')
            .upload(storagePath, imgBlob, { contentType: imgBlob.type || 'image/jpeg', upsert: false });
          if (upErr) throw upErr;

          image = supabase.storage.from('webpage-images').getPublicUrl(storagePath).data.publicUrl;
        } catch (upErr) {
          console.warn('Kép feltöltési figyelmeztetés (a kép a bejegyzésben helyben marad):', upErr);
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
        const savedOk = await savePosts(updatedPosts, savedPostObj);
        reportSaveResult(savedOk, 'A módosítások mentve lettek, a változás megjelent a weboldalon.', 'Mentve');
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
        const savedOk = await savePosts([savedPostObj, ...state.posts], savedPostObj);
        reportSaveResult(savedOk, 'Az új bejegyzés sikeresen közzétéve a weboldalon.', 'Közzétéve');
      }

      // Facebook Poszt közzététele a háttérben, ha be volt pipálva
      const shouldPublishToFb = document.getElementById('fb-publish-checkbox')?.checked;
      const fbMessageText = document.getElementById('fb-custom-message')?.value?.trim();

      if (shouldPublishToFb && fbMessageText) {
        showToast('Facebook poszt közzététele a Demo-Trade Kft. oldalon...', 'info');
        try {
          // Ha lokális kép relatív útvonal (pl. /images/hero.png), abszolút URL-re konvertáljuk
          let fbImageUrl = image;
          if (fbImageUrl && fbImageUrl.startsWith('/')) {
            fbImageUrl = window.location.origin + fbImageUrl;
          }

          const adminToken = await getAdminAccessToken();
          const fbRes = await fetch('/api/facebook-post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + (adminToken || '')
            },
            body: JSON.stringify({
              message: fbMessageText,
              imageUrl: fbImageUrl,
              linkUrl: window.location.origin + (type === 'product' ? '/termekek' : (type === 'career' ? '/karrier' : '/hirek'))
            })
          });

          const fbResult = await fbRes.json();
          if (fbResult.success) {
            showToast('Facebook poszt sikeresen közzétéve!', 'success');
            if (fbResult.isSimulated) {
              console.log('Facebook szimulált válasz:', fbResult);
            }
          } else {
            showToast('Facebook hiba: ' + (fbResult.message || 'Sikertelen posztolás'), 'error');
          }
        } catch (fbErr) {
          console.error('Facebook posting fetch error:', fbErr);
          showToast('Nem sikerült kapcsolatot létesíteni a Facebookkal. A bejegyzés a weboldalon megjelent, a Facebook-posztot kérjük kézzel tegye közzé.', 'error');
        }
      }

      state.editingPostId = null;
      state.adminNewType = type;
      render();
    });
  }

  // Admin Edit button
  document.querySelectorAll('.toggle-job-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const job = state.posts.find(p => p.id === id);
      if (!job) return;
      const nowActive = isJobActive(job);
      const updatedJob = { ...job, badge: nowActive ? JOB_INACTIVE_MARK : JOB_ACTIVE_MARK };
      savePosts(state.posts.map(p => (p.id === id ? updatedJob : p)), updatedJob);
      render();
      showToast(
        nowActive
          ? 'A hirdetés inaktív lett: a Karrier oldalon most a „Jelenleg nincs szabad pozíciónk” felirat látszik. A szöveg megmaradt, bármikor újra aktiválható.'
          : 'A hirdetés újra aktív, megjelent a Karrier oldalon.',
        'success',
        nowActive ? 'Hirdetés inaktiválva' : 'Hirdetés aktiválva'
      );
    });
  });

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
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const confirmed = await showModalConfirm(
        'Biztosan véglegesen törölni szeretné ezt a bejegyzést a rendszerből?',
        'Bejegyzés törlése'
      );
      if (confirmed) {
        const filtered = state.posts.filter(p => p.id !== id);
        await savePosts(filtered);

        // Törlés a közös tárolóból is
        let removedOnline = true;
        try {
          const { error } = await supabase.from('web_posts').delete().eq('id', id);
          if (error) {
            console.warn('Post delete notice:', error.message);
            removedOnline = false;
          }
        } catch (err) {
          console.warn('Post delete notice:', err);
          removedOnline = false;
        }

        if (state.editingPostId === id) state.editingPostId = null;
        render();
        if (removedOnline) {
          showToast('A kiválasztott bejegyzés törölve lett.', 'success', 'Törölve');
        } else {
          showToast('A bejegyzés ebben a böngészőben törlődött, de a weboldalról nem sikerült eltávolítani, ezért a látogatók még láthatják. Kérjük, próbálja újra, vagy értesítse a weboldal készítőjét.', 'error', 'A törlés nem sikerült');
        }
      }
    });
  });

  // ==========================================
  // ADMIN: MUNKATÁRSAK KEZELÉSE
  // ==========================================
  const persistStaff = async (list, successMsg, successTitle) => {
    const ok = await saveStaff(list);
    state.editingStaffId = null;
    render();
    if (ok) {
      showToast(successMsg, 'success', successTitle);
    } else {
      showToast(
        'A változtatás ebben a böngészőben elmentődött, de a weboldalra (a közös tárolóba) még nem sikerült feltölteni, ezért a látogatók és más gépek még nem látják. Kérjük, értesítse a weboldal készítőjét.',
        'warning',
        'Mentés csak helyben történt'
      );
    }
  };

  const staffForm = document.getElementById('admin-staff-form');
  if (staffForm) {
    staffForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('staff-id')?.value;
      const office = document.getElementById('staff-office')?.value || 'nyiregyhaza';
      const name = sanitizeStaffText(document.getElementById('staff-name')?.value);
      const role = sanitizeStaffText(document.getElementById('staff-role')?.value);
      const phone = sanitizeStaffText(document.getElementById('staff-phone')?.value);

      if (!name) {
        showToast('Kérjük, adja meg a munkatárs nevét!', 'error', 'Hiányzó név');
        return;
      }
      if (!role) {
        showToast('Kérjük, adja meg a munkatárs beosztását!', 'error', 'Hiányzó beosztás');
        return;
      }
      if (!phone || phone.replace(/\D/g, '').length < 8) {
        showToast('Kérjük, adjon meg érvényes telefonszámot (pl. +36 30 123 4567)!', 'error', 'Hibás telefonszám');
        return;
      }

      let updated;
      if (id) {
        updated = state.staff.map(s => (s.id === id ? { ...s, office, name, role, phone } : s));
        await persistStaff(updated, `${name} adatai sikeresen frissítve lettek.`, 'Munkatárs frissítve');
      } else {
        updated = [...state.staff, { id: 'staff-' + Date.now(), office, name, role, phone }];
        await persistStaff(updated, `${name} sikeresen felvéve az irodához.`, 'Munkatárs hozzáadva');
      }
    });
  }

  document.querySelectorAll('.edit-staff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingStaffId = btn.getAttribute('data-id');
      render();
      const form = document.getElementById('admin-staff-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  const cancelStaffEditBtn = document.getElementById('cancel-staff-edit-btn');
  if (cancelStaffEditBtn) {
    cancelStaffEditBtn.addEventListener('click', () => {
      state.editingStaffId = null;
      render();
    });
  }

  document.querySelectorAll('.delete-staff-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const person = state.staff.find(s => s.id === id);
      if (!person) return;
      const confirmed = await showModalConfirm(
        `Biztosan eltávolítja <strong>${person.name}</strong> munkatársat a névsorból? A weboldalon azonnal eltűnik.`,
        'Munkatárs törlése'
      );
      if (confirmed) {
        const updated = state.staff.filter(s => s.id !== id);
        await persistStaff(updated, `${person.name} eltávolítva a névsorból.`, 'Munkatárs törölve');
      }
    });
  });

  document.querySelectorAll('.move-staff-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      const id = btn.getAttribute('data-id');
      const dir = btn.getAttribute('data-dir');
      const list = [...state.staff];
      const idx = list.findIndex(s => s.id === id);
      if (idx < 0) return;
      const office = list[idx].office;
      const step = dir === 'up' ? -1 : 1;
      let j = idx + step;
      while (j >= 0 && j < list.length && list[j].office !== office) j += step;
      if (j < 0 || j >= list.length) return;
      [list[idx], list[j]] = [list[j], list[idx]];
      state.staff = list;
      localStorage.setItem('demotrade_staff', JSON.stringify(list));
      render();
      saveStaff(list);
    });
  });

}

// --- AUTOMATIKUS KIJELENTKEZÉS TÉTLENSÉG ESETÉN (10 perc) ---
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 perc tétlenség
let lastUserActivity = Date.now();
let lastActivityResetThrottle = 0;
let inactivityIntervalId = null;

function recordUserActivity() {
  const now = Date.now();
  if (now - lastActivityResetThrottle > 1000) {
    lastActivityResetThrottle = now;
    lastUserActivity = now;
  }
}

async function handleAutoLogout() {
  if (!state.isLoggedIn) return;
  await adminSignOut();
  state.isLoggedIn = false;
  state.editingPostId = null;
  state.editingStaffId = null;
  if (state.activePage === 'admin') {
    render();
  }
  showToast(
    'Biztonsági okokból 10 perc tétlenség után a rendszer automatikusan kijelentkeztette.',
    'info',
    'Automatikus kijelentkezés'
  );
}

function checkInactivity() {
  if (state.isLoggedIn && (Date.now() - lastUserActivity >= INACTIVITY_TIMEOUT_MS)) {
    handleAutoLogout();
  }
}

function initInactivityWatcher() {
  const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'input'];
  activityEvents.forEach((evt) => {
    window.addEventListener(evt, recordUserActivity, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkInactivity();
    }
  });

  if (!inactivityIntervalId) {
    inactivityIntervalId = setInterval(checkInactivity, 10000); // 10 másodpercenként ellenőrzi
  }
}

// --- ADMIN BEJELENTKEZÉS ÁLLAPOTÁNAK BETÖLTÉSE (Supabase Auth) ---
// A megjelenítést vezérli; a valódi védelmet az adatbázis jogosultságai (RLS) adják.
async function initAdminAuth() {
  const adminUser = await getAdminSession();
  state.isLoggedIn = Boolean(adminUser);
  if (state.isLoggedIn) {
    lastUserActivity = Date.now();
  }
  state.authReady = true;
  if (state.activePage === 'admin') render();

  supabase.auth.onAuthStateChange((event, session) => {
    const nowAdmin = isAdminUser(session && session.user);
    if (nowAdmin !== state.isLoggedIn) {
      state.isLoggedIn = nowAdmin;
      if (nowAdmin) {
        lastUserActivity = Date.now();
      }
      if (state.activePage === 'admin') render();
    }
  });
}

// Initial render
initHistoryState();
render();
syncPostsFromSupabase();
syncStaffFromSupabase();
initAdminAuth();
initInactivityWatcher();
