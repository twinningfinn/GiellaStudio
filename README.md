# GiellaStudio v0.1 — Classroom

Väliaikainen, kokonaan staattinen luokkahuoneversio. Oppilas avaa tehtävälinkin, tekee harjoitukset ja näyttää tuloksen opettajalle tai palauttaa PDF:n. Käyttöliittymässä pohjoissaame on ensisijainen, bokmål tukikieli ja espanja oppimissisällön kieli.

## Kahden viikon espanjapaketti 7.10.2026

- **Semana 1:** tervehdykset ja kuulumiset ("Estoy OK"), numerot 1–15, persoonapronominit ja Övingsheften sanasto. Osoite: `https://twinningfinn.github.io/GiellaStudio/espanja/8/semana-1/`.
- **Semana 2:** säännölliset AR-, ER- ja IR-verbit, ensin tuetut päätevalinnat ja sitten kokonaiset muodot, lopuksi kertaus. Osoite: `https://twinningfinn.github.io/GiellaStudio/espanja/8/semana-2/`.
- Työskentelyehdotus on kolme noin 15–20 minuutin kertaa kummallekin viikolle. Oppilas etenee omaan tahtiin. Viikkojen linkit jaetaan erikseen opettajasivulta; pakettien välille ei ole oppilaslinkkiä. Viikot eivät näy yleisessä oppilasluettelossa. Tämä ei estä pääsyä suoran linkin avulla.
- Lähtöaineisto on opettajan **espanol_geardduheapmi_ovingshefte1.pdf**, 11 sivua: sivut 2–3 tervehdykset, 4 numerot, 5 persoonapronominit, 6–8 verbit, 9 sanasto, 10 kuulumiset ja 11 verbimallit. Sivu 10 tarkistettiin kuvana: siinä lukee **Estoy OK**. Alkuperäistä vihkoa tai sen kuvia ei julkaista. Tehtävät ovat uusia sovelluksia näistä aiheista; Gente 8:n tehtäviä tai sivuja ei kopioida.
- Näillä kahdella paketilla `persistent: true` säilyttää vastaukset ja tarkistamattomat luonnokset saman laitteen selaimen `localStorage`-muistissa. Selaintietojen tyhjentäminen tai yksityistilan sulkeminen voi poistaa ne. Vastauksia ei lähetetä palvelimelle. Muiden pakettien välilehtikohtainen tallennus säilyy.
- **Lataa tehtävä-PDF ennen lähtöä.** Aloitussivun PDF-painike lataa tulostettavan, käsin täytettävän tehtävävihkon. Sivusto tarvitsee verkon avatessa. PDF:ssä on oppimisohjeet, vastaustilaa sekä erillinen itsearviointi ja vastausosa: ensin oma yritys, sitten tarkistus toisella värillä. Tulosta tarvittaessa vain tehtäväsivut.
- **Teams-palautus:** paperiversiosta kuvataan/skannataan täytetyt sivut yhdeksi PDF:ksi ja liitetään Teams-tehtävään yhteyden palattua. Verkkoversiossa kaikki tehtävät tehtyään oppilas tallentaa tulosraportin selaimen tulostuksella PDF:ksi ja palauttaa sen Teamsiin. Raportti sisältää vastaukset, yritykset ja käytetyn avun. EXTRA-vapaatekstin arvioi opettaja.
- Palaute on harjoittelupalautetta: vihjeet, uusi yritys ja mallivastaus kolmen virheen jälkeen. Pisteet kuvaavat tehtäväkierrosta, eivät varmennettua osaamistasoa. Uudet pohjoissaamen ohjetekstit on koottu kielentarkistustiedostoon.

Tulostettavat tiedostot: `output/pdf/espanol-semana-1.pdf` ja `output/pdf/espanol-semana-2.pdf`. Ne rakennetaan samasta tehtävädatasta komennolla `python tools/build-field-pdfs.py` (ReportLab, pypdf, Node.js ja Unicode-fontti tarvitaan). PDF-tiedostot ovat tarkoitukselliset poikkeukset yleiseen PDF-ohitukseen; paikalliset testitulosteet jäävät `_local`-kansioon.

## Käyttö

