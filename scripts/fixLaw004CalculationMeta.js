const fs = require('fs');

const path = './data/explanation_meta_pilot_law_v1.ts';

const backup = `./data/explanation_meta_pilot_law_v1.backup_before_law004_calc_table_${new Date()
  .toISOString()
  .replace(/[-:T]/g, '')
  .slice(0, 14)}.ts`;

fs.copyFileSync(path, backup);

let text = fs.readFileSync(path, 'utf8');

const start = text.indexOf("  'LAW-004-008': {");
if (start === -1) {
  throw new Error('LAW-004-008 block not found');
}

const next = text.indexOf("\n\n  'LAW-020-002':", start);
if (next === -1) {
  throw new Error('next block LAW-020-002 not found');
}

const replacement = `  'LAW-004-008': {
    questionId: 'LAW-004-008',
    lossTitle: '指定数量倍数の計算ミス',
    style: 'calculation_step',
    shortExplanation:
      '指定数量の倍数は、貯蔵量を指定数量で割って、それぞれの倍数を合計します。水溶性と非水溶性で指定数量が変わる点に注意します。',
    tableHeader: ['危険物', '指定数量', '計算', '倍数'],
    rows: [
      {
        cells: ['ベンゼン\\n第1石油類・非水溶性', '200L', '400÷200', '2'],
      },
      {
        cells: ['アセトン\\n第1石油類・水溶性', '400L', '800÷400', '2'],
      },
      {
        cells: ['灯油\\n第2石油類・非水溶性', '1,000L', '1,500÷1,000', '1.5'],
      },
    ],
    calcLines: [
      {
        step: '合計',
        formula: '2 + 2 + 1.5',
        result: '5.5倍',
      },
    ],
    optionMemos: {
      0: 'ベンゼンを水溶性として扱うと、指定数量を誤ります。',
      1: '灯油の1.5倍を切り捨てると、合計がズレます。',
      3: '灯油の1.5倍を切り上げると、合計がズレます。',
      4: 'アセトンを非水溶性として扱うと、指定数量を誤ります。',
    },
    reviewCtaLabel: '指定数量計算をもう1問',
  },`;

text = text.slice(0, start) + replacement + text.slice(next);

fs.writeFileSync(path, text, 'utf8');

console.log('updated LAW-004 calculation table meta');
console.log('backup:', backup);
