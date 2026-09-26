// Suorita, kun lisäät paketin data/packages.js-luetteloon.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packages, subjects } from '../data/packages.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const escape = text => String(text).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function page(route,title,attributes,student=false) {
  if(route && !/^[a-z0-9/-]+\/$/.test(route)) throw new Error('Käytä polussa vain pieniä a–z-kirjaimia, numeroita ja yhdysmerkkejä: '+route);
  const prefix='../'.repeat(route.split('/').filter(Boolean).length) || './';
  const content=`<!doctype html>
<html lang="se">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#b32132">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'">
  <title>${escape(title)} · GiellaStudio</title>
  <link rel="icon" href="${prefix}assets/icon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}css/style.css">
${!student?`  <script src="${prefix}js/vendor/qrcodegen.js" defer></script>`:''}
  <script type="module" src="${prefix}js/${student?'student':'catalog'}.js"></script>
</head>
<body ${attributes}>
  <a class="skip" href="#main">Bargobihttái / Til oppgaven</a>
  <header id="header"><span class="brand">GiellaStudio</span></header>
  <main id="main" ${student?'class="student"':''}><p lang="nb">Åpner oppgaven…</p><noscript><p lang="nb">Slå på JavaScript for å bruke oppgavene.</p></noscript></main>
  <footer class="no-print">GiellaStudio · Classroom v0.1${student?'':` · <a href="${prefix}opettaja/">Oahpaheaddjái / Til læreren</a>`}</footer>
</body>
</html>
`;
  const destination=path.join(root,route,'index.html');
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,content);
}
page('','Bures boahtin','data-page="home"');
page('opettaja/','Oahpaheaddjái','data-page="teacher"');
for(const [id,s] of Object.entries(subjects)) page(id+'/',s.native,`data-subject="${id}"`);
for(const p of packages) page(p.path,p.title,`data-package="${escape(p.id)}"`,true);
console.log('Luotu etusivu, opettajasivu, ainesivut ja '+packages.length+' tehtäväpaketin sivua.');
