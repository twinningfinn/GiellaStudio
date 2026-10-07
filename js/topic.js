import {topics} from '../data/espanol-topics.js?v=20261007-topics';
import {url,esc,promptText,focusMain,formatTime} from './ui.js';
import {questions,summary,getRecord,setDraft,submit,finish,createRun} from './core.js';
import {freshTopic,readTopic,topicKey,shuffle,memoryDeck,isPair} from './topic-state.js';

const main=document.querySelector('main');
const pack=topics.find(t=>t.id===document.body.dataset.package);
document.body.classList.add('spanish');
document.querySelector('#header').innerHTML=`<a class="brand" href="${url('espanja/')}">Giella<span>Studio</span></a><a href="${url('espanja/')}">Español</a>`;
let storage,storageOK=true,state;
try { storage=localStorage;state=readTopic(storage,pack); } catch {state=freshTopic(pack);storageOK=false;}
const all=questions(pack);
let mode='cards',card=0,flipped=false,feedback='',matchLeft=null,matchRight=null,matched=[],open=[],deck=[],leftOrder=[],rightOrder=[];
function save() {try {storage.setItem(topicKey(pack.id),JSON.stringify(state));storageOK=true;}catch{storageOK=false;}}
function gameName() {return pack.game==='memory'?'Memoria':'Une';}
function shell(content) {
  main.innerHTML=`<a class="topic-back" href="${url('espanja/')}">← Temas</a><div class="topic-heading"><h1 tabindex="-1">${esc(pack.title)}</h1>${pack.symbol.startsWith('-')?'<span class="regular-label">Regular</span>':''}</div><nav class="mode-nav" aria-label="Actividades">${[['cards','Tarjetas'],['game',gameName()],['quiz','Reto']].map(([id,label])=>`<button data-mode="${id}" ${mode===id?'aria-current="page"':''}>${label}${id==='cards'&&state.seen.length===pack.cards.length?' ✓':id==='game'&&state.gameDone?' ✓':id==='quiz'&&summary(state.run,pack).completed===all.length?' ✓':''}</button>`).join('')}</nav>${content}<div class="topic-bottom no-print"><a href="${url('output/pdf/espanol-temas.pdf')}" download>↓ PDF · Todos los temas</a><button id="report" class="text-button">Mis respuestas · PDF</button></div>${storageOK?'':'<p class="storage-warning" role="status">No se puede guardar. Guarda tus respuestas como PDF.</p>'}`;
  main.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;feedback='';render();focusMain();});
  document.querySelector('#report').onclick=renderReport;
}
function render() {if(mode==='cards')renderCards();else if(mode==='game')renderGame();else renderQuiz();}
function renderCards() {
  const item=pack.cards[card];
  const face=flipped?(item.se||item.back):item.front;
  shell(`<div class="activity-line"><span>Tarjetas</span><span>${card+1} / ${pack.cards.length}</span></div><button id="flashcard" class="flashcard ${flipped?'is-flipped':''}" aria-label="${esc(face)} · ${flipped?'Ver español':'Girar tarjeta'}" aria-pressed="${flipped}"><span class="flash-hint">${flipped?'↶':'↻'} Toca para girar</span><span class="flash-word" ${flipped&&item.se?'lang="se"':'lang="es"'}>${esc(face)}</span>${flipped&&item.se?`<span class="flash-support" lang="nb">${esc(item.back)}</span>`:''}</button><div class="card-controls"><button id="previous" ${card===0?'disabled':''} aria-label="Tarjeta anterior">←</button><span>${state.seen.length} / ${pack.cards.length} ✓</span><button id="next-card" ${card===pack.cards.length-1?'disabled':''} aria-label="Tarjeta siguiente">→</button></div><div class="actions"><button id="play" class="primary">${gameName()} →</button></div>`);
  document.querySelector('#flashcard').onclick=()=>{flipped=!flipped;if(flipped&&!state.seen.includes(card)){state.seen.push(card);save();}renderCards();document.querySelector('#flashcard').focus({preventScroll:true});};
  document.querySelector('#previous').onclick=()=>{card--;flipped=false;renderCards();document.querySelector('#flashcard').focus({preventScroll:true});};
  document.querySelector('#next-card').onclick=()=>{card++;flipped=false;renderCards();document.querySelector('#flashcard').focus({preventScroll:true});};
  document.querySelector('#play').onclick=()=>{mode='game';render();focusMain();};
}
function initGame() {matched=[];open=[];matchLeft=null;matchRight=null;feedback='';deck=memoryDeck(pack.pairs);leftOrder=shuffle(pack.pairs.map((_,i)=>i));rightOrder=shuffle(pack.pairs.map((_,i)=>i));}
function renderGame() {
  if(!deck.length)initGame();
  const complete=matched.length===pack.pairs.length;
  const body=pack.game==='memory'?`<div class="memory-grid">${deck.map((tile,i)=>{
    const found=matched.includes(tile.id),shown=found||open.includes(i);
    return `<button class="memory-card ${shown?'revealed':''} ${found?'matched':''}" data-tile="${i}" ${found?'disabled':''} aria-label="${shown?esc(tile.text)+(found?' · ✓':''):`Tarjeta ${i+1}`}" aria-pressed="${shown}">${shown?`<span>${esc(tile.text)}</span>${found?'<span aria-hidden="true">✓</span>':''}`:`<span aria-hidden="true">${i+1}</span>`}</button>`;
  }).join('')}</div>`:`<div class="match-grid">${[leftOrder,rightOrder].map((order,col)=>`<div class="match-column">${order.map(i=>`<button data-pair="${i}" data-side="${col}" class="match-card ${matched.includes(i)?'matched':''}" aria-pressed="${col===0?matchLeft===i:matchRight===i}" ${matched.includes(i)?'disabled':''}>${esc(pack.pairs[i][col===0?'left':'right'])}${matched.includes(i)?' ✓':''}</button>`).join('')}</div>`).join('')}</div>`;
  shell(`<div class="activity-line"><span>${pack.game==='memory'?'Encuentra las parejas':'Une las parejas'}</span><span>${matched.length} / ${pack.pairs.length} ✓</span></div>${body}<p class="game-feedback" role="status">${complete?'¡Todas las parejas!':feedback||'\u00a0'}</p>${pack.game==='memory'&&open.length===2?'<button id="close-pair">Seguir →</button>':''}<div class="actions">${complete?'<button id="game-again">Otra vez ↻</button><button id="challenge" class="primary">Reto →</button>':''}</div>`);
  main.querySelectorAll('[data-tile]').forEach(b=>b.onclick=()=>{
    const i=Number(b.dataset.tile);
    if(open.length===2){open=[];feedback='';renderGame();focusGame(`[data-tile="${i}"]`);return;}
    if(open.includes(i)||matched.includes(deck[i].id))return;
    open.push(i);
    if(open.length===2){if(isPair(deck[open[0]],deck[open[1]])){matched.push(deck[i].id);open=[];feedback='¡Bien!';}else feedback='Prueba otra vez.';}
    gameFinished();renderGame();focusGame(`[data-tile="${i}"]`);
  });
  main.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>{
    if(matchLeft!==null&&matchRight!==null){matchLeft=null;matchRight=null;}
    if(b.dataset.side==='0')matchLeft=Number(b.dataset.pair);else matchRight=Number(b.dataset.pair);
    feedback='';
    if(matchLeft!==null&&matchRight!==null){if(matchLeft===matchRight){matched.push(matchLeft);matchLeft=null;matchRight=null;feedback='¡Bien!';}else feedback='Prueba otra vez.';}
    const selector=`[data-pair="${b.dataset.pair}"][data-side="${b.dataset.side}"]`;
    gameFinished();renderGame();focusGame(selector);
  });
  document.querySelector('#close-pair')?.addEventListener('click',()=>{open=[];feedback='';renderGame();focusGame('[data-tile]');});
  document.querySelector('#game-again')?.addEventListener('click',()=>{initGame();renderGame();});
  document.querySelector('#challenge')?.addEventListener('click',()=>{mode='quiz';render();focusMain();});
}
function gameFinished(){if(matched.length===pack.pairs.length){state.gameDone=true;save();}}
function focusGame(selector){const preferred=main.querySelector(selector);(preferred&&!preferred.disabled?preferred:main.querySelector('#challenge, [data-tile]:not(:disabled), [data-pair]:not(:disabled)'))?.focus({preventScroll:true});}
function label(q){return q.person?`<span class="person">${esc(q.person)}</span> · ${esc(q.verb)}`:promptText(q.prompt);}
function answer(q){return q.model||q.answers[0];}
function draftReport(draft){return draft?`<p>${esc(typeof draft==='string'?draft:[draft.stem,draft.ending].filter(x=>x!=null).join(' + '))} <span class="report-status">(sin comprobar)</span></p>`:'';}
function hint(q){return q.person?`${q.person}: -${q.studyForms.find(f=>f[0]===q.person)[2]}`:`${q.answers[0].slice(0,2)}…`;}
function renderQuiz() {
  const result=summary(state.run,pack);
  if(state.run.finished){renderResult();return;}
  if(result.completed===all.length)state.run.cursor=all.length-1;
  const q=all[state.run.cursor],rec=getRecord(state.run,q.id),draft=state.run.drafts[q.id];
  const selected=typeof draft==='string'?draft:rec.attempts.at(-1)||'';
  const msg=rec.correct?'¡Bien!':rec.model?'Mira la respuesta.':feedback;
  shell(`<div class="activity-line"><span>Reto</span><span>${state.run.cursor+1} / ${all.length}</span></div><progress value="${result.completed}" max="${all.length}" aria-label="Completado"></progress><section class="panel quiz-panel"><h2>${label(q)}</h2><p class="quiz-instruction">${q.type==='choice'?'Elige.':q.type==='pieces'?'Elige la terminación.':'Escribe en español.'}</p><form id="quiz-form">${q.type==='choice'?`<div class="choices">${q.options.map((v,i)=>`<button type="button" data-choice="${i}" class="choice" aria-pressed="${selected===v}" ${rec.done?'disabled':''}>${esc(v)}</button>`).join('')}</div>`:q.type==='pieces'?`<div class="build-stem">${esc(q.pieces.fixedStem)} + <span id="chosen-ending">${esc(draft?.ending??'?')}</span></div><div class="endings">${q.pieces.endings.map((v,i)=>`<button type="button" data-ending="${i}" aria-pressed="${draft?.ending===v}" ${rec.done?'disabled':''}>${esc(v)}</button>`).join('')}</div>`:`<label class="sr-only" for="answer">Tu respuesta</label><input id="answer" type="text" value="${esc(selected)}" maxlength="100" autocomplete="off" autocapitalize="none" spellcheck="false" ${rec.done?'readonly':''}><div class="letter-keys">${['á','é','í','ó','ú','ñ','¿','¡'].map(v=>`<button type="button" data-letter="${v}" ${rec.done?'disabled':''}>${v}</button>`).join('')}</div>`}<div class="actions"><button type="submit" class="primary" ${rec.done?'disabled':''}>Comprobar</button><button type="button" id="hint">Pista</button></div></form>${rec.hint?`<p class="hint">${esc(hint(q))}</p>`:''}<div class="feedback ${rec.correct?'correct':''}" role="status">${msg?`<strong>${esc(msg)}</strong>${rec.done?`<p>${esc(answer(q))}</p>`:''}`:''}</div></section><div class="nav"><button id="back" ${state.run.cursor===0?'disabled':''}>←</button><button id="next" class="primary" ${rec.done?'':'disabled'}>Siguiente →</button></div>`);
  main.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{setDraft(state.run,q,q.options[Number(b.dataset.choice)]);save();main.querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  main.querySelectorAll('[data-ending]').forEach(b=>b.onclick=()=>{const ending=q.pieces.endings[Number(b.dataset.ending)];setDraft(state.run,q,{stem:q.pieces.fixedStem,ending});save();document.querySelector('#chosen-ending').textContent=ending;main.querySelectorAll('[data-ending]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  document.querySelector('#answer')?.addEventListener('input',e=>{setDraft(state.run,q,e.target.value);save();});
  main.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{const input=document.querySelector('#answer');if(input.value.length>=100)return;input.setRangeText(b.dataset.letter,input.selectionStart,input.selectionEnd,'end');setDraft(state.run,q,input.value);save();input.focus();});
  document.querySelector('#quiz-form').onsubmit=e=>{e.preventDefault();if(rec.done)return;const value=state.run.drafts[q.id];const status=submit(state.run,q,q.type==='pieces'?(value?.ending!=null?`${value.stem} + ${value.ending}`:''):value||'');feedback=status==='empty'?'Escribe o elige una respuesta.':status==='retry'?'Prueba otra vez.':'';save();renderQuiz();(document.querySelector(rec.done?'#next':'#answer')||document.querySelector('#save-report, #quiz-form button'))?.focus({preventScroll:true});};
  document.querySelector('#hint').onclick=()=>{rec.hint=true;save();renderQuiz();document.querySelector('#hint')?.focus({preventScroll:true});};
  document.querySelector('#next').onclick=()=>{if(!rec.done)return;feedback='';if(state.run.cursor<all.length-1)state.run.cursor++;else finish(state.run,pack);save();renderQuiz();focusMain();};
  document.querySelector('#back').onclick=()=>{state.run.cursor--;feedback='';save();renderQuiz();focusMain();};
}
function renderResult(){
  const r=summary(state.run,pack);
  shell(`<section class="topic-result"><div class="result-sun" aria-hidden="true">✦</div><h2>¡Reto terminado!</h2><p class="result-score">${r.score} / ${r.total}</p><p>${r.first} a la primera · ${r.models} con ayuda</p><div class="actions"><button id="save-report" class="primary">Mis respuestas · PDF</button><a class="button" href="${url('espanja/')}">Más temas →</a></div><button id="again" class="text-button">Repetir el reto ↻</button></section>`);
  document.querySelector('#save-report').onclick=renderReport;
  document.querySelector('#again').onclick=()=>{const d=document.createElement('dialog');d.innerHTML='<h2>¿Repetir el reto?</h2><p>Guarda el PDF antes de empezar.</p><div class="actions"><button id="cancel">Volver</button><button id="confirm" class="primary">Empezar</button></div>';document.body.append(d);d.showModal();d.querySelector('#cancel').onclick=()=>d.close();d.querySelector('#confirm').onclick=()=>{state.run=createRun(pack);save();d.close();renderQuiz();};d.onclose=()=>d.remove();};
}
function renderReport(){
  const r=summary(state.run,pack);
  main.innerHTML=`<div class="report-heading"><p>GiellaStudio · Español</p><h1 tabindex="-1">${esc(pack.title)}</h1><p>${r.completed} / ${r.total} completado · ${r.score} correctas</p><p>${esc(formatTime(state.run.finished||new Date().toISOString()))}</p></div><div class="actions no-print"><button id="print" class="primary">Guardar PDF</button><button id="return">← Volver</button></div><p class="small no-print">Guardar como PDF → Teams</p><ol class="topic-report">${all.map(q=>{const rec=getRecord(state.run,q.id);const draft=state.run.drafts[q.id];return `<li><h2>${label(q)}</h2><p>${rec.attempts.length?rec.attempts.map(esc).join(' → '):'—'}</p>${draftReport(draft)}<p class="report-status">${rec.correct?'✓ Correcto':rec.model?`Con ayuda · ${esc(answer(q))}`:'Sin terminar'}${rec.hint?' · Pista':''}</p></li>`;}).join('')}</ol>`;
  document.querySelector('#print').onclick=()=>window.print();document.querySelector('#return').onclick=()=>{render();focusMain();};focusMain();
}
save();render();
