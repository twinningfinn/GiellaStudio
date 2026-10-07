import { bi, greetings, numerals, numberWords, pronouns, wordList, choose, writeWord, optionalReflection } from './espanol-campo-content.js';

const greetingQuestions = greetings.map((word, i) => choose(`s1-saludo-${i + 1}`, word,
  [greetings[(i + 4) % greetings.length].es, greetings[(i + 7) % greetings.length].es], i));
greetingQuestions.push(
  writeWord('s1-saludo-write-ok', greetings[9], ['Estoy OK', '¡Estoy OK!']),
  writeWord('s1-saludo-write-dia', greetings[4], ['Buenos días', '¡Buenos días!']),
  writeWord('s1-saludo-write-cansado', greetings[11], ['Estoy cansada', 'Estoy cansado', '¡Estoy cansada!', '¡Estoy cansado!'])
);
greetingQuestions.at(-1).hint = bi('Estoy c…', 'Velg én form: cansada eller cansado. Begge godtas.');
greetingQuestions.at(-1).explanation = bi('Estoy cansada / Estoy cansado = Lean váibbas.', 'Cansada og cansado betyr begge «sliten». Begge svarene godtas her.');

const numberQuestions = numerals.map((word, i) => i < 10
  ? choose(`s1-numero-${i + 1}`, { es: word, se: String(i + 1), nb: `Tallet ${i + 1}` }, [numerals[(i + 3) % 15], numerals[(i + 7) % 15]], i)
  : writeWord(`s1-numero-${i + 1}`, { es: word, se: String(i + 1), nb: `Skriv tallet ${i + 1} på spansk.` }));
for (const n of [2, 7, 10]) numberQuestions.push(writeWord(`s1-numero-repaso-${n}`, { es: numerals[n - 1], se: String(n), nb: `Skriv tallet ${n} på spansk.` }));

const pronounQuestions = pronouns.map((word, i) => choose(`s1-pronombre-${i + 1}`, word,
  [pronouns[(i + 2) % pronouns.length].es, pronouns[(i + 5) % pronouns.length].es], i));
const vocabularyQuestions = wordList.map((word, i) => i < 6
  ? choose(`s1-palabra-${i + 1}`, word, [wordList[(i + 3) % wordList.length].es, wordList[(i + 7) % wordList.length].es], i)
  : writeWord(`s1-palabra-${i + 1}`, word, word.es === '¿qué?' ? ['qué', '¿qué?'] : [word.es]));

export default {
  id: 'espanol-semana-1', version: 1, persistent: true,
  worksheet: 'output/pdf/espanol-semana-1.pdf',
  letters: ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'],
  introTitle: bi('Sátnekoarttat', 'Ord fra øvingsheftet'),
  plan: bi('Golbma oanehis hárjehusa: 15–20 minuhta juohke háve. Hárjehala go dus lea áigi. Sáhtát joatkit maŋŋil.', 'Tre korte økter på 15–20 minutter. Ta én del om gangen når arbeidet ute gir rom for det. Se på støttearket, prøv selv, og bruk hint ved behov. Lagre PDF-arket før du drar hvis du trenger å jobbe uten nett. Etter hver del kan du ta en pause.'),
  vocabulary: greetings,
  sections: [
    {
      id: 'saludos', title: '1 · Saludos · 15–20 min', checkpoint: true,
      instruction: bi('Vállje rievttes vástádusa. Čále de ieš.', 'Velg først uttrykket som passer. Skriv deretter tre svar selv.'),
      lessonText: bi('Loga cealkagiid. «Estoy OK» = «Manná áibbas ok.» estar: -AR · Irregular.', 'Les uttrykkene høyt hvis det passer. «Estoy OK» er uttrykket fra det nyeste heftet. Buenos días brukes om morgenen, buenas tardes om ettermiddagen og buenas noches om kvelden/natten. Cansada/cansado er to former av «sliten». Vi øver uttrykkene som hele fraser. Estar: -AR · Irregular (uregelmessig); estoy følger ikke det regelmessige mønsteret vi øver i uke 2.'),
      studyWords: greetings, questions: greetingQuestions
    },
    {
      id: 'numeros', title: '2 · Números 1–15 · 15–20 min', checkpoint: true,
      instruction: bi('Vállje rievttes vástádusa. Čále de loguid spánskkagillii.', 'Velg riktig tallord først. Skriv deretter tallene med spanske bokstaver, ikke sifre.'),
      lessonText: bi('Loga loguid 1–15. Hárjehala vihtta logu hávális.', 'Les tallene 1–15 i grupper på fem. Tell gjerne noen ting du har for hånden. Oppgavene trenger ingen opplysninger om arbeidet ditt. Se spesielt på seis/siete og doce/trece.'),
      studyWords: numberWords, questions: numberQuestions
    },
    {
      id: 'pronombres-palabras', title: '3 · Pronombres y palabras · 15–20 min', checkpoint: true,
      instruction: bi('Vállje rievttes vástádusa. Čále de ieš.', 'Velg riktig pronomen og ord. Til slutt skriver du fem ord selv. Bruk begge støttespråkene når du skiller han/hun og de-formene.'),
      lessonText: bi('Loga sániid. yo = mun, tú = don, él / ella = son, nosotros / nosotras = mii, vosotros / vosotras = dii, ellos / ellas = sii.', 'Yo = jeg, tú = du, él = han og ella = hun. Nosotros/nosotras betyr vi; vosotros/vosotras betyr dere. Formene på -as brukes om grupper med bare jenter/kvinner. Nosotros, vosotros og ellos brukes om gutter/menn eller blandede grupper. Samisk son og sii skiller ikke mellom han/hun og disse de-formene. Aksentene i tú, él og qué hører til skrivemåten.'),
      studyWords: [...pronouns, ...wordList], questions: [...pronounQuestions, ...vocabularyQuestions]
    }
  ],
  extra: optionalReflection
};
