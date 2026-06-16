import type { ExplanationMeta, ExplanationMetaMap } from './explanation_meta_types';
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

export const explanationMetaMap: ExplanationMetaMap = {
  ...explanationMetaPilotLawV1,
  ...explanationMetaPilotPhysV1,
  ...explanationMetaPilotPropV1,
};

export function getExplanationMeta(questionId: string): ExplanationMeta | null {
  return explanationMetaMap[questionId] ?? null;
}




