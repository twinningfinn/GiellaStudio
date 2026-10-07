import {
  bi, greetings, numerals, numberWords, pronouns, wordList, verbWords,
  formsFor, conjugate, choose, writeWord
} from './espanol-campo-content.js';

// Question IDs and accepted answers stay stable so saved work can be migrated.
// The topics themselves have no dates, weeks, or required working order.
const letters = ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'];
const cardsFor = words => words.map(({ es, se, nb, ...metadata }) => ({
  front: es, back: nb, se, nb, ...metadata
}));
const pairsFor = (words, indexes) => indexes.map(i => ({ left: words[i].es, right: words[i].nb }));
const pack = (id, slug, title, symbol, game, cards, pairs, sections, metadata = {}) => ({
  id, slug, title, symbol, game, version: 1, persistent: true,
  worksheet: 'output/pdf/espanol-temas.pdf', letters, cards, pairs, sections, ...metadata
});

function verbTopic(group, primary, secondary, game) {
  const tag = group.toLowerCase();
  const words = verbWords.filter(word => word.es === primary || word.es === secondary);
  const cards = [
    ...cardsFor(words),
    ...[primary, secondary].flatMap(verb => formsFor(verb).map(([person, stem, ending]) => ({
      front: `${person} · ${verb}`, back: stem + ending,
      regularity: 'Regular', verbGroup: `-${group}`
    })))
  ];
  return pack(`espanol-${tag}`, `${tag}-verbos`, `${group}-verbos`, `-${group}`, game, cards,
    formsFor(primary).map(([person, stem, ending]) => ({ left: `${person} · ${primary}`, right: stem + ending })),
    [
      {
        id: `verbos-${tag}-construye`, title: `Construye · ${primary}`,
        instruction: { es: 'Elige la terminación.' },
        lessonText: { es: `${primary} → ${primary.slice(0, -2)} + terminación. Regular.` },
        studyWords: words, studyForms: formsFor(primary),
        questions: formsFor(primary).map((_, i) => conjugate(`s2-${tag}-build-${i}`, primary, i, 'pieces'))
      },
      {
        id: `verbos-${tag}-escribe`, title: `Escribe · ${secondary}`,
        instruction: { es: 'Escribe la forma del verbo.' },
        lessonText: { es: `${secondary} → ${secondary.slice(0, -2)} + terminación. Regular.` },
        studyWords: words, studyForms: formsFor(secondary),
        questions: formsFor(secondary).map((_, i) => conjugate(`s2-${tag}-write-${i}`, secondary, i, 'write'))
      }
    ], { regularity: 'Regular', verbGroup: `-${group}` });
}

const greetingQuestions = greetings.map((word, i) => choose(`s1-saludo-${i + 1}`, word,
  [greetings[(i + 4) % greetings.length].es, greetings[(i + 7) % greetings.length].es], i));
greetingQuestions.push(
  writeWord('s1-saludo-write-ok', greetings[9], ['Estoy OK', '¡Estoy OK!']),
  writeWord('s1-saludo-write-dia', greetings[4], ['Buenos días', '¡Buenos días!']),
  writeWord('s1-saludo-write-cansado', greetings[11], ['Estoy cansada', 'Estoy cansado', '¡Estoy cansada!', '¡Estoy cansado!'])
);
greetingQuestions.at(-1).hint = bi('Estoy c…', 'Velg én form: cansada eller cansado. Begge godtas.');
greetingQuestions.at(-1).explanation = bi('Estoy cansada / Estoy cansado = Lean váibbas.', 'Cansada og cansado betyr begge «sliten». Begge svarene godtas her.');
greetingQuestions.push(
  choose('s2-ar-repaso-saludo', greetings[9], ['Estoy bien', 'No estoy bien'], 2),
  choose('s2-er-repaso-saludo', greetings[1], ['¿Cómo te llamas?', 'Buenos días'], 1),
  choose('s2-ir-repaso-saludo', greetings[6], ['Buenas tardes', 'Buenos días'], 2)
);