- Oppilaalle: `https://twinningfinn.github.io/GiellaStudio/espanja/8/mi-actividad-favorita/`
- Opettajalle: `https://twinningfinn.github.io/GiellaStudio/opettaja/`
- Etusivu: `https://twinningfinn.github.io/GiellaStudio/`

Osoitteet toimivat, kun GitHub Pages -julkaisu on valmis. Oppilaan ei tarvitse käydä etusivulla eikä kirjautua.

Ensimmäinen paketti **Mi actividad favorita** sisältää sanastovalinnan (4 kohtaa), kirjoitettavat AR-verbimuodot (3), dialogin ymmärtämisen (3) ja vapaaehtoisen EXTRA-vastauksen. Kesto on noin 10–15 minuuttia oppilaasta riippuen.

Pohjoissaamen **Bárrastávvalvearbbat** on jaettu neljään itsenäiseen pakettiin: **mannat, goarrut, viehkat ja boahtit**. Kunkin oma osoite on `https://twinningfinn.github.io/GiellaStudio/pohjoissaame/verbit/VERBI/`, missä VERBI korvataan verbin nimellä. Opettajasivu tarjoaa kaikille omat linkit ja QR-koodit. Suomeen ei vielä ole paketteja.

Jokainen verbipaketti säilyttää alkuperäisen prototyypin 9 persoonaa ja kolme vaihetta: valmis vartalo + päätteen valinta, vartalon ja päätteen kokoaminen, kirjoittaminen. Yhteensä 27 kohtaa. Ensimmäinen ja viimeinen vaihe etenevät kolmen persoonan ryhmissä. Palat valitaan painikkeilla; raahaamista ei tarvita. Kirjoittamiseen on saamen kirjainpainikkeet. `∅` tarkoittaa, ettei vartaloon lisätä päätettä. Alkuperäisen prototyypin 36 muotoa on kopioitu muuttamatta.

## Oppilaan navigointi

Jaa **tehtäväpaketin suora linkki**. Oppilaan logo ei ole linkki, eikä tehtäväsivulla ole reittejä etusivulle, opettajasivulle, muihin aineisiin tai muihin paketteihin. Takaisin, seuraava, ohjeet, tulokset ja uusi kierros pysyvät saman paketin sisällä. Kaikki paketit voivat olla käytössä samanaikaisesti, ja kullakin on oma suoritustila.

Tämä on navigoinnin rajaus, ei käyttöoikeusrajaus. Sivusto ja opettajan jakosivu ovat julkisia; toisen tehtävän linkin saanut voi avata sen. Käyttäjän 27.9.2026 täsmennyksen mukaisesti kirjautumista tai pääsyn estämistä ei lisätä.

## Paikallinen käynnistys

Tarvitset Node.js:n. Tässä versiossa ei tarvitse asentaa npm-riippuvuuksia.

1. Avaa pääte **tämän Classroom-kansion sisällä**.
2. Suorita `node tools/serve.cjs`.
3. Avaa `http://127.0.0.1:4186/GiellaStudio/`.
4. Lopeta päätepalvelin Ctrl+C:llä.

Windowsissa voi myös avata `Avaa-Classroom.cmd`-tiedoston. Jos `node` ei löydy kaksoisnapsauttamalla, käytä päätettä, jossa Node.js on käytettävissä. Pelkkä `index.html`-tiedoston avaaminen tiedostona ei riitä, koska sovellus käyttää JavaScript-moduuleja.

Paikallinen palvelin palvelee vain Classroomin julkisia sivuja loopback-osoitteessa. Se ei ole oppilastulosten backend. Paikallisen osoitteen QR-koodi ei toimi toisella laitteella. Jaa oppilaille julkaistun sivuston koodi.

## Pisteet ja palaute

- Jokainen kohta antaa yhden pisteen, jos oppilas löytää oikean vastauksen enintään kolmella yrityksellä.
- Kolmas väärä yritys näyttää mallivastauksen, avaa etenemisen ja antaa kyseisestä kohdasta nolla pistettä.
- Vihjeitä saa käyttää. Niiden käyttö, kaikki jätetyt vastausyritykset ja ensimmäisellä yrityksellä oikein vastatut kohdat näkyvät raportissa erikseen.
- Ratkaistua kohtaa ei voi muuttaa takaisin-painikkeella pisteiden kasvattamiseksi.
- Tyhjä vastaus ei kuluta yritystä. Isot/pienet kirjaimet, ylimääräiset välilyönnit ja lauseen loppupiste eivät estä hyväksymistä. Espanjan aksenttimerkit säilyvät merkityksellisinä.
- EXTRA ei saa automaattista kieliarviota eikä muuta pistemäärää.

