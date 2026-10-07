import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, getRecord, setDraft, submit, restoreRun, summary } from '../js/core.js';

const first = { id:'number', type:'choice', options:['uno','dos'], answers:['uno'] };
const second = { id:'verb', type:'write', answers:['vivís'] };
const third = { id:'pieces', type:'pieces', answers:['manná + ∅'], pieces:{fixedStem:null,stems:['manná','mana'],endings:['','n']} };
const pack = { id:'draft-test', version:1, sections:[{questions:[first,second,third]}] };

test('Keskeneräinen kirjoitus ja saved position säilyvät selaimen sulkemista vastaavan sarjallistuksen yli', () => {
  const run=createRun(pack);
  submit(run,first,'uno');
  run.cursor=1;run.view='exercise';
  setDraft(run,second,'viví');
  const restored=restoreRun(JSON.stringify(run),pack);
  assert.equal(restored.cursor,1);
  assert.equal(restored.view,'exercise');
  assert.equal(restored.drafts.verb,'viví');
  assert.deepEqual(getRecord(restored,second.id).attempts,[]);
  assert.equal(summary(restored,pack).completed,1);
});

test('Tyhjäksi korjattu luonnos ei palaudu edelliseksi vääräksi vastaukseksi', () => {
  const run=createRun(pack);
  submit(run,second,'vivo');
  setDraft(run,second,'');
  const restored=restoreRun(JSON.stringify(run),pack);
  assert.equal(restored.drafts.verb,'');
  assert.deepEqual(getRecord(restored,second.id).attempts,['vivo']);
  setDraft(restored,second,'vivís');
  assert.equal(submit(restored,second,'vivís'),'correct');
  assert.equal(Object.hasOwn(restored.drafts,second.id),false);
  assert.equal(summary(restored,pack).first,0);
});

test('Valitsematon monivalinta ja palan päätteet erotetaan, mukaan lukien tyhjä pääte', () => {
  const run=createRun(pack);
  setDraft(run,first,'dos');
  setDraft(run,third,{stem:'manná',ending:''});
  let restored=restoreRun(JSON.stringify(run),pack);
  assert.equal(restored.drafts.number,'dos');
  assert.deepEqual(restored.drafts.pieces,{stem:'manná',ending:''});
  assert.equal(summary(restored,pack).completed,0);
  setDraft(run,third,{stem:'manná',ending:null});
  restored=restoreRun(JSON.stringify(run),pack);
  assert.deepEqual(restored.drafts.pieces,{stem:'manná',ending:null});
});

test('Tallenteesta hyväksytään vain tehtävän omat luonnosvalinnat; valmiin kohdan vastaus lukittuu', () => {
  const run=createRun(pack);
  run.drafts={number:'outside-options',verb:'x'.repeat(500),pieces:{stem:'foreign',ending:'foreign'},unknown:'secret'};
  const restored=restoreRun(JSON.stringify(run),pack);
  assert.equal(restored.drafts.number,'');
  assert.equal(restored.drafts.verb.length,100);
  assert.deepEqual(restored.drafts.pieces,{stem:null,ending:null});
  assert.equal(Object.hasOwn(restored.drafts,'unknown'),false);
  submit(restored,first,'uno');
  setDraft(restored,first,'dos');
  assert.equal(Object.hasOwn(restored.drafts,first.id),false);
  assert.equal(submit(restored,first,'dos'),'locked');
});

test('Vanha tallenne ilman luonnoskenttää toimii, ja paketin version vaihto hylkää vanhan tallenteen', () => {
  const run=createRun(pack);delete run.drafts;
  submit(run,first,'uno');run.cursor=1;run.view='exercise';
  assert.deepEqual(restoreRun(JSON.stringify(run),pack).drafts,{});
  assert.equal(restoreRun(JSON.stringify(run),{...pack,version:2}),null);
});
