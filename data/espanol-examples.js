import { formsFor, numerals } from './espanol-campo-content.js';

// One unambiguous subject from each conjugation group. The original group
// labels remain on the questions; these subjects make readable sentences.
const subjects = ['yo', 'tú', 'ella', 'nosotros', 'vosotros', 'ellas'];
const sentenceTails = {
  hablar: ['español', 'español', 'español', 'español', 'español', 'español'],
  cantar: ['una canción', 'una canción', 'una canción', 'una canción', 'una canción', 'una canción'],
  comer: ['pan', 'bananas', 'espaguetis', 'pan', 'bananas', 'espaguetis'],
  aprender: ['español', 'español', 'español', 'español', 'español', 'español'],
  vivir: ['en Noruega', 'en Noruega', 'en Noruega', 'en Noruega', 'en Noruega', 'en Noruega'],
  escribir: ['un libro', 'un libro', 'un libro', 'un libro', 'un libro', 'un libro']
};

export function verbExample(verb, index) {
  const row = formsFor(verb)[index];
  if (!row || !sentenceTails[verb]) throw new Error(`Missing verb example: ${verb} / ${index}`);
  const [person, stem, ending] = row;
  const subject = subjects[index];
  const after = sentenceTails[verb][index];
  return {
    verb, person, stem, ending,
    context: { person: subject, after },
    example: `${subject[0].toUpperCase() + subject.slice(1)} ${stem + ending} ${after}.`
  };
}

const examples = {
  '¡Hola!': '¡Hola, Ana!',
  '¿Cómo estás?': '—¿Cómo estás? —Estoy OK.',
  '¿Cómo te llamas?': '—¿Cómo te llamas? —Me llamo Ana.',
  'Me llamo…': 'Me llamo Ana.',
  'Buenos días': '¡Buenos días, Ana!',
  'Buenas tardes': '¡Buenas tardes, Ana!',
  'Buenas noches': '¡Buenas noches, Ana!',
  'Estoy MUY bien': '—¿Cómo estás? —Estoy muy bien.',
  'Estoy bien': '—¿Cómo estás? —Estoy bien.',
  'Estoy OK': '—¿Cómo estás? —Estoy OK.',
  'No estoy bien': '—¿Cómo estás? —No estoy bien.',
  'Estoy cansada / cansado': 'Estoy cansada. / Estoy cansado.',
  'Estoy cansada': 'Estoy cansada.',
  'Estoy cansado': 'Estoy cansado.',
  '¡Estoy triste!': '—¿Cómo estás? —Estoy triste.',
  yo: 'Yo como pan.',
  'tú': 'Tú comes bananas.',
  'él': 'Él come espaguetis.',
  ella: 'Ella come espaguetis.',
  'nosotros / nosotras': 'Nosotros hablamos español.',
  'vosotros / vosotras': 'Vosotros vivís en Noruega.',
  ellos: 'Ellos comen bananas.',
  ellas: 'Ellas comen bananas.',
  hablar: 'Me gusta hablar español.',
  cantar: 'Me gusta cantar.',
  comer: 'Me gusta comer bananas.',
  aprender: 'Me gusta aprender español.',
  vivir: 'Me gusta vivir en Noruega.',
  escribir: 'Me gusta escribir.',
  Noruega: 'Vivo en Noruega.',
  estudiar: 'Me gusta estudiar español.',
  mucho: 'Estudio mucho.',
  'un libro': 'Tengo un libro.',
  'lo siento': 'Lo siento, estoy cansado.',
  pero: 'Estoy cansado, pero estoy bien.',
  no: 'No hablo español.',
  '¿qué?': '¿Qué escribes?',
  'qué': '¿Qué escribes?',
  escuchar: 'Me gusta escuchar música.'
};

export function wordExample(word) {
  const number = numerals.indexOf(word);
  if (number !== -1) return number === 0 ? 'Tengo un libro.' : `Tengo ${word} libros.`;
  const example = examples[word];
  if (!example) throw new Error(`Missing word example: ${word}`);
  return example;
}

export function questionExample(question) {
  if (question.verb) {
    const index = formsFor(question.verb).findIndex(row => row[0] === question.person);
    return verbExample(question.verb, index);
  }
  return { example: wordExample(question.answers[0]) };
}
