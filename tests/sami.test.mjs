import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { makeVerbPack } from '../data/sami-verbs.js';
import { packages } from '../data/packages.js';
import { questions, createRun, submit, finish, restoreRun, summary } from '../js/core.js';
import { pieceValue } from '../js/pieces.js';
import { brandMarkup } from '../js/ui.js';

// Alkuperäisen prototyypin 36 muotoa. Testi varmistaa kopioinnin ja kaikki vaiheet.
const expected = {
  mannat: ['manan','manat','manná','manne','mannabeahtti','mannaba','mannat','mannabehtet','mannet'],
  goarrut: ['goarun','goarut','goarru','gorro','goarrubeahtti','goarruba','goarrut','goarrubehtet','gorrot'],
  viehkat: ['viegan','viegat','viehká','vihke','viehkabeahtti','viehkaba','viehkat','viehkabehtet','vihket'],
  boahtit: ['boađán','boađát','boahtá','bohte','boahtibeahtti','boahtiba','boahtit','boahtibehtet','bohtet']
};
for (const [verb, forms] of Object.entries(expected)) test(verb + ': alkuperäiset muodot ja koko kolmivaiheinen kierros', () => {
  const pack=makeVerbPack(verb), run=createRun(pack);
  assert.equal(questions(pack).length,27);
  assert.deepEqual(pack.sections[2].questions.map(q=>q.answers[0]),forms);
  for(const section of pack.sections) section.questions.forEach((q,i)=>{
    let answer=forms[i];
    if(q.type==='pieces') {
      const row=q.studyForms.find(row=>row[0]===q.person);
      assert.equal(row[1]+row[2],forms[i]);
      assert(q.pieces.stems.includes(row[1]));assert(q.pieces.endings.includes(row[2]));
      answer=pieceValue({stem:row[1],ending:row[2]});
    }
    assert.equal(submit(run,q,answer),'correct');
  });
  assert(finish(run,pack));assert.equal(summary(run,pack).score,27);
  assert.deepEqual(restoreRun(JSON.stringify(run),pack),run);
});
test('Pääte ∅ on valinta; puuttuva pääte ei kuluta yritystä; kolmas virhe avaa mallin',()=>{
  const pack=makeVerbPack('mannat'),run=createRun(pack),q=questions(pack)[2];
  assert.equal(submit(run,q,pieceValue({stem:'manná',ending:null})),'empty');
  assert.equal(submit(run,q,pieceValue({stem:'manná',ending:''})),'correct');
  const next=questions(pack)[3];
  for(let i=0;i<2;i++)assert.equal(submit(run,next,'manne + n'),'retry');
  assert.equal(submit(run,next,'manne + n'),'model');
  assert.equal(submit(run,next,next.answers[0]),'locked');
});
test('Oppilaan logo ja sivupohjat eivät linkitä pois tehtävästä',()=>{
  assert(!brandMarkup(true).includes('href='));assert(brandMarkup(false).includes('href='));
  for(const p of packages) {
    const html=fs.readFileSync(new URL('../'+p.path+'index.html',import.meta.url),'utf8');
    assert.deepEqual([...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1]),['#main']);
  }
});
