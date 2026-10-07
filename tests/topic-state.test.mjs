import test from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../data/espanol-topics.js';
import { freshTopic, readTopic, topicKey, shuffle, memoryDeck, isPair } from '../js/topic-state.js';
import { createRun, questions, getRecord, setDraft, submit, summary, finish } from '../js/core.js';

const storageWith = entries => {
  const data = new Map(entries);
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
};
const oldKey = n => `giellastudio:classroom:0.1:espanol-semana-${n}`;

test('migration preserves all 101 answers, corrections, models and hint use in their topics', () => {
  const source = [createRun({ version: 1 }), createRun({ version: 1 })];
  const expected = new Map();
  topics.flatMap(questions).forEach((q, index) => {
    const run = source[q.id.startsWith('s1-') ? 0 : 1];
    if (index % 5 === 0) getRecord(run, q.id).hint = true;
    if (index % 7 === 0) {
      for (let i = 0; i < 3; i++) submit(run, q, 'incorrecto');
    } else {
      if (index % 3 === 0) submit(run, q, 'incorrecto');
      submit(run, q, q.answers[0]);
    }
    expected.set(q.id, structuredClone(getRecord(run, q.id)));
  });
  // Unknown content in an older save must never enter a topic's report.
  source[0].records['unrelated-question'] = { attempts: ['personal text'], done: true };
  const storage = storageWith(source.map((run, i) => [oldKey(i + 1), JSON.stringify(run)]));
  let migrated = 0;
  for (const pack of topics) {
    const state = readTopic(storage, pack);
    for (const q of questions(pack)) {
      assert.deepEqual(getRecord(state.run, q.id), expected.get(q.id), q.id);
      migrated++;
    }
    assert.equal(summary(state.run, pack).completed, questions(pack).length);
    assert.ok(!Object.hasOwn(state.run.records, 'unrelated-question'));
    assert.equal(state.gameDone, false);
    assert.deepEqual(state.seen, []);
    storage.setItem(topicKey(pack.id), JSON.stringify(state));
    const reopened = readTopic(storage, pack);
    assert.deepEqual(summary(reopened.run, pack), summary(state.run, pack));
  }
  assert.equal(migrated, 101);
});

test('migration keeps pending choice, verb-piece and written answers without counting attempts', () => {
  const qs = topics.flatMap(questions);
  const choice = qs.find(q => q.type === 'choice');
  const pieces = qs.find(q => q.type === 'pieces');
  const write = qs.find(q => q.type === 'write');
  const source = [createRun({ version: 1 }), createRun({ version: 1 })];
  const values = [
    [choice, choice.options[1]],
    [pieces, { stem: pieces.pieces.fixedStem, ending: pieces.pieces.endings[2] }],
    [write, 'respuesta pendiente']
  ];
  for (const [q, value] of values) setDraft(source[q.id.startsWith('s1-') ? 0 : 1], q, value);
  const storage = storageWith(source.map((run, i) => [oldKey(i + 1), JSON.stringify(run)]));
  for (const [q, value] of values) {
    const pack = topics.find(topic => questions(topic).some(item => item.id === q.id));
    const state = readTopic(storage, pack);
    assert.deepEqual(state.run.drafts[q.id], value, q.id);
    assert.equal(getRecord(state.run, q.id).attempts.length, 0);
    assert.equal(summary(state.run, pack).completed, 0);
  }
});

test('topic saves restore progress and completion times and take precedence over legacy saves', () => {
  const pack = topics[0], qs = questions(pack);
  const state = freshTopic(pack);
  state.seen = [0, 2];
  state.gameDone = true;
  for (const q of qs) submit(state.run, q, q.answers[0]);
  finish(state.run, pack, '2026-10-07T10:30:00.000Z');
  const storage = storageWith([[topicKey(pack.id), JSON.stringify(state)]]);
  const restored = readTopic(storage, pack);
  assert.deepEqual(restored.run.records, state.run.records);
  assert.equal(restored.run.finished, '2026-10-07T10:30:00.000Z');
  assert.equal(restored.run.view, 'results');
  assert.deepEqual(restored.seen, [0, 2]);
  assert.equal(restored.gameDone, true);
  assert.equal(summary(restored.run, pack).score, qs.length);

  // Explicitly restarting a topic must not revive an old completed run.
  storage.setItem(oldKey(2), JSON.stringify(state.run));
  storage.setItem(topicKey(pack.id), JSON.stringify(freshTopic(pack)));
  assert.equal(summary(readTopic(storage, pack).run, pack).completed, 0);
});

