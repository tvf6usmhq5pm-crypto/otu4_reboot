const fs = require('fs');

const path = './data/explanation_meta_pilot_law_v1.ts';

const backup = `./data/explanation_meta_pilot_law_v1.backup_before_force_law020_distance_table_${new Date()
  .toISOString()
  .replace(/[-:T]/g, '')
  .slice(0, 14)}.ts`;

fs.copyFileSync(path, backup);

let text = fs.readFileSync(path, 'utf8');

const start = text.indexOf("  'LAW-020-002': {");
if (start === -1) {
  throw new Error('LAW-020-002 block not found');
}

const next = text.indexOf("\n\n  'LAW-002-002':", start);
if (next === -1) {
  throw new Error('next block LAW-002-002 not found');
}

const replacement = `  'LAW-020-002': {
    questionId: 'LAW-020-002',
    lossTitle: '保安距離の対象施設の混同',
    style: 'facility_map',
    shortExplanation:
      '保安距離は、対象施設と必要距離をセットで覚える問題です。特に、架空電線、敷地外の住居、学校・病院、重要文化財の距離を整理します。',
    facilityItems: [
      {
        label: '特別高圧架空電線（7,000V超〜35,000V以下）',
        status: 'target',
        distance: '3m以上',
      },
      {
        label: '特別高圧架空電線（35,000V超）',
        status: 'target',
        distance: '5m以上',
      },
      {
        label: '製造所等の敷地外にある住居',
        status: 'target',
        distance: '10m以上',
      },
      {
        label: '高圧ガス・液化石油ガスの施設',
        status: 'target',
        distance: '20m以上',
      },
      {
        label: '幼稚園・保育園〜高校・病院・劇場等',
        status: 'target',
        distance: '30m以上',
      },
      {
        label: '重要文化財等の建造物',
        status: 'target',
        distance: '50m以上',
      },
      {
        label: '大学',
        status: 'excluded',
      },
      {
        label: '同一敷地内の住居',
        status: 'excluded',
      },
      {
        label: '埋設電線',
        status: 'excluded',
      },
    ],
    reviewCtaLabel: '保安距離をもう1問',
  },`;

text = text.slice(0, start) + replacement + text.slice(next);

fs.writeFileSync(path, text, 'utf8');

console.log('forced LAW-020 distance table meta');
console.log('backup:', backup);
