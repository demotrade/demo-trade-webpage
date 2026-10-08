-- ==============================================================================
-- DEMO-TRADE KFT. WEBOLDAL — SUPABASE ADATBÁZIS TÁBLA & JOGOSULTSÁGOK
-- Futtassa le a Supabase Irányítópulton: SQL Editor -> New Query -> Run
-- Projekt: https://netwmohjucdoomghiuzk.supabase.co
-- ==============================================================================

-- 1. Tábla létrehozása hírekhez, állásokhoz és termékekhez
CREATE TABLE IF NOT EXISTS public.web_posts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'blog', -- 'blog', 'career', 'product'
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Híreink',
  author TEXT NOT NULL DEFAULT 'Moravszki Gábor',
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  location TEXT,
  "jobType" TEXT,
  deadline TEXT,
  price TEXT,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexek a gyorsabb lekérdezésekhez
CREATE INDEX IF NOT EXISTS idx_web_posts_type ON public.web_posts(type);
CREATE INDEX IF NOT EXISTS idx_web_posts_created_at ON public.web_posts(created_at DESC);

-- 3. Row Level Security (RLS) bekapcsolása
ALTER TABLE public.web_posts ENABLE ROW LEVEL SECURITY;

-- 4. Jogosultságok: Bárki (publikus látogatók) olvashatja a bejegyzéseket
DROP POLICY IF EXISTS "Public read web_posts" ON public.web_posts;
CREATE POLICY "Public read web_posts"
  ON public.web_posts
  FOR SELECT
  USING (true);

-- 5. Jogosultságok: Mentés és törlés engedélyezése az anon / admin klienseknek
DROP POLICY IF EXISTS "Allow anon all on web_posts" ON public.web_posts;
CREATE POLICY "Allow anon all on web_posts"
  ON public.web_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Storage Bucket ellenőrzése / létrehozása (ha még nem létezne)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'webpage-images',
  'webpage-images',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Storage RLS házirendek a képtárhelyhez (Mindenki láthatja, feltöltés engedélyezett)
DROP POLICY IF EXISTS "Public view for webpage-images" ON storage.objects;
CREATE POLICY "Public view for webpage-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'webpage-images');

DROP POLICY IF EXISTS "Allow upload to webpage-images" ON storage.objects;
CREATE POLICY "Allow upload to webpage-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'webpage-images');

DROP POLICY IF EXISTS "Allow update to webpage-images" ON storage.objects;
CREATE POLICY "Allow update to webpage-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'webpage-images');

-- KÉSZ! A tábla és a képtárhely készen áll az éles használatra.

-- 8. Kezdeti adatok (Termékek, Állások, Hírek) feltöltése
INSERT INTO public.web_posts (id, type, title, category, author, date, image, excerpt, content, location, "jobType", deadline, price, badge)
VALUES
  ('karrier-mezogazdasagi-szaktanacsado', 'career', 'Mezőgazdasági szaktanácsadó (Nyíregyháza, Kisvárda)', 'Agrármérnök', 'DEMO-TRADE Kft.', '2026.10.08.', '/images/karrier/szaktanacsado.jpg', 'A Demo-Trade Kft. Területi Szaktanácsadási Központ meglévő és új partnereink színvonalas kiszolgálására mezőgazdasági szaktanácsadó munkatársat keres Nyíregyháza vagy Kisvárda munkavégzési hellyel.', '<h3>Céginformáció &amp; Küldetésünk</h3><p>A <strong>Demo-Trade Kft.</strong> Területi Szaktanácsadási Központ, mezőgazdasági szaktanácsadó- és pályázatíró vállalkozás. Kiterjedt partnerkörrel rendelkezünk Szabolcs-Szatmár-Bereg és a két szomszédos megyében (Hajdú-Bihar, Borsod-Abaúj-Zemplén). Vállalkozásunk teljeskörű tanácsadási szolgáltatást nyújt a mezőgazdaságban dolgozó őstermelőknek és vállalkozásoknak, tanácsadási tevékenységünk az adminisztratív és a szakmai területekre is kiterjed.</p><h4>Főbb feladatok:</h4><ul><li>Kapcsolattartás az ügyfelekkel, ügyfélszolgálat tartása, meglévő és új partnereinkkel való személyes kapcsolattartás</li><li>Gazdálkodási napló vezetése, tápanyag-gazdálkodási terv készítése, nitrát jelentések készítése, és egyéb adminisztrációs teendők elvégzése</li><li>Támogatások igénylése, nyomon követése</li><li>Gazdálkodást érintő aktuális teendők, jogszabályok figyelése</li><li>Ügyfelekkel való együttműködés, személyre szabott tanácsok készítése</li><li>A vállalkozás szolgáltatásainak ismertetése, értékesítése</li><li><strong>A munkavégzés helye:</strong> Nyíregyháza vagy Kisvárda</li></ul><h4>Az álláshoz tartozó elvárások:</h4><ul><li>Felsőfokú mezőgazdasági végzettség VAGY több éves szakmai tapasztalat mezőgazdasági adminisztráció területén</li><li>Jó kommunikációs képesség</li><li>B kategóriás jogosítvány</li><li>Készségszintű számítástechnikai ismeretek (Excel, Word…)</li><li>Szakmai tapasztalat a mezőgazdasági adminisztráció területén</li></ul><h4>Az állás betöltéséhez előnyt jelent:</h4><ul><li>Egyetemi végzettség, MSc diploma</li><li>Szaktanácsadó Névjegyzékben való részvétel</li><li>Szakmai tapasztalat mezőgazdasági szaktanácsadás, illetve pályázatírás területén</li><li>Mezőgazdasági hatósági vagy falugazdászi munkatapasztalat</li><li>Kialakult partnerkapcsolat, jártasság ügyfélkezelés, partnerszerzés, szolgáltatás értékesítés területén</li></ul><h4>Amit kínálunk:</h4><ul><li>Erkölcsi és szakmai megbecsülés</li><li>Hosszú távú munkalehetőség</li><li>Versenyképes jövedelem</li><li>Szakmai továbbképzés, tréningek</li><li>Munkavégzéshez szükséges korszerű eszközök (laptop, mobiltelefon)</li></ul><h4>Jelentkezés módja:</h4><p>Fényképes önéletrajz és motivációs levél beküldésével az alábbi jelentkezési űrlapon keresztül.</p>', 'Nyíregyháza vagy Kisvárda', 'Teljes munkaidő &bull; Alkalmazotti jogviszony', 'Folyamatos felvétel', NULL, NULL),
  ('oltvany-gala-must-alma', 'product', 'Gala Must Almafa Oltvány (M9 alanyon)', 'Alma oltványok', 'Demo-Trade Kft.', '2026.10.08.', '/images/termekek/alma_oltvany.jpg', 'Kiváló termőképességű, korán színeződő, ropogós és lédús Gala Must almafa oltvány intenzív törpe (M9) alanyon. Házi kerti és ültetvényszerű telepítésre is ideális választás.', '<h3>Fajtajellemzők &amp; Termesztési Érték</h3><p>A <strong>Gala Must</strong> az egyik legkedveltebb és legkeresettebb modern almafajta. Gyümölcse tetszetős, élénkpiros csíkozottsággal fedett, húsa kemény, roppanó, lédús és kifejezetten édes aromájú. Az intenzív törpe <strong>M9 alanynak</strong> köszönhetően a fa már a 2–3. évben termőre fordul, könnyen kezelhető, ritka koronát nevel, amely ideális kiskerti termesztésre és sűrű térállású ültetvénybe is.</p><h4>Főbb paraméterek:</h4><ul><li><strong>Érési idő:</strong> Augusztus vége – szeptember eleje (hosszan tárolható)</li><li><strong>Alany:</strong> M9 vírusmentes törpe alany (támrendszert igényel)</li><li><strong>Gyümölcsméret:</strong> Középnagy (150–180 g), szabályos kúp alakú</li><li><strong>Porzófajták:</strong> Golden Delicious, Idared, Granny Smith</li><li><strong>Gyökérzet:</strong> Erős, dús bojtos szabadgyökérrel</li></ul><h4>Szakmai szaktanácsadói javaslatunk:</h4><p>Ültetéskor gondoskodjunk a megfelelő mélységű ültetőgödörről és a gyökerek visszametszése utáni bőséges beiszapoló öntözésről. Tavaszi telepítés esetén javasolt a törzs melletti támkaró elhelyezése a szélkár megelőzésére.</p>', NULL, NULL, NULL, '2.890 Ft / db', 'I. Osztályú Minősített'),
  ('oltvany-bigarreau-burlat-cseresznye', 'product', 'Bigarreau Burlat Cseresznyefa Oltvány (Sajmeggy alanyon)', 'Cseresznye oltványok', 'Demo-Trade Kft.', '2026.10.08.', '/images/termekek/cseresznye_oltvany.jpg', 'A szezon legkorábban érő, prémium nagyszemű ropogós cseresznyefajtája. Korai érése miatt nem kukacosodik, fája kifejezetten edzett és ellenálló.', '<h3>Fajtajellemzők &amp; Termesztési Érték</h3><p>A <strong>Bigarreau Burlat</strong> a hazai gyümölcstermesztés legnépszerűbb korai cseresznyéje. Legnagyobb előnye, hogy még azelőtt beérik, mielőtt a cseresznyelégy rajzása megkezdődne, így a gyümölcsök garantáltan kukacmentesek maradnak permetezés nélkül is. Húsa kemény, ropogós, fényes sötétbordó, íze mézédes és zamatos.</p><h4>Főbb paraméterek:</h4><ul><li><strong>Érési idő:</strong> Május vége – június eleje (a legkorábbi fajták egyike)</li><li><strong>Alany:</strong> Sajmeggy (Cerasus mahaleb) – szárazságtűrő, erős gyökérzettel</li><li><strong>Gyümölcsméret:</strong> Nagy (6–8 g), tompa szív alakú, sötét kárminpiros</li><li><strong>Porzófajták:</strong> Szomolyai fekete, Carmen, Katalin, Van</li><li><strong>Fagytűrés:</strong> Téli hideget és kora tavaszi fagyokat kiemelkedően jól viseli</li></ul><h4>Szakmai szaktanácsadói javaslatunk:</h4><p>A fiatal fákat ültetés után alakító metszéssel érdemes nevelni, biztosítva a szellős, napfényes koronaszerkezetet, amely elősegíti az egyenletes színeződést és megelőzi a moníliás fertőzéseket.</p>', NULL, NULL, NULL, '3.190 Ft / db', 'Korai Bőtermő'),
  ('oltvany-cacanska-lepotica-szilva', 'product', 'Čačanska Lepotica Szilvafa Oltvány (Myrobalan alanyon)', 'Szilva oltványok', 'Demo-Trade Kft.', '2026.10.08.', '/images/termekek/szilva_oltvany.jpg', 'Korán termőre forduló, megbízhatóan és bőven termő hamvas sötétkék szilvafajta. Sarka-vírussal szemben toleráns, étkezésre, lekvárnak és pálinkának is kiváló.', '<h3>Fajtajellemzők &amp; Termesztési Érték</h3><p>A <strong>Čačanska Lepotica</strong> (Csacsaki szépség) kiváló választás mind házikertbe, mind árutermelő gazdaságokba. Rendkívül piacos, mutatós, vastag viaszréteggel (hamvassággal) fedett sötétkék gyümölcsöket terem. Húsa zöldessárga, tömör, teljesen magvaváló, kellemesen édes-savanykás harmonikus ízvilággal.</p><h4>Főbb paraméterek:</h4><ul><li><strong>Érési idő:</strong> Július vége – augusztus eleje (nyári szilva)</li><li><strong>Alany:</strong> Myrobalan (Prunus cerasifera) – mélyre hatoló, szárazságtűrő gyökérzettel</li><li><strong>Gyümölcsméret:</strong> Középnagy-nagy (35–45 g), megnyúlt ovális alakú</li><li><strong>Porzófajták:</strong> Öntermékenyülő képessége jó; Stanley, Besztercei fokozza a termést</li><li><strong>Ellenállóság:</strong> A hírhedt Plum Pox (Sarka) vírussal szemben kimagaslóan toleráns</li></ul><h4>Szakmai szaktanácsadói javaslatunk:</h4><p>Rendszeres termőképessége miatt nem igényel túlzott vegyszeres védelmet, integrált és környezetbarát technológiákhoz kifejezetten ajánljuk. Kiváló alapanyaga a hagyományos szatmári szilvalekvárnak és pálinkának.</p>', NULL, NULL, NULL, '2.790 Ft / db', 'Sarka-vírus Toleráns'),
  ('oltvany-cegledi-orias-kajszi', 'product', 'Ceglédi Óriás Kajszibarack Oltvány (Vadkajszi alanyon)', 'Kajszi oltványok', 'Demo-Trade Kft.', '2026.10.08.', '/images/termekek/kajszi_oltvany.jpg', 'Hagyományos magyar nemesítésű, hatalmas méretű, illatos és lédús kajszibarack oltvány. Friss fogyasztásra, süteményekbe és prémium lekvárfőzésre a legkiválóbb.', '<h3>Fajtajellemzők &amp; Termesztési Érték</h3><p>A <strong>Ceglédi Óriás</strong> a magyar kajszitermesztés egyik legértékesebb nemesítése. Gyümölcsei óriási méretűek, aranysárga alapon napos oldalukon vonzó piros pírral. Húsa narancssárga, rendkívül lédús, olvadó, jellegzetes intenzív barackillattal és gazdag aromával rendelkezik.</p><h4>Főbb paraméterek:</h4><ul><li><strong>Érési idő:</strong> Július eleje (Magyar kajszi előtt néhány nappal)</li><li><strong>Alany:</strong> Vadkajszi magonc – életerős, mély gyökérzettel, meszes talajokat is jól tűr</li><li><strong>Gyümölcsméret:</strong> Extra nagy (60–80 g, ritkítva akár 90 g felett is!)</li><li><strong>Porzófajták:</strong> Magyar kajszi C.235, Ceglédi bíborkajszi, Bergeron</li><li><strong>Felhasználás:</strong> Prémium friss piaci gyümölcs, páratlan ízű dzsem és lekvár alapanyag</li></ul><h4>Szakmai szaktanácsadói javaslatunk:</h4><p>Tavaszi virágzás idején a moníliás fertőzések elkerülése végett javasolt a virágzáskori megelőző védekezés. Téli fagyállósága jó, fagyzugos mélyedések helyett enyhén lankás, napos fekvésbe ültessük.</p>', NULL, NULL, NULL, '3.290 Ft / db', 'Hungarikum Fajta'),
  ('post-hsa4jzzsh', 'blog', 'Fagyos tavasz, sorsdöntő hetek a gyümölcsösökben', 'fagy', 'Mitruné Tóth Krisztina', '2025.04.15.', '/images/Fagyos-tavasz-sorsdonto-hetek-a-gyumolcsosokben.jpg', 'A mögöttünk álló hét extrém időjárása végzetes fordulatot hozott sok gyümölcsösben. A fagyhullám több napon át, nagy területen, komoly károkat okozott az almásokban és a csonthéjas ültetvényekben. Az alábbi szaktanács részletesen ismerteti a károk hátterét, a növények jelenlegi állapotát, valamint a további teendőket a vegetációban. Azt mondhatjuk, hogy az elmúlt héten eldőlt az éves termés ...', '<p style="text-align: justify;"><strong>A mögöttünk álló hét extrém időjárása végzetes fordulatot hozott sok gyümölcsösben. A fagyhullám több napon át, nagy területen, komoly károkat okozott az almásokban és a csonthéjas ültetvényekben. Az alábbi szaktanács részletesen ismerteti a károk hátterét, a növények jelenlegi állapotát, valamint a további teendőket a vegetációban.</strong></p>
<p style="text-align: justify;">
<p style="text-align: justify;">Azt mondhatjuk, hogy az elmúlt héten eldőlt az éves termés mennyisége, sajnos az előrejelzésektől nagyobb fagykáresemény érte el az országot. Az Atlanti-óceán északi részén, a Brit-szigetek közelében egy nagy tömegű meleg légáramlat tört az Északi-sark irányába, ami az ottani hideg levegőt letolta egészen Magyarországig. 2025.04.07-én az ország keleti részét, 04.08-én a Duna-Tiszaközét érte el a hideg levegő. A korábbi évek fagykárától eltérően az idén szállított fagykár nem talajmendi kisugárzással jellemezhető, ami jól mutatkozik a hideg levegő dinamikájában. A levegő hőmérséklete még vasárnap (2025.04.06-án) este 9–10 óra között fagypont alá hűlt, és másnap reggel 8 helyenként 9 óráig folyamatosan fagyott, a minimum hőmérséklet településenként -4 °C és -7 °C között alakult ki. A nagy kárt nem csupán az alacsony hőmérséklet, hanem annak időtartama is okozta. A fagy elleni védekezést nehezítette a szél, az áthűlt légréteg magassága (a talajfelszíntől mért távolság), illetve az, hogy a következő nap sem emelkedett a levegő hőmérséklete a szükséges szintre. A partnerek változó eredménnyel számoltak be a fagy elleni védekezések hatékonyságáról: a fagyvédelmi kályhák, ködsárkány és légkeverő berendezések nem hozták a várt eredményt, a fagyvédelmi öntözés pedig erre az esetre alkalmatlan volt, mivel másnap nem emelkedett a hőmérséklet.</p>
<p style="text-align: justify;">Készítettünk egy kimutatást a meteorológiai állomások által mért hőmérsékleti adatokról 2025.04.07. és 04.11. között. Ezt a cikk alján található meg.</p>
<p style="text-align: justify;">A hétfői fagyok után a következő éjszakákban is fagy volt, ekkor a nagyobb probléma elsősorban az ország középső részén jelentkezett: szerda (04.09-én) és helyenként csütörtökön (04.10-én) is fagyott.</p>
<p style="text-align: justify;">Szabolcs-Szatmár-Bereg megyében a kár hatalmas, míg az almástermésűek tekintetében felső Szabolcs és a Szatmári vidék esetében a kár 100%-os, a Nyírségben valamivel kedvezőbb a helyzet, bár ott is 80% feletti kár tapasztalható. A csonthéjasok esetében valamivel jobb a helyzet: a szilva kevésbé károsodott, és meglepő módon a meggy is jobb képet mutat, mint az alma és a körte. A meggy esetében előfordulhat, hogy a fagykár úgy jelenik meg, hogy a termés kezdeményei, hasonlóan a zöldborsó méretéhez, elkezdenek sárgulni, majd később lehullanak.</p>
<p style="text-align: justify;">Alma esetében azok a virágok, amelyek 20%-ban megmaradtak, még teljes termést is eredményezhetnek, illetve korábbi évek tapasztalatai alapján sok esetben a károsodott virágokból jelentős gyümölcsök fejlődtek ki. A kár hamarosan egyértelművé válik, amikor a virágok ki fognak nyílni, és megmutatkozik, mennyi termékenyül meg, illetve mennyi gyümölcskezdemény indul el a fejlődésben. Javasoljuk, hogy a gyümölcshullás fenológiai állapotáig a növényvédelmi munkát folytassuk, ugyanolyan határozott védekezéssel, mint eddig.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Növénykondicionálás</strong></p>
<p style="text-align: justify;">Kicsit szkeptikusan állunk az ilyen mértékű fagykár után a kondicionáló termékek hatékonyságához, azonban általánosságban elmondható, hogy bármilyen olyan szer, amely mérsékli a fagystresszt, illetve javítja a növény kondícióját, hasznos lehet. Ilyenek például az aminósav készítmények, algakivonatok, naftilacetamid hatóanyagok (a gyümölcsritkító dózis 25%-ban kijuttatva), növénykondicionáló anyagok, valamint a gibberelin kijuttatása, amely segítheti a még nem vagy csak részben sérült virágzatok túlélését és fejlődését.</p>
<p style="text-align: justify;">A Regalis Plus 5 cm hajtáshosszúságú változatának kijuttatása elősegíti a gyümölcsök megkötődését, bár ez erősen egyedfüggő és fajtákonként változó, ezért nehéz általános tanácsot adni. Az első kezelés esetében 2 kg/ha alkalmazása javasolt, majd 3 hét múlva 1 kg/ha-ral ismételni. A készítmény hatása abban rejlik, hogy a hajtások csökkenése mellett a tápanyag és az energia nem a hajtásokba, hanem a gyümölcskezdeménybe kerül. Érdemes ezt a kezelést olyan esetekben alkalmazni, ahol a kár teljes mértékű.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Fagykár bejelentése</strong></p>
<p style="text-align: justify;">A fagykár bejelentését a káreseményt követő 15 napon belül kell megtenni. Egységes Kérelem beadási időszakában (2025.04.07–2025.06.10-ig) május 31-ig van lehetőség a bejelentésre. Arra kérjük a gazdákat, hogy a fagykár felvételére várják meg a virágzást, amely a következő 15 napon belül meg fog történni, így a valós károknak megfelelő állapotot tudjuk jelenteni.</p>
<p style="text-align: justify;">A piaci biztosítást a káresemény előtt meg kell kötni, különben nem jár a kárenyhítésből a 80%-os térítés; ellenkező esetben a kárenyhítésből a kár 40%-áért lehet kártérítést kapni!</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p style="text-align: justify;">Jelenleg az alma kezdeti, zöldbimbós, illetve piros bimbós állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Betegségek</strong></p>
<p style="text-align: justify;"><em>Almafa varasodás:</em></p>
<p style="text-align: justify;">Bár jelenleg a varasodás nem elsődleges problémánk, ne felejtsük el, hogy a betegség nagy ütemben terjed, mivel a klimatikus tényezők optimálisak hozzá. Az elmúlt héten az alacsony hőmérséklet lassította a betegség terjedését, de nem állította meg azt. A csapadék mennyisége és a várható felmelegedés szintén kedveznek a varasodás fertőzésének kialakulásához az alma érzékeny stádiumában, amikor a virágok nyílni fognak, és a csészelevelek szabadon vannak, így a fertőzés könnyen kialakulhat, egyenes utat adva a gyümölcsfertőzésnek.</p>
<p style="text-align: justify;">A védekezésre mindenképpen felszívódó készítményeket javasolunk, kontakt készítményekkel kiegészítve. Bár a lombfelület továbbra is kicsi, a permetlé viszonylag kisebb százaléka érvényesül, ezért fontos, hogy a kis lombfelület védelme maximális legyen.</p>
<p style="text-align: justify;"><em>Lisztharmat:</em></p>
<p style="text-align: justify;">A lisztharmat az áttelelt, fertőzött hajtásvégekről indul ki, a fertőzött területeken a primer fertőzés már megjelent, főleg ott, ahol az előző évben hiányos volt a védekezés, és a gomba fel tudott szaporodni.</p>
<p style="text-align: justify;"><em>Tűzelhalás:</em></p>
<p style="text-align: justify;">Mivel a virágzás most kezdődik, tekintettel arra, hogy a bimbók a legnagyobb mértékben károsodtak, várhatóan az idén a tűzelhalás nem okoz jelentős kárt.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Javasolt készítmények varasodás ellen</strong></p>
<p style="text-align: justify;">• Chorus 50 WG (0,4–0,45 kg/ha) + kontakt készítmény<br />
• Qualy (0,6–0,75 l/ha) + kontakt készítmény<br />
• Faban 500 SC (1,2 l/ha)<br />
• Scala (1,5 l/ha) + kontakt készítmény</p>
<p style="text-align: justify;">Az emelkedő hőmérséklettel az azol típusú készítmények is alkalmazhatók:</p>
<p>• Dagonis (maximum dózis 2 l/ha). A dózis a lombkorona felületétől függ, például 4 m-es sortáv és 3,25 m magas lomborona esetében már a maximum dózist kell alkalmazni. <a href="https://defenso.hu/kalkulatorok/lombfelulet-kalkulator" target="_blank" rel="noopener">A dózis kiszámításához használja a gyártó kalkulátorát. </a></p>
<p>Score 250EC (Difcore 250 EC, Alfa Solo, Difo…) (0,2 l/ha) + Merpan 80WDG (1,25–2 kg/ha)• Luna Experience (0,5–0,75 l/ha)<br />
• Folicur Solo (0,5 l/ha) + kontakt készítmény<br />
Figyelem! Mospilan-al és Sivanto Primmal egymenetben, virágzáskor, csillagászati naplemente előtt egy órával lehet megkezdeni, és 23:00-ra be kell fejezni a kezeléseket.<br />
• Fontelis 20 SC (0,5–0,7 l/ha)<br />
• Flint Max (0,2–0,3 kg/ha) + kontakt készítmény<br />
• Reviona (maximum dózis 2 l/ha). A dózis a lombkorona felületétől függ: 4 m-es sortáv és 3 m magas lomborona esetében már a maximum dózist alkalmazzuk. <a href="https://defenso.hu/kalkulatorok/revyona-lombfelulet-kalkulator" target="_blank" rel="noopener">A dózis kiszámításához használja a gyártó kalkulátorát.</a></p>
<p style="text-align: justify;"><em>A Merpan 80WDG felhasználásáról</em></p>
<p style="text-align: justify;">Az idei évtől a Merpan 80WDG felhasználása módosult: az engedélyezési okiratba belekerült, hogy a talajra jutó hatóanyag mennyiségét 20%-kal csökkenteni kell. Ez nem azt jelenti, hogy a dózist kell csökkenteni vagy a felhasználást visszafogni, csupán a talajra jutó mennyiséget kell mérsékelni. Ezt úgy érhetjük el, hogy az alsó szórófejeket pontosan beállítjuk, hogy kevesebb jusson a talajra, esetleg légbeszívásos szórófejeket alkalmazunk, vagy abban a fenológiai stádiumban használjuk, amikor már a lombfelület olyan nagymértékben rendelkezésre áll, hogy a hatóanyag a lombkoronán érvényesül. Ezek minden esetben csak felhasználási javaslatok, nem kötelező jellegű alkalmazástechnikai módszerek – bár javasoljuk mindenkinek az alkalmazásukat.</p>
<p style="text-align: justify;"><em>Kéntartalmú készítmények</em></p>
<p style="text-align: justify;">A kéntartalmú készítményeket az alacsonyabb nyári dózisban használjuk, elsősorban ott javasoljuk, ahol a fertőzött hajtásvégek metszéskori eltávolítása nem volt sikeres, illetve ahol az előző évben az atkák komoly gondot okoztak.<br />
• Kumulus-S (3–4 kg/ha)<br />
• Thiovit Jet (3–4 kg/ha)<br />
• Necator Plus (3–4 kg/ha)<br />
• Cosavet DF (3–4 kg/ha)</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Állati kártevők</strong></p>
<p style="text-align: justify;"><em>Zöld almalevéltetű:</em></p>
<p style="text-align: justify;">A levéltetvek áttelelő egyedei (ősanyák) már előfordulhatnak a kis levélek védelmében. A szívogatást már elkezdik, és hamarosan kártételük erősödni fog. Hőmérséklettől függően az első telepeiket kialakítják, hangyák is megfigyelhetők a hajtásvégeken, amelyek segítik a kolóniák kialakulását.</p>
<p style="text-align: justify;"><em>Vértetű</em></p>
<p style="text-align: justify;">A gyökérnyaki szinten áttelelt vértetű egyedek most vándorolnak fel a lombkoronába, és elkezdik a telepek kiépítését, míg az ágvégi vértetű kolóniák még nem alakultak ki. Az ellenük való védekezés nehéz, mivel a vattaszerű telepek alatt a kártevő szépen szaporodik. Javasoljuk az ellenük való védekezést: a friss hajtásokon megjelenő vértetű esetében a felszívódó rovarölő szerek hatékonyak.</p>
<p style="text-align: justify;"><em>Májusi cserebogár</em></p>
<p style="text-align: justify;">Várható, hogy a májusi cserebogár meg fog jelenni az ültetvényekben. Az ellenük való védekezésben kulcsfontosságú, hogy előzetesen védekezzünk az imágók ellen, mivel később, amikor már a lárva a talajban károsít, kevés lehetőség marad a hatékony védekezésre. A kezelésekhez elsősorban kontakt készítményeket javasolunk.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h2>
<p style="text-align: justify;">A meggy jelenleg fehérbimbós, virágzás kezdeti állapotban található.</p>
<p style="text-align: justify;"><em>Virágfertőző monília</em></p>
<p style="text-align: justify;">Az előző kiadványban már felhívtuk a figyelmet a virágfertőző monília elleni korai védekezésre. A fertőzési nyomás az elmúlt héten nem csökkent, mivel a csapadék mennyisége és a hőmérséklet emelkedése miatt a monília fertőzési veszélye nem fog mérséklődni. A meggy érzékeny állapotban van, és a fagykár miatt sérült bibék nem fognak fertőződni a moníliával; ezért a fertőzés mértéke kisebb lehet, de ez teljesen helyszínfüggő.</p>
<p style="text-align: justify;"><em>Poloskaszagú szilvadarázs</em></p>
<p style="text-align: justify;">A poloskaszagú szilvadarázs a tojásait a bibe szárára rakja, a kikelő lárvák pedig a gyümölcskezdeménybe fúródnak, ott kárt okozva. Az ellenük való védekezést a virágzás végén, felszívódó készítményekkel kell megkezdeni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Javasolt növényvédő szerek gombás betegségek ellen</strong></p>
<p style="text-align: justify;">• Signum WG (0,75–1 l/ha) + Merpan 80WDG (1,25–2 kg/ha)<br />
• Chorus 50 WG (0,35–0,4 kg/ha) + Merpan 80WDG (1,25–2 kg/ha)<br />
• Folicur Solo (0,75–1 l/ha) + Merpan 80WDG (1,25–2 kg/ha)</p>
<p style="text-align: justify;">Figyelem! Mospilan-al egymenetben, virágzáskor, csillagászati naplemente előtt egy órával lehet megkezdeni, és 23:00-ra be kell fejezni a kezeléseket.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ŐSZIBARACK</h2>
<p style="text-align: justify;">Az őszibarack virágzásának vége állapotában van.</p>
<p style="text-align: justify;"><em>Tafrinás levélfodrosodás</em></p>
<p style="text-align: justify;">A tafrinás levélfodrosodás fertőzése a hűvös időjárásnak köszönhetően az elmúlt héten jelentősen terjedt, azonban a várható hőmérséklet emelkedés valószínűleg megállítja a betegség további terjedését.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Javasolt permetezések</strong></p>
<p style="text-align: justify;">• Score 250EC (0,2 l/ha) + Delan 700 WG (0,75 l/ha)<br />
• Score 250EC (0,2 l/ha) + Merpan 80WDG (1,25–2 kg/ha)<br />
• Syllit vagy Dodifan SC (1,7–2,25 l/ha)</p>
<p><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-587" src="https://www.demotrade.hu/wp-content/uploads/fagy_page_1.png" alt="Fagy - 2025.04.15." width="2481" height="3508" title="Fagyos tavasz, sorsdöntő hetek a gyümölcsösökben 3" srcset="https://www.demotrade.hu/wp-content/uploads/fagy_page_1.png 2481w, https://www.demotrade.hu/wp-content/uploads/fagy_page_1-1280x1810.png 1280w, https://www.demotrade.hu/wp-content/uploads/fagy_page_1-980x1386.png 980w, https://www.demotrade.hu/wp-content/uploads/fagy_page_1-480x679.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2481px, 100vw" /></p>
<p><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-588" src="https://www.demotrade.hu/wp-content/uploads/fagy_page_2.png" alt="Fagy - 2025.04.15." width="2481" height="3508" title="Fagyos tavasz, sorsdöntő hetek a gyümölcsösökben 4" srcset="https://www.demotrade.hu/wp-content/uploads/fagy_page_2.png 2481w, https://www.demotrade.hu/wp-content/uploads/fagy_page_2-1280x1810.png 1280w, https://www.demotrade.hu/wp-content/uploads/fagy_page_2-980x1386.png 980w, https://www.demotrade.hu/wp-content/uploads/fagy_page_2-480x679.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2481px, 100vw" /></p>
<p style="text-align: justify;">További szakmai tanácsokért megtalálhatók vagyunk a Kapcsolat menüpontban.</p>
<p style="text-align: justify;">Moravszki Gábor: 30/346-2848</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-u0hwvo7ke', 'blog', 'Fagyveszély és fertőzési hullám: Fokozott figyelmet igényelnek az ültetvények', 'alma', 'Mitruné Tóth Krisztina', '2025.04.03.', '/images/Fagyveszely-es-fertozesi-hullam-fokozott-figyelmet-igenyelnek-az-ultetvenyek-980x551.jpg', 'Az előttünk álló napokban jelentős lehűlésre és fagyveszélyre kell számítani, miközben az almafa-varasodás fertőzési nyomása is egyre erősebb. A következő időszakban kiemelten fontos a gyors, megelőző védekezés, különösen az alma, a meggy, a cseresznye és az őszibarack esetében. Az alábbi szaktanács részletesen bemutatja az aktuális helyzetet, a védekezési lehetőségeket és az ajánlott növényvédő szereket. A ...', '<p class="" style="text-align: justify;" data-start="895" data-end="1410"><strong>Az előttünk álló napokban jelentős lehűlésre és fagyveszélyre kell számítani, miközben az almafa-varasodás fertőzési nyomása is egyre erősebb. A következő időszakban kiemelten fontos a gyors, megelőző védekezés, különösen az alma, a meggy, a cseresznye és az őszibarack esetében. Az alábbi szaktanács részletesen bemutatja az aktuális helyzetet, a védekezési lehetőségeket és az ajánlott növényvédő szereket.</strong></p>
<p class="" style="text-align: justify;" data-start="895" data-end="1410">A meteorológiai előrejelzések alapján vasárnap, hétfőn és kedden (2025.04.07–09.) fagyveszélyre lehet számítani. A fagykár mértékét az fogja meghatározni, hogy az adott növény milyen fenológiai stádiumban van. Az almások nagy részét a kezdeti zöldbimbós állapotban érheti el a fagy, ebben az állapotban még nem annyira sérülékeny a virágkezdemény. Azokban a gyümölcsösökben, ahol már a zöldbimbós állapot teljesen kifejlődött, vagy a csonthéjasokban még fejlettebb stádiumban lévő fák, minden bizonnyal sérülhetnek.</p>
<p class="" style="text-align: justify;" data-start="895" data-end="1410"><span style="text-decoration: underline;"><strong>Fagykár bejelentése:</strong></span></p>
<p class="" style="text-align: justify;" data-start="1444" data-end="1799">A fagykárt a káreseményt követő 15 napon belül kell bejelenteni. Az Egységes Kérelem beadási időszakában (2025.04.07–2025.06.10.) május 31-ig van lehetőség a bejelentésre. Arra kérem a gazdákat, hogy a fagykár felvételére várjuk meg a virágzást, ami az elkövetkező 15 napon belül be fog következni. Így a valós kárnak megfelelő állapotot tudjuk jelenteni.</p>
<p class="" style="text-align: justify;" data-start="1801" data-end="1989"><strong data-start="1801" data-end="1812">Fontos:</strong> Piaci biztosítást a káreseményig meg kell kötni, különben nem jár a kárenyhítésből a 80%-os térítés. Ennek hiányában a kárenyhítésből csak a kár 40%-ára lehet támogatást kapni.</p>
<p class="" data-start="1801" data-end="1989"><span style="text-decoration: underline;"><strong>A fagyvédelemről:</strong></span></p>
<ul data-start="2020" data-end="3657">
<li class="" data-start="2020" data-end="2165">
<p class="" style="text-align: justify;" data-start="2022" data-end="2084">Megelőző növénykondicionáló készítmények kijuttatása javasolt:</p>
<ul style="text-align: justify;" data-start="2087" data-end="2165">
<li class="" data-start="2087" data-end="2104">
<p class="" data-start="2089" data-end="2104">Frigocur 0,3 l/ham korai zöldbimbós állapotig 1 l/ha</p>
</li>
<li class="" data-start="2107" data-end="2143">
<p class="" data-start="2109" data-end="2143">Megafol 2–3 l/ha + Boroplus 1 l/ha</p>
</li>
<li class="" data-start="2146" data-end="2165">
<p class="" data-start="2148" data-end="2165">RhizoMagic 3 l/ha</p>
</li>
</ul>
</li>
<li class="" style="text-align: justify;" data-start="2166" data-end="2349">
<p class="" style="text-align: justify;" data-start="2168" data-end="2349">Bármilyen védekezés, ami plusz energiabevitellel jár, csak akkor hatásos, ha a teljes fagy által lefedett időintervallumban végig tudjuk tartani – jelen esetben ez 8–9 óra is lehet.</p>
</li>
<li class="" style="text-align: justify;" data-start="2350" data-end="2453">
<p class="" data-start="2352" data-end="2453">A leghatékonyabb védekezést a fagygyertyák nyújthatják, bár -10 °C alatt ezek használata is kérdéses.</p>
</li>
<li class="" style="text-align: justify;" data-start="2454" data-end="2646">
<p class="" data-start="2456" data-end="2646">A propán-bután gáz elégetésével végzett fagyvédelem kb. -5 °C-ig hatásos. A fordulók szűkítésével alacsonyabb hőmérsékleten is védekezhetünk, viszont ekkor csökken a védett terület nagysága.</p>
</li>
<li class="" style="text-align: justify;" data-start="2647" data-end="2744">
<p class="" data-start="2649" data-end="2744">A ködsárkány is csak -2, -3 °C-ig hatásos. Fontos, hogy elegendő hőenergiát tudjunk kijuttatni.</p>
</li>
<li class="" style="text-align: justify;" data-start="2745" data-end="3092">
<p class="" data-start="2747" data-end="3092">A légkeverő berendezések csak kisugárzásos fagy esetén hatásosak. A készülékek elindítása előtt minden esetben bizonyosodjunk meg arról, hogy a szélkerék magasságában a hőmérséklet fagypont feletti. Ha szállított faggyal találkozunk (a levegőoszlop teljes magasságában 0 °C alatti a hőmérséklet), akkor nagyobb kárt okozhatunk, mint maga a fagy.</p>
</li>
<li class="" style="text-align: justify;" data-start="3093" data-end="3224">
<p class="" data-start="3095" data-end="3224">A fagy utáni stresszkezelő, növénykondicionáló szerek legjobb esetben is csak -2 °C felett tudnak bármilyen sérülést csökkenteni.</p>
</li>
<li class="" style="text-align: justify;" data-start="3225" data-end="3657">
<p class="" data-start="3227" data-end="3657">A fagyvédelmi öntözés csak megfelelő berendezésekkel és elegendő mennyiségű öntözővízzel lehetséges. Ebben az esetben a teljes 0 °C alatti időintervallumban (jelen esetben 8–9 óra) folyamatosan kell biztosítani a vízellátást, egészen addig, amíg kisüt a nap és a jég teljesen leolvad a fákról. Permetezőgéppel történő tisztavízzel történő permetezést nem javaslom – csak további kárt okozunk vele, és a permetezőgép is károsodhat.</p>
</li>
</ul>
<p class="" style="text-align: justify;" data-start="3664" data-end="3932">A meteorológiai előrejelzések szerint április 6-án nagyobb lehűlés várható, ezt követően a nappali maximum hőmérséklet 6–10 °C között fog ingadozni. Az éjszakai fagyokra április 7-től számíthatunk. 2025.04.07-re -3 °C-ot, 04.08-ra -3 °C-ot, 04.09-re -2 °C-ot jósolnak.</p>
<p class="" style="text-align: justify;" data-start="3934" data-end="4195">Csapadék az elkövetkező hét elején várható. A talajok vízkapacitása jó, a téli nedvesség feltöltötte, jelenleg nincs vízhiány. Amennyiben a virágzásig nem lesz eső, akkor az intenzív, sekélyen gyökerező ültetvényekben érdemes elindítani az öntözőberendezéseket.</p>
<h2 data-start="3934" data-end="4195"></h2>
<h2 data-start="3934" data-end="4195">ALMA</h2>
<p class="" style="text-align: justify;" data-start="4213" data-end="4331"><strong data-start="4213" data-end="4236">Fenológiai állapot:</strong> Kezdeti zöldbimbó. Az Idared esetében a királyvirágok néhol már pirosbimbós állapotban vannak.</p>
<p class="" style="text-align: justify;" data-start="4213" data-end="4331"><span style="text-decoration: underline;"><strong>Betegségek</strong></span></p>
<p class="" style="text-align: justify;" data-start="4213" data-end="4331"><strong data-start="4356" data-end="4377">Almafa-varasodás:</strong></p>
<p class="" style="text-align: justify;" data-start="4379" data-end="4822">Az aszkospórák szóródása és a varasodás betegség elindulása már 2025.03.23-án megtörtént. Azóta az időjárás a betegség terjedésének kedvez, a kezdeti fertőzési nyomás nagyon magas. A felszívódó készítményekkel történő kezelések kimondottan fontosak. A lombfelület gyors növekedése és a magas fertőzési nyomás miatt a készítmények hatása gyorsan csökken, ezért javasolt a permetezési fordulók szűkítése – a heti egyszeri védekezés nem elegendő.</p>
<p class="" style="text-align: justify;" data-start="4824" data-end="5040">A védekezésre mindenképp felszívódó készítményt javaslunk kontakt szerekkel kiegészítve. A lombfelület még kicsi, a permetlé viszonylag kis része hasznosul, de ennek a kis lombfelületnek a védelme is kulcsfontosságú.</p>
<p class="" data-start="5042" data-end="5084"><strong data-start="5042" data-end="5084">Javasolt készítmények varasodás ellen:</strong></p>
<ul data-start="5086" data-end="5350">
<li class="" data-start="5086" data-end="5142">
<p class="" data-start="5088" data-end="5142"><strong data-start="5088" data-end="5104">Chorus 50 WG</strong> (0,4–0,45 kg/ha) + kontakt készítmény</p>
</li>
<li class="" data-start="5143" data-end="5191">
<p class="" data-start="5145" data-end="5191"><strong data-start="5145" data-end="5154">Qualy</strong> (0,6–0,75 l/ha) + kontakt készítmény</p>
</li>
<li class="" data-start="5192" data-end="5221">
<p class="" data-start="5194" data-end="5221"><strong data-start="5194" data-end="5210">Faban 500 SC</strong> (1,2 l/ha)</p>
</li>
<li class="" data-start="5222" data-end="5265">
<p class="" data-start="5224" data-end="5265"><strong data-start="5224" data-end="5233">Scala</strong> (1,5 l/ha) + kontakt készítmény</p>
</li>
<li class="" data-start="5266" data-end="5350">
<p class="" data-start="5268" data-end="5350"><strong data-start="5268" data-end="5303">Réztartalmú lemosó készítmények</strong> – már nem javasolt, kivéve bio ültetvényekben.</p>
</li>
</ul>
<p class="" data-start="5357" data-end="5373"><strong data-start="5357" data-end="5373">Lisztharmat:</strong></p>
<p class="" style="text-align: justify;" data-start="5375" data-end="5536">A lisztharmat az áttelelt, fertőzött hajtásvégekről indul. A primer fertőzés megjelent főként azokon a területeken, ahol az előző évben hiányos volt a védekezés.</p>
<p class="" style="text-align: justify;" data-start="5375" data-end="5536"><span style="text-decoration: underline;"><strong>Aszkospóra-szóródás adatai (2025.03.25. és 04.03.)</strong></span></p>
<div id="attachment_574" style="width: 2980px" class="wp-caption alignnone"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-574" class="size-full wp-image-574" src="https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_04_03.png" alt="Aszkospóra-szóródás adatai (2025.03.25. és 04.03.)" width="2970" height="722" title="Fagyveszély és fertőzési hullám: Fokozott figyelmet igényelnek az ültetvények 5" srcset="https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_04_03.png 2970w, https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_04_03-1280x311.png 1280w, https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_04_03-980x238.png 980w, https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_04_03-480x117.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2970px, 100vw" /><p id="caption-attachment-574" class="wp-caption-text">Aszkospóra-szóródás adatai (2025.03.25. és 04.03.)</p></div>
<p class="" data-start="5694" data-end="5783"><strong data-start="5694" data-end="5741">Kéntartalmú készítmények lisztharmat ellen:</strong><br data-start="5741" data-end="5744" />(Az alacsonyabb, nyári dózis javasolt.)</p>
<ul data-start="5785" data-end="5892">
<li class="" data-start="5785" data-end="5810">
<p class="" data-start="5787" data-end="5810">Kumulus-S (3–4 kg/ha)</p>
</li>
<li class="" data-start="5811" data-end="5838">
<p class="" data-start="5813" data-end="5838">Thiovit Jet (3–4 kg/ha)</p>
</li>
<li class="" data-start="5839" data-end="5867">
<p class="" data-start="5841" data-end="5867">Necator Plus (3–4 kg/ha)</p>
</li>
<li class="" data-start="5868" data-end="5892">
<p class="" data-start="5870" data-end="5892">Cosavet DF (3–4 kg/ha)</p>
</li>
</ul>
<p class="" data-start="5899" data-end="6119"><span style="text-decoration: underline;"><strong data-start="5899" data-end="5941">Állati kártevők – Bimbólikasztó bogár:</strong></span></p>
<p class="" data-start="5899" data-end="6119">A bogár már lerakta a petéit. A védekezést korábban kellett volna elvégezni, most már nem javasolt, mert a lárvák védett helyen károsítanak, növényvédő szerrel nem érhetők el.</p>
<h2 data-start="5899" data-end="6119"></h2>
<h2 data-start="5899" data-end="6119">MEGGY, SZILVA</h2>
<p data-start="5899" data-end="6119"><span style="text-decoration: underline;"><strong>Virágfertőző monília</strong></span></p>
<p class="" data-start="6173" data-end="6563">A meggy fehérbimbós állapota hamarosan megjelenik, a korai fajták napokon belül ebben a stádiumban lesznek. A cseresznye már fehérbimbós állapotban van. A védekezés szempontjából a fehérbimbós állapot a legfontosabb, mert ilyenkor a bibeszár nyitott, és a gombaspórák is ezt használják a fertőzésre. Ilyenkor már csak felszívódó készítményeket javaslunk, a rezes kezeléseket el kell hagyni.</p>
<p class="" data-start="6565" data-end="6653"><strong data-start="6565" data-end="6653">Sokkal fontosabb a jól időzített fehérbimbós védekezés, mint a későbbi virágzáskori!</strong></p>
<p class="" data-start="6655" data-end="6725">A bórtartalmú lombtrágyák kijuttatása is ebben az időszakban javasolt.</p>
<p class="" data-start="6727" data-end="6936">A további csapadék és a napi hőmérséklet-ingadozás miatt harmat, köd is kialakulhat, ami elősegíti a betegség terjedését. A fehérbimbós állapot és a sziromhullás között akár három védekezés is szükséges lehet.</p>
<p class="" data-start="6943" data-end="6998"><strong data-start="6943" data-end="6998">Javasolt növényvédő szerek gombás betegségek ellen:</strong></p>
<ul data-start="7000" data-end="7277">
<li class="" data-start="7000" data-end="7066">
<p class="" data-start="7002" data-end="7066"><strong data-start="7002" data-end="7015">Signum WG</strong> (0,75–1 l/ha) + <strong data-start="7032" data-end="7049">Merpan 80 WDG</strong> (1,25–2 kg/ha)</p>
</li>
<li class="" data-start="7067" data-end="7139">
<p class="" data-start="7069" data-end="7139"><strong data-start="7069" data-end="7085">Chorus 50 WG</strong> (0,35–0,4 kg/ha) + <strong data-start="7105" data-end="7122">Merpan 80 WDG</strong> (1,25–2 kg/ha)</p>
</li>
<li class="" data-start="7140" data-end="7277">
<p class="" data-start="7142" data-end="7277"><strong data-start="7142" data-end="7158">Folicur Solo</strong> (0,75–1 l/ha) + <strong data-start="7175" data-end="7192">Merpan 80 WDG</strong> (1,25–2 kg/ha)<br data-start="7207" data-end="7210" />⚠️ Virágzás alatt <strong data-start="7230" data-end="7277">Mospilan-nal egy menetben kijuttatni TILOS!</strong></p>
</li>
</ul>
<h2></h2>
<h2></h2>
<h2>ŐSZIBARACK</h2>
<p class="" data-start="7300" data-end="7329"><span style="text-decoration: underline;"><strong data-start="7300" data-end="7329">Tafrinás levélfodrosodás</strong></span></p>
<p class="" data-start="7331" data-end="7531">Már megjelent, a kis leveleken sárgászöld elszíneződés figyelhető meg. A hűvös időjárás kifejezetten kedvezett a betegség terjedésének, és a következő héten várható lehűlés tovább erősíti a fertőzést.</p>
<p class="" data-start="7533" data-end="7559"><strong data-start="7533" data-end="7559">Javasolt permetezések:</strong></p>
<ul data-start="7561" data-end="7625">
<li class="" data-start="7561" data-end="7625">
<p class="" data-start="7563" data-end="7625"><strong data-start="7563" data-end="7579">Score 250 EC</strong> (0,2 l/ha) + <strong data-start="7593" data-end="7610">Merpan 80 WDG</strong> (1,25–2 kg/ha)</p>
</li>
</ul>
<p class="" data-start="7632" data-end="7686"><strong data-start="7632" data-end="7686">További szakmai tanácsokért bizalommal keressenek:</strong></p>
<p class="" data-start="7688" data-end="7724"><strong data-start="7688" data-end="7707">Moravszki Gábor</strong><br data-start="7707" data-end="7710" />📞 30/346-2848</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-ci2xor2np', 'blog', 'Elindult az almafa-varasodás – Fontos a korai védekezés!', 'alma', 'Mitruné Tóth Krisztina', '2025.03.25.', '/images/Elindult-az-almafa-varasodas-fontos-a-korai-vedekezes-1080x675.jpg', 'Bár az idei év hűvös kezdete késleltette a természet indulását, a napokban már megjelentek az almafa-varasodás első jelei. Az aszkospórák szóródása március 23–24-én megkezdődött, ezért kiemelten fontos a gyors és hatékony növényvédelem. Az alábbi szaktanács részletesen bemutatja a helyzetet és a javasolt kezeléseket. &#160; ALMA Jelenleg egérfül–kezdeti zöldbimbó állapotában van. &#160; Betegségek &#160; Almafa-varasodás Az ...', '<p style="text-align: justify;"><strong>Bár az idei év hűvös kezdete késleltette a természet indulását, a napokban már megjelentek az almafa-varasodás első jelei. Az aszkospórák szóródása március 23–24-én megkezdődött, ezért kiemelten fontos a gyors és hatékony növényvédelem. Az alábbi szaktanács részletesen bemutatja a helyzetet és a javasolt kezeléseket.</strong></p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p style="text-align: justify;">Jelenleg egérfül–kezdeti zöldbimbó állapotában van.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almafa-varasodás</strong></span></p>
<p style="text-align: justify;">Az idén az előző évhez képest később indult a természet. A téli időjárás nem kedvezett az aszkospórák kialakulásához, gyakorlatilag az aszkuszok és az aszkospórák kifejlődéséhez január 22-ig alig volt alkalmas időpont. A kedvezőtlen téli időjárás miatt számíthattunk egy későbbi spóraszóródásra.</p>
<p style="text-align: justify;">A számítás csak részben jött be, hiszen az aszkospórák a 2025.03.24-i vizsgálataink alapján elkezdtek szóródni. A fertőzéshez szükséges lombfelület már adott – a 2025.03.24-i kertszemlék alapján az almák rügyeinek kb. 75%-a egérfüles állapotban található, tehát a fertőzőképes lombfelület már adott. A fertőzés harmadik feltétele, a levélfelületi nedvesség, megyei szinten mindenhol már 2025.03.23-tól adott volt.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;">Számításaink szerint a varasodás fertőzése 2025.03.23. és 24-én elindult!</span></p>
<p style="text-align: justify;">Azt gondolhatnánk, hogy a varasodás az idei évben igen korán, már az egérfüles állapotban elindult, de ha összehasonlítjuk az előző éveket, azt tapasztaljuk, hogy az elmúlt 10 évből 8-ban már ekkor fertőzött a gomba. A korai fertőzés megállítása nagyon fontos, hiszen ezekből a leveleken kialakuló telepekből már korán kifejlődhetnek a konídiumtelepek, amelyek a terméskezdemény közelében hamar be tudják fertőzni a későbbi kis gyümölcsöt.</p>
<p style="text-align: justify;">A védekezésre mindenképp felszívódó készítményt javaslunk. Akik esetleg még nem végezték el a rezes lemosó kezeléseket, már inkább hagyják ki, és kezdjék a permetezést felszívódó készítményekkel. A lombfelület nagyon kicsi, a permetlé viszonylag kis százaléka fog érvényesülni, de az is nagyon fontos. Az eredményes védekezésben kulcsfontosságú, hogy az első fertőzések „meg legyenek fogva”. Aki eddig még nem védekezett felszívódó gombaölő szerrel, mindenképp kezdje el, amint a területre rá lehet menni. A meteorológiai előrejelzések csapadékot jósolnak a hét több napjára, ezért javasoljuk a kezelések megismétlését még ezen a héten.</p>
<p style="text-align: justify;">A tervezett védekezésekkor minden esetben legyünk arra tekintettel, hogy:<br />
A napi átlaghőmérséklet az elkövetkező napokban 10–12°C közt várható. Viszonylag magas csapadék, nedvesség a hét majdnem minden napjára várható. Ilyen feltételek mellett az aszkospórák szóródása, majd a levél felületén a csírázása folyamatos – kb. 8–10 óra levélfelületi nedvesség már elég a fertőzéshez.</p>
<p style="text-align: justify;">Az almások fenológiai állapota egérfüles állapotban van, a magas várható hőmérséklet miatt a vegetációs felület rohamosan, napról napra fog nőni. A kijuttatott szereknek ezzel arányosan csökken a hasznosulása, a kezelések ismétlése szükséges.</p>
<p style="text-align: justify;">A hagyományos technológia réztartalmú, kontakt szerek használata nem javasolt.</p>
<p style="text-align: justify;">Bár a lombfelület kicsi, ennek ellenére olyan készítményt kell alkalmaznunk, aminek tartamhatása is van – ezért javasoljuk a felszívódó szerek használatát.</p>
<p>&nbsp;</p>
<p><strong>Aszkospóra-szóródás adatai (2025.03.25.)</strong></p>
<p>A vizsgálatok alapján az alábbi helyszíneken már kimutatható az aszkospórák szóródása:</p>
<div id="attachment_565" style="width: 2380px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-565" class="size-full wp-image-565" src="https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_03_25.png" alt="Aszkospóra-szóródás adatai (2025.03.25.)" width="2370" height="570" title="Elindult az almafa-varasodás – Fontos a korai védekezés! 6" srcset="https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_03_25.png 2370w, https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_03_25-1280x308.png 1280w, https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_03_25-980x236.png 980w, https://www.demotrade.hu/wp-content/uploads/aszkospora_szorodas_2025_03_25-480x115.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2370px, 100vw" /><p id="caption-attachment-565" class="wp-caption-text">Aszkospóra-szóródás adatai (2025.03.25.)</p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Javasolt készítmények varasodás ellen</strong></p>
<ul style="text-align: justify;">
<li>Chorus 50 WG (0,4–0,45 kg/ha)</li>
<li>Qualy (0,6–0,75 l/ha)</li>
<li>Faban 500 SC (1,2 l/ha)</li>
<li>Scala (1,5 l/ha)</li>
</ul>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért a <a href="/kapcsolat">Kapcsolat menüpontban</a> vagyunk elérhetőek.</p>
<p style="text-align: justify;">Moravszki Gábor<br />
📞 30/346-2848</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-s3a82wges', 'blog', 'Megjelent az első kártevő az almásokban – Indulhat a védekezés!', 'alma', 'Mitruné Tóth Krisztina', '2025.03.07.', '/images/Megjelent-az-elso-kartevo-az-almasokban-indulhat-a-vedekezes-1080x675.jpg', 'Ahogy a nappali hőmérséklet emelkedik, a gyümölcsösök is ébredeznek a téli nyugalomból. A bimbólikasztó bogár már megjelent az almaültetvényekben, így itt az ideje figyelni és szükség esetén védekezni. Az alábbi szakmai összefoglaló részletesen bemutatja az aktuális megfigyeléseket, valamint a javasolt növényvédelmi teendőket. &#160; A vegetációs idő lassan elkezdődik. Ültetvényeink még nyugalmi állapotban találhatóak, a hőmérséklet ...', '<p style="text-align: justify;"><strong>Ahogy a nappali hőmérséklet emelkedik, a gyümölcsösök is ébredeznek a téli nyugalomból. A bimbólikasztó bogár már megjelent az almaültetvényekben, így itt az ideje figyelni és szükség esetén védekezni. Az alábbi szakmai összefoglaló részletesen bemutatja az aktuális megfigyeléseket, valamint a javasolt növényvédelmi teendőket.</strong></p>
<p>&nbsp;</p>
<p style="text-align: justify;">A vegetációs idő lassan elkezdődik. Ültetvényeink még nyugalmi állapotban találhatóak, a hőmérséklet emelkedésével azonban a természet is éledezik – az első kártevőnk, a bimbólikasztó bogár már meg is jelent a kertekben.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p style="text-align: justify;">Jelenleg nyugalmi állapotában van.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Bimbólikasztó bogár</strong></span></p>
<p style="text-align: justify;">Március első napjaira a hőmérséklet megemelkedett, elérte azt a szintet, amikor a bimbólikasztó bogár megjelenik a kertekben. A téli nyugalmi állapotból már a 8°C feletti hőmérséklet is elő tudja csábítani a bogarakat; jellemzően 14°C alatt csak sétál, felette már repülve közelíti meg az almafákat. A rügyeket meleg nappali időben keresi fel, ilyenkor az almafák ágain található. Kártétele még nem kezdődik el, de már jelen van az ültetvényekben, kontakt szerekkel lehet ellenük védekezni.</p>
<p style="text-align: justify;">A levegő hőmérséklete az idei évben még nem érte el a 8°C-os napi átlagot, de a napos időnek köszönhetően 2025.02.27-től folyamatosan a napi maximum hőmérséklet ezen érték felett van, 03.04. és 03.05-én már el is érte a repüléshez szükséges 14°C-ot is. A meteorológiai állomásaink adatai szerint az elmúlt napokban jellemzően reggel 9 óra és 18 óra között már a napi aktivitáshoz szükséges 8°C feletti hőmérséklet-tartományban vagyunk, a védekezéseket ezen intervallumban már el lehet végezni. A károsító ilyenkor a napos ágakon található meg, a permetezésekre elsősorban a napfényes, meleg napszakokat javasoljuk.</p>
<p style="text-align: justify;">A bimbólikasztó bogár már jelen van, de a kártételét még nem kezdte el. A megjelenést követően 7–10 napig érési táplálkozást végez, majd a megduzzadt rügyekbe rakja a tojásait. Az előző évhez képest várhatóan később, március közepe környékére tehető a tojásrakás kezdete, ami egyben a kártétel kezdete is.</p>
<p style="text-align: justify;">Jelenleg az almafák nyugalmi állapotban vannak, védekezni az érési táplálkozást végző, illetve „napozó” bogarak ellen lehet. Azokban a kertekben, ahol az előző években komoly gondot okoztak, érdemes a permetezéseket elkezdeni. A kertjeinkben saját magunk is ellenőrizhetjük a bimbólikasztó bogár jelenlétét: egy fehér lepedőt kell a talajra helyezni, majd a fát megrázni, vagy egy nagyobb bottal az ágakat meg kell ütögetni – a lepedőre lehulló apró, barnás-szürke ormányos bogarat találunk, jellegzetes kinézetük miatt nem lehet mással összetéveszteni.</p>
<p style="text-align: justify;"><strong>Védekezési lehetőségek</strong></p>
<ul>
<li style="text-align: justify;">A bimbólikasztó bogár a tojásait a bőrszövet alá rakja, ezért nem tudunk ellene hatékonyan olajos lemosó szerekkel, illetve narancsolajjal védekezni.</li>
<li style="text-align: justify;">A felszívódó készítmények azért nem hoznak jelentősebb eredményt, mert nincs lombfelület, ahol fel tudnak szívódni.</li>
<li style="text-align: justify;">Kontakt szerekkel imágók elleni védekezést javasolunk nappal, meleg, lehetőség szerint napsütéses időben. A kontakt szereknek nincs tartamhatása, erős fertőzés esetén javasolt a kezelések akár többszöri megismétlése.</li>
</ul>
<p style="text-align: justify;"><strong>Javasolt készítmények</strong></p>
<ul>
<li style="text-align: justify;">KLARTAN 20 EW, MAVRIK 20 EW (dózis: 0,2–0,3 l/ha) – méhekre nem veszélyes, bármely napszakban használható.</li>
<li style="text-align: justify;">PYREGARD – 2025-ben az eseti engedélye még nem jelent meg, jelenleg nem lehet felhasználni!</li>
<li style="text-align: justify;">KARATE ZEON 5CS (0,2–0,3 l/ha) – méhekre mérsékelten veszélyes.</li>
</ul>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért a <a href="/kapcsolat">Kapcsolat menüpontban</a> vagyunk elérhetőek.</p>
<p style="text-align: justify;">Moravszki Gábor<br />
📞 30/346-2848</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-2udx64mfy', 'blog', 'Növényvédelmi előrejelzés – 2024. július 17.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.07.17.', '/images/novenyvedelmi_elorejelzes-2.jpg', 'Az elkövetkező héten a levegő maximum hőmérséklete 30-34°C között lesz, csapadék vasárnaptól (07.21.) várható. Az előrejelzések szerint helyi viharokra 07.21-25. között minden nap számíthatunk. A gyümölcsök betakarítása már folyamatban van, a korai almafajták már beértek. A kezelések alkalmával minden esetben legyünk figyelemmel az élmezés-egészségügyi várakozási időkre és számítsunk arra is, hogy a gyümölcsösök vegetációja a ...', '<p style="text-align: justify;"><strong>Az elkövetkező héten a levegő maximum hőmérséklete 30-34°C között lesz, csapadék vasárnaptól (07.21.) várható. Az előrejelzések szerint helyi viharokra 07.21-25. között minden nap számíthatunk. A gyümölcsök betakarítása már folyamatban van, a korai almafajták már beértek. A kezelések alkalmával minden esetben legyünk figyelemmel az élmezés-egészségügyi várakozási időkre és számítsunk arra is, hogy a gyümölcsösök vegetációja a korábbi évekhez képest előrébb van, így a betakarítás ideje is korábbra tehető.</strong></p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p style="text-align: justify;">Az alma fejlettsége kertektől, fajtáktól változó, a gála áltagosan 60-70 mm átmérővel rendelkezik.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek</h3>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almafa varasodás:</strong></span><br />
Az almafa varasodás terjedése most lelassult, a jól kezelt tünetmentes ültetvényekben most nem számíthatunk a betegség terjedésére. A meteorológiai előrejelzések az elkövetkező hétre nem jósolnak csapadékot, meleg száraz időjárásra lehet számítani. Ilyen körülmények közt nem terjed a varasodás. Helyi viharokra viszont számíthatunk, javasoljuk, hogy egy-egy jelentősebb eső után kontakt készítménnyel (Merpan 80 WDG, Delan Pro) védekezzünk.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Lisztharmat:</strong></span><br />
A lisztharmat kártétele egyre erőteljesebben jelenhet meg. A magas hőmérséklet, illetve a helyi viharok miatt időszakosan nedves levelek kiváló alkalmat biztosítanak a betegség fejlődéséhez. Ehhez még hozzájárul az is, hogy a hajtásnövekedés fajtáktól függően még folyamatban van, így folyamatosan jelenhetnek meg új levelek. Amennyiben a hajtásnövekedés bezárul, az újrafertőzések is csökkenni fognak.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Tűzelhalás:</strong></span><br />
A tűzelhalás kártétele visszább esett. A magas hőmérséklet, száraz idő nem kedvez a betegség terjedésének. A viharos időjárás, jégeső sérüléseket, sebeket tud okozni a gyümölcsfákon, ami elősegíti a kórokozót a növény szövetébe való bejutáshoz, viszont a száraz, alacsony páratartalmú meleg időjárás hamar beszárítja a baktérium kezdődő telepeit, így sok esetben meghiúsul a kórokozó kártétele. A tűzelhalás komolyabb terjedésére akkor számíthatunk, ha az időjárás csapadékosabbra fordul.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Zöld almalevéltetű:</strong></span><br />
Július második felében vagyunk, várható, hogy az almafák hajtásnövekedése befejeződik. Már láthattuk korábban is, hogy a hajtások csúcsrügyben zárultak, ahogy arra már az ez előtti előrejelzésünkben is utaltunk. A másodlagos hajtásnövekedés elindult, illetve a csúcsrügyek kialakulása még várat magára. Növényvédelmi szempontból ez azért jelentős, mert a zöld almalevéltetű ezeken a friss hajtásvégeken alakítja ki a telepeiket, számíthatunk még az újabb levéltetű kolóniák kialakulására. A kezelésekre mindenképp felszívódó készítményt javaslunk. Erős fertőzés esetén heti rendszerességgel ismételve. Javasoljuk azon készítmények használatát, ami hatással van az almamoly lárvák ellen is (Mospilan), hiszen most van az almamoly második nemzedékének a rajzása.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Vértetű:</strong></span><br />
A vértetű egyre erőteljesebben van jelen az ültetvényekben. Már nem csak a gyökérnyaki részeken, hanem a lombfelületen is meg lehet találni őket. Hagyományos felszívódó szerekkel akkor tudunk ellenük eredményesen védekezni, mikor még zöld növényi részeket károsítanak, a fás részeken károsítók ellen nehezebb védekezni.</p>
<p style="text-align: justify;">Védekezési javaslatunk:<br />
• Gyökérnyaki résznél használhatunk agromésztejet, ügyelve arra, hogy a készítmény ne kerüljön a levelekre.<br />
• Hatásos védekezés még a gyökérsarjak írtása, többnyire ezekre a területekre nem jut növényvédőszer, illetve közel van a gyökérnyakhoz és a gyökereken élő populáció könnyen át tud telepedni.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Atkák:</strong></span><br />
Azt gondoljuk, hogy az elkövetkező időszak egyik jelentősebb kártevői az atkák lesznek. A meleg időjárás felgyorsítja a szaporodásukat, most egy-egy generáció teljes kialakulása megtörténik egy héten belül. Az elszigetelt foltokban megjelenő kártevő nagyon hamar az egész kertben általánossá válhat. Figyeljünk erre oda és időben végezzük el a kezeléseket! Az atkákat a levélen nehéz észrevenni, érdemes jelenlétre utaló jeleket, az ürüléküket (apró fekete pontok) illetve a takácsatkák esetében a levél fonákán a szövedéket keresni. Idővel a leveleken észrevehetőek a szívogatás nyomok, erős fertőzés esetében a levelek bebarnulnak. Ezt az utóbbi állapotot nem szabad megvárni. Ugyan apró kártevők, de hatalmas mennyiségű vizet és tápanyagot tudnak elszívni a növénytől pontosan abban az időszakban, amikor a gyümölcsméret növekedéséhez ez a legfontosabb lenne.</p>
<p style="text-align: justify;">Javasoljuk a kertek szemlézését, és a kezelések megismétlését, illetve ha valaki még nem permetezett atkaölő szerrel, javasoljuk elkezdeni. Problémát elsősorban azokban az ültetvényekben fog okozni, ahol korábban is jelen volt, de ott is javasoljuk a megelőző legalább egyszeri védekezést, ahol nem szokott nagyobb problémát okozni. A kezelésekkor legyünk figyelemmel arra, hogy a takácsatkák a levél fonákán szövedék védelme alatt károsítani, ezért javasolt a nedvesítő szerek, illetve a nagyobb lémennyiség alkalmazása.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Csipkés poloskák:</strong></span><br />
A csipkés poloskákkal még nem találkoztunk az ültetvényekben, de elképzelhető, hogy egyes kertekben már megjelentek. Jellemzően akkor találkozunk velük, amikor a levéltetvek már visszaszorulnak, akkor veszik át a helyüket a csipkés poloskák. A vegetációs idő hátra levő részében számíthatunk a csipkés poloskák megjelenésére, esetleg felszaporodásukra. A levéltetvekkel ellentétben a csipkés poloskák nemcsak az új leveleket, hanem a idősebbeket is szívogatják. Erős fertőzés esetén számíthatunk arra, hogy a vegetációs idő végéig károsíthatnak. A védekezésre felszívódó készítményeket javasolunk.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almamoly:</strong></span><br />
Az almamoly fejlődésénak a sebességét a hőmérséklet szabályozza. A nagy meleg hatására a 2. nemzedék fejlődési szakaszai lerövidültek. A hőösszeg alapján történő előrejelzésünkkel ki tudjuk számolni, hogy a különböző fejlettségi állapotok mikor következnek be. Számunkra a legfontosabb a lárva állapot, hiszen ekkor okozza a kárt a kártevő. A 2. nemzedék a korábbi évektől hamarabb jelent meg, illetve gyorsabban is fejlődik.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h2>
<p style="text-align: justify;">A meggy, cseresznye betakarítás utáni állapotában található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Blumeriellás levélfoltosság:</strong></span><br />
A cseresznye és a meggy betakarítása már befejeződött. Ilyenkor gondolhatjuk azt is, hogy a növényvédelmi munkánknak is vége, de nem így van. A blumeriellás levélfoltosság ellen még védekezni kell. A betegséget okozó gombák a betakarítás utáni esős időben könnyen felszaporodtak, ki is alakultak a leveleken a lilás színezetű foltok. Abban az esetben, ha nem védekeztünk időben akkor könnyen korai lombhullást tud okozni ez a betegség. A foltok összeérnek, a levél elsárgul és elhalnak. Egyszeri kontakt gombaölőszeres kezeléssel hatékonyan tudunk védekezni a blumeriella ellen. A kezeléseket még a levelek sárgulása előtt el kell végezni.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Sztigmínás levélikacsododás:</strong></span><br />
A levélikacsosodás betegség kialakulásához az időjárási tényezők optimálisak. Várható, hogy idővel kisebb barna foltok jelennek meg, majd beszáradnak és kilyukadnak. A betegség elsősorban a szilván, őszibarackon található meg. A védekezéseket most javasoljuk elvégezni.</p>
<p style="text-align: justify;"><strong><span style="text-decoration: underline;">Levéltetvek:</span></strong><br />
A levéltetvek elsősorban a szilvában fognak gondot okozni. A várhatóan meleg és csapadékos időjárás, hasonlóképpen, mint az almában, a szilvában is elősegíti az újabb kolóniák kialakulását.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Atkák:</strong></span><br />
Elsősorban a szilva veszélyeztetett. Az előrejelzés és a védekezési lehetőségek megegyeznek az almában leírtakkal.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">KÖRTE</h2>
<p style="text-align: justify;">A körte termésnövekedés állapotban található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Körtelevélbolha:</strong></span><br />
Az idei évben számíthatunk egy erős körtelevélbolha kártételre. A kártevőnek kifejezetten kedvez a meleg nyári időjárás, a napsütés, száraz idő. Ilyenkor viszonylag gyorsan ki tudnak alakulni a telepek, illetve vastag mézharmat réteget tud kialakítani, ami védi nem csak a környezeti hatásoktól, hanem a rovarölő szertől is. A védekezéseket esőzések után &#8211; amikor a védelmüket biztosító mézharmat kissé feloldódik &#8211; javasoljuk elvégezni. A permetlét javasoljuk nedvesítő szerekkel kiegészíteni.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Körte varasodás:</strong></span><br />
A körte varasodás további terjedése megállt a száraz időjárás miatt, de sajnos már a gyümölcsökön megjelenő tünetek ellen nem lehet védekezni. Az időjárási tényezők nem kedveznek a körte varasodásnak, de elképzelhető, hogy azokban az ültetvényekben, ahol eddig nem volt jelen a betegség, ott már nem is fog tovább terjedni a gyümölcsre.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért megtalálnak minket a <a href="/kapcsolat">Kapcsolat menüpontban</a> fellelhető elérhetőségeinken!</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-as4ony93h', 'blog', 'Megjelent a Kertészet – ültetvénytelepítés és gyógynövénytermesztés támogatása című felhívás', 'Híreink', 'Mitruné Tóth Krisztina', '2024.07.16.', '/images/Mezogazdasagi-kisuzemek-tamogatasa-980x661.jpg', 'Megjelent a Kertészet &#8211; ültetvénytelepítés és gyógynövénytermesztés támogatása című felhívás. A pályázat keretében megvalósítható, önállóan is támogatható tevékenységek a következőek: 1. célterület: Ültetvénytelepítéshez kapcsolódó tevékenységek 2. célterület: Öntözési infrastruktúra kialakításával kapcsolatos tevékenységek Jelen cikkünkben csak az 1. célterülettel foglalkozunk részletesebben. Ültetvénytelepítéshez kapcsolódó tevékenységek A) Gyümölcstermő ültetvények telepítése Ültetvény létrehozása bizonyos gyümölcsfajokból lehetséges &#8211; részletekről érdeklődni ...', '<p style="text-align: justify;"><strong>Megjelent a Kertészet &#8211; ültetvénytelepítés és gyógynövénytermesztés támogatása című felhívás. A pályázat keretében megvalósítható, önállóan is támogatható tevékenységek a következőek:</strong></p>
<p style="text-align: justify;">1. célterület: Ültetvénytelepítéshez kapcsolódó tevékenységek<br />
2. célterület: Öntözési infrastruktúra kialakításával kapcsolatos tevékenységek</p>
<p style="text-align: justify;">Jelen cikkünkben csak az 1. célterülettel foglalkozunk részletesebben.</p>
<p style="text-align: justify;">Ültetvénytelepítéshez kapcsolódó tevékenységek</p>
<p style="text-align: justify;">A) Gyümölcstermő ültetvények telepítése<br />
Ültetvény létrehozása bizonyos gyümölcsfajokból lehetséges &#8211; részletekről érdeklődni a kollégáinknál lehet &#8211; az azokhoz tartozó előírt követelményeknek megfelelve. Az ültetvénytelepítés kizárólag víztakarékos öntözőrendszer kiépítésével együtt támogatott!</p>
<p style="text-align: justify;">Fontos kiemelni, hogy a víztakarékos öntözőrendszert abban az esetben is ki kell építeni, ha arra a pályázat keretében bizonyos oknál fogva nem jár támogatás!</p>
<p style="text-align: justify;">1. Új ültetvény telepítése: A legkisebb támogatható ültetvényméretnek a telepítési terv szerint el kell érnie az 1 hektár területnagyságot, a legkisebb támogatható táblaméretnek a 0,5 hektár területnagyságot.</p>
<p style="text-align: justify;">2. Ültetvénycsere: Meglévő ültetvény kivágása, majd azt követően az adott területnek a telepítési terv szerinti ültetvénnyel történő újratelepítése, amely abban az esetben támogatott, ha a meglévő ültetvény életkora annak kivágásakor meghaladta a termőre fordulástól számított 10 évet.</p>
<p style="text-align: justify;">B) Meglévő, a telepítéstől számított 10 évnél nem öregebb gyümölcstermő ültetvény korszerűsítése az alábbi tevékenységek révén:</p>
<p style="text-align: justify;">1. A jégesőkár megelőzésére szolgáló beruházás támogatása<br />
a) jégvédő háló tartására alkalmas beton támrendszer kialakítása<br />
b) jégháló beszerzése, kiépítése</p>
<p style="text-align: justify;">2. Tavaszi fagykár megelőzésére szolgáló beruházások támogatása<br />
Tavaszi fagykár megelőzését szolgáló eszköz, berendezés, technológia beszerzése és telepítése: fix vagy mobil légkeverő berendezések, autonóm hőtermelő berendezések (fagyvédelmi kályhák, más fűtőberendezések), továbbá vontatott hőtermelő vagy légkeverő gépek.</p>
<p style="text-align: justify;">3. Esőkár megelőzésére szolgáló beruházások támogatása<br />
Esőkár megelőzését szolgáló technológia beszerzése és telepítése (különösen az adott technológiához szükséges beton támrendszer kialakítása, fólia beszerzése, elhelyezése</p>
<p style="text-align: justify;">4. Gyümölcstermékek betakarítására alkalmas gépek, eszközök beszerzése (5 hektáros meglévő ültetvény mérettől)<br />
a) mezőgazdasági erőgéphez, traktorhoz kapcsolható betakarítógép beszerzése<br />
b) önjáró betakarítógépek beszerzése<br />
c) szedő platform, szüretelő-szedő gép beszerzése<br />
d) a betakarítást segítő kézi eszközök beszerzése (pl: kézi gyűjtők, kézi ágrázók, szedőállványok)</p>
<p style="text-align: justify;">Az A) pont “Gyümülcstermő ültetvények telepítése” esetében a B) pont 1-4 részében részletezett fejlesztések szintén megvalósíthatóak (a telepítési tevékenység mellett) az alábbi kiegészítéssel:</p>
<p style="text-align: justify;">&#8211; ültetvénycsere esetében a meglévő jégháló felújítása, átalakítása, és/vagy a meglévő támrendszer vagy jégvédő háló tartására alkalmas támrendszer felújítása, átalakítása<br />
&#8211; gyümölcsszedő kocsi beszerzése<br />
&#8211; maximum 1 db, legfeljebb 85 kW motorteljesítményű traktor beszerzése</p>
<p style="text-align: justify;">A pályázat keretében lehetőség van továbbá évelő gyógy-, aroma és fűszernövények, valamint borszőlő ültetvények telepítésére is, de jelen hírlevélben ezeket a tevékenységeket nem részletezzük.</p>
<p style="text-align: justify;">A támogatás utófinanszírozásos, mértéke alapesetben az összes elszámolható költség 50 %-a, de maximum 65%-a lehet az alábbiak szerint:</p>
<p style="text-align: justify;">&#8211; az időjárási kockázatok mérséklését szolgáló beruházások vonatkozásában: +15%<br />
&#8211; fiatal mezőgazdasági termelők esetén: +15%<br />
&#8211; gazdaságátadás esetén: +15%<br />
&#8211; ökológiai gazdálkodást folytató kedvezményezett esetén: +10%<br />
&#8211; kollektív beruházás esetén: +10%<br />
&#8211; beruházás megvalósításához igénybe vett beruházási hitelhez kamattámogatás, illetve a beruházási hitelhez kapcsolódó intézményi kezességvállalás díjához díjtámogatás igénylésének esetén: +15%</p>
<p style="text-align: justify;">A támogatás költség alapú elszámolás és egyszerűsített (egységköltség alapú) elszámolás formájában nyújtható. Az egységköltség alapú költségelemek elszámolható mértékét a 9. számú melléklet tartalmazza. Ezen költségek elszámolásához nem lesz szükséges a pénzügyi teljesítést igazoló dokumentumokat benyújtani.</p>
<p style="text-align: justify;">A támogatási döntésben meghatározott támogatási összeg legfeljebb 25 százalékáig, és legfeljebb 100 millió forint összegig a kedvezményezett kérelemmel előleget igényelhet.</p>
<p style="text-align: justify;">A támogatási kérelmek benyújtásának határideje:<br />
Első szakasz: 2024. szeptember 10. – 2024. szeptember 23.<br />
Második szakasz: 2024. szeptember 24. – 2024. október 7.<br />
Harmadik szakasz: 2025. április 1. – 2025. április 14.<br />
Negyedik szakasz: 2025. április 15. – 2025. április 28.</p>
<p style="text-align: justify;">Amennyiben érdeklődik a pályázat iránt, kérjük, vegye fel kapcsolatot kollégáinkkal!</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-qsi37xoaq', 'blog', 'Növényvédelmi előrejelzés – 2024. június 5.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.06.05.', '/images/novenyvedelmi_elorejelzes-3.jpg', 'A május hónap nagyon sok csapadékot hozott, helyenként komoly belvizet is okozva, illetve az almafa varasodásnak terjedésének is optimális feltételeket biztosított. Az elkövetkező héten az időjárásban továbbra is csapadékos napokra számíthatunk. Az előrejelzések szerint 2024.07.14-ig folyamatosan esni fog az eső. &#160; ALMA Az alma jelenleg 35-45 mm átmérőjű gyümölcs állapotában van. &#160; Betegségek Almafa varasodás ...', '<p style="text-align: justify;"><strong>A május hónap nagyon sok csapadékot hozott, helyenként komoly belvizet is okozva, illetve az almafa varasodásnak terjedésének is optimális feltételeket biztosított. Az elkövetkező héten az időjárásban továbbra is csapadékos napokra számíthatunk. Az előrejelzések szerint 2024.07.14-ig folyamatosan esni fog </strong><strong>az eső.</strong></p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p style="text-align: justify;">Az alma jelenleg 35-45 mm átmérőjű gyümölcs állapotában van.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek</h3>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almafa varasodás</strong></span><br />
Az almafa varasodás fertőzése továbbra is kiemelkedően magas. Május 25-26-ig a sorozatos esőzések miatt a betegség bekövetkeztéhez szükséges ökológiai tényezők optimálisak voltak, nehéz volt az almásokat megvédeni a varasodás ellen. Ebben az időszakban kialakult fertőzések tünetei most jelennek meg az ültetvényekben. A tapasztalatunk az, hogy még a rendszeresen kezelt kertekben is előfordulnak a tünetek mind a leveleken mind a gyümölcsön. Fontos, hogy a teljes ültetvényt fertőzésmentesen tartsuk. A leveleken általánosan elmondható, hogy mind a “megfogott” varas foltokat és az új kezdeményeket is lehet látni. A gyümölcsön a nagyobb foltok a kora tavaszi fertőzéseknek a tünetei, a májusi fertőzések még csak apró pontszerű foltokként mutatkoznak.</p>
<p style="text-align: justify;">Számításaink szerint június elejére a varasodás aszkospórái lassan kiürülnek. 2024. június 3-án végeztünk aszkospóra szóródási vizsgálatot, mely alapján alábbiakat állapíthatjuk meg: Az előző évi lehullott levelek nagy mértékben elrohadtak. A mintáinkat kezeletlen kertben a talajon tároljuk ugyanolyan körülmények közt, mintha kint lennének a gyümölcsösökben, így ha már nálunk elrohadtak, nagy valószínűséggel a kertekben is. A lebomló levelek már kevesebb tápanyagot tudnak a termőtesteknek nyújtani. Ezt igazolja az is, hogy a vizsgálatok során nagy mennyiségben találtunk lebontó gombák spóráit is. Ettől függetlenül minden kezelhető mintában találtunk aszkospórákat. A szóródás még tart, bár már arra számíthatunk, hogy lassan befejeződik.</p>
<p style="text-align: justify;">A meteorológiai előrejelzések szerint az elkövetkező hét sem lesz kedvezőbb, továbbra is folyamatos csapadékra lehet számítani, ami nem könnyíti meg a munkánkat. A fertőzési nyomás magas. A védekezések tekintetében ugyanazt tudjuk javasolni, mint az elmúlt hetekben, hogy felszívódó és kontakt gombaölőszerek kombinációját használjuk. Különös tekintettel arra, hogy jelenleg még a betegség terjedése mind konídiumos és mind aszkospórás úton is terjed. Addig, amíg az aszkospórák szóródása meg nem szűnik, illetve a csapadékos időjárás folytatódik, javasoljuk a felső dózis, illetve a sűrített permetezési fordulók alkalmazását. Az elmúlt időszakban nagyon sok készítményt használhattunk fel. Javasoljuk a felszívódó hatóanyagok felváltva történő alkalmazását. A kontakt szerek esetében a rezisztencia kialakulására kevesebb a veszély, de ott is javasolt egy-egy hatóanyag cseréje.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Lisztharmat</strong></span><br />
Az időjárás csapadékos. Úgy tanultuk, hogy ez nem kimondottan kedvez a betegség terjedésének, de vegyük azt is figyelembe, hogy az esőzések után napsütéses, meleg idő következik, a még nedves levél és a meleg napsütés pedig kimondottan a legjobb ökológiai tényező a betegség terjedéséhez.</p>
<p style="text-align: justify;">Fontos, hogy az intenzív hajtásnövekedési időszakban folyamatosan védekezzünk, ne hagyjuk, hogy a betegség eluralkodjon, mert hatalmas asszimilációs felület csökkenést tudnak létrehozni. Javasoljuk, hogy olyan készítményeket, illetve kombinációkat használjunk, amelyek hatásosak a varasodás és a lisztharmat elleni is.</p>
<p style="text-align: justify;">Felhívjuk a figyelmet, hogy a varasodás megállítására előszeretettel használt difenokonazol hatóanyag kombinációs partner nélkül nem elég a lisztharmat fertőzéshez. A lisztharmat ellen eredményesen használhatjuk a kén tartalmú készítményeket is.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Tűzelhalás</strong></span><br />
Várható, hogy a tűzelhalás ott, ahol eddig is megjelentek, erőteljesebben fognak az idén tovább terjedni. A csapadékos meleg időjárás kimondottan kedvez a betegség terjedésének. A tünetek ellen a leghatásosabb módszer a hajtások egészséges részénél történő eltávolítása, majd a sebek kezelése. A metszésekkor figyeljünk oda, hogy a szerszámmal ne terjesztjük tovább a betegséget. Javasoljuk az ollók fertőtlenítését minden egyes fa után.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Zöld almalevéltetű</strong></span><br />
A levéltetvek folyamatosan újabb telepeket hoznak létre. Ez a folyamat egészen a hajtáscsúcs záródásáig fog folytatódni. A kolóniák minden esetben az új, friss hajtásvégekre telepednek rá, ott szívogatással, levéldeformációval okoznak károkat. A hajtások növekedése június végéig, július közepéig eltart. Ez az időszak az, amikor fokozott figyelmet kell fordítanunk a levéltetvek terjedésére.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Vértetű</strong></span><br />
A vértetű egyre erőteljesebben van jelen az ültetvényekben. Már nemcsak a gyökérnyaki részeken, hanem a lombfelületen is meg lehet találni őket. Hagyományos felszívódó szerekkel akkor tudunk ellenük eredményesen védekezni, mikor még zöld növényi részeket károsítanak, a fás részeken károsítók ellen nehezebb védekezni.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Pajzstetű</strong></span><br />
A kaliforniai pajzstetű most van a legérzékenyebb fenológiai stádiumban. Ez az az időpont, amikor a leghatékonyabban tudunk védekezni a kártevő ellen. A még rajzó imágók nem táplálkoznak, így ellenük csak kontakt szerekkel lehet védekezni. A lerakott tojások, illetve fiatal lárvák még nem rendelkeznek pajzzsal, védtelenek a növényvédő szerek ellen. Javasoljuk, hogy használjuk ki ezt az állapotot és idejében kezdjük el a védekezéseket ellenük.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Atkák</strong></span><br />
Hasonlóan a többi szívó kártevőhöz, az atkák felszaporodására is lehet számítani, bár a csapadékos időjárás nem kedvez a telepek kialakításához. Arra viszont számíthatunk, hogy a takácsatkák apró szövedéket képeznek a levelek fonákán, ami képes arra, hogy a csapadék kedvezőtlen hatásától (lemossa a kártevőt) részben meg tudja védeni. Várakozásaink szerint az elkövetkező hetekben már találkozhatunk gócpontokkal. Javasoljuk, hogy ellenőrizzék a kerteket és amennyiben megjelenik a kártevő, azonnal védekezzünk. Elsősorban a tüneteket keressük (szívogatás okozta levél elszíneződés, halványosodás). A kártevő nehezen megfigyelhető. A takácsatkák szövedéket is készítenek, azt könnyű megtalálni, de a levélatkák szabad szemmel nem láthatóak, így azok esetében csak a szívásnyomok tudnak irányt mutatni a jelenlétükre</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almamoly</strong></span><br />
Az almamoly populációja nagy mértékben kifejlett lárva, illetve bábozódás kezdete állapotban van. A második nemzedék rajzása még nem indult el. Ugyan helyenként a csapdákban nagy egyedszámmal fogunk molyokat, ezek még az első nemzedékhez tartoznak. Számításaim szerint a második nemzedék 16-20 nap múlva fog megjelenni (2024.07.20-25. körül), de nagy valószínűséggel ott, ahol eddig is nagy egyedszámban fognak a csapdák, imágókat nem fogjuk csapdázással észrevenni, mert a nemzedékek összefolynak.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Keleti gyümölcsmoly</strong></span><br />
A keleti gyümölcsmoly rajzása folyamatos, a rajzásdinamika ezen kórokozó tekintetében is hektikus. Ellenük az almamoly elleni kezeléseknél leírtak alapján lehet védekezni, azzal a kivétellel, hogy a granulovírus alapú készítmények a keleti gyümölcsmoly ellen hatástalanok.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Aknázómolyok</strong></span><br />
Az almalevél aknázómoly rajzik, ugyan folyamatosan alacsony egyedszámmal, de azért érzéklehető. Kártételével már lehet találkozni. A rajzás elején lerakott tojásokból kialakult lárvák már kifejlettek és határozottan nagy aknát képeznek a leveleken. A lombosfa fehérmoly rajzása is jelen van. Az általunk vizsgált helyszínen 15 egyedet fogtunk. Ellenük védekezhetünk egy menetben az almamoly illetve a levéltetvek ellen használt készítményekkel is.</p>
<p style="text-align: justify;">Figyelem! A Voliam Targo engedélye lejárt. A meglévő készlet 2024.10.01-ig felhasználható, kivéve az alma, körte, naspolya, saláta, zeller, petrezselyem, szamóca kultúrákat.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy, cseresznye jelenleg érés állapotában található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Kicsattanás<br />
</strong></span>Elsősorban a cseresznye, de a meggy problémája is. Az érő gyümölcsöt sok csapadék éri. Ez ahhoz vezet, hogy a gyümölcs kicsattan és utat nyithat a betegségeknek, elsősorban a moníliának.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Meggy, cseresznye antraknózis<br />
</strong></span>A meggy és a cseresznye talán legmeghatározóbb betegsége az antraknózis. Az éréskori csapadékos idő miatt fellazul a gyümölcshús szerkezete, illetve a tünetek kifejlődéséhez is optimálisak a tényezők. Jellemzően már korábban, még a zöld gyümölcskezdemény alatt bejutott a kórokozó a növény belsejébe, viszont a tünetek csak most jelennek meg. Pontosan ez az, amiért nehéz a betegség ellen védekezni. Ha most kezdjük el a célzott kezeléseket, akkor nem fogunk eredményt elérni. A kezeléseket egy menetben el tudjuk végezni a gyümölcsfertőző monília elleni védekezéssel.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Meggy, cseresznye gyümölcsfertőző monília</strong></span><br />
A mechanikai sérüléseken, kicsattant vagy darazsak megrágta gyümölcsön megjelenik a puha, barnás színű rothadás, ami az antraknózishoz hasonlóan tönkre teszi a terményt. Az ellenük való védekezés csak megelőző jelleggel lehetséges.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Blumeriellás levélfoltosság</strong></span><br />
A meggy és a cseresznye betegségre. A tünetek első jelei, a leveleken megjelenő barnás-lilás foltok lassan meg fognak jelenni. A csapadékos időjárásnak megfelelően várható, hogy a betegség hamarosan megjelenik. Javasoljuk, hogy betakarítás után kontakt készítményekkel védekezzünk.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Cseresznyelégy</strong></span><br />
A cseresznye, meggy érés állapotban van, a cseresznyelégy kártétele megjelent. Védekezni ott tudunk, ahol az érésig még elég idő van a készítmények használatához. Javasoljuk, hogy a védekezéseket a citromsárga színű fejlettségi állapotban időben végezzük el, ügyelve arra, hogy a lombkorona tetejébe is eljusson a permetszer, ugyanis a kártevő a napos melegebb ágemeleteket kedveli.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Sztigmínás levélikacsododás</strong></span><br />
A levélikacsosodás betegség kialakulásához az időjárási tényezők optimálisak. Várható, hogy idővel kisebb barna foltok jelennek meg, majd beszáradnak és kilyukadnak. A betegség elsősorban a szilván, őszibarackon található meg. A védekezéseket most javasoljuk elvégezni.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Levéltetvek</strong></span><br />
A levéltetű kolóniák jelen vannak a cseresznyében, szilvába. A meleg időjárás segít a telepek kialakulásához, bár a csapadék csak kis mértékben korlátozza a fejlődésüket. Javasoljuk a védekezéseket folytatni, illetve, ha a cseresznye betakarítás folyamatban van akkor ha szükséges szüret után egy védekezést beiktatni. A fekete cseresznye levéltetű ekkor már nem okoz komolyabb problémát. A szilvában a hamvas szilva levéltetű komoly problémát okozhat a fiatal szilva hajtásokat teljesen ellephetik, a védekezés indokolt.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Keleti gyümölcsmoly</strong></span><br />
A keleti gyümölcsmoly rajzása folyamatos, várhatóan hamarosan megjelennek az első lárvák is. A védekezéseket javasoljuk most elkezdeni.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Szilvamoly</strong></span><br />
A szilvamoly rajzása május első hétében nagyon magas egyedszámot produkált, majd később csökkent. Valószínűleg túl vagyunk a rajzáscsúcson, javasoljuk a védekezések elkezdését, folytatását.</p>
<h2></h2>
<h2 style="text-align: justify;">ŐSZIBARACK</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">Az őszibarack termés növekedés állapotában van</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Barackmoly</strong></span><br />
A barackmoly rajzása elindult, lassan, de emelkedik a csapdában fogott egyedek száma. Az ellenük való védekezés indokolt.</p>
<h2></h2>
<h2 style="text-align: justify;">KÖRTE</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A körte termésnövekedés állapotban található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Körtevarasodás</strong></span><br />
A körtevarasodás jellemzően inkább nyári betegség, de a csapadékos időjárás miatt várható, hogy a betegség korábban elindul. Javasoljuk, hogy az alma esetében leírt készítményekkel védekezzünk.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Körtelevélbolha</strong></span><br />
A körtelevélbolha kolóniái egyre markánsabbak, a meleg időjárás kedvez a felszaporodásuknak. A sok csapadék miatt könnyebben tudunk védekezni a körtelevélbolha ellen. Az esők lemossák a körtelevélbolha által létrehozott mézharmatot, így a védtelenebb kártevőt könnyebben el tudjuk majd pusztítani.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért megtalálhatóak vagyunk a <a href="/kapcsolat">Kapcsolat</a> menüpontban található elérhetőségeken.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-ytafdg3yg', 'blog', 'Növényvédelmi előrejelzés – 2024. május 16.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.05.17.', '/images/novenyvedelmi_elorejelzes4.jpg', 'Ezen a héten az előrejelzések szerint a levegő hőmérséklete maximum 23-25°C között várható, csapadékra szinte minden nap számíthatunk. &#160; ALMA Az alma jelenleg kisdió méretű gyümölcs állapotában van. &#160; Betegségek &#160; Almafa varasodás Az almafa varasodás fertőzése az elmúlt héten felerősödött, minden egyes általunk vizsgált helyszínen komoly levélfelületi nedvességet regisztráltunk, ami azt jelenti, hogy a ...', '<p style="text-align: justify;"><strong>Ezen a héten az előrejelzések szerint a levegő hőmérséklete maximum 23-25°C között várható, csapadékra szinte minden nap számíthatunk.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p style="text-align: justify;">Az alma jelenleg kisdió méretű gyümölcs állapotában van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Betegségek</strong></span></p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almafa varasodás</strong></span><br />
Az almafa varasodás fertőzése az elmúlt héten felerősödött, minden egyes általunk vizsgált helyszínen komoly levélfelületi nedvességet regisztráltunk, ami azt jelenti, hogy a kórokozó spórainak lehetősége nyílt a csírázásra és a növénybe bejutni. Ezen települések közül kiemelkedő Tuzsér és Csenger térsége, ahol gyakorlatilag folyamatos több napig tartó időszakban voltak nedvesek a levelek. Sajnos, ilyen körülmények közt nehéz a védekezéseket elvégezni. Ebben az esetben mindenképp javasoljuk a magasabb dózis alkalmazását, felszívódó készítmények kontakttal való együttes kijuttatását, valamint a permetezési fordulók sűrítését.</p>
<p style="text-align: justify;">Az előttünk álló napokban sem lesz jobb a helyzet. A meteorológiai előrejelzések szerint 2024.05.15. és 23. között folyamatosan számíthatunk csapadékra. Szombat-vasárnap (2024.05.19-20.) lesz egy kis szünet az esőben, így a hosszú hétvége valószínűleg sokunknak permetezéssel fog telni. Nagyon magas a fertőzési nyomás, figyeljünk oda a kertekre. A gyümölcs mérete is folyamatosan növekszik, most nagyon érzékenyek az almások. Amit már korábban is írtunk, hogy ha szükséges akkor erőltessük a permetezéseket akkor is. ha a körülmények nem teljesen optimálisak. Ilyen időjárási körülmények közt a kevésbé hatékony kezelések is jobbak, mint az elmaradtak.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Lisztharmat</strong></span><br />
A lisztharmat tovább terjed, egyes ültetvényekben már komoly károkat okozott. Elsősorban kisebb és deformált leveleket lehet látni. Az intenzív hajtásnövekedési időszakban folyamatosan hozzák az újabb leveleket, amelyeken a lisztharmat újabb és újabb telepeket tudnak kialakítani. Fontos, hogy ezen telepek fejlődését megakadályozzuk és védekezzünk ellene. Javasoljuk, hogy olyan készítményeket illetve kombinációkat használjunk, amelyek hatásosak a varasodás és a lisztharmat elleni is.</p>
<p style="text-align: justify;">Felhívjuk a figyelmet, hogy a varasodás megállítására előszeretettel használt difenokonazol hatóanyag kombinációs partner nélkül nem elég a lisztharmat fertőzéshez. A lisztharmat ellen eredményesen használhatjuk a kéntartalmú készítményeket is.</p>
<p style="text-align: justify;">Kéntartalmú készítmények: A kén tartalmú készítményeket inkább az alacsonyabb nyári dózisban használjunk. Elsősorban ott javasoljuk, ahol a fertőzött hajtásvégek metszéskori eltávolítása nem volt sikeres, illetve ott, ahol előző évben az atkák komoly gondot okoztak.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Tűzelhalás</strong></span><br />
A tűzelhalás tünetei egyre markánsabban jelennek meg. Az elkövetkező héten folyamatosan csapadékra számíthatunk, emellett meleg is lesz. A környezeti tényezők ezen kombinációja különösen kedvez a tűzelhalás fertőzésének, baktériumok szaporodásának, terjedésének. A betegség tüneteinek a kialakulásához ezek az alapvető feltételek. A tünetek ellen a leghatásosabb módszer a hajtások egészséges részénél történő eltávolítása, majd a sebek kezelése. A metszésekkor figyeljünk oda, hogy a szerszámmal ne terjesztjük tovább a betegséget. Javasoljuk az ollók fertőtlenítését minden egyes fa után.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Zöld almalevéltetű</strong></span><br />
A levéltetvek már egyre nagyobb telepeket alakítanak ki. A hajtások növekedése erőteljes. Ezeken a friss hajtásvégeken szeretnek telepeket kialakítani, a számunkra értékes új leveleket szívogatják, amitől azok deformáltak, zsugorodtak lesznek. Javasoljuk, hogy még a levelek összezsugorodása előtti időben védekezzünk, elsősorban felszívódó készítményekkel. A kontakt rovarölőszerek csak addig hatásosak, amíg a levelek felülete egészséges, a már összezsugorodott levelek védelmében élő kártevőre a kontaktszerek hatástalanok.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Vértetű</strong></span><br />
A vértetű egyre erőteljesebben van jelen az ültetvényekbe. Már nemcsak a gyökérnyaki részeken, hanem a lombfelületen is meg lehet találni őket. Hagyományos felszívódó szerekkel akkor tudunk ellenük eredményesen védekezni, mikor még zöld növényi részeket károsítanak, a fás részeken károsítók ellen nehezebb védekezni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almamoly</strong></span><br />
Az almamoly rajzása folyamatos. A dinamikájában nehéz megállapítani rajzáscsúcsot vagy esetleg csökkenést, minden csapdánk különböző mennyiségű imágót fognak. Tuzséron már 2 hete kiemelkedően magas egyedszámban rajzik az almamoly. Az általunk használt hőösszegszámítási elvet figyelembe véve a lárvák tömeges kelése még várat magára. Az előrejelzések szerint a nappali maximum hőmérsékletek nem csökkennek, de éjjel lehűl a levegő, ezért arra számítunk, hogy a lárvakelési időpontok későbbre tehetőek.</p>
<p style="text-align: justify;">A Biocont Hungária Kft., mint a Madex Pro granulovírus készítmény tulajdonosa nem sokkal, de a mi számításunktól kissé eltérő hőösszeg számítási elvet használ. Az ő ajánlásuk szerint a lárvakelések kezdete már a tojásrakások csúcsán elkezdődik. A két számítási módszer néhány nap diferenciát mutat a lárvakelés tekintetében, ami a pontos kezelés meghatározásnál fontos különbség is lehet. A granulovírus használatát már 88-90°C hőösszeg felett javasolja. Ezt az értéket már minden településen elértük, ezért javasoljuk, hogy vegyük figyelembe a gyártói ajánlásokat, így a készítmény kijuttatásának az időpontja most van.</p>
<p style="text-align: justify;">A Coragen 20 SC első felhasználását már a tojásrakás kezdetén javasoltuk. Aki még nem alkalmazta és tervezi, még ki lehet juttatni. Tekintettel arra, hogy a hőösszeghatárok a vártnál lassabban alakultak, így az első kezelések mostani kijuttatása &#8211; ugyan nem optimális &#8211; de még nem is késő. A készítmény második felhasználása az első kezelést követő 14-21 napon belül javasolt.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Keleti gyümölcsmoly</strong></span><br />
A keleti gyümölcsmoly rajzása folyamatos. A rajzásdinamika ezen kórokozó tekintetében is hektikus. Ellenük az almamoly elleni kezeléseknél leírtak alapján lehet védekezni, azzal a kivétellel, hogy a granulovírus alapú készítmények a keleti gyümölcsmoly ellen hatástalanok.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Aknázómolyok</strong></span><br />
Az almalevél aknázómoly már hetek óta rajzik. Egyelőre nem látjuk hogy a rajzás erősödne, a kritikus védekezéshez szükséges egyedszámot még nem lépte át. Tekintettel a hosszú rajzásra és a gyümölcsösökben eltérő nagyságban jelen levő populációkra, javasoljuk, hogy védekezzünk a károsítók ellen, különösen akkor, ha a kihelyezett saját csapdák már 100 feletti egyedszámot fognak. Ellenük védekezhetünk egy menetben az almamoly, illetve a levéltetvek ellen használt készítményekkel is.</p>
<p style="text-align: justify;">A Voliam Targo engedélye lejárt, a meglévő készlet 2024.10.01-ig felhasználható, kivéve az alma, körte, naspolya, saláta, zeller, petrezselyem, szamóca kultúrákat!</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p style="text-align: justify;">A meggy jelenleg gyümölcsnövekedés állapotában található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Meggy antraknózis</strong></span><br />
A meggy következő betegsége, ami ellen védekeznünk kell, az antraknózis. A kezeléseket a kötődést követően csapadékos időjárás esetén folyamatosan megelőző jelleggel kontakt gombaölőszerrel javasoljuk elvégezni, hogy megakadályozzuk a gomba növénybe való bejutását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Blumeriellás levélfoltosság</strong></span><br />
A meggy és a cseresznye betegségre. A tünetek első jeleivel, a leveleken megjelenő barnás-lilás foltokkal még nem találkoztunk. A tünetek általában a betakarítás környékén vagy utánna szoktak megjelenni, de a csapadékos időjárásnak megfelelően várható, hogy a betegség hamarosan megjelenik. Az antraknózis elleni védekezés hatásos a blumeriella ellen is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Cseresznyelégy</strong></span><br />
A korai cseresznyefajták érése elindult. Acseresznyelégy kártétele még nincs jelen, a korai fajtákon jellemzően a mi klímánkon még nem tud kárt okozni. A későbbi érésű fajták esetében, már számíthatunk a jelenlétükre. Javasoljuk, hogy a védekezéseket a citromsárga színű fejlettségi állapotban időben végezzük el, ügyelve arra, hogy a lombkorona tetejébe is eljusson a permetszer, a kártevő a napos melegebb ágemeleteket kedveli.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Levéltetvek</strong></span><br />
Az első levéltetű kolóniák még csak most kezdenek kialakulni, a hűvös időjárás lelassította ezt a folyamatot. Most már meleg van, a hajtások folyamatosan növekednek, egyre több élőhelyet és élelmet biztosítanak a levéltetveknek. Javasoljuk a védekezéseket minél hamarabb elkezdeni, megakadályozva ezzel a későbbi erős fertőzés kialakulását. Levéltetvekkel első sorban szilva, cseresznye és barack kultúrában találkozhatunk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Keleti gyümölcsmoly</strong></span><br />
A keleti gyümölcsmoly rajzása folyamatos, várhatóan hamarosan megjelennek az első lárvák is. A védekezéseket javasoljuk most elkezdeni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Szilvamoly</strong></span><br />
A szilvamoly rajzása május első hétében nagyon magas egyedszámot produkált, majd később csökkent. Valószínűleg túl vagyunk a rajzáscsúcson. Javasoljuk a védekezések elkezdését, folyatását.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ŐSZIBARACK</h2>
<p style="text-align: justify;">Az őszibarack termésnövekedés állapotában van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Barackmoly</strong></span><br />
A barackmoly rajzása elindult, lassan, de emelkedik a csapdában fogott egyedek száma. Az ellenük való védekezés indokolt.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">KÖRTE</h3>
<p style="text-align: justify;">A körte termésnövekedés állapotban található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Körtevarasodás</strong></span><br />
A körtevarasodás jellemzően inkább nyári betegség, ugyanakkor a csapadékos időjárás miatt várható, hogy a betegség korábban elindul. Javasoljuk, hogy az alma esetében leírt készítményekkel védekezzünk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Körtelevélbolha</strong></span><br />
A körtelevélbolha kolóniái egyre markánsabbak, a meleg időjárás kedvez a felszaporodásuknak. Ezen a héten, ha bejönnek a meteorológiai előrejelzések, akkor sok csapadékra számíthatunk. Használjuk ki ezt a lehetőséget és esőzések után védekezzünk. A nagyobb esők lemossák a körtelevélbolha által létrehozott mézharmatot, így a védtelenebb kártevőt könnyebben el tudjuk majd pusztítani.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért megtalálhatóak vagyunk a <a href="/kapcsolat">Kapcsolat menüpontban</a> található elérhetőségeinken.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-gef4a59of', 'blog', 'Növényvédelmi előrejelzés – 2024. május 6.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.05.07.', '/images/novenyvedelmi_elorejelzes-5.jpg', 'Ezen a héten az előrejelzések szerint a levegő hőmérséklete maximum 21-28°C között várható, csapadékra 2024. július 08-án számíthatunk. &#160; ALMA Az alma jelenleg 15-20 mm átmérőjű gyümölcs állapotában van. &#160; Betegségek &#160; Almafa varasodás Az almafa varasodás április 2-3. hetében intenzíven terjedt. Ezen időszakban történt fertőzések tünetei már most láthatóak elsősorban a hajtások közepén levő ...', '<p style="text-align: justify;"><strong>Ezen a héten az előrejelzések szerint a levegő hőmérséklete maximum 21-28°C között várható, csapadékra 2024. július 08-án számíthatunk.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p style="text-align: justify;">Az alma jelenleg 15-20 mm átmérőjű gyümölcs állapotában van.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almafa varasodás</strong></span><br />
Az almafa varasodás április 2-3. hetében intenzíven terjedt. Ezen időszakban történt fertőzések tünetei már most láthatóak elsősorban a hajtások közepén levő leveleken, illetve a gyümölcsök azon részein amelyek vagy egy másik gyümölcskezdeménnyel ért össze vagy egy levél takarásában voltak. Az elkövetkező héten a varasodás további fertőzéséhez az időjárás nem fog kedvezni, gyakorlatilag száraz és meleg időjárásra számíthatunk. Ennek ellenére vegyük figyelembe, hogy ez az az időszak, amikor a betegség erőteljesen aszkospórákkal és konídiumokkal is tud fertőzni. A védekezéseket nem szabad abbahagyni vagy mérsékelni. Továbbra is javasoljuk a felszívódó és kontakt készítmények együttes kijuttatását. Ahol már tünetekkel találkozunk ott javasoljuk a difenokonazol, illetve a dodin hatóanyagú készítmények alkalmazását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Lisztharmat</strong></span><br />
Az almát megbetegítő kórokozók közül most a varasodás prioritását felváltja a lisztharmat. A nappali száraz, meleg időjárás éjjeli lehűléssel párosul, a meteorológiai állomásaink minden helyen azt tapasztalhatjuk, hogy éjszakánként a páratartalom magas. Ez pontosan elég lehet a lisztharmat további fertőzésének. Az almások most intenzív hajtásnövekedési időszakban találhatóak, folyamatosan hozzák az újabb leveleket, amelyeken a lisztharmat újabb és újabb telepeket tudnak kialakítani. Fontos, hogy ezen telepek fejlődését megakadályozzuk és védekezzünk ellene. Javasoljuk, hogy olyan készítményeket, illetve kombinációkat használjunk, amelyek hatásosak a varasodás és a lisztharmat elleni is. Felhívjuk a figyelmet, hogy a varasodás megállítására előszeretettel használt difenokonazol hatóanyag kombinációs partner nélkül nem elég a lisztharmat fertőzéshez. A lisztharmat ellen eredményesen használhatjuk a kéntartalmú készítményeket is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Tűzelhalás</strong></span><br />
Ahogy az előző előrejelzésünkben jeleztem, hogy a sarjú virágzatokon megjelenhet a tűzelhalás, sajnos az be is következett. 2024. május 2-án már tünetekkel találkoztunk, ami a meleg időjárásban könnyen terjed a növényben. Az első észlelést követő napokban már komplett visszakonyult, elszáradt hajtásokat lehetett látni. Az ilyen markáns tünetek ellen az egyetlen és hatásos módszer a hajtások egészséges részénél történő eltávolítása, majd a sebek kezelése. A metszésekkor figyeljünk oda, hogy a szerszámmal ne terjesztjük tovább a betegséget, javasoljuk az ollók fertőtlenítését minden egyes fa után.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Zöld almalevéltetű</strong></span><br />
A levéltetvek már egyre nagyobb telepeket alakítanak ki. A hajtások növekedése erőteljes ezeken a friss hajtásvégeken. Szeretnek telepeket kialakítani, a számunkra értékes új leveleket szívogatják, amitől azok deformáltak, zsugorodtak lesznek. Javasoljuk, hogy még a levelek összezsugorodása előtt időben védekezzünk, elsősorban felszívódó készítményekkel. A kontakt rovarölőszerek csak addig hatásosak, amíg a levelek felülete egészséges, a már összezsugorodott levelek védelmében élő kártevőre a kontakt szerek hatástalanok.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Vértetű</strong></span><br />
A gyökérnyaki szinten áttelelt vértetű egyedek most vándorolnak fel a lombkoronába és kezdik el a telepek kiépítését. Sajnos már találkoztunk olyan vértetű kolóniával, ami már egész ágakat befedett. Az ellenük való védekezés nehéz, a vattaszerű telepek védelme alatt a kártevő szépen fel tud szaporodni. Javasoljuk ez ellenük való védekezést. A friss hajtásokon megjelenő vértetű ellen a felszívódó rovarölő szerek hatásosak.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almamoly</strong></span><br />
Az almamoly védekezéshez az első időpont most aktuális. Számításaink szerint a tojások rakása 2024.05.03-05. közt megkezdődtek és a tojásrakások csúcsa a mai napokban van (2024.05.07-09.). A tojások elleni készítményeket most kell kijuttatni! Fontos, hogy azok a gazdálkodók, akik a lárvák elleni készítményeket részesítik előnyben, különösen a biogazdálkodók esetében, a kijuttatások időpontjával meg kell várni a lárvák kikelését.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Keleti gyümölcsmoly</strong></span><br />
A keleti gyümölcsmoly rajzása folyamatos, az elmúlt héten a rajzása tovább erősödött. Ellenük az almamoly elleni kezeléseknél leírtak alapján lehet védekezni, azzal a kivétellel, hogy a granulovírus alapú készítmények a keleti gyümölcsmoly ellen hatástalanok.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Aknázómolyok</strong></span><br />
Az almalevél aknázómoly első nemzedéke már a múlt héten megjelent a csapdákban, a rajzásuk erősödik, de még mindig nem lépték át a kritikus szintet a védekezéshez. Ellenük védekezhetünk egy menetben az almamoly, illetve a levéltetvek ellen használt készítményekkel is.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p style="text-align: justify;">A meggy jelenleg gyümölcsnövekedés állapotában található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Meggy antraknózis</strong></span><br />
A meggy következő betegsége, ami ellen védekeznünk kell, az antraknózis. A kezeléseket a kötődést követően csapadékos időjárás esetén folyamatosan megelőző jelleggel kontakt gombaölőszerrel javasoljuk elvégezni, hogy megakadályozzuk a gomba növénybe való bejutását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Levéltetvek</strong></span><br />
Az első levéltetű kolóniák még csak most kezdenek kialakulni, a hűvös időjárás lelassította ezt a folyamatot. Most már meleg van, a hajtások folyamtosan növekednek, egyre több élőhelyet és élelmet biztosítanak a levéltetveknek. Javasoljuk a védekezéseket minél hamarabb elkezdeni, megakadályozva ezzel a későbbi erős fertőzés kialakulását. Levéltetvekkel első sorban szilva, cseresznye és barack kultúrában találkozhatunk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Keleti gyümölcsmoly</strong></span><br />
A keleti gyümölcsmoly rajzása folyamatos, várhatóan hamarosan megjelennek az első lárvák is. A védekezéseket javasoljuk most elkezdeni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Szilvamoly</strong></span><br />
A szilvamoly rajzása elindult, amint a hőmérséklet emelkedett. Már hatalmas egyedszámmal találjuk meg a csapdákban.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ŐSZIBARACK</h3>
<p style="text-align: justify;">Az őszibarack termés növekedés állapotában van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Tafrinás levélfodrosodás</strong></span><br />
Amire korábban számítottunk, hogy a betegség további terjedése meg fog szűnni, még nem következett b. Az elmúlt héten a hűvös csapadékos időjárás a tafrinás levélfodrosodás betegségét tovább erősítette. Ahhoz, hogy az újabb levelek fertőzése megszűnjön, magas hőmérsékletre van szükség. Várható, hogy az elkövetkező héten az időjárás melegebb lesz, így a betegség terjedése is megáll.</p>
<p style="text-align: justify;">A károsodott leveleken a deformáció egyre markánsabb lesz, a levéllemez meg fog vastagodni. Ez a betegség lefolyásának természetes része. A már fertőzött levelek védelmére nincs lehetőség, majd várhatóan néhány héten belül lehullanak. Az új levelekre való átterjedést remélhetőleg a meleg időjárás meg fogja állítani. Védekezésre nincs szükség.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért megtalálhatóak vagyunk a <a href="/kapcsolat">Kapcsolat</a> menüpontban található elérhetőségeinken.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-hygtr948b', 'blog', 'Növényvédelmi előrejelzés – 2024. április 29.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.04.29.', '/images/novenyvedelmi_elorejelzes-6jpg.jpg', 'Ezen a héten az időjárás az előrejelzések szerint melegebb lesz mint az előző héten volt, a levegő hőmérséklete maximum 20-26°C között várható, csapadékra a hét második felében, illetve hétvégén (2024.05.02 &#8211; 04.) számíthatunk, az éjszaka hőmérséklet már várhatólag nem fog fagy közeli értékre csökkenni. &#160; Fagykár Javaslom, hogy ellenőrizzük az ültetvényeinket, több gazdálkodótó jelezte, hogy ...', '<p style="text-align: justify;"><strong>Ezen a héten az időjárás az előrejelzések szerint melegebb lesz mint az előző héten volt, a levegő hőmérséklete maximum 20-26°C között várható, csapadékra a hét második felében, illetve hétvégén (2024.05.02 &#8211; 04.) számíthatunk, az éjszaka hőmérséklet már várhatólag nem fog fagy közeli értékre csökkenni.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Fagykár</h3>
<p style="text-align: justify;">Javaslom, hogy ellenőrizzük az ültetvényeinket, több gazdálkodótó jelezte, hogy a termény kezdeményeket megvágva barna vagy fekete magházzal találkoztak, véleményem szerint ezek a gyümölcskezdemények le fognak hullani a természetes gyümölcshullás idején. Információink szerint Lengyelországban a kora tavaszi fagy minden gyümölcstermő növényt érintett, ott nagy a fagykár, elképzelhető, hogy ez kedvezően fog hatni a hazai gyümölcspiacra.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Termésszabályozás</h3>
<p style="text-align: justify;">A túlkötött almák vegyszeres ritkítását a héten még elvégezhető, az elmúlt héten a hőmérséklet alacsony volt, így a benziladenin hatóanyagú készítmények sem tudták kifejteni a kellő hatásukat, illetve a gyümölcskezdemények mérete sem nőtt túl sokat, almában (gála) a királyvirágok jellemzően 12-15 mm nagyságúak. A hőmérséklet emelkedésével a termésritkítása az időjárás a héten megfelelő lesz, javasoljuk a kezelések elvégzését amennyiben szükséges. Ne felejtsük, hogy egy jó terméshez általában az alma virágzatából elég ha az 5 virágból egy köt meg.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p style="text-align: justify;">Az alma jelenleg 10-15mm átmérőjű gyömölcs állapotában van.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almafa varasodás</strong></span><br />
Az ültetvényekben megjelent a varasodás tünete, elsősorban az idősebb leveleken találhatóak varasodás foltok, gyümölcsön még nem találkoztam ilyennel, idővel várhatunk a gyümölcstünetek megjelenésére is. Az aszkospórák még szóródnak mellettük megjelent a konídiumos alak is, így a betegség már mind a két spórával tud fertőzni, az almafa varasodás tekintetében ez az időszak, amikor a legveszélyesebb, amikor a legjobban terjed a kórokozó. Az elmúlt héten a meteorológiai állomásainkat kielemezve (lenti táblázat) láthatjuk, hogy minden általunk vizsgált helyszínen komoly fertőzés volt, szerencsére az esőzések közt volt megfelelő száraz szélmentes időszak amikor lehetett permetezni remélhetőleg a védekezések eredményesek voltak.</p>
<p style="text-align: justify;">Ha az előttünk levő hét meteorológiai előrejelzéseit nézzük, akkor láthatjuk, hogy május első napjaiban csütörtök és vasárnap közt (2024.05.02 és 05.) számíthatunk jelentősebb csapadékra, ekkor a fertőzési nyomás magas lesz. Ahogy a korábbi előrejelzésünkben már jeleztük, javasoljuk a folyamatos kezeléseket felszívódó és kontakt szerek kombinációjával. Arra számíthatunk, hogy még egy hónapig május végéig a varasodás terjedése intenzív lesz, ebben az időszakban fokozottan figyeljünk a védekezésre, és amennyiben az időjárás csapadékos a kezeléseket időben végezzük el, esetleg a kezelési fordulókon is érdemes sűríteni. Vegyük figyelembe, hogy a hajtások növekedése intenzív, a felszívódó szerek “felhígulnak” a növényi nedvekben.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Lisztharmat</strong></span><br />
Az elmúlt héten a lisztharmat további terjedése a hűvös csapadékos időjárás miatt visszább esett, de találkozhatunk mind a primer (fertőzött rügyekből kifejlődő fertőzött hajtások) mind a szekunder tünetekkel (egészséges levelek, levél szélek deformálódnak kanalasodnak, a deformált részen megjelenik a penésztelep). Jelenleg az elsődleges cél, hogy a szekunder tünetek kialakulását megakadályozzuk, a deformált levelek kisebbek lesznek, asszimilációs felülete is csökken így a termés mennyiségében is jelentkezhet a kár.</p>
<p style="text-align: justify;">Az elkövetkező héten napos, meleg időre, május 2-tól csapadékra és melegre is számíthatunk, ami kedvez a lisztharmatnak. Számíthatunk egy komolyabb fertőzésre.</p>
<p style="text-align: justify;">Felhívjuk a figyelmet, hogy a varasodás megállítására előszeretettel használt difenokonazol hatóanyag kombinációs partner nélkül nem elég a lisztharmat fertőzéshez. A lisztharmat ellen eredményesen használhatjuk a kén tartalmú készítményeket is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Tűzelhalás</strong></span><br />
Tűzelhalás tünettel még nem találkoztam, a virágzás alatt az időjárás hűvös volt nem volt optimális a baktérium fertőzéséhez. Az elkövetkező időszakban a az időjárás melegre és csapadékosra változik, ami már elősegítheti egy nyári fertőzés kialakulását. Az ültetvényekben még elvétve lehet találni egy-egy sarjú virágot, ami jelentéktelennek tűnhet, de pontosan elegendő a tűzelhalás fertőzés elindításához. A betegség terjedése szempontjából ugyanígy veszélyes lehet a mechanikai sérülés, művelő eszközök szél, jég okozta sebek, ezeken keresztül is be tud jutni a kórokozó a<br />
növénybe.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Zöld almalevéltetű</strong></span><br />
A levéltetvek már egyre nagyobb telepeket alakítanak ki, a hajtások növekedése erőteljes ezeken a friss hajtásvégeken szeretnek telepeket kialakítani, a számunkra értékes új leveleket szívogatják, amitől azok deformáltak, zsugorodtak lesznek. Javasoljuk, hogy még a levelek összezsugorodása előtt időben védekezzünk, elsősorban felszívódó készítményekkel, a kontakt rovarölő szerek csak addig hatásosak, amíg a levelek felülete egészséges, a már összezsugorodott levelek védelmében élő kártevőre a kontakt szerek hatástalanok.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Vértetű</strong></span><br />
A gyökérnyaki szinten áttelelt vértetű egyedek most vándorolnak fel a lombkoronába, és kezdik el a telepek kiépítését, sajnos már találkoztam olyan vértetű kolóniával ami már egész ágakat befedett.</p>
<p style="text-align: justify;">Az ellenük való védekezés nehéz, a vattaszerű telepek védelme alatt a kártevő szépen fel tud szaporodni. Javasoljuk ez ellenük való védekezést, a friss hajtásokon megjelenő vértetű ellen a felszívódó rovarölő szerek hatásosak.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Almamoly</strong></span><br />
Az idén érdekes a rajzás, a szokásostól 2 héttel hamarabb indult, majd az első napot követő 12 napig teljesen megállt az almamoly populáció fejlődése. Az elmúlt héten a hűvös csapadékos időjárás nem kedvezett a rajzásnak és a kártevő szaporodásának a párosodáshoz alkonyatkor 16°C feletti hőmérséklet szükséges. A meteorológiai állomásaink adatai szerint 2024.04.16 és 04.28-a között egyetlen egy napon sem jött össze ez a hőmérséklet, papírforma szerint az almamoly az idén &#8211; a rajzás első napját leszámítva &#8211; még nem rakott tojásokat, annak ellenére, hogy a csapdák már két hete fogják a hímeket. Az első napon (04.15-én) nagy egyedszámú egyedeket fogtak a csapdák az akkor lerakott tojások a hűvös hideg idő és az éjjeli fagy hatására el is pusztultak.</p>
<p style="text-align: justify;">A védekezéssel egyelőre még várjunk, a fejlődéshez szükséges hőmérséklet alacsony, a hőösszegek lassan adódnak össze. A kezelések időpontját az határozza meg, hogy az elkövetkező napokban a felmelegedés milyen mértékű lesz, számításaim szerint, a védekezéseket a hét utolsó napjaiban (2024.05.03-04.) kell elkezdeni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Aknázómolyok</strong></span><br />
Az almalevél aknázómoly első nemzedéke megjelent a csapdákban, egyelőre még jelentéktelenül alacsony egyedszámmal.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p style="text-align: justify;">A meggy jelenleg megymag méretű gyümölcs állapotában található. Az elmúlt héten sajnos több helyen is volt éjjeli fagy, ami a meggyet cseresznyét sem kímélte, ügyfelektől kaptam képeket bebarnult felületű gyümölcskezdeményekről, ezek idővel befeketednek és le fognak hullani.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Meggy antraknózis</strong></span><br />
A meggy következő betegsége, ami ellen védekeznünk kell az antraknózis. A kezeléseket a kötődést követően csapadékos időjárás esetén folyamatosan megelőző jelleggel kontakt gombaölő szerrel javasoljuk elvégezni, hogy megakadályozzuk a gomba növénybe való bejutását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Levéltetvek</strong></span><br />
Az első levéltetű kolóniák még csak most kezdődnek kialakulni, a hűvös időjárás lelassította ezt a folyamatot, most már meleg van a hajtások folyamtosan növekednek egyre több élőhelyet és élel- met biztosítanak a levéltetveknek, javasoljuk a védekezéseket minél hamarabb elkezdeni megakadályozva ezzel a későbbi erős fertőzés kialakulását. Levéltetvekkel első sorban szilva, cseresznye és barack kultúrában találkozhatunk.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ŐSZIBARACK</h3>
<p style="text-align: justify;">Az őszibarack termés növekedés állapotában van</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong><span style="text-decoration: underline;">Tafrinás levélfodrosodás</span></strong><br />
Amire korábban számítottunk, hogy a betegség további terjedése meg fog szűnni még nem következett be elmúlt héten a hűvös csapadékos időjárás a tafrinás levélfodrosodás betegségét tovább erősítette. Ahhoz hogy az újabb levelek fertőzése megszűnjön magas hőmérsékletre van szükség, várható, hogy az elkövetkező héten az időjárás melegebb lesz, így a betegség terjedése is megáll.</p>
<p style="text-align: justify;">A károsodott leveleken a deformáció egyre markánsabb lesz a levél lemez meg fog vastagodni, ez a betegség lefolyásának természetes része, a már fertőzött levelek védelmére nincs lehetőség, majd várhatóan néhány héten belül lehullanak. Az új levelekre való átterjedést remélhetőleg a meleg időjárás meg fogja állítani. Védekezésre nincs szükség.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Keleti gyümölcsmoly</strong></span><br />
A keleti gyümölcsmoly rajzása elindult, várhatóan hamarosan megjelennek az első lárvák is. A védekezéseket javasoljuk most elkezdeni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért megtalálhatóak vagyunk a <a href="/kapcsolat">Kapcsolat</a> menüpontban található elérhetőségeinken.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-xi6nhruqm', 'blog', 'Növényvédelmi előrejelzés – 2024. április 17.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.04.18.', '/images/novenyvedelmi_elorejelzes-7.jpg', 'Ezen a héten az időjárás a hónapra jellemzően változékony, az előző héttől hűvösebb lesz, a levegő hőmérséklete maximum 12-16°C között várható. Csapadékra gyakorlatilag a hét minden napján számíthatunk, az éjszakai minimum hőmérséklet csütörtökön, pénteken (2024.04.19-20-án) +1°C lesz, fagyzugos vagy fagyérzékeny területeken ekkor fagyra is számíthatunk. &#160; Termésszabályozás A túlkötött almák vegyszeres ritkítását a héten 10-20 ...', '<p style="text-align: justify;"><strong>Ezen a héten az időjárás a hónapra jellemzően változékony, az előző héttől hűvösebb lesz, a levegő hőmérséklete maximum 12-16°C között várható. Csapadékra gyakorlatilag a hét minden napján számíthatunk, az éjszakai minimum hőmérséklet csütörtökön, pénteken (2024.04.19-20-án) +1°C lesz, fagyzugos vagy fagyérzékeny területeken ekkor fagyra is számíthatunk.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Termésszabályozás</h3>
<p style="text-align: justify;">A túlkötött almák vegyszeres ritkítását a héten 10-20 mm nagyságú gyümölcskezdemény esetében javasoljuk elvégezni benziladenin hatóanyagú (Globaryll 100) készítménnyel. Fontos, hogy a készítmény hatásához meleg szükséges, az előrejelzések szerint a hétvégén lesz megfelelő hőmérséklet az alkalmazásához.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p style="text-align: justify;">Az alma jelenleg sziromhullás, terméskötődés állapotában van.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Betegségek</h4>
<p style="text-align: justify;"><strong>Almafa varasodás:</strong><br />
Az aszkospórák szóródása már több mint egy hónapja elkezdődött. Ugyan a március eleji indulást követően a szóródás intenzitása csökkent, de ezzel párhuzamosan a hőmérséklet is csökkent, így a varasodásfertőzésnek a veszélye sem volt magas. Számításaink szerint az első (2024.03.12-én bekövetkezett) fertőzések tünetei az idősebb leveleken, csészeleveleken vagy a száron megjelenhetnek. A kertszemlék során nem találkoztunk varasodástünettel, remélhetőleg az idejében elvégzett kezelések megakadályozták a betegség kialakulását. Az elmúlt héten az időjárás meleg és csapadékmentes volt, a varasodás terjedésére, fertőzésre nem volt optimális.</p>
<p style="text-align: justify;">Érdemes odafigyelni a páratartalomra és az éjszakai harmatra. A meteorológiai állomásaink szerint Csengerben és Tuzséron a varasodás veszélye fokozott. Az éjszakai hőmérsékletkülönbség hatására a levegő nedvessége kicsapódott a levelekre és hosszú, több mint 10 órás levélfelületi nedvességet<br />
okozott, úgy hogy csapadék azokon a napokon nem esett. Annak ellenére, hogy az éjszakai hőmérséklet alacsony, a fertőzés be tud következni. Ezen a két településen javasoljuk a permetezési ismétlések közti időintervallum csökkentését, kuratív készítmények alkalmazását.</p>
<p style="text-align: justify;">Április 16-án Nyíracsád kivételével minden településen megfelelő csapadék volt az új fertőzések kialakulásához. Javasoljuk, hogy a héten felszívódó azol típusú gombaölő szerek és kontakt készítmények keverékével védekezzünk.</p>
<p style="text-align: justify;"><strong>Lisztharmat:</strong><br />
A lisztharmat jelenleg a primer, azaz az elsődleges tüneteket mutatja. Az almafákon jelenleg a fertőzött hajtásokból előjövő levelekről fertőz a friss levelekre. A betegség terjedésének a megállítása érdekében javasoljuk a célzott védekezéseket. Elsősorban olyan azol típusú készítményekkel, amelyek hatásosak a lisztharmat ellen is. Felhívjuk a figyelmet, hogy a varasodás megállítására előszeretettel használt difenokonazol hatóanyag kombinációs partner nélkül nem elég a lisztharmat-fertőzéshez. A lisztharmat ellen eredményesen használhatjuk a kéntartalmú készítményeket is.</p>
<p style="text-align: justify;"><strong>Tűzelhalás:</strong><br />
A virágzás már lezárult, egyes még kései virágokkal találkozhatunk. A tűzelhalás fertőzésének a veszélye csökkent, tünetekkel egyelőre nem találkoztunk. Az elmúlt héten az időjárás meleg volt, de csapadékmentes, így a betegség terjedéséhez szükséges klimatikus tényezők kevésbé voltak adottak.</p>
<p style="text-align: justify;"><strong>Piros gyümölcsfa takácsatka:</strong><br />
A piros gyümölcsfa takácsatka (Panonychus ulmi) elleni védekezést javasoltuk az előző előrejelzésünkben. Akkor a kártevő érzékenyebb volt a rovarölő szerekre. Köszönhetően az elmúlt heti meleg időjárásnak, most már valószínűleg nagyobb arányban találhatóak a kifejlett alakok és a szövedékképződés is megindult, így a készítmények hatása is csökkent.</p>
<p style="text-align: justify;"><strong>Zöld almalevéltetű:</strong><br />
A levéltetvek áttelelő egyedei (ősanyák) már előfordulhatnak a kinyílt rügyekben, a kis levélkezdemények védelmében a szívogatást már elkezdik. Hőmérséklettől függően az első telepeiket ki fogják alakítani. Hangyákat már lehet látni a hajtásvégeken, amik már a levéltetveket látogatják, illetve segítik a kolóniák kialakításában.</p>
<p style="text-align: justify;"><strong>Vértetű:</strong><br />
A gyökérnyaki szinten áttelelt vértetű egyedek most vándorolnak fel a lombkoronába, és kezdik el a telepek kiépítését. Sajnos már találkoztunk olyan vértetű kolóniával, ami már egész ágakat befedett. Az ellenük való védekezés nehéz. A vattaszerű telepek védelme alatt a kártevő szépen fel tud szaporodni. Javasoljuk ez ellenük való védekezést. A friss hajtásokon megjelenő vértetű ellen a felszívódó rovarölő szerek hatásosak.</p>
<p style="text-align: justify;"><strong>Almamoly:</strong><br />
Az almamoly rajzása elindult. Az első almamolyt 2024.04.14-én fogtuk Nyíregyházán. A meteorológiai adatok szerint a párzáshoz szükséges alkonyati hőmérséklet minden egyes általunk mért helyszínen 2024.04.15-én már adott volt. Később, a rákövetkező nap (2024.04.16-án) a hőmérséklet a párzáshoz szükséges optimum alá hűlt. Várhatóan a héten a tojások rakása nem vagy csak kis intenzitásal fog megindulni. Annak ellenére, hogy a párzáshoz szükséges egyéb feltételek (hőmérséklet) még csak részben adottak, a tojások rakása még nem indult el. Az úgynevezett biofix időpont, ami a rajzás kezdetét jelzi, az idei évben április 15-re tehető, ugyanis ez volt az elő nap, amikor már rendszeresen fogtak nagy egyedszámot a csapdák és az alkonyati hőmérséklet is 16 °C felett volt. Egyes helyszíneken a csapdák az első napon kimondottan sok almamolyt fogtak, mint a mi esetünkben Kölcsén.</p>
<p style="text-align: justify;">A kezeléseket egyelőre még nem kell elkezdeni. Ezen a héten a meteorológiai előrejelzések szerint hűvös idő várható, így valószínűleg a következő héten már a rajzás is erősödni fog és a célzott, tojások és fiatal lárvák elleni kezeléseket akkor kell majd elvégezni.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p style="text-align: justify;">A meggy jelenleg megymag méretű gyümölcsállapotában található.</p>
<p style="text-align: justify;"><strong>Virágfertőző monília:</strong><br />
A meggyvirágzás már befejeződött, ezzel a virágfertőző monília terjedése is megállt. A virágzás alatt változó, csapadékos és száraz időjárás volt. A betegség fertőzéséhez szükséges időjárási tényezők csak részben voltak adottak, tünetekkel még nem találkoztunk. A további védekezés már nem indokolt.</p>
<p style="text-align: justify;"><strong>Meggy antraknózis:</strong><br />
A meggy következő betegsége, ami ellen védekeznünk kell, az antraknózis. A kezeléseket a kötődést követően csapadékos időjárás esetén folyamatosan megelőző jelleggel kontakt gombaölő szerrel javasoljuk elvégezni, hogy megakadályozzuk a gomba növénybe való bejutását.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ŐSZIBARACK</h3>
<p style="text-align: justify;">Az őszibaracktermés növekedés állapotában van.</p>
<p style="text-align: justify;"><strong>Tafrinás levélfodrosodás:</strong><br />
Az elmúlt héten a meleg időjárásnak köszönhetően a tafrinás levélfodrosodás betegség terjedése teljesen leállt. A leveleken lévő tünetek látszanak, de várhatóan új leveleken fertőzés már nem fog létrejönni. A károsodott leveleken a deformáció egyre markánsabb lesz, a levéllemez meg fog vastagodni, majd várhatóan néhány héten belül lehullanak. Védekezésre nincs szükség.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsok a <a href="/kapcsolat">Kapcsolat</a> menüpontban található elérhetőségeinken kérhetők.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-q5n69f5kf', 'blog', 'Növényvédelmi előrejelzés – 2024. április 5.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.04.05.', '/images/novenyvedelmi elojelzes8.png', 'Az elkövetkező héten az időjárás a szokásostól melegebb lesz. A levegő hőmérséklete 19-26°C is lehet, csapadékra szerdán számíthatunk (2024.04.10-én), az éjszakai hőmérséklet nem fog 7°C alá hűlni, így további fagykárra nem számíthatunk. &#160; Fagykár Március 25-26-án éjjel fagyok voltak, kajszibarack 100%-os kárt is találtunk. Az alma és a meggy esetében javasoljuk a virágkezdemények, illetve a ...', '<p style="text-align: justify;"><strong>Az elkövetkező héten az időjárás a szokásostól melegebb lesz. A levegő hőmérséklete 19-26°C is lehet, csapadékra szerdán számíthatunk (2024.04.10-én), az éjszakai hőmérséklet nem fog 7°C alá hűlni, így további fagykárra nem számíthatunk.</strong></p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Fagykár</strong></p>
<p style="text-align: justify;">Március 25-26-án éjjel fagyok voltak, kajszibarack 100%-os kárt is találtunk. Az alma és a meggy esetében javasoljuk a virágkezdemények, illetve a kinyílt virágok bibéjét átvágni, amennyiben a közepén barna elszíneződés található. Sajnos, az a virág, még ha virágzik is, nem fog megkötni. Ha a károsodás csak részleges is, a gyümölcskezdemény akkor is lehet, hogy sérült lesz. Saját almaültetvényemben a központi tengely virágai (királyvirágok) kb. 80-90%- ban károsodtak. A fagykár bejelentésére az eseményt követő 15 napon belül van lehetőség, kollégáink szívesen állnak ebben rendelkezésre.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Védekezés virágzó kultúrában</strong></p>
<p style="text-align: justify;">A gyümölcsösök virágzásállapotban vannak. A kijuttatott készítmények során fordítsunk különös figyelmet a méhek védelmére. Ne felejtsük el, hogy a gyomok virágzása esetén az ültetvény is ugyanúgy virágzó kultúrának számít, valamint azt, hogy a méhek nemcsak a virágok nektárjait keresik fel, hanem a levéltetvek mézharmatját is! Ezekben az esetekben ugyanolyan körültekintéssel kell eljárni a permetezések során, mintha a gyümölcsfák virágoznának.</p>
<p style="text-align: justify;">Permetezésekkor az alábbi feltételekre kell odafigyelnünk:<br />
&#8211; Virágzó kultúrának számít, ha a kultúrnövény vagy a táblán lévő gyomok és a tábla közvetlen szomszédságában lévő növények virágoznak.<br />
&#8211; Ellenőrizni kell az adott készítmény méhvédelmi besorolását (nemcsak a rovarölő szereknél, hanem a gombaölő és gyomirtó készítményeknél is).</p>
<p>Méhekre nem veszélyes, illetve nem jelzésköteles készítmények esetén:<br />
Bármely időpontban végezhető a permetezés.</p>
<p style="text-align: justify;">Méhekre mérsékelten veszélyes készítmények esetén:<br />
A permetezéseket a csillagászati naplemente előtt egy órával kell megkezdeni és legkésőbb este 11 óráig be kell fejezni. A kezelések az önkormányzat jegyzője felé bejelentés kötelesek.</p>
<p style="text-align: justify;">Méhekre kifejezetten veszélyes készítmények:<br />
A virágzó kultúrákban és egyéb olyan esetben, amikor a méhek látogatják az ültetvényt (gyomok, virágai, levéltetvek, körtelevélbolha mézharmatja) nem használhatóak.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Terméskötődés fokozása</strong></p>
<p style="text-align: justify;">Különösen a fagykárt szenvedett, kevés virággal rendelkező ültetvényekben fontos, hogy a kötődést fokozzuk. A bór tartalmú lombtrágyák, valamint az egyéb kötödést elősegítő anyagok kijuttatásának az ideje a pirosbimbós állapot, valamint a virágzás kezdete. Ekkor fejtik ki a legkedvezőbb hatásukat. A kijuttatást mindenképp a virágzás elejére javasoljuk. Amennyiben tervezzük megismételni, akkor az ismételt kezelést a virágzás közepére időzítsük.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;"><strong>ALMA</strong></h3>
<p>&nbsp;</p>
<p style="text-align: justify;">Az alma jelenleg pirosbimbós &#8211; virágzás kezdete állapotában van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Betegségek</strong></p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafavarasodás:</strong></p>
<p style="text-align: justify;">Az almafavarasodás aszkospóráinak a vizsgálata során megállapíthatjuk, hogy az idén a spóraszóródás rendkívül korán elindult. Később az időjárás hűvösebbre váltott, így a szóródásintenzitás is csökkent, egyes helyszíneken meg is állt. Az elmúlt hetek időjárása csapadékos volt. A varasodás fertőzéshez szükséges időjárási tényezői optimálisak voltak március 28-29-én, illetve április 3-4-én. A levélfelületi nedvesség időtartalma megfelelő volt az aszkospórák fertőzéséhez. Ugyan a hőmérséklet ebben az időszakban alacsony, 10°C körül volt, ennek ellenére a gomba tudott fertőzni és bejutni a bőrszövet alá. Javasoljuk, hogy a hétvégén, illetve a következő hét első napjaiban védekezzünk. Ahőmérséklet emelkedésével már lehet azolt típusú készítményeket is használni.</p>
<p style="text-align: justify;"><strong>Lisztharmat:</strong></p>
<p style="text-align: justify;">A lisztharmat az áttelelt, fertőzött hajtásvégekről indítja a fertőzést. A fertőzött rügyekből fertőzött hajtások jönnek elő, ellenük 100%-osan ebben az időszakban csak metszéssel lehetne védekezni, amennyiben ez megoldható. Jelenleg a cél, hogy a fertőzött hajtások ne terjedjenek tovább. Erős fertőzés esetén javasoljuk a kéntartalmú készítmények vagy a kettős (varasodás-lisztharmat) felszívódó gombaölőszerek alkalmazását. Felhívjuk a figyelmüket, hogy a varasodás ellen előszeretettel használt difenokonazol hatóanyag önmagában kevésbé eredményes a lisztharmat ellen. Javasoljuk a gyári kombinációk használatát. A kéntartalmú készítményeket inkább az alacsonyabb, nyári dózisban használjunk. Elsősorban ott javasoljuk, ahol a fertőzött hajtásvégek metszéskori eltávolítása nem volt sikeres, illetve ott, ahol előző évben az atkák komoly gondot okoztak.</p>
<p style="text-align: justify;"><strong>Tűzelhalás:</strong></p>
<p style="text-align: justify;">A tűzelhalás-betegségről még nem lehet beszélni. Nincs is fertőzés, hiszen a körülmények sem adottak, illetve a növények (alma, körte, birs) fejlettségi állapota sem érte még el azt a szintet, amikor veszélyes lehet. Mégis érdemes egy pár szót ejteni erről a betegségről is, hiszen ha a megelőzésre alapozzuk a védekezést, akkor azt el kell kezdeni. A tűzelhalás csak akkor fog fertőzni, ha a virágzáskor egyszerre csapadékos és meleg idő is van. A meteorológiai előrejelzések meleg időt jósolnak az elkövetkező hétre. Egy esetleges csapadékkal együtt jövő felmelegedéssel a fertőzési kockázat megnőhet.</p>
<p style="text-align: justify;">Megelőzésre az alábbi módszerek közt választhatunk:<br />
• Használhatunk növénykondicionálókat, (pl. Atonik, Aliette 80WG), ami a gyümölcsfák „immunrendszerét” javítja, pontosabban ellenállóbbá teszi a tűzelhalás fertőzése ellen. A hatás csak akkor eredményes, ha időben elkezdjük (pirosbimbós állapotban) a kezeléseket.<br />
• Illetve használhatunk megelőző jelleggel olyan készítményeket (Blassom Protect) is, amelyben más, az almára nem káros élesztőgomba foglalja el a virágzaton a tűzelhalás baktérium életterét, így nem tud kialakulni a fertőzés.</p>
<p style="text-align: justify;">Mind a két esetben a védekezés csak akkor hatásos, ha időben, még a virágzatok kialakulása előtt elkezdjük a kezeléseket!</p>
<p style="text-align: justify;">Aliette 80 WG felhasználási javaslat:</p>
<p style="text-align: justify;">Foszetil hatóanyagú gombaölőszer. Baktériumölő hatása nincs, de nagyon jól lehet használni megelőző jelleggel a tűzelhalás ellen. A készítmény nagyon jó növénykondícionáló. A gyümölcsfák ellenálló képességét növeli, így hatásosan lehet megelőző jelleggel védekezni a tűzelhalás ellen. A védekezéseket már pirosbimbós állapotban el kell kezdeni 4l/ha dózisban és 2-3 naponta megismételni egészen a virágzás közepéig, de minimum 3 permetezés javasolt. Ha időben kezdjük el a permetezéseket és betartjuk a technológiát, akkor „megerősítjük” a növényeinket a betegség leküzdése érdekében. A kijuttatást önállóan javaslom.</p>
<p style="text-align: justify;">Blassom Protect felhasználási javaslat:</p>
<p style="text-align: justify;">Hasonlóan az előző készítményhez, ezt is megelőző jelleggel kell kijuttatni, bár a hatásmechanizmus nagyban eltér az Alliettől. Itt egy a tűzelhalással konkuráló, a virágokra, növényre hatástalan élesztőgomba tenyészettel vonjuk be a virágzatot, ami elveszi mind az életteret, mind a táplálékot a tűzelhalás baktériumtól. Felhasználási javaslat: 1,5kg/ha dózis. A kezeléseket a virágzás elején kell megkezdeni és a sziromhullásig kell ismételni legalább 3-4 alkalommal.</p>
<p style="text-align: justify;">Antibiotikumok használata:</p>
<p style="text-align: justify;">Kétségtelen, hogy a legeredményesebben antibiotikumokkal tudunk ellenük védekezni, de felhívnám a figyelmet arra, hogy sem a streptomicinnek, sem a kasugamicinnek, illetve az oxiteraciklinnek nincs engedélye a felhasználásra!</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Állati kártevők</strong></p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Bimbólikasztó bogár</strong></p>
<p style="text-align: justify;">A bimbólikasztó bogár kártételeit már lehet látni, ellenük védekezni most nem lehet.</p>
<p style="text-align: justify;"><strong>Piros gyümölcsfa takácsatka</strong></p>
<p style="text-align: justify;">A piros gyümölcsfa takácsatka (Panonychus ulmi) elleni védekezésre most van kiváló alkalom, ugyanis a kártevő tojásalakban telel át. Most elsősorban lárvaalakban van jelen, illetve a rá jellemző szövedéket, ami védi a növényvédő szerektől, még nem tudta kialakítani. Javasoljuk, hogy ha korábban károkat okozott, akkor most még a felszaporodás, a telepek kialakulása, illetve a károsítás elkezdése előtt el lehet pusztítani. Kiemelendő, hogy a gyümölcsfáinkat károsító atkák közül csak a piros gyümölcsfa takácsatkára igazak a fenti állítások. Ha más atkafaj károsít a gyümölcsösben akkor nem javaslok védekezést. Hogyan tudjuk egyszerűen megállapítani a kártevőt? Kora tavasszal a kéregrepedésekben, ott ahol a bőrszövet meggyűrődik, ágak ízesülésénél találhatóak a piros színű tojásaik. Amennyiben metszéskor találkoztunk olyannal, mintha pirospaprikával lenne megszórva a gyümölcsfánk, akkor erről a fajról van szó. Most már nem találunk ilyen tünetet, már kikeltek a lárvák. A védekezéskor minden esetben méhekre nem veszélyes készítményt használjunk! A lisztharmat elleni elemi kén készítmények ebben a korai állapotban jó hatással alkalmazhatóak.</p>
<p style="text-align: justify;"><strong>Zöld almalevéltetű</strong></p>
<p style="text-align: justify;">A levéltetvek áttelelő egyedei (ősanyák) már előfordulhatnak a kinyílt rügyekben a kis levélkezdemények védelmében, a szívogatást már elkezdik. Hőmérséklettől függően az első telepeiket ki fogják alakítani. Hangyákat már lehet látni a hajtásvégeken, amik már a levéltetveket látogatják, illetve segítik a kolóniák kialakításában.</p>
<p style="text-align: justify;"><strong>Levélpirosító almalevéltetű</strong></p>
<p style="text-align: justify;">A kártételük már megjelent az ültetvényekben, a kis leveleken már kis mértékű torzulásokat tapasztalhatunk. A későbbiekben a szívogatásnak megfelelően felhólyagosodott, kezdetben narancssárga, majd élénkvörös levéltorzulások fognak kialakulni. Az ellenük való védekezés kulcsa az időben történő kezelések. Mielőtt a levelek torzulnának, azelőtt kell elvégezni a permetezéseket. Később az összehajlott, felhólyagosodott levelek védelmében már nehezen tudunk ellenük hatékonyan védekezni.</p>
<p style="text-align: justify;"><strong>Vértetű</strong></p>
<p style="text-align: justify;">A lombkorona szinten az idén nehezen tudott áttelelni, de partnereink jelzése eszerint több helyen sikerült. A vértetű kolónia elkezdte a károsítását. Elsősorban a gyökérnyaki részen találkozhatunk velük, főleg az intenzív ültetvényekre jellemző oltási csomó környékén. Javasoljuk a gyomok irtását, illetve a sarjhajtások eltávolítását, ezzel megnehezíthetjük az első telepek kialakulását. A lombkorona szinten áttelelt egyedek esetében javasoljuk a kontaktkészítmények alkalmazását. Jelenleg a fajra jellemző fehér vattaszerű képződmény még nem vagy részben alakult ki. Ekkor eredményesen tudunk védekezni. A kezelésekhez mindenképp kontaktkészítményeket javaslunk, hiszen a kártevő most a fásrészeken károsít, ahova a felszívódó rovarölő szerek nem jutnak el. Fontos, hogy a permetező légáramát úgy állítsuk be, hogy a gallyak alsó részére is juttasson permetlevet, a kártevő többnyire itt található.</p>
<p style="text-align: justify;"><strong>Májusi cserebogár</strong></p>
<p style="text-align: justify;">Várható, hogy a májusi cserebogár meg fog jelenni az ültetvényekben. Az ellenük való védekezésben kulcsfontosságú, hogy védekezzünk az imágók ellen. Később, amikor már a lárva fog a talajban károsítani, már nem sok lehetőségünk lesz a védekezésre. A kezelésekre elsősorban kontaktkészítményeket javaslunk.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;"><strong>MEGGY, CSERESZNYE, SZILVA</strong></h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy jelenleg virágzás állapotában található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Virágfertőző monília:</strong></p>
<p style="text-align: justify;">Az előző hírlevelünkben már felhívtam a figyelmet a virágfertőző monília elleni korai védekezésre. A fertőzési nyomás az elmúlt héten nem csökkent. Várhatóan a következő héten a kevesebb csapadéknak köszönhetően a monília fertőzési veszélye csökkenni fog. Jelenleg a meggy a legérzékenyebb a fertőzésre. Minden esetben javasoljuk az ellenük való védekezést. Szerencsés esetben a virágzáskor kevesebb csapadék lesz, így nem biztos, hogy ki fog alakulni erős fertőzés. A virágfertőző monília legerősebben a meggyet támadja meg. Érzékeny még rá a szilva, a kajszi, kevésbé fogékony a cseresznye és az őszibarack. A magas fertőzési nyomás miatt javasoljuk, hogy a meggyen kívül a többi csonthéjas növényeinket is kezeljük.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;"><strong>ŐSZIBARACK</strong></h3>
<p>&nbsp;</p>
<p style="text-align: justify;">Az őszibarack virágzás vége állapotában van</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Tafrinás levélfodrosodás:</strong></p>
<p style="text-align: justify;">A tafrinás levélfodrosodás fertőzése a meleg időjárásnak köszönhetően csökkenni fog vagy meg is megszűnhet. Már nem tudunk a kialakult tünetek ellen védekezni. A fertőzött levelek felhólyagosodtak, illetve a hólyagosodások fokozódni fognak, majd maguktól le fognak hullani a levelek.</p>
<p>&nbsp;</p>
<p>További tanácsokért, segítségért a <a href="/kapcsolat">Kapcsolat</a> menüponton keresztül lehet felvenni velük a kapcsolatot.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-bm0qfr574', 'blog', 'Növényvédelmi előrejelzés – 2024. március 22.', 'alma', 'Mitruné Tóth Krisztina', '2024.03.22.', '/images/novenyvedelmi_elorejelzes-9.jpg', 'Az elkövetkező héten az időjárás csapadékos lesz, vasárnaptól jövő hét péntekig (2024.03.24.-03.29.) folyamatosan fog esni az eső. A várható maximum léghőmérséklet 12-18°C között várható, az éjszakai minimum hőmérséklet 1-7°C -ig hűlhet le. &#160; ALMA Az alma jelenleg egérfüles &#8211; zöldbimbó állapotában van. Betegségek Almafa varasodás 2024.03.19-én végeztünk aszkospóra szóródási vizsgálatot. Egyértelműen megállapítható, hogy az elmúlt ...', '<p style="text-align: justify;">Az elkövetkező héten az időjárás csapadékos lesz, vasárnaptól jövő hét péntekig (2024.03.24.-03.29.) folyamatosan fog esni az eső. A várható maximum léghőmérséklet 12-18°C között várható, az éjszakai minimum hőmérséklet 1-7°C -ig hűlhet le.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>ALMA</strong></span></p>
<p style="text-align: justify;">Az alma jelenleg egérfüles &#8211; zöldbimbó állapotában van.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Betegségek</strong></span></p>
<p style="text-align: justify;"><strong>Almafa varasodás</strong></p>
<p style="text-align: justify;">2024.03.19-én végeztünk aszkospóra szóródási vizsgálatot. Egyértelműen megállapítható, hogy az elmúlt napok hűvös és viszonylag csapadékmentes időjárása visszább fogta az aszkospórák szóródását. Egyes mintákban egyáltalán nem volt található egyetlen egy spóra sem, így a varasodás fertőzésének a veszélye is csökkent. A partnereinkkel való beszélgetés alapján az első (03.12-15. közötti) fertőzésre a gazdálkodók már felszívódó készítményekkel reagáltak, jó esetben ez blokkolta a korai fertőzés kialakulását.</p>
<p style="text-align: justify;">Megvizsgálva a meteorológiai adatokat a következő nagyobb fertőzési hullám 2024.03.24-től várható egészen az esős napok végéig, ami az<br />
előrejelzések szerint 03.29-ig eltarthat. Vegyük figyelembe, hogy az esős időjárás meleggel is társulni fog, ami a korábban visszaeső aszkospóra szóródás intenzitását is növelni fogja.</p>
<p style="text-align: justify;">Számításaink szerint az előző hetekhez képest sokkal erőteljesebb fertőzési időszak fog következni köszönhetően a melegebb, csapadékosabb időjárásnak, nagyobb lombfelületnek. Javasoljuk, hogy a hét hátralavő napjaiban vagy a hétvégén (03.22-23.) megelőző jelleggel védekezzünk felszívódó készítményekkel. Amennyiben a meteorológiai előrejelzések bekövetkeznek, a következő héten a csapadékos és szeles időjárás kevés lehetőséget fog adni a kezelések elvégzésére.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><img decoding="async" class="aligncenter size-full wp-image-509" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2024.-marcius-19-scaled.jpg" alt="Aszkospóra szóródás adatai - 2024. március 19." width="2560" height="1917" title="Növényvédelmi előrejelzés - 2024. március 22. 2" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2024.-marcius-19-scaled.jpg 2560w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2024.-marcius-19-1280x959.jpg 1280w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2024.-marcius-19-980x734.jpg 980w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2024.-marcius-19-480x359.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2560px, 100vw" /></p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Lisztharmat</strong></p>
<p style="text-align: justify;">A lisztharmat az áttelelt fertőzött hajtásvégekről indítja a fertőzést, a fertőzött rügyekből fertőzött hajtások jönnek elő. Ellenük 100%-osan ebben az időszakban csak metszéssel lehet védekezni, amennyiben ez megoldható. A kén tartalmú szerek hatásosak, a lombfelületen lévő lisztharmatot elpusztítja, de az újonnan kibújó levelek ismételten fertőzöttek lesznek.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Állati kártevők</strong></span></p>
<p style="text-align: justify;"><strong>Bimbólikasztó bogár</strong></p>
<p style="text-align: justify;">A bimbólikasztó korai megjelenését követően több mint valószínű, hogy már a károsításának azaz a tojásrakásának a nagy részén már túl van, a kezelések megismétlésére még van lehetőség egészen a zöldbimbós állapotig, később már nincs értelme a permetezéseknek. A védekezéseket amennyiben lehetséges, meleg, napos időben végezzük el.</p>
<p style="text-align: justify;">Védekezési lehetőségek:<br />
A bimbólikasztó bogár a tojásait a bőrszövet alá rakja, ezért nem tudunk ellene hatékonyan olajos lemosó szerekkel, illetve narancsolajjal védekezni. A felszívódó készítmények azért nem hoznak jelentősebb eredményt, mert nincs lombfelület, ahol fel tudnak szívódni. Kontaktszerekkel imágók elleni védekezést javasolunk nappal, meleg, lehetőség szerint napsütéses időben.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>MEGGY, CSERESZNYE, SZILVA</strong></span></p>
<p style="text-align: justify;">A meggy jelenleg zöldbimbó állapotában található.</p>
<p style="text-align: justify;"><strong>Virágfertőző monília</strong></p>
<p style="text-align: justify;">A virágfertőző monília még nem fertőz, a megelőző kezelésekre viszont érdemes odafigyelni. A korai fajták virágzása hamarosan bekövetkezik. Az eredményes védekezés kulcsa az időben történő gombaölőszer kijuttatása. A kezelések kezdetét akkor javasoljuk felszívódó készítményekkel elkezdeni, amikor már a fehér virágszirmok megjelennek, a rügyek közepe fehér színűre vált. Ez az úgynevezett fehérbimbós vagy fehér ballonos állapot kezdete.</p>
<p style="text-align: justify;">Fontos, hogy ebben a stádiumban a bibe már érett, ami bejutást biztosít a gomba spórájának a magkezdeményhez, így a fertőzés már egy ilyen korai szakaszban el tud indulni. A korán befertőzött virágokra a gombaölőszerek már hatástalanok, a tünetek a virágzás végén meg fognak jelenni. A korábban virágzó fajták esetében javasoljuk, hogy a kezeléseket abban az esetben végezzük el, ha a fenti stádium már megjelent. Az elkövetkező héten, 2024.03.24-29-ig csapadékra számíthatunk, ekkor már fertőzhet a monília.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>ŐSZIBARACK</strong></span></p>
<p style="text-align: justify;">Az őszibarack virágzás állapotában van</p>
<p style="text-align: justify;"><strong>Tafrinás levélfodrosodás</strong></p>
<p style="text-align: justify;">Az időjárás kimondottan kedvez az őszibarackban a tafrinás levélfodrosodás betegségnek. A tünetek szépen megjelentek és várhatóan tovább fognak fejődni. Megelőző, illetve kuratív jelleggel javaslom a Score és Delan kombináció használatát. Abban az esetben, ha a fertőzés mértéke magas, akkor használhatunk Syllitet is, ami megállítja a betegséget. A fertőzött levelek már nem fognak kisimulni, a betegség tünete látszani fog rajtuk sőt a levél növekedésével egyre csúnyább lesz.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>KÖRTE</strong></span></p>
<p style="text-align: justify;">A körte zödbimbós állapotban található</p>
<p style="text-align: justify;"><strong>Körtelevél gubacsatka</strong></p>
<p style="text-align: justify;">A fertőzött ültetvényekben a körtelevél gubacsatka elleni védekezés eredményesen most vagy az elkövetkező hetekben tudjuk elvégezni. A kártevő már kora tavasszal megjelenik az ültetvényekben. Az első telepek kora tavasszal védtelenek, most könnyebb őket elpusztítani. Később már a kártevő nyála sejtburjánzást idéz elő a levélen, létrejön a gubacs, aminek a védelmében már szabadon szívhatja a leveleket, ekkor már nem lehet ellenük eredményesen védekezni.</p>
<p style="text-align: justify;">Javasoljuk, hogy azokban az ültetvényekben, ahol komolyabb gondot okoztak ez elmúlt évben, ott a kezeléseket kezdjük el időben elvégezni. A legoptimálisabb időpont, amikor már van lombfelület, viszont a gubacsok még nem alakultak ki. A szerválasztáskor vegyük figyelembe a készítmények méhveszélyességi besorolását, hiszen a bársonyos árvacsalán, ami nagy valószínűséggel jelen van az ültetvényben, most virágzik.</p>
<p style="text-align: justify;">További szakmai tanácsokért a <a href="/kapcsolat">Kapcsolat</a> menüpontban található elérhetőségeinken vagyunk megtalálhatóak.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-5ard773i8', 'blog', 'Változások a növényvédelemben', 'Európai Unió', 'Mitruné Tóth Krisztina', '2024.03.18.', '/images/valtozasok_a_novenyvedelemben.jpg', 'Az idei gazdasági év is számos változást hoz a növényvédelmi tevékenységet folytató gazdálkodók számára, amivel fontos tisztában lenni. Az alábbi összeírás segít eligazodni az előttünk álló változásokkal. &#160; Növényvédelmet érintő változások a 2024-es gazdálkodási év vonatkozásában: &#160; Az Unióban alkalmazott szigorú növényvédőszer-felülvizsgálati szabályok, növényvédőszerek által keltett kockázatelemzések eredményeinek és a méhek egészségmegőrzése, méhállomány védelme érdekében ...', '<p style="text-align: justify;"><strong>Az idei gazdasági év is számos változást hoz a növényvédelmi tevékenységet folytató gazdálkodók számára, amivel fontos tisztában lenni. Az alábbi összeírás segít eligazodni az előttünk álló változásokkal.</strong></p>
<p>&nbsp;</p>
<p style="text-align: justify;">Növényvédelmet érintő változások a 2024-es gazdálkodási év vonatkozásában:</p>
<p>&nbsp;</p>
<p style="text-align: justify;">Az Unióban alkalmazott szigorú növényvédőszer-felülvizsgálati szabályok, növényvédőszerek által keltett kockázatelemzések eredményeinek és a méhek egészségmegőrzése, méhállomány védelme érdekében újabb szigorítások kerültek bevezetésre a kémiai növényvédelmet illetően.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">Az <strong>s-metolaklór</strong> hatóanyagot tartalmazó gyomírtószer készítmények engedélyokirata az Európai Unión belül 2024.04.11-gyel visszavonásra került. A forgalomban lévő készletekre 2024.06.11-ig, a megvásárolt készletek felhasználására 2024.07.23-ig van lehetőség. (Basar Plus, Dual Gold 960 EC, Gardoprim Plus Gold, Lumax stb..)</p>
<p>&nbsp;</p>
<p style="text-align: justify;">A <strong>Riza 250 EW</strong> (tebukonazol) hatóanyagú gombaölőszer engedélyokirata is visszavonásra került. Forgalmazni 2024.02.14-ig lehetett. Felhasználására 2025.02.14-ig áll rendelkezésre türelmi idő.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">A káposztarepcében az <strong>acetamiprid</strong> rovarölő hatóanyagot tartalmazó (Artiler 200 SE, Autentic, Carnadine, Gazell 20 SG, Mospilan 20 SG, Rafting stb.) készítmények felhasználási időszakában az alábbi tiltott időszak kerül alkalmazásra:</p>
<ul>
<li style="text-align: justify;">virágzás kezdetétől 50%-os,</li>
<li style="text-align: justify;">virágzásig nem alkalmazható.</li>
</ul>
<p>&nbsp;</p>
<p style="text-align: justify;">A <strong>Mospilan 20 SG</strong> (acetamiprid) rovarölőszer és analógjai (Spilan 20 SG, Gazelle 20 SG, Rafting stb.) 0,2 kg, 1 kg, 1,5 kg és 5 kg-os kiszerelésben már I. forgalmazási kategóriába fognak tartozni 2024.03.31-től. Az említett kiszerelésekben vásárlásához előzetesen kiállított vény lesz szükséges.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">A <strong>Topas 100 EC</strong> (penkonazol) gombaölő permetezőszer átkerült II-es (zöldkönyves) forgalmazási kategóriába az eddigi III-as (szabad forgalmazás) kategóriából, minden terjedelmű kiszerelésében (azaz az ampullás is).</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>80 órás zöldkönyv:</strong></p>
<p style="text-align: justify;">Felhívjuk gazdálkodóink figyelmét, hogy a növényvédőszer vásárlására, felhasználására érvényes “zöldkönyvvel” kell rendelkezni. Kérjük Érdemes ellenőrizni a zöldkönyvek érvényességi idejét. Amennyiben lejárt, haladéktalanuk jelentkezni kell a továbbképzésre a <a href="https://novenyorvos.hu" target="_blank" rel="noopener">www.növényorvos.hu</a> oldalon. A <strong><em>“ZÖLDKÖNYVES” alap- és továbbképzésre jelentkezéshez kattintson ide</em></strong> hivatkozás használatával lehet ezt megtenni.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-3lqv51owz', 'blog', 'Almafa varasodás előrejelzés – 2024. március 13.', 'Híreink', 'Mitruné Tóth Krisztina', '2024.03.13.', '/images/almafa_varasodas.jpg', 'Ahogy az előző időszakokban, úgy idén is folyamatosan beszámolunk a gyümölcsfákat érinti fejlődési szakaszokról, betegségekről, károkozókról, mikor mire érdemes számítani, mi ellen való védekezésnek következik az időszaka. ALMA Jelenleg kezdeti zöldbimbó állapotában van. Betegségek: Almafa varasodás: A varasodás tekintetében is rendhagyó évünk van, míg a múlt szerdán amikor spórát fuvattunk gyakorlatilag nem volt előjele a ...', '<p style="text-align: justify;">Ahogy az előző időszakokban, úgy idén is folyamatosan beszámolunk a gyümölcsfákat érinti fejlődési szakaszokról, betegségekről, károkozókról, mikor mire érdemes számítani, mi ellen való védekezésnek következik az időszaka.</p>
<p style="text-align: justify;"><strong>ALMA</strong></p>
<p style="text-align: justify;">Jelenleg kezdeti zöldbimbó állapotában van.</p>
<p style="text-align: justify;"><strong>Betegségek:</strong></p>
<p style="text-align: justify;"><strong>Almafa varasodás:</strong></p>
<p style="text-align: justify;">A varasodás tekintetében is rendhagyó évünk van, míg a múlt szerdán amikor spórát fuvattunk gyakorlatilag nem volt előjele a varasodás aszkospóráinak, hétfőn (2024.03.11-én) végzett vizsgálat már pozitív eredményt mutatott. A mintáink közül Ajak, Nyíregyháza, Tarpa esetében már mérhető mennyiségű aszkospórát találtunk, a nyíracsádi mintában csak egy párat, viszont a tuzséri mintában tömeges mennyiségű volt a szóródás. Az elmúlt hétvégi csapadék mennyisége pontosan elég volt ahhoz, hogy a levelek átnedvesedjenek és a szóródás elinduljon.</p>
<p style="text-align: justify;">A fertőzéshez szükséges lombfelület és spóra már adott, a fertőzés bekövetkeztét már csak az időjárási tényezők befolyásolják. <strong>A meteorológiai állomásaink egyöntetűen azt mutatják, hogy 2024.03.12-én már megfelelő volt a levélfelületi nedvesség időtartalma, és a hőmérséklet az aszkospórák csírázásához, ez a dátum az amikor a varasodás fertőzése elindult</strong>, amikor az első spórák már bejutottak a növény bőrszövete alá és elindult a kórokozó fejlődése. Összehasonlítás képen 2022-ben április 7-re, 2023-ban március 28-ra becsültük meg a varasodás fertőzésének az első időpontját, az idei évben nagyon korai a fertőzés, de ezzel összhangban az alma fejlettsége is nagyon előrehaladott.</p>
<p style="text-align: justify;">A tervezett védekezésekkor minden esetben legyünk arra tekintettel, hogy</p>
<ul>
<li style="text-align: justify;">Az elközetkező napokban a betegség terjedéséhez a klimatikus tényezők adottak lesznek.</li>
<li style="text-align: justify;">A napi átlag hőmérséklet 8-9°C ez viszonylag magas, ilyen feltételek mellett az aszkospórák csírázása folyamatos, kb. 10-14 óra levélfelületi nedvesség már elég a fertőzéshez.</li>
<li style="text-align: justify;">Az almások fenológiai állapota a rügy duzzanattól a korai zöldbimbós állapotig helyenként eltérő mértékben változik, bármilyen állapotban is van a lombfelület már fertőzésre fogékony.</li>
<li style="text-align: justify;">A hagyományos technológia réz tartalmú szerek korai használata, nem javasolt.</li>
<li style="text-align: justify;">Bár a lombfelület kicsi annak ellenére olyan készítményt kell alkalmaznunk aminek tartamhatása is van, így javasoljuk a felszívódó szerek használatát</li>
</ul>
<p style="text-align: justify;">A március 15-i hosszú hétvégén védekeznünk kell, a meteorológiai előrejelzések borús szeles időt jósolnak, nehéz lesz megtalálni az optimális időpontot, de nem javasoljuk a kezelés elhagyását.</p>
<p>&nbsp;</p>
<p><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-499" src="https://www.demotrade.hu/wp-content/uploads/Almafa-2024.03.13.png" alt="Almafa - 2024.03.13." width="661" height="890" title="Almafa varasodás előrejelzés - 2024. március 13. 4" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-2024.03.13.png 661w, https://www.demotrade.hu/wp-content/uploads/Almafa-2024.03.13-480x646.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 661px, 100vw" /></p>', NULL, NULL, NULL, NULL, NULL),
  ('post-41d9ij4j1', 'blog', 'Jelentkezz az agrárdigitalizációs programba!', 'Pályázatok', 'Mitruné Tóth Krisztina', '2023.12.11.', '/images/jelentkezz.jpg', 'Munkatársaink a GAK Nonprofit Kft.-vel (Gödöllői Egyetem) együttműködésben az Európai Unió felkérésére részt vesz egy agrárdigitalizációs programban, melyre résztvevő gazdálkodókat, partnereket keresünk. A projektről röviden: A program neve: AEDIH (Agricultural European Digital Innovation Hub) https://intro.aedih.hu/ A projekt fontos eleme, hogy az Európai Unió tapasztalatot szerezzen a hazai gazdálkodók agrárdigitalizációs és precíziós gazdálkodásban való előrehaladottságáról, illetve a gazdálkodók ...', '<p style="text-align: justify;">Munkatársaink a GAK Nonprofit Kft.-vel (Gödöllői Egyetem) együttműködésben az Európai Unió felkérésére részt vesz egy agrárdigitalizációs programban, melyre résztvevő gazdálkodókat, partnereket keresünk.</p>
<p style="text-align: justify;"><b>A projektről röviden:</b></p>
<p style="text-align: justify;"><b>A program neve:</b> AEDIH (Agricultural European Digital Innovation Hub) <a href="https://intro.aedih.hu/" target="_blank" rel="noopener" data-saferedirecturl="https://www.google.com/url?q=https://intro.aedih.hu/&amp;source=gmail&amp;ust=1702367146251000&amp;usg=AOvVaw1f2yZR0Z8vRsbjwxaYIUZn">https://intro.aedih.hu/</a></p>
<p style="text-align: justify;">A projekt fontos eleme, hogy az Európai Unió tapasztalatot szerezzen a hazai gazdálkodók agrárdigitalizációs és precíziós gazdálkodásban való előrehaladottságáról, illetve a gazdálkodók ez irányú terveiről, amelyeket a későbbiekben a különböző mezőgazdaságot érintő szabályozásaiban és pályázatai felhívásaiban is fel tud használni. A felmérés során 3 éven keresztül évente egy online kérdőívet kell kitölteni a vállalkozásban használt digitális  technológia előrehaladásról, illetve a projekt munkatársai készítenek egy a gazdaságra igazított fejlesztési javaslatot. A résztvevők a kérdőívek kitöltését követően ingyenesen igénybe vehetik az ADEIH agrár-digitális szolgáltatásait és képzéseit.</p>
<p style="text-align: justify;"><b>A projekttel érintett feladatok:</b></p>
<ul style="text-align: justify;">
<li style="list-style-type: none;">
<ul>
<li>Évente egy online kérdőív kitöltése. A kérdőíveket közösen a szaktanácsadóinkkal készítjük el, a gazdálkodónak ezekkel más feladatuk nem keletkezik.</li>
</ul>
</li>
</ul>
<p style="text-align: justify;"><b>A projektben való részvétel előnyei:</b></p>
<ul style="text-align: justify;">
<li style="list-style-type: none;">
<ul>
<li>Ingyenes térinformatikai és  agrárdigitalizációs képzéseken való részvétel (nem kötelező).</li>
<li>Ingyenes agrárdigitalizációs szolgáltatások igénybevétele (a területeken menedzsmentzónák kialakítása tápanyag-ijuttatáshoz, differenciált vetéshez, talajszkennelés, NDVI-térképek készítése, hozamtérképek készítése, kiértékelése, drónfelvételezés stb.). A szolgáltatásokat a gazdálkodók igényihez igazítják.</li>
<li>A résztvevők ezzel kutatóintézettel, bemutatóüzemmel is együttműködésbe kerülnek, ami várhatóan a későbbi VP-s pályázatokban előnyt jelenthet.</li>
</ul>
</li>
</ul>
<p style="text-align: justify;"><b>A projektben való részvétel költségei:</b></p>
<ul style="text-align: justify;">
<li style="list-style-type: none;">
<ul>
<li>A résztvevőket semmilyen költség nem terheli, az ezzel kapcsolatos munkákat a kollégáink végzik el.</li>
<li>A szolgáltatásokat és képzéseket a projektben résztvevő oktató és szolgáltató vállalkozások ingyenesen végzik el, de a költségek a gazdálkodó de-minimis keretét csökkentik, a résztvevőket költségek itt sem terhelik.</li>
</ul>
</li>
</ul>
<p style="text-align: justify;">A mezőgazdaság digitális átállása elkerülhetetlen, gyakorlatilag ez a jövő útja. Gondoljunk csak arra, hogy már most online naprakész gazdálkodási naplót és permetezési naplót kell vezetnünk, a hétköznapi munkánkba is egyre több helyen digitális szolgáltatások, appok segítik a munkánkat.</p>
<p style="text-align: justify;">Várjuk azon gazdálkodók részvételét a projektben, akik hajlandók a digitalizáció témájában velünk együtt gondolkodni, illetve azokat, akik a későbbiekben bármilyen fejlesztést terveznek, ami érinti az agrárdigitalizáció, precíziós gazdálkodás területét.</p>
<p style="text-align: justify;">A részvételi igényeket <a href="/kapcsolat">kollégáinknak vagy a központi e-mailen</a> is lehet jelezni.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-a79s419iu', 'blog', 'Növényvédelmi előrejelzés – 2023.07.11.', 'Híreink', 'Mitruné Tóth Krisztina', '2023.07.11.', '/images/novenyvedelem-1080x641.jpg', 'Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum léghőmérséklet 31-38 °C között lesz, igazi kánikulára számíthatunk, csapadékot a meteorológusok nem jósolnak. &#160; ALMA &#160; Az alma jelenleg 50-60 mm nagyságú gyümölcsméret állapotában van. Egyes fajtáknál a hajtások növekedése részben befejeződött, a lombkorona felső részeiben lévő hajtások növekedése még folyamatban van. Az elmúlt heti ...', '<p style="text-align: justify;"><strong>Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum léghőmérséklet 31-38 °C között lesz, igazi kánikulára számíthatunk, csapadékot a meteorológusok nem jósolnak.</strong></p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">Az alma jelenleg 50-60 mm nagyságú gyümölcsméret állapotában van. Egyes fajtáknál a hajtások növekedése részben befejeződött, a lombkorona felső részeiben lévő hajtások növekedése még folyamatban van. Az elmúlt heti esőzéseknek következtében a másodlagos hajtásnövekedés elindult.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás</strong><br />
Sok helyen tapasztalhatjuk, hogy az almafa varasodás károkat okozott. A tavaszi és a nyári csapadékos időjárás komoly feladat elé állította a gazdálkodókat. Sajnos a gyümölcstünet általános, kisebb nagyobb mértékben sok helyen meg lehet találni. A tünetek mellett találkozhatunk megfogott varasodás foltokkal is, ami kisebb lázfoltra emlékeztető kárképet mutat. Remélhetőleg ezek a foltok a gyümölcs növekedésével és a színeződéssel idővel el fognak tűnni vagy halványodni fognak.</p>
<p style="text-align: justify;">Az elkövetkező héten a meteorológiai előrejelzések szerint meleg csapadékmentes időjárásra számíthatunk, ami a varasodás terjedését meg fogja állítani. Védekezésre az esőzéseket követően van szükség. Csapadék után javasoljuk a kontakt készítmények alkalmazását.</p>
<p style="text-align: justify;">Az elmúlt két heti fertőzési veszélyhelyzeteket az alábbi táblázatban foglaltam össze:</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-473" src="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.26.-07.10.jpg" alt="Almafa varasodas fertozesi idopontok 2023.06.26. 07.10" width="523" height="764" title="Növényvédelmi előrejelzés – 2023.07.11. 11" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.26.-07.10.jpg 523w, https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.26.-07.10-480x701.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 523px, 100vw" /></p>
<p style="text-align: justify;"><strong>Lisztharmat</strong><br />
A lisztharmat terjedése a hajtásnövekedés befejeztével meg fog szűnni, a betegség elsősorban a friss hajtásvégeket kedveli. Az elmúlt időszakban sok csapadék volt. Ennek következtében a már bezárult hajtások újra indultak, a másodlagos hajtásnövekedés ismét lehetőséget teremt a lisztharmat betegség terjedéséhez.</p>
<p style="text-align: justify;">Korábban az almafa varasodás elleni felszívódó szeres védekezés a legtöbb esetben védelmet nyújtott a lisztharmat ellen is. Figyeljünk rá, hogy a varasodás ellen használt kontakt készítmények hatástalanok a lisztharmat ellen. Fertőzésveszély esetén, különösen ott, ahol nagyobb mértékű a másodlagos hajtásnövekedés, javasoljuk a célirányos lisztharmat elleni kezeléseket.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Tűzelhalás</strong><br />
Az idei évben egyes kertekben a tűzelhalás hatalmas gondokat okozott. A csapadékos meleg időjárás többnyire heves széllel is párosult, ami mikro sérüléseket okozott a fákon. Ezen tényezők összessége kedvező ökológiai hátteret nyújtott a baktérium fejlődéséhez.</p>
<p style="text-align: justify;">A nyári védekezések sajnos már nem hoztak megfelelő eredményt a betegség ellen. Elsősorban a megelőző jellegű kezelések a hatásosak. Az elkövetkező hetek meleg száraz időjárásának a hatására a betegség terjedése teljesen meg fog állni, a régi tünetek leszáradnak. Várhatóan új fertőzésre csak akkor számíthatunk, ha már ismét csapadékossá fordul az időjárás.</p>
<p style="text-align: justify;">Védekezési javaslat tűzelhalás ellen:<br />
Amennyiben az időjárás száraz marad, védekezni nem szükséges. A fertőzött ágvégeket az egészséges résznél visszavágva eltávolíthatjuk.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Állati kártevők</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Atkák</strong><br />
Az atkák részére a nyári kánikula optimális körülményeket nyújt a kártevő felszaporodásához. Ilyen nagy melegben a generációk akár egy hét alatt is ki tudnak fejlődni. Az atkák már jelen vannak az ültetvényekben. Eddig inkább kisebb telepeken lehetett őket megtalálni, most várható, hogy sokkal nagyobb, akár az egész ültetvényt kitevő területre szétterjednek. Ezt meg kell akadályozni.</p>
<p style="text-align: justify;">Az atkákat a levélen nehéz észre venni. Érdemes jelenlétre utaló jeleket, az ürüléküket (apró fekete pontok), illetve a takácsatkák esetében a levél fonákán a szövedéket keresni. Idővel a leveleken észrevehetőek a szívogatás nyomok. Erős fertőzés esetében a levelek bebarnulnak.Ezt az utóbbi állapotot nem szabad megvárni. Ugyan apró kártevők, de hatalmas mennyiségű vizet és tápanyagot tudnak elszívni a növénytől, pontosan abban az időszakban, amikor a gyümölcsméret növekedéséhez ez a legfontosabb lenne.</p>
<p style="text-align: justify;">Javasoljuk a kertek szemlézését és a kezelések megismétlését, illetve ha valaki még nem permetezett atkaölő szerrel, javasoljuk elkezdeni. Problémát elsősorban azokban az ültetvényekben fog okozni, ahol korábban is jelen volt, de ott is javasoljuk a megelőző, legalább egyszeri védekezést, ahol nem szokott nagyobb problémát okozni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Vértetű</strong><br />
A következő kártevő, ami komoly gondot fog okozni, az a vértetű. Szinte nincs olyan kert, ahol nem lenne jelen. Várható, hogy a meleg száraz időjárás a terjedésüket nagy mértékben elő fogja segíteni. Az igazi gradációra még csak most számíthatunk.</p>
<p style="text-align: justify;">Védekezési javaslatunk:<br />
A vértetű ellen kimondottan nehéz védekezni. Igazából egyetlen tökéletes megoldás sincs. Eredményt csak akkor tudunk elérni, ha a különböző kezeléséket időben használjuk, így mindegyik egy kicsit gyéríti a kártevőt, így lehet az egyedszámukat csökkenteni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levéltetvek</strong><br />
A zöld alma levéltetű elterjedése visszaesett köszönhetően a hajtásnövekedés befejezésének. Újabb kártételre csak ott számíthatunk, ahol az esőzéseknek köszönhetően újra indult a hajtások növekedése és friss zsenge világoszöld levelekkel találkozhatunk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almamoly</strong><br />
Az almamoly előrejelzését, illetve a populáció állapotát a hőösszeg számítás alapján határozzuk meg. A számításunk alapja, hogy a tavasszal meghatározott biofix időponthoz (ami az első egyedek megjelenése) kiszámoljuk a generáció teljes kifejlődéséhez szükséges hőösszeget, így meghatározzuk, hogy a 2. nemzedék első egyedeinek a rajzása mikor indul, illetve ettől kezdve számolhatjuk, hogy a 2. generáció tojásrakása, lárvakelése mikor várható. A táblázat utolsó, a populáció állapot oszlopa a teljes almamoly populáció legfejlettebb egyedeinek az állapotát mutatja. Természetesen ez egy támpont, hiszen az 1. nemzedék rajzás teljesen elhúzódott, átfedésben van a 2. nemzedékkel.</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-474" src="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023-4.jpg" alt="Almamoly csapdazasi adatok 2023 4" width="537" height="707" title="Növényvédelmi előrejelzés – 2023.07.11. 12" srcset="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023-4.jpg 537w, https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023-4-480x632.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 537px, 100vw" /></p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong><br />
A keleti gyümölcsmoly rajzása most egy kicsit emelkedett, változó egyedszámmal folyamatosan jelen vannak az almásokban és a csonthéjasokban is. Ellenük az almamoly elleni kezelésekkel a fent leírtak alapján lehet, azzal a kivétellel, hogy a granulovírus alapú készítmények a keleti gyümölcsmoly ellen hatástalanok.</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-475" src="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-5.jpg" alt="Keleti gyumolcsmoly csapdazasi adatok 2023. 5" width="529" height="107" title="Növényvédelmi előrejelzés – 2023.07.11. 13" srcset="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-5.jpg 529w, https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-5-480x97.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 529px, 100vw" /></p>
<p style="text-align: justify;"><strong>Almailonca</strong><br />
Az almailonca már egy hónapja nincs jelen az ültetvényekben.</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-476" src="https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.-4.jpg" alt="Almailonca csapdazasi adatok 2023. 4" width="528" height="110" title="Növényvédelmi előrejelzés – 2023.07.11. 14" srcset="https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.-4.jpg 528w, https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.-4-480x100.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 528px, 100vw" /></p>
<p style="text-align: justify;"><strong>Aknázómolyok</strong><br />
Az almalevél aknázómoly és a sátorosmoly is nagy egyedszámmal rajzik a meleg időjárás elősegíti a felszaporodásukat, javasoljuk, hogy a védekezést elsősorban felszívódó szerekkel végezzük el, meg-előzve ezzel a nagyobb populáció kialakulását.</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-477" src="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-5.jpg" alt="Almalevel aknazomoly csapdazasi adatok 2023. 5" width="532" height="108" title="Növényvédelmi előrejelzés – 2023.07.11. 15" srcset="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-5.jpg 532w, https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-5-480x97.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 532px, 100vw" /></p>
<h2 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy, cseresznye érés állapotban, betakarítás utáni állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Meggy antraknózis</strong><br />
Az érés előtt az elmúlt héten csapadékos, párás időjárásunk volt, várható, hogy az antraknózis fertőzése erősödni fog. A védekezéskor minden esetben vegyük figyelembe a készítmények egészségügyi várakozási idejét.</p>
<p style="text-align: justify;">A hatékony védekezés alapja, hogy a fertőzést, a kórokozó növénybe való bejutását akadályozzuk meg. Ezt most tudjuk megtenni. A csapadékos időjárásban a kórokozó könnyen meg tudja fertőzni a gyümölcskezdeményt. Javasoljuk, hogy az esőzéseket követően kontakt vagy mélyhatású gombaölő szerekkel védekezzünk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Blumeriellás levélfoltosság</strong><br />
Az elkövetkező időszakban a már betakarított meggy, cseresznye legfontosabb betegsége a blumeriellás levélfoltosság. Bár az elkövetkező hét időjárása nem kedvez a betegség terjedésének, de vegyük figyelembe, hogy az elmúlt hetekben esős párás volt az idő, emiatt a betegség jelen van és várható, hogy komolyabb tüneteket is fog okozni.</p>
<p style="text-align: justify;">Egyszeri kontakt gombaölőszeres kezeléssel hatékonyan tudunk védekezni a blumeriella ellen.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Cseresznyelégy</strong><br />
A meggy, cseresznye érése lassan befejeződik, a betakarítás vége felé járunk. Most már a cseresznyelégy ellen nem tudunk védekezi.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ŐSZIBARACK</h2>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levéltetvek</strong><br />
A hűvös, csapadékos időjárás lelassította a kolóniák kialakítását, ennek ellenére a szilva levéltetű-kolóniák nagy egyedszámban jelen vannak. Javasoljuk a védekezéseket folytatni, minél hamarabb elkezdeni, megakadályozva ezzel a későbbi erős fertőzés kialakulását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong><br />
A keleti gyümölcsmoly rajzása erősödik, a védekezéseket javasoljuk folytatni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Barackmoly</strong><br />
A barackmoly rajzása folyamatos.</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter size-full wp-image-478" src="https://www.demotrade.hu/wp-content/uploads/Barackmoly-csapdazasi-adatok-2023.-1.jpg" alt="Barackmoly csapdazasi adatok 2023. 1" width="532" height="84" title="Növényvédelmi előrejelzés – 2023.07.11. 16" srcset="https://www.demotrade.hu/wp-content/uploads/Barackmoly-csapdazasi-adatok-2023.-1.jpg 532w, https://www.demotrade.hu/wp-content/uploads/Barackmoly-csapdazasi-adatok-2023.-1-480x76.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 532px, 100vw" /></p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">KÖRTE</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A körte termésnövekedés állapotban található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtevarasodás</strong><br />
Az elkövetkező meleg, száraz időjárás nem kedvez a körtevarasodás terjedésének. Az eddig tünetmentes ültetvények, ha marad a száraz időjárás, nagy valószínűséggel már nem fognak befertőződni. Tünetmentes kertekben védekezésre most nincs szükség.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtelevélbolha</strong><br />
A körtelevélbolha várható, hogy egyre erősebben lesz jelen az ültetvényekben. A meleg időjárás felgyorsítja a fejlődésüket, a kolóniákon gyorsan ki tud alakulni a mézharmat, ami teljesen megvédi a kártevőt a növényvédő szerektől. A védekezésekkor minden egyes alkalommal szükséges tapadásfokozó szereket használni!</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért, bizalommal keressenek minket a <a href="/kapcsolat">Kapcsolat</a> menüpontban is megtalálható elérhetőségeink bármelyikén.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-tkvmgulf2', 'blog', 'Növényvédelmi előrejelzés – 2023.06.27.', 'Híreink', 'Mitruné Tóth Krisztina', '2023.06.27.', '/images/novenyvedelmi_elorejelzes-2.jpg', 'Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum léghőmérséklet 24-28 °C között lesz, csapadékra szinte minden nap számíthatunk. Az eső az előrejelzések szerint a hónap utolsó napjaiban viharos széllel fog társulni, a magas hőmérséklet miatt jégesőveszély is lehet. &#160; ALMA &#160; Az alma jelenleg 50-60 mm nagyságú gyümölcsméret állapotában van. Egyes fajtáknál a ...', '<p style="text-align: justify;"><strong>Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum léghőmérséklet 24-28 °C között lesz, csapadékra szinte minden nap számíthatunk. Az eső az előrejelzések szerint a hónap utolsó napjaiban viharos széllel fog társulni, a magas hőmérséklet miatt jégesőveszély is lehet.</strong></p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">Az alma jelenleg 50-60 mm nagyságú gyümölcsméret állapotában van. Egyes fajtáknál a hajtások növekedése részben befejeződött, a lombkorona felső részeiben lévő hajtások növekedése még folyamatban van.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek:</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás:</strong><br />
Az almafa varasodás fertőzése az idei évben nagyon erős. A kora tavaszi fertőzések sok helyen okoztak gyümölcstünetet. Június első dekádjában megszűnt az aszkospórák szóródása. A betegség terjedése változott, a fertőzésben már csak a konídiumok vesznek részt. Elméletileg a fertőzési intenzitás csökkenését várhatnánk, de a folyamatos csapadék, főleg a szatmári és felsőszabolcsi tájegységben állandó feltételt nyújt a betegség terjedéséhez. Összegezve elmondhatjuk, hogy a varasodás fertőzési nyomása nem csökkent az aszkospórák szóródásának a befejeztével. A meteorológiai előrejelzések az elkövetkező hétre is további csapadékot jósolnak, ami tovább növeli a fertőzési veszélyhelyzetet.</p>
<p style="text-align: justify;">Tekintettel arra, hogy a varasodás fertőzését elősegítő időjárás következik, azokban az ültetvényekben, ahol a betegség tünetei jelen vannak, ott továbbra is javasoljuk a felszívódó és kontakt készítmények tankkeverékben való kijuttatását. Ahol tünetmentes az állomány, ott már válthatunk kontakt készítményekre. A tünetmentes ültetvényekben a csapadékos időjárást követő kontakt (Delan Pro) készítmények alkalmazása elegendő a sikeres védekezésekhez.</p>
<p style="text-align: justify;">Az elmúlt két heti fertőzési veszélyhelyzeteket az alábbi táblázatban foglaltam össze:</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter wp-image-457 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.13.-06.25.jpg" alt="Almafa varasodas fertozesi idopontok 2023.06.13. 06.25" width="525" height="782" title="Növényvédelmi előrejelzés – 2023.06.27. 20" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.13.-06.25.jpg 525w, https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.13.-06.25-480x715.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 525px, 100vw" /><img loading="lazy" decoding="async" class="aligncenter wp-image-458 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.13.-06.25.-2.jpg" alt="Almafa varasodas fertozesi idopontok 2023.06.13. 06.25. 2" width="529" height="704" title="Növényvédelmi előrejelzés – 2023.06.27. 21" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.13.-06.25.-2.jpg 529w, https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.06.13.-06.25.-2-480x639.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 529px, 100vw" /></p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Lisztharmat:</strong><br />
A lisztharmat terjedése jelenleg jelentős. A párás, esős, majd napos időjárás optimális a betegség terjedéséhez. A lombkoronában a hajtások nagy része már befejezte a növekedésüket, megjelentek a csúcsokon a záró rügyek. A lisztharmat a friss hajtásokon lévő leveleket támadja meg. A hajtásnövekedés befejeztével a betegség terjedése is meg fog állni.</p>
<p style="text-align: justify;"><strong>Tűzelhalás:</strong><br />
A tűzelhalás egyes kertekben nagyon erősen jelen van. Sajnos a további terjedésükre lehet számítani. Az elmúlt hetek időjárása, illetve a várható időjárás optimális körülményeket teremt a baktérium fertőzéséhez.<br />
Nehéz kimondottan hatásos kezeléseket javasolni. A fertőzött hajtások eltávolítása lenne a legoptimálisabb, de ilyen esős időben ezzel öngólt is lőhetünk, a nyílt sebekkel még tovább növelhetjük a betegség terjedését. Véleményem szerint a tűzelhalás akkor fog megállni, ha az esőzések, párás időjárás csökkenni fognak és helyébe száraz, meleg, nyári időjárás lép.</p>
<p style="text-align: justify;">Védekezési javaslat tűzelhalás ellen:<br />
A hagyományos és korábban leghatékonyabbnak tartott védekezés, a fertőzött hajtások eltávolítása. Fontos, hogy ezzel a módszerrel akár nagyobb kárt is okozhatunk, akár terjeszthetjük is a baktériumot. A metszéssel történő védekezés esetében a metszőollót minden fa után fertőtleníteni kell. Erre használhatunk tömény, legalább 60%-os alkoholt vagy a kereskedelmi forgalomban kapható baktericid hatású kézfertőtlenítő szereket. A lemetszett hajtásvégeket össze kell gyűjteni és az almáskerten kívül el kell égetni. A metszések után minden esetben javasoljuk réztartalmú készítményekkel való kezelést.</p>
<p style="text-align: justify;">Használatosak még a réztartalmú szerek alkalmazása: A réztartalmú készítmények használatakor vegyük figyelembe, hogy ilyenkor perzselő hatása van. 25 °C alatt használjuk és ne permetezzünk vizes levélfelületre!</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Állati kártevők</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Atkák:</strong><br />
Az elkövetkező időszakban az atkák fogják átvenni a szívókártevők szerepét. Várhatóan a levéltetvek egyedszáma csökkenni fog. Helyükbe a most még csak szórványosan elhelyezkedő atkakolóniák fognak lépni. A magas hőmérséklet elősegíti a fejlődésüket és a gyors generáció váltásoknak köszönhetően hamar fel tudnak szaporodni. Az atkák ellentétben a levéltetvekkel az idősebb leveleken is képesek megtelepedni, illetve károsítani azokat.</p>
<p style="text-align: justify;">Javasoljuk a kertek szemlézését. Amint megjelenik az első kárkép, illetve előtte megelőző jelleggel érdemes a permetezéseket elkezdeni a későbbi felszaporodás elkerülése végett. Azokban az ültetvényekben, ahol az elmúlt évben jelen volt a kártevő, ott javasoljuk, hogy fordítsanak nagyobb figyelmet a szemlézésre.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Vértetű:</strong><br />
A szívó kártevők közül a vértetűnek is kedvez az időjárás. Várhatóan egyre nagyobb egyedszámban fognak megjelenni. A levél ízesüléseknél, a bőrredőkben, sebeken megjelenő vattaszerű képződmény, amit maga körül fejleszt, teljes védelmet nyújt rovarölő szerek ellen. A hagyományos felszívódó neonikotin származékok nem jelentenek tökéletes védelmet ellenük, ugyanis a fás részen, kérgen károsító egyedek ellen nem tud hatásos védelmet biztosítani.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Pajzstetű:</strong><br />
A Kaliforniai pajzstetű rajzás június első heteiben volt a csúcson, várhatóan a rajzás már befejező-dött és a populáció az érzéken L1 illetve L2-es lárvastádiumban van. Ezeket a lárvákat még nem vagy csak részben védik a pajzsok, érdemes kihasználni ezt az időszakot és védekezni elsősorban kontakt készítményekkel ellenük, később a pajzs kialakulás aután az már védeni fogja őket a rovar-ölő szerektől.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levéltetvek:</strong><br />
Az elmúlt heti csapadékos, hűvös időjárás kissé visszafogta a levéltetvek fejlődését, de még így is erőteljesnek mondható a terjeszkedésük. Az elkövetkező időszakban várhatóan a terjedésük csökkenni fog. A hajtások növekedése lassan befejeződik és az almafákon már a levéltetveknek kedvező friss hajtások is megszűnnek, ezzel már már nem tudnak új kolóniákat kialakítani. Azokban az ültetvényekben, ahol a hajtások már csúcsrügyben zárultak, már nem fognak problémát okozni.</p>
<p style="text-align: justify;">Javasoljuk, hogy a kertszemléknél fordítsunk figyelmet a hajtások állapotára. Amennyiben még találunk új leveleket, akkor a levéltetvek elleni védekezés folytatását javasoljuk. Elképzelhető, hogy ez lesz a levéltetvek elleni utolsó védekezés. Amennyiben már a teljes lombkoronán zárultak a hajtások és levéltetvekkel nem találkozunk, akkor már nincs szükség további kezelésekre.</p>
<p style="text-align: justify;">Javaslom, hogy felszívódó szerekkel védekezzünk. Ezen készítmények tökéletesen felszívódnak, eljutnak az új levelekbe és kb. 2 hétig nyújtanak védelmet.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almamoly:</strong><br />
A hőösszeg számítás alapján az első nemzedék még lárvaállapotban van, illetve bábozódnak. Számításaink szerint a 2. nemzedék imágói az elkövetkező hetekben fognak megjelenni.</p>
<p>&nbsp;</p>
<div id="attachment_461" style="width: 535px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-461" class="wp-image-461 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.-3.jpg" alt="Almamoly csapdazasi adatok 2023. 3" width="525" height="166" title="Növényvédelmi előrejelzés – 2023.06.27. 22" srcset="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.-3.jpg 525w, https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.-3-480x152.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 525px, 100vw" /><p id="caption-attachment-461" class="wp-caption-text"><center><strong>Almamoly csapdázási adatok 2023.</strong></center></p></div>
<p><img loading="lazy" decoding="async" class="aligncenter wp-image-460 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.-2.jpg" alt="Almamoly csapdazasi adatok 2023. 2" width="522" height="103" title="Növényvédelmi előrejelzés – 2023.06.27. 23" srcset="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.-2.jpg 522w, https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.-2-480x95.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 522px, 100vw" /></p>
<p>&nbsp;</p>
<div id="attachment_462" style="width: 529px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-462" class="wp-image-462 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese-4.jpg" alt="Almamoly hoosszeg alapjan torteno elorejelzese 4" width="519" height="624" title="Növényvédelmi előrejelzés – 2023.06.27. 24" srcset="https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese-4.jpg 519w, https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese-4-480x577.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 519px, 100vw" /><p id="caption-attachment-462" class="wp-caption-text"><center><strong>Almamoly hőösszeg alapján történő előrejelzése</strong></center></p></div>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly:</strong><br />
A keleti gyümölcsmoly rajzása kissé csökkent, de még mindig jelen vannak. Ellenük védekezni az almamoly elleni kezelésekkel a fent leírtak alapján lehet, azzal a kivétellel, hogy a granulovírus alapú készítmények a keleti gyümölcsmoly ellen hatástalanok.</p>
<p>&nbsp;</p>
<div id="attachment_463" style="width: 531px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-463" class="wp-image-463 size-full" src="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-4.jpg" alt="Keleti gyumolcsmoly csapdazasi adatok 2023. 4" width="521" height="95" title="Növényvédelmi előrejelzés – 2023.06.27. 25" srcset="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-4.jpg 521w, https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-4-480x88.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 521px, 100vw" /><p id="caption-attachment-463" class="wp-caption-text"><center><strong>Keleti gyümölcsmoly csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almailonca:</strong><br />
Az almailonca rajzása nagyon rövid volt. Gyakorlatilag 2 hét alatt lerajzott, már nem fognak a csapdák.</p>
<p>&nbsp;</p>
<div id="attachment_464" style="width: 532px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-464" class="wp-image-464 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.-2.jpg" alt="Almailonca csapdazasi adatok 2023. 2" width="522" height="80" title="Növényvédelmi előrejelzés – 2023.06.27. 26" srcset="https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.-2.jpg 522w, https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.-2-480x74.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 522px, 100vw" /><p id="caption-attachment-464" class="wp-caption-text"><center><strong>Almailonca csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Aknázómolyok:</strong><br />
Az almalevél aknázómoly második nemzedékének a rajzása fokozódik. A populáció most épül fel, a meleg időjárás elősegíti a felszaporodásukat. Javasoljuk, hogy a védekezést elsősorban felszívódó szerekkel végezzük el, megelőzve ezzel a nagyobb populáció kialakulását.</p>
<p>&nbsp;</p>
<div id="attachment_465" style="width: 535px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-465" class="wp-image-465 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-4.jpg" alt="Almalevel aknazomoly csapdazasi adatok 2023. 4" width="525" height="91" title="Növényvédelmi előrejelzés – 2023.06.27. 27" srcset="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-4.jpg 525w, https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-4-480x83.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 525px, 100vw" /><p id="caption-attachment-465" class="wp-caption-text"><center><strong>Almalevél aknázómoly csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy, cseresznye, szilva gyümölcsnövekedés állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Meggy antraknózis:</strong><br />
Az érés előtt az elmúlt héten csapadékos, párás időjárásunk volt, várható, hogy az antraknózis fetőzése erősödni fog. A védekezéskor minden esetben vegyük figyelembe a készítmények egészségügyi várakozási idejét.</p>
<p style="text-align: justify;">A hatékony védekezés alapja, hogy a fertőzést, a kórokozó a növénybe való bejutását akadályozzuk meg. Ezt most tudjuk megtenni. A csapadékos időjárásban a kórokozó könnyen meg tudja fertőzni a gyümölcskezdeményt. Javasoljuk, hogy az esőzéseket követően kontakt vagy mélyhatású gombaölő szerekkel védekezzünk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Blumeriellás levélfoltosság:</strong><br />
A meggy és a cseresznye betegsége. A csapadékos, párás időjárás kedvez a betegség kialakulásának. Várható, hogy a következő hetekben megjelenhetnek az első tünetek. Ekkor a leveleken apró lilás foltok jelennek meg, ami később beszárad, a levél sárgul, idővel le is hullanak a fertőzött levelek.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Sztigmínás levéllikacsododás:</strong><br />
A levéllikacsosodás betegség kialakulásához az időjárási tényezők optimálisak. Várható, hogy idővel kisebb barna foltok jelennek meg, majd beszáradnak és kilyukadnak. A védekezéseket most javasoljuk elvégezni. A betegségre legjobban a szilva fogékony.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Cseresznyelégy:</strong><br />
A korai cseresznyék érése elkezdődött, jellemzően ezeket a fajtákat a cseresznyelégy még nem károsítja. A későbbi érésű meggyben, cseresznyében fog a kártevő megjelenni. Javasoljuk hogy legkésőbb a zsendülés első szakaszában védekezzünk acetamiprid hatóanyagú készítményekkel.</p>
<p style="text-align: justify;">Az eredményes védekezés alapja, hogy a permetlevet a felső lombkorona szintjébe is juttassuk ki, ugyanis az imágó szereti a napfényes meleget, így a korona felső harmadában van jelen elsősorban. A feromon csapdákat is ide javasoljuk kirakni.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ŐSZIBARACK</h2>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levéltetvek:</strong><br />
A hűvös, csapadékos időjárás lelassította a kolóniák kialakítását, ennek ellenére a szilva levéltetű kolóniák nagy egyedszámban jelen vannak. Javasoljuk a védekezéseket folytatni vagy minél hamarabb elkezdeni, megakadályozva ezzel a későbbi erős fertőzés kialakulását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly:</strong><br />
A keleti gyümölcsmoly rajzása erősödik, a védekezéseket javasoljuk folytatni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Barackmoly:</strong><br />
A barackmoly rajzása folyamatos. Javasolt kontakt készítmények sodrómoly, lárvák, levéltetvek ellen.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">KÖRTE</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A körte termésnövekedés állapotban található</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtevarasodás:</strong><br />
A körte varasodás nem az a kimondottan veszélyes körte kórokozó, de a május végi csapadékos időjárásban számíthatunk rá, hogy fertőzés történhetett és később komoly problémát is okozhat. A körte varasodás elleni védekezés alapja, hogy a hajtásnövekedési időszakban nem engedjük meg a levéltünetek kialakulását. Később, júliusban, augusztusban a fertőzött levelekről indulnak ki a gyümölcstünetek. A védekezés most kell elvégezni, megakadályozva ezzel az ültetvényen belüli felszaporodását és a későbbi gyümölcsfertőzést</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtelevélbolha:</strong><br />
A körtelevélbolha várható, hogy egyre erősebben lesz jelen az ültetvényekben. A meleg időjárás felgyorsítja a fejlődésüket. A kolóniákon gyorsan ki tud alakulni a mézharmat, ami teljesen megvédi a kártevőt a növényvédő szerektől. A védekezésekkor minden egyes alkalommal szükséges tapadásfokozó szereket használni! Az elmúlt heti csapadékos idő lemosta a mézharmatot, érdemes ezt az időszakot kihasználni és védekezni a körtelevélbolha ellen.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért, bizalommal keressenek minket a<a href="/kapcsolat"> Kapcsolat</a> menüpontban is megtalálható elérhetőségeinken!</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-s41bsngro', 'blog', 'Növényvédelmi előrejelzés – 2023.06.14.', 'Híreink', 'Mitruné Tóth Krisztina', '2023.06.18.', '/images/novenyvedelmi_elorejelzes-3.jpg', 'Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum hőmérséklet 21-27 °C között lesz, pénteken szombaton (06.16-17.) lehűlés, eső, heves szél várható, majd vasárnapra a hőmérséklet visszaemelkedik, a csapadék akkor is várható. &#160; ALMA Az alma jelenleg 30-40 mm nagyságú gyümölcsméret (kisdió) állapotában van. Betegségek: Almafa varasodás: Az almafa varasodás tünetei sok helyen elég ...', '<p>Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum hőmérséklet 21-27 °C között lesz, pénteken szombaton (06.16-17.) lehűlés, eső, heves szél várható, majd vasárnapra a hőmérséklet visszaemelkedik, a csapadék akkor is várható.</p>
<p>&nbsp;</p>
<h3>ALMA</h3>
<p>Az alma jelenleg 30-40 mm nagyságú gyümölcsméret (kisdió) állapotában van.</p>
<h4>Betegségek:</h4>
<p><strong>Almafa varasodás:<br />
</strong>Az almafa varasodás tünetei sok helyen elég erősen látszanak, sajnos olyan kertekben is jelen vannak a tünetek, ahol időben és rendszeresen permeteztek, Május elején, közepén akadtak olyan időszakok, amikor az optimális időben nehezen lehetett védekezni, mert az időjárási tényezők nem engedték. Valószínűleg az akkor fertőzött állomány tünetei láthatóak most. Az elmúlt hét is veszélyes volt a varasodás tekintetében, gyakorlatilag egybefüggő csapadék és ennek következtében több napig nedves levelek elősegítették a betegség további terjedését.</p>
<p>2023.06.12-én végeztünk aszkospóra szóródási vizsgálatot egy nyíregyházi és két tuzséri mintából. A nyíregyházi mintában nagyon kevés aszkospórát még találtunk, ez egyik tuzséri mintában már nem volt, a másikban csak 3 db-ot találatunk. Gyakorlatilag azt mondhatjuk, hogy megszűnt az aszkospórák szóródása, a fertőzés már kizárólag konídiumos formában terjed tovább.</p>
<p>A védekezést azokban az ültetvényekben, ahol a betegség tünetei jelen vannak, ott javasoljuk a felszívódó és kontakt készítmények tankkeverékben való kijuttatását. Ahol tünetmentes az állomány, ott már válthatunk kontakt készítményekre.</p>
<p>&nbsp;</p>
<p><strong>Lisztharmat:</strong><br />
Bár a varasodás a legjelentősebb betegség, a lisztharmatot sem kell elfelejtenünk. Most az időjárás kevésbe kedvez a fejlődésének. Arra viszont számíthatunk, hogy az elkövetkező héten a napos meleg időjárás, a korábban lehullott csapadék, illetve a zöld lombfelület erőteljes párologtatása, a várható magas páratartalom miatt a lisztharmat erőteljesen visszatérhet.</p>
<p>A lisztharmat elleni védekezés kiemelkedő fontosságú fajtától függően még kb. 20-30 napig (hozzávetőlegesen eddig fog tartani a hajtásnövekedés). Az új hajtásokon lévő új levelek védelme a legfontosabb. A lisztharmat elleni védekezés tekintetében ez a legkritikusabb időpont. A fő feladat a betegség tovaterjedésének a megállítása. A legeredményesebben ezt úgy tudjuk elvégezni, ha speciális lisztharmatölő készítményekkel kezeljük. A kén tartalmú készítmények esetében minden esetben az alacsonyabb nyári dózist (4l/ha) alkalmazzuk, továbbá az is vegyük figyelembe, hogy a hőmérséklet emelkedésével nő a fitotoxikusságra való hajlam.</p>
<p>&nbsp;</p>
<p><strong>Tűzelhalás:</strong><br />
Nagyon erős tűzelhalás tünetekkel lehet találkozni. Az elmúlt heti esős és meleg időjárás tovább segítette a betegség terjedését. Számíthatunk arra, hogy a tűzelhalás ez elkövetkező időszakban tovább fog terjedni. A sok csapadék, az éjjeli hűvös idő reggelre harmatot okoz, plusz a magas pára mind elősegíti a baktérium terjedését. Amennyiben az időjárás szárazabbra változik, csak akkor fog csökkenni a fertőzés. A már fertőzött ágak gyógyítására nincs lehetőség, a betegség terjedési sebességét tudjuk csak csökkenteni.</p>
<p>Védekezési javaslat tűzelhalás ellen:<br />
A hagyományos és korábban leghatékonyabbnak tartott védekezés a fertőzött hajtások eltávolítása. Fontos, hogy ezzel a módszerrel akár nagyobb kárt is okozhatunk, akár terjeszthetjük is a baktériumot. A metszéssel történő védekezés esetében a metszőollót minden fa után fertőtleníteni kell. Erre használhatunk tömény, legalább 60%-os alkoholt vagy a kereskedelmi forgalomban használható baktericid hatású kézfertőtlenítő szereket. A lemetszett hajtásvégeket össze kell gyűjteni és az almáskerten kívül el kell égetni. A metszések után minden esetben javasoljuk a réz tartalmú készítményekkel való kezelést.</p>
<p>Használatosak még a réz tartalmú szerek alkalmazása: A réz tartalmú készítmények használatakor vegyük figyelembe, hogy ilyenkor perzselő hatása van. 25 °C alatt használjuk és ne permetezzünk vizes levélfelületre! Javasoljuk a Bordóilé Neo SC-t 3,0 l/ha dózisban, illetve a perzselés csökkentése érdekében hatásos még a csökkentett dózisú (1,5 &#8211; 2 kg,l/ha) réz tartalmú szerek alkalmazás, a termésnövelő anyagként engedélyezett Sergomil-L 60 folyékony réz tartalmú készítmény 2l/ha dózisú keveréke.</p>
<p>Az antibiotikumok használata nem engedélyezett, eseti engedéllyel sem! A szakirodalom és külföldi tapasztalatok alapján az oxitetraciklin, streptomicin, kasugamicin hatóaanyagok hatásosak a tűzelhalás ellen, amennyiben megfelelő ismétlésekkel kúraszerűen használjuk. A Kasumin 2L készítmény eseti engedélye csak zöldség kultúrákban érvényes. Elképzelhető, hogy a későbbiekben kiterjesztik almás termésűekre is.</p>
<p>&nbsp;</p>
<h4>Állati kártevők</h4>
<p><strong>Atkák:</strong><br />
Az atkák első nemzedéke még nem látszik. A hűvösebb idő és az elmúlt heti nagy esőzések nem engedték felszaporodni. Amennyiben az időjárás szárazabbra és melegebbre vált, számíthatunk a felszaporodásukra. Javasoljuk a kertek szemlézését. Amint megjelennek az első kárképek, érdemes a permetezéseket elkezdeni a későbbi felszaporodás elkerülése végett. Azokban az ültetvényekben, ahol az elmúlt évben jelen volt a kártevő, ott javasoljuk, hogy fordítsanak nagyobb figyelmet a szemlézésre.</p>
<p>&nbsp;</p>
<p><strong>Vértetű:</strong><br />
A most károsító szívókártevők esetében talán a vértetű a,z ami a legfontosabb. Egyre nagyobb egyedszámban jelenik meg a levél ízesüléseknél, a bőrredőkben, sebeken vattaszerű képződmény, amit maga körül fejleszt, teljes védelmet nyújt rovarölő szerek ellen. A hagyományos felszívódó neonikotin származékok nem jelentenek tökéletes védelmet ellenük, ugyanis a fás részen, kérgen károsító egyedek ellen nem tud hatásos védelmet biztosítani.</p>
<p>Védekezési javaslatunk:<br />
• Gyökérnyaki résznél elsősorban intenzív M9-es alanyú fajtáknál a sebfelületek (pocok, nyúl rágás…) és az oltási csomó fertőtlenítő sebkezelése. Erre kifejezetten alkalmas az agromésztej kipermetezése vagy beecsetelése, esetleg más a környezetre nem veszélyes anyagot is használhatunk, ami oldja a viaszgyapotot, illetve irritálja a bőrüket. Amennyiben meszes permetezést végzünk, ügyeljünk arra, hogy csak a gyökérnyak és a törzs részét érheti a permetszer, a lombkoronát, zöld részeket nem. Kiválóan alkalmas erre a célra a permetező pisztoly vagy a faköz gyomirtásra is alkalmas permetezők, permetező egységgel felszerelt fűkaszák, amelyet úgy állítunk be, hogy a törzset is érje a permetlé.</p>
<p>&nbsp;</p>
<p><strong>Pajzstetű:</strong><br />
A Kaliforniai pajzstetű most rajzik. Az imágók elleni védekezéseket most célszerű elvégezni, illetve a kikelő lárvák most még védtelenek a rovarölő szerekkel szemben. A fiatal lárvákon még nincs pajzs, csak az első, illetve a második vedlés után alakul ki a védelmet nyújtó pajzs.</p>
<p>&nbsp;</p>
<p><strong>Levéltetvek:</strong><br />
Az elmúlt heti csapadékos, hűvös időjárás kissé visszafogta a levéltetvek fejlődését, de még így is erőteljesnek mondható a terjeszkedésük. Az elkövetkező időszakban várható a felszaporodásuk. Fontos, hogy most az első kolóniák kialakulása előtt védekezünk megfelelő felszívódó készítményekkel. A levéltetvek fertőzése egészen addig fog problémát okozni, amíg a hajtásnövekedés be nem fejeződik, addig folyamatosan jelenek meg a levéltetvek számára optimális életteret nyújtó friss hajtásvégek. Javaslom, hogy nikotin származékokkal védekezzünk. Ezen készítmények tökéletes felszívódnak, eljutnak az új levelekbe és kb. 2 hétig nyújtanak védelmet.</p>
<p>&nbsp;</p>
<p><strong>Almamoly:</strong><br />
Az almamoly rajzása hektikus. Egyes településeken teljesen megszűnt, máshol folyamatos a rajzás. A jéghálós ültetvényekben kisebb mennyiségen vagy egyáltalán nem találkozhatunk velük. A 2. nemzedék imágói számításaink szerint még nem jelentek meg.</p>
<p>&nbsp;</p>
<p><strong>Keleti gyümölcsmoly:</strong><br />
A keleti gyümölcsmoly rajzása kissé csökkent, de még mindig jelen vannak. Ellenük az almamoly elleni kezelésekkel a fent leírtak alapján lehet, azzal a kivétellel, hogy a granulovírus alapú készítmények a keleti gyümölcsmoly ellen hatástalanok.</p>
<p>&nbsp;</p>
<p><strong>Almailonca:</strong><br />
Az almailonca rajzása nagyon rövid volt. Gyakorlatilag 2 hét alatt lerajzott, már nem fognak a csapdák.</p>
<p>&nbsp;</p>
<p><strong>Aknázómolyok:</strong><br />
Az almalevél aknázómoly második nemzedékének kisebb egyedszámmal elindult a rajzása. Az almamoly, illetve a levéltetvek elleni védekezéssel egy menetben tudunk ellenük védekezni, a granulovírus készítmények ezen károsító ellen sem hatásosak..</p>
<p>&nbsp;</p>
<h3>MEGGY, CSERESZNYE, SZILVA</h3>
<p>&nbsp;</p>
<p>A meggy, cseresznye, szilva gyümölcsnövekedés állapotban van.</p>
<p>&nbsp;</p>
<p><strong>Meggy antraknózis:</strong><br />
Az érés előtt az elmúlt héten csapadékos, párás időjárásunk volt, Várható, hogy az antraknózis fetőzése erősödni fog. A védekezéskor minden esetben vegyük figyelembe a készítmények egészségügyi várakozási idejét. A hatékony védekezés alapja, hogy a fertőzést, a kórokozó a növénybe való bejutását akadályozzuk meg, ezt most tudjuk megtenni. A csapadékos időjárásban a kórokozó könnyen meg tudja fertőzni a<br />
gyümölcskezdeményt. Javasoljuk, hogy az esőzéseket követően kontakt vagy a mélyhatású gombaölő szerekkel védekezzünk.</p>
<p>&nbsp;</p>
<p><strong>Blumeriellás levélfoltosság:</strong><br />
A meggy és a cseresznye betegségre. A tünetek első jeleivel, a leveleken megjelenő barnás-lilás foltokkal még nem találkoztam. Elsősorban kezeletlen ültetvényeken lehet számítani a felszaporodásukra, az antraknózis elleni védekezés hatásos a blumeriella ellen is.</p>
<p>&nbsp;</p>
<p><strong>Sztigmínás levélikacsododás:</strong><br />
A levélikacsosodás betegség kialakulásához az időjárási tényezők optimálisak. Várható, hogy idővel kisebb barna foltok jelennek meg, majd beszáradnak és kilyukadnak. A védekezéseket most javasoljuk elvégezni. A betegségre legjobban a szilva fogékony.</p>
<p>&nbsp;</p>
<p><strong>Cseresznyelégy:</strong><br />
A korai cseresznyék érése elkezdődött, jellemzően ezeket a fajtákat a cseresznyelégy még nem károsítja. A későbbi érésű meggyben, cseresznyében fog a kártevő megjelenni. Javasoljuk, hogy legkésőbb a zsendülés első szakaszában védekezzünk acetamiprid hatóanyagú készítményekkel. Az eredményes védekezés alapja, hogy a permetlevet a felső lombkorona szintjébe is juttassuk ki, ugyanis az imágó szereti a napfényes meleget, így a korona felső harmadában van jelen elsősorban. A feromon csapdákat is ide javasoljuk kirakni.</p>
<p>&nbsp;</p>
<h3>ŐSZIBARACK</h3>
<p>&nbsp;</p>
<p><strong>Levéltetvek:</strong><br />
A hűvös, csapadékos időjárás lelassította a kolóniák kialakítását, ennek ellenére a szilva levéltetű kolóniák nagy egyedszámban jelen vannak. Javasoljuk a védekezéseket folytatni, minél hamarabb elkezdeni, megakadályozva ezzel a későbbi erős fertőzés kialakulását.</p>
<p>&nbsp;</p>
<p><strong>Keleti gyümölcsmoly:</strong><br />
A keleti gyümölcsmoly rajzása erősödik, a védekezéseket javasoljuk folytatni.</p>
<p>&nbsp;</p>
<p><strong>Barackmoly:</strong><br />
A barackmoly rajzása folyamatos. Javasolt kontakt készítmények, sodrómoly, lárvák, levéltetvek ellen</p>
<p>&nbsp;</p>
<h3>KÖRTE</h3>
<p>&nbsp;</p>
<p>A körte termésnövekedés állapotban található.</p>
<p>&nbsp;</p>
<p><strong>Körtevarasodás:</strong><br />
A körtevarasodás nem az a kimondottan veszélyes körte kórokozó, de a május végi csapadékos időjárásban számíthatunk rá, hogy fertőzés történhetett és később komoly problémát is okozhat. A körtevarasodás elleni védekezés alapja, hogy a hajtásnövekedési időszakban nem engedjük meg a levéltünetek kialakulását. Később, július, augusztusban a fertőzött levelekről indulnak ki a gyümölcstünetek. A védekezést most kell elvégezni, megakadályozva ezzel az ültetvényen belüli felszaporodását és a későbbi gyümölcsfertőzést</p>
<p>&nbsp;</p>
<p><strong>Körtelevélbolha:</strong><br />
A körtelevélbolha várható, hogy egyre erősebben lesz jelen az ültetvényekben, a meleg időjárás felgyorsítja a fejlődésüket. A kolóniákon gyorsan ki tud alakulni a mézharmat, ami teljesen megvédi a kártevőt a növényvédő szerektől. A védekezésekkor minden egyes alkalommal szükséges tapadásfokozó szereket használni! Az elmúlt heti csapadékos idő lemosta a mézharmatot, érdemes ezt az időszakot kihasználni és<br />
védekezni a körtelevélbolha ellen.</p>
<p>További szakmai tanácsokért, bizalommal keressenek minket a <a href="/kapcsolat">Kapcsolat</a> menüpontban is megtalálható elérhetőségeink bármelyikén!</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-t6cl3hfe4', 'blog', 'Növényvédelmi előrejelzés – 2023.06.02.', 'Híreink', 'Mitruné Tóth Krisztina', '2023.06.02.', '/images/novenyvedelmi_elorejelzes4.jpg', 'Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum léghőmérséklet 24-30 °C között lesz, csapadékot csak június 6-7-re prognosztizálnak. &#160; ALMA Az alma jelenleg 30 mm nagyságú gyümölcsméret (kisdió) állapotában van. &#160; Betegségek &#160; Almafa varasodás 2023.05.31-én végeztünk aszkospóra szóródási vizsgálatot egy nyíregyházi, egy buji mintából és egy Zala megyei mintákból. Ezek alapján Bujon ...', '<p style="text-align: justify;"><strong>Az elkövetkező hétre a meteorológiai előrejelzések szerint a várható maximum léghőmérséklet 24-30 °C között lesz, csapadékot csak június 6-7-re prognosztizálnak.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p style="text-align: justify;">Az alma jelenleg 30 mm nagyságú gyümölcsméret (kisdió) állapotában van.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Betegségek</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás</strong></p>
<p style="text-align: justify;">2023.05.31-én végeztünk aszkospóra szóródási vizsgálatot egy nyíregyházi, egy buji mintából és egy Zala megyei mintákból. Ezek alapján Bujon már megszűnt a szóródás, míg Nyíregyházán és a zalai Németfaluban jelentős mennyiségű spórákat találtunk a mintákban. Ott a szóródás még tömegesnek mondható.</p>
<p style="text-align: justify;">Arra számíthattunk, hogy az aszkospórák szóródásának korai elindulása hatással lesz a befejezés időpontjára, korábban ki fognak ürülni a termőtestek. Az előző évek tapasztalatai alapján elmondható, hogy június első hetében már csökken a szóródás intenzitása, majd lassan megszűnik. Idén eddig három helyszínről vett mintában végeztük el az aszkospóra szóródás vizsgálatot. Egy mintában már megszűnt a szóródás, de a másik kettőben olyan nagy mennyiségben találtunk aszkospórákat, mint áprilisban. Tehát arra még számíthatunk, hogy egy darabig a varasodás ivaros és ivartalan úton (aszkospórával és konídiummal) is terjedni fog. A védekezés szempontjából ezen időszakban fokozott figyelmet fordítsunk a kezelésekre. Továbbra is javasoljuk a felszívódó és kontakt készítmények egy időben történő kijuttatását.</p>
<p style="text-align: justify;">Az elmúlt heti fertőzési veszélyhelyzeteket az alábbi táblázatban foglaltam össze:</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter wp-image-434 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.15-05.22.jpg" alt="Almafa varasodás fertőzési időpontok 2023.05.15 - 05.22." width="530" height="763" title="Növényvédelmi előrejelzés - 2023.06.02. 29" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.15-05.22.jpg 530w, https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.15-05.22-480x691.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 530px, 100vw" /></p>
<div id="attachment_435" style="width: 539px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-435" class="wp-image-435 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.15-05.22.-2.jpg" alt="Almafa varasodás fertőzési időpontok 2023.05.15 - 05.22. " width="529" height="159" title="Növényvédelmi előrejelzés - 2023.06.02. 30" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.15-05.22.-2.jpg 529w, https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.15-05.22.-2-480x144.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 529px, 100vw" /><p id="caption-attachment-435" class="wp-caption-text"><center><strong>Almafa varasodás fertőzési időpontok 2023.05.15 &#8211; 05.22.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Lisztharmat</strong></p>
<p style="text-align: justify;">Az alma intenzív növekedési szakaszba lépett.. Az új hajtásokon folyamatosan jelennek meg az új levelek. A magas hozam érdekében létfontosságú, hogy ezek a levelek épek és egészségesek legyenek. A lisztharmat fertőzése során a gombatelepek a levél felületén találhatóak, ahol a levéllemezt deformálják és kialakul a betegségre jellemző kanalas levéltünet. A deformált kisebb felületű levelek asszimilációs felülete is csökken, így kevesebb tápanyagot tud termelni a gyümölcs számára.</p>
<p style="text-align: justify;">A lisztharmat ezt a fejlettségi állapotot kedveli a legjobban, ilyenkor terjed az fertőzött levelekről az újakra. Fontos, hogy a betegség terjedését megakadályozzuk és időben védekezzünk ellene. A készítmények kiválasztásakor javasoljuk azokat a gombaölő szereket, melyek eredményesen használhatóak mind a két fontos betegség, a lisztharmat és a varasodás elleni is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Tűzelhalás</strong></p>
<p style="text-align: justify;">A tűzelhalás tünetei sok helyen megjelentek, sőt azt tudjuk mondani, hogy egy nagyon erős fertőzéssel állunk szembe. A virágzás nagyon elhúzódott. Bár a hűvös idő miatt nem számítottunk komolyabb fertőzésre, ennek ellenére nagy valószínűséggel az utolsó virágok befertőződtek. Több kertet is láttam, ahol a tűzelhalás tünetei erősen jelen vannak. A tünetek többsége nem kimondottan virágfertőzésre utal, nagyobb részben inkább hajtásfertőzések. Valószínűleg a május 15-20. közötti nagy esőzések teremtettek megfelelő körülményt a fertőzéshez. A betegség terjedéséhez szükséges nyílt sebfelületet az erős szél okozhatta a fákon, ami a csapadékkal és a hozzá kapcsolódó meleggel elindíthatta a fertőzést.</p>
<p style="text-align: justify;">Védekezési javaslat tűzelhalás ellen:</p>
<p style="text-align: justify;">A hagyományos és korábban leghatékonyabbnak tartott védekezés a fertőzött hajtások eltávolítása volt. Fontos, hogy ezzel a módszerrel akár nagyobb kárt is okozhatunk, akár terjeszthetjük is a baktériumot. A metszéssel történő védekezés esetében a metszőollót minden fa után fertőtleníteni kell. Erre használhatunk tömény, legalább 60%-os alkoholt vagy a kereskedelmi forgalomban használható baktericid hatású kézfertőtlenítő szereket. A lemetszett hajtásvégeket össze kell gyűjteni és az almáskerten kívül el kell égetni. A metszések után minden esetben javasoljuk a réz tartalmú készítményekkel való kezelést. Használatosak még a réz tartalmú szerek alkalmazása: A réz tartalmú készítmények használatakor vegyük figyelembe, hogy ilyenkor perzselő hatása van, 25 °C alatt használjuk és ne permetezzünk vizes levélfelületre! Az antibiotikumok használata nem engedélyezett, eseti engedéllyel sem! A kasugamicin hatóanyagú készítmény eseti engedélye csak zöldség kultúrákban érvényes. Elképzelhető, hogy a későbbiekben kiterjesztik almás termésűekre is.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Állati kártevők</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Zöld almalevéltetű</strong></p>
<p style="text-align: justify;">Az alma intenzív hajtásnövekedés időszakban van, a friss hajtásvégek optimális élőhelyet biztosítani a levéltetű kolóniáknak. Várható, hogy az elkövetkező hetekben a levéltetvek egyedszáma rohamosan növekedni fog. Javasoljuk, hogy a telepek kialakulásának megelőzéséhez használjunk felszívódó rovarölő szereket.</p>
<p style="text-align: justify;">Ökológiai ültetvényekben 1%-os gyümölcsfa olajjal, illetve narancshéj olajjal is védekezhetünk. Ezen készítmények csak akkor hatásosak, ha befedik a kártevőt, ezért fontos a pontos időzítés. A kezeléseket addig el kell végezni, amíg a levelek össze nem sodródnak. A deformált, összesodródott levelek fonákján a kártevő védve van, a permetlé nem jut el a megfelelő helyre, nem tudja a kártevőt befedni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Vértetű</strong></p>
<p style="text-align: justify;">A vértetű, nagyon nagy intenzitással terjed, a fertőzött ültetvényekben a telepek egyre gyorsabban és egyre erőteljesebben jelennek meg. Javasoljuk a felszívódó rovarölő szerek, elsősorban a pirimicarb használatát. A károsító ellen hatásosabban tudunk védekezni, ha nem engedjük a zöld részeken történő felszaporodásukat.</p>
<p style="text-align: justify;">Védekezési javaslatunk:<br />
• Gyökérnyaki résznél elsősorban intenzív M9-es alanyú fajtáknál a sebfelületek (pocok, nyúl rágás) és az oltási csomó fertőtlenítő sebkezelése. Erre kifejezetten alkalmas az agromésztej kipermetezése vagy beecsetelése. Esetleg más a környezetre nem veszélyes anyagot is használhatunk, ami oldja a viaszgyapotot, illetve irritálja a bőrüket. Amennyiben meszes permetezést végzünk, ügyeljünk arra, hogy csak a gyökérnyakat és a törzs részét érheti a permetszer, a lombkoronát, zöld részeket nem. Kiválóan alkalmas erre a célra a permetező pisztoly vagy a faköz gyomirtásra is alkalmas permetezők, permetező egységgel felszerelt fűkaszák, amelyet úgy állítunk be, hogy a törzset is érje a permetlé.<br />
• Lombkoronában: 1%-os gyümölcsfaolaj vagy narancshéj olaj használata 4l/ha dózisban. Bio ültetvényekben is használható. Az olajos készítmények ebben a dózisban nem károsítanak, nem perzselnek, ennek ellenére itt is javasolt az esti hűvös órákban való permetezés. Vagy pirimicarb hatóanyagú készítmények alkalmazása 0,5 kg/ha dózisban.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almamoly</strong></p>
<p style="text-align: justify;">Az almamoly rajzása folyamatos, bár korábban tapasztaltunk rajzás völgyeket, de később nagy egyedszámmal fogtunk molyokat. A meleg időjárásnak köszönhetően a rovar fejlődése is felgyorsult. A populáció már többnyire lárva alakban található. Valószínűleg a kedvező áttelelés miatt az első nemzedék imágóinak a rajzása az idén nagyobb, mint a korábbi években.</p>
<p>&nbsp;</p>
<div id="attachment_436" style="width: 540px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-436" class="wp-image-436 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.jpg" alt="Almamoly csapdázási adatok 2023." width="530" height="263" title="Növényvédelmi előrejelzés - 2023.06.02. 31" srcset="https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023.jpg 530w, https://www.demotrade.hu/wp-content/uploads/Almamoly-csapdazasi-adatok-2023-480x238.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 530px, 100vw" /><p id="caption-attachment-436" class="wp-caption-text"><center><strong>Almamoly csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<div id="attachment_437" style="width: 527px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-437" class="wp-image-437 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese-2.jpg" alt="Almamoly hőösszeg alapján történő előrejelzése " width="517" height="287" title="Növényvédelmi előrejelzés - 2023.06.02. 32" srcset="https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese-2.jpg 517w, https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese-2-480x266.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 517px, 100vw" /><p id="caption-attachment-437" class="wp-caption-text"><center><strong>Almamoly hőösszeg alapján történő előrejelzése</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong></p>
<p style="text-align: justify;">A keleti gyümölcsmoly rajzása fokozódik.</p>
<p>&nbsp;</p>
<div id="attachment_438" style="width: 531px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-438" class="wp-image-438 size-full" src="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-3.jpg" alt="Keleti gyümölcsmoly csapdázási adatok 2023." width="521" height="57" title="Növényvédelmi előrejelzés - 2023.06.02. 33" srcset="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-3.jpg 521w, https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-3-480x53.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 521px, 100vw" /><p id="caption-attachment-438" class="wp-caption-text"><center><strong>Keleti gyümölcsmoly csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almailonca</strong></p>
<p style="text-align: justify;">Az almailonca rajzása elindult.</p>
<p>&nbsp;</p>
<div id="attachment_439" style="width: 537px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-439" class="wp-image-439 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.jpg" alt="Almailonca csapdázási adatok 2023." width="527" height="60" title="Növényvédelmi előrejelzés - 2023.06.02. 34" srcset="https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023.jpg 527w, https://www.demotrade.hu/wp-content/uploads/Almailonca-csapdazasi-adatok-2023-480x55.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 527px, 100vw" /><p id="caption-attachment-439" class="wp-caption-text"><center><strong>Almailonca csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Aknázómolyok</strong></p>
<p style="text-align: justify;">Az almalevél aknázómoly első nemzedékének a rajzása teljesen leállt.</p>
<p>&nbsp;</p>
<div id="attachment_440" style="width: 534px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-440" class="wp-image-440 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-3.jpg" alt="Almalevél aknázómoly csapdázási adatok 2023." width="524" height="59" title="Növényvédelmi előrejelzés - 2023.06.02. 35" srcset="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-3.jpg 524w, https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-3-480x54.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 524px, 100vw" /><p id="caption-attachment-440" class="wp-caption-text"><center><strong>Almalevél aknázómoly csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Pajzstetvek</strong></p>
<p style="text-align: justify;">Felhívjuk a gazdálkodók figyelmét, hogy a pajzstetvek elleni egyik leghatékonyabb védekezési időszak június első fele. A pajzstetvek (kaliforniai pajzstetű, teknős pajzstetű) rajzása most kezdődik. Ilyenkor a pajzs alól kibúvó röpképes hím egyedek keresik meg a nőstényeket, majd megtermékenyítést követően a tojásokból kikelnek a lárvák. A hímek ellen védekezni szinte reménytelen, a védekezéseket a fiatal lárvák ellen célszerű irányítani. A lárvák első alakja még nem hordoz pajzsot magán, mozgásra képes, megkeresi azt a helyet, ahol később táplálkozni fog és az első vedlés után elkezdi kialakítani a védelmet nyújtó pajzsát. Ez az az időpont, amikor rovarölő szerekkel meg lehet őket fogni. Apró állatról van szó, amely ekkor még csak minimálisan táplálkozik. Védekezni elsősorban kontakt szerekkel, illetve olajos szerekkel lehet. A felszívódó készítményekből nem tud annyi mennyiséget felvenni, ami hatásos lenne.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy, cseresznye, szilva gyümölcsnövekedés állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Meggy antraknózis</strong></p>
<p style="text-align: justify;">A hosszú csapadékos időjárásnak köszönhetően várható, hogy az antraknózis fertőzése erősödni fog. Fontos figyelemben tartani, hogy a tünetek nem mos,t hanem az érés folyamán fognak megjelenni, viszont a védekezést most kell elkezdenünk. A hatékony védekezés alapja, hogy a fertőzést, a kórokozó növénybe való bejutását akadályozzuk meg. Ezt most tudjuk megtenni. A csapadékos időjárásban a kórokozó könnyen meg tudja fertőzni a gyümölcskezdeményt. Javasoljuk, hogy az esőzéseket követően kontakt vagy mélyhatású gombaölő szerekkel védekezzünk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Blumeriellás levélfoltosság</strong></p>
<p style="text-align: justify;">A meggy és a cseresznye betegsége. A tünetek első jeleivel, a leveleken megjelenő barnás-lilás foltokkal még nem találkoztam. Elsősorban kezeletlen ültetvényeken lehet számítani a felszaporodásukra. Az antraknózis elleni védekezés hatásos a blumeriella ellen is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Sztigmínás levéllikacsododás</strong></p>
<p style="text-align: justify;">A levéllikacsosodás betegség kialakulásához az időjárási tényezők optimálisak. Várható, hogy idővel kisebb barna foltok jelennek meg, majd beszáradnak és kilyukadnak. A védekezéseket most javasoljuk elvégezni. A betegségre legjobban a szilva fogékony.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Cseresznyelégy</strong></p>
<p style="text-align: justify;">A korai cseresznyék érése elkezdődött. Jellemzően ezeket a fajtákat a cseresznyelégy még nem károsítja. A későbbi érésű meggyben, cseresznyében fog a kártevő megjelenni. Javasoljuk hogy legkésőbb a zsendülés első szakaszában védekezzünk acetamiprid hatóanyagú készítményekkel . Az eredményes védekezés alapja, hogy a permetlevet a felső lombkorona szintjébe is juttassuk ki, ugyanis az imágó szereti a napfényes meleget, így a korona felső harmadában van jelen elsősorban. A feromon csapdákat is ide javasoljuk kirakni.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ŐSZIBARACK</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levéltetvek</strong></p>
<p style="text-align: justify;">Az első levéltetű kolóniák még csak most kezdődnek kialakulni, a hűvös időjárás lelassította ezt a folyamatot. Most már meleg van, a szilvahajtások folyamatosan növekednek egyre több élőhelyet és élelmet biztosítva a levéltetveknek. Javasoljuk a védekezéseket minél hamarabb elkezdeni megakadályozva ezzel a későbbi erős fertőzés kialakulását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong></p>
<p style="text-align: justify;">A keleti gyümölcsmoly rajzása erősödik, a védekezéseket javasoljuk folytatni.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">KÖRTE</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A körte termésnövekedés állapotban található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtevarasodás</strong></p>
<p style="text-align: justify;">A körte varasodás nem az a kimondottan veszélyes körte kórokozó, de a május végi csapadékos időjárásban számíthatunk rá, hogy fertőzés történhetett és később komoly problémát is okozhat. A körte varasodás elleni védekezés alapja, hogy a hajtásnövekedési időszakban nem engedjük meg a levéltünetek kialakulását. Később júliusban, augusztusban a fertőzött levelekről indulnak ki a gyümölcstünetek. A védekezést most kell elvégezni megakadályozva ezzel az ültetvényen belüli felszaporodását és a későbbi gyümölcsfertőzést.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtelevélbolha</strong></p>
<p style="text-align: justify;">A körtelevélbolha várható, hogy egyre erősebben lesz jelen az ültetvényekben. A meleg időjárás felgyorsítja a fejlődésüket, a kolóniákon gyorsan ki tud alakulni a mézharmat, ami teljesen megvédi a kártevőt a növényvédő szerektől. A védekezésekkor minden egyes alkalommal szükséges tapadásfokozó szereket használni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért bizalommal keressenek minket a <a href="/kapcsolat">Kapcsolat</a> menüpontban található bármelyik elérhetőségünkön.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-yihzzuroi', 'blog', 'Növényvédelmi előrejelzés – 2023.05.15.', 'Híreink', 'Mitruné Tóth Krisztina', '2023.05.15.', '/images/novenyvedelmi_elorejelzes-5.jpg', 'Az elkövetkező hétre a meteorológiai előrejelzések hűvösebb, csapadékos időjárást jósolnak. Péntek kivételével minden nap eshet az eső. A várható maximum léghőmérséklet 18-24 °C között várható. Május 17-18-án erős szél is lehetséges. Elképzelhető, hogy kevés alkalom lesz a permetezések végrehajtásához vagy ha mégis, akkor kevésbé lesznek ideálisak a körülmények. Ezen a héten a varasodás és az ...', '<p style="text-align: justify;"><strong>Az elkövetkező hétre a meteorológiai előrejelzések hűvösebb, csapadékos időjárást jósolnak. Péntek kivételével minden nap eshet az eső. A várható maximum léghőmérséklet 18-24 °C között várható. Május 17-18-án erős szél is lehetséges. Elképzelhető, hogy kevés alkalom lesz a permetezések végrehajtásához vagy ha mégis, akkor kevésbé lesznek ideálisak a körülmények. Ezen a héten a varasodás és az almamoly elleni védelem szempontjából fontos kezeléseket kell végrehajtani. Figyeljünk oda, hogy a lehetőségekhez képest optimális időpontokat találjuk meg, illetve vegyük figyelembe azt is, hogy a kevésbé kedvező alkalmak is hatásosabbak, mint a megkésett vagy elmaradt permetezés.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">Az alma jelenleg 10-15 mm nagyságú gyümölcsméret állapotában van.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Betegségek</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás</strong></p>
<p style="text-align: justify;">Almafa varasodás tünetekkel még nem találkoztunk. Elképzelhető, hogy a már fertőzött ültetvényekben, ahol a kezelések kevésbé voltak sikeresek, már jelen vannak az első fertőzések tünetei. Javasoljuk, hogy a kerteket tüzetesen szemlézzük, a régebbi leveleken, gyümölcsszáron, csészeleveleken, illetve a gyümölcskezdeményeken keressük az első tüneteket. Ilyenkor még csak apró világos, majd később sötétebb zöld foltokat, esetleg a gyümölcskezdeményen tűszúrás méretű sötét foltokat kell keresnünk. Amennyiben a betegség jelen van, javasoljuk hogy kuratív készítménnyel (di-fenokonazol, dodin hatóanyag) védekezzünk.</p>
<p style="text-align: justify;">Az elkövetkező héten, amennyiben lehet hinni a meteorológiai előrejelzéseknek, sok csapadékra kell számítanunk, ez pedig növeli a varasodás fertőzési nyomását. A varasodás terjedése még kb. 2-3 hétig aszkospórákon keresztül történik (a szóródás végének a pontos időpontját később tudjuk megállapítani). Addig fontos, hogy felszívódó és kontakt készítményekkel egy menetben permetezzünk. A védekezéshez azol típusú hatóanyagot javaslunk. A permetezési fordulók kialakításakor vegyük figyelembe hogy a gyümölcsfáink gyorsan fejlődnek, ezzel együtt növekszik a felületük és a zöld tömegük is, a növényvédőszerek a növényi nedvben hamar felhígulnak.</p>
<p style="text-align: justify;">Az elmúlt heti fertőzési veszélyhelyzeteket az alábbi táblázatban foglaltuk össze:</p>
<p><img loading="lazy" decoding="async" class="aligncenter wp-image-414 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.06.-05.15.jpg" alt="Almafa varasodás fertőzési időpontok 2023.05.06 - 05.15." width="537" height="789" title="Növényvédelmi előrejelzés - 2023.05.15. 2" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.06.-05.15.jpg 537w, https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.06.-05.15-480x705.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 537px, 100vw" /></p>
<div id="attachment_416" style="width: 538px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-416" class="wp-image-416 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.06.-05.15.-2.jpg" alt="Almafa varasodás fertőzési időpontok 2023.05.06.-05.15. " width="528" height="165" title="Növényvédelmi előrejelzés - 2023.05.15. 3" srcset="https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.06.-05.15.-2.jpg 528w, https://www.demotrade.hu/wp-content/uploads/Almafa-varasodas-fertozesi-idopontok-2023.05.06.-05.15.-2-480x150.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 528px, 100vw" /><p id="caption-attachment-416" class="wp-caption-text"><center><strong>Almafa varasodás fertőzési időpontok 2023.05.06 &#8211; 05.15.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Lisztharmat</strong></p>
<p style="text-align: justify;">Az alma intenzív növekedési szakaszba lépett. Az új hajtásokon folyamatosan jelennek meg az új levelek. A magas hozam érdekében létfontosságú, hogy ezek a levelek épek és egészségesek legyenek. A lisztharmat fertőzése során a gombatelepek a levél felületén találhatóak, ahol a levéllemezt deformálják és kialakul a betegségre jellemző kanalas levéltünet. A deformált kisebb felületű levelek asszimilációs felülete is csökken, így kevesebb tápanyagot tud termelni a gyümölcs számára.</p>
<p style="text-align: justify;">A lisztharmat ezt a fejlettségi állapotot kedveli a legjobban, ilyenkor terjed a fertőzött levelekről az újakra. Fontos, hogy a betegség terjedését megakadályozzuk és időben védekezzünk ellene. A készítmények kiválasztásakor javasoljuk azokat a gombaölő szereket, melyek eredményesen használhatóak mind a két fontos betegség, a lisztharmat és a varasodás elleni is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Tűzelhalás</strong></p>
<p style="text-align: justify;">Az almában tűzelhalás tüneteivel nem találkoztunk annak ellenére, hogy a virágzás nagyon elhúzódott. Valószínűleg a virágzáskori alacsony hőmérséklet akadályozta a betegség terjedését.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Állati kártevők</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Zöld almalevéltetű</strong></p>
<p style="text-align: justify;">Az alma intenzív hajtásnövekedés időszakban van, a friss hajtásvégek optimális élőhelyet biztosítanak a levéltetű kolóniáknak. Várható, hogy az elkövetkező hetekben a levéltetvek egyedszáma rohamosan növekedni fog. Javasoljuk, hogy a telepek kialakulásának a megelőzéséhez használjunk felszívódó rovarölő szereket.</p>
<p style="text-align: justify;">Ökológiai ültetvényekben 1%-os gyümölcsfaolajjal, illetve narancshéjolajjal is védekezhetünk. Ezen készítmények csak akkor hatásosak, ha befedik a kártevőt, ezért fontos a pontos időzítés. A kezeléseket addig el kell végezni, amíg a levelek össze nem sodródnak, a deformált, összesodródott levelek fonákján a kártevő védve van, a permetlé nem jut el a megfelelő helyre, nem tudja a kártevőt befedni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Vértetű</strong></p>
<p style="text-align: justify;">Az idei évben a vértetű komoly kártevő lehet. Tavaly is sok gondot okozott, illetve az áttelelése is sikeresen megtörtént a lombkorona szinten is, így az első telepek a megszokottól korábban jelentek meg, melyet a lombszinten áttelelő példányok hoztak létre. Várható, hogy az elkövetkező hetekben a gyökéren áttelelt egyedek is feljutnak a lomborona szintre, fokozva ezzel a kártétel nagyságát.</p>
<p style="text-align: justify;">A kártevő a fertőzött ültetvényekben már most komoly problémát okoz, a védekezéseket nem szabad elhanyagolni. Most oda kell figyelni, különben minden egyes nemzedékük egyre nagyobb és nagyobb telepeket fognak kialakítani. Javasoljuk, hogy a hagyományos permetezés mellett a törzset, illetve a gyökérnyaki oltási csomót külön permetezzük. Erre alkalmas lehet a sorok gyomirtására használatos permetező adapter vagy kézi pisztolyos szórófej.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almamoly</strong></p>
<p style="text-align: justify;">Az almamoly az elmúlt héten hatalmas egyedszámmal folytatta a rajzását. Nagy valószínűséggel most lehet a rajzáscsúcs közelében. A rajzás kezdete május első napjaira tehető, ekkor már adott volt a párzáshoz szükséges alkonyati hőmérséklet is. A biofix időpontot, amitől a hőösszeg alapján történő előrejelzést számítani lehet, vizsgálati helyszínektől függően 2023. május 01. és 03. közt lehet meghatározni. A tojásrakások, illetve a lárvakelések időpontját ettől az időszaktól lehet számítani, amit már csak a hőmérséklet befolyásol. Az elmúlt hétre az előrejelzések szerint melegre számítottunk. A nappali maximum hőmérsékletet 23°C köré jósolták, valamint éjjel sem lesz alacsonyabb a hőmérséklet 12 °C-tól. A valóságban ettől sokkal hűvösebb volt, így a várható tojásrakási időpontokon is módosítanunk kell. Az alacsonyabb hőmérséklet miatt néhány nappal tolódott, amit az alábbi táblázatban foglaltam össze. A tojásrakáshoz szükséges hőösszeg Nyíregyházán, Apagyon és Csengerben már összejött, a többi településen számításaink szerint ez előrejelzés készítésének a napjától (2023.05.15.) még legalább 2 nap szükséges.</p>
<p style="text-align: justify;">Az almamoly első nemzedéke elleni védekezéskor vegyük figyelembe, hogy a klorantraniliprol hatóanyag a hatását akkor fejti ki, ha a tojásrakások kezdetén, illetve a tojásrakás csúcsáig juttatjuk ki. Számításaim szerint ezen készítmények kijuttatási időpontja az elkövetkező napokban (2023.05.17. környéke) optimális.</p>
<p style="text-align: justify;">Amennyiben az első kezelést granulovírus készítményekkel tervezzük, akkor a helyes felhasználásának az időpontja a lárvakelés kezdete. Ezen rovarölő szerek kijuttatása még korai, most még nem javasoljuk.</p>
<div id="attachment_418" style="width: 543px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-418" class="wp-image-418 size-full" src="https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok-4.jpg" alt="Almamoly csapdázási adatok" width="533" height="315" title="Növényvédelmi előrejelzés - 2023.05.15. 4" srcset="https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok-4.jpg 533w, https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok-4-480x284.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 533px, 100vw" /><p id="caption-attachment-418" class="wp-caption-text"><center><strong>Almamoly csapdázási adatok</strong></center></p></div>
<div id="attachment_419" style="width: 529px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-419" class="wp-image-419 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese.jpg" alt="Almamoly hőösszeg alapján történő előrejelzése" width="519" height="291" title="Növényvédelmi előrejelzés - 2023.05.15. 5" srcset="https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese.jpg 519w, https://www.demotrade.hu/wp-content/uploads/Almamoly-hoosszeg-alapjan-torteno-elorejelzese-480x269.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 519px, 100vw" /><p id="caption-attachment-419" class="wp-caption-text"><center><strong>Almamoly hőösszeg alapján történő előrejelzése</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Cserebogarak, bundásbogarak</strong></p>
<p style="text-align: justify;">A cserebogarak, bundásbogarak a virágzás végével eltűntek az ültetvényekből. Egy-két érési táplálkozást végző májusi cserebogarat még lehet látni, de ezek már komolyabb kártételt nem okoznak.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong></p>
<p style="text-align: justify;">A keleti gyümölcsmoly rajzása fokozódik. Az almamolyhoz hasonlóan már eléri a rajzási csúcsot. Ellenük védekezni az almamoly elleni kezelésekkel a fent leírtak alapján lehet, azzal a kivétellel, hogy a granulovírus alapú készítmények a keleti gyümölcsmoly ellen hatástalanok.</p>
<p>&nbsp;</p>
<div id="attachment_421" style="width: 534px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-421" class="wp-image-421 size-full" src="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-2.jpg" alt="Keleti gyümölcsmoly csapdázási adatok 2023." width="524" height="56" title="Növényvédelmi előrejelzés - 2023.05.15. 6" srcset="https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-2.jpg 524w, https://www.demotrade.hu/wp-content/uploads/Keleti-gyumolcsmoly-csapdazasi-adatok-2023.-2-480x51.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 524px, 100vw" /><p id="caption-attachment-421" class="wp-caption-text"><center><strong>Keleti gyümölcsmoly csapdázási adatok 2023.</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Aknázómolyok</strong></p>
<p style="text-align: justify;">Az almalevél aknázómoly első nemzedékének a rajzása rövidnek bizonyult, ugyanis a rajzás-diagrammon egy mély völgy mutatkozik.</p>
<p style="text-align: justify;">Az almamoly, illetve a levéltetvek elleni védekezéssel egymenetben tudunk ellenük védekezni, a granulovírus készítmények ezen károsító ellen sem hatásosak..</p>
<p>&nbsp;</p>
<div id="attachment_420" style="width: 529px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-420" class="wp-image-420 size-full" src="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-2.jpg" alt="Almalevél aknázómoly csapdázási adatok 2023." width="519" height="53" title="Növényvédelmi előrejelzés - 2023.05.15. 7" srcset="https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-2.jpg 519w, https://www.demotrade.hu/wp-content/uploads/Almalevel-aknazomoly-csapdazasi-adatok-2023.-2-480x49.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 519px, 100vw" /><p id="caption-attachment-420" class="wp-caption-text"><center><strong>Almalevél aknázómoly csapdázási adatok 2023.</strong></center></p></div>
<h3></h3>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy, cseresznye, szilva gyümölcsnövekedés állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Virágfertőző monília</strong></p>
<p style="text-align: justify;">A tapasztalatunk az, hogy a virágfertőző monília kártétele magas. Köszönhető annak, hogy a virágzás nagyon elhúzódott, illetve hogy sok volt a csapadék, ami a gomba elterjedését nagy mértékben segítette. A kialakult tünetek ellen már nem lehet védekezni, idővel a fertőzött hajtásvégek el fognak száradni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Meggy antraknózis</strong></p>
<p style="text-align: justify;">A meggy antraknózis elleni hatásos védelem az, amikor a kötődést követően folyamatosan kontakt gombaölő szerrel védekezünk és megakadályozzuk a gomba növénybe való bejutását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Sztigmínás levéllikacsododás</strong></p>
<p style="text-align: justify;">A levéllikacsosodás betegség kialakulásához az időjárási tényezők optimálisak. Várható, hogy idővel kisebb barna foltok jelennek meg, majd beszáradnak és kilyukadnak. A védekezéseket most javasoljuk elvégezni. A betegségre legjobban a szilva fogékony.</p>
<p>&nbsp;</p>
<h3></h3>
<h3 style="text-align: justify;">ŐSZIBARACK</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A tafrinás levélfodrosodás további fertőzése a meleg időjárásnak köszönhetően megszűnt. A kialakult tünetek ellen védekezni javasoljuk a Syllit alkalmazását, hogy a fertőzött levelekről a betegség a gyümölcskezdeményre ne tudjon átmenni. A fertőzött levelek felhólyagosodtak, illetve a hólyagosodások fokozódni fognak, majd maguktól le fognak hullani a levelek. A Syllit a beteg levelek lehullását kissé gyorsítja.<br />
A korábbi fertőzések tünetei most nagyon látszanak. Találhatunk olyan gyümölcsöst is, ahol gyakorlatilag 100%-os a kártétel, egy épp levél sincs a fákon. Ezek az ültetvények is túl fogják élni, de a termés méretében és mennyiségében kevesebb lesz, mint amit elvártunk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levéltetvek</strong></p>
<p style="text-align: justify;">Az első levéltetű kolóniák még csak most kezdenek kialakulni, a hűvös időjárás lelassította ezt a folyamatot. Most már meleg van, a szilvahajtások folyamatosan növekednek egyre több élőhelyet és élelmet biztosítva a levéltetveknek. Javasoljuk a védekezéseket minél hamarabb elkezdeni megakadályozva ezzel a későbbi erős fertőzés kialakulását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong></p>
<p style="text-align: justify;">A keleti gyümölcsmoly rajzása erősödik, várhatóan hamarosan megjelennek az első lárvák is. A védekezéseket javasoljuk most elkezdeni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Poloska szagú szilvadarázs</strong></p>
<p style="text-align: justify;">A poloska szagú szilvadarázs a tojásait a megkötött virágok termő részére rakja, később ezek kikelnek és a gyümölcskezdeményt károsítják, ami később le is hullik. A védekezéseket most javasoljuk elvégezni, egy menetben a levéltetvek elleni védekezéssel</p>
<p>&nbsp;</p>
<h3></h3>
<h3 style="text-align: justify;">KÖRTE</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A körte termésnövekedés állapotban található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtelevélbolha</strong></p>
<p style="text-align: justify;">A körtelevélbolha kolóniái lassan kialakulnak, a meleg időjárás kedvez a felszaporodásuknak. Virágzás alatt nehéz a kezeléseket elvégezni, a hatásos és eredményes készítmények nem használhatóak virágzáskor. Ezen a héten (2023.05.15.-21.) sok csapadékra számíthatunk. Használjuk ki ezt a lehetőséget és esőzések után védekezzünk. A nagyobb esők lemossák a körtelevélbolha által létrehozott mézharmatot, így a védtelenebb kártevőt könnyebben el tudjuk majd pusztítani.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért, bizalommal keressenek minket a <a href="/kapcsolat">Kapcsolat</a> menüpontban található elérhetőségeink bármelyikén.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-h7dptexwg', 'blog', 'Növényvédelmi előrejelzésünk a következő napokra', 'Híreink', 'Mitruné Tóth Krisztina', '2023.05.05.', '/images/novenyvedelmi_elorejelzes-6jpg.jpg', 'Az elkövetkező hétre a meteorológiai előrejelzések felmelegedést jósolnak, a várható maximum léghőmérséklet 20-26 °C között várható. Csapadékot az elkövetkező hét csaknem minden napjára jósolnak. &#160; Védekezés virágzó kultúrában &#160; A gyümölcsösök virágzás állapotban vannak. A kijuttatott készítmények során fordítsunk különös figyelmet a méhek védelmére. Ne felejtsük el, hogy a gyomok virágzása esetén az ültetvény is ...', '<p style="text-align: justify;"><strong>Az elkövetkező hétre a meteorológiai előrejelzések felmelegedést jósolnak, a várható maximum léghőmérséklet 20-26 °C között várható. Csapadékot az elkövetkező hét csaknem minden napjára jósolnak.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Védekezés virágzó kultúrában</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A gyümölcsösök virágzás állapotban vannak. A kijuttatott készítmények során fordítsunk különös figyelmet a méhek védelmére. Ne felejtsük el, hogy a gyomok virágzása esetén az ültetvény is ugyanúgy virágzó kultúrának számít, valamint azt, hogy a méhek nemcsak a virágok nektárjait keresik fel, hanem a levéltetvek mézharmatját is! Ezekben az esetekben ugyanolyan körültekintéssel kell eljárni a permetezések során, mintha a gyümölcsfák virágoznának.</p>
<p style="text-align: justify;">Permetezésekkor az alábbi feltételekre kell odafigyelnünk:<br />
• virágzó kultúrának számít, ha a kultúrnövény vagy a táblán levő gyomok és a tábla közvetlen szomszédságában levő növények virágoznak;<br />
• ellenőrizni kell az adott készítmény méhvédelmi besorolását (nemcsak a rovarölő szereknél, hanem a gombaölő és gyomirtó készítményeknél is).</p>
<p>Méhekre nem veszélyes, illetve nem jelzésköteles készítmények esetén:<br />
Bármely időpontban végezhető a permetezés.</p>
<p style="text-align: justify;">Méhekre mérsékelten veszélyes készítmények esetén:<br />
A permetezéseket a csillagászati naplemente előtt egy órával kell megkezdeni és legkésőbb este 11 óráig be kell fejezni. A kezelések az önkormányzat jegyzője felé bejelentéskötelesek.</p>
<p style="text-align: justify;">Méhekre kifejezetten veszélyes készítmények:<br />
A virágzó kultúrákban és egyéb olyan esetben, amikor a méhek látogatják az ültetvényt (a fent említett levéltetű mézharmat) nem használhatóak.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">Az alma virágzása szokatlanul elhúzódik, még mindig tart. Jelenleg az almavirágzás vége, terméskötődés állapotban van.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">
Betegségek</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás:</strong><br />
Az idei évben a varasodás első fertőzéshez kapcsolódó tünetek most jelennek meg az ültetvényekben. Amennyiben a védekezéseket pontosan és időben végeztük el, reménykedhetünk, hogy nem találkozunk tünetekkel. Javasoljuk, hogy a kerteket tüzetesen szemlézzük. A régebbi leveleken, gyümölcsszáron, csészeleveleken, illetve a gyümölcskezdeményeken keressük az első tüneteket. Ilyenkor még csak apró világos, majd később sötétebb zöld foltokat kell keresnünk, esetleg a gyümölcskezdeményen tűszúrás méretű sötét foltokat. Amennyiben a betegség jelen van, javasoljuk hogy kuratív készítménnyel védekezzünk.</p>
<p style="text-align: justify;">Az elmúlt heti fertőzési veszélyhelyzeteket az alábbi táblázatban foglaltam össze. A fertőzési nyomás nem volt jelentős.</p>
<p style="text-align: justify;">Az elkövetkező hétre a meteorológiai előrejelzések hosszan tartó, kiadós esőzéseket jósolnak. Amennyiben ez be is következik, akkor igen erős varasodás fertőzésre számíthatunk. A sok csapadék, valamint a magas léghőmérséklet nagy mértékben elő fogja segíteni a varasodás aszkospóráink a csírázását, illetve a gomba későbbi fejlődését.</p>
<p style="text-align: justify;">Növényvédelmi szempontból ebben a kiemelkedően fontos időszakban elengedhetetlen, hogy megakadályozzuk a betegség bőrfelületen való megjelenését. Ebben az időszakban csak olyan hatóanyagot javasolunk felhasználni, ami felszívódik és a gombafonalakat a növényen belül még a telepek kialakulása előtt el tudja pusztítani. A védekezéshez azol típusú hatóanyagot javaslunk. A hőmérséklet emelkedésével már nem kell attól tartanunk, hogy ezek a készítmények nem fejtik ki hatásukat. Továbbá javasoljuk a felszívódó és kontakt hatóanyagok kombinált kijuttatását. A permetezési fordulók kialakításakor vegyük figyelembe, hogy a gyümölcsfáink gyorsan fejlődnek, ezzel együtt növekszik a felületük és a zöld tömegük is, a növényvédőszerek a növényi nedvben hamar felhígulnak.</p>
<p style="text-align: justify;">
<p style="text-align: justify;"><img loading="lazy" decoding="async" class="aligncenter wp-image-401 size-full" src="https://www.demotrade.hu/wp-content/uploads/almafa-varasodas-2023-2.jpg" alt="almafa varasodas 2023 2" width="648" height="752" title="Növényvédelmi előrejelzésünk a következő napokra 9" srcset="https://www.demotrade.hu/wp-content/uploads/almafa-varasodas-2023-2.jpg 648w, https://www.demotrade.hu/wp-content/uploads/almafa-varasodas-2023-2-480x557.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 648px, 100vw" /></p>
<p style="text-align: justify;">
<p style="text-align: justify;"><strong>Lisztharmat:</strong><br />
A lisztharmat primer fertőzése jelen van az ültetvényekben, ezek ellen védekezni nehezen lehet, hiszen a fertőzött hajtásokból minden esetben fertőzött levelek fognak kifejlődni. A védekezés célja, hogy ezekből a fertőzött hajtásokból már ne fertőződjenek be az egészséges hajtásvégek. Javasoljuk, hogy olyan készítménnyel védekezzünk, ami hatásos a varasodás és a lisztharmat ellen is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Tűzelhalás:</strong><br />
Az almában eddig a tűzelhalás terjedéséhez szükséges klimatikus tényezők nem vagy csak kis mértékben voltak adottak. Szokatlan, hogy ilyen sokáig elhúzódik a virágzás egyes fajtáknál. A korona felső részeiben még mindig lehet találkozni most nyíló friss virággal. Tekintettel arra, hogy az elkövetkező hétre a csapadékos, meleg időjárást jósolnak, elképzelhető, hogy a kései virágok még befertőződhetnek.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Állati kártevők</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Bimbólikasztó bogár</strong><br />
A bimbólikasztó bogár kártétele az idei évben a szokásostól nagyobb mértékű. Valószínűleg az enyhe tél segítette az áttelelést, illetve az ellenük való kora tavaszi védekezések sem voltak eredményesek. Véleményünk szerint a károsító is hamarabb jelenhetett meg, mint ahogy azt a korábbi évek tapasztalatai alapján várhattuk. Az előrejelzéseinkben azt javasoltuk, hogy a kezdeti zöldbimbós állapotban el kell végezni a kontakt szerekkel történő kezeléseket. Április elején az alma már ebben a fejlődési szakaszban volt. Az időjárás március 30-a és április 3-a közt meleg volt, ami kedvezett a a kártevő telelésből való előjövetelének, illetve a tojásrakáshoz. Ezt követően jött egy másfél hetes, április 10-ig tartó lehűlés, 8-án, 9-én havazott is. Utólag visszatekintve azok a kezelések lehettek eredményesebbek, amelyeket még április 3. előtt elvégeztek.</p>
<p style="text-align: justify;">A kártétel most jól mutatkozik. Több termelővel beszélve azt tapasztaljuk, hogy az egész vármegyében komoly problémát okoz. A következő évben nagyobb hangsúlyt kell fektetni ezen károsító ellen.</p>
<p style="text-align: justify;">
<strong>Zöld almalevéltetű</strong><br />
A levéltetvek most alakítják ki az első telepeiket, várható, hogy az elkövetkező időben a kártételük is jelentkezni fog.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levélpirosító almalevéltetű</strong><br />
A kártételük már megjelent az ültetvényekben, a kis leveleken már kis mértétkű torzulásokat tapasztalhatunk. A későbbiekben a szívogatásnak megfelelően felhólyagosodott, kezdetben narancssárga, majd élénkvörös levéltorzulások fognak kialakulni. Az ellenük való védekezés kulcsa az időben történő kezelések. Mielőtt a levelek torzulnának, azelőtt kell elvégezni a permetezéseket. Később az összehajlott, felhólyagosodott levelek védelmében már nehezen tudunk ellenük hatékonyan védekezni.</p>
<p style="text-align: justify;">
<strong>Vértetű</strong><br />
A lombkorona szinten áttelelt vértetű kolónia elkezdte a károsítását. A gyökérzónában áttelelő egyedek a hőmérséklet melegedésével párhuzamosan fokozatosan jönnek elő és először az oltási csomópontokon, törzsön lévő hegekben elkezdik a károsításukat, később megjelennek a lombkorona felső szintjein is. Az ellenük való védekezés nehézkes, mert egy vattaszerű, védelmüket biztosító viaszburkot fejlesztenek ki.</p>
<p style="text-align: justify;">
<strong>Almamoly</strong><br />
Az almamoly rajzása, első megjelenése szinte naptárra pontosan követi az előző évi adatokat. A csapdákban való rendszeres megjelenés április utolsó napjaira tehető. Fontos, hogy az első párzási időpontokat határozzuk meg, hiszen ettől az időponttól lehet későbbiekben számolni a hőösszeget, amire alapozhatjuk a kezeléseket. Az almamoly alkonyatkor kezd el repülni, társat keresni, de a párosodáshoz legalább 16 °C szükséges. Az alábbi táblázatban összegeztem az általunk mért hőmérsékleti adatokat és a csapdafogásokat. Megállapíthatjuk, hogy bár a csapdákban egyes helyeken (pl. Csengerben) igen korán megjelentek az almamoly imágói, de a párosodáshoz szükséges minimum 16 °C -os alkonyati léghőmérséklet településenként eltérően 2023.05.01.-05.03-án adott volt. Ettől az időponttól az un. biofixtől lehet majd számítani a hőösszegeket és az erre alapuló előrejelzést és védekezést. Az első védekezési időpontunk a tojások, illetve a fiatal lárvák ellen kell, hogy irányuljon. Ennek a időpontját a meteorológiai előrejelzésekből lehet kiszámolni. Az elkövetkező héten a várható napi átlaghőmérséklet 17,8 °C lesz. Ezek alapján a tojásrakások kezdete az első párzási időpontot követő 7. napra esik, ami számításaink szerint 2023.05.08. és 05.10. közé tehető. A tojások elleni védekezést ekkor javasoljuk elvégezni. A klorantraniliprol hatóanyag első kezelését a tojásrakás kezdetéhez, illetve a tojásrakás csúcsához kell időzítenünk. A granuovírus készítmények helyes felhasználásának az időpontja a lárvakelés kezdete, figyeljünk a helyes használatra.</p>
<p>&nbsp;</p>
<div id="attachment_402" style="width: 663px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-402" class="wp-image-402 size-full" src="https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok-2.jpg" alt="almamoly csapdazasi adatok 2" width="653" height="346" title="Növényvédelmi előrejelzésünk a következő napokra 10" srcset="https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok-2.jpg 653w, https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok-2-480x254.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 653px, 100vw" /><p id="caption-attachment-402" class="wp-caption-text"><center><strong>Almamoly csapdázási adatok</strong></center></p></div>
<p style="text-align: justify;">
<div id="attachment_403" style="width: 525px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-403" class="wp-image-403 size-full" src="https://www.demotrade.hu/wp-content/uploads/almamoly-parzasahoz-szukseges-kornyezeti-tenyezok.jpg" alt="almamoly parzasahoz szukseges kornyezeti tenyezok" width="515" height="777" title="Növényvédelmi előrejelzésünk a következő napokra 11" srcset="https://www.demotrade.hu/wp-content/uploads/almamoly-parzasahoz-szukseges-kornyezeti-tenyezok.jpg 515w, https://www.demotrade.hu/wp-content/uploads/almamoly-parzasahoz-szukseges-kornyezeti-tenyezok-480x724.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 515px, 100vw" /><p id="caption-attachment-403" class="wp-caption-text"><center><strong>Almamoly párzásához szükséges környezeti tényezők</strong></center></p></div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Cserebogarak, bundásbogarak</strong><br />
A cserebogarak, bundásbogarak az ültetvényekben, a bundásbogarak magas egyedszámban. Az imágók kártétele a virágzat károsításában áll, viszont a fő problémát a talajban károsító cserebogárpajorok fogják okozni. Eegyszerűbb és hatékonyabb megelőző kezeléseként az imágók elpusztítása.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong><br />
Apagyon az almában kihelyezett csapdában már megjelent, jelenleg rajzik. Kártétele az almamolyéhoz hasonló. Védekezni egy menetben lehet az almamollyal együtt.</p>
<p style="text-align: justify;">
<div id="attachment_404" style="width: 530px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-404" class="wp-image-404 size-full" src="https://www.demotrade.hu/wp-content/uploads/keleti-gyumolcsmoly-csapdazasi-adatok-2023.jpg" alt="keleti gyumolcsmoly csapdazasi adatok 2023" width="520" height="53" title="Növényvédelmi előrejelzésünk a következő napokra 12" srcset="https://www.demotrade.hu/wp-content/uploads/keleti-gyumolcsmoly-csapdazasi-adatok-2023.jpg 520w, https://www.demotrade.hu/wp-content/uploads/keleti-gyumolcsmoly-csapdazasi-adatok-2023-480x49.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 520px, 100vw" /><p id="caption-attachment-404" class="wp-caption-text"><center><strong>Keleti gyümölcsmoly csapdázási adatok 2023</strong></center></p></div>
<p style="text-align: justify;">
<p style="text-align: justify;"><strong>Aknázómolyok</strong><br />
Mind az almamoly, mind az aknázómoly rajzása elindult. Egyenlőre a fogások még a veszélyességi küszöbérték alatt találhatóak, de már érdemes odafigyelni rájuk. Az almamoly, illetve a levéltetvek elleni védekezéssel egy menetben tudunk ellenük védekezni.</p>
<p style="text-align: justify;">
<div id="attachment_405" style="width: 528px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-405" class="wp-image-405 size-full" src="https://www.demotrade.hu/wp-content/uploads/almalevel-aknazomoly-csapdazasi-adatok-2023.jpg" alt="almalevel aknazomoly csapdazasi adatok 2023" width="518" height="52" title="Növényvédelmi előrejelzésünk a következő napokra 13" srcset="https://www.demotrade.hu/wp-content/uploads/almalevel-aknazomoly-csapdazasi-adatok-2023.jpg 518w, https://www.demotrade.hu/wp-content/uploads/almalevel-aknazomoly-csapdazasi-adatok-2023-480x48.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 518px, 100vw" /><p id="caption-attachment-405" class="wp-caption-text"><center><strong>Almalevél aknázómoly csapdázási adatok 2023</strong></center></p></div>
<p style="text-align: justify;">
<p>&nbsp;</p>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy virágzás vége állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Virágfertőző monília</strong><br />
A tapasztalatunk az, hogy a virágfertőző monília kártétele magas. Köszönhető annak, hogy a virágzás nagyon elhúzódott, illetve hogy sok volt a csapadék, ami a gomba elterjedését nagy mértékben segítette. A kialakult tünetek ellen már nem lehet védekezni, idővel a fertőzött hajtásvégek el fognak száradni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Meggy antraknózis</strong><br />
A meggy antraknózis elleni hatásos védelem az, amikor a kötődést követően folyamatosan kontakt gombaölőszerrel védekezünk és megakadályozzuk a gomba növénybe való bejutását.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ŐSZIBARACK</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A tafrinás levélfodrosodás további fertőzése a meleg időjárásnak köszönhetően megszűnt. A kialakult tünetek ellen védekezni javasoljuk a didin hatóanyag alkalmazását, hogy a fertőzött levelekről a betegség a gyümölcskezdeményre ne tudjon átmenni. A fertőzött levelek felhólyagosodtak, illetve a hólyagosodások fokozódni fognak, majd maguktól le fognak hullani a levelek.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">SZILVA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levéltetvek</strong><br />
Az első levéltetű kolóniák még csak most kezdenek kialakulni. A hűvös időjárás lelassította ezt a folyamatot, Most már meleg van, az szilvahajtások folyamatosan növekednek, egyre több élőhelyet és élelmet biztosítanak a levéltetveknek. Javasoljuk a védekezéseket minél hamarabb elkezdeni, megakadályozva ezzel a későbbi erős fertőzés kialakulását.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Keleti gyümölcsmoly</strong><br />
A keleti gyümölcsmoly rajzása erősödik. Várhatóan hamarosan megjelennek az első lárvák is. A védekezéseket javasoljuk most elkezdeni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Poloska szagú szilvadarázs</strong><br />
A poloska szagú szilvadarázs a tojásait a megkötött virágok termő részére rakja. Később ezek kikelnek és a gyümölcskezdeményt károsítják, ami később le is hullik. A védekezéseket most javasoljuk elvégezni egy menetben a levéltetvek elleni védekezéssel.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">Javasolt kontakt készítmények sodrómoly, lárvák, levéltetvek ellen.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">KÖRTE</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A körte virágzás állapotban található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Körtelevélbolha</strong><br />
A körtelevélbolha kolóniái lassan kialakulnak, a meleg időjárás kedvez a felszaporodásuknak. Virágzás alatt nehéz a kezeléseket elvégezni, mivel a hatásos és eredményes készítmények nem használhatóak virágzáskor.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért bizalommal keressenek minket a honlap <a href="/kapcsolat">Kapcsolat</a> menüpontján található elérhetőségeink bármelyikén.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-czahm9awl', 'blog', 'Teendőink a következő hetekben', 'Híreink', 'Mitruné Tóth Krisztina', '2023.05.02.', '/images/novenyvedelmi elojelzes8.png', 'Az tudjuk mondani, hogy nehéz most a növényvédelmi előrejelző dolga. A múlt heti levelünkben a meteorológiai előrejelzésekre hivatkozva azt írtuk, hogy se fagyra, se csapadékra nem számíthatunk, sőt az almafa varasodás, meggy monília fertőzési nyomása is alacsony lesz. A természet felülírt mindent, nem jöttek be a meteorológiai előrejelzések, voltak éjjeli fagyok, bőséges csapadék és nagy ...', '<p style="text-align: justify;"><strong>Az tudjuk mondani, hogy nehéz most a növényvédelmi előrejelző dolga. A múlt heti levelünkben a meteorológiai előrejelzésekre hivatkozva azt írtuk, hogy se fagyra, se csapadékra nem számíthatunk, sőt az almafa varasodás, meggy monília fertőzési nyomása is alacsony lesz. A természet felülírt mindent, nem jöttek be a meteorológiai előrejelzések, voltak éjjeli fagyok, bőséges csapadék és nagy valószínűséggel a betegségek fertőzése is fokozódott. </strong></p>
<p>&nbsp;</p>
<p style="text-align: justify;">Természetesen, továbbra is néznünk kell a meteorológiai adatokat, hiszen ez nagy mértékben befolyásolja növényvédelmi teendőinket. Az elkövetkező hétre a meteorológiai előrejelzések felmelegedést jósolnak, a várható maximum léghőmérséklet 19-23 °C között lesz, az éjszakai minimum hőmérséklet sem fog +5 °C alá süllyedni. Csapadék az elkövetkező hét csaknem minden napjára jósolnak.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Védekezés virágzó kultúrában</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A gyümölcsösök virágzás állapotban vannak, ezért a kijuttatott készítmények során fordítsunk különös figyelmet a méhek védelmére. Ne felejtsük el, hogy a gyomok virágzása esetén az ültetvény is ugyan úgy virágzó kultúrának számít, valamint azt, hogy a méhek nemcsak a virágok nektárjait keresik fel, hanem a levéltetvek mézharmatját is! Ezekben az esetekben ugyanolyan körültekintéssel kell eljárni a permetezések során, mintha a gyümölcsfák virágoznának.</p>
<p style="text-align: justify;">Permetezésekkor az alábbi feltételekre kell odafigyelnünk:</p>
<p style="text-align: justify;">• virágzó kultúrának számít, ha a kultúrnövény vagy a táblán levő gyomok és a tábla közvetlen szomszédságában levő növények virágoznak;<br />
• ellenőrizni kell az adott készítmény méhvédelmi besorolását (nemcsak a rovarölő szereknél, hanem a gombaölő és gyomirtó készítményeknél is).</p>
<p>Méhekre nem veszélyes, illetve nem jelzésköteles készítmények esetén:<br />
Bármely időpontban végezhető a permetezés.</p>
<p style="text-align: justify;">Méhekre mérsékelten veszélyes készítmények esetén:<br />
A permetezéseket a csillagászati naplemente előtt egy órával kell megkezdeni és legkésőbb este 11 óráig be kell fejezni. A kezelések az önkormányzat jegyzője felé bejelentés köteles.</p>
<p style="text-align: justify;">Méhekre kifejezetten veszélyes készítmények:<br />
A virágzó kultúrákban és egyéb olyan esetben, amikor a méhek látogatják az ültetvényt (a fent említett levéltetű mézharmat) nem használhatóak.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Termésszabályozás</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">Az almások virágzása bőségesnek mondható, a virágzat első középső tengelyről előjövő virága már megkötött, a többiek még virágzó stádiumban van. Bór tartalmú készítmények felhasználásának a 2. alkalma most aktuális.</p>
<p style="text-align: justify;">Az elmúlt hideg napok hatására nem hiszem, hogy konkrét elfagyás következett volna be, viszont arra számíthatunk, hogy a gyümölcskezdemények “megfáztak”, amik konkrét tüneteket még most nem mutatnak. A természetes gyümölcshullás időszakában elképzelhető, hogy ezek a gyümölcskezdemények lehullanak. A terméskötődés elősegítése érdekében ezért különösen fontos és javasoljuk is a magas bór tartalmú lombtrágyák, illetve a kondicionáló szerek használatát.</p>
<p style="text-align: justify;">Termésritkításra most még lehet használni az ATS-t azokban a fajtákban, ahol a virágzás még csak most kezdődött, illetve a virágzás kezdeti stádiumban van. Az ATS felhasználásának az optimális időpontja akkor következik be, amikor a középső tengelyen fejlődő virág (királyvirág) már megtermékenyült, azaz a bibe bebarnult és a virágzat többi virágja még megtermékenyülés előtti állapotban van, a bibe élénk halvány zöld színű. Ekkor elérhetjük, hogy az 5 virágot tartalmazó virágzatból csak 1 kössön meg és hozzon termést, ami legtöbbször elég is a megfelelő méretű és mennyiségű alma előállításához. A termésritkítás előtt minden esetben javasoljuk a virágzatok ellenőrzését és és egy pontos termésbecslést. Intenzív almában (3500-3600 tő/ha) fánként 75-100 db alma elég.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ALMA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">Az almavirágzás kezdete, fővirágzás állapotban van.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Betegségek</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás</strong></p>
<p style="text-align: justify;">Az elmúlt héten a várakozásokkal ellentétesen a csapadék mennyisége jelentős volt, így a varasodás fertőzése is erősebb volt, mint amire számítottunk. Nagy általánosságban azt tudjuk elmondani, hogy 2023.04.25-26 környéken vármegyeszerte mindenütt elég csapadék volt, a levelek folyamatosan nedvesek voltak a fertőzés kialakulásához. Figyelembe véve a várható hőmérsékletet és gomba fejlődési szakaszait, az első fertőzések okozta tünetekre május első napjaiban, az április 25-26-án megtörtént fertőzés első tüneteire május 10. után számíthatunk.</p>
<p style="text-align: justify;">A meteorológiai előrejelzések szerint az elkövetkező héten rendszeresen számíthatunk csapadékra. Amennyiben ez bekövetkezik, akkor a varasodás fertőzési nyomása is fokozódni fog. Növényvédelmi szempontból ez kiemelkedően fontos időszak, fontos, hogy megakadályozzuk a betegség bőrfelületen való megjelenését. Ebben az időszakban csak olyan hatóanyagot javasolunk felhasználni, ami felszívódik és a gombafonalakat a növényen belül még a telepek kialakulása előtt el tudja pusztítani. A védekezéshez azol típusú hatóanyagot javaslunk. A hőmérséklet emelkedésével már nem kell attól tartanunk, hogy ezek a készítmények nem fejtik ki hatásukat. Továbbá javasoljuk a felszívódó és kontakt hatóanyagok kombinált kijuttatását. A permetezési fordulók kialakításakor vegyük figyelembe, hogy a gyümölcsfáink gyorsan fejlődnek, ezzel együtt növekszik a felületük és a zöld tömegük is, a növényvédőszerek a növényi nedvben hamar felhígulnak.</p>
<div id="attachment_340" style="width: 536px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-340" class="wp-image-340 size-full" src="https://www.demotrade.hu/wp-content/uploads/almafa-varasodas-2023.jpg" alt="almafa varasodas 2023" width="526" height="785" title="Teendőink a következő hetekben 14" srcset="https://www.demotrade.hu/wp-content/uploads/almafa-varasodas-2023.jpg 526w, https://www.demotrade.hu/wp-content/uploads/almafa-varasodas-2023-480x716.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 526px, 100vw" /><p id="caption-attachment-340" class="wp-caption-text"><center><strong>Almafa varasodás fertőzés</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Lisztharmat</strong></p>
<p style="text-align: justify;">A lisztharmat primer fertőzése jelen van az ültetvényekben. Ezek ellen védekezni nehezen lehet, hiszen a fertőzött hajtásokból minden esetben fertőzött levelek fognak kifejlődni. A védekezés célja, hogy ezekből a fertőzött hajtásokból már ne fertőződjenek be az egészséges hajtásvégek. Javasoljuk, hogy olyan készítménnyel védekezzünk, ami hatásos a varasodás és a lisztharmat ellen is.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Tűzelhalás</strong></p>
<p style="text-align: justify;">Az alma jelenleg teljes virágzásban van, most a legérzékenyebb a tűzelhalás fertőzésnek a kialakulásához. A mai napig a környezeti tényezők nem voltak optimálisak a baktérium fertőzéséhez. A meteorológiai adatok szerint az elkövetkező héten csapadék várható, valamint a léghőmérséklet is emelkedni fog. Ilyen körülmények közt várható hogy a tűzelhalás megjelenik. Jelenleg a megelőzés a legfontosabb feladatunk. Javasoljuk, hogy azokon az ültetvényeken, ahol a korábbi években már jelen volt a betegség, esetleg jelentősebb gondot okozott, oda fokozott figyelemmel tekintsünk.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;">Állati kártevők</h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Bimbólikasztó bogár</strong></p>
<p style="text-align: justify;">A kártétel most most már jól látható, védekezni ellenük már nem tudunk.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Zöld almalevéltetű</strong></p>
<p style="text-align: justify;">A levéltetvek áttelelő egyedei (ősanyák) már előfordulhatnak a kinyílt rügyekben, a kis levélkezdemények védelmében a szívogatást már elkezdik. Hőmérséklettől függően az első telepeiket ki fogják alakítani. Hangyákat már lehet látni a hajtásvégeken, amik már a levéltetveket látogatják, illetve segítik a kolóniák kialakításában.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levélpirosító almalevéltetű</strong></p>
<p style="text-align: justify;">A kártételük már megjelent az ültetvényekben, a kis leveleken már kis mértékű torzulásokat tapasztalhatunk. A későbbiekben a szívogatásnak megfelelően felhólyagosodott, kezdetben narancssárga, majd élénkvörös levéltorzulások fognak kialakulni. Az ellenük való védekezés kulcsa az időben történő kezelések. Mielőtt a levelek torzulnának, azelőtt kell elvégezni a permetezéseket. Később az összehajlott, felhólyagosodott levelek védelmében már nehezen tudunk ellenük hatékonyan védekezni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Vértetű</strong></p>
<p style="text-align: justify;">A lombkorona szinten áttelelt vértetű kolónia elkezdte a károsítását. A gyökérzónában áttelelő egyedek a hőmérséklet melegedésével párhuzamosan fokozatosan jönnek elő és először az oltási csomópontokon, törzsön lévő hegekben elkezdik a károsításukat. Később megjelennek a lombkorona felső szintjein is. Az ellenük való védekezés nehézkes, mert egy vattaszerű, védelmüket biztosító viasz burkot fejlesztenek ki.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Pajzstetű</strong></p>
<p style="text-align: justify;">Erősen fertőzött ültetvényekben használhatunk még növényolajakat, de már csak nyári hígításban (1%-os töménységben). Virágzáskor már ne használjuk, eltömítheti a pollentömlőket.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almamoly</strong></p>
<p style="text-align: justify;">Az almamoly rajzása elindult, az első almamolyokat Csengeren fogtuk. 2022.04.20-án már 11 db volt a csapdákban. Később Tiszabezdéden, Tornyospálcán és Bujon is fogtak a csapdák. A konzekvens fogás, amitől a hőösszeg alapján történő előrejelzést el tudjuk kezdeni, még nem alakult ki.</p>
<p>&nbsp;</p>
<div id="attachment_339" style="width: 659px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-339" class="wp-image-339 size-full" src="https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok.jpg" alt="almamoly csapdazasi adatok" width="649" height="209" title="Teendőink a következő hetekben 15" srcset="https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok.jpg 649w, https://www.demotrade.hu/wp-content/uploads/almamoly-csapdazasi-adatok-480x155.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 649px, 100vw" /><p id="caption-attachment-339" class="wp-caption-text"><center><strong>Almamoly csapdázási adatok</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Cserebogarak, bundásbogarak</strong></p>
<p style="text-align: justify;">Az elmúlt héten megjelentek a cserebogarak, illetve a bundásbogarak az ültetvényekben. Az imágók kártétele a virágzat károsításában áll, viszont a fő problémát a talajban károsító pajorok fogják okozni. Egyszerűbb és hatékonyabb megelőző kezelésként az imágók elpusztítása.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy virágzás vége állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Virágfertőző monília</strong></p>
<p style="text-align: justify;">Az elmúlt időszak a meggy, cseresznye esetében kritikus volt a virágfertőző monília terjedéséhez. A fertőzéséhez szükséges klimatikus tényezők optimálisak voltak. Akkor mondhatjuk, hogy sikeresen védekeztünk ellene, ha már időben, a fehérbimbós állapotban meg tudtuk akadályozni a gomba bejutását a virágokba. Ha ezt elmulasztottuk vagy a kezelések nem voltak hatásosak, akkor a tünetek megjelenésére az elkövetkező napokban számíthatunk.</p>
<p style="text-align: justify;">A virágfertőző monília esetében a már kialakult fertőzések nem orvosolhatóak. A még virágzó fajtáknál érdemes még egy záró permetezést beiktatni.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">ŐSZIBARACK</h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A tafrinás levélfodrosodás fertőzése a meleg időjárásnak köszönhetően megszűnt, már nem tudunk a kialakult tünetek ellen védekezni. A fertőzött levelek felhólyagosodtak, illetve a hólyagosodások fokozódni fognak, majd maguktól le fognak hullani a levelek.</p>
<p>&nbsp;</p>
<p>További szakmai tanácsokért, bizalommal keressenek minket a <a href="/kapcsolat">Kapcsolat</a> menüpontban vagy a honlap lábrészében is megtalálható elérhetőségeink bármelyikén.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-1pam11t09', 'blog', 'Ezekre figyeljünk a következő napokban', 'Díjak és kitüntetések', 'Mitruné Tóth Krisztina', '2023.04.23.', '/images/ezekre_pirosbimbos-980x551.jpg', 'Az elkövetkező hétre a meteorológiai előrejelzések további felmelegedést jósolnak. A várható maximum léghőmérséklet 16-20 °C között lesz, az éjszakai minimum hőmérséklet sem fog +6 °C alá süllyedni (2023.04.27.), fagyveszéllyel nem számolunk. Csapadékra 04.24-én, hétfőn számíthatunk. &#160; Védekezés virágzó kultúrában &#160; A gyümölcsösök virágzás állapotban vannak. A kijuttatott készítmények során fordítsunk különös figyelmet a méhek védelmére. ...', '<p style="text-align: justify;"><strong>Az elkövetkező hétre a meteorológiai előrejelzések további felmelegedést jósolnak. A várható maximum léghőmérséklet 16-20 °C között lesz, az éjszakai minimum hőmérséklet sem fog +6 °C alá süllyedni (2023.04.27.), fagyveszéllyel nem számolunk. Csapadékra 04.24-én, hétfőn számíthatunk.</strong></p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">Védekezés virágzó kultúrában</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A gyümölcsösök virágzás állapotban vannak. A kijuttatott készítmények során fordítsunk különös figyelmet a méhek védelmére. Ne felejtsük el, hogy a gyomok virágzása esetén az ültetvény is ugyan úgy virágzó kultúrának számít, valamint azt, hogy a méhek nemcsak a virágok nektárjait keresik fel, hanem a levéltetvek mézharmatját is! Ezekben az esetekben ugyanolyan körültekintéssel kell eljárni a permetezések során, mintha a gyümölcsfák virágoznának.</p>
<p style="text-align: justify;">Permetezésekkor az alábbi feltételekre kell odafigyelnünk:<br />
• Virágzó kultúrának számít, ha a kultúrnövény vagy a táblán levő gyomok és a tábla közvetlen szomszédságában levő növények virágoznak.<br />
• Ellenőrizni kell az adott készítmény méhvédelmi besorolását (nem csak a rovarölő szereknél, hanem a gombaölő és gyomirtó készítményeknél is).</p>
<p><span style="text-decoration: underline;">Méhekre nem veszélyes, illetve nem jelzésköteles készítmények esetén:</span><br />
Bármely időpontban végezhető a permetezés.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;">Méhekre mérsékelten veszélyes készítmények esetén:</span><br />
A permetezéseket a csillagászati naplemente előtt egy órával kell megkezdeni és legkésőbb este 11 óráig be kell fejezni. A kezelések az önkormányzat jegyzője felé bejelentés kötelesek.</p>
<p style="text-align: justify;"><span style="text-decoration: underline;">Méhekre kifejezetten veszélyes készítmények:</span><br />
A virágzó kultúrákban és egyéb olyan esetekben, amikor a méhek látogatják az ültetvényt (a fent említett levéltetű mézharmat) nem használhatóak.</p>
<p style="text-align: justify;">Terméskötődés fokozása<br />
Különösen a fagykárt szenvedett, kevés virággal rendelkező ültetvényekben fontos, hogy a kötődést fokozzuk. A bór tartalmú lombtrágyák, valamit az egyéb kötödést elősegítő anyagok kijuttatásának az ideje a pirosbimbós állapot, valamint a virágzás kezdete. Ekkor fejtik ki a legkedvezőbb hatásukat. A kijuttatást mindenképp a virágzás elejére javasoljuk. Amennyiben tervezzük megismételni, akkor az ismételt kezelést a virágzás közepére időzítsük.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ALMA</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">Az alma pirosbimbós, virágzás kezdete állapotban van.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Betegségek:</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás</strong></p>
<p style="text-align: justify;">Az almafa varasodás tekintetében a fertőzés kezdete helyenként eltérő. A változó időjárásnak köszönhetően az aszkospórák szóródása közt is nagy az eltérés. Ahogy az előző előrejelzésünkben is írtuk, az első fertőzésekhez a szükséges tényezők 2023.04.10-11. között már összejöhettek. 04.12-én minden mintában szóródtak az aszkospórák. Ezt követően a betegség kialakulásához csak az időjárás szabott határt.</p>
<p style="text-align: justify;">A lenti táblázatban összefoglaltam, hogy a meteorológiai állomásaink adatai alapján, hol, milyen mértékben volt jelen a varasodás. Az áprilisi csapadékos időjárás sok esetben alacsony hőmérséklettel járt. Többször is azt tapasztalhattuk, hogy a csapadék mennyisége bőséges volt, de hozzá hűvös időjárás társult, ami az aszkospóra csírázási idejét lelassítja, így kialakulhatott az a helyzet, hogy bár csapadék volt bőven, de mégsem volt elégséges ahhoz, hogy a spóra kicsírázzon és behatoljon a növény szöveteibe. Amint a varasodás megtelepszik a növényi részek bőrszövete alatt, elkezd fejlődni. Eleinte szabad szemmel láthatatlanul, majd amikor eléri a megfelelő fejlettséget, akkor a levelen, illetve más zöld részeken először olajos sötétzöld telepeket hoz létre. A fertőzés és a telepek megjelenése közötti úgynevezett lappangási idő hossza a hőmérséklettől függ. Jelen helyzetben ez kb. 16-17 nap lehet. Tehát arra számíthatunk, hogy a fertőzést követő 16., 17. napon már a tünetek is megjelenhetnek.</p>
<p style="text-align: justify;">Növényvédelmi szempontból ez kiemelkedően fontos időszak. A célunknak annak kell lenni, hogy megakadályozzuk a betegség bőrfelületen való megjelenését. Ebben az időszakban csak olyan hatóanyagot javasolunk felhasználni, ami felszívódik és a gombafonalakat a növényen belül még a telepek kialakulása előtt el tudja pusztítani. A védekezéshez azol típusú hatóanyagot javaslunk. A hőmérséklet emelkedésével már nem kell attól tartanunk, hogy ezek a készítmények nem fejtik ki hatásukat. Továbbá javasoljuk a felszívódó és kontakt hatóanyagok kombinált kijuttatását. A permetezési fordulók kialakításakor vegyük figyelembe hogy a gyümölcsfáink gyorsan fejlődnek, ezzel együtt növekszik a felületük és a zöld tömegük is, a növényvédőszerek a növényi nedvben hamar felhígulnak.</p>
<p style="text-align: justify;">Az elkövetkező héten kevés csapadékra kell számolnunk, a korábbi hetekhez képest a varasodás fertőzési nyomása csökken.</p>
<p>&nbsp;</p>
<p><img loading="lazy" decoding="async" class="aligncenter wp-image-328 size-full" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-1.jpg" alt="Aszkospora szorodas adatai 2023 4 1" width="526" height="762" title="Ezekre figyeljünk a következő napokban 19" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-1.jpg 526w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-1-480x695.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 526px, 100vw" /><br />
<img loading="lazy" decoding="async" class="aligncenter wp-image-329 size-full" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-2.jpg" alt="Aszkospora szorodas adatai 2023 4 2" width="521" height="748" title="Ezekre figyeljünk a következő napokban 20" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-2.jpg 521w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-2-480x689.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 521px, 100vw" /><br />
<img loading="lazy" decoding="async" class="aligncenter wp-image-330 size-full" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-3.jpg" alt="Aszkospora szorodas adatai 2023 4 3" width="523" height="187" title="Ezekre figyeljünk a következő napokban 21" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-3.jpg 523w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-4-3-480x172.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 523px, 100vw" /></p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Lisztharmat</strong></p>
<p style="text-align: justify;">A lisztharmat primer fertőzése jelen van az ültetvényekben. Ezek ellen védekezni nehezen lehet, hiszen a fertőzött hajtásokból minden esetben fertőzött levelek fognak kifejlődni. A védekezés célja, hogy ezekből a fertőzött hajtásokból már ne fertőződjenek be az egészséges hajtásvégek. Javasoljuk, hogy olyan készítménnyel védekezzünk, ami hatásos a varasodás és a lisztharmat ellen is.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Állati kártevők:</h3>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Bimbólikasztó bogár</strong></p>
<p style="text-align: justify;">A kártevő fertőzése már megtörtént, ellene már nem tudunk védekezni, lassan a tünetekkel is fogunk találkozni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Zöld almalevéltetű</strong></p>
<p style="text-align: justify;">A levéltetvek áttelelő egyedei (ősanyák) már előfordulhatnak a kinyílt rügyekben. A kis levélkezdemények védelmében a szívogatást már elkezdik. Hőmérséklettől függően az első telepeiket ki fogják alakítani. Hangyákat már lehet látni a hajtásvégeken, amik már a levéltetveket látogatják, illetve segítik a kolóniák kialakításában.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levélpirosító almalevéltetű</strong></p>
<p style="text-align: justify;">A kártételük már megjelent az ültetvényekben, a kis leveleken már kis mértékű torzulásokat tapasztalhatunk. A későbbiekben a szívogatásnak megfelelően felhólyagosodott, kezdetben narancssárga, majd élénkvörös levéltorzulások fognak kialakulni. Az ellenük való védekezés kulcsa az időben történő kezelések. Mielőtt a levelek torzulnának, azelőtt kell elvégezni a permetezéseket. Később az összehajlott, felhólyagosodott levelek védelmében már nehezen tudunk ellenük hatékonyan védekezni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Vértetű</strong></p>
<p style="text-align: justify;">A lombkorona szintén áttelelt vértetű kolónia elkezdte a károsítását. Még most a védelmet biztosító vatta szerű viaszképződmények nem teljesen alakultak ki, ezért könnyebben tudunk ellenük védekezni. Javasoljuk, hogy használjuk ki ezt az időpontot, hiszen később ez már meg fogja akadályozni a rovarölő szerek hatását. A kezelésekhez mindenképp kontakt készítményeket javaslunk, hiszen a kártevő most a fás részeken károsít, ahova a felszívódó rovarölő szerek nem jutnak el. Fontos, hogy a permetező légáramát úgy állítsuk be, hogy a gallyak alsó részére is juttasson permet levet, a kártevő többnyire itt található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Pajzstetű</strong></p>
<p style="text-align: justify;">Erősen fertőzött ültetvényekben használhatunk még növényolajakat, de már csak nyári hígításban (1%-os töménységben). Virágzáskor már ne használjuk, eltömítheti a pollentömlőket.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Sodrómolyok</strong></p>
<p style="text-align: justify;">A növényfelület növekedésével, illetve a felmelegedéssel lassan megjelennek a sodrómolyok lárvái (ligeti sodrómoly, dudva sodrómoly). Komoly kártételre nem kell számolnunk, hiszen ekkor a gyümölcsösök lombfelülete nagy mértékben növekszik, a károsított levelek helyet hamar új növekszik. Célzottan ellenük védekezni nem szükséges.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">MEGGY, CSERESZNYE, SZILVA</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy most fajtától függően zöldbimbós, kezdeti fehérbimbós állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Virágfertőző monília</strong></p>
<p style="text-align: justify;">Az előző cikkünkben már felhívtuk a figyelmet a virágfertőző monília elleni korai védekezésre. A fertőzési nyomás az elmúlt héten nem csökkent. Várhatóan a következő héten a kevesebb csapadéknak köszönhetően a monília fertőzési veszélye csökkenni fog</p>
<p style="text-align: justify;">A virágfertőző monília esetében a már kialakult fertőzések nem orvosolhatóak, a további még egészséges virágok megvédése a cél. A kezeléseket a virágzás végéig javasoljuk folytatni.</p>
<p style="text-align: justify;">A virágfertőző monília legerősebben a meggyet támadja meg. Érzékeny még rá a szilva, a kajszi, kevésbé fogékony a cseresznye és az őszibarack. A magas fertőzési nyomás miatt javasoljuk, hogy a meggyen kívül a többi csonthéjas növényeinket is kezeljük.</p>
<p>&nbsp;</p>
<h2 style="text-align: justify;">ŐSZIBARACK</h2>
<p>&nbsp;</p>
<p style="text-align: justify;">A tafrinás levélfodrosodás fertőzése a meleg időjárásnak köszönhetően megszűnt, már nem tudunk a kialakult tünetek ellen védekezni. A fertőzött levelek felhólyagosodtak, illetve a hólyagosodások fokozódni fognak, majd maguktól le fognak hullani a levelek.</p>
<p>&nbsp;</p>
<p style="text-align: justify;">További szakmai tanácsokért, bizalommal keressenek minket a <a href="/kapcsolat">Kapcsolat menüpontban</a> vagy a honlap lábrészében is megtalálható elérhetőségeink bármelyikén.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-qcgj68s55', 'blog', '10 hektár felett kötelező az E-permetezési napló használata', 'Híreink', 'Mitruné Tóth Krisztina', '2023.04.17.', '/images/e-permetezesi-naplo-980x427.jpg', 'Idéntől a 10 hektár felett gazdálkodóknak a szántó területeken végzett rovarölő szeres kezeléseket legkésőbb a tevékenységet követő 24 órán belül be kell jelenteni a NÉBIH által kialakított elektronikus permetezési napló felületen. Az E-permetezési napló vezetését irodánk természetesen tudja vállalni, azonban ehhez feltétlenül szükséges részünkre az azonnali, pontos tájékoztatás, ezért arra szeretnénk kérni a gazdákat, hogy ...', '<p style="text-align: justify;"><strong>Idéntől a 10 hektár felett gazdálkodóknak a szántó területeken végzett rovarölő szeres kezeléseket legkésőbb a tevékenységet követő 24 órán belül be kell jelenteni a NÉBIH által kialakított elektronikus permetezési napló felületen.</strong></p>
<p style="text-align: justify;">Az E-permetezési napló vezetését irodánk természetesen tudja vállalni, azonban ehhez feltétlenül szükséges részünkre az azonnali, pontos tájékoztatás, ezért arra szeretnénk kérni a gazdákat, hogy amennyiben az előzőekben megjelölt tevékenységet hajtanak végre, azt lehetőség szerint annak megkezdése előtt, de legkésőbb 24 órán belül jelezzék kollégáinknak!</p>
<p style="text-align: justify;">Az adatszolgáltatáskor kérjük, készüljenek a területek beazonosítására szolgáló adatokkal (pl. település + helyrajzi szám, tavalyi évi egységes kérelem táblasorszám stb). Az E-permetezési napló vezetésének elmulasztása szankciót vonhat maga után, ami az adott évi agrártámogatásokra is kiterjedhet!</p>
<p>&nbsp;</p>
<p style="text-align: justify;">Kérdés esetén vegyék fel velünk a kapcsolatot itt <a href="/kapcsolat">a honlapon, a Kapcsolat</a> menüponton keresztül vagy kollégáinkkal telefonon.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;"><strong>Elérhetőségeink:</strong></span></p>
<p style="text-align: justify;"><strong>Nyíregyházi iroda:</strong><br />
Ungvári Enikő 30/786-7133<br />
Dánielné Musta Kitti 30/440-2705<br />
Benke László 30/557-1656<br />
Sápi Imre 30/559-7376<br />
Kozák Dávid 20/548-4948<br />
Moravszki Gábor 30/346-2848</p>
<p style="text-align: justify;"><strong>Kisvárdai iroda:</strong><br />
Pokol Roland 30/560-1366<br />
Sirola-Kőrizs Tímea 30/185-7844</p>
<p style="text-align: justify;"><strong>Tarpai iroda:</strong><br />
Benke László 30/557-1656<br />
Sápi Imre 30/559-7376</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-9jhthjqug', 'blog', 'Milyen betegségekre, kártevőkre számítsunk a következő hetekben?', 'Híreink', 'Mitruné Tóth Krisztina', '2023.04.13.', '/images/novenyvedelmi_elorejelzes-5.jpg', 'Azt hiszem, elmondhatjuk, hogy az idei időjárás nagyon rendkívüli. A korai kitavaszodás után hirtelen lehűlés jött,  majd Húsvétra havazott. Sosem tapasztaltunk olyat, hogy a varasodás vizsgálatra elkülönített leveleket a hó alól kellene elővenni. Az elmúlt hetekben több helyen is fagykár érte az ültetvényeket. Ügyfeleink vegyes képet láttak. A cseresznye, őszibarack jobban megsínylette a hajnali fagyokat, ...', '<p style="text-align: justify;"><strong>Azt hiszem, elmondhatjuk, hogy az idei időjárás nagyon rendkívüli. A korai kitavaszodás után hirtelen lehűlés jött,  majd Húsvétra havazott. Sosem tapasztaltunk olyat, hogy a varasodás vizsgálatra elkülönített leveleket a hó alól kellene elővenni. Az elmúlt hetekben több helyen is fagykár érte az ültetvényeket. Ügyfeleink vegyes képet láttak. A cseresznye, őszibarack jobban megsínylette a hajnali fagyokat, az alma kevésbé. Remélhetőleg, a termés mennyiségére nem lesz kihatással.</strong></p>
<p style="text-align: justify;">A hideg visszavetette a kultúrnövények fejlődését, de nem állította meg. Az alma esetében a korai zöldbimbós állapotból kifejlett zöldbimbós stádiumba ment át.</p>
<p style="text-align: justify;">Az elkövetkező hétre a meteorológiai előrejelzések felmelegedést, illetve csapadékot jósolnak. A várható maximum léghőmérséklet 16-20 °C között lesz, az éjszakai minimum hőmérséklet sem fog +3 °C (2023.04.16.) alá süllyedni. Fagyveszély &#8211; reméljük &#8211; nem lesz. Csapadékot 04.14. és 04.19. közt minden napra jósolnak.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;"><strong>ALMA</strong></h3>
<p>&nbsp;</p>
<p style="text-align: justify;">Az alma jelenleg zöldbimbós állapotban van.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;"><span style="text-decoration: underline;"><strong>Betegségek:</strong></span></h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Almafa varasodás</strong></p>
<p style="text-align: justify;">Az almafa varasodás aszkospóráinak a szóródása az elmúlt héten a hideg idő következtében visszaesett, majd 2023.04.06-09. között a hótakaró meg is állította. 04.10-11-én a csapadéknak, illetve a felmelegedésnek köszönhetően már várható volt a spórák szóródása. 2023.04.12-én végeztük a következő aszkospóra szóródási vizsgálatot. Ekkor már azt tapasztaltuk, hogy minden egyes mintánkban változó mértékben, de összességében elmondható, hogy nagy darabszámú aszkospórákat találtunk.</p>
<p style="text-align: justify;">A csapadékeloszlást, illetve a levélfelületi nedvességet, hőmérsékletet figyelembe véve a számításaink szerint 2023.04.10-11-én a fertőzéshez szükséges minden tényező rendelkezésre állt, az aszkospórák csírázása és növénybe való bejutása ekkor nagy valószínűséggel bekövetkezett.</p>
<p style="text-align: justify;">Javasoljuk, hogy felszívódó és kontakt készítményekkel védekezzenek. A meteorológiai előrejelzések szerint csapadék és felmelegedés várható, ennek következtében a fertőzési nyomás emelkedni fog, illetve a hőmérséklet emelkedésével a spórák csírázásához szükséges idő is jelentősen csökken. Az alma most kritikus helyzetben van a varasodás fertőzését tekintve. Fontos, hogy a mostani veszélyes időszakban megállítsuk a betegség terjedését, ezért fokozott figyelmet fordítsuk az almafa varasodás elleni védekezésre, a helyes szerhasználatra. Javasoljuk a permetezési fordulókat a fertőzési nyomáshoz igazítani. Amennyiben az előrejelzésnek megfelelően minden nap fog csapadék hullani, akkor a heti kétszeri kezelések indokoltak. Vegyük figyelembe azt is, hogy a lombfelület, illetve az almafák zöldtömege napról napra növekszik. Fontos, hogy a felszívódó szerek növényen belüli arányát ne engedjük felhígulni, illetve a levélfelület növekedéssel párhuzamosan a kontakt készítmények fedése is biztosított legyen. Ezért is szükséges a permetezési fordulók szűkítése.</p>
<p>&nbsp;</p>
<div id="attachment_302" style="width: 666px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-302" class="wp-image-302 size-full" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-3.jpg" alt="Aszkospóra szóródás adatai 2023" width="656" height="545" title="Milyen betegségekre, kártevőkre számítsunk a következő hetekben? 22" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-3.jpg 656w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-3-480x399.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 656px, 100vw" /><p id="caption-attachment-302" class="wp-caption-text"><center>Aszkospóra szóródás adatai 2023</center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Lisztharmat</strong></p>
<p style="text-align: justify;">A lisztharmat primer fertőzése már látható. Jelenleg a fertőzött rügyekből fertőzött hajtások fejlődtek ki. Ezek ellen kémiai úton nehezen lehet védekezni. A legjobb, ha eltávolítjuk ezeket a hajtásvégeket.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;"><span style="text-decoration: underline;"><strong>Állati kártevők:</strong></span></h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Bimbólikasztó bogár</strong></p>
<p style="text-align: justify;">A hideg időjárás is hatással volt a bimbólikasztó bogár terjedéséhez, lelassította a kártételt. Jelenleg az alma most van a legkitettebb stádiumban, a kártevő most rakja le a tojásait a zöld virágbimbókra. A fertőzött területeken most indokolt a védekezés.</p>
<p style="text-align: justify;">Védekezési lehetőségek:<br />
• A bimbólikasztó bogár a tojásait a bőrszövet alá rakja, ezért nem tudunk ellene hatékonyan olajos lemosó szerekkel, illetve narancsolajjal védekezni.<br />
• A felszívódó készítmények azért nem hoznak jelentősebb eredményt, mert nincs lombfelület, ahol fel tudnak szívódni.<br />
• Egyedüli megoldás a kontakt szerekkel történő imágók elleni védekezés,</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Zöld almalevéltetű</strong></p>
<p style="text-align: justify;">A levéltetvek áttelelő egyedei (ősanyák) már előfordulhatnak a kinyílt rügyekben. A kis levélkezdemények védelmében a szívogatást már elkezdik. Hőmérséklettől függően az első telepeket ki fogják alakítani. Hangyákat már lehet látni a hajtásvégeken, amik már a levéltetveket látogatják, illetve segítik a kolóniák kialakításában.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Levélpirosító almalevéltetű</strong></p>
<p style="text-align: justify;">A kártételük már megjelent az ültetvényekben, a kis leveleken már kis mértékű torzulásokat tapasztalhatunk. A későbbiekben a szívogatásnak megfelelően felhólyagosodott, kezdetben narancssárga, majd élénkvörös levéltorzulások fognak kialakulni. Az ellenük való védekezés kulcsa az időben történő kezelések. Mielőtt a levelek torzulnának, azelőtt kell elvégezni a permetezéseket. Később az összehajlott, felhólyagosodott levelek védelmében már nehezen tudunk ellenük hatékonyan védekezni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Vértetű</strong></p>
<p style="text-align: justify;">A lombkoronaszinten áttelelt vértetű kolónia elkezdte a károsítását. Most még a védelmet biztosító vatta szerű viaszképződmények nem teljesen alakultak ki, ezért könnyebben tudunk ellenük védekezni. Javasoljuk, hogy használjuk ki ezt az időpontot, hiszen később ez már meg fogja akadályozni a rovarölő szerek hatását. A kezelésekhez mindenképp kontakt készítményeket javaslunk, hiszen a kártevő most a fás részeken károsít, ahova a felszívódó rovarölő szerek nem jutnak el. Fontos, hogy a permetező légáramát úgy állítsuk be, hogy a gallyak alsó részére is juttassunk permetlevet. A kártevő többnyire itt található.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Pajzstetű</strong></p>
<p style="text-align: justify;">Erősen fertőzött ültetvényekben használhatunk még növényolajakat, de már csak nyári hígításban (1%-os töménységben), virágzáskor már ne használjuk, eltömítheti a pollentömlőket.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Sodrómolyok</strong></p>
<p style="text-align: justify;">A növényfelület növekedésével illetve a felmelegedéssel lassan megjelennek a sodrómolyok lárvái (ligeti sodrómoly, dudva sodrómoly). Komoly kártételre nem kell számolnunk, hiszen ekkor a gyümölcsösök lombfelülete nagy mértékben növekszik, a károsított levelek helyet hamar új növekszik. Célzottan ellenük védekezni nem szükséges.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;"><strong>MEGGY, CSERESZNYE, SZILVA</strong></h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A meggy most fajtától függően zöldbimbós, kezdeti fehérbimbós állapotban van.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><strong>Virágfertőző monília</strong></p>
<p style="text-align: justify;">A virágfertőző monília elleni védekezésünk legfontosabb állomása a fehérbimbós állapot. Fontos, hogy a betegség ellen hatékonyan akkor tudunk védekezni, ha már akkor védekezünk, amikor az első fehér bimbók megjelentek. Ebben az állapotban a bibeszár már nyitott, a gombaspóra könnyen tud fertőzni. Tekintettel arra, hogy az elkövetkező napokban csapadék, illetve magas páratartalom várható, így minden adott lesz a virágfertőző monília betegség fertőzéséhez.</p>
<p style="text-align: justify;">Javasoljuk, hogy az első fehér ballonos virágok megjelenésekor már kontakt és felszívódó készítményekkel védekezzünk. Amennyiben lekéssük és már fertőződnek a virágkezdemények, akkor már utána nem tudjuk megvédeni a virágokat. Javasoljuk, hogy a fehérbimbós állapot &#8211; virágzás között folyamatosan az időjárási tényezőkhöz igazodva kétszer vagy háromszor védekezzünk.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;"><strong>ŐSZIBARACK</strong></h3>
<p>&nbsp;</p>
<p style="text-align: justify;">A hosszan tartó hideg nyirkos időjárás nagymértékben elősegíti az őszibarack tafrinás levélfodrosodás betegség terjedését. Várható, hogy az idei évben a szokottnál nagyobb intenzitással fog a betegség megjelenni. A védekezéseket most javasoljuk elvégezni.</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><a href="/kapcsolat">További szakmai tanácsokért, bizalommal keressenek minket.</a></p>', NULL, NULL, NULL, NULL, NULL),
  ('post-v5epmgfx6', 'blog', 'Az almafa varasodás folytatódik', 'Híreink', 'Mitruné Tóth Krisztina', '2023.04.09.', '/images/almafa-varrasodas-folytatodik.jpg', 'Az almafa varasodás fertőzése az eddig tapasztalt legkorábbi időpontban elindult, az első aszkospórákat 2023.03.20-án találtuk. Ebben az időpontban a lombfelület már fertőzőképes volt, a klimatikus tényezők is adottak voltak. A hőmérséklet meglehetősen alacsony volt, a spórák csírázásához több idő kellett, ennek következtében a fertőzési intenzitás is csökkent egy kissé. 2023.03.31-én elvégeztük a 3. aszkospóra szóródási ...', '<p style="text-align: justify;">Az almafa varasodás fertőzése az eddig tapasztalt legkorábbi időpontban elindult, az első aszkospórákat 2023.03.20-án találtuk. Ebben az időpontban a lombfelület már fertőzőképes volt, a klimatikus tényezők is adottak voltak. A hőmérséklet meglehetősen alacsony volt, a spórák csírázásához több idő kellett, ennek következtében a fertőzési intenzitás is csökkent egy kissé.</p>
<p style="text-align: justify;">2023.03.31-én elvégeztük a 3. aszkospóra szóródási vizsgálatainkat. Azt tapasztaltuk, hogy a nyíregyházi minta kivételével minden egyes helyszínen elindut az aszkospórák szóródása. Kis mértékkel, de jelen vannak az ültetvényeinkben. Érdekesség, hogy a hideg kihatott a korábban már közepes intenzitással szóródó mintákra is. Ott a spórák mennyisége kis mértékben csökkent.</p>
<p style="text-align: justify;">A korai varasodás fertőzését a hideg idő lassította, a spórák csírázáshoz szükséges idő meghosszabbodott. 2023.04.01-én és 02-án a léghőmérséklet 10°C felé emelkedett. Ekkor csapadék csak elszórtan volt, így a fertőzéshez a feltételek részben adottak voltak. Ezt követően a levegő azonban tovább hűlt, aminek következtében a fertőzési nyomás is csökkent. A meteorológiai előrejelzések szerint a hőmérséklet 04.06-tól fokozatosan emelkedni fog, Húsvétra már enyhe és egyben csapadékos időre számíthatunk, nagy valószínűséggel a varasodás fertőzéséhez szükséges klimatikus tényezők rendelkezésre fognak állni, és az ünnepek alatt megtörténik a következő fertőzés.</p>
<p style="text-align: justify;">Javasoljuk, hogy az ünnepek előtt felszívódó és kontakt gombaölő szeres kezelésekkel védekezzünk.</p>
<p>&nbsp;</p>
<p><img loading="lazy" decoding="async" class="aligncenter wp-image-292 size-full" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-2.jpg" alt="Aszkospora szorodas adatai 2023 2" width="661" height="456" title="Az almafa varasodás folytatódik 24" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-2.jpg 661w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-2-480x331.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 661px, 100vw" /></p>', NULL, NULL, NULL, NULL, NULL),
  ('post-i8i31wtst', 'blog', 'Elindult az almafa varasodás aszkospóráinak a szóródása', 'almafa', 'Mitruné Tóth Krisztina', '2023.03.28.', '/images/Elindult-az-almafa-varasodas-fontos-a-korai-vedekezes-1080x675.jpg', 'Ahogyan azt korábban is jeleztük, várható volt, hogy az idei évben a varasodás korán el fog indulni. A termőtestek kialakulásához, illetve éréséhez a téli időjárás kimondottan kedvezett. A spórák még az előző heti vizsgálataink alapján éretlenek voltak, nem szóródtak. A fejlődésükhöz szükséges hőösszeg 2023.03.24-re állt össze. Ekkor már csak a megfelelő csapadékra volt szükség ahhoz, ...', '<p style="text-align: justify;"><strong>Ahogyan azt korábban is jeleztük, várható volt, hogy az idei évben a varasodás korán el fog indulni. A termőtestek kialakulásához, illetve éréséhez a téli időjárás kimondottan kedvezett. A spórák még az előző heti vizsgálataink alapján éretlenek voltak, nem szóródtak. A fejlődésükhöz szükséges hőösszeg 2023.03.24-re állt össze. Ekkor már csak a megfelelő csapadékra volt szükség ahhoz, hogy elinduljon az aszkospórák szóródása. </strong></p>
<p>&nbsp;</p>
<p style="text-align: justify;">2023.03.25-én 6 mm csapadék hullott, ami már elegendő volt ahhoz, hogy a spórák szóródása elinduljunk. Vizsgálataink szerint a tuzséri, ajaki és a tarpai mintánkból már ki lehetett mutatni az aszkosprákat, 2023.03.26-án elindult az aszkospórák szóródása.</p>
<p>&nbsp;</p>
<div id="attachment_287" style="width: 649px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-287" class="wp-image-287 size-full" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-2023-2.jpg" alt="Aszkospóra szóródás" width="639" height="856" title="Elindult az almafa varasodás aszkospóráinak a szóródása 25" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-2023-2.jpg 639w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-2023-2-480x643.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 639px, 100vw" /><p id="caption-attachment-287" class="wp-caption-text"><center><strong>Aszkospóra szóródás</strong></center></p></div>
<p>&nbsp;</p>
<p style="text-align: justify;">A tervezett védekezésekkor minden esetben legyünk arra tekintettel, hogy:<br />
• Az elkövetkező napokban folyamatos esőzésekre számíthatunk, a betegség terjedéséhez a klimatikus tényezők adottak lesznek<br />
• Az aszkospórák csírázásához, növénybe való bejutása hőmérséklethez kötött. Minél magasabb a hőmérséklet, annál gyorsabb a fertőzési folyamat: 6 °C-os hőmérsékleten is legalább 26 óra szükséges a fertőzéshez, míg 10 °C-on már csak 14 órára. Ez azt jelenti, hogy a levélfelületnek eddig kell nedvesnek lenni.<br />
• Amennyiben a csapadék mennyisége az előrejelzettnek megfelelő lesz, akkor várható, hogy a varasodás első fertőzésének az időpontja: 2023.03.28-án lesz. Ez a legkorábbi dátum, amióta mi végzünk előrejelzéseket!<br />
• Az almások fenológiai állapota a rügy duzzanattól a korai zöldbimbós állapotig helyenként eltérő mértékben változik. Bármilyen állapotban is van a lombfelület, már fertőzésre fogékony. Nehogy beleessünk abba a csapdába, hogy még alig van levélfelület.<br />
• A hagyományos technológia, réz tartalmú szerek korai használata, nem javasolt.<br />
• Bár a lombfelület kicsi, annak ellenére olyan készítményt kell alkalmaznunk, aminek tartamhatása is van, így javasoljuk a felszívódó szerek használatát.<br />
• Várható, hogy a héten minden nap esni fog az eső, így javasoljuk, hogy a permetezésekre készüljünk fel és azokat az időszakokban, amikor eláll és a talaj is engedi, akkor mindenképp permetezzünk.</p>
<p style="text-align: justify;">Összességében elmondható, hogy az idei évi varasodás nagyon hamar indul. Éppen hogy van fertőzőképes lombfelület, már fertőz. Az időjárás kimondottan kedvez a betegség terjedéséhez, egyben akadályozza a kezeléseket is. Ennek megfelelően kell a védekezést terveznünk. A felszívódó szerek használata olyan időpontra került, amikor alig van lombfelület, illetve a kezeléseket is csak akkor lehet véghezvinni, amikor a talaj, illetve az időjárás engedi. A sikeres varasodás elleni védekezés alapja, hogy az első kezeléseket időben elvégezzük. Ha nem is tűnik hatékonynak, mert alig van felület vagy mert csak két eső közt tudtuk kijuttatni, akkor is meg kell tenni, hiszen a csökkentett hatékonyságú kezelések is jobbak, mint az elmaradt kezelések.</p>
<p>&nbsp;</p>
<div id="attachment_285" style="width: 687px" class="wp-caption aligncenter"><img loading="lazy" decoding="async" aria-describedby="caption-attachment-285" class="wp-image-285 size-full" src="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023.jpg" alt="Aszkospóra szóródás adatai 2023" width="677" height="374" title="Elindult az almafa varasodás aszkospóráinak a szóródása 26" srcset="https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023.jpg 677w, https://www.demotrade.hu/wp-content/uploads/Aszkospora-szorodas-adatai-2023-480x265.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 677px, 100vw" /><p id="caption-attachment-285" class="wp-caption-text"><center><strong>Aszkospóra szóródás adatai 2023</strong></center></p></div>', NULL, NULL, NULL, NULL, NULL),
  ('post-c3f1o59zh', 'blog', '2023-tól átalakul az agrártámogatási rendszer, érkezik az Agrár-ökológiai Alapprogram', 'Híreink', 'Mitruné Tóth Krisztina', '2022.10.12.', '/images/Agrartamogatasirendszer-okologiai-Alapprogram-1080x675.jpg', '2023-tól átalakul az eddig megszokott agrártámogatási rendszer. A változás minden gazdálkodót érinteni fog. Az alábbi cikkünkben erről, illetve a jövőre induló Agrár-ökológiai Programról (AÖP) szedtük össze a legfontosabb tudnivalókat. Az új támogatási forma jelenleg még nincs véglegesítve, de várhatóan nagy mértékben már nem fognak változtatni rajta. Az idei évig az alaptámogatást 2 jogcím alkotta: a ...', '<p style="text-align: justify;"><strong>2023-tól átalakul az eddig megszokott agrártámogatási rendszer. A változás minden gazdálkodót érinteni fog. Az alábbi cikkünkben erről, illetve a jövőre induló Agrár-ökológiai Programról (AÖP) szedtük össze a legfontosabb tudnivalókat. </strong></p>
<p style="text-align: justify;">Az új támogatási forma jelenleg még nincs véglegesítve, de várhatóan nagy mértékben már nem fognak változtatni rajta. Az idei évig az alaptámogatást 2 jogcím alkotta: a területalapú támogatás (SAPS), illetve a zöldítés. Az együtt kb. 82 000 Ft/ha kifizetési összegnél a SAPS nagyságrendileg 2/3-os, a Zöldítés 1/3-os arányt tett ki. A következő évtől a két jogcím “egybe olvad” és adja majd az alaptámogatást. Összegszerűen hasonló mértékben kerül kifizetésre mint jelenleg a SAPS.</p>
<p>&nbsp;</p>
<h3>Mi az az AÖP?</h3>
<p style="text-align: justify;">Új támogatásként érkezik az Agrár-ökológiai Alapprogram (AÖP), amely funkciójában a Zöldítést váltja fel, az ahhoz tartozó támogatási összeggel. Az Agrár-ökológiai Alapprogramról (AÖP) a legfontosabb tudnivalók a következők:</p>
<p style="text-align: justify;">Az AÖP-be való csatlakozás önkéntes alapú, tehát a gazda dönti el, hogy igénybe kívánja e venni az alaptámogatáson felüli összegért cserébe. A fix összegű, hektár alapon kifizetésre kerülő támogatásért környezeti vállalásokat, más néven “jó gyakorlatokat” szükséges tenni, amit a gazdálkodónak be is kell tartania (!). A mezőgazdasági üzem teljes területére elszámolható a támogatás a vállalt feltételek teljesítése esetén. A kötelezettségvállalásról minden évben az egységes kérelem keretében kell nyilatkozni. Időtartama: 1 év.</p>
<p style="text-align: justify;">A mezőgazdasági üzemen belül minden tényleges hasznosítási módra (szántó, gyep, ültetvény) vonatkozóan legalább 2 pont értékű előírást szükséges választani. A fentiekből adódóan az AÖP-öt nem kötelező igénybe venni, viszont ebben az esetben a gazda az eddig megszokott 82 000 Ft/ha körüli támogatási összegnek csak a 2/3-át fogja kapni. A maradék 1/3 csak az AÖP-höz való csatlakozás esetén jár, a környezeti vállalások teljesítésével. A vállalások alól semmilyen esetben sincs mentesség.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Egyéb tudnivalók az AÖP-ről</h3>
<p style="text-align: justify;">A gazdálkodási napló vezetése és elektronikus beküldése kötelező. Az Agrár-ökológiai Alapprogram rendelkezik bizonyos küszöbértékkel az egyes művelési ágakat tekintve. Ezek a következőek:</p>
<p style="text-align: justify;">Szántó: 5 ha,<br />
Gyep: 5 ha,<br />
Ültetvény: 2 ha.</p>
<p style="text-align: justify;">Ez azt jelenti, hogy ha a gazdálkodó belép az AÖP-be és minden művelési ága a megjelölt küszöbértékek felett van akkor kötelező mind a három területre jó gyakorlatokat választania. Amennyiben egyik művelési ága a küszöbérték alatt van, akkor arra nem kötelező választani jó gyakorlatot, viszont nem is kap kifizetést rá.</p>
<p style="text-align: justify;">Példa: A gazdálkodó rendelkezik 30 hektár szántóval, 6 hektár gyeppel, illetve 1 hektár gyümölcsössel. A szántóval mindenképpen szeretne részt venni az AÖP-ben, ezért azzal belép, de mivel a gyepe is a küszöbérték felett van, ezért azzal is be kell, hogy lépjen és arra is jó gyakorlatokat kell választania. A gyümölcsös a küszöbérték alatt van, ezért dönthet úgy, hogy azzal nem lép be, de nem is kap rá támogatási összeget, csak a másik 2 művelési ágra. Vagy másik lehetősége a gazdának, hogy egyáltalán nem lép be az AÖP-be, mivel a vállalása önkéntes, de akkor a jogcímhez tartozó támogatási összeget sem kapja meg.</p>
<p style="text-align: justify;">Az Agrár-ökológiai Alapprogramhoz kiadott jó gyakorlatok listáját egy külön cikkben szedjük össze. Ismét szeretnénk kiemelni, hogy a jogcím még nincs rendeletbe foglalva, de nagyobb módosítások már nem várhatóak benne. De értelemszerűen jelen cikkünkben a jelenleg rendelkezésre álló információkat közöljük. Az AÖP tekintetében a döntést belépésről, illetve a jó gyakorlatok kiválasztását a jövő évi egységes kérelemben kell megtenni.</p>
<p style="text-align: justify;">Amennyiben a témával kapcsolatban kérdés merül fel, a honlapon több helyen is megtalálhatóak az <a href="https://www.demotrade.hu/kapcsolat/">elérhetőségeink.</a></p>', NULL, NULL, NULL, NULL, NULL),
  ('post-ptelm3bys', 'blog', 'Ismét kiírták a Mezőgazdasági kisüzemek támogatása című pályázatot', 'Pályázatok', 'Mitruné Tóth Krisztina', '2022.10.04.', '/images/Mezogazdasagi-kisuzemek-tamogatasa-980x661.jpg', 'Sokan várták, így örömmel osztjuk meg a hírt, hogy ismét kiírták a Mezőgazdasági kisüzemek támogatása című pályázatot. Cikkünkben összeszedtük nektek a legfontosabb információkat a pályázattal kapcsolatban. Kérdés esetén pedig keressétek bátran kollégáinkat a cikk alján is megtalálható elérhetőségeink valamelyikén. &#160; Mikor lehet pályázni? A pályázat beadási időszaka 2022.11.17 és 2020.11.30. között lesz. &#160; Kik pályázhatnak? ...', '<p style="text-align: justify;"><strong>Sokan várták, így örömmel osztjuk meg a hírt, hogy ismét kiírták a Mezőgazdasági kisüzemek támogatása című pályázatot. Cikkünkben összeszedtük nektek a legfontosabb információkat a pályázattal kapcsolatban. Kérdés esetén pedig keressétek bátran kollégáinkat a cikk alján is megtalálható elérhetőségeink valamelyikén.</strong></p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Mikor lehet pályázni?</h3>
<p style="text-align: justify;">A pályázat beadási időszaka 2022.11.17 és 2020.11.30. között lesz.</p>
<p>&nbsp;</p>
<h3 style="text-align: justify;">Kik pályázhatnak?</h3>
<p style="text-align: justify;">Röviden összefoglalva az agrárágazat kisebb szereplői pályázhatnak, azok közül is akik megfelelnek az alábbi feltételeknek:</p>
<p style="text-align: justify;">1. A pályázó életvitelszerű tartózkodási helye már a támogatási kérelem benyújtását megelőző 12 hónapban jogosult településen, vidéki térségekben volt (ezt a projekt lezárásáig fent kell tartani).</p>
<p style="text-align: justify;">Jogosult település:<br />
&#8211;  a népesség 10 ezer főnél kevesebb;<br />
&#8211;  10 ezer fő feletti lakossággal rendelkező tanyás települések külterületei</p>
<p style="text-align: justify;">2. A pályázó a támogatási kérelem benyújtását megelőző teljes lezárt üzleti évben (2021) legalább 3 000 euro STÉ, de legfeljebb a 6 000 euro STÉ értékű üzemmérettel kizárólagosan rendelkezik.</p>
<p style="text-align: justify;">Az üzemméret alapjául a 2021-ben beadott és elfogadott területalapú támogatási kérelem szolgál, illetve állattartás esetén az egyes nyilvántartásokba vett állatállomány, állatorvosi igazolás. Szükség esetén a területalapúban nem szereplő de mezőgazdaságilag hasznosított területekről kormányhivatali igazolás állítható ki.</p>
<p style="text-align: justify;">VAGY</p>
<p style="text-align: justify;">A támogatási kérelem benyújtását megelőző teljes lezárt üzleti évben (2021) 3 000 és 6 000 euró közötti nettó árbevételt ért el mezőgazdasági termelésből (agrártámogatások nélkül). Amennyiben a 2021. évi mezőgazdasági termelésből származó nettó árbevétel ezt az értéket nem éri el vagy meghaladja, úgy a gazda nem tud pályázni.</p>
<p>&nbsp;</p>
<h3>Mi a pályázat célja?</h3>
<p style="text-align: justify;">A támogatást igénylő vállalja, hogy legkésőbb a Támogatói Okirat hatálybalépésétől számított 4. év végére a kedvezményezett mezőgazdasági termelő tevékenységből származó üzemmérete meg kell, hogy haladja a 6 000 euro STÉ értéket vagy a mezőgazdasági termelő tevékenységből származó értékesítés nettó árbevétele a 6 000 eurót.</p>
<p>&nbsp;</p>
<h3>Mekkora összeg hívható le?</h3>
<p style="text-align: justify;">Az igényelhető támogatás 15 000 eurónak megfelelő forintösszeg 5 évre. A támogatás 75%-a a támogatói okirat kézhezvételétől vehető igénybe, a fennmaradó 25% a vállalt feltételek teljesítésekor hívható le.</p>
<p>&nbsp;</p>
<h3>Kiktől kérhetsz segítséget a pályázathoz?</h3>
<p style="text-align: justify;">Amennyiben érdeklődsz a pályázat iránt, keresd Sápi Imre vagy Sirola-Kőrizs Tímea kollégánkat!</p>
<p><strong>Elérhetőségeink:</strong></p>
<p style="text-align: justify;"><strong>Nyíregyházi iroda:</strong><br />
Ungvári Enikő &#8211; 30/786-7133<br />
Harkályné Liptai Dalma &#8211; 30/440-2705<br />
Benke László &#8211; 30/557-1656<br />
Sápi Imre &#8211; 30/559-7376<br />
Kozák Dávid &#8211; 20/548-4948<br />
Moravszki Gábor &#8211; 30/346-2848</p>
<p><strong>Kisvárdai iroda:</strong><br />
Pokol Roland &#8211; 30/560-1366<br />
Sirola-Kőrizs Tímea &#8211; 30/185-7844</p>
<p><strong>Tarpai iroda:</strong><br />
Benke László &#8211; 30/557-1656<br />
Sápi Imre &#8211; 30/559-7376</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-c6xqcl9ja', 'blog', 'Ünnepi nyitvatartásunk', 'Nyíregyháza', 'Mitruné Tóth Krisztina', '2021.12.16.', '/images/nyertes_gazda.jpg', 'Minden kedves ügyfelünk figyelmét felhívjuk, hogy az ünnepek alatt nyitvatartásunk eltér a megszokottól. Amennyiben még személyesen szeretnének minket felkeresni minket, kérjük, vegyék figyelembe, hogy idén meddig tehetik meg még ezt. A nyíregyházi irodánk 2021.december 17-én, pénteken 14 óráig elérhető még. A tarpai ügyfélszolgálatunk utolsó időpontja pedig 2021. december 16., csütörtök 15 óra. A tarpai ügyfélszolgálatunk ...', '<p style="text-align: justify;"><strong>Minden kedves ügyfelünk figyelmét felhívjuk, hogy az ünnepek alatt nyitvatartásunk eltér a megszokottól. Amennyiben még személyesen szeretnének minket felkeresni minket, kérjük, vegyék figyelembe, hogy idén meddig tehetik meg még ezt.</strong></p>
<p style="text-align: justify;">A <strong>nyíregyházi irodánk</strong> 2021.december 17-én, pénteken 14 óráig elérhető még.</p>
<p style="text-align: justify;">A <strong>tarpai ügyfélszolgálatunk</strong> utolsó időpontja pedig 2021. december 16., csütörtök 15 óra. A tarpai ügyfélszolgálatunk kapcsán fontos információ még, hogy az ügyfélszolgálat a januári hónapban &#8211; az előző évekhez hasonlóan &#8211; szünetelni fog. A jövő évi első ügyfélszolgálati időpontunk: 2022. február 3. (csütörtök).</p>
<p style="text-align: justify;">Természetesen telefonon is bármikor a rendelkezésükre állunk, szükség esetén a két ünnep között is elérhetőek leszünk!</p>
<p style="text-align: justify;">Az a gazdálkodó, aki még nem szolgáltatott a gazdálkodási naplóhoz anyagot vagy hiányossága van, kérjük, pótolja, hogy rendben el tudjuk készíteni a kötelező adatszolgáltatást!</p>
<p style="text-align: justify;">Felmerülő kérdés, ügyintézés esetén forduljanak kollégáinkhoz bizalommal:</p>
<p style="text-align: justify;">Benke László 30/557-1656<br />
Sápi Imre 30/559-7376</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-xalhfm7ag', 'blog', 'A Mezőgazdasági kisüzemek támogatása című pályázatban nyertes gazdák figyelmébe', 'Pályázatok', 'Mitruné Tóth Krisztina', '2021.12.16.', '/images/Mezogazdasagi-kisuzemek-tamogatasa-980x661.jpg', 'Szeretnénk emlékeztetni néhány fontos információra a Mezőgazdasági kisüzemek támogatása című pályázatban nyertes gazdákat. Felhívjuk a figyelmüket néhány kiemelten fontos vállalásra, amelyek teljesítése elengedhetetlen a projekt sikeres véghezviteléhez. 1) A támogatásra 10 000 fő alatti települések lakói vagy 10 000 fő feletti települések tanyás területein élők pályázhattak. A bejelentett lakcímről kijelentkezni vagy átjelentkezni jogosulatlan településre tilos ...', '<p style="text-align: justify;"><strong>Szeretnénk emlékeztetni néhány fontos információra a Mezőgazdasági kisüzemek támogatása című pályázatban nyertes gazdákat. Felhívjuk a figyelmüket néhány kiemelten fontos vállalásra, amelyek teljesítése elengedhetetlen a projekt sikeres véghezviteléhez.</strong></p>
<p style="text-align: justify;">1) A támogatásra 10 000 fő alatti települések lakói vagy 10 000 fő feletti települések tanyás területein élők pályázhattak. A bejelentett lakcímről kijelentkezni vagy átjelentkezni jogosulatlan településre tilos és az eddig kiutalt támogatás teljes visszafizetését vonhatja maga után. Minden ilyen esetben előbb egyeztessenek szaktanácsadó kollégáinkkal!</p>
<p style="text-align: justify;">2/A) A támogatói okirat kézhezvétele után elindul a megvalósítási időszak. Az árbevétellel pályázó gazdák vállalták, hogy árbevételük az 5 év alatt egyik évben sem esik 3 000 euró (kb 1 000 000 Ft) alá. Ez az összeg az 1 főre jutó, agrártámogatások nélküli értékesítéses árbevételt jelenti. Tehát a nyertes pályázónak a 2021-es évben sem lehet ennél kisebb árbevétele. Kérjük, a könyvelésnél erre mindenképpen figyeljenek oda!</p>
<p style="text-align: justify;">Szintén fontos, hogy:</p>
<p style="text-align: justify;">2/B) A támogatói okirat kézhezvétele után elindul a megvalósítási időszak. Az üzemmérettel pályázó gazdák vállalták, hogy üzemméretük az 5 év alatt egyik évben sem esik 3000 euró STÉ alá. Tehát a nyertes pályázónak a 2021-es évben sem lehet ennél kisebb üzemmérete. Kérjük, figyeljenek oda, hogy legalább a pályázáskor meglévő területeiket és/vagy állatállományukat folyamatosan tartsák fent!</p>
<p style="text-align: justify;">Az árbevétel vagy üzemméret 3 000 euró alá csökkenése az eddig kiutalt támogatás teljes visszafizetését vonhatja maga után. Amennyiben ilyen helyzetbe kerülnének, kérjük, azonnal vegyék fel a kapcsolatot szaktanácsadó kollégáinkkal!</p>
<p style="text-align: justify;">3) A támogatói okirat kézhezvétele után 9 hónapon belül meg kell kezdeni a projektet, tehát a megkapott támogatási összeget el kell kezdeni felhasználni. A felhasznált összegről igazoló dokumentummal kell rendelkezni, amit majd a későbbiekben a MÁK részére be kell tudni mutatni. Igazoló dokumentumok: számla, adásvételi szerződés, szállítólevél stb..</p>
<p style="text-align: justify;">A vállalások teljes listáját jelen levelünk mellékletében olvashatják. Kérjük, a fent részletezett vállalásokra minden évben kiemelten figyeljenek!</p>
<p style="text-align: justify;"><a href="/kapcsolat">Kérdés esetén bátran keressék kollégáinkat!</a></p>', NULL, NULL, NULL, NULL, NULL),
  ('post-fd1hkbh0b', 'blog', 'Pályázat vidéki turizmus fejlesztésére', 'Pályázatok', 'Mitruné Tóth Krisztina', '2021.10.27.', '/images/videki-turizmus-fejlesztese.jpg', 'A Magyar Államkincstár honlapján elérhetővé tették a Nem mezőgazdasági tevékenységek diverzifikációja – Vidéki turizmus fejlesztése című pályázat tervezetét. A dokumentum még nem végleges, de várhatóan számottevően nem fog változni a tartalma. Mivel a pályázat jelentős előkészületet igényel, ezért jelen cikkünk célja a tájékoztatáson felül az igényfelmérés, és az elképzelt fejlesztésekről való egyeztetés megkezdése. &#160; Milyen ...', '<p style="text-align: justify;"><strong>A Magyar Államkincstár honlapján elérhetővé tették a Nem mezőgazdasági tevékenységek diverzifikációja – Vidéki turizmus fejlesztése című pályázat tervezetét. A dokumentum még nem végleges, de várhatóan számottevően nem fog változni a tartalma. Mivel a pályázat jelentős előkészületet igényel, ezért jelen cikkünk célja a tájékoztatáson felül az igényfelmérés, és az elképzelt fejlesztésekről való egyeztetés megkezdése.</strong></p>
<p>&nbsp;</p>
<h4><strong>Milyen fejlesztésekkel lehet pályázni?</strong></h4>
<p style="text-align: justify;">A pályázat keretében az alábbi építési tevékenységek támogathatóak önállóan. Akár több tevékenység is választható, azonban minimum 1 db megvalósítása kötelező a projekt keretében:</p>
<p style="text-align: justify;">• a) Újonnan építendő szálláshely létesítése: olyan új épület építése, ami érvényes szálláshely-üzemeltetési engedéllyel rendelkező szálláshelyez nem kapcsolódik.</p>
<p style="text-align: justify;">• b) Újonnan kialakítandó szálláshely létesítése: olyan épület felújítása és/vagy bővítése, amely a támogatási kérelem benyújtásakor nem rendelkezik érvényes szálláshely-üzemeltetési engedéllyel.</p>
<p style="text-align: justify;">• c) Meglévő szálláshely épületének fejlesztése és/vagy bővítése: olyan épület fejlesztése és/vagy bővítése, amely a támogatási kérelem benyújtásakor érvényes szálláshely-üzemeltetési engedéllyel rendelkezik.</p>
<p style="text-align: justify;">• d) Meglévő szálláshely bővítése új épülettel: a támogatási kérelem benyújtásakor érvényes szálláshely-üzemeltetési engedéllyel rendelkező szálláshely bővítése:<br />
– új épület építése;<br />
– olyan épület fejlesztése és/vagy bővítése, amely a támogatási kérelem benyújtásakor érvényes szálláshely-üzemeltetési engedéllyel nem rendelkezik.</p>
<p style="text-align: justify;">A pályázat keretében az alábbi tevékenységek önállóan nem, csak valamely önállóan támogatható tevékenységgel együtt támogathatóak:<br />
• a) Kiegészítő turisztikai szolgáltatás elindításához és/vagy továbbfejlesztéséhez szükséges épület/ek vagy építmény/ek építése.<br />
• b) Kiegészítő turisztikai szolgáltatás elindításához és/vagy továbbfejlesztéséhez szükséges eszközök beszerzése.<br />
• c) Megújuló energiaforrást hasznosító technológiák kialakítása a projekt által érintett épület tekintetében.<br />
• d) A támogatott tevékenységekhez kapcsolódó eszközbeszerzés (pl.: szobák és közös helyiségek berendezési tárgyai, konyha és tálaló helyiség eszközei és bútorai stb.).<br />
• e) Az általános költségekhez kapcsolódó tevékenységek.<br />
• f) Ingatlan vásárlása.<br />
• g) Számítástechnikai eszközök és digitális okmányolvasók beszerzése.<br />
• h) A szálláshelyhez közvetlenül kapcsolódó, telekhatáron belüli út, járda, parkoló kialakítása.<br />
• i) Vagyonvédelmet célzó beruházások.<br />
• j) Kiegészítő infrastruktúra kiépítése (pl.: játszótér kialakítása, kertépítés).<br />
• k) Immateriális javak beszerzése.</p>
<p style="text-align: justify;">A pályázat keretében nem támogatható &#8211; többek között &#8211; mezőgazdasági tevékenységhez kapcsolódó beruházások, élő állatok és mezőgazdasági/gazdasági célt szolgáló növények beszerzése, a motorral hajtott szárazföldi, légi, vízi közlekedési jármű, erőgép beszerzése vagy a lakófunkciót ellátó épületrész fejlesztése.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;"><strong>Ki pályázhat?</strong></h4>
<p style="text-align: justify;">A pályázatra az a mezőgazdasági termelő adhat be kérelmet, aki igazolja, hogy székhelye/telephelye legalább a támogatási kérelem benyújtását megelőző 12 hónapban vidéki térségekben elhelyezkedő településen van, illetve a támogatási kérelem benyújtását megelőző (vagy az utolsó lezárt) évben az árbevételének legalább 50%-a mezőgazdasági tevékenységből származott.</p>
<p>&nbsp;</p>
<h4><strong>Milyen mértékben igényelhető a támogatás?</strong></h4>
<p style="text-align: justify;">Az igényelhető vissza nem térítendő támogatás összege maximum 100 millió forint. A pályázat utófinanszírozásos, a támogatás intenzitása a megvalósítási helyszíntől függ, amit a kedvezményezett járások besorolásáról szóló 290/2014 (XI.26.) Korm rendelet szabályoz:</p>
<p style="text-align: justify;">• A nem besorolható járásban lévő település esetén 50%.<br />
• A “kedvezményezett” járásban lévő település esetén 60%.<br />
• A “fejlesztendő” és “komplex programmal fejlesztendő” járásban lévő településen 70%.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;"><strong>Mikor indul a pályázat?</strong></h4>
<p style="text-align: justify;">A támogatási kérelmek benyújtásának határideje a tervezet szerint:<br />
Első szakasz: 2021. december 8. – 2021. december 22.<br />
Második szakasz: 2022. január 12. – 2022. január 26.<br />
Harmadik szakasz: 2022. január 27. – 2022. február 10.<br />
Negyedik szakasz: 2022. március 23. – 2022. április 6.<br />
Ötödik szakasz: 2022. április 7. – 2022. április 21.</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;"><strong>Hol kérhetek segítséget a pályázathoz?</strong></h4>
<p style="text-align: justify;">Amennyiben érdeklődik a pályázat iránt, kérjük, vegye fel kapcsolatot kollégáinkkal!</p>
<p><span style="text-decoration: underline;"><strong>Elérhetőségeink:</strong></span></p>
<p style="text-align: justify;"><strong>Nyíregyházi iroda:</strong><br />
Jávor Vivien: 30/750-5965<br />
Ungvári Enikő: 30/786-7133<br />
Benke László: 30/557-1656<br />
Sápi Imre: 30/559-7376<br />
Kozák Dávid: 20/548-4948<br />
Moravszki Gábor: 30/346-2848</p>
<p style="text-align: justify;"><strong>Kisvárdai iroda:</strong><br />
Pokol Roland: 30/560-1366<br />
Liptai Dalma: 30/440-2705</p>
<p style="text-align: justify;"><strong>Tarpai iroda:</strong><br />
Benke László 30/557-1656<br />
Sápi Imre 30/559-7376</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-f4kgle22z', 'blog', 'Megjelent a Tavaszi fagykár megelőzésére szolgáló beruházások támogatása című pályázat', 'Pályázatok', 'Mitruné Tóth Krisztina', '2021.10.22.', '/images/Mezogazdasagi-kisuzemek-tamogatasa-980x661.jpg', 'Megjelent a Tavaszi fagykár megelőzésére szolgáló beruházások támogatása című pályázat. A pályázat támogatási intenzitása 80%!  Amennyiben érdeklődsz a pályázat iránt, kérünk, vedd fel a kapcsolatot kollégáinkkal. &#160; Milyen tevékenységekre kérhető a támogatás? A pályázat keretében az alábbi tevékenységek támogathatóak: Tavaszi fagykár megelőzését szolgáló eszköz, berendezés, technológia beszerzése és telepítése: rögzített (telepített) vagy mobil (áttelepíthető) légkeverő ...', '<p style="text-align: justify;">Megjelent a <strong>Tavaszi fagykár megelőzésére szolgáló beruházások támogatása</strong> című pályázat. A pályázat támogatási intenzitása 80%!  Amennyiben érdeklődsz a pályázat iránt, kérünk, vedd fel a kapcsolatot kollégáinkkal.</p>
<p>&nbsp;</p>
<h4><strong>Milyen tevékenységekre kérhető a támogatás?</strong></h4>
<p style="text-align: justify;">A pályázat keretében az alábbi tevékenységek támogathatóak:</p>
<p style="text-align: justify;">Tavaszi fagykár megelőzését szolgáló eszköz, berendezés, technológia beszerzése és telepítése: rögzített (telepített) vagy mobil (áttelepíthető) légkeverő berendezések, autonóm hőtermelő berendezések (fagyvédelmi kályhák, más fűtőberendezések), továbbá vontatott hőtermelő vagy légkeverő gépek (füstölő, ködképző berendezések, légkeverő, valamint fagyvédelmi gépek).</p>
<p style="text-align: justify;">A pályázat keretében kiegészítőleg támogathatóak az alábbi tevékenységek:<br />
• vagyonvédelmi eszközök beszerzése: kamerarendszer, tároló konténer,<br />
• legalább a levegő hőmérséklet és páratartalom mérésére alkalmas meteorológiai adatgyűjtő állomás kialakítása.</p>
<p style="text-align: justify;">A pályázat keretében nem támogatható a fagyvédelmi gyertya beszerzése, a jégeső-elhárító rendszer kiépítése és az aszály kárnemhez kapcsolódó beruházás.</p>
<p>&nbsp;</p>
<h4><strong>Kik pályázhatnak?</strong></h4>
<p style="text-align: justify;">A támogatás utófinanszírozásos, intenzitása minden pályázó esetében 80%. A pályázatra az a mezőgazdasági termelő adhat be kérelmet, aki igazolja, hogy legalább 6000 euró STÉ üzemmérettel rendelkezik, illetve a támogatási kérelem benyújtását megelőző évben az árbevételének legalább 50%-a mezőgazdasági tevékenységből származott.</p>
<p>&nbsp;</p>
<h4><strong>A pályázat határideje</strong></h4>
<p style="text-align: justify;">A támogatási kérelmek benyújtásának határideje:<br />
Első szakasz:<br />
2021. november 17. &#8211; 2021. november 30.<br />
A többi szakasz az előző lezárása után egy nappal automatikusan nyílik 2 hetes időtartamra egészen a pályázat felfüggesztéséig, de legkésőbb 2022. január 11-ig.</p>
<p style="text-align: justify;">Amennyiben érdeklődsz a pályázat iránt, vedd fel a kapcsolatot kollégáinkkal!</p>
<p>&nbsp;</p>
<h4 style="text-align: justify;"><strong>Elérhetőségeink</strong></h4>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;">Nyíregyházi iroda:</span></p>
<p style="text-align: justify;">Jávor Vivien: 30/750-5965</p>
<p style="text-align: justify;">Ungvári Enikő: 30/786-7133</p>
<p style="text-align: justify;">Benke László: 30/557-1656</p>
<p style="text-align: justify;">Sápi Imre: 30/559-7376</p>
<p style="text-align: justify;">Kozák Dávid: 20/548-4948</p>
<p style="text-align: justify;">Moravszki Gábor: 30/346-2848</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;">Kisvárdai iroda:</span></p>
<p style="text-align: justify;">Pokol Roland: 30/560-1366</p>
<p style="text-align: justify;">Liptai Dalma: 30/440-2705</p>
<p>&nbsp;</p>
<p style="text-align: justify;"><span style="text-decoration: underline;">Tarpai iroda:</span></p>
<p style="text-align: justify;">Benke László: 30/557-1656</p>
<p style="text-align: justify;">Sápi Imre: 30/559-7376</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-0d611tj7x', 'blog', 'Hamarosan indulnak az AKG és ÖKO programok', 'Pályázatok', 'Mitruné Tóth Krisztina', '2021.10.14.', '/images/valtozasok_a_novenyvedelemben.jpg', 'Mint ahogy előző cikkbünkben is írtuk, új AKG és ÖKO programok indulnak 3 éves kötelezettségvállalási időszakkal, melynek időpontja: 2022. január 1. &#8211; 2024. december 31. Területméréssel kapcsolatos információk A pályázó a támogatásba bevonni kívánt területeit köteles területmérés alapján beazonosítani és a koordinátákat a támogatási kérelem során megadni. Azokkal a területekkel, amelyek már most is szerepelnek ...', '<p style="text-align: justify;">Mint ahogy előző cikkbünkben is írtuk, új AKG és ÖKO programok indulnak 3 éves kötelezettségvállalási időszakkal, melynek időpontja:</p>
<p style="text-align: center;"><strong>2022. január 1. &#8211; 2024. december 31.</strong></p>
<h4></h4>
<h3 style="text-align: justify;">Területméréssel kapcsolatos információk</h3>
<p style="text-align: justify;">A pályázó a támogatásba bevonni kívánt területeit köteles területmérés alapján beazonosítani és a koordinátákat a támogatási kérelem során megadni. Azokkal a területekkel, amelyek már most is szerepelnek az AKG vagy ÖKO programban, nincs teendő, mivel már korábban lemérésre kerültek. Új területek bevonása esetén vagy teljesen új belépőnek azonban mindenképpen szükségesek a mérések. A méréseket döntő többségben külsős partnerünk, Farkas Tímea fogja végezni. Amennyiben igényt tart területmérésre, kérjük, vegye fel vele a kapcsolatot.</p>
<h3 style="text-align: justify;">A pályázatok beadásával kapcsolatos információk</h3>
<p style="text-align: justify;">A támogatási kérelmek benyújtására külön pályázat formájában lesz lehetőség 2021. október 25. és 2021. november 25. között. A pályázatok beadása külön díjazással fog történni, áraink kérelmenként a következőképpen alakulnak:</p>
<p style="text-align: justify;">AKG/ÖKO ültetvény célprogram:</p>
<p style="text-align: justify;">1-3 tábláig: 25 000 Ft + áfa<br />
4-8 tábláig: 50 000 Ft + áfa<br />
9 tábla felett: 75 000 Ft + áfa</p>
<p style="text-align: justify;">AKG/ÖKO szántó, gyep célprogramok:</p>
<p style="text-align: justify;">1-5 tábláig: 6 000 Ft + áfa/tábla<br />
6-15 tábláig: 5 000 Ft + áfa/tábla<br />
16-25 tábláig: 4 000 Ft + áfa/tábla<br />
26 tábla felett: 3 000 Ft + áfa/tábla</p>
<p style="text-align: justify;">A közelgő határidő miatt amennyiben részt kívánnak venni az AKG vagy az ÖKO programokban, akkor kérjük, szíveskedjenek minél hamarabb <a href="/kapcsolat">szaktanácsadó kollégáinknak jelezni</a> és a pályázásról az egyeztetéseket megkezdeni.</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-qs5v41yta', 'blog', 'Megjelent az AKG és ÖKO pályázatok végleges verziója', 'Pályázatok', 'Mitruné Tóth Krisztina', '2021.09.27.', '/images/Megjelent-az-elso-kartevo-az-almasokban-indulhat-a-vedekezes-1080x675.jpg', 'A Magyar Államkincstár honlapján megjelent a végleges verziója az új AKG és ÖKO pályázatoknak. Az előzetes információknak megfelelően mindkét program esetében 3 éves kötelezettségvállalási időszakra lehet majd pályázni, melynek pontos időpontja: 2022. január 1. &#8211; 2024. december 31. A kiírásra kerülő programok szabályrendszere alapvetően megegyezik a jelenleg is futó és év végén lejárókkal, azokban tartalmilag ...', '<p style="text-align: justify;">A Magyar Államkincstár honlapján megjelent a végleges verziója az új AKG és ÖKO pályázatoknak. Az előzetes információknak megfelelően mindkét program esetében 3 éves kötelezettségvállalási időszakra lehet majd pályázni, melynek pontos időpontja:</p>
<p style="text-align: center;"><strong>2022. január 1. &#8211; 2024. december 31.</strong></p>
<p style="text-align: justify;">A kiírásra kerülő programok szabályrendszere alapvetően megegyezik a jelenleg is futó és év végén lejárókkal, azokban tartalmilag csak kisebb eltérések vannak, a támogatási összegek viszont megemelésre kerültek és a támogatható pályázatok száma is nagyobb lesz.</p>
<p style="text-align: justify;">AKG esetében a Tematikus előíráscsoportok (TECS) rendszere megmarad, ezek közül a partnerkörünkben a leginkább gyakoriak:<br />
&#8211; horizontális szántó;<br />
&#8211; horizontális gyep;<br />
&#8211; horizontális ültetvény;<br />
&#8211; zonális MTÉT szántó alföldi madárvédelmi előírásokkal.</p>
<p style="text-align: justify;">Az AKG tematikus előíráscsoportokon belül lesznek kötelező és szabadon választható előírások, ezek közül szükséges a pályázónak csomagot kialakítania és azzal pályáznia. Az előírásokat a gazdának be kell tartania, azokon 3 évig módosítani nem lesz lehetséges.</p>
<p style="text-align: justify;">Az ÖKO programon belül is megmarad a Tematikus előíráscsoportok rendszere. Ott viszont csak kötelező előírások lesznek.</p>
<p style="text-align: justify;">Cikkünkben mindkét program részleteibe nem tudunk belemenni, azokhoz minden gazdával személyes egyeztetés szükséges. Néhány szabályra azonban már most felhívjuk a figyelmet:</p>
<p style="text-align: justify;">&#8211; A támogatást igénylőnek minden kötelezettségvállalással érintett egybefüggő területének (KET) teljes egészére, a teljes időtartam alatt, az adott év minden napjára vonatkozóan jogszerű földhasználónak kell lennie.&#8211; Minden művelési ág esetében a pályázható minimális terület összesen 1 hektár, táblaszinten minimum 0,25 hektár.<br />
&#8211; FONTOS VÁLTOZÁS a tervezethez képest: AKG ültetvény esetében az ültetvény életkora a pályázat benyújtásának időpontjában nem lehet több mint 26 év (kivéve dió,<br />
gesztenye, szőlő).<br />
&#8211; AKG és ÖKO gyep esetében kötelező az állatállomány megléte minimium 0,2 állategység/hektár sűrűségben.<br />
&#8211; A pályázó a támogatásba bevonni kívánt területeit köteles területmérés alapján beazonosítani és a koordinátákat a támogatási kérelem során megadni. A korábban lemért területekkel nincs teendő, új területek bevonása esetén vagy teljesen új belépőnek azonban mindenképpen szükségesek a mérések. A mérésekkel kapcsolatban hamarosan külön írunk.</p>
<p style="text-align: justify;">A támogatási kérelmek benyújtására a 2021. október 25. és 2021. november 25. között lesz lehetőség. A közelgő határidő miatt amennyiben részt kívánnak venni az AKG vagy az ÖKO program valamelyikében, azt kérjük, szíveskedjenek minél hamarabb szaktanácsadó kollégáinknak jelezni és a pályázásról az egyeztetéseket megkezdeni.</p>
<p style="text-align: justify;">Szeretnénk felhívni a figyelmüket, hogy az új AKG és ÖKO programokra minden gazda esetén külön pályázat beadása szükséges, amelyet a szaktanácsadási alapszolgáltatás és az éves díj nem tartalmaz, ezekről a díjakról külön tájékoztatjuk majd Önöket.</p>
<p style="text-align: justify;">Amennyiben érdeklődik a pályázatok iránt, kérjük, <a href="/kapcsolat">vegye fel kapcsolatot</a> kollégáinkkal!</p>', NULL, NULL, NULL, NULL, NULL),
  ('post-8w89si7fb', 'blog', 'Moravszki Gábor kapta az Agrárminisztérium és a Holland Nagykövetség szaktanácsadói különdíját', 'Díjak és kitüntetések', 'Mitruné Tóth Krisztina', '2019.09.30.', '/images/kituntettek-moravszki-gabort-980x654.jpg', 'Az idei OMÉK mottója a „fejlődés hagyománya”; az innováció, a precíziós gazdálkodás a jövő része, és már most is jelen van. Mindez fontos szerepet játszik majd abban, hogy hogyan lehet fenntartható módon a jelenleginél több élelmet termelni – mondta el a Magyar Mezőgazdaságnak a Budapesti Holland Nagykövetség mezőgazdasági attaséja az OMÉK-on. Geert Kits Nieuwenkamp már ...', '<p style="text-align: justify;">Az idei OMÉK mottója a „fejlődés hagyománya”; az innováció, a precíziós gazdálkodás a jövő része, és már most is jelen van. Mindez fontos szerepet játszik majd abban, hogy hogyan lehet fenntartható módon a jelenleginél több élelmet termelni – mondta el a Magyar Mezőgazdaságnak a Budapesti Holland Nagykövetség mezőgazdasági attaséja az OMÉK-on.</p>
<p style="text-align: justify;">Geert Kits Nieuwenkamp már a két évvel ezelőtti OMÉK-ra is kilátogatott, az idei kiállításon pedig már hivatalos programokon is részt vett. Kiemelte, hogy a megnyitó után Nagy István agrárminiszterrel együtt ő is bejárta a kiállítást, ami nagyon érdekesnek talált. Hozzátette: Örömmel hallotta, hogy Nagy István is utalt beszédében a digitális mezőgazdaságra, mivel az idei OMÉK mottója a „fejlődés hagyománya” és az innováció, a precíziós gazdálkodás a jövő része, és már most is jelen van. A technológia nagy szerepet játszik majd abban, hogy hogyan lehet fenntartható módon a jelenleginél több élelmet termelni.</p>
<p style="text-align: justify;">Geert Kits Nieuwenkamp az OMÉK keretében az Agrárminisztérium és a Holland Nagykövetség szaktanácsadói különdíját is átadta, amelyet Moravszki Gábor kapott. Az attasé hangsúlyozta, reméli, hagyományt teremtenek a díjjal.</p>
<p style="text-align: justify;">A holland szaktanácsadói rendszerrel kapcsolatban azt emelte ki, hogy ők máshogyan közelítik meg a tanácsadókat, mert Hollandiában mindent privatizáltak, és az az alapelvük, hogy minden lehetséges dolgot egyedileg, állami segítség nélkül oldanak meg, az állam pedig a speciális feladatok megoldásával foglalkozik.</p>
<p style="text-align: justify;">A „lánc” végén minden gazdálkodó megkapja az általa igényelt tanácsot az őt érdeklő témában, de ezért – direkt vagy közvetett módon – fizetnie kell. Ez azzal is együtt jár, hogy a farmerek komolyabban is veszik a tanácsot, mert nem ingyen kapták.</p>
<p style="text-align: justify;">Jelenleg arról folyik a diskurzus Hollandiában, hogyan lehetne a gazdákat rábírni arra, hogy a körforgásos mezőgazdaság keretében fenntarthatóbb módon termeljenek. Mivel a kormánynak nincsenek tanácsadói, most azt szeretnék kitalálni, hogy hogyan lehet összekötni az elméletet, a kormányzati célokat a gyakorlati megvalósítással.</p>
<p style="text-align: right;">Forrás: magyarmezőgazdaság.hu</p>', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  price = EXCLUDED.price,
  badge = EXCLUDED.badge,
  updated_at = NOW();
