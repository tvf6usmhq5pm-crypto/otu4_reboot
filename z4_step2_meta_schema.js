/**
 * Z4 STEP 2+3: meta schema 拡張 + pilot 15問への3項目流し込み
 *
 * 実行方法:
 *   cd C:\Users\root7\otu4_reboot\02_app
 *   node z4_step2_meta_schema.js
 *
 * 変更対象:
 *   data/explanation_meta_types.ts     (型に LossCategory + 3必須フィールド追加)
 *   data/explanation_meta_pilot_law_v1.ts   (法令5問に3項目追加)
 *   data/explanation_meta_pilot_phys_v1.ts  (物化5問に3項目追加)
 *   data/explanation_meta_pilot_prop_v1.ts  (性消5問に3項目追加)
 *
 * 触らない: data/questions_all_700_v1.json, lib/*.ts, 01_locked_datasets
 *
 * 安全機構:
 *   - replaceExactlyOnce (全置換にアンカー一意性を強制)
 *   - questions JSON のハッシュ不変チェック
 *   - タイムスタンプ付き .bak バックアップ
 *   - 既存フィールド検出で二重実行防止
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

// ── パス定義 ──

const TYPES_PATH = path.join(root, 'data', 'explanation_meta_types.ts');
const PILOT_PATHS = {
  law: path.join(root, 'data', 'explanation_meta_pilot_law_v1.ts'),
  phys: path.join(root, 'data', 'explanation_meta_pilot_phys_v1.ts'),
  prop: path.join(root, 'data', 'explanation_meta_pilot_prop_v1.ts'),
};
const JSON_PATH = path.join(root, 'data', 'questions_all_700_v1.json');

// ── 保護対象（変更してはいけないファイル）──

const PROTECTED_FILES = [
  'data/questions_all_700_v1.json',
];

// ── 確定済み割当表 ──

const ASSIGNMENTS = {
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

// ── ユーティリティ ──

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, text) {
  fs.writeFileSync(file, text, 'utf8');
}

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function backup(filePath) {
  const bak = `${filePath}.backup_before_meta_schema_${timestamp}.bak`;
  fs.copyFileSync(filePath, bak);
  return path.relative(root, bak);
}

function replaceExactlyOnce(source, label, pattern, replacement) {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
  const globalPattern = new RegExp(pattern.source, flags);
  const count = [...source.matchAll(globalPattern)].length;
  if (count !== 1) {
    throw new Error(`[ABORT] ${label}: expected 1 match, got ${count}. No file written.`);
  }
  return source.replace(pattern, replacement);
}

// ── メイン ──

try {
  console.log('=== Z4 STEP 2+3: meta schema extension ===\n');

  // 0. ファイル存在チェック
  for (const p of [TYPES_PATH, JSON_PATH, ...Object.values(PILOT_PATHS)]) {
    if (!fs.existsSync(p)) throw new Error('File not found: ' + p);
  }

  // 1. 保護ファイルのハッシュ記録
  console.log('[1/6] Recording protected file hashes...');
  const hashesBefore = {};
  for (const rel of PROTECTED_FILES) {
    const abs = path.join(root, rel);
    hashesBefore[rel] = sha256(abs);
    console.log(`  ${rel}: ${hashesBefore[rel].slice(0, 16)}...`);
  }

  // 2. 二重実行チェック
  const typesContent = read(TYPES_PATH);
  if (typesContent.includes('LossCategory')) {
    throw new Error('LossCategory already exists in types. STEP 2 may have been run already.');
  }

  for (const [subj, p] of Object.entries(PILOT_PATHS)) {
    const content = read(p);
    if (content.includes('schemaVersion')) {
      throw new Error(`schemaVersion already exists in ${subj} pilot. STEP 3 may have been run already.`);
    }
  }
  console.log('  No prior run detected ✓\n');

  // 3. バックアップ
  console.log('[2/6] Creating backups...');
  console.log('  ' + backup(TYPES_PATH));
  for (const p of Object.values(PILOT_PATHS)) {
    console.log('  ' + backup(p));
  }

  // ═══════════════════════════════════════
  // STEP 2: explanation_meta_types.ts 修正
  // ═══════════════════════════════════════

  console.log('\n[3/6] STEP 2: Patching explanation_meta_types.ts...');

  let types = read(TYPES_PATH);

  // 2a. LossCategory union 型を ExplanationStyle の直後に追加
  types = replaceExactlyOnce(
    types,
    'LossCategory insertion point',
    /(export type ExplanationStyle =\r?\n(?:  \| '[a-z_]+'\r?\n)*  \| '[a-z_]+';)/,
    (match) => `${match}\n\nexport type LossCategory =\n  | 'number_confusion'\n  | 'classification_confusion'\n  | 'procedure_confusion'\n  | 'scope_confusion'\n  | 'direction_confusion'\n  | 'property_confusion';`
  );
  console.log('  [a] LossCategory type added ✓');

  // 2b. ExplanationMeta に3必須フィールドを追加（lossTitle の直後に挿入）
  types = replaceExactlyOnce(
    types,
    'ExplanationMeta schema fields',
    /(  lossTitle: string;\r?\n  style: ExplanationStyle;)/,
    (match) => `  schemaVersion: number;\n  misconceptionId: string;\n  lossCategory: LossCategory;\n${match}`
  );
  console.log('  [b] schemaVersion / misconceptionId / lossCategory added to ExplanationMeta ✓');

  write(TYPES_PATH, types);
  console.log('  Written ✓');

  // ═══════════════════════════════════════
  // STEP 3: pilot 3ファイルに3項目を流し込み
  // ═══════════════════════════════════════

  console.log('\n[4/6] STEP 3: Populating pilot files...');

  for (const [subj, pilotPath] of Object.entries(PILOT_PATHS)) {
    let content = read(pilotPath);
    const ids = Object.keys(ASSIGNMENTS).filter((id) => {
      if (subj === 'law') return id.startsWith('LAW-');
      if (subj === 'phys') return id.startsWith('PHYS-');
      if (subj === 'prop') return id.startsWith('PROP-');
      return false;
    });

    for (const qid of ids) {
      const a = ASSIGNMENTS[qid];
      const insertion =
        `    schemaVersion: 1,\n` +
        `    misconceptionId: '${a.misconceptionId}',\n` +
        `    lossCategory: '${a.lossCategory}',`;

      // questionId: 'XXX', の直後に挿入
      const pattern = new RegExp(
        `(    questionId: '${qid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\r?\\n)`
      );
      const matches = [...content.matchAll(new RegExp(pattern.source, 'g'))];
      if (matches.length !== 1) {
        throw new Error(`[ABORT] questionId '${qid}' in ${subj}: expected 1 match, got ${matches.length}`);
      }
      content = content.replace(pattern, `$1${insertion}\n`);
      console.log(`  ${qid} → ${a.misconceptionId} (${a.lossCategory}) ✓`);
    }

    write(pilotPath, content);
  }

  // ═══════════════════════════════════════
  // 検証
  // ═══════════════════════════════════════

  console.log('\n[5/6] Post-patch verification...');

  // 型ファイルの検証
  const finalTypes = read(TYPES_PATH);
  const requiredTypeSnippets = [
    "export type LossCategory =",
    "'number_confusion'",
    "'classification_confusion'",
    "'procedure_confusion'",
    "'scope_confusion'",
    "'direction_confusion'",
    "'property_confusion'",
    "schemaVersion: number;",
    "misconceptionId: string;",
    "lossCategory: LossCategory;",
  ];
  for (const s of requiredTypeSnippets) {
    if (!finalTypes.includes(s)) throw new Error('Missing in types: ' + s);
  }
  console.log('  Types file: all snippets present ✓');

  // pilot ファイルの検証
  let totalEntries = 0;
  for (const [subj, pilotPath] of Object.entries(PILOT_PATHS)) {
    const content = read(pilotPath);
    const ids = Object.keys(ASSIGNMENTS).filter((id) => {
      if (subj === 'law') return id.startsWith('LAW-');
      if (subj === 'phys') return id.startsWith('PHYS-');
      if (subj === 'prop') return id.startsWith('PROP-');
      return false;
    });
    for (const qid of ids) {
      const a = ASSIGNMENTS[qid];
      if (!content.includes(`schemaVersion: 1,`)) throw new Error(`Missing schemaVersion in ${qid}`);
      if (!content.includes(`misconceptionId: '${a.misconceptionId}'`)) throw new Error(`Missing misconceptionId in ${qid}`);
      if (!content.includes(`lossCategory: '${a.lossCategory}'`)) throw new Error(`Missing lossCategory in ${qid}`);
      totalEntries++;
    }
  }
  console.log(`  Pilot files: ${totalEntries}/15 entries verified ✓`);

  // 共有ペアの検証
  const sharedPairs = [
    ['PHYS-002-001', 'PHYS-001-006', 'phys.combustion.liquid_evaporative'],
    ['PHYS-001-008', 'PHYS-002-002', 'phys.combustion.wood_charcoal'],
    ['PROP-003-001', 'PROP-003-002-V02', 'prop.extinguish.type4_water_jet'],
  ];
  for (const [a, b, expected] of sharedPairs) {
    if (ASSIGNMENTS[a].misconceptionId !== expected) throw new Error(`Shared pair mismatch: ${a}`);
    if (ASSIGNMENTS[b].misconceptionId !== expected) throw new Error(`Shared pair mismatch: ${b}`);
  }
  console.log('  Shared misconceptionId pairs: 3/3 verified ✓');

  // 保護ファイルのハッシュ検証
  console.log('\n[6/6] Verifying protected files unchanged...');
  for (const rel of PROTECTED_FILES) {
    const abs = path.join(root, rel);
    const hashAfter = sha256(abs);
    if (hashesBefore[rel] !== hashAfter) {
      throw new Error(`CRITICAL: ${rel} was modified! Hash mismatch.`);
    }
  }
  console.log('  questions_all_700_v1.json unchanged ✓');

  // 完了
  console.log('\n=== META_SCHEMA_PATCH_OK ===');
  console.log(`\nSummary:`);
  console.log(`  Types:  LossCategory (6 values) + 3 required fields added`);
  console.log(`  Pilots: ${totalEntries} entries populated (schemaVersion: 1)`);
  console.log(`  Shared: 3 misconceptionId pairs verified`);
  console.log(`  JSON:   untouched`);
  console.log('\n=== NEXT: run "npm run typecheck" to verify ===');
  console.log('=== THEN: run "node z4_step4_audit.js" ===');

} catch (err) {
  console.error('\n❌ ' + err.message);
  console.error('\nRestore from .bak files if any writes occurred.');
  process.exit(1);
}
