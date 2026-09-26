// Uusi Classroom-sisältö, prototyypin sanakorttien ja AR-harjoitusten pohjalta.
// Saamen uudet kokonaiset ohjetekstit ovat opettajan kielentarkistettavia.
export default {
  id: 'mi-actividad-favorita', version: 1,
  vocabulary: [
    { es: 'cantar', se: 'lávlut', nb: 'å synge' },
    { es: 'bailar', se: 'dánsut', nb: 'å danse' },
    { es: 'escuchar música', se: 'guldalit musihka', nb: 'å høre på musikk' },
    { es: 'tocar la guitarra', se: 'čuojahit gitára', nb: 'å spille gitar' }
  ],
  sections: [
    {
      id: 'vocabulario', title: '1 · Vocabulario',
      instruction: { se: 'Vállje rievttes vástádusa.', nb: 'Velg uttrykket som passer til oversettelsen.' },
      questions: [
        { id: 'v1', type: 'choice', prompt: { se: 'lávlut', nb: 'å synge' }, options: ['bailar', 'cantar', 'escuchar música'], answers: ['cantar'], hint: { se: 'c…', nb: 'Ordet begynner med c.' } },
        { id: 'v2', type: 'choice', prompt: { se: 'dánsut', nb: 'å danse' }, options: ['tocar la guitarra', 'escuchar música', 'bailar'], answers: ['bailar'], hint: { se: 'b…', nb: 'Ordet begynner med b.' } },
        { id: 'v3', type: 'choice', prompt: { se: 'guldalit musihka', nb: 'å høre på musikk' }, options: ['escuchar música', 'cantar', 'bailar'], answers: ['escuchar música'], hint: { se: '… música', nb: 'Se etter ordet música.' } },
        { id: 'v4', type: 'choice', prompt: { se: 'čuojahit gitára', nb: 'å spille gitar' }, options: ['bailar', 'tocar la guitarra', 'cantar'], answers: ['tocar la guitarra'], hint: { se: '… la guitarra', nb: 'Se etter instrumentet.' } }
      ]
    },
    {
      id: 'verbos', title: '2 · Verbos en acción',
      instruction: { se: 'Čále vearbba rievttes hámi.', nb: 'Skriv verbet som mangler. Bruk presens.' },
      lesson: { verb: 'cantar', stem: 'cant', forms: [['yo', 'o'], ['tú', 'as'], ['él / ella', 'a'], ['nosotros', 'amos']] },
      questions: [
        { id: 'g1', type: 'write', before: 'Yo', after: 'en casa.', verb: 'cantar', answers: ['canto'], hint: { se: 'yo → -o', nb: 'Ta bort -ar og legg til -o.' } },
        { id: 'g2', type: 'write', before: 'Tú', after: 'muy bien.', verb: 'bailar', answers: ['bailas'], hint: { se: 'tú → -as', nb: 'Ta bort -ar og legg til -as.' } },
        { id: 'g3', type: 'write', before: 'Nosotros', after: 'música.', verb: 'escuchar', answers: ['escuchamos'], hint: { se: 'nosotros → -amos', nb: 'Ta bort -ar og legg til -amos.' } }
      ]
    },
    {
      id: 'dialogo', title: '3 · ¿Y tú?',
      instruction: { se: 'Vállje rievttes vástádusa.', nb: 'Les dialogen og velg riktig svar.' },
      dialogue: [
        ['A', '¿Cuál es tu actividad favorita?'],
        ['B', 'Mi actividad favorita es bailar. ¿Y tú?'],
        ['A', 'Me gusta tocar la guitarra. Escucho música todos los días.'],
        ['B', '¡Qué bien! Yo bailo los sábados.']
      ],
      questions: [
        { id: 'd1', type: 'choice', prompt: { es: '¿Qué le gusta hacer a B?' }, options: ['Cantar.', 'Bailar.', 'Tocar la guitarra.'], answers: ['Bailar.'], hint: { se: '«Mi actividad favorita es…»', nb: 'Se på det første svaret fra B.' } },
        { id: 'd2', type: 'choice', prompt: { es: '¿Cuándo escucha música A?' }, options: ['Los sábados.', 'Nunca.', 'Todos los días.'], answers: ['Todos los días.'], hint: { se: '«Escucho música…»', nb: 'Finn setningen som begynner med Escucho música.' } },
        { id: 'd3', type: 'choice', prompt: { es: '¿Cuándo baila B?' }, options: ['Los sábados.', 'Los lunes.', 'Todos los días.'], answers: ['Los sábados.'], hint: { se: '«Yo bailo…»', nb: 'Se på den siste setningen i dialogen.' } }
      ]
    }
  ],
  extra: {
    title: 'EXTRA · Mi actividad favorita',
    instruction: { se: 'Čále cealkaga.', nb: 'Skriv om en aktivitet du liker. Bruk gjerne modellen. Frivillig, uten poeng.' },
    model: 'Mi actividad favorita es … Me gusta …',
    maxLength: 500
  }
};
