import test from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../data/espanol-topics.js';
import week1 from '../data/espanol-semana-1.js';
import week2 from '../data/espanol-semana-2.js';
import { numerals, greetings, pronouns, wordList } from '../data/espanol-campo-content.js';
import { wordExample } from '../data/espanol-examples.js';
import { questions } from '../js/core.js';

const all = topics.flatMap(questions);
test('all 101 saved quiz contracts are unchanged and every question has an example and short instructions', () => {
  const previous = [week1, week2].flatMap(questions);
  assert.equal(all.length, 101);
  assert.equal(new Set(all.map(q => q.id)).size, 101);
  for (const old of previous) {
    const q = all.find(item => item.id === old.id);
    assert.ok(q, old.id);
    for (const field of ['type', 'options', 'answers', 'pieces', 'person', 'verb', 'before', 'after']) {
      assert.deepEqual(q[field], old[field], `${q.id}: ${field}`);
    }
    assert.equal(typeof q.example, 'string', q.id);
    assert.ok(q.example.length > 5 && q.example.length < 100, q.id);
    assert.doesNotMatch(q.example, /<[^>]+>|undefined|null|___/);
    for (const language of ['es', 'se', 'nb']) {
      assert.ok(q.instruction[language]?.trim(), `${q.id}: ${language}`);
      assert.ok(q.instruction[language].length < 120);
    }
  }
  for (const topic of topics) {
    assert.equal(topic.version, 1);
    assert.equal(topic.persistent, true);
    for (const section of topic.sections) {
      for (const language of ['es', 'se', 'nb']) assert.ok(section.instruction[language]?.trim());
    }
  }
});

test('all 36 conjugation contexts and sentences agree with their accepted verb forms', () => {
  const people = ['yo', 'tú', 'ella', 'nosotros', 'vosotros', 'ellas'];
  const expected = {
    hablar: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
    cantar: ['canto', 'cantas', 'canta', 'cantamos', 'cantáis', 'cantan'],
    comer: ['como', 'comes', 'come', 'comemos', 'coméis', 'comen'],
    aprender: ['aprendo', 'aprendes', 'aprende', 'aprendemos', 'aprendéis', 'aprenden'],
    vivir: ['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven'],
    escribir: ['escribo', 'escribes', 'escribe', 'escribimos', 'escribís', 'escriben']
  };
  assert.equal(all.filter(q => q.verb).length, 36);
  for (const [verb, forms] of Object.entries(expected)) {
    const qs = all.filter(q => q.verb === verb);
    for (const [i, q] of qs.entries()) {
      assert.equal(q.context.person, people[i]);
      assert.ok(q.person.split(' / ').includes(q.context.person));
      assert.ok(q.context.after.length > 0);
      assert.equal(q.answers[0].replace(' + ', ''), forms[i]);
      assert.equal(q.stem + q.ending, forms[i]);
      const subject = people[i][0].toUpperCase() + people[i].slice(1);
      assert.equal(q.example, `${subject} ${forms[i]} ${q.context.after}.`);
      assert.equal(q.regularity, 'Regular');
    }
  }
  assert.equal(all.find(q => q.id === 's2-er-build-1').example, 'Tú comes bananas.');
  assert.equal(all.find(q => q.id === 's2-er-build-2').example, 'Ella come espaguetis.');
});

test('number examples use un with a singular noun and plural nouns for 2–15', () => {
  const qs = questions(topics.find(topic => topic.id === 'espanol-numeros'));
  assert.equal(qs.length, 21);
  for (const q of qs) {
    const number = numerals.indexOf(q.answers[0]);
    assert.ok(number >= 0);
    assert.equal(q.example, number === 0 ? 'Tengo un libro.' : `Tengo ${q.answers[0]} libros.`);
  }
  assert.doesNotMatch(JSON.stringify(qs.map(q => q.example)), /uno libro|un libros|dos libro\./);
});

test('pronoun examples preserve gender and all vocabulary examples contain the source word', () => {
  const expectedPronouns = {
    yo: 'Yo como pan.', 'tú': 'Tú comes bananas.', 'él': 'Él come espaguetis.', ella: 'Ella come espaguetis.',
    'nosotros / nosotras': 'Nosotros hablamos español.', 'vosotros / vosotras': 'Vosotros vivís en Noruega.',
    ellos: 'Ellos comen bananas.', ellas: 'Ellas comen bananas.'
  };
  for (const q of questions(topics.find(topic => topic.id === 'espanol-pronombres'))) {
    assert.equal(q.example, expectedPronouns[q.answers[0]]);
  }
  for (const q of questions(topics.find(topic => topic.id === 'espanol-palabras'))) {
    const word = q.answers[0].replace(/[¿?]/g, '').toLocaleLowerCase('es');
    assert.ok(q.example.toLocaleLowerCase('es').includes(word), q.id);
  }
  const greetingExamples = questions(topics.find(topic => topic.id === 'espanol-saludos')).map(q => q.example).join(' ');
  assert.match(greetingExamples, /Estoy OK/);
  assert.doesNotMatch(greetingExamples, /más o menos/i);
  for (const phrase of ['¡Hola!', 'Buenos días', 'Buenas tardes', 'Buenas noches']) {
    const expected = phrase.replace(/[¡!]/g, '');
    assert.equal(wordExample(phrase), `¡${expected}, Ana!`);
    assert.ok(wordExample(phrase).includes(expected));
  }
});

test('cards and games retain their words and share the same contextual examples as quiz questions', () => {
  for (const topic of topics) {
    for (const card of topic.cards) {
      assert.equal(typeof card.example, 'string');
      if (card.context) {
        const q = questions(topic).find(q => q.verb === card.verb && q.person === card.person);
        assert.equal(card.front, `${q.person} · ${q.verb}`);
        assert.equal(card.back, q.answers[0].replace(' + ', ''));
        assert.equal(card.example, q.example);
        assert.deepEqual(card.context, q.context);
      } else assert.equal(card.example, wordExample(card.front));
    }
    for (const pair of topic.pairs) {
      const card = topic.cards.find(card => card.front === pair.left && card.back === pair.right);
      assert.ok(card, pair.left);
      assert.equal(pair.example, card.example);
    }
  }
  for (const [id, words] of [['espanol-saludos', greetings], ['espanol-pronombres', pronouns], ['espanol-palabras', wordList]]) {
    const cards = topics.find(topic => topic.id === id).cards;
    assert.deepEqual(cards.map(c => [c.front, c.back]), words.map(w => [w.es, w.nb]));
  }
});
