// ============================================================
// otu4 lib/types.ts
// Single source of truth for app-wide types.
// No imports. No React. No UI logic.
// ============================================================

// ------------------------------------------------------------
// Data Layer
// ------------------------------------------------------------

/** 公論系の学習優先度。出題頻度・重要度の軸。難易度ではない。 */
export type Star = 0 | 1 | 2 | 3;

/** 問題そのものの難易度。 */
export type Difficulty = 1 | 2 | 3;

/** 難易度の決定根拠。 */
export type DifficultySource = 'manual' | 'heuristic' | 'empirical';

/** 乙4の3科目。 */
export type Subject = 'law' | 'phys' | 'prop';

/** 5択の正答index。元 options 配列上の index。 */
export type OptionIndex = 0 | 1 | 2 | 3 | 4;

/** 5択固定。 */
export type FiveChoices = [string, string, string, string, string];

/** 派生問題の種類。 */
export type VariantType =
  | 'numeric'
  | 'comparison'
  | 'context'
  | 'exception'
  | 'reinforcement'
  | 'negate';

/** audit 優先度。 */
export type AuditPriority = 'high' | 'medium' | 'none';

/** アプリ内で使う正規化済み問題型。 */
export interface Question {
  id: string;

  category: string;
  subject: Subject;
  sectionKey: string;

  item_id: number;
  item_name: string;

  star: Star;
  difficulty: Difficulty;
  difficultySource: DifficultySource;

  question: string;
  options: FiveChoices;
  correct: OptionIndex;

  explanation: string;
  option_details: FiveChoices;

  label: string;
  card_id: string;

  parentId?: string;
  variantType?: VariantType;

  previousDifficulty?: Difficulty;
  difficultyMetric?: number;
  difficultyUpdatedAt?: string;

  reviewFlag?: boolean;
  reviewReason?: string;
  basicCandidate?: boolean;
  auditPriority?: AuditPriority;
  auditNote?: string;
}

/** JSON import直後など、まだ5択tuple保証前の問題型。 */
export interface RawQuestion {
  id: string;

  category: string;
  subject: Subject;
  sectionKey: string;

  item_id: number;
  item_name: string;

  star: Star;
  difficulty: Difficulty;
  difficultySource: DifficultySource;

  question: string;
  options: string[];
  correct: number;

  explanation: string;
  option_details: string[];

  label: string;
  card_id: string;

  parentId?: string;
  variantType?: VariantType;

  previousDifficulty?: Difficulty;
  difficultyMetric?: number;
  difficultyUpdatedAt?: string;

  reviewFlag?: boolean;
  reviewReason?: string;
  basicCandidate?: boolean;
  auditPriority?: AuditPriority;
  auditNote?: string;
}

/** データセットmanifest。科目別・全体どちらにも使う。 */
export interface DatasetManifest {
  dataset: string;
  datasetVersion: string;
  rulesVersion: string;
  questionCount: number;

  subject?: Subject;
  subjectName?: string;

  subjects?: Record<Subject, number>;

  sha256: string;
  releasedAt: string;

  auditStatus: 'complete' | 'partial' | 'none';
  auditCompletedAt?: string;

  lawCutoffDate?: string;
  lawCutoffNote?: string;

  difficultyDistribution?: Record<string, number>;
  starDistribution?: Record<string, number>;
  sourceDistribution?: Record<string, number>;
  subjectDistribution?: Record<string, number>;

  componentDatasets?: {
    dataset: string;
    version: string;
    questionCount: number;
    sha256: string;
  }[];

  validation?: {
    idUnique: boolean;
    fiveOptions: boolean;
    correctInRange: boolean;
    requiredFieldsComplete: boolean;
    parentIdResolved?: boolean;
    difficultySourceManualAll?: boolean;
  };
}

// ------------------------------------------------------------
// Session Layer
// ------------------------------------------------------------

/** 出題セッションの種類。 */
export type SessionType =
  | 'daily-10'
  | 'weak-points'
  | 'saved-questions'
  | 'mock-exam'
  | 'mock-practice'
  | 'card-study';

/** 出題フィルタ。sectionId は使わず sectionKey に統一。 */
export interface SessionFilters {
  subject?: Subject;

  star?: Star;
  starMin?: Star;

  difficulty?: Difficulty;
  difficultyMin?: Difficulty;
  difficultyMax?: Difficulty;

  cardId?: string;
  sectionKey?: string;
  categoryName?: string;

  includeVariants?: boolean;
  parentId?: string;
}

/** 乙4本試験準拠の35問構成。 */
export interface MockBlueprint {
  law: number;
  phys: number;
  prop: number;
  totalMinutes: number;
  passLine: number;
}

/** 標準模試構成。 */
export const STANDARD_MOCK: MockBlueprint = {
  law: 15,
  phys: 10,
  prop: 10,
  totalMinutes: 120,
  passLine: 0.6,
};

