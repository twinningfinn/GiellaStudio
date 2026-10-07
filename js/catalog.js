import { packages, subjects } from '../data/packages.js?v=20261007-sentences';
import { url, esc, bi, header, groupLabel } from './ui.js?v=20261007-fieldpack';
header();
const main=document.querySelector('main');
const subject=document.body.dataset.subject;
const teacher=document.body.dataset.page==='teacher';
const available=packages.filter(p=>teacher || !p.teacherOnly);
const listed=subject?available.filter(p=>p.subject===subject):available;
function card(p) {
  const s=subjects[p.subject];
  return `<article class="panel package-card"><p class="eyebrow">${bi(s.se,`${[s.nb,groupLabel(p)].filter(Boolean).join(' · ')}`)}</p><h2 lang="${p.language}">${esc(p.title)}</h2><p>${bi(p.description.se,p.description.nb)}</p><div class="meta">${p.minutes?`<span>${esc(p.minutes)} min</span>`:''}<span>${bi(p.exercises+' hárjehusa',p.exercises+' øvelser')}</span></div><div class="actions"><a class="button primary" href="${url(p.path)}"><span>${bi('Raba',teacher?'Åpne elevversjonen':'Åpne oppgaven')}</span></a>${teacher?`<a class="button" lang="fi" href="${url('opettaja/katsaus/?paketti='+encodeURIComponent(p.id))}">Katso kaikki tehtävät</a><button data-copy="${esc(p.id)}">${bi('Máŋge liŋkka','Kopier lenke')}</button><button data-qr="${esc(p.id)}">${bi('Čájet QR-koda','Vis QR-kode')}</button>`:''}</div>${teacher?`<label class="small muted" for="link-${esc(p.id)}">Direkte lenke</label><input class="share-link" id="link-${esc(p.id)}" type="text" readonly value="${esc(url(p.path))}"><div class="copy-status" id="status-${esc(p.id)}" role="status"></div>`:''}</article>`;
}
if(teacher) {
  main.innerHTML=`<h1 tabindex="-1">${bi('Oahpaheaddjái','Til læreren')}</h1><p lang="fi">Jaa tehtävä suoraan linkillä tai näytä QR-koodi luokalle.</p><section class="panel"><h2>Español</h2><div class="actions"><a class="button primary" href="${url('espanja/')}">Avaa aiheet</a><a class="button" href="${url('opettaja/katsaus/')}">Katso kaikki tehtävät</a><a class="button" href="${url('output/pdf/espanol-temas.pdf')}" download>Tehtävä-PDF</a></div></section><p class="small muted" lang="fi">Julkinen jakosivu · Classroom v0.1 · Ei oppilasrekisteriä eikä tulosten vastaanottoa.</p>${listed.map(card).join('')}`;
} else if(subject) {
  const s=subjects[subject];
  main.innerHTML=`<a href="${url('')}">${bi('Ruovttoluotta','Tilbake')}</a><div class="subject-line" style="margin-top:24px"><span class="flag ${s.flag}" aria-hidden="true"></span><h1 tabindex="-1">${esc(s.native)}</h1></div>${listed.length?listed.map(card).join(''):`<div class="empty">${bi('Bargobihtát','Ingen oppgavepakker publisert ennå.')}</div>`}`;
} else {
  main.innerHTML=`<h1 tabindex="-1">${bi('Bures boahtin','Velkommen')}</h1><p>${bi('Vállje fága.','Velg et fag, eller åpne oppgavelenken fra læreren.')}</p><div class="subject-grid">${Object.entries(subjects).map(([id,s])=>`<article class="subject-card ${id}"><span class="flag ${s.flag}" aria-hidden="true"></span><h2>${esc(s.native)}</h2><p class="small muted">${available.filter(p=>p.subject===id).length} · ${bi('Bargobihtát','Oppgavepakker')}</p><a href="${url(id+'/')}">${bi('Raba','Åpne')} →</a></article>`).join('')}</div><h2 style="margin-top:36px">${bi('Bargobihtát','Oppgavepakker')}</h2>${available.map(card).join('')}`;
}
document.querySelectorAll('[data-copy]').forEach(button=>button.onclick=async()=>{
  const p=packages.find(p=>p.id===button.dataset.copy);
  const field=document.querySelector('#link-'+p.id), status=document.querySelector('#status-'+p.id);
  try { await navigator.clipboard.writeText(url(p.path)); status.innerHTML=bi('Liŋka máŋgejuvvon','Lenken er kopiert.'); }
  catch { field.focus();field.select(); status.innerHTML=bi('Máŋge liŋkka','Marker lenken og kopier den fra feltet.'); }
});
document.querySelectorAll('[data-qr]').forEach(button=>button.onclick=()=>showQR(packages.find(p=>p.id===button.dataset.qr),button));
function showQR(p,opener) {
  const link=url(p.path);
  const dialog=document.createElement('dialog');dialog.id='qr-dialog';
  dialog.innerHTML=`<div class="center"><div class="brand">Giella<span>Studio</span></div><h2 style="margin-top:20px" lang="${p.language}">${esc(p.title)}</h2><p>${bi('Álgge','Skann koden og start')}</p><div class="qr-image" id="qr-image"></div><p class="qr-url">${esc(link)}</p><p class="small muted" lang="nb">${['localhost','127.0.0.1','[::1]'].includes(location.hostname)?'Lokal forhåndsvisning: denne adressen kan ikke åpnes på en annen enhet. Bruk QR-koden fra den publiserte nettsiden.':''}</p></div><div class="actions no-print"><button id="save-qr">Tallenna QR-kuva / Lagre QR-bilde</button><button id="print-qr">Tulosta / Skriv ut</button><button id="close-qr">Sulje / Lukk</button></div><p role="status" id="qr-status" class="no-print"></p>`;
  document.body.append(dialog);
  try {
    const qr=globalThis.qrcodegen.QrCode.encodeText(link,globalThis.qrcodegen.QrCode.Ecc.MEDIUM);
    const size=qr.size+8;
    let path='';
    for(let y=0;y<qr.size;y++) for(let x=0;x<qr.size;x++) if(qr.getModule(x,y)) path+=`M${x+4},${y+4}h1v1h-1z `;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR: ${esc(p.title)}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="white"/><path d="${path}" fill="black"/></svg>`;
    document.querySelector('#qr-image').innerHTML=svg;
    const canvas=document.createElement('canvas');const scale=Math.ceil(1200/size);
    canvas.width=canvas.height=size*scale;const ctx=canvas.getContext('2d');
    ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='black';
    for(let y=0;y<qr.size;y++) for(let x=0;x<qr.size;x++) if(qr.getModule(x,y)) ctx.fillRect((x+4)*scale,(y+4)*scale,scale,scale);
    const download=document.createElement('a');download.id='save-qr';download.className='button';
    download.href=canvas.toDataURL('image/png');download.download=`GiellaStudio-${p.id}-QR.png`;
    download.textContent='Tallenna QR-kuva / Lagre QR-bilde';
    document.querySelector('#save-qr').replaceWith(download);
  } catch(error) { document.querySelector('#qr-status').textContent='QR-koden kunne ikke opprettes. Kopier lenken i stedet.';document.querySelector('#save-qr').disabled=true; }
  dialog.querySelector('h2').tabIndex=-1;
  dialog.querySelector('h2').setAttribute('autofocus','');
  dialog.showModal();
  document.querySelector('#close-qr').onclick=()=>dialog.close();
  document.querySelector('#print-qr').onclick=()=>{document.body.classList.add('qr-printing');window.print();};
  const cleanup=()=>document.body.classList.remove('qr-printing');
  window.addEventListener('afterprint',cleanup,{once:true});
  dialog.addEventListener('close',()=>{cleanup();window.removeEventListener('afterprint',cleanup);dialog.remove();opener.focus();});
}
