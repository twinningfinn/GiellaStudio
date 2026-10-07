# GiellaStudio v0.1 — Classroom

Väliaikainen, kokonaan staattinen luokkahuoneversio. Oppilas avaa tehtävälinkin, tekee harjoitukset ja näyttää tuloksen opettajalle tai palauttaa PDF:n. Espanjan aiheissa käyttöliittymä on lyhyesti espanjaksi. Käännöstehtävissä pohjoissaame ja bokmål tukevat oppimista.

## Espanjan aiheet 7.10.2026

Oppilaan etusivu: https://twinningfinn.github.io/GiellaStudio/espanja/

Seitsemän laatikkoa: AR-verbos, IR-verbos, ER-verbos, Saludos y frases, Números 1–15, Pronombres ja Palabras. Jokainen avautuu sanakortteihin; oppilas voi siirtyä yhdistämiseen tai muistipeliin ja omaan Reto-tehtäväsarjaan. Aikarajaa ei ole. Lyhyet espanjan-, saamen- ja norjankieliset ohjeet ja alkuperäisen prototyypin lämmin oranssi/terrakotta-paletti.

Kaikki 101 tehtävää ovat säilyneet. Verbien Reto-tehtävissä on lauseaukko; kaikissa tehtävissä ja peleissä oikean vastauksen jälkeen näkyy helppo esimerkkilause. Espanjan persoonapronominit ja säännöllisten verbien persoonapäätteet korostuvat punaisina. Lähteenä on opettajan uusin espanol_geardduheapmi_ovingshefte1.pdf: sivulla 10 on **Estoy OK**. Gente 8:n sivuja ei kopioida. Vanhojen oppilaslinkkien avaaminen ohjaa aihevalikkoon. Aiemmat vastaukset tuodaan samoilla tehtävätunnisteilla aihekohtaiseen tallennukseen, jos ne ovat samassa selaimessa.

**Opettajan katsaus:** https://twinningfinn.github.io/GiellaStudio/opettaja/katsaus/ näyttää kaikki tehtävät, kortit ja peliparit. Mallivastaukset saa piiloon. Katsaus ei käsittele oppilaan tallennuksia. Molemmat opettajasivut kysyvät erikseen annettua koodia ennen sisällön avaamista. Koodia ei muisteta sivunvaihdon tai päivityksen yli. Lukitse-painike sulkee näkymän; näkymä lukittuu myös 15 minuutin toimettomuuden jälkeen. Takaisin-painikkeen palautus pyytää koodin uudelleen.

**PDF:** output/pdf/espanol-temas.pdf sisältää vain tehtävät aiheittain sivuilla 1–9. Julkisissa PDF-tiedostoissa ei ole erillistä vastausosiota. Vanhojen PDF-linkkien takana on sama päivitetty paketti. Oppilaan omat vastaukset voi tulostaa myös kesken harjoittelun kohdasta **Mis respuestas · PDF**. Tallenna selaimen tulostuksella PDF:ksi ja palauta Teamsiin. Kortit ja pelit ovat harjoittelua; Reto-raportissa näkyvät tehtäväyritykset, tarkistamaton luonnos ja käytetty apu.

Espanjan edistyminen tallentuu tällä laitteella selaimen localStorageen. Verkkosivu tarvitsee yhteyden avautuessaan; ladattu PDF toimii ilman yhteyttä. Vastauksia ei lähetetä palvelimelle. Muut aineet käyttävät aiempaa tallennustapaa.

## Käyttö

- Oppilaalle: `https://twinningfinn.github.io/GiellaStudio/espanja/`
- Opettajalle: `https://twinningfinn.github.io/GiellaStudio/opettaja/`
- Etusivu: `https://twinningfinn.github.io/GiellaStudio/`

Osoitteet toimivat, kun GitHub Pages -julkaisu on valmis. Oppilaan ei tarvitse käydä etusivulla eikä kirjautua.

Ensimmäinen paketti **Mi actividad favorita** sisältää sanastovalinnan (4 kohtaa), kirjoitettavat AR-verbimuodot (3), dialogin ymmärtämisen (3) ja vapaaehtoisen EXTRA-vastauksen. Kesto on noin 10–15 minuuttia oppilaasta riippuen.

Pohjoissaamen **Bárrastávvalvearbbat** on jaettu neljään itsenäiseen pakettiin: **mannat, goarrut, viehkat ja boahtit**. Kunkin oma osoite on `https://twinningfinn.github.io/GiellaStudio/pohjoissaame/verbit/VERBI/`, missä VERBI korvataan verbin nimellä. Opettajasivu tarjoaa kaikille omat linkit ja QR-koodit. Suomeen ei vielä ole paketteja.

Jokainen verbipaketti säilyttää alkuperäisen prototyypin 9 persoonaa ja kolme vaihetta: valmis vartalo + päätteen valinta, vartalon ja päätteen kokoaminen, kirjoittaminen. Yhteensä 27 kohtaa. Ensimmäinen ja viimeinen vaihe etenevät kolmen persoonan ryhmissä. Palat valitaan painikkeilla; raahaamista ei tarvita. Kirjoittamiseen on saamen kirjainpainikkeet. `∅` tarkoittaa, ettei vartaloon lisätä päätettä. Alkuperäisen prototyypin 36 muotoa on kopioitu muuttamatta.

## Oppilaan navigointi

Jaa **tehtäväpaketin suora linkki**. Oppilaan logo ei ole linkki, eikä tehtäväsivulla ole reittejä etusivulle, opettajasivulle, muihin aineisiin tai muihin paketteihin. Takaisin, seuraava, ohjeet, tulokset ja uusi kierros pysyvät saman paketin sisällä. Kaikki paketit voivat olla käytössä samanaikaisesti, ja kullakin on oma suoritustila.

Oppilassivuilla ei ole linkkejä opettajasivuille. Opettajan sivujen koodikysely rajoittaa käyttöliittymän avaamista. Se ei ole palvelimella toteutettu kirjautuminen: GitHub Pages ja lähdekoodi ovat julkisia, ja harjoittelun vastausdata tarvitaan selaimessa palautetta varten. Koodia ei saa käyttää salassa pidettävien tietojen suojaamiseen.

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

Jätetyt vastaukset, tarkistamattomat luonnokset ja EXTRA säilyvät oletuksena `sessionStorage`-muistissa saman välilehden päivitysten yli. Espanjan aiheet käyttävät yllä kuvattua `localStorage`-tallennusta. Tyhjennys tai uusi kierros poistaa edellisen suorituksen; selain voi palauttaa istunnon omalla välilehtien palautustoiminnollaan. Jos selaimen tallennus estyy, harjoitus toimii muistissa ja sivu neuvoo säilyttämään välilehden PDF-tallennukseen asti. Älä kirjoita nimiä tai henkilötietoja EXTRA-kenttään.

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
