# Z4 GEMI 実行ガイド

**このガイドだけで STEP 1〜6 を完遂できます。**
引き継ぎ書 `Z4_handoff_20260616.md` を前提知識として必ず先に読んでください。

---

## 実行環境

```
プロジェクト: C:\Users\root7\otu4_reboot\02_app
ランタイム:   Node.js (npm run typecheck が動くこと)
ブラウザ:     localhost:3000 (npm run dev)
```

---

## 全体の流れ

```
STEP 1  dev-question導線追加      → z4_step1_dev_question.js
STEP 2  meta型+pilot 15問に3項目  → z4_step2_meta_schema.js
        npm run typecheck
STEP 3  (STEP 2に統合済み)
STEP 4  監査                      → z4_step4_audit.js
STEP 5  dev-questionで15問目視     → ブラウザ
STEP 6  Vercel Previewでスマホ確認 → git push + Vercel
```

---

## STEP 1: dev-question 導線追加

### やること
`QuizClient.tsx` に `?mode=dev-question&id=XXX` で指定IDの1問だけ出す開発用ルートを追加。

### 実行手順

```powershell
cd C:\Users\root7\otu4_reboot\02_app

# 0. 現状が壊れていないことを確認
npm run typecheck

# 1. スクリプトをプロジェクトルートに置いて実行
node z4_step1_dev_question.js

# 2. typecheck
npm run typecheck
```

### 合格基準
| 項目 | 期待値 |
|---|---|
| コンソール出力 | `DEV_QUESTION_PATCH_OK` + 15本のURL |
| typecheck | PASS |
| `data files unchanged` | 4ファイルのハッシュ一致 |

### ブラウザ確認（3点）
```
http://localhost:3000/quiz?mode=dev-question&id=LAW-011-001
```
1. 解答前は star / difficulty が**出ない**
2. ③を選んだ後に **ExplanationCard が出る**（従来のテキスト解説ではなく、カード形式）
3. 「3年以内」「4月1日」補足が出る

### 失敗した場合
- `[ABORT]` で止まった → `QuizClient.tsx` は無傷。エラーラベルを確認
- typecheckで落ちた → `.bak` ファイルから復元:
  ```powershell
  Copy-Item "components\quiz\QuizClient.tsx.backup_before_dev_question_*.bak" "components\quiz\QuizClient.tsx"
  ```

---

## STEP 2+3: meta schema 拡張 + pilot 15問への3項目流し込み

### やること
1. `explanation_meta_types.ts` に `LossCategory` union型と3必須フィールドを追加
2. pilot 3ファイル（law/phys/prop）の全15エントリに確定値を挿入

### 追加されるフィールド
```ts
schemaVersion: 1                                    // meta仕様バージョン
misconceptionId: 'law.safety_course.interval_5y'    // 誤解の固定ID（集計キー）
lossCategory: 'number_confusion'                    // 粗い分類（enum）
```

### 実行手順

```powershell
cd C:\Users\root7\otu4_reboot\02_app

# 1. スクリプト実行
node z4_step2_meta_schema.js

# 2. typecheck
npm run typecheck
```

### 合格基準
| 項目 | 期待値 |
|---|---|
| コンソール出力 | `META_SCHEMA_PATCH_OK` |
| 15エントリすべてに3項目 | verified ✓ |
| 共有ペア3組 | verified ✓ |
| questions JSON | unchanged ✓ |
| typecheck | PASS |

### 失敗した場合
`.bak` ファイルから復元:
```powershell
# types
Copy-Item "data\explanation_meta_types.ts.backup_before_meta_schema_*.bak" "data\explanation_meta_types.ts"
# pilots
Copy-Item "data\explanation_meta_pilot_law_v1.ts.backup_before_meta_schema_*.bak" "data\explanation_meta_pilot_law_v1.ts"
Copy-Item "data\explanation_meta_pilot_phys_v1.ts.backup_before_meta_schema_*.bak" "data\explanation_meta_pilot_phys_v1.ts"
Copy-Item "data\explanation_meta_pilot_prop_v1.ts.backup_before_meta_schema_*.bak" "data\explanation_meta_pilot_prop_v1.ts"
```

---

## STEP 4: 監査

### やること
全自動で15問の整合性を検査する。**このスクリプトはファイルを一切変更しない。**

### 実行手順

```powershell
node z4_step4_audit.js
```

### 検査項目（8カテゴリ）
1. 15問すべてに `schemaVersion` あり
2. 15問すべてに `misconceptionId` あり（値が割当表と一致）
3. 15問すべてに `lossCategory` あり（値が割当表と一致）
4. `lossCategory` が enum 内（6値のいずれか）
5. 共有ペア3組が同じ `misconceptionId`
6. `optionMemos` に正解選択肢なし
7. pilot ID が `questions_all_700_v1.json` 内に存在
8. 700問全体の `**` ペア検査（不対なし）

