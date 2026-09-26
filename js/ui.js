export const root = new URL('../', import.meta.url);
export const url = path => new URL(path, root).href;
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function bi(se, nb) { return `<span class="se" lang="se">${esc(se)}</span><span class="nb" lang="nb">${esc(nb)}</span>`; }
export function promptText(prompt) { return prompt.es ? `<span lang="es">${esc(prompt.es)}</span>` : bi(prompt.se, prompt.nb); }
export function header() {
  document.querySelector('#header').innerHTML = `<a class="brand" href="${url('')}">Giella<span>Studio</span></a><span class="language-note"><span lang="se">Sámegiella</span> <span aria-hidden="true">+</span> <span lang="nb">norsk</span></span>`;
}
export function focusMain() { document.querySelector('main h1, main h2')?.focus({ preventScroll: true }); window.scrollTo(0, 0); }
export function formatTime(iso) { return new Intl.DateTimeFormat('nb-NO', { dateStyle:'short', timeStyle:'short' }).format(new Date(iso)); }