test('corrupted or incompatible saves recover safely and card indexes are validated', () => {
  const pack = topics[0];
  for (const raw of ['{broken', 'null', '[]', '{}', '"text"']) {
    const state = readTopic(storageWith([[topicKey(pack.id), raw]]), pack);
    assert.equal(summary(state.run, pack).completed, 0, raw);
    assert.deepEqual(state.seen, [], raw);
    assert.equal(state.gameDone, false, raw);
  }
  const state = freshTopic(pack);
  state.run.version = 99;
  state.seen = [-1, 0, 0, 1.5, 2, pack.cards.length, '3', null];
  state.gameDone = 'true';
  const restored = readTopic(storageWith([[topicKey(pack.id), JSON.stringify(state)]]), pack);
  assert.equal(summary(restored.run, pack).completed, 0);
  assert.deepEqual(restored.seen, [0, 2]);
  assert.equal(restored.gameDone, false);

  const q = questions(pack)[0];
  const legacy = createRun(pack);
  submit(legacy, q, q.answers[0]);
  const recovered = readTopic(storageWith([[oldKey(1), '{broken'], [oldKey(2), JSON.stringify(legacy)]]), pack);
  assert.equal(getRecord(recovered.run, q.id).correct, true);
});

test('each shuffle remains a new permutation and never mutates the source', () => {
  const source = Object.freeze(['a', 'b', 'c', 'd', 'e', 'f']);
  for (const random of [() => 0, () => 0.25, () => 0.5, () => 0.999999]) {
    const shuffled = shuffle(source, random);
    assert.notEqual(shuffled, source);
    assert.deepEqual([...shuffled].sort(), [...source].sort());
    assert.deepEqual(source, ['a', 'b', 'c', 'd', 'e', 'f']);
  }
  assert.notDeepEqual(shuffle(source, () => 0), source);
  assert.deepEqual(shuffle([], () => 0), []);
  assert.deepEqual(shuffle(['solo'], () => 0), ['solo']);
});

test('memory decks contain one tile per side and only matching identities form pairs', () => {
  for (const pack of topics) {
    const before = structuredClone(pack.pairs);
    const deck = memoryDeck(pack.pairs);
    assert.equal(deck.length, pack.pairs.length * 2);
    assert.deepEqual(pack.pairs, before);
    for (const [id, pair] of pack.pairs.entries()) {
      const tiles = deck.filter(tile => tile.id === id);
      assert.equal(tiles.length, 2);
      const left = tiles.find(tile => tile.side === 'left');
      const right = tiles.find(tile => tile.side === 'right');
      assert.equal(left.text, pair.left);
      assert.equal(right.text, pair.right);
      assert.ok(isPair(left, right));
      assert.ok(isPair(right, left));
      assert.equal(isPair(left, left), false);
      assert.equal(isPair(right, right), false);
      assert.equal(isPair(left, deck.find(tile => tile.id !== id)), false);
    }
  }
  assert.equal(isPair(null, undefined), false);
  assert.equal(isPair({ id: 0, side: 'left', text: 'same' }, { id: 1, side: 'right', text: 'same' }), false);
});

test('blank submissions use no attempts and corrections remain available after reopening', () => {
  const pack = topics.find(topic => questions(topic).some(q => q.answers.includes('cantáis')));
  const q = questions(pack).find(q => q.answers.includes('cantáis'));
  const state = freshTopic(pack);
  for (const blank of ['', ' ', '\n\t ']) assert.equal(submit(state.run, q, blank), 'empty');
  assert.equal(getRecord(state.run, q.id).attempts.length, 0);
  assert.equal(submit(state.run, q, 'cantais'), 'retry');
  setDraft(state.run, q, 'cantáis');
  const saved = readTopic(storageWith([[topicKey(pack.id), JSON.stringify(state)]]), pack);
  assert.equal(saved.run.drafts[q.id], 'cantáis');
  assert.deepEqual(getRecord(saved.run, q.id).attempts, ['cantais']);
  assert.equal(submit(saved.run, q, saved.run.drafts[q.id]), 'correct');
  assert.deepEqual(getRecord(saved.run, q.id).attempts, ['cantais', 'cantáis']);
  assert.ok(!Object.hasOwn(saved.run.drafts, q.id));
  assert.equal(summary(saved.run, pack).score, 1);
});
