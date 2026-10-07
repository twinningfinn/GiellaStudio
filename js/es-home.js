import {topics} from '../data/espanol-topics.js?v=20261007-sentences';
import {url,esc} from './ui.js';
import {readTopic} from './topic-state.js';
import {summary} from './core.js';
document.querySelector('#header').innerHTML=`<a class="brand" href="${url('')}">Giella<span>Studio</span></a><span>Español</span>`;
document.querySelector('main').innerHTML=`<div class="spanish-title"><h1>Español</h1><span class="title-sun" aria-hidden="true">✳</span></div><div class="topic-grid">${topics.map((pack,i)=>{
  let progress='';
  try {const state=readTopic(localStorage,pack);const result=summary(state.run,pack);progress=result.completed?`<span class="topic-progress">${result.completed===result.total?'✓ ':''}Reto ${result.completed} / ${result.total}</span>`:'';}catch{}
  return `<a class="topic-tile tile-${i}" href="${url(`espanja/8/${pack.slug}/`)}"><span class="tile-symbol" aria-hidden="true">${esc(pack.symbol)}</span><h2>${esc(pack.title)}</h2><span class="tile-footer"><span>Tarjetas · ${pack.game==='memory'?'Memoria':'Une'} · Reto</span><span aria-hidden="true">↗</span></span>${progress}</a>`;
}).join('')}</div><div class="home-download"><a href="${url('output/pdf/espanol-temas.pdf')}" download>↓ PDF · Todos los temas</a></div>`;
