import type { Question } from '../lib/types';
import type { ExplanationMeta } from './explanation_meta_types';

const CIRCLED_OPTION_NUMBERS = ['①', '②', '③', '④', '⑤'] as const;

function buildDefaultOptionMemos(
  question: Question,
): NonNullable<ExplanationMeta['optionMemos']> {
  return {
    0: question.option_details[0],
    1: question.option_details[1],
    2: question.option_details[2],
    3: question.option_details[3],
    4: question.option_details[4],
  };
}

/**
 * 個別metaがまだない問題をExplanationCardで表示するための標準meta。
 *
 * 既存JSONの問題文・正解・explanation・option_detailsをそのまま利用する。
 * 個別に作成した高品質metaはexplanation_meta_index側で上書きする。
 */
export function buildDefaultExplanationMeta(
  question: Question,
): ExplanationMeta {
  const correctIndex = question.correct;

  return {
    questionId: question.id,
    schemaVersion: 1,
    misconceptionId: `default.${question.id.toLowerCase()}`,
    lossTitle: '',
    lossCategory: 'number_confusion',
    correctAnswerLine:
      `正解：${CIRCLED_OPTION_NUMBERS[correctIndex]} ${question.options[correctIndex]}`,
    style: 'short',
    shortExplanation: question.explanation,
    optionMemos: buildDefaultOptionMemos(question),
    reviewCtaLabel: 'この問題を復習する',
  };
}
