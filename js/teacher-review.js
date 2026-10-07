import { packages } from '../data/packages.js?v=20261007-topics';
import { url, esc, bi, promptText, header, focusMain } from './ui.js?v=20261007-fieldpack';

header();
const main = document.querySelector('main');
main.classList.add('teacher-review');
const requested = new URLSearchParams(location.search).get('paketti');
const selected = requested
  ? packages.filter(pack => pack.id === requested)
  : packages.filter(pack => pack.subject === 'espanja' && pack.topic);
const reviewUrl = id => {
  const link = new URL(url('opettaja/katsaus/'));
  link.searchParams.set('paketti', id);
  return link.href;
};
const sectionId = (meta, index) => `review-${meta.id}-${index}`;
const bilingual = value => value?.es ? `<span lang="es">${esc(value.es)}</span>` : value ? bi(value.se || '', value.nb || '') : '';
const tags = value => [value.regularity, value.verbGroup].filter(Boolean).map(tag => `<span>${esc(tag)}</span>`).join('');
async function loadPackage(meta) {
  const module = await import(url(meta.data));
  const pack = meta.topic ? module.topics?.find(topic => topic.id === meta.id) : module.default;
  if (!pack) throw new Error('Tehtävän sisältö puuttuu: ' + meta.id);
  return {meta,pack};
}

function wordList(words = [], language = 'es') {
  return `<div class="word-list">${words.map(word => `<div class="word"><strong lang="${esc(language)}">${esc(word.es)}</strong>${bilingual(word)}${tags(word) ? `<div class="verb-tags">${tags(word)}</div>` : ''}</div>`).join('')}</div>`;
}
function forms(rows, language) {
  if (!rows?.length) return '';
  return `<div class="review-forms" lang="${esc(language)}">${rows.map(([person, stem, ending]) => `<div><span class="person">${esc(person)}</span><span>${esc(stem)}<span class="ending">${esc(ending)}</span></span></div>`).join('')}</div>`;
}
function sectionSupport(section, pack, language) {
  let content = section.lessonText ? `<p>${bilingual(section.lessonText)}</p>` : '';
  if (section.studyWords) content += wordList(section.studyWords, language);
  else if (section.id === 'vocabulario') content += wordList(pack.vocabulary, language);
  if (section.studyForms) content += forms(section.studyForms, language);
  else if (section.lesson) content += forms(section.lesson.forms.map(([person, ending]) => [person, section.lesson.stem, ending]), language);
  for (const entry of section.additionalStudyForms || []) content += `<h4 lang="${esc(language)}">${esc(entry.verb)}</h4>${forms(entry.forms, language)}`;
  return content ? `<details class="lesson"><summary>Oppimisohje ja tukimateriaali</summary><div class="lesson-content">${content}</div></details>` : '';
}
function prompt(question, language) {
  if (question.prompt) {
    return language === 'es' && question.person && question.verb
      ? `<span lang="es"><span class="person">${esc(question.person)}</span> · ${esc(question.verb)}</span>`
      : promptText(question.prompt);
  }
  return `<span lang="${esc(language)}"><span class="person">${esc(question.before)}</span> _____ ${esc(question.after)} <span class="muted">(${esc(question.verb)})</span></span>`;
}
function questionCard(question, number, language) {
  let task = '';
  if (question.type === 'choice') task = `<ol class="review-options" type="A" lang="${esc(language)}">${question.options.map(option => `<li>${esc(option)}</li>`).join('')}</ol>`;
  else if (question.type === 'pieces') {
    const fixed = question.pieces.fixedStem;
    task = `<dl class="review-pieces"><div><dt>${fixed == null ? 'Vartalovaihtoehdot' : 'Valmis vartalo'}</dt><dd lang="${esc(language)}">${fixed == null ? question.pieces.stems.map(esc).join(' · ') : esc(fixed)}</dd></div><div><dt>Päätevaihtoehdot</dt><dd class="ending" lang="${esc(language)}">${question.pieces.endings.map(value => esc(value || '∅')).join(' · ')}</dd></div></dl>`;
  } else task = '<p class="review-kind">Kirjoitettava vastaus</p>';
  const assistance = question.hint || question.explanation || question.studyForms
    ? `<details class="review-help"><summary>Vihje ja palautteen perustelu</summary>${question.hint ? `<h5>Vihje</h5><p>${bilingual(question.hint)}</p>` : ''}${question.explanation ? `<div class="review-solution"><h5>Palautteen perustelu</h5><p>${bilingual(question.explanation)}</p></div>` : ''}${question.studyForms ? `<h5>Taivutusmalli</h5>${forms(question.studyForms, language)}` : ''}</details>` : '';
  return `<li class="review-question"><div class="review-question-heading"><span class="review-number">${number}</span><h4>${prompt(question, language)}</h4></div>${tags(question) ? `<div class="verb-tags" lang="es">${tags(question)}</div>` : ''}${task}<div class="review-solution review-answer"><h5>Mallivastaus</h5><p lang="${esc(language)}">${esc(question.model || question.answers[0])}</p>${question.answers.length > 1 ? `<p class="small">Hyväksyttävät vastaukset: <span lang="${esc(language)}">${question.answers.map(esc).join(' / ')}</span></p>` : ''}</div>${assistance}</li>`;
}
function gamePreviews(meta, pack) {
  const cards = pack.cards || [];
  const pairs = pack.pairs || [];
  const gameName = pack.game === 'memory' ? 'Muistipeli' : 'Yhdistä parit';
  return `${cards.length ? `<details class="lesson review-games" id="review-${esc(meta.id)}-cards"><summary>Tarjetas · ${cards.length} sanakorttia</summary><div class="lesson-content"><div class="review-pair-headings"><span>Etupuoli</span><span class="review-solution">Kääntöpuoli</span></div><ol class="review-card-list">${cards.map(card => `<li><div class="review-card-front" lang="${esc(meta.language)}">${esc(card.front)}${tags(card) ? `<div class="verb-tags">${tags(card)}</div>` : ''}</div><div class="review-solution review-card-back">${card.se || card.nb ? bilingual(card) : `<span lang="${esc(meta.language)}">${esc(card.back)}</span>`}</div></li>`).join('')}</ol></div></details>` : ''}${pairs.length ? `<details class="lesson review-games" id="review-${esc(meta.id)}-pairs"><summary>${gameName} · ${pairs.length} paria</summary><div class="lesson-content"><p class="small muted">Samaan riviin kuuluvat kortit muodostavat oikean parin.</p><ol class="review-card-list">${pairs.map(pair => `<li><span lang="${esc(meta.language)}">${esc(pair.left)}</span><span class="review-solution" lang="${pack.verbGroup?'es':'nb'}">${esc(pair.right)}</span></li>`).join('')}</ol></div></details>` : ''}`;
}
function packageReview(meta, pack) {
  let number = 0;
  const total = pack.sections.reduce((sum, section) => sum + section.questions.length, 0);
  return `<article class="review-package" id="review-${esc(meta.id)}"><div class="review-package-heading"><p class="eyebrow">${total} tehtävää · ${pack.cards?.length || 0} sanakorttia</p><h2 lang="${esc(meta.language)}">${esc(meta.title)}</h2>${tags(pack) ? `<div class="verb-tags" lang="es">${tags(pack)}</div>` : ''}${pack.plan ? `<details class="lesson"><summary>Työskentelyohje</summary><div class="lesson-content">${bilingual(pack.plan)}</div></details>` : ''}<div class="actions"><a class="button primary" href="${esc(url(meta.path))}">Avaa oppilasversio</a>${pack.worksheet ? `<a class="button" href="${esc(url(pack.worksheet))}" download>Lataa tehtävä-PDF</a>` : ''}</div></div>${gamePreviews(meta,pack)}${pack.sections.map((section, index) => `<section class="review-section" id="${esc(sectionId(meta,index))}"><h3 lang="${esc(meta.language)}">${section.titleNb ? bi(section.title, section.titleNb) : esc(section.title)}</h3><p class="review-instruction">${bilingual(section.instruction)}</p>${sectionSupport(section,pack,meta.language)}${section.dialogue ? `<div class="panel dialogue" lang="${esc(meta.language)}">${section.dialogue.map(([speaker,text]) => `<p><strong>${esc(speaker)}</strong>${esc(text)}</p>`).join('')}</div>` : ''}<ol class="review-questions" start="${number+1}">${section.questions.map(question => questionCard(question,++number,meta.language)).join('')}</ol></section>`).join('')}${pack.extra ? `<section class="review-extra panel"><h3 lang="${esc(meta.language)}">${esc(pack.extra.title)}</h3><p>${bilingual(pack.extra.instruction)}</p><p class="review-solution" lang="${esc(meta.language)}">${esc(pack.extra.model)}</p><p class="small muted">Vapaaehtoinen avoin vastaus. Opettajan palaute, ei automaattista pisteytystä.</p></section>` : ''}<a class="review-top-link" href="#main">Takaisin katsauksen alkuun ↑</a></article>`;
}

