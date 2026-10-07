// Shared content for the two weeks. Based on the teacher's latest Övingshefte
// (espanol_geardduheapmi_ovingshefte1.pdf, with «Estoy OK»).
// New whole-sentence North Sámi instructions are drafts for teacher review.
export const bi = (se, nb) => ({ se, nb });

export const greetings = [
  { es: '¡Hola!', se: 'Bures!', nb: 'Hei!' },
  { es: '¿Cómo estás?', se: 'Movt manná?', nb: 'Hvordan har du det?' },
  { es: '¿Cómo te llamas?', se: 'Mii du namma lea?', nb: 'Hva heter du?' },
  { es: 'Me llamo…', se: 'Mu namma lea…', nb: 'Jeg heter…' },
  { es: 'Buenos días', se: 'Buorre iđit / buorre beaivi', nb: 'God morgen / god dag' },
  { es: 'Buenas tardes', se: 'Buorre eahketbeaivi', nb: 'God ettermiddag' },
  { es: 'Buenas noches', se: 'Buorre eahket / buorre idja', nb: 'God kveld / god natt' },
  { es: 'Estoy MUY bien', se: 'Manná hui bures!', nb: 'Det går veldig bra!' },
  { es: 'Estoy bien', se: 'Manná bures!', nb: 'Det går bra!' },
  { es: 'Estoy OK', se: 'Manná áibbas ok.', nb: 'Det går helt ok.' },
  { es: 'No estoy bien', se: 'Ii mana nu bures.', nb: 'Det går ikke bra.' },
  { es: 'Estoy cansada / cansado', se: 'Lean váibbas.', nb: 'Jeg er sliten.' },
  { es: '¡Estoy triste!', se: 'Mun lean morašlaš.', nb: 'Jeg er trist.' }
];

export const numerals = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince'];
const norwegianNumbers = ['én / ett', 'to', 'tre', 'fire', 'fem', 'seks', 'sju', 'åtte', 'ni', 'ti', 'elleve', 'tolv', 'tretten', 'fjorten', 'femten'];
export const numberWords = numerals.map((es, i) => ({ es, se: String(i + 1), nb: `${i + 1} · ${norwegianNumbers[i]}` }));

export const pronouns = [
  { es: 'yo', se: 'mun', nb: 'jeg' },
  { es: 'tú', se: 'don', nb: 'du' },
  { es: 'él', se: 'son', nb: 'han' },
  { es: 'ella', se: 'son', nb: 'hun' },
  { es: 'nosotros / nosotras', se: 'mii', nb: 'vi' },
  { es: 'vosotros / vosotras', se: 'dii', nb: 'dere' },
  { es: 'ellos', se: 'sii', nb: 'de · hankjønn eller blandet gruppe' },
  { es: 'ellas', se: 'sii', nb: 'de · hunkjønn' }
];

export const wordList = [
  { es: 'hablar', se: 'hupmat', nb: 'å snakke', regularity: 'Regular', verbGroup: '-AR' },
  { es: 'Noruega', se: 'Norga', nb: 'Norge' },
  { es: 'estudiar', se: 'oahppat', nb: 'å studere', regularity: 'Regular', verbGroup: '-AR' },
  { es: 'mucho', se: 'ollu', nb: 'mye' },
  { es: 'un libro', se: 'girji', nb: 'en bok' },
  { es: 'lo siento', se: 'Ándagassii', nb: 'unnskyld / beklager' },
  { es: 'pero', se: 'muhto', nb: 'men' },
  { es: 'no', se: 'ii', nb: 'nei / ikke' },
  { es: '¿qué?', se: 'maid?', nb: 'hva?' },
  { es: 'vivir', se: 'orrut', nb: 'å bo', regularity: 'Regular', verbGroup: '-IR' },
  { es: 'escuchar', se: 'guldalit', nb: 'å lytte', regularity: 'Regular', verbGroup: '-AR' }
];

export const people = ['yo', 'tú', 'él / ella', 'nosotros / nosotras', 'vosotros / vosotras', 'ellos / ellas'];
export const endings = {
  '-AR': ['o', 'as', 'a', 'amos', 'áis', 'an'],
  '-ER': ['o', 'es', 'e', 'emos', 'éis', 'en'],
  '-IR': ['o', 'es', 'e', 'imos', 'ís', 'en']
};
export const verbs = {
  hablar: { group: '-AR', se: 'hupmat', nb: 'å snakke' },
  cantar: { group: '-AR', se: 'lávlut', nb: 'å synge' },
  comer: { group: '-ER', se: 'borrat', nb: 'å spise' },
  aprender: { group: '-ER', se: 'oahppat', nb: 'å lære' },
  vivir: { group: '-IR', se: 'orrut', nb: 'å bo' },
  escribir: { group: '-IR', se: 'čállit', nb: 'å skrive' }
};
export const verbWords = Object.entries(verbs).map(([es, v]) => ({ es, se: v.se, nb: v.nb, regularity: 'Regular', verbGroup: v.group }));
export const formsFor = verb => people.map((person, i) => [person, verb.slice(0, -2), endings[verbs[verb].group][i]]);

// Vary the correct answer's position without randomising a saved exercise.
export function choose(id, word, distractors, index = 0) {
  const options = [word.es, ...distractors];
  const offset = index % options.length;
  return {
    id, type: 'choice', prompt: bi(word.se, word.nb),
    options: [...options.slice(offset), ...options.slice(0, offset)], answers: [word.es],
    hint: bi(`${word.es.slice(0, 2)}…`, `Uttrykket begynner med «${word.es.slice(0, 2)}».`),
    explanation: bi(`${word.es} = ${word.se}`, `${word.es} = ${word.nb}`)
  };
}
export function writeWord(id, word, answers = [word.es]) {
  return {
    id, type: 'write', prompt: bi(word.se, word.nb), answers,
    hint: bi(`${word.es.slice(0, 2)}…`, `Begynn med «${word.es.slice(0, 2)}». Se på ordlisten hvis du trenger hjelp.`),
    explanation: bi(`${word.es} = ${word.se}`, `${word.es} = ${word.nb}`)
  };
}
export function conjugate(id, verb, i, type) {
  const forms = formsFor(verb);
  const [person, stem, ending] = forms[i];
  const formula = `${stem} + ${ending}`;
  return {
    id, type, person, verb, regularity: 'Regular', verbGroup: verbs[verb].group,
    ...(type === 'pieces' ? {
      prompt: { es: `${person} · ${verb}` },
      pieces: { fixedStem: stem, stems: [stem], endings: endings[verbs[verb].group] },
      answers: [formula], model: `${formula} → ${stem + ending}`
    } : { before: person, after: '', answers: [stem + ending] }),
    studyForms: forms,
    hint: bi(`${person}: ${stem} + ${ending}`, `${person} får endelsen -${ending}. Ta bort ${verbs[verb].group.toLowerCase()} fra ${verb} først.`),
    explanation: bi(`${person}: ${formula} → ${stem + ending}`, `${verb} er regelmessig. ${person}: ${formula} → ${stem + ending}.`)
  };
}

export const optionalReflection = {
  title: 'EXTRA · Mi repaso',
  instruction: bi('Maid háliidat hárjehallat eambbo? Čále sámegillii, dárogillii dahje spánskkagillii.', 'Hva vil du øve mer på? Skriv på samisk, norsk eller spansk. Frivillig; læreren kan gi tilbakemelding. Ikke skriv navn eller andre personopplysninger.'),
  model: 'Saludos · Números · Pronombres · Palabras · Verbos',
  maxLength: 500
};
