import { getExplanationMeta } from '../data/explanation_meta_index';
import {
  STANDARD_MOCK,
  type LastSession,
  type OptionIndex,
  type Question,
  type SessionFilters,
  type SessionType,
  type Subject,
} from './types';

import {
  filterQuestions,
  getQuestionsBySubject,
  requireQuestionById,
} from './questions';

const OPTION_INDICES: OptionIndex[] = [0, 1, 2, 3, 4];

export interface BuildSessionOptions {
  sessionType: SessionType;
  label?: string;
  count?: number;
  filters?: SessionFilters;
  questionIds?: string[];
  now?: string;

  /** 今日の10問で画像対応問題をソフト優先する。 */
  preferImageQuestions?: boolean;
}

/**
 * 1つのセッションに入る問題セット。
 * LastSessionを作る前の中間結果。
 */
export interface QuizSet {
  sessionType: SessionType;
  label: string;
  questions: Question[];
  filters?: SessionFilters;
}

/**
 * Fisher-Yates shuffle.
 */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    const random = result[randomIndex];

    result[index] = random;
    result[randomIndex] = current;
  }

  return result;
}

/**
 * 5択の表示順を作る。
 * 戻り値は「表示順 → 元options index」の配列。
 *
 * 例:
 * [2, 0, 4, 1, 3]
 *
 * これは「表示1番目は元options[2]」という意味。
 */
export function buildOptionOrder(): OptionIndex[] {
  return [...OPTION_INDICES];
}

/**
 * questionIdsごとに選択肢表示順を作る。
 */
export function buildOptionOrders(
  questionIds: string[],
): Record<string, OptionIndex[]> {
  const orders: Record<string, OptionIndex[]> = {};

  questionIds.forEach((questionId) => {
    orders[questionId] = buildOptionOrder();
  });

  return orders;
}

/**
 * poolからcount件をランダム抽出する。
 * poolがcountより少ない場合は、ある分だけ返す。
 */
