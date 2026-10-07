import {matchesTeacherCode} from './teacher-code.js';

let unlocked=false,pending;
function clearTeacherView(){
  unlocked=false;
  document.querySelector('main')?.replaceChildren();
  document.querySelector('#header')?.replaceChildren();
  document.querySelectorAll('dialog').forEach(dialog=>dialog.remove());
}
export function lockTeacherPage(){clearTeacherView();location.reload();}
export function requireTeacherCode(){
  if(unlocked)return Promise.resolve();
  if(pending)return pending;
  pending=new Promise(resolve=>{
    const main=document.querySelector('main');
    main.classList.add('teacher-gate');
    document.querySelector('#header').innerHTML='<span class="brand">GiellaStudio</span>';
    main.innerHTML='<section class="panel"><h1 tabindex="-1">Opettajan sivu</h1><form id="teacher-code-form"><label for="teacher-code">Koodi</label><input id="teacher-code" name="code" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="64" required><button class="primary" type="submit">Avaa</button><p id="code-status" role="status" aria-live="polite"></p></form></section>';
    const form=document.querySelector('#teacher-code-form');
    const input=document.querySelector('#teacher-code');
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      const button=form.querySelector('button');
      if(button.disabled)return;
      button.disabled=true;
      try {
        if(!await matchesTeacherCode(input.value)){
          document.querySelector('#code-status').textContent='Väärä koodi.';
          input.value='';input.focus();return;
        }
        input.value='';unlocked=true;
        main.replaceChildren();main.classList.remove('teacher-gate');
        resolve();
      }catch{
        document.querySelector('#code-status').textContent='Koodin tarkistus ei onnistunut. Päivitä sivu.';
      }finally{button.disabled=false;}
    });
    input.focus({preventScroll:true});
  });
  return pending;
}
export function addTeacherLock(){
  if(document.querySelector('#lock-teacher'))return;
  const button=document.createElement('button');button.id='lock-teacher';button.type='button';button.textContent='Lukitse';
  button.addEventListener('click',lockTeacherPage);document.querySelector('#header').append(button);
  let idleTimer;
  const resetIdle=()=>{clearTimeout(idleTimer);idleTimer=setTimeout(lockTeacherPage,15*60*1000);};
  document.addEventListener('pointerdown',resetIdle);document.addEventListener('keydown',resetIdle);resetIdle();
}
// Never preserve an unlocked teacher screen in browser Back/Forward snapshots.
window.addEventListener('pagehide',clearTeacherView);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
