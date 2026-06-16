const fs = require('fs');

const path = './data/explanation_meta_pilot_law_v1.ts';

const backup = `./data/explanation_meta_pilot_law_v1.backup_before_law006_remove_notes_${new Date()
  .toISOString()
  .replace(/[-:T]/g, '')
  .slice(0, 14)}.ts`;

fs.copyFileSync(path, backup);

let text = fs.readFileSync(path, 'utf8');

text = text
  .replace(/\n\s*note: '市町村長等の許可ではない',/g, '')
  .replace(/\n\s*note: '消防長等ではない',/g, '');

fs.writeFileSync(path, text, 'utf8');

console.log('removed LAW-006 table notes');
console.log('backup:', backup);
