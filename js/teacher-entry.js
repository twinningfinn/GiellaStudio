import {requireTeacherCode,addTeacherLock} from './teacher-gate.js?v=20261007-teacher-lock';
await requireTeacherCode();
if(document.body.dataset.page==='teacher-review')await import('./teacher-review.js?v=20261007-teacher-lock');
else await import('./catalog.js?v=20261007-teacher-lock');
addTeacherLock();
