# GameCrit — Platforma za recenzije video igara

---

## 1. Opis projekta

### Što aplikacija rješava?

GameCrit je web aplikacija gdje korisnici mogu pisati i čitati recenzije video igara. Ideja mi je došla jer često ne znam koju igru kupiti ili preuzeti, a recenzije na velikim stranicama kao što su IGN ili Metacritic mi ne pomažu puno jer ih pišu profesionalci koji nekad drugačije gledaju na igre nego obični igrači. Htio sam napraviti nešto gdje normalni ljudi mogu napisati što misle o nekoj igri, dati joj ocjenu i pomoći drugima da odluče je li igra vrijedna njihovog vremena.

Aplikacija funkcionira tako da svaki korisnik može pretražiti igru, vidjeti prosječnu ocjenu koju su dali drugi korisnici i pročitati njihove recenzije. Ako želi ostaviti svoju recenziju, treba se registrirati. Ocjena ide od 1 do 10 i uz nju može napisati kraći tekst s mišljenjem. Sve recenzije za jednu igru se automatski zbroje i izračuna se prosječna ocjena koja se prikazuje na stranici igre.

Htio sam da aplikacija bude jednostavna za korištenje. Nije mi cilj napraviti nešto jako komplicirano nego nešto što stvarno ima smisla i što bi netko mogao koristiti. Dizajn je taman i gaming, slično kao što izgledaju stranice poput Steama.

Osim pisanja recenzija, korisnik može urediti ili obrisati svoju recenziju ako promijeni mišljenje. Na profilu može vidjeti sve recenzije koje je napisao. Administrator može brisati recenzije koje nisu primjerene, dodavati nove igre u bazu podataka te uređivati i brisati postojeće igre.

### Tko su korisnici?

Aplikaciju bi koristili uglavnom mlađi ljudi koji igraju video igre i žele podijeliti mišljenje ili pročitati što drugi misle prije nego kupe neku igru. Dakle, slični meni — srednjoškolci ili studenti koji prate gaming scenu.

Postoje tri vrste korisnika u aplikaciji:
- **Gosti** — mogu gledati igre i čitati recenzije, ali ne mogu pisati
- **Registrirani korisnici** — mogu pisati, mijenjati i brisati svoje recenzije, imaju profil
- **Administratori** — mogu brisati tuđe recenzije, dodavati, uređivati i brisati igre

### Zašto sam odabrao ovu temu?

Odabrao sam recenzije video igara jer me ta tema osobno zanima i motivira me više nego da radim nešto generično. Uz to, tema je tehnički dobra za ovaj projekt jer ima sve što treba pokriti — prijavu korisnika, čitanje i pisanje podataka u bazu, različite uloge i responzivni dizajn. Podaci su jasno strukturirani: postoje igre, korisnici i recenzije, što je savršeno za Firestore.

Mislim da bi ova aplikacija mogla biti korisna i u stvarnom životu, a ne samo kao školski projekt. To mi je bio dodatni razlog za odabir ove teme.

---

## 2. Popis funkcionalnosti

### Osnovne funkcionalnosti

- [x] Registracija korisnika (email i lozinka)
- [x] Prijava i odjava
- [x] Oporavak zaboravljene lozinke
- [x] Prikaz popisa igara
- [x] Stranica pojedine igre s opisom i recenzijama
- [x] Pisanje recenzije (ocjena 1–10 i tekst)
- [x] Uređivanje vlastite recenzije
- [x] Brisanje vlastite recenzije
- [x] Automatski izračun prosječne ocjene igre
- [x] Korisnički profil s pregledom vlastitih recenzija
- [x] Uloge korisnika (obični korisnik i administrator)
- [x] Administrator može obrisati bilo koju recenziju
- [x] Administrator može dodati novu igru
- [x] Administrator može urediti i obrisati igru
- [x] Responzivni dizajn (radi na mobitelu i računalu)
- [ ] Objava putem Firebase Hostinga

### Napredne funkcionalnosti

- [x] Pretraživanje igara po nazivu i žanru
- [x] Admin statistike (broj igara i recenzija)
- [x] Indikator jačine lozinke pri registraciji
- [x] Oznaka ocjene s opisom (Prosječno, Dobro, Izvrsno...)
- [ ] Filtriranje igara po žanru
- [ ] Sortiranje recenzija po datumu ili ocjeni
- [ ] Označavanje igara kao "Igram" ili "Odigrao"
- [ ] Glasanje je li recenzija korisna

---

## 3. Scenariji korištenja

### Scenarij 1 — Gost pregledava igre

1. Korisnik otvori stranicu i vidi hero sekciju s gumbom "Pregledaj igre"
2. Klikne gumb i otvori se popis svih igara
3. Klikne na igru koja ga zanima
4. Otvori se stranica te igre s opisom, prosječnom ocjenom i recenzijama
5. Može čitati recenzije bez registracije
6. Ako želi napisati recenziju, vidi poruku da se treba registrirati

