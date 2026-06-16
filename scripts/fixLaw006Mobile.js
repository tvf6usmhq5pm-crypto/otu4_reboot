const fs = require('fs');

const path = './data/questions_all_700_v1.json';

const now = new Date()
  .toISOString()
  .replace(/[-:T]/g, '')
  .slice(0, 14);

const backup = `./data/questions_all_700_v1.backup_before_law006_mobile_fix_${now}.json`;

fs.copyFileSync(path, backup);

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const q = data.find((item) => item.id === 'LAW-006-002-V01');

if (!q) {
  throw new Error('LAW-006-002-V01 not found');
}

q.question =
  '法令上、製造所等に関する手続きと相手先又は手続名の組合せとして、正しいものはどれか。';

q.options = [
  '製造所等の設置・変更 ── 市町村長等の許可',
  '仮貯蔵・仮取扱い ── 市町村長等の許可',
  '完成検査 ── 所轄消防長又は消防署長が行う',
  '仮使用 ── 所轄消防長又は消防署長の承認',
  '製造所等の設置 ── 都道府県知事への届出',
];

q.correct = 0;

q.explanation =
  '製造所等の設置又は位置・構造・設備の変更には、市町村長等の許可が必要である。仮貯蔵・仮取扱いは所轄消防長又は消防署長の承認、完成検査は市町村長等が行い、仮使用は市町村長等の承認である。';

q.option_details = [
  '正しい。製造所等の設置・変更は、市町村長等の許可を受ける。',
  '誤り。仮貯蔵・仮取扱いは、市町村長等の許可ではなく、所轄消防長又は消防署長の承認である。',
  '誤り。完成検査は所轄消防長又は消防署長ではなく、市町村長等が行う。',
  '誤り。仮使用は所轄消防長又は消防署長ではなく、市町村長等の承認である。',
  '誤り。製造所等の設置は都道府県知事への届出ではなく、市町村長等の許可である。',
];

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log('updated LAW-006-002-V01');
console.log('backup:', backup);
