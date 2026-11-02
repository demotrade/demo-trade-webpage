export function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-slim-grid">
          <!-- LOGO + TAGLINE -->
          <div class="footer-brand">
            <div style="margin-bottom: 1rem;">
              <img src="/demo-trade-logo.jpg" alt="Demo-Trade Kft." style="height: 50px; width: auto; background: white; padding: 4px 8px; border-radius: 8px;" />
            </div>
            <p style="font-size: 0.9rem; line-height: 1.6;">Akkreditált Uniós Szaktanácsadási Központ. Küldetésünk, hogy minél több termelőnek megkönnyítsük az agrár- és vidékfejlesztéshez kapcsolódó ügyintézését.</p>
          </div>

          <!-- NAV LINKS -->
          <div class="footer-links">
            <h4>Navigáció</h4>
            <ul>
              <li><a href="/" data-page="home">Főoldal</a></li>
              <li><a href="/rolunk" data-page="home" data-section="rolunk">Rólunk</a></li>
              <li><a href="/szolgaltatasok" data-page="home" data-section="szolgaltatasok">Szolgáltatások</a></li>
              <li><a href="/termekek" data-page="products">Termékek</a></li>
              <li><a href="/karrier" data-page="career">Karrier</a></li>
              <li><a href="/hirek" data-page="blog">Blog &amp; Hírek</a></li>
              <li><a href="/kapcsolat" data-page="home" data-section="kapcsolat">Kapcsolat</a></li>
              <li><a href="/adatkezeles" data-page="privacy" style="color: var(--gray-400);">Adatkezelési tájékoztató</a></li>
              <li><a href="/impresszum" data-page="impresszum" style="color: var(--gray-400);">Impresszum</a></li>
            </ul>
          </div>

          <!-- CONTACT INFO -->
          <div class="footer-links">
            <h4>Elérhetőség</h4>
            <p><i class="fa-solid fa-phone" style="color:#5ce685; margin-right:0.5rem;"></i><a href="tel:+36303462848" style="color: var(--gray-300);">+36 30 346 2848</a></p>
            <p style="margin-top: 0.5rem;"><i class="fa-solid fa-envelope" style="color:#5ce685; margin-right:0.5rem;"></i><a href="mailto:demotradekft@gmail.com" style="color: var(--gray-300);">demotradekft@gmail.com</a></p>
            <p style="margin-top: 0.5rem;"><i class="fa-solid fa-location-dot" style="color:#5ce685; margin-right:0.5rem;"></i>4400 Nyíregyháza</p>
            <div style="margin-top: 1.2rem;">
              <a href="https://www.facebook.com/demotradekft" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #5ce685; font-weight: 700; font-size: 0.9rem; text-decoration: none;">
                <i class="fa-brands fa-facebook" style="font-size: 1.1rem;"></i> Facebook oldalunk
              </a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copy">&copy; ${new Date().getFullYear()} Demo-Trade Kft. Minden jog fenntartva.</p>
          <div class="footer-design">
            design by: <a href="https://www.rekalaca-webdesign.hu/" target="_blank" rel="noopener">rekalaca-webdesign</a>
          </div>
          <div class="footer-bottom-links">
            <a href="/adatkezeles" data-page="privacy">Adatkezelés</a>
            <a href="/impresszum" data-page="impresszum">Impresszum</a>
            <a href="#" id="footer-cookie-btn">
              <i class="fa-solid fa-cookie-bite"></i> Sütik
            </a>
            <a href="#admin" data-page="admin" id="footer-admin-btn">
              <i class="fa-solid fa-lock"></i> Admin
            </a>
          </div>
        </div>
        <address style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; font-style: normal;">
          Demo-Trade Kft. – Akkreditált Uniós Mezőgazdasági Szaktanácsadási Központ (alapítva: 2007, ügyvezető: Moravszki Gábor mezőgazdasági szaktanácsadó, növényorvos, irodavezető: Sápi Imre).
          Irodák: 4400 Nyíregyháza, Lengyel utca 15. és Bethlen Gábor utca 32.; Kisvárdai Területi Iroda; 4931 Tarpa, Kossuth út 25/C. ép.
          Telefon: +36 30 346 2848, +36 30 559 7376. E-mail: demotradekft@gmail.com. Adószám: 14901832-2-15. Cégjegyzékszám: 15-09-074844.
          Lefedettség: Szabolcs-Szatmár-Bereg, Hajdú-Bihar és Borsod-Abaúj-Zemplén vármegye (550+ szerződött gazdálkodó).
          Szolgáltatások: Egységes kérelmek (EK), e-GN gazdálkodási napló, e-permetezési napló, nitrátjelentés, tápanyag-gazdálkodási terv, agrárkárenyhítés (fagykár, aszálykár), gázolaj jövedéki adó visszaigénylés, NAK kamarai tagdíjbevallás, növényvédelmi biolabor és előrejelzés, mezőgazdasági pályázatírás, permetezőgépek kötelező műszaki felülvizsgálata mobil vizsgaállomással.
          Termékek: Vírusmentes minősített gyümölcsfa oltványok – Gala Must alma (2.890 Ft/db), Bigarreau Burlat cseresznye (3.190 Ft/db), Čačanska Lepotica szilva (2.790 Ft/db), Ceglédi Óriás kajszibarack (3.290 Ft/db).
        </address>
      </div>
    </footer>
  `;
}
