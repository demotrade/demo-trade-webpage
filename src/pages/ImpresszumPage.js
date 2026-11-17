import { INITIAL_STAFF } from '../data/initialStaff.js';

export function renderImpresszumPage(staffList = INITIAL_STAFF) {
  const activeStaff = Array.isArray(staffList) && staffList.length > 0 ? staffList : INITIAL_STAFF;
  // Deduplicate by person name so staff working in multiple offices appear once in Impresszum
  const uniqueStaff = [];
  const seenNames = new Set();
  for (const person of activeStaff) {
    const key = (person.name || '').trim().toLowerCase();
    if (key && !seenNames.has(key)) {
      seenNames.add(key);
      uniqueStaff.push(person);
    }
  }

  return `
    <section class="section page-section" style="background: #f8fafc; padding: calc(80px + 2.5rem) 0 5rem; min-height: 70vh;">
      <div class="container" style="max-width: 860px;">
        <div class="section-title" style="text-align: left; max-width: 100%; margin-bottom: 2.5rem;">
          <span class="subtitle">JOGI INFORMÁCIÓ</span>
          <h2>IMPRESSZUM</h2>
        </div>

        <div class="admin-card" style="padding: 3rem;">
          <table class="impresszum-table">
            <tbody>
              <tr>
                <th>Vállalkozás neve:</th>
                <td>Demo-Trade Kft.</td>
              </tr>
              <tr>
                <th>Székhelyek &amp; telephelyek:</th>
                <td>
                  4400 Nyíregyháza, Lengyel utca 15.<br />
                  4400 Nyíregyháza, Bethlen Gábor utca 32.<br />
                  4931 Tarpa, Kossuth út 25/C. ép.
                </td>
              </tr>
              <tr>
                <th>E-mail:</th>
                <td><a href="mailto:demotradekft@gmail.com" style="color: var(--primary); font-weight: 600;">demotradekft@gmail.com</a></td>
              </tr>
              <tr>
                <th>Nyilvántartási szám:</th>
                <td>15-09-074844</td>
              </tr>
              <tr>
                <th>Adószám:</th>
                <td>14901832-2-15</td>
              </tr>
              <tr>
                <th>Statisztikai számjel:</th>
                <td>14901832-0161-113-15</td>
              </tr>
              <tr>
                <th>Érdekképviselet:</th>
                <td>Nemzeti Agrárgazdasági Kamara</td>
              </tr>
            </tbody>
          </table>

          <h3 style="font-size: 1.25rem; margin: 2.5rem 0 1.2rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200);">
            <i class="fa-solid fa-phone" style="color: var(--primary); margin-right: 0.6rem;"></i>Telefonszámok
          </h3>
          <div class="impresszum-contacts-grid">
            ${uniqueStaff.map(person => {
              const cleanTel = (person.phone || '').replace(/[^\d+]/g, '');
              return `
                <div class="impresszum-person">
                  <strong>${person.name}</strong>
                  <span>${person.role}</span>
                  ${person.phone ? `<a href="tel:${cleanTel}">${person.phone}</a>` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <h3 style="font-size: 1.25rem; margin: 2.5rem 0 1.2rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200);">
            <i class="fa-solid fa-server" style="color: var(--primary); margin-right: 0.6rem;"></i>Tárhelyszolgáltató
          </h3>
          <table class="impresszum-table">
            <tbody>
              <tr>
                <th>Neve:</th>
                <td>3 in 1 Hosting Számítástechnikai és Szolgáltató Betéti Társaság</td>
              </tr>
              <tr>
                <th>Székhelye:</th>
                <td>2310 Szigetszentmiklós, Brassó u. 4/A</td>
              </tr>
              <tr>
                <th>Telefon:</th>
                <td><a href="tel:+36212000040" style="color: var(--primary);">+36 (21) 200 0040</a></td>
              </tr>
              <tr>
                <th>E-mail:</th>
                <td><a href="mailto:admin@megacp.com" style="color: var(--primary);">admin@megacp.com</a></td>
              </tr>
              <tr>
                <th>Weboldal:</th>
                <td><a href="https://www.3in1.hu" target="_blank" rel="noopener" style="color: var(--primary);">www.3in1.hu</a></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 2.5rem; text-align: center;">
            <button class="btn btn-outline" data-page="home">
              <i class="fa-solid fa-arrow-left"></i> Vissza a főoldalra
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
