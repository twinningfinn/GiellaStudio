// Alkuperäisen oppilasprototyypin neljä verbiä, persoonajärjestys ja palat.
// Classroom-kopio: alkuperäistä prototyyppiä tai sen tallennusta ei muuteta.
export const persons = ['mun', 'don', 'son', 'moai', 'doai', 'soai', 'mii', 'dii', 'sii'];
export const endings = ['n', 't', '', '', 'beahtti', 'ba', 't', 'behtet', 't'];
export const verbs = {
  mannat: ['mana', 'mana', 'manná', 'manne', 'manna', 'manna', 'manna', 'manna', 'manne'],
  goarrut: ['goaru', 'goaru', 'goarru', 'gorro', 'goarru', 'goarru', 'goarru', 'goarru', 'gorro'],
  viehkat: ['viega', 'viega', 'viehká', 'vihke', 'viehka', 'viehka', 'viehka', 'viehka', 'vihke'],
  boahtit: ['boađá', 'boađá', 'boahtá', 'bohte', 'boahti', 'boahti', 'boahti', 'boahti', 'bohte']
};
export function makeVerbPack(verb) {
  const stems = verbs[verb];
  if (!stems) throw new Error('Unknown verb: ' + verb);
  const forms = persons.map((person, i) => [person, stems[i], endings[i]]);
  return {
    id: 'sami-' + verb, version: 1, letters: ['á', 'č', 'đ', 'ŋ', 'š', 'ŧ', 'ž'],
    introTitle: { se: 'Oahpa', nb: 'Se hvordan ordet bygges' },
    introForms: forms.slice(0, 3),
    sections: [
      { id: 'ending', title: 'Vállje gehčosa', titleNb: 'Velg endelsen', guided: true,
        instruction: { se: 'Vállje gehčosa.', nb: 'Stammen er ferdig. Velg endelsen som passer til personen.' } },
      { id: 'build', title: 'Vállje mátta ja gehčosa', titleNb: 'Velg stamme og endelse',
        instruction: { se: 'Vállje mátta ja gehčosa.', nb: 'Bygg verbformen med en stamme og en endelse.' } },
      { id: 'write', title: 'Čále ieš', titleNb: 'Skriv selv', guided: true,
        instruction: { se: 'Čále vearbba rievttes hámi.', nb: 'Skriv riktig form av verbet. Du kan bruke de samiske bokstavknappene.' } }
    ].map(section => ({ ...section, questions: persons.map((person, i) => {
      const first = section.guided ? Math.floor(i / 3) * 3 : 0;
      const group = forms.slice(first, first + (section.guided ? 3 : 9));
      const formula = `${stems[i]} + ${endings[i] || '∅'}`;
      return {
        id: `${verb}-${section.id}-${person}`, type: section.id === 'write' ? 'write' : 'pieces',
        prompt: { text: `${person} · ${verb}`, language: 'se' }, person,
        studyForms: group, group: section.guided ? group.map(row => row[0]).join(' · ') : '',
        answers: [section.id === 'write' ? stems[i] + endings[i] : formula],
        model: section.id === 'write' ? stems[i] + endings[i] : `${formula} → ${stems[i] + endings[i]}`,
        ...(section.id !== 'write' ? { pieces: {
          fixedStem: section.id === 'ending' ? stems[i] : null,
          stems: [...new Set(group.map(row => row[1]))], endings: [...new Set(group.map(row => row[2]))]
        } } : {}),
        hint: { se: `${person}: ${formula} → ${stems[i] + endings[i]}`, nb: endings[i] ? 'Sett stammen og endelsen sammen.' : '∅ betyr at formen ikke har noen ekstra endelse.' }
      };
    }) }))
  };
}
