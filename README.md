# GameCrit — Platforma za recenzije video igara

---

## 1. Opis projekta

### Što aplikacija rješava?

GameCrit je web aplikacija gdje korisnici mogu pisati i čitati recenzije video igara. Ideja mi je došla jer često ne znam koju igru kupiti ili preuzeti, a recenzije na velikim stranicama kao što su IGN ili Metacritic mi ne pomažu puno jer ih pišu profesionalci koji nekad drugačije gledaju na igre nego obični igrači. Htio sam napraviti nešto gdje normalni ljudi mogu napisati što misle o nekoj igri, dati joj ocjenu i pomoći drugima da odluče je li igra vrijedna njihovog vremena.

Aplikacija funkcionira tako da svaki korisnik može pretražiti igru, vidjeti prosječnu ocjenu koju su dali drugi korisnici i pročitati njihove recenzije. Ako želi ostaviti svoju recenziju, treba se registrirati. Ocjena ide od 1 do 10 i uz nju može napisati kraći tekst s mišljenjem. Sve recenzije za jednu igru se automatski zbroje i izračuna se prosječna ocjena koja se prikazuje na stranici igre.

Htio sam da aplikacija bude jednostavna za korištenje. Nije mi cilj napraviti nešto jako komplicirano nego nešto što stvarno ima smisla i što bi netko mogao koristiti. Dizajn će biti taman i gaming, slično kao što izgledaju stranice poput Steama.

Osim pisanja recenzija, korisnik može urediti ili obrisati svoju recenziju ako promijeni mišljenje. Na profilu može vidjeti sve recenzije koje je napisao. Administrator može brisati recenzije koje nisu primjerene i dodavati nove igre u bazu podataka.

### Tko su korisnici?

Aplikaciju bi koristili uglavnom mlađi ljudi koji igraju video igre i žele podijeliti mišljenje ili pročitati što drugi misle prije nego kupe neku igru. Dakle, slični meni — srednjoškolci ili studenti koji prate gaming scenu.

Postoje tri vrste korisnika u aplikaciji:
- **Gosti** — mogu gledati igre i čitati recenzije, ali ne mogu pisati
- **Registrirani korisnici** — mogu pisati, mijenjati i brisati svoje recenzije, imaju profil
- **Administratori** — mogu brisati tuđe recenzije i dodavati igre u bazu

### Zašto sam odabrao ovu temu?

Odabrao sam recenzije video igara jer me ta tema osobno zanima i motivira me više nego da radim nešto generično. Uz to, tema je tehnički dobra za ovaj projekt jer ima sve što treba pokriti — prijavu korisnika, čitanje i pisanje podataka u bazu, različite uloge i responzivni dizajn. Podaci su jasno strukturirani: postoje igre, korisnici i recenzije, što je savršeno za Firestore.

Mislim da bi ova aplikacija mogla biti korisna i u stvarnom životu, a ne samo kao školski projekt. To mi je bio dodatni razlog za odabir ove teme.

---

## 2. Popis funkcionalnosti

### Osnovne funkcionalnosti

- [ ] Registracija korisnika (email i lozinka)
- [ ] Prijava i odjava
- [ ] Oporavak zaboravljene lozinke
- [ ] Prikaz popisa igara
- [ ] Stranica pojedine igre s opisom i recenzijama
- [ ] Pisanje recenzije (ocjena 1–10 i tekst)
- [ ] Uređivanje vlastite recenzije
- [ ] Brisanje vlastite recenzije
- [ ] Automatski izračun prosječne ocjene igre
- [ ] Korisnički profil s pregledom vlastitih recenzija
- [ ] Uloge korisnika (obični korisnik i administrator)
- [ ] Administrator može obrisati bilo koju recenziju
- [ ] Administrator može dodati novu igru
- [ ] Responzivni dizajn (radi na mobitelu i računalu)
- [ ] Objava putem Firebase Hostinga

### Napredne funkcionalnosti

- [ ] Pretraživanje igara po nazivu
- [ ] Filtriranje igara po žanru
- [ ] Sortiranje recenzija po datumu ili ocjeni
- [ ] Označavanje igara kao "Igram" ili "Odigrao"
- [ ] Glasanje je li recenzija korisna
- [ ] Admin statistike (broj igara, korisnika, recenzija)

---

## 3. Scenariji korištenja

### Scenarij 1 — Gost pregledava igre

1. Korisnik otvori stranicu i vidi popis igara na naslovnici
2. Klikne na igru koja ga zanima
3. Otvori se stranica te igre s opisom, prosječnom ocjenom i recenzijama
4. Može čitati recenzije bez registracije
5. Ako želi napisati recenziju, vidi poruku da se treba registrirati

### Scenarij 2 — Novi korisnik se registrira i piše recenziju

1. Korisnik klikne na "Registracija"
2. Upiše email i lozinku i potvrdi
3. Firebase kreira račun i korisnik je automatski prijavljen
4. Pronađe igru i klikne "Napiši recenziju"
5. Odabere ocjenu od 1 do 10 i napiše tekst
6. Klikne spremi — recenzija se pojavi na stranici igre
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
2. U navigaciji mu se pojave dodatne opcije
3. Klikne "Dodaj igru", ispuni formu s nazivom, opisom, žanrom i godinom
4. Igra se pojavi u popisu za sve korisnike
5. Ako neka recenzija nije primjerena, admin je može obrisati iz admin panela

---

## 4. Struktura baze podataka (Firestore)

Kolekcija users:
- email (string)
- displayName (string)
- role — "user" ili "admin" (string)
- createdAt (timestamp)

Kolekcija games:
- title (string)
- description (string)
- genre (string)
- releaseYear (number)
- coverUrl (string)
- averageRating (number) — ažurira se automatski
- reviewCount (number)

Kolekcija reviews:
- gameId (string) — koja igra
- userId (string) — koji korisnik
- authorName (string)
- rating (number, 1–10)
- text (string)
- createdAt (timestamp)
- updatedAt (timestamp)

---

## 5. Vizualni prototip

![vizualni prototip](

Prikazuje sljedeće ekrane:
- Naslovnica s popisom igara
- Stranica pojedine igre s recenzijama
- Forma za pisanje recenzije
- Korisnički profil
- Stranica za prijavu i registraciju
- Admin panel
