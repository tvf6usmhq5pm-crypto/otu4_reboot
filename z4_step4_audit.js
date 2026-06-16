/**
 * Z4 STEP 4: pilot 15問 総合監査
 *
 * 実行方法:
 *   cd C:\Users\root7\otu4_reboot\02_app
 *   node z4_step4_audit.js
 *
 * 変更対象: なし（読み取り専用）
 *
 * 検査項目:
 *   1. 15問すべてに schemaVersion あり
 *   2. 15問すべてに misconceptionId あり
 *   3. 15問すべてに lossCategory あり
 *   4. lossCategory が enum 内
 *   5. 共有ペアが同じ misconceptionId
 *   6. optionMemos に正解選択肢なし
 *   7. questions JSON の整合性（pilot IDが存在）
 *   8. ** ペア検査（不対がないこと）
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();

// ── パス定義 ──

const JSON_PATH = path.join(root, 'data', 'questions_all_700_v1.json');
const PILOT_PATHS = {
  law: path.join(root, 'data', 'explanation_meta_pilot_law_v1.ts'),
  phys: path.join(root, 'data', 'explanation_meta_pilot_phys_v1.ts'),
  prop: path.join(root, 'data', 'explanation_meta_pilot_prop_v1.ts'),
};

// ── 定義 ──

const VALID_LOSS_CATEGORIES = new Set([
  'number_confusion',
  'classification_confusion',
  'procedure_confusion',
  'scope_confusion',
  'direction_confusion',
  'property_confusion',
]);

const EXPECTED_ASSIGNMENTS = {
  'LAW-006-002-V01': { misconceptionId: 'law.permit.authority_mixup',         lossCategory: 'procedure_confusion' },
  'LAW-011-001':     { misconceptionId: 'law.safety_course.interval_5y',      lossCategory: 'number_confusion' },
  'LAW-004-008':     { misconceptionId: 'law.designated_qty.water_soluble',   lossCategory: 'classification_confusion' },
  'LAW-020-002':     { misconceptionId: 'law.safety_distance.target_scope',   lossCategory: 'scope_confusion' },
  'LAW-002-002':     { misconceptionId: 'law.hazard_category.classification', lossCategory: 'classification_confusion' },
  'PHYS-002-001':    { misconceptionId: 'phys.combustion.liquid_evaporative', lossCategory: 'classification_confusion' },
  'PHYS-001-006':    { misconceptionId: 'phys.combustion.liquid_evaporative', lossCategory: 'classification_confusion' },
  'PHYS-001-008':    { misconceptionId: 'phys.combustion.wood_charcoal',      lossCategory: 'classification_confusion' },
  'PHYS-002-002':    { misconceptionId: 'phys.combustion.wood_charcoal',      lossCategory: 'classification_confusion' },
  'PHYS-003-005':    { misconceptionId: 'phys.hazard.magnitude_direction',    lossCategory: 'direction_confusion' },
  'PROP-003-001':    { misconceptionId: 'prop.extinguish.type4_water_jet',    lossCategory: 'procedure_confusion' },
  'PROP-003-002-V02':{ misconceptionId: 'prop.extinguish.type4_water_jet',    lossCategory: 'procedure_confusion' },
  'PROP-003-003':    { misconceptionId: 'prop.extinguish.water_soluble_foam', lossCategory: 'classification_confusion' },
  'PROP-003-007':    { misconceptionId: 'prop.extinguish.agent_mechanism',    lossCategory: 'classification_confusion' },
  'PROP-002-016':    { misconceptionId: 'prop.static.accumulation',           lossCategory: 'property_confusion' },
};

const SHARED_PAIRS = [
  { ids: ['PHYS-002-001', 'PHYS-001-006'], expected: 'phys.combustion.liquid_evaporative' },
  { ids: ['PHYS-001-008', 'PHYS-002-002'], expected: 'phys.combustion.wood_charcoal' },
  { ids: ['PROP-003-001', 'PROP-003-002-V02'], expected: 'prop.extinguish.type4_water_jet' },
];

// ── ユーティリティ ──

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(label, condition, detail) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    failures.push(`${label}: ${detail || 'FAIL'}`);
    console.log(`  ❌ ${label}: ${detail || 'FAIL'}`);
  }
}

function extractMetaBlocks(content) {
  // questionId ごとにブロックを分割
  const blocks = {};
  const parts = content.split(/questionId:\s*/);
  for (const part of parts.slice(1)) {
    const m = part.match(/^'([^']+)'/);
    if (m) blocks[m[1]] = part;
  }
  return blocks;
}

function extractField(block, fieldName) {
  const m = block.match(new RegExp(`${fieldName}:\\s*(?:'([^']*)'|(\\d+))`));
  if (!m) return null;
  return m[1] !== undefined ? m[1] : Number(m[2]);
}

function extractOptionMemoKeys(block) {
  const omMatch = block.match(/optionMemos:\s*\{([\s\S]*?)\n\s*\}/);
  if (!omMatch) return [];
  return [...omMatch[1].matchAll(/(\d+)\s*:/g)].map((m) => Number(m[1]));
}

