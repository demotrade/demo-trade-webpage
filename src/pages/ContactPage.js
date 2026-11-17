import { INITIAL_STAFF, OFFICES_META } from '../data/initialStaff.js';

export function renderContactSection(staffList = INITIAL_STAFF) {
  const activeStaff = Array.isArray(staffList) && staffList.length > 0 ? staffList : INITIAL_STAFF;

  return `
    <section class="section contact-section reveal-on-scroll fade-in-up" id="kapcsolat" style="background: #ffffff; padding: 5rem 0;">
      <div class="container">
        <div class="section-title">
          <span class="subtitle">KAPCSOLAT</span>
          <h2>LÉPJEN KAPCSOLATBA KÖZPONTUNKKAL!</h2>
          <p>Kérdése van, vagy szaktanácsadásra lenne szüksége? Töltse ki az alábbi űrlapot, vagy keresse közvetlenül vezetőségünket!</p>
        </div>

        <div class="contact-grid">
          <!-- CONTACT INFO -->
          <div class="contact-info-card" style="text-align: center; padding: 3.5rem 2.5rem; display: flex; flex-direction: column; justify-content: space-around;">

            <!-- LOGO (Glassmorphic card with lap_logo.png) -->
            <div style="display: flex; justify-content: center; margin-bottom: 2.5rem;">
              <div class="contact-glass-logo-card">
                <img src="/images/lap_logo.png" alt="Demo-Trade Kft." style="width: 100%; max-width: 380px; height: auto;" />
              </div>
            </div>

            <div class="contact-info-item" style="justify-content: center; text-align: left; margin-bottom: 2rem;">
              <div class="contact-info-icon"><i class="fa-solid fa-envelope"></i></div>
              <div class="contact-info-text">
                <h4>E-mail címünk:</h4>
                <p><a href="mailto:demotradekft@gmail.com" style="color: #5ce685; font-weight: 700; font-size: 1.05rem;">demotradekft@gmail.com</a></p>
              </div>
            </div>

            <!-- KEY CONTACT 1 -->
            <div class="contact-info-item" style="justify-content: center; text-align: left; margin-bottom: 2rem;">
              <div class="contact-info-icon"><i class="fa-solid fa-user-tie"></i></div>
              <div class="contact-info-text">
                <h4 style="font-size: 1.15rem;">Moravszki Gábor</h4>
                <p style="font-size: 0.9rem; color: var(--gray-300); margin-bottom: 0.3rem;">ügyvezető igazgató, növényorvos</p>
                <p><a href="tel:+36303462848" style="color: #5ce685; font-weight: 700; font-size: 1.05rem;">+36 30 346 2848</a></p>
              </div>
            </div>

            <!-- KEY CONTACT 2 -->
            <div class="contact-info-item" style="justify-content: center; text-align: left; margin-bottom: 2rem;">
              <div class="contact-info-icon"><i class="fa-solid fa-user-gear"></i></div>
              <div class="contact-info-text">
                <h4 style="font-size: 1.15rem;">Sápi Imre</h4>
                <p style="font-size: 0.9rem; color: var(--gray-300); margin-bottom: 0.3rem;">irodavezető, szaktanácsadó</p>
                <p><a href="tel:+36305597376" style="color: #5ce685; font-weight: 700; font-size: 1.05rem;">+36 30 559 7376</a></p>
              </div>
            </div>

            <!-- FACEBOOK LINK BUTTON -->
            <div style="margin-top: 1rem;">
              <a href="https://www.facebook.com/demotradekft" target="_blank" rel="noopener" class="facebook-link-btn" style="padding: 0.85rem 1.8rem; font-size: 1rem;">
                <i class="fa-brands fa-facebook"></i> Kövess minket Facebookon!
              </a>
            </div>
          </div>


          <!-- FORM -->
          <div class="admin-card" style="position: relative;">
            <h3 style="font-size: 1.6rem; margin-bottom: 0.5rem; text-transform: uppercase;">Üzenetküldés</h3>
            <p style="color: var(--gray-600); font-size: 0.95rem; margin-bottom: 1.5rem;">Írja meg érdeklődését és közvetlenül továbbítjuk szakértő munkatársunknak!</p>
            
            <form id="contact-form" novalidate>
              <div class="form-group">
                <label for="contact-name">Név *</label>
                <input type="text" id="contact-name" class="form-control" placeholder="Az Ön teljes neve" required />
              </div>

              <div class="form-grid-2col">
                <div class="form-group">
                  <label for="contact-email">E-mail cím *</label>
                  <input type="email" id="contact-email" class="form-control" placeholder="minta@domain.hu" required />
                </div>
                <div class="form-group">
                  <label for="contact-phone">Telefonszám</label>
                  <input type="tel" id="contact-phone" class="form-control" placeholder="36 30 123 4567" />
                </div>
              </div>

              <div class="form-group">
                <label for="contact-subject">Téma / Szolgáltatás</label>
                <select id="contact-subject" class="form-control">
                  <option value="Általános érdeklődés">Általános érdeklődés</option>
                  <option value="Mezőgazdasági szaktanácsadás">Mezőgazdasági szaktanácsadás</option>
                  <option value="Növényvédelmi tanácsadás">Növényvédelmi tanácsadás</option>
                  <option value="Mezőgazdasági jellegű pályázatok">Mezőgazdasági jellegű pályázatok</option>
                  <option value="Permetezőgépek műszaki felülvizsgálata">Permetezőgépek műszaki felülvizsgálata</option>
                </select>
              </div>

              <div class="form-group">
                <label for="contact-message">Üzenet *</label>
                <textarea id="contact-message" class="form-control" placeholder="Írja meg üzenetét részletesen..." required></textarea>
              </div>

              <!-- LÁTHATATLAN HONEYPOT MEZŐ SPAM ROBOTOK ELLEN (CSS-el és ARIA-val elrejtve) -->
              <div class="security-hp-field" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;" aria-hidden="true">
                <label for="contact-hp-website">Kérjük, hagyja üresen ezt a mezőt:</label>
                <input type="text" id="contact-hp-website" name="company_website_hp" tabindex="-1" autocomplete="off" />
                <input type="hidden" id="contact-form-rendered-time" value="${Date.now()}" />
              </div>

              <!-- ADATKEZELÉSI HOZZÁJÁRULÁS CHECKBOX -->
              <div class="form-group" style="margin-top: 1.2rem; margin-bottom: 1.5rem;">
                <label class="custom-checkbox-container" style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; font-size: 0.9rem; color: var(--gray-700); line-height: 1.5;">
                  <input type="checkbox" id="contact-privacy-consent" required style="margin-top: 0.2rem; width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;" />
                  <span>
                    Elolvastam és elfogadom az <a href="#" data-page="privacy" style="color: var(--primary); text-decoration: underline; font-weight: 700;">Adatkezelési tájékoztatót</a>, és hozzájárulok a megadott személyes adataim kapcsolatfelvételi célú kezeléséhez. *
                  </span>
                </label>
              </div>

              <button type="submit" class="btn btn-primary" id="contact-submit-btn" style="width: 100%; font-size: 1.05rem;">
                <i class="fa-solid fa-paper-plane"></i> Üzenet küldése
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- MUNKATÁRSAINK, ELÉRHETŐSÉGEINK SZEKCIÓ -->
    <section class="section team-section reveal-on-scroll fade-in-up" id="munkatarsak" style="background: #f8fafc; padding: 5rem 0; border-top: 1px solid #e2e8f0;">
      <div class="container">
        <div class="section-title">
          <span class="subtitle">CSAPATUNK</span>
          <h2>MUNKATÁRSAINK, ELÉRHETŐSÉGEINK</h2>
          <p>Keresse bizalommal területi irodáink szakképzett munkatársait az alábbi elérhetőségeken!</p>
        </div>

        <div class="offices-grid">
          ${OFFICES_META.map(office => {
            const members = activeStaff.filter(m => m.office === office.id);
            return `
              <div class="office-card reveal-on-scroll ${office.animClass}">
                <div class="office-header">
                  <div>
                    <h3>${office.title}</h3>
                    <span class="office-tag">${office.tag}</span>
                  </div>
                </div>

                <div class="staff-list">
                  ${members.length === 0 ? `
                    <p style="color: var(--gray-500); font-size: 0.9rem; text-align: center !important; padding: 1rem 0;">
                      Jelenleg nincs rögzített munkatárs ebben az irodában.
                    </p>
                  ` : members.map(person => {
                    const cleanTel = (person.phone || '').replace(/[^\d+]/g, '');
                    return `
                      <div class="staff-card">
                        <div class="staff-details">
                          <h4>${person.name}</h4>
                          <p class="staff-role">${person.role}</p>
                          ${person.phone ? `
                            <a href="tel:${cleanTel}" class="staff-phone"><i class="fa-solid fa-phone"></i> ${person.phone}</a>
                          ` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;
}

export function renderContactPage(staffList = INITIAL_STAFF) {
  return renderContactSection(staffList);
}
