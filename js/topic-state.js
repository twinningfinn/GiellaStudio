import { createRun, restoreRun } from './core.js';

export const topicKey = id => `giellastudio:topics:1:${id}`;
export function freshTopic(pack) {
  return { run:createRun(pack), seen:[], gameDone:false };
}
export function readTopic(storage, pack) {
  const state=freshTopic(pack);
  const raw=storage.getItem(topicKey(pack.id));
  if(raw) {
    try {
      const saved=JSON.parse(raw);
      state.run=restoreRun(JSON.stringify(saved.run),pack)||state.run;
      state.seen=[...new Set((Array.isArray(saved.seen)?saved.seen:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<pack.cards.length))];
      state.gameDone=saved.gameDone===true;
      return state;
    } catch { return state; }
  }
  // Keep work from old shared links when topics replace the weekly layout.
  const records={}, drafts={};
  for(const week of [1,2]) {
    try {
      const old=JSON.parse(storage.getItem(`giellastudio:classroom:0.1:espanol-semana-${week}`));
      Object.assign(records,old?.records); Object.assign(drafts,old?.drafts);
    } catch { /* A damaged older save must not prevent practice. */ }
  }
  state.run=restoreRun(JSON.stringify({...state.run,records,drafts}),pack)||state.run;
  return state;
}
export function shuffle(items, random=Math.random) {
  const out=[...items];
  for(let i=out.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
export function memoryDeck(pairs) {
  return shuffle(pairs.flatMap((pair,id)=>[{id,side:'left',text:pair.left},{id,side:'right',text:pair.right}]));
}
export function isPair(a,b) { return Boolean(a&&b&&a.id===b.id&&a.side!==b.side); }
