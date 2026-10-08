export function renderPrivacyPage() {
  return `
    <section class="section page-section" style="background: #f8fafc; padding: calc(80px + 2.5rem) 0 5rem; min-height: 80vh;">
      <div class="container" style="max-width: 960px;">
        <div class="section-title" style="text-align: left; max-width: 100%; margin-bottom: 2.5rem;">
          <span class="subtitle">JOGI DOKUMENTUM</span>
          <h2>ADATKEZELÉSI TÁJÉKOZTATÓ</h2>
          <p>A Demo-Trade Kft. adatkezelési alapelvei és az érintettek jogai a GDPR (EU 2016/679) rendelettel összhangban.</p>
        </div>

        <div class="admin-card" style="padding: 2.5rem; margin-bottom: 2rem; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <!-- PDF LETÖLTÉS GOMB -->
          <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 1.5rem 2rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.2rem; margin-bottom: 2.5rem;">
            <div>
              <h4 style="color: #ffffff; margin-bottom: 0.3rem; font-size: 1.15rem; display: flex; align-items: center; gap: 0.6rem;">
                <i class="fa-solid fa-file-pdf" style="color: #ef4444; font-size: 1.4rem;"></i>
                Hivatalos Adatkezelési Tájékoztató Dokumentum
              </h4>
              <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">A teljes, cégszerűen aláírt dokumentum PDF formátumban letölthető.</p>
            </div>
            <a href="/adatkezelesi_tajekoztato.pdf" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 0.75rem 1.6rem; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
              <i class="fa-solid fa-download"></i> PDF Megnyitása / Letöltése
            </a>
          </div>

          <!-- RÖVID ÁTTEKINTŐ BLOKKOK -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem;">
            <div style="background: #f8fafc; padding: 1.4rem; border-radius: 10px; border-left: 4px solid var(--primary);">
              <h5 style="color: #0f172a; margin-bottom: 0.5rem; font-size: 1rem;"><i class="fa-solid fa-shield-halved" style="color: var(--primary); margin-right: 0.5rem;"></i> Adatkezelő</h5>
              <p style="font-size: 0.88rem; color: #475569; margin: 0; line-height: 1.6;">
                <strong>Demo-Trade Kft.</strong><br>
                Székhely: 4400 Nyíregyháza, Lengyel u. 15.<br>
                E-mail: demotradekft@gmail.com
              </p>
            </div>

            <div style="background: #f8fafc; padding: 1.4rem; border-radius: 10px; border-left: 4px solid #10b981;">
              <h5 style="color: #0f172a; margin-bottom: 0.5rem; font-size: 1rem;"><i class="fa-solid fa-briefcase" style="color: #10b981; margin-right: 0.5rem;"></i> Álláspályázatok &amp; CV</h5>
              <p style="font-size: 0.88rem; color: #475569; margin: 0; line-height: 1.6;">
                Önéletrajzok, elérhetőségek és pályázati adatok bizalmas kezelése munkaerő-toborzási céllal.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 1.4rem; border-radius: 10px; border-left: 4px solid #f27922;">
              <h5 style="color: #0f172a; margin-bottom: 0.5rem; font-size: 1rem;"><i class="fa-solid fa-envelope-open-text" style="color: #f27922; margin-right: 0.5rem;"></i> Érdeklődés &amp; Termékek</h5>
              <p style="font-size: 0.88rem; color: #475569; margin: 0; line-height: 1.6;">
                Szaktanácsadási megkeresések és termék/oltvány árajánlatkérések feldolgozása.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 1.4rem; border-radius: 10px; border-left: 4px solid #3b82f6;">
              <h5 style="color: #0f172a; margin-bottom: 0.5rem; font-size: 1rem;"><i class="fa-solid fa-user-lock" style="color: #3b82f6; margin-right: 0.5rem;"></i> Érintetti jogok</h5>
              <p style="font-size: 0.88rem; color: #475569; margin: 0; line-height: 1.6;">
                Hozzáférés, helyesbítés, azonnali törlés („elfeledtetés joga”) és tiltakozás.
              </p>
            </div>
          </div>

          <!-- RÉSZLETES TARTALOM ÖSSZEFOGLALÓ -->
          <div class="privacy-content-body" style="color: #334155; line-height: 1.8; font-size: 0.95rem;">
            <h3 style="color: #0f172a; font-size: 1.3rem; margin: 2rem 0 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
              1. Az adatkezelő adatai és elérhetőségei
            </h3>
            <p>
              A <strong>Demo-Trade Kft.</strong> (székhely: 4400 Nyíregyháza, Lengyel u. 15., cégjegyzékszám: 15-09-074844, adószám: 14901832-2-15, e-mail: <a href="mailto:demotradekft@gmail.com" style="color: var(--primary); font-weight: 600;">demotradekft@gmail.com</a>, telefon: +36 30 346 2848) elkötelezett a felhasználók, ügyfelek és álláspályázók személyes adatainak védelme iránt a GDPR (EU 2016/679) rendelettel és az Infotv.-vel összhangban.
            </p>

            <h3 style="color: #0f172a; font-size: 1.3rem; margin: 2rem 0 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
              2. A kezelt adatok köre, célja és jogalapja
            </h3>

            <!-- 2.1 KAPCSOLATFELVÉTEL -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.4rem; margin-bottom: 1.4rem;">
              <h4 style="color: #0f172a; margin-top: 0; margin-bottom: 0.6rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-comments" style="color: var(--primary);"></i> 2.1. Általános kapcsolatfelvételi űrlap &amp; Szaktanácsadási megkeresések
              </h4>
              <ul style="padding-left: 1.5rem; margin-bottom: 0;">
                <li><strong>Kezelt adatok köre:</strong> Név, e-mail cím, telefonszám, választott téma/szolgáltatás, üzenet szövege.</li>
                <li><strong>Adatkezelés célja:</strong> Érdeklődésre, árajánlatkérésre vagy szaktanácsadói megkeresésre történő válaszadás, kapcsolattartás.</li>
                <li><strong>Jogalap:</strong> Az érintett önkéntes hozzájárulása (GDPR 6. cikk (1) bekezdés a) pont) és az adatkezelő jogos érdeke (kapcsolattartás).</li>
                <li><strong>Adatkezelés időtartama:</strong> A megkeresés megválaszolásáig és az ügy lezárásáig, vagy a hozzájárulás visszavonásáig.</li>
              </ul>
            </div>

            <!-- 2.2 KARRIER & ÖNÉLETRAJZOK -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1.4rem; margin-bottom: 1.4rem;">
              <h4 style="color: #166534; margin-top: 0; margin-bottom: 0.6rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-file-lines" style="color: #166534;"></i> 2.2. Álláspályázatok, toborzás és önéletrajzok kezelése (Karrier oldal)
              </h4>
              <p style="margin-bottom: 0.8rem; font-size: 0.92rem; color: #166534;">
                A Karrier oldalon meghirdetett álláslehetőségekre történő jelentkezés során megadott személyes adatokat és feltöltött dokumentumokat kiemelt bizalmassággal kezeljük.
              </p>
              <ul style="padding-left: 1.5rem; margin-bottom: 0;">
                <li><strong>Kezelt adatok köre:</strong> Név, e-mail cím, telefonszám, megpályázott munkakör/pozíció, kísérő üzenet / motivációs levél, a csatolt szakmai önéletrajz (CV) és abban feltüntetett személyes adatok (fénykép, lakcím/tartózkodási hely, születési adatok, iskolai végzettségek, korábbi munkahelyek, szakmai tapasztalat, nyelvtudás, jogosítvány kategóriák, képesítések, referenciák).</li>
                <li><strong>Adatkezelés célja:</strong> Munkaerő-kiválasztás lefolytatása, a pályázó szakmai alkalmasságának felmérése, személyes állásinterjú egyeztetése és a kiválasztási döntés meghozatala.</li>
                <li><strong>Jogalap:</strong> Az érintett kifejezett, önkéntes hozzájárulása az űrlap beküldésével (GDPR 6. cikk (1) bekezdés a) pont), valamint a leendő munkaszerződés megkötését megelőző lépések megtétele a pályázó kérésére (GDPR 6. cikk (1) bekezdés b) pont).</li>
                <li><strong>Adatkezelés időtartama:</strong>
                  <ul>
                    <li>A konkrét pozíció betöltéséig és a kiválasztási eljárás lezárásáig.</li>
                    <li>Sikertelen pályázat esetén az önéletrajz és a pályázati anyag haladéktalanul törlésre kerül, <em>kivéve</em> ha a pályázó kifejezetten hozzájárul ahhoz, hogy későbbi megüresedő pozíciók betöltése érdekében adatait legfeljebb <strong>1 évig</strong> nyilvántartásban tartsuk.</li>
                    <li>Az érintett bármikor kérheti adatainak azonnali és végleges törlését a <a href="mailto:demo.trade.mg@gmail.com" style="color: #166534; font-weight: bold;">demo.trade.mg@gmail.com</a> vagy a <a href="mailto:demotradekft@gmail.com" style="color: #166534; font-weight: bold;">demotradekft@gmail.com</a> címen.</li>
                  </ul>
                </li>
                <li><strong>Adathozzáférés &amp; Biztonság:</strong> A benyújtott pályázati anyagokhoz kizárólag a Demo-Trade Kft. cégvezetése és a toborzásban döntéshozó szakmai vezetők férhetnek hozzá. Harmadik félnek (pl. külső közvetítő cégnek) az adatokat nem adjuk át.</li>
              </ul>
            </div>

            <!-- 2.3 TERMÉK ÉRDEKLŐDÉS -->
            <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 1.4rem; margin-bottom: 1.4rem;">
              <h4 style="color: #9a3412; margin-top: 0; margin-bottom: 0.6rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-apple-whole" style="color: #ea580c;"></i> 2.3. Termékajánlatkérési és megrendelés-egyeztetési űrlap (Termékek oldal)
              </h4>
              <ul style="padding-left: 1.5rem; margin-bottom: 0;">
                <li><strong>Kezelt adatok köre:</strong> Név, e-mail cím, telefonszám, választott termék/oltvány megnevezése, kívánt mennyiség, érdeklődés szövege.</li>
                <li><strong>Adatkezelés célja:</strong> Egyedi termékárajánlat összeállítása, szaporítóanyaggal kapcsolatos szaktanácsadási tájékoztatás, visszahívás.</li>
                <li><strong>Jogalap:</strong> Az érintett önkéntes hozzájárulása (GDPR 6. cikk (1) bekezdés a) pont) és szerződéskötést megelőző egyeztetés (GDPR 6. cikk (1) bekezdés b) pont).</li>
                <li><strong>Adatkezelés időtartama:</strong> Az ajánlati kötöttség idejéig, illetve adásvétel létrejötte esetén a számviteli törvény szerinti bizonylatmegőrzési ideig (8 év).</li>
              </ul>
            </div>

            <h3 style="color: #0f172a; font-size: 1.3rem; margin: 2rem 0 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
              3. Sütik (Cookie-k) kezelése
            </h3>
            <p>
              Weboldalunk a megfelelő működés és a felhasználói élmény biztosítása érdekében sütiket (cookie-kat) használ:
            </p>
            <ul style="padding-left: 1.5rem; margin-bottom: 1.2rem;">
              <li><strong>Elengedhetetlenül szükséges (technikai) sütik:</strong> Biztosítják a navigációt, a munkamenet és az adatvédelmi beállítások (pl. cookie hozzájárulás) mentését.</li>
              <li><strong>Kényelmi és statisztikai sütik:</strong> Segítenek megérteni az oldal használatát a szolgáltatások minőségének javítása érdekében.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.3rem; margin: 2rem 0 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
              4. Beágyazott PDF megtekintése
            </h3>
            <div style="margin-top: 1.5rem; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden;">
              <iframe src="/adatkezelesi_tajekoztato.pdf" width="100%" height="600" style="border: none;" title="Adatkezelési Tájékoztató PDF">
                <p>Az Ön böngészője nem támogatja a PDF beágyazást. <a href="/adatkezelesi_tajekoztato.pdf" target="_blank" rel="noopener">Kattintson ide a PDF letöltéséhez.</a></p>
              </iframe>
            </div>

            <h3 style="color: #0f172a; font-size: 1.3rem; margin: 2.5rem 0 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
              5. Jogorvoslati lehetőségek
            </h3>
            <p>
              Amennyiben úgy ítéli meg, hogy az adatkezelés megsértette a jogszabályokat, panasszal élhet a felügyeleti hatóságnál:
            </p>
            <div style="background: #f1f5f9; padding: 1.2rem 1.5rem; border-radius: 8px; font-size: 0.9rem;">
              <strong>Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)</strong><br>
              Cím: 1055 Budapest, Falk Miksa utca 9-11.<br>
              Postacím: 1363 Budapest, Pf.: 9.<br>
              Telefon: +36 (1) 391-1400 | E-mail: <a href="mailto:ugyfelszolgalat@naih.hu" style="color: var(--primary);">ugyfelszolgalat@naih.hu</a> | Honlap: <a href="https://naih.hu" target="_blank" rel="noopener" style="color: var(--primary);">www.naih.hu</a>
            </div>
          </div>

          <div style="margin-top: 3rem; text-align: center;">
            <button class="btn btn-outline" data-page="home">
              <i class="fa-solid fa-arrow-left"></i> Vissza a főoldalra
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
