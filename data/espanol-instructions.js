// Shared short instructions: Spanish first, North Sámi and Bokmål as support.
// Reused North Sámi: the original GiellaStudio student prototype's flashCopy,
// memoryCopy, clozeCopy and writingCopy (13 September 2026).
// New combinations "Ovttastahte páraid" and "Gávnna páraid" use terminology
// attested in UiT's corpus and the Finnish National Agency for Education's
// North Sámi card-game material; the complete UI sentences are our adaptations.
// https://gtsvn.uit.no/freecorpus/orig/eng/science/uit/phd/inger_marie_gaup_eira.pdf
// https://www.oph.fi/sites/default/files/documents/Evttohusat%20M%C3%A1n%C3%A1%20vuoigatvuo%C4%91at.pdf
export const instructions = {
  cards: {
    es: 'Gira la tarjeta.',
    se: 'Jorgal koartta.',
    nb: 'Snu kortet.'
  },
  match: {
    es: 'Une las parejas.',
    se: 'Ovttastahte páraid.',
    nb: 'Koble sammen parene.'
  },
  memory: {
    es: 'Encuentra las parejas.',
    se: 'Gávnna páraid.',
    nb: 'Finn parene.'
  },
  choice: {
    es: 'Elige la respuesta.',
    se: 'Vállje rievttes vástádusa.',
    nb: 'Velg riktig svar.'
  },
  pieces: {
    es: 'Elige la terminación.',
    se: 'Vállje gehčosa.',
    nb: 'Velg endelsen.'
  },
  write: {
    es: 'Escribe en español.',
    se: 'Čále vástádusa.',
    nb: 'Skriv svaret på spansk.'
  },
  writeVerb: {
    es: 'Escribe la forma del verbo.',
    se: 'Čále vearbba rievttes hámi.',
    nb: 'Skriv riktig form av verbet.'
  },
  report: {
    es: 'Guarda tus respuestas en PDF.',
    se: 'Vurke vástádusaid PDF:n.',
    nb: 'Lagre svarene som PDF.'
  }
};
