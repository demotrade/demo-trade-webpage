# Vercel Deployment & Git Workflow — Demo-Trade Webpage

Ez a dokumentum részletesen rögzíti a weboldal verziókezelési, élesítési és automatizálási folyamatát.

---

## 🚀 1. Működési Folyamat (Automatikus Élesítés Dual-Push-sal)

A rendszer mostantól **teljesen automatikusan** működik:

- **Biztonsági mentés (Saját Git):** `https://github.com/rekalaca/Trade-Webpage.git`
- **Céges tároló (DemoTrade Git):** `https://github.com/demotrade/demo-trade-webpage.git`
- **Élesítés (Vercel):** A weboldal a Demo Trade céges Vercel fiókjában automatikusan buildelődik a `demotrade/demo-trade-webpage` `main` ágának változásakor (`demotradekft.hu`).

---

### A napi munka menete (Szuper egyszerű):

Csak a szokásos git parancsokat kell használnod:

```bash
git add .
git commit -m "Frissítések leírása"
git push
```

#### Mi történik a háttérben egyetlen `git push` hatására?
1. Feltöltődik a kód a **saját GitHubodra** (`rekalaca/Trade-Webpage`).
2. Feltöltődik a kód a **céges GitHubra** (`demotrade/demo-trade-webpage`).
3. A Vercel **másodperceken belül automatikusan felépíti és élesíti** a `demotradekft.hu` oldalt.

---

## ⚡ 2. Vercel Összekapcsolás Lépései (Egyszeri beállítás)

Ha a Vercelen még nincs összekötve a GitHub tároló:

1. Nyisd meg a [vercel.com](https://vercel.com) felületet a Demo Trade céges fiókkal.
2. Kattints a **demo-trade-webpage** projektre.
3. Menj a felső menüben a **Settings** ➔ **Git** menüpontba.
4. A **Connected Git Repository** résznél válaszd ki a **`demotrade/demo-trade-webpage`** tárolót (Branch: `main`).
5. Kész! Innentől kezdve minden push automatikusan élesíti a weboldalt.

---

## 🌐 3. DNS & Domain Beállítások (demotradekft.hu)

A tárhelyszolgáltatónál (Rackhost / Domain regisztrátor) az alábbi DNS rekordok mutatnak a Vercel szervereire:
- **A rekord (fő domain: `@`):** `76.76.21.21` (vagy `216.198.79.1`)
- **CNAME (www aldomain: `www`):** `cname.vercel-dns.com` (vagy `f1de239947a141df.vercel-dns-017.com`)

---

## 🔒 4. Biztonság: admin belépés és kulcsok (FONTOS)

**Hogyan működik most:** az admin felület belépése a Supabase Auth-ra épül (e-mail + jelszó). A jelszó
sehol nincs a kódban. Az írási jogot az adatbázis (RLS) adja: csak az `app_metadata.role = 'admin'`
felhasználó írhat / törölhet / tölthet fel képet. A Facebook-posztolás végpont (`/api/facebook-post`)
a bejelentkezési tokent ellenőrzi. Külön "képfeltöltő végpont" és titkos `service_role` kulcs már nincs.

### Egyszeri bevezetés – SORRENDBEN

1. **Admin felhasználó:** Supabase → Authentication → Users → *Add user* → *Create new user*
   (új, erős jelszó, "Auto Confirm User"). Authentication → Sign In / Providers → **kapcsold ki az "Allow new users to sign up" opciót**.
2. **Szerepkör:** futtasd le a `supabase_security_1_admin_role.sql` fájlt (előtte írd bele az admin e-mail címét).
3. **Vercel környezeti változók** (Project → Settings → Environment Variables), mind *Production*:
   - `SMTP_PASS` – az **új** Gmail alkalmazásjelszó (a régi nyilvános volt a kódban → vond vissza: Google-fiók → Biztonság → Alkalmazásjelszavak)
   - `SMTP_USER` – `demotradekft@gmail.com` (nem kötelező, ez az alapértelmezés)
   - `RECIPIENT_EMAIL` – a levelek címzettje (opcionális)
   - `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN` – Facebook posztoláshoz (ha használjátok)
   - *(opcionális)* `VITE_ADMIN_EMAIL` – az admin belépő űrlap előre kitöltött e-mail címe
4. **Élesítés (push)** – ez tartalmazza az új belépést.
5. **Zárolás:** futtasd le a `supabase_security_2_lockdown.sql` fájlt. A végén a lekérdezés a szabályokat listázza: nem lehet "anon" szerepkörű INSERT/UPDATE/DELETE/ALL szabály.
6. **Régi kulcsok érvénytelenítése** (a kódban nyilvánosan szerepeltek, a Git-előzményből nem törölhetők):
   - Supabase → Project Settings → API Keys: a régi `service_role` (JWT alapú) kulcsot tiltsd le / forgasd újra.
   - Gmail alkalmazásjelszó visszavonása (lásd fent).
7. **Ellenőrzés:** jelentkezz ki, és próbálj menteni → nem szabad menniük; jelentkezz be → menjen.

### Helyi fejlesztés
A `.env.local` fájlba (nincs a Gitben) tedd a `SMTP_PASS`, `FB_*` értékeket – a `vite.config.js` betölti őket.
