import { buildDefaultExplanationMeta } from './explanation_meta_default';
import { getAllQuestions } from '../lib/questions';
﻿import type { ExplanationMeta, ExplanationMetaMap } from './explanation_meta_types';
import { explanationMetaPilotLawV1 } from './explanation_meta_pilot_law_v1';
import { explanationMetaPilotPhysV1 } from './explanation_meta_pilot_phys_v1';
import { explanationMetaPilotPropV1 } from './explanation_meta_pilot_prop_v1';

/**
 * otu4 explanation meta index
 *
 * 現時点では法令pilotのみ統合。
 * 物化・性消pilotは後で追加する。
 *
 * 重要:
 * - 元JSONは変更しない
 * - star / difficulty はmetaに入れない
 * - metaがない問題は呼び出し側で従来解説にfallbackする
 */

export const generatedDefaultExplanationMetaMap: ExplanationMetaMap =
  Object.fromEntries(
    getAllQuestions().map((question) => [
      question.id,
      buildDefaultExplanationMeta(question),
    ]),
  ) as ExplanationMetaMap;

export const explicitExplanationMetaMap: ExplanationMetaMap = {
  ...explanationMetaPilotLawV1,
  ...explanationMetaPilotPhysV1,
  ...explanationMetaPilotPropV1,
};

/**
 * 全問題を標準metaで覆い、個別に作成済みのmetaを優先して上書きする。
 */
const OPTION_INDICES = [0, 1, 2, 3, 4] as const;

function mergeOptionMemos(
  generated: ExplanationMeta,
  explicit: ExplanationMeta,
): NonNullable<ExplanationMeta['optionMemos']> {
  const merged = {
    ...generated.optionMemos,
  } as NonNullable<ExplanationMeta['optionMemos']>;

  for (const optionIndex of OPTION_INDICES) {
    const explicitMemo =
      explicit.optionMemos?.[optionIndex];

    if (
      explicitMemo &&
      explicitMemo.trim().length > 0
    ) {
      merged[optionIndex] =
        explicitMemo;
    }
  }

  return merged;
}

function mergeExplanationMeta(
  generated: ExplanationMeta,
  explicit: ExplanationMeta | undefined,
): ExplanationMeta {
  if (!explicit) {
    return generated;
  }

  const correctAnswerLine =
    explicit.correctAnswerLine?.trim()
      ? explicit.correctAnswerLine
      : generated.correctAnswerLine;

  const shortExplanation =
    explicit.shortExplanation?.trim()
      ? explicit.shortExplanation
      : generated.shortExplanation;

  const reviewCtaLabel =
    explicit.reviewCtaLabel?.trim()
      ? explicit.reviewCtaLabel
      : generated.reviewCtaLabel;

  return {
    ...generated,
    ...explicit,
    correctAnswerLine,
    shortExplanation,
    reviewCtaLabel,
    optionMemos: mergeOptionMemos(
      generated,
      explicit,
    ),
  };
}

/**
 * 全701問を標準metaで覆い、個別metaの有効なフィールドだけを上書きする。
 *
 * 個別metaで空欄になっている正解文や選択肢解説は、
 * JSONから生成した標準metaで自動補完する。
 */
export const explanationMetaMap: ExplanationMetaMap =
  Object.fromEntries(
    getAllQuestions().map(
      (question) => {
        const generated =
          generatedDefaultExplanationMetaMap[
            question.id
          ];

        const explicit =
          explicitExplanationMetaMap[
            question.id
          ];

        return [
          question.id,
          mergeExplanationMeta(
            generated,
            explicit,
          ),
        ];
      },
    ),
  ) as ExplanationMetaMap;;

export function getExplanationMeta(questionId: string): ExplanationMeta | null {
  return explanationMetaMap[questionId] ?? null;
}




