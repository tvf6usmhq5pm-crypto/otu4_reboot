# otu4 current progress handoff

## Current state

This bundle contains the current working state of the Otu4/Z4 explanation pilot.

## Important current rules

- Do not touch locked dataset.
- Do not modify session/storage/diagnostics logic unless explicitly requested.
- Do not modify correct-answer logic.
- Do not modify option shuffle logic.
- Do not edit data/questions_all_700_v1.json casually.
- This bundle is for reading and review first.

## Current explanation pilot

Confirmed pilot:
- LAW-006-002-V01
- LAW-011-001
- LAW-004-008
- LAW-020-002
- LAW-002-002
- PHYS-002-001
- PHYS-001-006
- PHYS-001-008
- PHYS-002-002
- PHYS-003-005

Prop pilot may exist as a file, but treat it as not fully confirmed unless preview/typecheck result is checked.

## Key current decisions

- OptionMemoList does not receive correct.
- OptionMemoList does not show the correct option row.
- optionMemos must not include the exam-correct option.
- In "誤っているものはどれか" questions:
  - the exam-correct option is the statement that is false.
  - other options may be true statements but wrong to select.
- ProcessDiagram uses neutral STEP display.
- ProcessDiagram does not use variant colors.
- ComparisonTable may use light correct/danger emphasis.
- Emoji icons are not used.
- SVG/visualKey diagrams are future phase.

## Recent LAW-011-001 change

Option ③ should be:
危険物の取扱作業に従事する危険物取扱者は、5年に1回、保安講習を受けなければならない。

The explanation should mention:
継続して従事する場合は、免状交付日または前回講習日以後の最初の4月1日から3年以内ごと。

## Next recommended work

1. Confirm current pilot problem bodies and explanation meta consistency.
2. Fix star/difficulty display timing in QuizClient: show only after revealed.
3. Then connect ExplanationCard into QuizClient with fallback:
   - meta exists: ExplanationCard
   - meta missing: existing explanation
