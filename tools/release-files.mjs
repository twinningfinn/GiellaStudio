// Julkaisun sallittujen tiedostojen luettelo. Ei lue mitään tämän kansion ulkopuolelta.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const roots=['.gitignore','.nojekyll','Avaa-Classroom.cmd','README.md','THIRD_PARTY.md','LANGUAGE_REVIEW.md','RELEASE_FILES.txt','package.json','index.html'];
const directories=['assets','css','js','data','espanja','suomi','pohjoissaame','opettaja','tools','tests'];
function walk(relative) {
  return fs.readdirSync(path.join(root,relative),{withFileTypes:true}).flatMap(entry=>{
    if(entry.isSymbolicLink()) throw new Error('Julkaisussa ei sallita linkitettyjä tiedostoja: '+entry.name);
    const file=relative+'/'+entry.name;
    return entry.isDirectory()?walk(file):[file];
  });
}
const worksheets=['output/pdf/espanol-semana-1.pdf','output/pdf/espanol-semana-2.pdf'];
for(const file of worksheets) if(!fs.existsSync(path.join(root,file))) throw new Error('Puuttuva tehtävä-PDF: '+file);
const files=[...roots,...directories.flatMap(walk),...worksheets].sort();
fs.writeFileSync(path.join(root,'RELEASE_FILES.txt'),files.join('\n')+'\n');
if(process.argv.includes('--json')) console.log(JSON.stringify(files));else console.log(files.join('\n'));
