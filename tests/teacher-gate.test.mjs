import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {matchesTeacherCode} from '../js/teacher-code.js';
const root=new URL('../',import.meta.url);
test('entry code rejects missing and incorrect values',async()=>{
  for(const value of ['',null,undefined,'wrong','profe','Profe13','13','x'.repeat(65)])assert.equal(await matchesTeacherCode(value),false);
  // The configured credential itself is verified through the browser form.
});
test('every published non-teacher HTML page is free of teacher navigation',()=>{
  const paths=fs.readFileSync(new URL('RELEASE_FILES.txt',root),'utf8').trim().split(/\r?\n/);
  for(const file of paths.filter(p=>p.endsWith('.html')&&!p.startsWith('opettaja/'))){
    const html=fs.readFileSync(new URL(file,root),'utf8');
    assert.doesNotMatch(html,/<a\b[^>]*href=["'][^"']*opettaja\//i,file);
    assert.doesNotMatch(html,/Profesor/,file);
  }
});
test('all teacher entry routes boot the gate instead of the content renderer',()=>{
  for(const file of ['opettaja/index.html','opettaja/katsaus/index.html']){
    const html=fs.readFileSync(new URL(file,root),'utf8');
    assert.match(html,/js\/teacher-entry\.js\?v=/,file);
    assert.doesNotMatch(html,/<script[^>]+(?:teacher-review|catalog)\.js/,file);
    assert.match(html,/name="robots" content="noindex, nofollow"/,file);
  }
});