## Näytä opettajalle ja PDF

**Čájet oahpaheaddjái / Vis læreren** avaa koko selainikkunan kokoisen näkymän. Siinä näkyvät paketti, valmistuminen, pisteet, prosentti, valmistumisaika ja lyhyt yhteenveto. Takaisin-painike ja Esc palauttavat raporttiin.

**Vurke PDF:n / Lagre som PDF** avaa selaimen tulostuksen. Valitse kohteeksi **Tallenna PDF:nä / Lagre som PDF**, tallenna tiedosto ja liitä se Teams-tehtävään. Puhelimessa valinta voi löytyä käyttöjärjestelmän Tulosta- tai Jaa-valikosta. Käytä tarvittaessa tavallista Edge-, Chrome- tai Safari-selainta sovelluksen sisäisen selaimen sijaan. Raportissa näkyvät kaikki yritykset, mallin ja vihjeen käyttö sekä EXTRA. Päivämäärä ja aika ovat laitteen paikallisessa ajassa; valmistumisaika ei vaihdu raportin uudelleenavaamisessa.

PDF ja puhelimen näyttö ovat oppilaan laitteen tuottamia raportteja. Niissä ei ole varmennettua henkilöllisyyttä eikä automaattista palautusta.

## Jakaminen ja QR

Opettajasivulla näkyvät kaikki `data/packages.js`-luettelossa julkaistut paketit. Painikkeilla voi avata oppilasversion, kopioida suoran linkin ja näyttää QR-koodin. QR-ikkunassa koodin voi tallentaa PNG-kuvana PowerPointiin tai Teamsiin sekä tulostaa paperille. Jos selain estää kopiointirajapinnan, linkkikenttä valitaan käsin kopioitavaksi.

QR tuotetaan selaimessa mukana toimitetulla kirjastolla. QR-palvelua tai ulkoista kuvaosoitetta ei käytetä. Linkki päätellään nykyisestä julkaisupaikasta, joten myös `/GiellaStudio/` säilyy automaattisesti.

## Tiedot ja tämän version rajat

Ei kirjautumista, salasanoja, oppilaskoodeja, tietokantaa, analytiikkaa, pilvitallennusta tai suojattua hallintapaneelia. Opettajasivu on julkinen ja sisältää vain jakotyökalut.

Jätetyt vastaukset, tarkistamattomat luonnokset ja EXTRA säilyvät oletuksena `sessionStorage`-muistissa saman välilehden päivitysten yli. Kahden viikon espanjapaketit käyttävät yllä kuvattua `localStorage`-tallennusta. Tyhjennys tai uusi kierros poistaa edellisen suorituksen; selain voi palauttaa istunnon omalla välilehtien palautustoiminnollaan. Jos selaimen tallennus estyy, harjoitus toimii muistissa ja sivu neuvoo säilyttämään välilehden PDF-tallennukseen asti. Älä kirjoita nimiä tai henkilötietoja EXTRA-kenttään.

Tehtävädata ja oikeat vastaukset ovat julkisessa lähdekoodissa. Tämä on harjoitteluväline, ei suojattu koe. GitHub Pages toimittaa staattiset tiedostot; sovellus ei lähetä vastaussisältöjä sinne.

## Uusi tehtäväpaketti

1. Kopioi `data/mi-actividad-favorita.js` uuden paketin omaksi tiedostoksi **tämän kansion sisällä**.
2. Anna paketille uusi `id`, `version` ja yksilölliset kysymystunnisteet. Muokkaa sanastoa, ohjeita ja vastauksia. Nosta `version`-numeroa, jos muutat julkaistun paketin pisteytettäviä kohtia: vanha selainistunto ei silloin sekoitu uuteen sisältöön.
3. Lisää paketin metadata `data/packages.js`-luetteloon. `subject` on `espanja`, `suomi` tai `pohjoissaame`; `grade` voi olla esimerkiksi `8`, `9` tai ryhmätunnus. Polku voi olla `espanja/9/uusi-paketti/`. Käytä URL-polussa pieniä a–z-kirjaimia, numeroita ja yhdysmerkkejä.
4. Suorita `node tools/build-pages.mjs`. Se luo etu- ja ainesivut sekä jokaiselle paketille oikean syvyisen `index.html`-tiedoston.
5. Suorita `node --test tests/*.test.mjs`. Testaa uusi paketti myös selaimessa kokonaan.
6. Julkaise muutokset vain tämän Classroom-repositorion kautta. Opettajasivun linkki ja QR tulevat automaattisesti.

