import {esc,promptText} from './ui.js';
import {verbs,endings,wordList} from '../data/espanol-campo-content.js';

const pronouns=new Set(['yo','tú','él','ella','nosotros','nosotras','vosotros','vosotras','ellos','ellas']);
const regularVerbs=new Map(Object.entries(verbs).map(([verb,data])=>[verb,data.group]));
for(const word of wordList)if(word.regularity==='Regular')regularVerbs.set(word.es,word.verbGroup);
const inflections=new Map();
for(const [verb,group] of regularVerbs){
  const stem=verb.slice(0,-2);
  for(const ending of endings[group])inflections.set(stem+ending,{stem,ending});
}

// Mark complete Spanish words only. Never infer endings from arbitrary suffixes.
export function grammarText(text){
  return (String(text??'').match(/[\p{L}\p{M}]+|[^\p{L}\p{M}]+/gu)||[]).map(token=>{
    const lower=token.toLocaleLowerCase('es');
    if(pronouns.has(lower))return `<span class="person">${esc(token)}</span>`;
    const form=inflections.get(lower);
    return form?`${esc(token.slice(0,form.stem.length))}<span class="ending">${esc(token.slice(form.stem.length))}</span>`:esc(token);
  }).join('');
}
export function instructionMarkup(value){
  if(!value)return '';
  return `<span class="instruction-es" lang="es">${esc(value.es)}</span><span class="instruction-support"><span lang="se">${esc(value.se)}</span><span lang="nb">${esc(value.nb)}</span></span>`;
}
export function sentencePerson(q){
  const person=q.context?.person||q.person;
  return person?person[0].toLocaleUpperCase('es')+person.slice(1):'';
}
export function questionLabel(q){
  if(q.context)return `<span lang="es">${grammarText(sentencePerson(q))} ${q.type==='pieces'?esc(q.pieces.fixedStem):''}<span class="answer-slot">___</span> ${esc(q.context.after)}.</span>`;
  return q.person?`<span lang="es">${grammarText(q.person)} · ${esc(q.verb)}</span>`:promptText(q.prompt);
}
export function answerMarkup(q){
  if(q.type==='pieces'){
    const [stem,ending]=q.answers[0].split(' + ');
    return `${esc(stem)} + <span class="ending">${esc(ending)}</span> → ${grammarText(stem+ending)}`;
  }
  return grammarText(q.model||q.answers[0]);
}
