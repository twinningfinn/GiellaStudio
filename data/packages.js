// Lisää julkaistut paketit tähän luetteloon. Sisältö ladataan vain omalta sivustolta.
export const packages = [{
  id: 'mi-actividad-favorita', subject: 'espanja', grade: '8',
  title: 'Mi actividad favorita', language: 'es',
  path: 'espanja/8/mi-actividad-favorita/',
  data: 'data/mi-actividad-favorita.js',
  description: { se: 'Sánit ja cealkagat', nb: 'Fritidsaktiviteter, verb og en kort dialog' },
  minutes: '10–15', exercises: 3
}, ...[1, 2].map(week => ({
  id: `espanol-semana-${week}`, subject: 'espanja', grade: '8',
  title: `Español · Semana ${week}`, language: 'es',
  path: `espanja/8/semana-${week}/`, data: `data/espanol-semana-${week}.js`,
  teacherOnly: true, worksheet: `output/pdf/espanol-semana-${week}.pdf`,
  description: week === 1
    ? { se: 'Dearvvahusat, logut, pronomenat ja sánit', nb: 'Uke 1 · Hilsener, tall 1–15, pronomen og ord' }
    : { se: 'Vearbbat ja geardduheapmi', nb: 'Uke 2 · Regelmessige AR-, ER- og IR-verb og repetisjon' },
  minutes: '3 × 15–20', exercises: 3
})), ...['mannat', 'goarrut', 'viehkat', 'boahtit'].map(verb => ({
  id: 'sami-' + verb, subject: 'pohjoissaame', grade: '',
  title: verb, language: 'se', path: 'pohjoissaame/verbit/' + verb + '/',
  data: 'data/sami-' + verb + '.js',
  description: { se: 'Bárrastávvalvearbbat · preseansa', nb: 'Verbbrikker · presens' },
  minutes: '15–20', exercises: 3
}))];
export const subjects = {
  espanja: { se: 'Spánskkagiella', nb: 'Spansk', native: 'Español', flag: 'es' },
  suomi: { se: 'Suomagiella', nb: 'Finsk som andrespråk', native: 'Suomi', flag: 'fi' },
  pohjoissaame: { se: 'Davvisámegiella', nb: 'Nordsamisk', native: 'Davvisámegiella', flag: 'se' }
};