const numberQuestions = numerals.map((word, i) => i < 10
  ? choose(`s1-numero-${i + 1}`, { es: word, se: String(i + 1), nb: `Tallet ${i + 1}` }, [numerals[(i + 3) % 15], numerals[(i + 7) % 15]], i)
  : writeWord(`s1-numero-${i + 1}`, { es: word, se: String(i + 1), nb: `Skriv tallet ${i + 1} på spansk.` }));
for (const n of [2, 7, 10]) numberQuestions.push(writeWord(`s1-numero-repaso-${n}`, { es: numerals[n - 1], se: String(n), nb: `Skriv tallet ${n} på spansk.` }));
numberQuestions.push(
  choose('s2-ar-repaso-numero', { ...numberWords[14], se: '15', nb: 'Tallet 15' }, ['cinco', 'trece'], 1),
  choose('s2-er-repaso-numero', { ...numberWords[10], se: '11', nb: 'Tallet 11' }, ['diez', 'doce'], 2),
  choose('s2-ir-repaso-numero', { ...numberWords[13], se: '14', nb: 'Tallet 14' }, ['cuatro', 'trece'], 1)
);

const pronounQuestions = pronouns.map((word, i) => choose(`s1-pronombre-${i + 1}`, word,
  [pronouns[(i + 2) % pronouns.length].es, pronouns[(i + 5) % pronouns.length].es], i));
pronounQuestions.push(
  choose('s2-ar-repaso-pronombre', pronouns[4], ['vosotros / vosotras', 'ellos'], 1),
  choose('s2-er-repaso-pronombre', pronouns[5], ['nosotros / nosotras', 'ellos'], 2),
  choose('s2-ir-repaso-pronombre', pronouns[7], ['ellos', 'ella'], 1)
);

const vocabularyQuestions = wordList.map((word, i) => i < 6
  ? choose(`s1-palabra-${i + 1}`, word, [wordList[(i + 3) % wordList.length].es, wordList[(i + 7) % wordList.length].es], i)
  : writeWord(`s1-palabra-${i + 1}`, word, word.es === '¿qué?' ? ['qué', '¿qué?'] : [word.es]));
vocabularyQuestions.push(
  writeWord('s2-ar-repaso-palabra', wordList[4]),
  writeWord('s2-er-repaso-palabra', wordList[6]),
  writeWord('s2-ir-repaso-palabra', wordList[5])
);

function wordTopic(id, slug, title, symbol, game, words, indexes, qs, lesson) {
  return pack(id, slug, title, symbol, game, cardsFor(words), pairsFor(words, indexes), [{
    id: slug, title,
    instruction: { es: 'Elige o escribe la respuesta.' },
    lessonText: { es: lesson }, studyWords: words, questions: qs
  }]);
}

export const topics = [
  verbTopic('AR', 'hablar', 'cantar', 'match'),
  verbTopic('IR', 'vivir', 'escribir', 'memory'),
  verbTopic('ER', 'comer', 'aprender', 'match'),
  wordTopic('espanol-saludos', 'saludos-y-frases', 'Saludos y frases', '¡Hola!', 'memory',
    greetings, [0, 1, 4, 6, 9, 11], greetingQuestions,
    'Estoy OK. Estoy cansada / cansado: las dos formas son correctas. Estar: -AR · Irregular.'),
  wordTopic('espanol-numeros', 'numeros', 'Números 1–15', '1–15', 'match',
    numberWords, [0, 3, 6, 9, 12, 14], numberQuestions,
    'Uno, dos, tres… quince. Escribe con letras.'),
  wordTopic('espanol-pronombres', 'pronombres', 'Pronombres', 'yo · tú', 'memory',
    pronouns, [0, 1, 2, 3, 4, 5], pronounQuestions,
    'Yo, tú, él, ella, nosotros / nosotras, vosotros / vosotras, ellos / ellas.'),
  wordTopic('espanol-palabras', 'palabras', 'Palabras', 'libro', 'match',
    wordList, [0, 1, 4, 5, 6, 10], vocabularyQuestions,
    'Lee las palabras. Después, elige o escribe.')
];

export const topicById = id => topics.find(topic => topic.id === id);
export default topics;
