import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pack from '../data/mi-actividad-favorita.js';
import { packages } from '../data/packages.js';
import { createRun,submit,getRecord,summary,finish,restoreRun,normalize,questions } from '../js/core.js';
const all=questions(pack);
test('Kolmas virhe avaa mallin, etenemisen ja lukitsee nollapisteen',()=>{
  const run=createRun(pack); const q=all[0];
  assert.equal(submit(run,q,''),'empty');assert.equal(getRecord(run,q.id).attempts.length,0);
  assert.equal(submit(run,q,'väärin'),'retry');assert.equal(submit(run,q,'väärin'),'retry');
  assert.equal(getRecord(run,q.id).done,false);assert.equal(submit(run,q,'väärin'),'model');
  assert.equal(submit(run,q,q.answers[0]),'locked');
  assert.deepEqual(summary(run,pack),{total:10,completed:1,score:0,percent:0,first:0,models:1,hints:0});
});
test('Vihje, korjaus, 9/10 tulos ja pysyvä valmistumisaika',()=>{
  const run=createRun(pack);getRecord(run,all[0].id).hint=true;
  submit(run,all[0],'väärin');submit(run,all[0],all[0].answers[0]);
  for(const q of all.slice(1,-1)) submit(run,q,q.answers[0]);
  assert.equal(finish(run,pack),false);
  for(let i=0;i<3;i++) submit(run,all.at(-1),'väärin');
  assert.equal(finish(run,pack,'2026-09-26T17:42:00.000Z'),true);
  finish(run,pack,'2026-10-01T00:00:00.000Z');
  assert.equal(run.finished,'2026-09-26T17:42:00.000Z');
  assert.deepEqual(summary(run,pack),{total:10,completed:10,score:9,percent:90,first:8,models:1,hints:1});
  assert.deepEqual(restoreRun(JSON.stringify(run),pack),run);
});
test('Merkkien normalisointi säilyttää espanjan aksenttimerkit',()=>{
  assert.equal(normalize('  CANTO.  '),'canto');
  assert.equal(normalize('mu\u0301sica'),normalize('música'));
  assert.notEqual(normalize('musica'),normalize('música'));
});
test('Virheellinen tai vanha istunto hylätään; keskeneräisestä ei saa tulosta',()=>{
  assert.equal(restoreRun('invalid',pack),null);
  assert.equal(restoreRun(JSON.stringify({...createRun(pack),version:0}),pack),null);
  const run=createRun(pack);run.view='results';run.cursor=500;
  const restored=restoreRun(JSON.stringify(run),pack);
  assert.equal(restored.view,'exercise');assert.equal(restored.cursor,0);
});
test('Julkaistut paketit ja kaikki suorat HTML-polut vastaavat toisiaan',async()=>{
  const root=fileURLToPath(new URL('../',import.meta.url));const ids=new Set();
  for(const p of packages) {
    assert(!ids.has(p.id));ids.add(p.id);
    const data=(await import('../'+p.data)).default;
    assert.equal(data.id,p.id);
    const qids=new Set();
    for(const q of questions(data)) {
      assert(!qids.has(q.id));qids.add(q.id);assert(q.answers.length>0);
      if(q.type==='choice') assert(q.answers.every(a=>q.options.includes(a)));
    }
    const html=fs.readFileSync(path.join(root,p.path,'index.html'),'utf8');
    assert(html.includes(`data-package="${p.id}"`));
    for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if(link.startsWith('#'))continue;
      const local=path.resolve(root,p.path,link.split('?')[0]);assert(local.startsWith(root));assert(fs.existsSync(local),link);
    }
  }
});
