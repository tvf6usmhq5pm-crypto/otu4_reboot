/**
 * Z4 STEP 1: dev-question 導線追加
 *
 * 実行方法:
 *   cd C:\Users\root7\otu4_reboot\02_app
 *   node z4_step1_dev_question.js
 *
 * 変更対象: components/quiz/QuizClient.tsx のみ
 * 触らない: data/*.json, data/*.ts, lib/*.ts, 01_locked_datasets
 *
 * 安全機構:
 *   - replaceExactlyOnce (マッチ1件でなければ書き込み前にthrow)
 *   - full-block正規表現アンカー (2関数の mock-exam を別パターンで一意捕捉)
 *   - \r?\n で LF/CRLF 混在対応
 *   - パッチ後 dev-question が2回・正しい関数内にあるかアサート
 *   - 二重実行防止 (既存チェック)
 *   - データ4ファイルのハッシュ不変チェック
 *   - タイムスタンプ付きバックアップ (.bak)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const quizPath = path.join(root, 'components', 'quiz', 'QuizClient.tsx');
const questionPath = path.join(root, 'data', 'questions_all_700_v1.json');
const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

// データ保護対象
const PROTECTED_FILES = [
  'data/questions_all_700_v1.json',
  'data/explanation_meta_pilot_law_v1.ts',
  'data/explanation_meta_pilot_phys_v1.ts',
  'data/explanation_meta_pilot_prop_v1.ts',
];

const PILOT_IDS = [
  'LAW-011-001', 'LAW-006-002-V01', 'LAW-004-008', 'LAW-020-002', 'LAW-002-002',
  'PHYS-002-001', 'PHYS-001-006', 'PHYS-001-008', 'PHYS-002-002', 'PHYS-003-005',
  'PROP-003-001', 'PROP-003-002-V02', 'PROP-003-003', 'PROP-003-007', 'PROP-002-016',
];

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

function replaceExactlyOnce(source, label, pattern, replacer) {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
  const globalPattern = new RegExp(pattern.source, flags);
  const count = [...source.matchAll(globalPattern)].length;
  if (count !== 1) {
    throw new Error(`[ABORT] ${label}: expected 1 match, got ${count}. No file written.`);
  }
  return source.replace(pattern, replacer);
}

// ── メイン ──

try {
  console.log('=== Z4 STEP 1: dev-question patch ===\n');

  // 0. ファイル存在チェック
  if (!fs.existsSync(quizPath)) {
    throw new Error('QuizClient.tsx not found at: ' + quizPath);
  }

  // 1. データファイルのハッシュ記録（before）
  console.log('[1/8] Recording data file hashes (before)...');
  const hashesBefore = {};
  for (const rel of PROTECTED_FILES) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) throw new Error('Protected file missing: ' + rel);
    hashesBefore[rel] = sha256(abs);
    console.log(`  ${rel}: ${hashesBefore[rel].slice(0, 16)}...`);
  }

  // 2. pilot ID 存在チェック
  console.log('\n[2/8] Verifying pilot IDs in questions JSON...');
  const questions = JSON.parse(read(questionPath));
  const knownIds = new Set(questions.map((q) => q.id));
  for (const id of PILOT_IDS) {
    if (!knownIds.has(id)) throw new Error('Pilot ID not found in JSON: ' + id);
  }
  console.log(`  All ${PILOT_IDS.length} pilot IDs verified.`);

  // 3. バックアップ
  console.log('\n[3/8] Creating backup...');
  const backupPath = `${quizPath}.backup_before_dev_question_${timestamp}.bak`;
  fs.copyFileSync(quizPath, backupPath);
  console.log(`  ${path.relative(root, backupPath)}`);

  // 4. 読み込み＋二重実行チェック
  let source = read(quizPath);
  if (source.includes("mode === 'dev-question'")) {
    throw new Error('dev-question mode already exists. Remove it first or skip STEP 1.');
  }

  // 5. パッチ適用
  console.log('\n[4/8] Applying patches...');

  // 5a. buildSessionFromMode シグネチャ
  source = replaceExactlyOnce(
    source,
    'buildSessionFromMode signature',
    /function buildSessionFromMode\(mode: string \| null, subject: string \| null\): LastSession \{/,
    'function buildSessionFromMode(mode: string | null, subject: string | null, id: string | null): LastSession {'
  );
  console.log('  [a] buildSessionFromMode signature ✓');

  // 5b. buildSessionFromMode: mock-exam full-block の前に dev-question を挿入
  const buildMockBlock =
    /  if \(mode === 'mock-exam'\) \{\r?\n    return buildLastSession\(\{\r?\n      sessionType: 'mock-exam',\r?\n      label: TEXT\.mockLabel,\r?\n    \}\);\r?\n  \}/;

  const devBuildBlock = [
    "  if (mode === 'dev-question' && id) {",
    "    return buildLastSession({",
    "      sessionType: 'daily-10',",
    "      label: `DEV: ${id}`,",
    "      count: 1,",
    "      questionIds: [id],",
    "    });",
    "  }",
  ].join('\n');

  source = replaceExactlyOnce(
    source,
    'buildSessionFromMode mock block',
    buildMockBlock,
    (match) => `${devBuildBlock}\n\n${match}`
  );
  console.log('  [b] buildSessionFromMode dev-question block ✓');

  // 5c. sessionMatchesMode シグネチャ
  const matchSigPattern =
    /function sessionMatchesMode\(\r?\n  session: LastSession,\r?\n  mode: string \| null,\r?\n  subject: string \| null,\r?\n\): boolean \{/;

  const matchSigReplacement = [
    'function sessionMatchesMode(',
    '  session: LastSession,',
    '  mode: string | null,',
    '  subject: string | null,',
    '  id: string | null,',
    '): boolean {',
  ].join('\n');

  source = replaceExactlyOnce(
    source,
    'sessionMatchesMode signature',
    matchSigPattern,
    matchSigReplacement
  );
  console.log('  [c] sessionMatchesMode signature ✓');

  // 5d. sessionMatchesMode: mock-exam full-block の前に dev-question を挿入
  const matchMockBlock =
    /  if \(mode === 'mock-exam'\) \{\r?\n    return session\.sessionType === 'mock-exam';\r?\n  \}/;

  const devMatchBlock = [
    "  if (mode === 'dev-question') {",
    "    return (",
    "      session.sessionType === 'daily-10' &&",
    "      session.questionIds.length === 1 &&",
    "      session.questionIds[0] === id",
    "    );",
    "  }",
  ].join('\n');

  source = replaceExactlyOnce(
    source,
    'sessionMatchesMode mock block',
    matchMockBlock,
    (match) => `${devMatchBlock}\n\n${match}`
  );
  console.log('  [d] sessionMatchesMode dev-question block ✓');

  // 5e. searchParams から id 取得
  source = replaceExactlyOnce(
    source,
    'searchParams id extraction',
    /  const subject = searchParams\?\.get\('subject'\) \?\? null;/,
    "  const subject = searchParams?.get('subject') ?? null;\n  const id = searchParams?.get('id') ?? null;"
  );
  console.log('  [e] searchParams id extraction ✓');

  // 5f. sessionMatchesMode 呼び出し
  source = replaceExactlyOnce(
    source,
    'sessionMatchesMode call',
    /sessionMatchesMode\(existing, mode, subject\)/,
    'sessionMatchesMode(existing, mode, subject, id)'
  );
  console.log('  [f] sessionMatchesMode call ✓');

  // 5g. buildSessionFromMode 呼び出し
  source = replaceExactlyOnce(
    source,
    'buildSessionFromMode call',
    /buildSessionFromMode\(mode, subject\)/,
    'buildSessionFromMode(mode, subject, id)'
  );
  console.log('  [g] buildSessionFromMode call ✓');

  // 5h. useEffect 依存配列
  source = replaceExactlyOnce(
    source,
    'useEffect deps',
    /  \}, \[mode, subject\]\);/,
    '  }, [mode, subject, id]);'
  );
  console.log('  [h] useEffect deps ✓');

  // 6. パッチ後アサーション
  console.log('\n[5/8] Post-patch assertions...');

  const devModeCount = (source.match(/mode === 'dev-question'/g) || []).length;
  if (devModeCount !== 2) {
    throw new Error(`Expected 2 dev-question checks, got ${devModeCount}`);
  }
  console.log(`  dev-question occurrences: ${devModeCount} ✓`);

  const buildDevIdx = source.indexOf("mode === 'dev-question' && id");
  const matchFnIdx = source.indexOf('function sessionMatchesMode(');
  const matchDevIdx = source.indexOf("mode === 'dev-question'", buildDevIdx + 1);
  if (!(buildDevIdx > 0 && matchFnIdx > buildDevIdx && matchDevIdx > matchFnIdx)) {
    throw new Error('dev-question blocks are not in the expected function positions');
  }
  console.log('  Function position check ✓');

  const requiredSnippets = [
    'function buildSessionFromMode(mode: string | null, subject: string | null, id: string | null): LastSession',
    "mode === 'dev-question' && id",
    'questionIds: [id]',
    "const id = searchParams?.get('id') ?? null;",
    'sessionMatchesMode(existing, mode, subject, id)',
    'buildSessionFromMode(mode, subject, id)',
    '}, [mode, subject, id]);',
  ];
  for (const snippet of requiredSnippets) {
    if (!source.includes(snippet)) {
      throw new Error('Missing required snippet: ' + snippet);
    }
  }
  console.log('  All required snippets present ✓');

  // 7. 書き込み
  console.log('\n[6/8] Writing patched QuizClient.tsx...');
  write(quizPath, source);
  console.log('  Written ✓');

  // 8. データファイルのハッシュ検証（after）
  console.log('\n[7/8] Verifying data files unchanged...');
  for (const rel of PROTECTED_FILES) {
    const abs = path.join(root, rel);
    const hashAfter = sha256(abs);
    if (hashesBefore[rel] !== hashAfter) {
      throw new Error(`CRITICAL: ${rel} was modified! Hash mismatch.`);
    }
  }
  console.log('  All data files unchanged ✓');

  // 9. 完了
  console.log('\n[8/8] DEV_QUESTION_PATCH_OK\n');
  console.log('Pilot URLs:');
  for (const id of PILOT_IDS) {
    console.log(`  http://localhost:3000/quiz?mode=dev-question&id=${id}`);
  }

  console.log('\n=== NEXT: run "npm run typecheck" to verify ===');
  console.log('=== THEN: open the first URL and check 3 items: ===');
  console.log('  1. star/difficulty NOT shown before answering');
  console.log('  2. ExplanationCard shown after selecting ③');
  console.log('  3. "3年以内" and "4月1日" supplement shown');

} catch (err) {
  console.error('\n❌ ' + err.message);
  console.error('\nNo damage done — check the error label above.');
  process.exit(1);
}