if (!selected.length) {
  main.innerHTML = `<a href="${esc(url('opettaja/'))}">← Opettajan jakosivulle</a><h1 tabindex="-1">Opettajan tehtäväkatsaus</h1><p>Pyydettyä aihetta ei löytynyt. Valitse sisältö:</p><ul>${packages.map(meta => `<li><a href="${esc(reviewUrl(meta.id))}">${esc(meta.title)}</a></li>`).join('')}</ul><p><a href="${esc(url('opettaja/katsaus/'))}">Kaikki espanjan aiheet</a></p>`;
} else {
  const loaded = await Promise.allSettled(selected.map(loadPackage));
  const ready = loaded.filter(result => result.status === 'fulfilled').map(result => result.value);
  main.innerHTML = `<a href="${esc(url('opettaja/'))}">← Opettajan jakosivulle</a><h1 tabindex="-1">Opettajan tehtäväkatsaus</h1><p>Selaa kaikkia tehtäviä aiheittain. Sanakorttien ja peliparien sisältö avautuu kunkin aiheen alusta.</p><div class="review-toolbar"><label class="review-toggle"><input id="show-review-answers" type="checkbox" checked> Näytä mallivastaukset</label>${requested ? `<a href="${esc(url('opettaja/katsaus/'))}">Kaikki espanjan aiheet</a>` : ''}</div><nav class="review-jumps" aria-label="Siirry aiheeseen">${ready.map(({meta,pack}) => `<div><a class="review-topic-jump" href="#review-${esc(meta.id)}" lang="${esc(meta.language)}">${esc(meta.title)}</a><ul>${pack.cards?.length ? `<li><a href="#review-${esc(meta.id)}-cards">Sanakortit ja pelit</a></li>` : ''}${pack.sections.map((section,index) => `<li><a href="#${esc(sectionId(meta,index))}" lang="${esc(meta.language)}">${esc(section.title)}</a></li>`).join('')}</ul></div>`).join('')}</nav>${loaded.some(result => result.status === 'rejected') ? '<p role="alert">Osaa sisällöistä ei voitu ladata. Päivitä sivu ja tarkista yhteys.</p>' : ''}${ready.map(({meta,pack}) => packageReview(meta,pack)).join('')}`;
  document.querySelector('#show-review-answers').addEventListener('change', event => main.classList.toggle('hide-review-answers',!event.target.checked));
}
focusMain();
