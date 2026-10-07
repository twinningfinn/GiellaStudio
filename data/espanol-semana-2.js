import { bi, greetings, numberWords, pronouns, wordList, verbWords, formsFor, conjugate, choose, writeWord, optionalReflection } from './espanol-campo-content.js';

const sets = [
  { id: 'ar', main: 'hablar', second: 'cantar', title: '1 · Verbos en -AR · 15–20 min',
    explanation: 'Ta bort -ar: hablar → habl-. Sett på endelsen som passer til personen: -o, -as, -a, -amos, -áis, -an. Cantar følger samme mønster med stammen cant-.',
    review: [
      choose('s2-ar-repaso-numero', { ...numberWords[14], se: '15', nb: 'Tallet 15' }, ['cinco', 'trece'], 1),
      choose('s2-ar-repaso-saludo', greetings[9], ['Estoy bien', 'No estoy bien'], 2),
      choose('s2-ar-repaso-pronombre', pronouns[4], ['vosotros / vosotras', 'ellos'], 1),
      writeWord('s2-ar-repaso-palabra', wordList[4])
    ], support: [numberWords[14], greetings[9], pronouns[4], wordList[4]] },
  { id: 'er', main: 'comer', second: 'aprender', title: '2 · Verbos en -ER · 15–20 min',
    explanation: 'Ta bort -er: comer → com-. Sett på endelsen: -o, -es, -e, -emos, -éis, -en. Aprender følger samme mønster med stammen aprend-. Yo slutter på -o, akkurat som med -AR.',
    review: [
      choose('s2-er-repaso-numero', { ...numberWords[10], se: '11', nb: 'Tallet 11' }, ['diez', 'doce'], 2),
      choose('s2-er-repaso-saludo', greetings[1], ['¿Cómo te llamas?', 'Buenos días'], 1),
      choose('s2-er-repaso-pronombre', pronouns[5], ['nosotros / nosotras', 'ellos'], 2),
      writeWord('s2-er-repaso-palabra', wordList[6])
    ], support: [numberWords[10], greetings[1], pronouns[5], wordList[6]] },
  { id: 'ir', main: 'vivir', second: 'escribir', title: '3 · Verbos en -IR · 15–20 min',
    explanation: 'Ta bort -ir: vivir → viv-. Sett på endelsen: -o, -es, -e, -imos, -ís, -en. Escribir følger samme mønster med stammen escrib-. Sammenlign med -ER: nosotros/nosotras har -imos og vosotros/vosotras har -ís.',
    review: [
      choose('s2-ir-repaso-numero', { ...numberWords[13], se: '14', nb: 'Tallet 14' }, ['cuatro', 'trece'], 1),
      choose('s2-ir-repaso-saludo', greetings[6], ['Buenas tardes', 'Buenos días'], 2),
      choose('s2-ir-repaso-pronombre', pronouns[7], ['ellos', 'ella'], 1),
      writeWord('s2-ir-repaso-palabra', wordList[5])
    ], support: [numberWords[13], greetings[6], pronouns[7], wordList[5]] }
];

export default {
  id: 'espanol-semana-2', version: 1, persistent: true,
  worksheet: 'output/pdf/espanol-semana-2.pdf',
  letters: ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'],
  introTitle: bi('Sátnekoarttat', 'Seks regelmessige verb fra øvingsheftet'),
  vocabulary: verbWords,
  plan: bi('Golbma oanehis hárjehusa: 15–20 minuhta juohke háve. Vállje vuos gehčosa. Čále de ieš.', 'Tre økter på 15–20 minutter: -AR, -ER og -IR. I hver økt bygger du seks former med ferdig stamme, skriver seks former selv og repeterer fire ting fra uke 1. Alle seks persongruppene er med. Bruk modellen når du trenger den, og ta pause mellom delene. Lagre støttearket som PDF før du drar hvis du trenger det uten nett.'),
  sections: sets.map(set => ({
    id: `verbos-${set.id}`, title: set.title, checkpoint: true,
    instruction: bi('Vállje gehčosa. Čále de vearbba rievttes hámi. Gearddut loahpas sániid.', 'Velg først endelsen til den ferdige stammen. Skriv deretter bare verbformen til neste verb. De fire siste oppgavene er repetisjon.'),
    lessonText: bi(`${set.main}: ${formsFor(set.main).map(([p, s, e]) => `${p} → ${s} + ${e}`).join('; ')}. Vállje gehčosa. Čále de ieš.`, `${set.explanation} Alle verbene her er Regular (regelmessige). Verbgruppen -AR/-ER/-IR viser infinitivens slutt; den forteller ikke i seg selv om et verb er regelmessig. Él og ella bruker samme form; det gjør også nosotros/nosotras, vosotros/vosotras og ellos/ellas innen hver gruppe.`),
    studyWords: [...verbWords.filter(w => w.es === set.main || w.es === set.second), ...set.support],
    studyForms: formsFor(set.main),
    additionalStudyForms: [{ verb: set.second, forms: formsFor(set.second) }],
    questions: [
      ...formsFor(set.main).map((_, i) => conjugate(`s2-${set.id}-build-${i}`, set.main, i, 'pieces')),
      ...formsFor(set.second).map((_, i) => conjugate(`s2-${set.id}-write-${i}`, set.second, i, 'write')),
      ...set.review
    ]
  })),
  extra: optionalReflection
};
