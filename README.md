# ☀️ Kesäbingo

Yhteinen nettisivu, jossa sinä ja kaverit täytätte samaa kesäbingoa: merkitsette
suorituksia, lisäätte ruutuun **kuvan ja kuvatekstin** ja seuraatte tulostaulusta
kuka on suorittanut mitäkin koko kesän ajan.

- 📋 Kaikilla **sama ruudukko**
- 🖼️ Lisää omaan ruutuun **kuva + kuvateksti**
- 👀 Katso kavereiden lappuja välilehdiltä
- 🏆 Tulostaulu päivittyy automaattisesti

---

## Asennus (n. 10 min, ilmainen)

Tarvitaan ilmainen **Supabase**-tili (tietokanta + kuvien tallennus).

### 1. Luo Supabase-projekti
1. Mene osoitteeseen <https://supabase.com> → **Start your project** → kirjaudu.
2. **New project** → anna nimi (esim. `kesabingo`) ja salasana → **Create**.
3. Odota ~1 min että projekti käynnistyy.

### 2. Luo tietokanta
1. Vasemmalta **SQL Editor** → **New query**.
2. Avaa tämän kansion tiedosto `schema.sql`, kopioi koko sisältö editoriin.
3. Paina **Run**. (Tämä luo taulut, oikeudet ja 25 esimerkkitehtävää.)

### 3. Luo kuvakansio (Storage)
1. Vasemmalta **Storage** → **New bucket**.
2. Nimi: **`bingo`** (täsmälleen tämä).
3. Laita **Public bucket** päälle → **Create bucket**.
   *(Oikeudet asetettiin jo `schema.sql`:ssä.)*

### 4. Kopioi avaimet sivulle
1. Vasemmalta **Project Settings** (ratas) → **API**.
2. Kopioi **Project URL** ja **anon public** -avain.
3. Avaa tiedosto `config.js` ja liitä ne paikoilleen:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi...",
   ```

### 5. Testaa omalla koneella
Avaa `index.html` selaimessa (tuplaklikkaus). Kirjoita nimesi ja kokeile.

---

## Julkaise kavereille (valitse yksi)

Jotta kaverit pääsevät samaan osoitteeseen, sivu pitää laittaa nettiin. Helpoin:

### Netlify Drop (helpoin, ei tiliä pakko)
1. Mene <https://app.netlify.com/drop>.
2. Raahaa **koko `kesäbingo`-kansio** sivulle.
3. Saat osoitteen (esim. `https://kesabingo-123.netlify.app`) → jaa kavereille.

> Päivitä myöhemmin tehtäviä tai tyyliä? Raahaa kansio uudestaan.

### Muut vaihtoehdot
- **Vercel**: <https://vercel.com> → import / drag & drop.
- **GitHub Pages**: laita tiedostot repoon → Settings → Pages.

Kaikki jakavat saman Supabase-kannan, joten näette toistenne suoritukset reaaliajassa.

---

## Käyttö
- **Kirjaudu** nimelläsi (tallentuu selaimeen — "vaihda" vaihtaa nimen).
- **Oma lappu**: napauta ruutua → valitse kuva, kirjoita kuvateksti → *Merkitse suoritetuksi*.
- **Kavereiden laput**: valitse nimi yläpalkin välilehdiltä.
- **Muokkaa tehtäviä**: alhaalla "✏️ Muokkaa tehtäviä" — yksi tehtävä per rivi.
  Muutos koskee kaikkia (yhteinen ruudukko).

## Vinkkejä
- Ruudukko muotoutuu tehtävien määrän mukaan (esim. 25 → 5×5, 16 → 4×4).
- Halutessasi vaihda esimerkkitehtävät omiisi heti "Muokkaa tehtäviä" -napista
  tai muokkaamalla `schema.sql`:n lopun listaa ennen ajamista.

## Turvallisuus
Tämä on tarkoitettu **kaveriporukan kesken**: kuka tahansa linkin saanut voi
lisätä suorituksia ja muokata tehtäviä (ei salasanoja). Älä laita arkaluontoista
sisältöä. Linkkiä kannattaa jakaa vain omalle porukalle.