function pickRandomQuestions(pool: Question[], count: number): Question[] {
  if (pool.length === 0) {
    return [];
  }

  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

const DAILY_IMAGE_TARGET = 2;
const DAILY_IMAGE_MAX = 3;

function hasExplanationImage(question: Question): boolean {
  return Boolean(getExplanationMeta(question.id)?.visualImage?.src);
}

/**
 * 今日の10問用。
 * 画像対応問題を2問確保し、通常の母集団に余裕がある場合は最大3問に抑える。
 * 画像が不足する場合は通常問題で補完する。
 */
function pickImagePreferredQuestions(pool: Question[], count: number): Question[] {
  if (pool.length === 0 || count <= 0) {
    return [];
  }

  const limitedCount = Math.min(count, pool.length);
  const imagePool = pool.filter(hasExplanationImage);
  const nonImagePool = pool.filter((question) => !hasExplanationImage(question));

  const preferredImageCount = Math.min(
    DAILY_IMAGE_TARGET,
    limitedCount,
    imagePool.length,
  );

  const maximumImageCount = Math.min(
    DAILY_IMAGE_MAX,
    limitedCount,
    imagePool.length,
  );

  const selectedImages = pickRandomQuestions(
    imagePool,
    preferredImageCount,
  );

  const selectedIds = new Set(
    selectedImages.map((question) => question.id),
  );

  const guaranteedNonImageCount = Math.min(
    Math.max(0, limitedCount - maximumImageCount),
    nonImagePool.length,
  );

  const selectedNonImages = pickRandomQuestions(
    nonImagePool,
    guaranteedNonImageCount,
  );

  for (const question of selectedNonImages) {
    selectedIds.add(question.id);
  }

  const remainingCount =
    limitedCount - selectedIds.size;

  const remainingPool = pool.filter(
    (question) => !selectedIds.has(question.id),
  );

  const remaining = pickRandomQuestions(
    remainingPool,
    remainingCount,
  );

  return shuffle([
    ...selectedImages,
    ...selectedNonImages,
    ...remaining,
  ]);
}

/**
 * questionIds指定がある場合の問題取得。
 */
function questionsFromIds(questionIds: string[]): Question[] {
  return questionIds.map((id) => requireQuestionById(id));
}

/**
 * daily-10 / card-study / saved / weak-points などの通常セッションを作る。
 */
function buildPracticeQuizSet(options: BuildSessionOptions): QuizSet {
  const count = options.count ?? 10;

  if (options.questionIds && options.questionIds.length > 0) {
    const selected = questionsFromIds(options.questionIds).slice(0, count);

    return {
      sessionType: options.sessionType,
      label: options.label ?? defaultSessionLabel(options.sessionType),
      questions: selected,
      filters: options.filters,
    };
  }

  const pool = filterQuestions(options.filters ?? {});
  const selected = options.preferImageQuestions
    ? pickImagePreferredQuestions(pool, count)
    : pickRandomQuestions(pool, count);

  return {
    sessionType: options.sessionType,
    label: options.label ?? defaultSessionLabel(options.sessionType),
    questions: selected,
    filters: options.filters,
  };
}

/**
 * 35問模試を作る。
 * 乙4本試験準拠:
 * - 法令15問
 * - 物化10問
 * - 性消10問
 */
function buildMockQuizSet(options: BuildSessionOptions): QuizSet {
  const filters = options.filters ?? {};

  const law = pickRandomQuestions(
    filterQuestions({ ...filters, subject: 'law' }),
    STANDARD_MOCK.law,
  );

  const phys = pickRandomQuestions(
    filterQuestions({ ...filters, subject: 'phys' }),
    STANDARD_MOCK.phys,
  );

  const prop = pickRandomQuestions(
    filterQuestions({ ...filters, subject: 'prop' }),
    STANDARD_MOCK.prop,
  );

  const selected = shuffle([...law, ...phys, ...prop]);

  return {
    sessionType: options.sessionType,
    label: options.label ?? defaultSessionLabel(options.sessionType),
    questions: selected,
    filters: options.filters,
  };
}

/**
 * SessionTypeごとのデフォルト表示名。
 */
export function defaultSessionLabel(sessionType: SessionType): string {
  switch (sessionType) {
    case 'daily-10':
      return '今日の10問';

    case 'weak-points':
      return '弱点復習';

    case 'saved-questions':
      return '保存問題';

    case 'mock-exam':
      return '35問 本番モード';

    case 'mock-practice':
      return '35問 練習モード';

    case 'card-study':
      return 'カード別演習';
  }
}

/**
 * 問題セットを作る。
 * UIはこの関数を直接使ってもよいが、
 * 保存用には buildLastSession を使う。
 */
export function buildQuizSet(options: BuildSessionOptions): QuizSet {
  if (
    options.sessionType === 'mock-exam' ||
    options.sessionType === 'mock-practice'
  ) {
    return buildMockQuizSet(options);
  }

  return buildPracticeQuizSet(options);
}

/**
 * LastSession を作る。
 * localStorage保存前の完成形。
 */
export function buildLastSession(options: BuildSessionOptions): LastSession {
  const quizSet = buildQuizSet(options);
  const questionIds = quizSet.questions.map((question) => question.id);

  return {
    sessionType: quizSet.sessionType,
    label: quizSet.label,
    questionIds,
    currentIndex: 0,
    answers: {},
    revealed: {},
    optionOrders: buildOptionOrders(questionIds),
    startedAt: options.now ?? new Date().toISOString(),
    filters: quizSet.filters,
  };
}

/**
 * 表示indexから、元options indexへ変換する。
 *
 * 例:
 * optionOrders[questionId] = [2, 0, 4, 1, 3]
 * displayedIndex = 0
 * → originalIndex = 2
 */
export function toOriginalOptionIndex(
  session: LastSession,
  questionId: string,
  displayedIndex: OptionIndex,
): OptionIndex {
  const order = session.optionOrders?.[questionId] ?? OPTION_INDICES;
  const originalIndex = order[displayedIndex];

  if (originalIndex === undefined) {
    throw new Error(`Invalid displayed index: ${displayedIndex}`);
  }

  return originalIndex;
}

/**
 * 元options indexから、表示indexへ変換する。
 */
export function toDisplayedOptionIndex(
  session: LastSession,
  questionId: string,
  originalIndex: OptionIndex,
): OptionIndex {
  const order = session.optionOrders?.[questionId] ?? OPTION_INDICES;
  const displayedIndex = order.findIndex((index) => index === originalIndex);

  if (displayedIndex === -1) {
    throw new Error(`Original option index not found: ${originalIndex}`);
  }

  return displayedIndex as OptionIndex;
}

/**
 * 回答をLastSessionへ反映する。
 * displayedIndexではなく、元options indexとして保存する。
 */
export function answerQuestion(
  session: LastSession,
  questionId: string,
  displayedIndex: OptionIndex,
): LastSession {
  const originalIndex = toOriginalOptionIndex(
    session,
    questionId,
    displayedIndex,
  );

  return {
    ...session,
    answers: {
      ...session.answers,
      [questionId]: originalIndex,
    },
  };
}

/**
 * 解説表示済みにする。
 */
export function revealQuestion(
  session: LastSession,
  questionId: string,
): LastSession {
  return {
    ...session,
    revealed: {
      ...session.revealed,
      [questionId]: true,
    },
  };
}

/**
 * 次の問題へ進む。
 */
export function moveToNextQuestion(session: LastSession): LastSession {
  return {
    ...session,
    currentIndex: Math.min(
      session.currentIndex + 1,
      session.questionIds.length - 1,
    ),
  };
}

/**
 * 前の問題へ戻る。
 */
export function moveToPreviousQuestion(session: LastSession): LastSession {
  return {
    ...session,
    currentIndex: Math.max(session.currentIndex - 1, 0),
  };
}

/**
 * 現在の問題IDを取得する。
 */
export function getCurrentQuestionId(session: LastSession): string | undefined {
  return session.questionIds[session.currentIndex];
}

/**
 * 現在の問題を取得する。
 */
export function getCurrentQuestion(session: LastSession): Question | undefined {
  const questionId = getCurrentQuestionId(session);

  if (!questionId) {
    return undefined;
  }

  return requireQuestionById(questionId);
}

/**
 * 元options indexで正誤判定する。
 */
export function isCorrectAnswer(
  question: Question,
  originalIndex: OptionIndex,
): boolean {
  return question.correct === originalIndex;
}

/**
 * LastSessionに保存された回答を使って正誤判定する。
 */
export function isQuestionCorrect(
  session: LastSession,
  questionId: string,
): boolean | undefined {
  const question = requireQuestionById(questionId);
  const answer = session.answers[questionId];

  if (answer === undefined) {
    return undefined;
  }

  return isCorrectAnswer(question, answer);
}

/**
 * セッション結果を集計する。
 */
export function summarizeSession(session: LastSession) {
  const answeredQuestionIds = Object.keys(session.answers);

  const correctCount = answeredQuestionIds.filter((questionId) =>
    isQuestionCorrect(session, questionId),
  ).length;

  return {
    total: session.questionIds.length,
    answered: answeredQuestionIds.length,
    correct: correctCount,
    wrong: answeredQuestionIds.length - correctCount,
    accuracy:
      answeredQuestionIds.length === 0
        ? 0
        : correctCount / answeredQuestionIds.length,
  };
}

/**
 * 科目別に模試結果を集計する。
 */
export function summarizeSessionBySubject(session: LastSession): Record<
  Subject,
  {
    total: number;
    answered: number;
    correct: number;
  }
> {
  const initial = {
    law: {
      total: 0,
      answered: 0,
      correct: 0,
    },
    phys: {
      total: 0,
      answered: 0,
      correct: 0,
    },
    prop: {
      total: 0,
      answered: 0,
      correct: 0,
    },
  };

  session.questionIds.forEach((questionId) => {
    const question = requireQuestionById(questionId);
    const subject = question.subject;

    initial[subject].total += 1;

    const result = isQuestionCorrect(session, questionId);

    if (result !== undefined) {
      initial[subject].answered += 1;
    }

    if (result === true) {
      initial[subject].correct += 1;
    }
  });

  return initial;
}

/**
 * 1科目60%以上かどうかを判定する。
 */
export function isSubjectPassed(correct: number, total: number): boolean {
  if (total === 0) {
    return false;
  }

  return correct / total >= STANDARD_MOCK.passLine;
}

/**
 * 模試合格判定。
 * 乙4は3科目それぞれ60%以上が必要。
 */
export function summarizeMockPass(session: LastSession) {
  const bySubject = summarizeSessionBySubject(session);

  return {
    law: isSubjectPassed(bySubject.law.correct, bySubject.law.total),
    phys: isSubjectPassed(bySubject.phys.correct, bySubject.phys.total),
    prop: isSubjectPassed(bySubject.prop.correct, bySubject.prop.total),
    passed:
      isSubjectPassed(bySubject.law.correct, bySubject.law.total) &&
      isSubjectPassed(bySubject.phys.correct, bySubject.phys.total) &&
      isSubjectPassed(bySubject.prop.correct, bySubject.prop.total),
  };
}