### 合格基準
```
=== AUDIT_PASS ===
```
`AUDIT_FAIL` が出たら、表示されるFailure一覧を確認。

---

## STEP 5: dev-question で15問を目視確認

### やること
以下の15 URLを順に開き、7点チェック。

```
http://localhost:3000/quiz?mode=dev-question&id=LAW-006-002-V01
http://localhost:3000/quiz?mode=dev-question&id=LAW-011-001
http://localhost:3000/quiz?mode=dev-question&id=LAW-004-008
http://localhost:3000/quiz?mode=dev-question&id=LAW-020-002
http://localhost:3000/quiz?mode=dev-question&id=LAW-002-002
http://localhost:3000/quiz?mode=dev-question&id=PHYS-002-001
http://localhost:3000/quiz?mode=dev-question&id=PHYS-001-006
http://localhost:3000/quiz?mode=dev-question&id=PHYS-001-008
http://localhost:3000/quiz?mode=dev-question&id=PHYS-002-002
http://localhost:3000/quiz?mode=dev-question&id=PHYS-003-005
http://localhost:3000/quiz?mode=dev-question&id=PROP-003-001
http://localhost:3000/quiz?mode=dev-question&id=PROP-003-002-V02
http://localhost:3000/quiz?mode=dev-question&id=PROP-003-003
http://localhost:3000/quiz?mode=dev-question&id=PROP-003-007
http://localhost:3000/quiz?mode=dev-question&id=PROP-002-016
```

### 7点チェック（全問共通）
| # | 確認項目 | 合格条件 |
|---|---|---|
| 1 | 解答前 star | 出ない |
| 2 | 解答前 difficulty | 出ない |
| 3 | 解答後 star | 出る（star > 0 の問題のみ） |
| 4 | 解答後 difficulty | 出る |
| 5 | ExplanationCard | 出る（カード形式、テキストのみではない） |
| 6 | `**bold**` | アスタリスクが生で表示されない（太字になっている） |
| 7 | ProcessDiagram | 赤緑で過度に強調されていない |

### 注意
- テスト中の誤答は**弱点データ（localStorage）に入る**。確認後に localStorage をクリアすること。
- 各URLで「前のセッションが残っている」場合は、localStorageクリア or 別のシークレットウィンドウで。

---

## STEP 6: Vercel Preview でスマホ確認

### やること
Preview Deployment（本番ではなく）を作り、スマホで表示確認。

### 手順（Git連携の場合）
```powershell
git add -A
git commit -m "feat: Z4 ExplanationCard schema v1 + dev-question route"
git push origin <branch-name>
```
→ Vercel が自動で Preview URL を発行。スマホでそのURLを開く。

### 手順（Vercel CLI の場合）
```powershell
vercel          # ← Preview（本番ではない）
```
→ 出力される Preview URL をスマホで開く。

### スマホ確認項目
| 確認項目 | 詳細 |
|---|---|
| 比較表 (ComparisonTable) | narrow幅で崩れない |
| 手順表 (ProcedureTable) | narrow幅で崩れない |
| 数字カード (NumberCard) | 読みやすい |
| 3書体 | Noto Serif JP / Cormorant Garamond / Noto Sans JP が出る |
| 5色パレット | ネイビー#0E1A2B / ゴールド#C9A55A / レッド#B01F2E / セージ#4C7A5D / アイボリー#F7F4EE |
| タップ領域 | 選択肢ボタンが十分な大きさ |

### 注意
- dev-question ルートは Preview URL でも公開アクセス可能。本番前に `NODE_ENV` ガードを検討。
- `--prod` フラグは使わない（本番デプロイではないため）。

---

## 禁止事項（再掲・最重要）

1. **PowerShell の Get-Content / Set-Content で日本語ファイルを書き換えない** → Node の readFileSync / writeFileSync を使う
2. **01_locked_datasets を触らない**
3. **lib/session.ts / storage.ts / diagnostics.ts を変更しない**
4. **正解判定・保存ロジック・option order を変更しない**
5. **バックアップは必ず .bak 拡張子**（.backup_*.ts は作らない）

---

## トラブルシューティング

### スクリプトが `[ABORT]` で止まる
アンカーが見つからないか、複数見つかった。`QuizClient.tsx` やmeta tsファイルが**想定と異なる状態**。
→ エラーメッセージの `label` と `got N` を確認し、該当箇所を手で確認。
→ 既にパッチ済みなら二重実行防止で止まる（正常動作）。

### typecheck が落ちる
→ `.bak` から復元。復元後に `npm run typecheck` で元に戻ることを確認。
→ エラーメッセージを記録して報告。

### ブラウザで ExplanationCard が出ない
→ `getExplanationMeta(questionId)` が `null` を返している可能性。
→ `explanation_meta_index.ts` が3科目すべてを import/spread しているか確認。
→ questionId のスペルミス（ハイフンやV01等）を確認。

### 「前のセッションが残る」で別の問題が出る
→ DevTools → Application → Local Storage → localhost をクリア → リロード。