/** 途中再開可能なセッション状態。 */
export interface LastSession {
  sessionType: SessionType;
  label: string;

  questionIds: string[];
  currentIndex: number;

  /**
   * questionId -> 元 options 配列の index。
   * シャッフル後の表示順indexではない。
   */
  answers: Record<string, OptionIndex>;

  /** questionId -> 解説表示済み */
  revealed?: Record<string, true>;

  /**
   * questionId -> 表示順に並んだ元 options index。
   * 例: [2, 0, 4, 1, 3]
   */
  optionOrders?: Record<string, OptionIndex[]>;

  startedAt: string;
  finishedAt?: string;

  filters?: SessionFilters;
}

// ------------------------------------------------------------
// Progress / Storage Layer
// ------------------------------------------------------------

/** 問題ごとの学習履歴。Question本体には入れない。 */
export interface QuestionProgress {
  questionId: string;

  lastAnsweredAt?: string;
  lastResult?: 'correct' | 'wrong';

  correctStreak: number;
  wrongStreak: number;

  totalAnswered: number;
  totalCorrect: number;

  stability?: number;
  ease?: number;
  nextReviewAt?: string;
}

/** 科目別統計。 */
export interface SubjectStats {
  subject: Subject;

  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;

  accuracy: number;

  lastSessionAt?: string;
}

/** 全体進捗。 */
export interface OverallProgress {
  totalAttempted: number;
  totalCorrect: number;

  streak: number;
  lastLearnedDate?: string;
  examDate?: string;

  bySubject: Record<Subject, SubjectStats>;
}

/** 保存問題。 */
export interface SavedQuestion {
  questionId: string;
  savedAt: string;
  note?: string;
}

/** 弱点記録。personal_error を主因にする。 */
export interface WeaknessRecord {
  questionId: string;

  errorCount: number;
  lastErrorAt: string;

  weaknessScore: number;
}

// ------------------------------------------------------------
// UI / Analytics Layer
// ------------------------------------------------------------

export type MeterLabel = '優先' | 'もう少し' | '安定';

export interface SubjectMeter {
  subject: Subject;
  label: string;

  percent: number;
  state: MeterLabel;

  toSafe: number;
}

export interface StarLayerProgress {
  star: Star;

  total: number;
  mastered: number;
  learning: number;
  unstudied: number;
}

export interface NextActionSuggestion {
  type: 'star-priority' | 'weak-subject' | 'continue' | 'mock';

  label: string;
  description: string;

  sessionType: SessionType;
  filters?: SessionFilters;
}

// ------------------------------------------------------------
// Storage Keys
// ------------------------------------------------------------

export const STORAGE_KEYS = {
  SESSION_DAILY: 'otu4.session.daily',
  SESSION_MOCK: 'otu4.session.mock',
  SESSION_DRILL: 'otu4.session.drill',

  PROGRESS: 'otu4.progress',
  WEAKNESS: 'otu4.weakness',
  SAVED: 'otu4.saved',
  STATS: 'otu4.stats',
  STREAK: 'otu4.streak',

  EXAM_DATE: 'otu4.examDate',
  SETTINGS: 'otu4.settings',

  questionProgress: (id: string): `otu4.qp.${string}` => `otu4.qp.${id}`,
};

// ------------------------------------------------------------
// Type Guards / Helpers
// ------------------------------------------------------------

export const isMockSession = (sessionType: SessionType): boolean =>
  sessionType === 'mock-exam' || sessionType === 'mock-practice';

export const isPracticeMode = (sessionType: SessionType): boolean =>
  sessionType !== 'mock-exam';

export const isOptionIndex = (value: number): value is OptionIndex =>
  value === 0 || value === 1 || value === 2 || value === 3 || value === 4;

export const isValidSubject = (value: string): value is Subject =>
  value === 'law' || value === 'phys' || value === 'prop';

export const isValidDifficulty = (value: number): value is Difficulty =>
  value === 1 || value === 2 || value === 3;

export const isValidStar = (value: number): value is Star =>
  value === 0 || value === 1 || value === 2 || value === 3;

export const isValidDifficultySource = (
  value: string,
): value is DifficultySource =>
  value === 'manual' || value === 'heuristic' || value === 'empirical';

export const isFiveChoices = (value: string[]): value is FiveChoices =>
  value.length === 5;

export const isValidQuestion = (question: Question): boolean =>
  question.id.length > 0 &&
  isValidSubject(question.subject) &&
  question.sectionKey.length > 0 &&
  isValidStar(question.star) &&
  isValidDifficulty(question.difficulty) &&
  isValidDifficultySource(question.difficultySource) &&
  isFiveChoices(question.options) &&
  isFiveChoices(question.option_details) &&
  isOptionIndex(question.correct);