### Scenarij 2 — Novi korisnik se registrira i piše recenziju

1. Korisnik klikne na "Registracija"
2. Upiše korisničko ime, email i lozinku te potvrdi
3. Firebase kreira račun i korisnik je automatski prijavljen
4. Pronađe igru i klikne na nju
5. Povuče slider na željenu ocjenu od 1 do 10 i napiše tekst
6. Klikne "Objavi recenziju" — recenzija se pojavi na stranici igre
7. Prosječna ocjena igre se automatski ažurira

### Scenarij 3 — Korisnik mijenja ili briše recenziju

1. Prijavljeni korisnik ode na stranicu igre koju je recenzirao
2. Uz svoju recenziju vidi gumbe "Uredi" i "Obriši"

Ako uređuje:
3. Klikne "Uredi", forma se otvori s trenutnim tekstom i ocjenom
4. Promijeni što želi i spremi
5. Recenzija i prosječna ocjena se ažuriraju

Ako briše:
3. Klikne "Obriši" i pojavi se prozor za potvrdu
4. Potvrdi brisanje
5. Recenzija je obrisana i prosječna ocjena se preračuna

### Scenarij 4 — Korisnik je zaboravio lozinku

1. Na stranici prijave klikne "Zaboravili ste lozinku?"
2. Upiše svoju email adresu
3. Dobije email s linkom za resetiranje lozinke
4. Klikne link, upiše novu lozinku
5. Prijavi se s novom lozinkom

### Scenarij 5 — Administrator dodaje igru i moderira recenzije

1. Admin se prijavi sa svojim računom
2. U navigaciji mu se pojavi "Admin panel" opcija i badge "admin"
3. Klikne Admin panel, ispuni formu s nazivom, opisom, žanrom, godinom i URL naslovnice
4. Igra se pojavi u popisu za sve korisnike
5. Admin može urediti ili obrisati svaku igru iz popisa
6. Ako neka recenzija nije primjerena, admin je može obrisati iz sekcije moderacije

---

## 4. Struktura baze podataka (Firestore)

### Kolekcija `users`
| Polje | Tip | Opis |
|---|---|---|
| email | string | Email adresa korisnika |
| displayName | string | Korisničko ime |
| role | string | `"user"` ili `"admin"` |
| createdAt | timestamp | Datum registracije |

### Kolekcija `games`
| Polje | Tip | Opis |
|---|---|---|
| title | string | Naziv igre |
| description | string | Kratki opis igre |
| genre | string | Žanr (Akcija, RPG...) |
| releaseYear | number | Godina izlaska |
| coverUrl | string | URL slike naslovnice |
| averageRating | number | Prosječna ocjena (automatski) |
| reviewCount | number | Broj recenzija (automatski) |
| createdAt | timestamp | Datum dodavanja |

### Kolekcija `reviews`
| Polje | Tip | Opis |
|---|---|---|
| gameId | string | ID igre |
| gameTitle | string | Naziv igre (denormalizacija) |
| userId | string | ID korisnika |
| authorName | string | Ime autora |
| rating | number | Ocjena 1–10 |
| text | string | Tekst recenzije |
| createdAt | timestamp | Datum pisanja |
| updatedAt | timestamp | Datum izmjene |

---

## 5. Tehnološki stog

- **Frontend:** SolidJS (JavaScript ES6+)
- **Stil:** TailwindCSS + DaisyUI
- **Pozadina:** Firebase (Authentication, Firestore)
- **Hosting:** Firebase Hosting
- **Verzioniranje:** GitHub

---

## 6. Pokretanje projekta

```bash
# Instalacija ovisnosti
npm install

# Pokretanje razvojnog okruženja
npm run dev

# Build za produkciju
npm run build
```

### Postavljanje Firebase
1. Kreiraj projekt na [console.firebase.google.com](https://console.firebase.google.com)
2. Omogući Email/Password autentifikaciju
3. Kreiraj Firestore bazu
4. Kopiraj `.env.example` u `.env` i popuni Firebase ključeve

### Admin pristup
Nakon registracije, ručno promijeni `role` u Firestore konzoli:
`users/{uid}` → `role: "admin"`

---

## 7. Završna provjera — što je napravljeno

### ✅ Napravljeno
- Kompletna autentifikacija (registracija, prijava, odjava, reset lozinke)
- Uloge korisnika (user / admin)
- Korisnički profil s pregledom recenzija
- Popis igara s pretraživanjem
- Stranica pojedine igre s recenzijama
- Pisanje, uređivanje i brisanje recenzija
- Automatski izračun prosječne ocjene (Firestore transakcija)
- Admin panel — dodavanje, uređivanje i brisanje igara
- Admin panel — moderacija recenzija
- Responzivni dizajn
- Firestore sigurnosna pravila
- GitHub verzioniranje

### ❌ Nije napravljeno
- Firebase Hosting (objava)
- Filtriranje igara po žanru
- Sortiranje recenzija
- Označavanje igara kao "Igram" / "Odigrao"
- Glasanje za recenzije
