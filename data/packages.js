import {topics} from './espanol-topics.js?v=20261007-sentences';
// Lisää julkaistut paketit tähän luetteloon. Sisältö ladataan vain omalta sivustolta.
export const packages = [...topics.map(topic=>({
  id:topic.id, subject:'espanja', grade:'8', title:topic.title, language:'es', topic:true,
  path:`espanja/8/${topic.slug}/`, data:'data/espanol-topics.js', worksheet:topic.worksheet,
  description:{se:'',nb:'Tarjetas · '+(topic.game==='memory'?'Memoria':'Une')+' · Reto'},
  minutes:'',exercises:3
})), {
  id: 'mi-actividad-favorita', subject: 'espanja', grade: '8',
  title: 'Mi actividad favorita', language: 'es',
  path: 'espanja/8/mi-actividad-favorita/',
  data: 'data/mi-actividad-favorita.js',
  description: { se: 'Sánit ja cealkagat', nb: 'Fritidsaktiviteter, verb og en kort dialog' },
  minutes: '10–15', exercises: 3
}, ...['mannat', 'goarrut', 'viehkat', 'boahtit'].map(verb => ({
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
