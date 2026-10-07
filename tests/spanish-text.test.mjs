import test from 'node:test';
import assert from 'node:assert/strict';
import {grammarText,answerMarkup,questionLabel,instructionMarkup} from '../js/spanish-text.js';

test('Spanish grammar highlights pronouns and actual inflections without colouring stems',()=>{
  assert.equal(grammarText('Tú comes bananas.'),'<span class="person">Tú</span> com<span class="ending">es</span> bananas.');
  assert.equal(grammarText('ella come espaguetis'),'<span class="person">ella</span> com<span class="ending">e</span> espaguetis');
  assert.equal(grammarText('vosotros / vosotras · comer'),'<span class="person">vosotros</span> / <span class="person">vosotras</span> · comer');
  assert.equal(grammarText('vivís; estudiáis; escuchamos'),'viv<span class="ending">ís</span>; estudi<span class="ending">áis</span>; escuch<span class="ending">amos</span>');
  assert.equal(grammarText('el libro, espaguetis y Noruega'),'el libro, espaguetis y Noruega');
});
test('formatting escapes source text and preserves accents and punctuation',()=>{
  assert.equal(grammarText('<img> ¡Él!'), '&lt;img&gt; ¡<span class="person">Él</span>!');
  assert.equal(grammarText('COMÉIS'),'COM<span class="ending">ÉIS</span>');
});
test('sentence prompts keep the answer hidden, and feedback separates the ending',()=>{
  const q={type:'pieces',context:{person:'tú',after:'bananas'},pieces:{fixedStem:'com'},answers:['com + es']};
  assert.match(questionLabel(q),/Tú/);assert.match(questionLabel(q),/com<span class="answer-slot">___/);assert.ok(!questionLabel(q).includes('comes'));
  assert.equal(answerMarkup(q),'com + <span class="ending">es</span> → com<span class="ending">es</span>');
  assert.match(instructionMarkup({es:'Elige.',se:'Vállje.',nb:'Velg.'}),/lang="se">Vállje\./);
});
