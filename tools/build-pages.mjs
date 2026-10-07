// Suorita, kun lisäät paketin data/packages.js-luetteloon.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packages, subjects } from '../data/packages.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const escape = text => String(text).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function page(route,title,attributes,student=false,review=false,topic=false,legacy=false) {
  if(route && !/^[a-z0-9/-]+\/$/.test(route)) throw new Error('Käytä polussa vain pieniä a–z-kirjaimia, numeroita ja yhdysmerkkejä: '+route);
  const prefix='../'.repeat(route.split('/').filter(Boolean).length) || './';
  const spanish=topic||route==='espanja/'||review||legacy;
  const teacher=route.startsWith('opettaja/');
  const script=teacher?'teacher-entry':legacy?'legacy-topics':topic?'topic':route==='espanja/'?'es-home':student?'student':'catalog';
  const content=`<!doctype html>
<html lang="${review?'fi':spanish?'es':'se'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${spanish?'#e95216':'#b32132'}">
  <meta name="referrer" content="no-referrer">
${teacher?'  <meta name="robots" content="noindex, nofollow">':''}
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'">
  <title>${escape(title)} · GiellaStudio</title>
  <link rel="icon" href="${prefix}assets/icon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}css/style.css?v=20261007-fieldpack">
${spanish?`  <link rel="stylesheet" href="${prefix}css/spanish.css?v=20261007-sentences">`:''}
${review?`  <link rel="stylesheet" href="${prefix}css/teacher-review.css?v=20261007-sentences">`:''}
${teacher?`  <link rel="stylesheet" href="${prefix}css/teacher-gate.css?v=20261007-teacher-lock">`:''}
${!student&&!review?`  <script src="${prefix}js/vendor/qrcodegen.js" defer></script>`:''}
  <script type="module" src="${prefix}js/${script}.js?v=20261007-teacher-lock"></script>
</head>
<body ${attributes} ${spanish?'class="spanish"':''}>
  <a class="skip" href="#main">${spanish?'Ir al contenido':'Bargobihttái / Til oppgaven'}</a>
  <header id="header"><span class="brand">GiellaStudio</span></header>
  <main id="main" ${student?'class="student"':''}><p>${spanish?'Cargando…':'Åpner oppgaven…'}</p><noscript><p>${spanish?'Activa JavaScript.':'Slå på JavaScript for å bruke oppgavene.'}</p>${legacy?`<a href="${prefix}espanja/">Español</a>`:''}</noscript></main>
  <footer class="no-print">GiellaStudio</footer>
</body>
</html>
`;
  const destination=path.join(root,route,'index.html');
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,content);
}
page('','Bures boahtin','data-page="home"');
page('opettaja/','Oahpaheaddjái','data-page="teacher"');
page('opettaja/katsaus/','Opettajan tehtäväkatsaus','data-page="teacher-review"',false,true);
for(const [id,s] of Object.entries(subjects)) page(id+'/',s.native,`data-subject="${id}"`);
for(const p of packages) page(p.path,p.title,`data-package="${escape(p.id)}"`,true,false,p.topic);
for(const week of [1,2]) page(`espanja/8/semana-${week}/`,'Español','',false,false,false,true);
console.log('Luotu etusivu, opettajasivu, ainesivut ja '+packages.length+' tehtäväpaketin sivua.');
