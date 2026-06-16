const fs = require('fs');

const path = './data/explanation_meta_pilot_law_v1.ts';

let text = fs.readFileSync(path, 'utf8');

const start = text.indexOf("'LAW-006-002-V01': {");
if (start === -1) {
  throw new Error('LAW-006-002-V01 block not found');
}

const next = text.indexOf("\n\n  'LAW-011-001':", start);
if (next === -1) {
  throw new Error('next block LAW-011-001 not found');
}

const replacement = `  'LAW-006-002-V01': {
    questionId: 'LAW-006-002-V01',
    lossTitle: '手続き区分と相手先の混同',
    style: 'procedure_table',
    shortExplanation:
      '製造所等の設置・変更は市町村長等の許可です。仮貯蔵・仮取扱いは消防長等の承認、完成検査と仮使用も相手先を混同しやすいので整理します。',
    tableHeader: ['区分', '相手', '手続き'],
    rows: [
      {
        cells: ['設置・変更', '市町村長等', '許可'],
        variant: 'correct',
      },
      {
        cells: ['仮貯蔵・仮取扱い', '消防長又は消防署長', '承認'],
        variant: 'neutral',
        note: '市町村長等の許可ではない',
      },
      {
        cells: ['完成検査', '市町村長等', '検査'],
        variant: 'neutral',
        note: '消防長等ではない',
      },
      {
        cells: ['仮使用', '市町村長等', '承認'],
        variant: 'neutral',
        note: '消防長等ではない',
      },
    ],
    optionMemos: {
      1: '仮貯蔵・仮取扱いは、市町村長等の許可ではなく、消防長又は消防署長の承認。',
      2: '完成検査は、所轄消防長又は消防署長ではなく、市町村長等が行う。',
      3: '仮使用は、所轄消防長又は消防署長ではなく、市町村長等の承認。',
      4: '設置は都道府県知事への届出ではなく、市町村長等の許可。',
    },
    reviewCtaLabel: '手続き区分をもう1問',
  },`;

text = text.slice(0, start) + replacement + text.slice(next);

fs.writeFileSync(path, text, 'utf8');

console.log('updated LAW-006 meta block');