// ── メイン ──

try {
  console.log('=== Z4 STEP 4: comprehensive audit ===\n');

  // ── 検査0: ファイル存在 ──

  console.log('[0] File existence...');
  for (const [label, p] of [...Object.entries(PILOT_PATHS), ['json', JSON_PATH]]) {
    assert(`${label} exists`, fs.existsSync(p), `Not found: ${p}`);
  }

  // ── 検査1-4: meta フィールド検証 ──

  console.log('\n[1-4] Meta field verification...');

  const allBlocks = {};
  for (const [subj, pilotPath] of Object.entries(PILOT_PATHS)) {
    const content = read(pilotPath);
    const blocks = extractMetaBlocks(content);
    Object.assign(allBlocks, blocks);
  }

  const pilotIds = Object.keys(EXPECTED_ASSIGNMENTS);
  for (const qid of pilotIds) {
    const block = allBlocks[qid];
    assert(`${qid} found in meta`, !!block, 'Not found in any pilot file');
    if (!block) continue;

    const sv = extractField(block, 'schemaVersion');
    const mid = extractField(block, 'misconceptionId');
    const lc = extractField(block, 'lossCategory');

    assert(`${qid} schemaVersion`, sv === 1, `Got: ${sv}`);
    assert(`${qid} misconceptionId`, mid === EXPECTED_ASSIGNMENTS[qid].misconceptionId,
      `Expected: ${EXPECTED_ASSIGNMENTS[qid].misconceptionId}, Got: ${mid}`);
    assert(`${qid} lossCategory`, lc === EXPECTED_ASSIGNMENTS[qid].lossCategory,
      `Expected: ${EXPECTED_ASSIGNMENTS[qid].lossCategory}, Got: ${lc}`);
    assert(`${qid} lossCategory in enum`, VALID_LOSS_CATEGORIES.has(lc),
      `'${lc}' not in valid set`);
  }

  // ── 検査5: 共有ペア ──

  console.log('\n[5] Shared misconceptionId pairs...');
  for (const pair of SHARED_PAIRS) {
    const ids = pair.ids.map((id) => extractField(allBlocks[id] || '', 'misconceptionId'));
    const allMatch = ids.every((id) => id === pair.expected);
    assert(`Pair ${pair.ids.join(' + ')}`, allMatch,
      `Expected: ${pair.expected}, Got: [${ids.join(', ')}]`);
  }

  // ── 検査6: optionMemos に正解選択肢なし ──

  console.log('\n[6] optionMemos vs correct answer...');
  const questions = JSON.parse(read(JSON_PATH));
  const qById = {};
  for (const q of questions) qById[q.id] = q;

  for (const qid of pilotIds) {
    const q = qById[qid];
    assert(`${qid} exists in JSON`, !!q, 'Not found in questions JSON');
    if (!q) continue;

    const block = allBlocks[qid];
    if (!block) continue;

    const memoKeys = extractOptionMemoKeys(block);
    const hasCorrectInMemo = memoKeys.includes(q.correct);
    assert(`${qid} no correct in optionMemos`, !hasCorrectInMemo,
      `correct=${q.correct} found in memoKeys=[${memoKeys}]`);
  }

  // ── 検査7: pilot IDがJSON内に存在 ──

  console.log('\n[7] Pilot IDs in questions JSON...');
  for (const qid of pilotIds) {
    assert(`${qid} in JSON`, !!qById[qid], 'Missing from questions_all_700_v1.json');
  }

  // ── 検査8: ** ペア検査（700問全体）──

  console.log('\n[8] Bold markdown ** pair check (all 700)...');
  let oddCount = 0;
  for (const q of questions) {
    const fields = [
      q.explanation || '',
      ...(q.option_details || []),
    ];
    for (const text of fields) {
      const starCount = (text.match(/\*\*/g) || []).length;
      if (starCount % 2 !== 0) {
        oddCount++;
        console.log(`  ⚠️ Unpaired ** in ${q.id}: "${text.slice(0, 50)}..."`);
      }
    }
  }
  assert('No unpaired ** in 700 questions', oddCount === 0, `${oddCount} fields with odd ** count`);

  // ── 結果 ──

  console.log('\n' + '='.repeat(50));
  console.log(`  PASS: ${passCount}`);
  console.log(`  FAIL: ${failCount}`);
  console.log('='.repeat(50));

  if (failCount > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  ❌ ${f}`);
    }
    console.log('\n=== AUDIT_FAIL ===');
    process.exit(1);
  } else {
    console.log('\n=== AUDIT_PASS ===');
    console.log('\n=== NEXT: STEP 5 — open dev-question URLs and visually check 7 items ===');
    console.log('=== THEN: STEP 6 — Vercel Preview for mobile check ===');
  }

} catch (err) {
  console.error('\n❌ Unexpected error: ' + err.message);
  process.exit(1);
}
