import { packages, subjects } from '../data/packages.js?v=20260927-sami';
import { questions, createRun, getRecord, submit, summary, finish, restoreRun } from './core.js?v=20260927-sami';
import { url, esc, bi, promptText, header, focusMain, formatTime, groupLabel } from './ui.js?v=20260927-sami';
import { conjugation, pieceControls, bindPieces, pieceValue } from './pieces.js?v=20260927-sami';

header();
const main = document.querySelector('main');
const meta = packages.find(p => p.id === document.body.dataset.package);
let pieceQuestion = '', pieceSelection = { stem: null, ending: null };
let pack, run, all, selected = '', draft = '', message = '', storageOK = true;
const key = `giellastudio:classroom:0.1:${meta?.id}`;
try {
  if (!meta) throw new Error('Package not found');
  pack = (await import(url(meta.data))).default;
  all = questions(pack);
  try { run = restoreRun(sessionStorage.getItem(key), pack); } catch { storageOK = false; }
  run ||= createRun(pack);
  render();
} catch (error) {
  console.error(error);
  main.innerHTML = `<h1>${bi('Geahččal fas', 'Oppgaven kunne ikke åpnes')}</h1><p lang="nb">Last siden på nytt og sjekk forbindelsen.</p><button id="retry">${bi('Geahččal fas', 'Prøv igjen')}</button>`;
  document.querySelector('#retry').addEventListener('click', () => location.reload());
}
function save() {
  try { sessionStorage.setItem(key, JSON.stringify(run)); }
  catch { storageOK = false; }
}
function btn(id, se, nb, style = '') { return `<button type="button" id="${id}" class="${style}">${bi(se, nb)}</button>`; }
function introLesson() {
  if (pack.introForms) return conjugation(pack.introForms);
  return `<div class="word-list">${pack.vocabulary.map(w => `<div class="word"><strong lang="${meta.language}">${esc(w.es)}</strong>${bi(w.se,w.nb)}</div>`).join('')}</div>`;
}
function lesson(section, q) {
  if (q.studyForms) return conjugation(q.studyForms);
  if (section.id === 'vocabulario') return introLesson();
  if (section.lesson) return `<div class="conjugation" lang="${meta.language}">${section.lesson.forms.map(([person,ending]) => `<div><span class="person">${esc(person)}</span> ${esc(section.lesson.stem)}<span class="ending">${esc(ending)}</span></div>`).join('')}</div>`;
  return '';
}
function render() {
  save();
  document.querySelector('#student-dialog')?.remove();
  if (run.view === 'intro') renderIntro();
  else if (run.view === 'exercise') renderExercise();
  else if (run.view === 'extra') renderExtra();
  else renderResults();
  if (!storageOK) {
    const notice = document.createElement('p'); notice.className = 'note';
    notice.innerHTML = bi('Vurke PDF:n', 'Nettleseren kan ikke lagre økten. Hold siden åpen til du har lagret resultatet som PDF.');
    main.append(notice);
  }
}
function renderIntro() {
  const subject=subjects[meta.subject];
  main.innerHTML = `<div class="eyebrow subject-line"><span class="flag ${subject.flag}" aria-hidden="true"></span><span>${bi(subject.se, [subject.nb,groupLabel(meta)].filter(Boolean).join(' · '))}</span></div>
    <section class="panel hero">${meta.subject==='espanja'?`<img class="cactus" src="${url('assets/cactus.png')}" alt="" width="94" height="132">`:''}<h1 tabindex="-1" lang="${meta.language}">${esc(meta.title)}</h1><p>${bi(meta.description.se,meta.description.nb)}</p><div class="meta"><span>${esc(meta.minutes)} min</span><span>${bi(pack.sections.length+' hárjehusa',pack.sections.length+' øvelser'+(pack.extra?' + EXTRA':''))}</span></div></section>
    <div class="actions">${btn('start','Álgge','Start','primary')}</div>
    <ol class="steps">${pack.sections.map((s,i) => `<li><span class="step-number">${i+1}</span><span lang="${meta.language}">${s.titleNb?bi(s.title,s.titleNb):esc(s.title.replace(/^\d · /,''))}</span></li>`).join('')}</ol>
    <details class="lesson" open><summary>${bi(pack.introTitle?.se||'Sátnekoarttat',pack.introTitle?.nb||'Se på ordene før du starter')}</summary><div class="lesson-content">${introLesson()}</div></details>
    <p class="note">${bi('Čájet bohtosiid oahpaheaddjái.', 'Vis resultatet til læreren eller lagre det som PDF. Ingen automatisk innlevering.')}</p>
    <p class="small muted" lang="nb">Svarene beholdes bare i denne nettleserfanen. Unngå navn og personopplysninger i fritekst.</p>`;
  document.querySelector('#start').onclick = () => { run.view = 'exercise'; render(); focusMain(); };
}
function renderExercise() {
  const q = all[run.cursor];
  const section = pack.sections.find(s => s.questions.some(item => item.id === q.id));
  const rec = getRecord(run,q.id);
  const count = summary(run,pack);
  const instruction = section.instruction;
  const study = lesson(section, q);
  main.innerHTML = `<div class="progress-line"><span lang="${meta.language}">${esc(meta.title)}</span><span>${run.cursor+1} / ${all.length}</span></div>
    <progress max="${all.length}" value="${count.completed}" aria-label="Dahkkon / Fullført"></progress>
    <h1 tabindex="-1" lang="${meta.language}">${section.titleNb?bi(section.title,section.titleNb):esc(section.title)}</h1><p>${bi(instruction.se,instruction.nb)}</p>
    ${study ? `<details class="lesson" id="study"><summary>${bi('Veahkki','Se på ordene / regelen')}</summary><div class="lesson-content">${study}</div></details>` : ''}
    ${section.dialogue ? `<div class="panel dialogue" lang="${meta.language}">${section.dialogue.map(([speaker,text])=>`<p><strong>${esc(speaker)}</strong>${esc(text)}</p>`).join('')}</div>`:''}
    ${q.group?`<p class="group-label" lang="se">${esc(q.group)}</p>`:''}
    <section class="panel question" aria-label="Hárjehus / Oppgave">
      ${q.prompt ? `<h2 class="question-title">${promptText(q.prompt)}</h2>` : `<p class="eyebrow" lang="${meta.language}">${esc(q.verb)}</p><p class="sentence" lang="${meta.language}"><span class="person">${esc(q.before)}</span> <span aria-label="…">______</span> ${esc(q.after)}</p>`}
      <form id="answer-form">
      ${q.type === 'pieces' ? renderPieces(q,rec) : q.type === 'choice' ? `<div class="choices" role="group" aria-label="Vástádusat / Svaralternativer">${q.options.map((value,i)=>`<button type="button" class="choice" data-choice="${i}" lang="${meta.language}" aria-pressed="${selected===value}" ${rec.done?'disabled':''} ${rec.done&&q.answers.includes(value)?'data-correct="true"':''}>${esc(value)}</button>`).join('')}</div>` : `<label for="answer">${bi('Čále vástádusa','Skriv svaret')}</label><input id="answer" type="text" lang="${meta.language}" value="${esc(draft || rec.attempts.at(-1) || '')}" maxlength="100" autocomplete="off" autocapitalize="none" spellcheck="false" ${rec.done?'readonly':''}>`}
${q.type==='write'&&pack.letters?`<div class="letter-keys" role="group" aria-label="Sámegiela bustávat / Samiske bokstaver">${pack.letters.map(letter=>`<button type="button" data-letter="${letter}" aria-label="Lasit ${letter} / Sett inn ${letter}" ${rec.done?'disabled':''}>${letter}</button>`).join('')}</div>`:''}
      <div class="actions"><button type="submit" id="check" class="primary" ${rec.done?'disabled':''}>${bi('Dárkkis','Sjekk')}</button>${btn('hint','Neavva','Hint')}</div></form>
      <div id="hint-box" class="hint" ${rec.hint?'':'hidden'}>${bi(q.hint.se,q.hint.nb)}</div>
      <div id="feedback" class="feedback ${rec.correct?'correct':''}" role="status" aria-live="polite">${feedback(q,rec)}</div>
      <p class="small muted" style="margin-top:16px">${bi('Geahččaleamit','Forsøk')}: ${rec.attempts.length} / 3</p>
    </section>
    <div class="nav">${btn('back','Ruovttoluotta','Tilbake')}${btn('next','Boahtte',run.cursor===all.length-1?(pack.extra?'Til EXTRA':'Resultater'):'Neste','primary')}</div>`;
  document.querySelector('#next').disabled = !rec.done;
  if(q.type==='pieces') bindPieces(q,pieceSelection,()=>{});
  document.querySelectorAll('[data-letter]').forEach(button=>button.onclick=()=> {
    const input=document.querySelector('#answer'); if(input.readOnly)return;
    if(input.value.length-(input.selectionEnd-input.selectionStart)>=input.maxLength)return;
    input.setRangeText(button.dataset.letter,input.selectionStart,input.selectionEnd,'end');
    draft=input.value;input.focus({preventScroll:true});
  });
  document.querySelector('#answer')?.addEventListener('input', e => { draft = e.target.value; });
  document.querySelectorAll('[data-choice]').forEach(button => button.onclick = () => {
    selected = q.options[Number(button.dataset.choice)];
    document.querySelectorAll('[data-choice]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
  });
  document.querySelector('#answer-form').onsubmit = e => {
    e.preventDefault();
    if (rec.done) return;
    message = submit(run,q,q.type==='pieces'?pieceValue(pieceSelection):q.type==='choice'?selected:document.querySelector('#answer').value);
    renderExercise(); save();
    if (rec.done) document.querySelector('#next').focus();
    else if (q.type==='write') document.querySelector('#answer').focus();
    else document.querySelector('#check').focus();
  };
  document.querySelector('#hint').onclick = () => {
    rec.hint = true; save(); document.querySelector('#hint-box').hidden = false;
  };
  document.querySelector('#study')?.addEventListener('toggle', e => { if (e.target.open) { rec.hint = true; save(); } });
  document.querySelector('#back').onclick = () => {
    selected=''; draft=''; message='';
    if (run.cursor > 0) run.cursor--; else run.view='intro';
    render(); focusMain();
  };
  document.querySelector('#next').onclick = () => {
    if (!rec.done) return;
    selected=''; draft=''; message='';
    if(section.guided && (section.questions.findIndex(item=>item.id===q.id)+1)%3===0 && run.cursor<all.length-1) {
      const completed=section.questions.slice(section.questions.findIndex(item=>item.id===q.id)-2,section.questions.findIndex(item=>item.id===q.id)+1);
      run.cursor++;save();renderCheckpoint(completed);focusMain();return;
    }
    if (run.cursor < all.length-1) run.cursor++; else if(pack.extra) run.view='extra'; else finish(run,pack);
    render(); focusMain();
  };
}
function renderPieces(q,rec) {
  if(pieceQuestion!==q.id) {
    pieceQuestion=q.id;
    const previous=rec.attempts.at(-1)?.split(' + ');
    pieceSelection={stem:q.pieces.fixedStem ?? previous?.[0] ?? null, ending:previous ? (previous[1]==='∅'?'':previous[1]) : null};
  }
  return pieceControls(q,rec,pieceSelection);
}
function renderCheckpoint(completed) {
  main.innerHTML=`<h1 tabindex="-1">${bi('Geargan','Denne delen er ferdig')}</h1><p lang="se">${esc(meta.title)} · ${completed.map(q=>esc(q.person)).join(' · ')}</p><section class="panel">${conjugation(completed[0].studyForms)}</section><div class="actions">${btn('continue','Boahtte','Fortsett','primary')}</div>`;
  document.querySelector('#continue').onclick=()=>{render();focusMain();};
}
function feedback(q,rec) {
  if (rec.correct) return `<p>${bi('Riekta!','Riktig!')}</p><p lang="${meta.language}">${esc(q.model||q.answers[0])}</p>`;
  if (rec.model) return `<p>${bi('Vástádus','Se på svaret og gå videre')}</p><p lang="${meta.language}"><strong>${esc(q.model||q.answers[0])}</strong></p><p>${bi('Boahtte','Du kan fortsette. Denne oppgaven gir 0 poeng.')}</p>`;
  if (message==='empty') return bi(q.type==='write'?'Čále vástádusa vuos.':'Vállje vástádusa vuos.','Skriv eller velg et svar først.');
  if (rec.attempts.length) return bi('Geahččal fas.','Ikke helt. Prøv igjen, eller bruk et hint.');
  return '';
}
function renderExtra() {
  main.innerHTML = `<p class="eyebrow">${all.length} / ${all.length} · ${bi('Geargan','Fullført')}</p><h1 tabindex="-1" lang="${meta.language}">${esc(pack.extra.title)}</h1><section class="panel"><p>${bi(pack.extra.instruction.se,pack.extra.instruction.nb)}</p><p class="sentence" lang="${meta.language}">${esc(pack.extra.model)}</p><label for="extra">${bi('Čále vástádusa','Skriv svaret')}</label><textarea id="extra" lang="${meta.language}" maxlength="${pack.extra.maxLength}" spellcheck="false">${esc(run.extra)}</textarea><p class="small muted" lang="nb">Dette svaret vurderes av læreren, ikke automatisk. Ikke skriv navn eller andre personopplysninger.</p></section><div class="nav">${btn('back','Ruovttoluotta','Tilbake')}${btn('finish','Bohtosat','Resultater','primary')}</div>`;
  document.querySelector('#extra').oninput = e => { run.extra=e.target.value; save(); };
  document.querySelector('#back').onclick = () => { run.view='exercise'; render(); focusMain(); };
  document.querySelector('#finish').onclick = () => { if(finish(run,pack)) { render(); focusMain(); } };
}
function questionLabel(q) { return q.prompt ? promptText(q.prompt) : `<span lang="${meta.language}">${esc(q.before)} _____ ${esc(q.after)} (${esc(q.verb)})</span>`; }
function answerReport() {
  return `<ol class="answers">${all.map((q,i) => {
    const rec=getRecord(run,q.id);
    const section=pack.sections.find(s=>s.questions[0].id===q.id);
    return `<li>${section?`<h3>${section.titleNb?bi(section.title,section.titleNb):esc(section.title)}</h3>`:''}<p><strong>${i+1}. ${questionLabel(q)}</strong></p><span class="tag ${rec.model?'help':''}">${bi(rec.model?'Veahkki':'Riekta',rec.model?'Med fasit · 0 poeng':'Riktig · 1 poeng')}</span><p class="answer-steps"><span lang="nb">Dine forsøk:</span> <span lang="${meta.language}">${rec.attempts.map(esc).join(' → ')}</span></p>${rec.model?`<p><span lang="nb">Fasit:</span> <span lang="${meta.language}">${esc(q.model||q.answers[0])}</span></p>`:''}<p class="small muted">${bi('Neavva', 'Hint / regel åpnet')}: ${rec.hint?'✓':'—'}</p></li>`;
  }).join('')}</ol>`;
}
function renderResults() {
  const result=summary(run,pack);
  if(result.completed!==result.total || !run.finished) { run.view='exercise'; render(); return; }
  const subject=subjects[meta.subject];
  main.innerHTML = `<div class="print-only brand">GiellaStudio</div><p class="eyebrow">${bi('Bohtosat','Resultater')} · ${esc(subject.se)} / ${esc(subject.nb)}${meta.grade?' · '+esc(meta.grade):''}</p><h1 tabindex="-1" lang="${meta.language}">${esc(meta.title)}</h1>
    <section class="panel center"><h2>${bi('Geargan','Ferdig')}</h2><div class="score"><strong>${result.score} / ${result.total}</strong><span>${result.percent} %</span></div><p>${bi('Dahkkon bargobihtát','Fullførte oppgaver')}: ${result.completed} / ${result.total}</p><p class="muted"><time datetime="${esc(run.finished)}">${esc(formatTime(run.finished))}</time></p>
    <div class="result-stats"><div><strong>${result.first} / ${result.total}</strong>${bi('Vuosttaš geahččaleapmi','Riktig på første forsøk')}</div><div><strong>${result.models}</strong>${bi('Veahkki','Oppgaver med fasit')}</div></div>
    <p class="small" lang="nb">1 poeng når du finner riktig svar innen tre forsøk. Fasit etter tre feil gir 0 poeng. Hint er tillatt.</p></section>
    <div class="actions no-print">${btn('show-teacher','Čájet oahpaheaddjái','Vis læreren','primary')}${btn('print','Vurke PDF:n','Lagre som PDF')}</div>
    <p class="note no-print">${bi('Vurke PDF:n', 'Velg «Lagre som PDF» i utskriftsvinduet. Last deretter opp filen i Teams.')}</p>
    <section class="panel"><h2>${bi('Du vástádusat','Dine svar')}</h2>${answerReport()}${run.extra.trim()?`<h3 lang="${meta.language}">${esc(pack.extra?.title||'EXTRA')}</h3><p class="extra-answer" lang="${meta.language}" style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(run.extra)}</p><p class="small" lang="nb">EXTRA er ikke automatisk vurdert og inngår ikke i poengsummen.</p>`:''}</section>
    <p class="small muted">${bi('Čájet bohtosiid oahpaheaddjái.', 'Rapport fra denne enheten. Ingen automatisk innlevering eller bekreftet identitet.')}</p>
    <div class="actions no-print">${btn('restart','Hárjehala fas','Start en ny runde')}</div>`;
  document.querySelector('#show-teacher').onclick=showTeacher;
  document.querySelector('#print').onclick=()=>window.print();
  document.querySelector('#restart').onclick=()=> {
    openDialog(`<h2>${bi('Hárjehala fas','Starte en ny runde?')}</h2><p lang="nb">Lagre rapporten først hvis du vil beholde den. Den nye runden erstatter svarene i denne fanen.</p><div class="actions">${btn('cancel-restart','Ruovttoluotta','Behold resultatet')}${btn('confirm-restart','Álgge','Start ny runde','primary')}</div>`);
    document.querySelector('#cancel-restart').onclick=closeDialog;
    document.querySelector('#confirm-restart').onclick=()=> {closeDialog(); run=createRun(pack); pieceQuestion=''; selected='';draft='';message='';render();focusMain();};
  };
}
let returnFocus;
function openDialog(html, style='') {
  returnFocus=document.activeElement;
  const dialog=document.createElement('dialog'); dialog.id='student-dialog'; dialog.className=style;
  dialog.innerHTML=html; document.body.append(dialog); dialog.showModal();
  dialog.addEventListener('close',()=> { dialog.remove(); returnFocus?.focus(); });
}
function closeDialog() { document.querySelector('#student-dialog')?.close(); }
function showTeacher() {
  const result=summary(run,pack);
  openDialog(`<div class="show-inner center"><div class="brand">Giella<span>Studio</span></div><h2 lang="${meta.language}">${esc(meta.title)}</h2><p>${bi('Geargan','Ferdig')}</p><div class="score"><strong>${result.score} / ${result.total}</strong><span>${result.percent} %</span></div><p>${bi('Dahkkon bargobihtát','Fullførte oppgaver')}: ${result.completed} / ${result.total}</p><p><time datetime="${esc(run.finished)}">${esc(formatTime(run.finished))}</time></p><p class="muted" lang="nb">${esc(subjects[meta.subject].nb)} · ${groupLabel(meta)?esc(groupLabel(meta))+' · ':''} ${result.first} riktige på første forsøk · ${result.models} med fasit</p><div class="actions">${btn('close-teacher','Ruovttoluotta','Tilbake til resultatene','primary')}</div></div>`, 'show-teacher');
  document.querySelector('#close-teacher').onclick=closeDialog;
}
