export function renderCareerPage(posts) {
  const careerPosts = posts.filter(p => p.type === 'career');
  const todayStr = new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '');

  return `
    <div class="career-page-wrapper">
      <!-- HERO BANNER -->
      <header class="career-hero-banner">
        <div class="container">
          <div class="career-hero-content">
            <div class="career-hero-badge">
              <i class="fa-solid fa-briefcase"></i> Karrier a Demo-Trade Kft.-nél
            </div>
            <h1 class="career-hero-title">Csatlakozzon Szakértői Csapatunkhoz!</h1>
            <p class="career-hero-subtitle" style="text-align: center;">
              Akkreditált szaktanácsadási központként több mint 550 kelet-magyarországi gazdálkodó partnerünk sikeréért dolgozunk.
              Építsen nálunk hosszú távú, elismert agrár karriert a legújabb technológiák és szakmai támogatás mellett!
            </p>
          </div>
        </div>
      </header>

      <!-- WHY WORK WITH US HIGHLIGHTS -->
      <section class="career-benefits-section">
        <div class="container">
          <div class="section-title text-center" style="margin-bottom: 2.5rem;">
            <span class="subtitle">Miért a Demo-Trade Kft.?</span>
            <h2>Értékek, Amelyeket Kínálunk</h2>
          </div>

          <div class="career-benefits-grid">
            <div class="benefit-card">
              <div class="benefit-header">
                <div class="benefit-icon">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <h4>Folyamatos Szakmai Fejlődés</h4>
              </div>
              <p>Rendszeres szakmai konferenciák, kamarai továbbképzések és naprakész jogszabályi műhelymunka az akkreditált szervezet védőszárnya alatt.</p>
            </div>

            <div class="benefit-card">
              <div class="benefit-header">
                <div class="benefit-icon">
                  <i class="fa-solid fa-microscope"></i>
                </div>
                <h4>Korszerű Labor &amp; Eszközök</h4>
              </div>
              <p>Saját növényvédelmi biolaboratórium, térségi meteorológiai hálózat és mobil permetezővizsga-állomás biztosítja a hatékony terepi munkát.</p>
            </div>

            <div class="benefit-card">
              <div class="benefit-header">
                <div class="benefit-icon">
                  <i class="fa-solid fa-car-side"></i>
                </div>
                <h4>Prémium Munkaeszközök</h4>
              </div>
              <p>Megbízható céges gépjármű a terepi feladatokhoz, korszerű laptop, okostelefon és modern szoftveres munkakörnyezet.</p>
            </div>

            <div class="benefit-card">
              <div class="benefit-header">
                <div class="benefit-icon">
                  <i class="fa-solid fa-handshake-angle"></i>
                </div>
                <h4>Támogató, Összetartó Csapat</h4>
              </div>
              <p>Családias és tiszteletteljes légkör, ahol a több évtizedes szaktudás és a fiatalos dinamizmus kéz a kézben segíti a mindennapokat.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- OPEN POSITIONS LIST -->
      <section class="career-positions-section" id="nyitott-poziciok">
        <div class="container">
          <div class="section-title" style="margin-bottom: 2rem;">
            <span class="subtitle">Aktuális Lehetőségek</span>
            <h2>Nyitott Pozícióink (${careerPosts.length})</h2>
          </div>

          ${careerPosts.length === 0 ? `
            <div class="career-empty-card">
              <div class="career-empty-icon">
                <i class="fa-solid fa-user-check"></i>
              </div>
              <h3>Jelenleg nincs konkrét meghirdetett pozíciónk</h3>
              <p>
                Ennek ellenére folyamatosan várjuk tehetséges, elhivatott agrármérnökök, növényorvosok és agrár-adminisztrációs szakemberek jelentkezését.
                Küldje el önéletrajzát nyitott adatbázisunkba, és új lehetőség nyílásakor azonnal felvesszük Önnel a kapcsolatot!
              </p>
              <a href="#karrier-jelentkezes" class="btn btn-primary" style="margin-top: 1rem;">
                <i class="fa-solid fa-file-arrow-up"></i> Jelentkezés adatbázisunkba
              </a>
            </div>
          ` : `
            <div class="career-cards-list">
              ${careerPosts.map(job => `
                <div class="career-card" id="job-${job.id}">
                  <div class="career-card-top">
                    <div class="career-card-header-left">
                      <div class="career-tags-row">
                        <span class="career-badge"><i class="fa-solid fa-briefcase"></i> ${job.category || 'Állás'}</span>
                        ${job.jobType ? `<span class="career-meta-pill"><i class="fa-regular fa-clock"></i> ${job.jobType}</span>` : ''}
                        ${job.location ? `<span class="career-meta-pill"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>` : ''}
                      </div>
                      <h3 class="career-job-title">${job.title}</h3>
                    </div>

                    <div class="career-card-header-right">
                      <button class="btn btn-primary apply-to-job-btn" data-job-id="${job.id}" data-job-title="${job.title}">
                        <i class="fa-solid fa-paper-plane"></i> Jelentkezés
                      </button>
                    </div>
                  </div>

                  <p class="career-card-excerpt">${job.excerpt}</p>

                  <div class="career-card-visual-row">
                    ${job.image ? `
                      <div class="career-poster-box">
                        <img src="${job.image}" alt="${job.title}" class="career-poster-img" />
                      </div>
                    ` : ''}
                    <div class="career-job-details">
                      <div class="career-content-render">
                        ${job.content}
                      </div>
                    </div>
                  </div>

                  <div class="career-card-footer">
                    <div class="career-meta-date">
                      <i class="fa-regular fa-calendar"></i> Meghirdetve: ${todayStr} &bull; ${job.author || 'DEMO-TRADE Kft.'}
                    </div>
                    <button class="btn btn-primary apply-to-job-btn" data-job-id="${job.id}" data-job-title="${job.title}">
                      <i class="fa-solid fa-paper-plane"></i> Jelentkezés az állásra <i class="fa-solid fa-arrow-down" style="margin-left: 4px;"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </section>

      <!-- APPLICATION FORM -->
      <section class="career-form-section" id="karrier-jelentkezes">
        <div class="container" style="max-width: 860px;">
          <div class="career-form-card">
            <div class="career-form-header">
              <div class="career-form-header-top">
                <div class="career-form-icon">
                  <i class="fa-solid fa-file-pen"></i>
                </div>
                <h2>Jelentkezési Űrlap</h2>
              </div>
              <p class="career-form-subtitle">Töltse ki az alábbi űrlapot és csatolja fényképes szakmai önéletrajzát (PDF vagy Word formátumban)!</p>
            </div>

            <form id="career-application-form">
              <!-- Hidden Anti-Bot Honeypot -->
              <div style="display: none !important;" aria-hidden="true">
                <input type="text" id="career-hp-fax" name="hp_fax" tabindex="-1" autocomplete="off" />
                <input type="hidden" id="career-form-rendered-time" value="${Date.now()}" />
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="career-name" class="form-label">Teljes Név <span class="required">*</span></label>
                  <input type="text" id="career-name" class="form-control" placeholder="Pl. Kovács Péter" required />
                </div>

                <div class="form-group">
                  <label for="career-email" class="form-label">E-mail Cím <span class="required">*</span></label>
                  <input type="email" id="career-email" class="form-control" placeholder="kovacs.peter@email.hu" required />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="career-phone" class="form-label">Telefonszám <span class="required">*</span></label>
                  <input type="tel" id="career-phone" class="form-control" placeholder="+36 30 123 4567" required />
                </div>

                <div class="form-group">
                  <label for="career-position" class="form-label">Megpályázott Pozíció <span class="required">*</span></label>
                  <select id="career-position" class="form-control" required>
                    ${careerPosts.length > 0 ? careerPosts.map(j => `
                      <option value="${j.title}">${j.title}</option>
                    `).join('') : ''}
                    <option value="Általános jelentkezés / Szakmai adatbázis" ${careerPosts.length === 0 ? 'selected' : ''}>
                      Általános jelentkezés / Szakmai adatbázisba
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="career-message" class="form-label">Rövid Bemutatkozás / Motivációs Üzenet <span class="required">*</span></label>
                <textarea id="career-message" class="form-control" rows="4" placeholder="Kérjük írja le röviden szakmai tapasztalatát, erősségeit és hogy miért szeretne a Demo-Trade Kft. csapatához tartozni..." required></textarea>
              </div>

              <!-- FILE UPLOAD DROPZONE -->
              <div class="form-group">
                <label class="form-label">Önéletrajz Feltöltése (CV) <span class="required">*</span></label>
                <div class="file-dropzone" id="cv-dropzone">
                  <input type="file" id="career-cv-file" accept=".pdf,.doc,.docx" style="display: none;" required />
                  <div class="dropzone-content" id="dropzone-prompt">
                    <i class="fa-solid fa-cloud-arrow-up dropzone-icon"></i>
                    <div class="dropzone-text">
                      <strong>Kattintson ide a fájl kiválasztásához</strong> vagy húzza ide a dokumentumot
                    </div>
                    <span class="dropzone-sub">Elfogadott formátumok: PDF, DOC, DOCX (max. 10 MB)</span>
                  </div>

                  <div class="dropzone-file-selected" id="dropzone-file-info" style="display: none;">
                    <i class="fa-solid fa-file-pdf selected-file-icon"></i>
                    <div class="selected-file-details">
                      <span class="selected-file-name" id="cv-filename">oneletrajz.pdf</span>
                      <span class="selected-file-size" id="cv-filesize">2.4 MB</span>
                    </div>
                    <button type="button" class="dropzone-remove-btn" id="remove-cv-btn" title="Fájl eltávolítása">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- GDPR CONSENT -->
              <div class="form-group form-checkbox-group">
                <label class="checkbox-container">
                  <input type="checkbox" id="career-privacy" required />
                  <span class="checkmark"></span>
                  <span class="checkbox-label-text">
                    Hozzájárulok, hogy a Demo-Trade Kft. az általam megadott adatokat és szakmai önéletrajzomat a kiválasztási folyamat során kezelje az <a href="#" data-page="privacy" target="_blank" style="color: var(--primary); text-decoration: underline;">Adatkezelési Tájékoztatóban</a> foglaltak szerint. <span class="required">*</span>
                  </span>
                </label>
              </div>

              <div class="form-actions" style="margin-top: 1.8rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="font-size: 0.85rem; color: var(--gray-500);">
                  <i class="fa-solid fa-shield-halved" style="color: var(--primary);"></i> Az adatokat bizalmasan kezeljük és nem adjuk át harmadik félnek.
                </div>

                <button type="submit" class="btn btn-primary" id="career-submit-btn" style="padding: 0.9rem 2.2rem; font-size: 1rem;">
                  <i class="fa-solid fa-paper-plane"></i> Jelentkezés Beküldése
                </button>
              </div>
            </form>

            <div class="career-contact-direct">
              <div class="career-contact-header">
                <div class="direct-avatar">
                  <i class="fa-solid fa-phone-volume"></i>
                </div>
                <strong class="career-contact-title">Kérdése van a pozíciókkal kapcsolatban?</strong>
              </div>
              <div class="direct-body" style="text-align: left; width: 100%;">
                <p style="text-align: left; margin: 0; line-height: 1.8;">
                  Moravszki Gábor cégvezető szívesen válaszol kérdéseire:<br />
                  <a href="tel:+36303462848" style="display: block; margin-top: 6px;"><i class="fa-solid fa-phone" style="color: var(--primary); margin-right: 6px;"></i> +36 30 346 2848</a>
                  <a href="mailto:demo.trade.mg@gmail.com" style="display: block; margin-top: 4px;"><i class="fa-solid fa-envelope" style="color: var(--primary); margin-right: 6px;"></i> demo.trade.mg@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
