import {
  STORAGE_KEYS,
  type LastSession,
  type OverallProgress,
  type QuestionProgress,
  type SavedQuestion,
  type SessionType,
  type WeaknessRecord,
} from './types';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function getBrowserStorage(): StorageLike | undefined {
  const maybeGlobal = globalThis as typeof globalThis & {
    localStorage?: StorageLike;
  };

  return maybeGlobal.localStorage;
}

export function isStorageAvailable(): boolean {
  return getBrowserStorage() !== undefined;
}

export function readStorageValue(key: string): string | undefined {
  const storage = getBrowserStorage();

  if (!storage) {
    return undefined;
  }

  const value = storage.getItem(key);
  return value === null ? undefined : value;
}

export function writeStorageValue(key: string, value: string): void {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  storage.setItem(key, value);
}

export function removeStorageValue(key: string): void {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(key);
}

export function readJson<T>(key: string): T | undefined {
  const raw = readStorageValue(key);

  if (raw === undefined) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    removeStorageValue(key);
    return undefined;
  }
}

export function writeJson<T>(key: string, value: T): void {
  writeStorageValue(key, JSON.stringify(value));
}

export function getSessionStorageKey(sessionType: SessionType): string {
  switch (sessionType) {
    case 'daily-10':
      return STORAGE_KEYS.SESSION_DAILY;

    case 'mock-exam':
    case 'mock-practice':
      return STORAGE_KEYS.SESSION_MOCK;

    case 'card-study':
    case 'saved-questions':
    case 'weak-points':
      return STORAGE_KEYS.SESSION_DRILL;
  }
}

export function saveLastSession(session: LastSession): void {
  writeJson(getSessionStorageKey(session.sessionType), session);
}

export function loadLastSession(
  sessionType: SessionType,
): LastSession | undefined {
  return readJson<LastSession>(getSessionStorageKey(sessionType));
}

export function clearLastSession(sessionType: SessionType): void {
  removeStorageValue(getSessionStorageKey(sessionType));
}

export function buildInitialQuestionProgress(
  questionId: string,
): QuestionProgress {
  return {
    questionId,
    correctStreak: 0,
    wrongStreak: 0,
    totalAnswered: 0,
    totalCorrect: 0,
  };
}

export function loadQuestionProgress(questionId: string): QuestionProgress {
  const saved = readJson<QuestionProgress>(STORAGE_KEYS.questionProgress(questionId));

  if (!saved) {
    return buildInitialQuestionProgress(questionId);
  }

  return {
    ...buildInitialQuestionProgress(questionId),
    ...saved,
    questionId,
  };
}

export function saveQuestionProgress(progress: QuestionProgress): void {
  writeJson(STORAGE_KEYS.questionProgress(progress.questionId), progress);
}

export function clearQuestionProgress(questionId: string): void {
  removeStorageValue(STORAGE_KEYS.questionProgress(questionId));
}

export function nextQuestionProgressAfterAnswer(
  current: QuestionProgress,
  isCorrect: boolean,
  answeredAt: string,
): QuestionProgress {
  const totalAnswered = current.totalAnswered + 1;
  const totalCorrect = current.totalCorrect + (isCorrect ? 1 : 0);

  return {
    ...current,
    lastAnsweredAt: answeredAt,
    lastResult: isCorrect ? 'correct' : 'wrong',
    correctStreak: isCorrect ? current.correctStreak + 1 : 0,
    wrongStreak: isCorrect ? 0 : current.wrongStreak + 1,
    totalAnswered,
    totalCorrect,
    nextReviewAt: isCorrect ? current.nextReviewAt : answeredAt,
  };
}

export function recordQuestionAnswer(
  questionId: string,
  isCorrect: boolean,
  answeredAt = new Date().toISOString(),
): QuestionProgress {
  const current = loadQuestionProgress(questionId);
  const next = nextQuestionProgressAfterAnswer(current, isCorrect, answeredAt);
  saveQuestionProgress(next);
  return next;
}

export function loadSavedQuestions(): SavedQuestion[] {
  return readJson<SavedQuestion[]>(STORAGE_KEYS.SAVED) ?? [];
}

export function saveSavedQuestions(savedQuestions: SavedQuestion[]): void {
  writeJson(STORAGE_KEYS.SAVED, savedQuestions);
}

export function isQuestionSaved(questionId: string): boolean {
  return loadSavedQuestions().some((saved) => saved.questionId === questionId);
}

export function addSavedQuestion(
  questionId: string,
  savedAt = new Date().toISOString(),
  note?: string,
): SavedQuestion[] {
  const current = loadSavedQuestions();
  const existingIndex = current.findIndex((saved) => saved.questionId === questionId);
  const nextItem: SavedQuestion = note
    ? { questionId, savedAt, note }
    : { questionId, savedAt };

  if (existingIndex >= 0) {
    const next = [...current];
    next[existingIndex] = {
      ...next[existingIndex],
      ...nextItem,
    };
    saveSavedQuestions(next);
    return next;
  }

  const next = [...current, nextItem];
  saveSavedQuestions(next);
  return next;
}

export function removeSavedQuestion(questionId: string): SavedQuestion[] {
  const next = loadSavedQuestions().filter(
    (saved) => saved.questionId !== questionId,
  );
  saveSavedQuestions(next);
  return next;
}

export function loadWeaknessRecords(): Record<string, WeaknessRecord> {
  return readJson<Record<string, WeaknessRecord>>(STORAGE_KEYS.WEAKNESS) ?? {};
}

export function saveWeaknessRecords(
  records: Record<string, WeaknessRecord>,
): void {
  writeJson(STORAGE_KEYS.WEAKNESS, records);
}

export function addWeaknessFromWrongAnswer(
  questionId: string,
  wrongAt = new Date().toISOString(),
): WeaknessRecord {
  const records = loadWeaknessRecords();
  const current = records[questionId];
  const errorCount = (current?.errorCount ?? 0) + 1;

  const next: WeaknessRecord = {
    questionId,
    errorCount,
    lastErrorAt: wrongAt,
    weaknessScore: errorCount,
  };

  saveWeaknessRecords({
    ...records,
    [questionId]: next,
  });

  return next;
}

export function markWeaknessRecovered(questionId: string): void {
  const records = loadWeaknessRecords();

  if (!records[questionId]) {
    return;
  }

  const next = { ...records };
  delete next[questionId];
  saveWeaknessRecords(next);
}

export function clearWeaknessRecords(): void {
  removeStorageValue(STORAGE_KEYS.WEAKNESS);
}

export function loadOverallProgress(): OverallProgress | undefined {
  return readJson<OverallProgress>(STORAGE_KEYS.PROGRESS);
}

export function saveOverallProgress(progress: OverallProgress): void {
  writeJson(STORAGE_KEYS.PROGRESS, progress);
}

export function clearOverallProgress(): void {
  removeStorageValue(STORAGE_KEYS.PROGRESS);
}

export function loadExamDate(): string | undefined {
  return readStorageValue(STORAGE_KEYS.EXAM_DATE);
}

export function saveExamDate(examDate: string): void {
  writeStorageValue(STORAGE_KEYS.EXAM_DATE, examDate);
}

export function clearExamDate(): void {
  removeStorageValue(STORAGE_KEYS.EXAM_DATE);
}
