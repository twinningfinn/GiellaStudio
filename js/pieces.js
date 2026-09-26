import { esc, bi } from './ui.js?v=20260927-sami';

export function conjugation(forms) {
  return `<div class="verb-forms">${forms.map(([person, stem, ending]) => `<div><strong class="person" lang="se">${esc(person)}</strong><span lang="se">${esc(stem)} + <span class="ending">${esc(ending || '∅')}</span> → <strong>${esc(stem + ending)}</strong></span></div>`).join('')}</div>`;
}
export function pieceValue(selection) {
  return selection.stem === null || selection.ending === null ? '' : `${selection.stem} + ${selection.ending || '∅'}`;
}
export function pieceControls(q, rec, selection) {
  const fixed = q.pieces.fixedStem !== null;
  const label = value => value === null ? '…' : value || '∅';
  return `<div class="assembly" lang="se"><span id="chosen-stem">${esc(label(selection.stem))}</span><span>+</span><span id="chosen-ending">${esc(label(selection.ending))}</span></div>
    ${['stem', 'ending'].filter(part => !fixed || part !== 'stem').map(part => `<fieldset class="piece-bank"><legend>${bi(part === 'stem' ? 'Mátta' : 'Geažus', part === 'stem' ? 'Stamme' : 'Endelse')}</legend><div class="piece-options">${q.pieces[part === 'stem' ? 'stems' : 'endings'].map((value, i) => `<button type="button" data-piece="${part}" data-index="${i}" lang="se" aria-pressed="${selection[part] === value}" ${rec.done ? 'disabled' : ''}>${value ? esc(value) : bi('Ii leat geažus', 'Ingen endelse · ∅')}</button>`).join('')}</div></fieldset>`).join('')}`;
}
export function bindPieces(q, selection, changed) {
  document.querySelectorAll('[data-piece]').forEach(button => button.onclick = () => {
    const part = button.dataset.piece;
    selection[part] = q.pieces[part === 'stem' ? 'stems' : 'endings'][Number(button.dataset.index)];
    document.querySelector('#chosen-' + part).textContent = selection[part] || '∅';
    document.querySelectorAll(`[data-piece="${part}"]`).forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    changed();
  });
}