Nykyinen tehtävämoottori tukee `choice`-monivalintaa, `write`-kirjoitusvastausta ja `pieces`-palavalintoja. `answers` sisältää hyväksyttävät vastaukset. `prompt: {se, nb}` näyttää kaksikielisen kysymyksen, `prompt: {es}` espanjankielisen ja `prompt: {text, language}` muun oppimiskielen kysymyksen. Kirjoituksessa voi vaihtoehtoisesti käyttää `before`, `after` ja `verb` -kenttiä. `hint` sisältää molemmat käyttöliittymäkielet. Osioiden `dialogue` ja `lesson` tuovat dialogin tai verbin mallitaulukon; `vocabulario`-osio näyttää sanaston. `extra` on vapaaehtoinen. `data/sami-verbs.js` kokoaa saamen kolme vaihetta yhteisestä persoonien, vartaloiden ja päätteiden taulukosta. `guided: true` lisää kolmen kohdan väliyhteenvedot.

Ensimmäisen paketin sanastokenttä `es` on suunniteltu espanjaa varten. Saamen paketit käyttävät `introForms`- ja `studyForms`-taulukoita sekä `letters`-kirjainpainikkeita. Muistipeliä, parien yhdistämistä tai kuuntelua ei ole tässä julkaisussa.

## GitHub-julkaisu

**Git-repositorion juuren pitää olla tämä Classroom-kansio. Älä alusta Gitiä sen yläpuolisessa alkuperäisessä projektissa.**

Tarkista `git rev-parse --show-toplevel` ja `git status --short` ennen lisäämistä. Tarkka sallittujen julkaisutiedostojen luettelo on `RELEASE_FILES.txt`. `_local/` on suljettu pois; se sisältää paikallisia tarkistuksia, testitulosteita ja esikatselun lokitiedostoja. Myös PDF-testitulosteet, testiselainprofiilit ja alkuperäisten tiedostojen vertailutiivisteet jäävät pois.

GitHub-repositorion nimi on `GiellaStudio`, omistaja `twinningfinn`. Julkaisuasetuksissa avaa **Settings → Pages → Build and deployment** ja valitse **Deploy from a branch**, haara **main**, kansio **/(root)** ja **Save**. Odota julkaisun valmistumista ennen linkin jakamista. Omaa domainia tai CNAME-tiedostoa ei käytetä.

Ohje: [GitHub Pages -julkaisulähteen valinta](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Alkuperäisen GiellaStudion säilyminen

Classroom hyödyntää alkuperäisten prototyyppien Segoe UI -typografiaa, väljää korttiasettelua, ainevärejä, pohjoissaamen ja bokmålin kieliperiaatetta, saamen sinistä ja norjan punaista sanastotekstiä, kaktuskuvan kopiota sekä vaiheittaisen harjoittelun ja palautteen ajatusta. **Mi actividad favorita on näistä ideoista koottu uusi tehtäväpaketti**, ei väite siitä, että samanniminen valmis paketti olisi löytynyt nykyisestä prototyypistä.

Alkuperäisiä suunnitteluvaatimuksia, siirtomuistiota, prototyyppejä, paikallista palvelinta ja tietokantaa ei muokata tässä repositoriossa eikä kopioida GitHubiin. Pysyvän GiellaStudion backend-, tili-, tietokanta-, seuranta- ja kaupallistamissuunnitelmat pysyvät alkuperäisessä projektissa ennallaan. Niiden kehittämistä jatketaan myöhemmin siellä. Classroomista voidaan silloin erikseen valita siirrettävät tehtäväsisällöt.

Uudet pohjoissaamen tekstit on koottu tarkistettavaksi tiedostoon `LANGUAGE_REVIEW.md`.
