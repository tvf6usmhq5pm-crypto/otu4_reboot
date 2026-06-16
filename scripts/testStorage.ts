import {
  addSavedQuestion,
  addWrongQuestionId,
  clearExamDate,
  clearLastSession,
  clearQuestionProgress,
  clearResults,
  clearWeaknessRecords,
  clearWrongQuestionIds,
  isQuestionSaved,
  loadExamDate,
  loadLastSession,
  loadQuestionProgress,
  loadResults,
  loadSavedQuestions,
  loadWeaknessRecords,
  loadWrongQuestionIds,
  markWeaknessRecovered,
  readJson,
  readStorageValue,
  recordQuestionAnswer,
  removeSavedQuestion,
  removeStorageValue,
  saveExamDate,
  saveLastSession,
  saveResult,
  writeStorageValue,
} from '../lib/storage';

type LocalStorageMock = {
  store: Record<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
};

const localStorageMock: LocalStorageMock = {
  store: {},

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]
      : null;
  },

  setItem(key: string, value: string): void {
    this.store[key] = value;
  },

  removeItem(key: string): void {
    delete this.store[key];
  },

  clear(): void {
    this.store = {};
  },
};

(globalThis as unknown as { localStorage: LocalStorageMock }).localStorage =
  localStorageMock;

function resetStorage(): void {
  localStorageMock.clear();
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. expected=${String(expected)} actual=${String(actual)}`);
  }
}

function assertIncludes(values: string[], expected: string, message: string): void {
  if (!values.includes(expected)) {
    throw new Error(`${message}. expected to include=${expected} actual=${values.join(',')}`);
  }
}

function buildTestSession(sessionType: 'daily-10' | 'mock-exam' | 'card-study') {
  return {
    sessionType,
    label: `${sessionType} label`,
    questionIds: ['LAW-001-001', 'PHY-001-001'],
    currentIndex: 0,
    answers: {},
    revealed: {},
    optionOrders: {
      'LAW-001-001': [2, 0, 4, 1, 3],
      'PHY-001-001': [0, 1, 2, 3, 4],
    },
    startedAt: '2026-06-09T00:00:00.000Z',
  } as any;
}

function testLastSessionStorage(): void {
  resetStorage();

  const dailySession = buildTestSession('daily-10');
  saveLastSession(dailySession);

  assertEqual(
    loadLastSession('daily-10')?.label,
    'daily-10 label',
    'daily session should be loaded by type',
  );

  assertEqual(
    loadLastSession()?.label,
    'daily-10 label',
    'last session should be loaded without type',
  );

  const mockSession = buildTestSession('mock-exam');
  saveLastSession(mockSession);

  assertEqual(
    loadLastSession('mock-exam')?.label,
    'mock-exam label',
    'mock session should be loaded by type',
  );

  clearLastSession('daily-10');

  assertEqual(
    loadLastSession('daily-10'),
    undefined,
    'daily session should be cleared by type',
  );

  assertEqual(
    loadLastSession('mock-exam')?.label,
    'mock-exam label',
    'mock session should remain after clearing daily',
  );

  clearLastSession();

  assertEqual(
    loadLastSession('mock-exam'),
    undefined,
    'all sessions should be cleared',
  );

  console.log('PASS last session storage');
}

function testQuestionProgressStorage(): void {
  resetStorage();

  const questionId = 'LAW-001-001';

  const initial = loadQuestionProgress(questionId);
  assertEqual(initial.questionId, questionId, 'initial progress should keep question id');
  assertEqual(initial.totalAnswered, 0, 'initial total answered should be zero');
  assertEqual(initial.totalCorrect, 0, 'initial total correct should be zero');

  recordQuestionAnswer(questionId, false, '2026-06-09T01:00:00.000Z');

  const afterWrong = loadQuestionProgress(questionId);
  assertEqual(afterWrong.totalAnswered, 1, 'wrong answer should increment total answered');
  assertEqual(afterWrong.totalCorrect, 0, 'wrong answer should not increment total correct');
  assertEqual(afterWrong.wrongStreak, 1, 'wrong answer should increment wrong streak');
  assertIncludes(loadWrongQuestionIds(), questionId, 'wrong answer should add wrong question id');

  recordQuestionAnswer(questionId, true, '2026-06-09T01:10:00.000Z');

  const afterCorrect = loadQuestionProgress(questionId);
  assertEqual(afterCorrect.totalAnswered, 2, 'correct answer should increment total answered');
  assertEqual(afterCorrect.totalCorrect, 1, 'correct answer should increment total correct');
  assertEqual(afterCorrect.correctStreak, 1, 'correct answer should increment correct streak');
  assertEqual(afterCorrect.wrongStreak, 0, 'correct answer should reset wrong streak');

  clearQuestionProgress(questionId);

  const afterClear = loadQuestionProgress(questionId);
  assertEqual(afterClear.totalAnswered, 0, 'cleared progress should reset total answered');

  console.log('PASS question progress storage');
}

function testSavedQuestionStorage(): void {
  resetStorage();

  const questionId = 'LAW-002-001';

  assertEqual(isQuestionSaved(questionId), false, 'question should not be saved initially');

  addSavedQuestion(questionId, '2026-06-09T02:00:00.000Z', 'first note');

  assertEqual(isQuestionSaved(questionId), true, 'question should be saved');
  assertEqual(loadSavedQuestions().length, 1, 'saved question count should be one');
  assertEqual(loadSavedQuestions()[0]?.note, 'first note', 'saved note should be stored');

  addSavedQuestion(questionId, '2026-06-09T02:10:00.000Z', 'updated note');

  assertEqual(loadSavedQuestions().length, 1, 'duplicate save should update existing item');
  assertEqual(loadSavedQuestions()[0]?.note, 'updated note', 'saved note should be updated');

  removeSavedQuestion(questionId);

  assertEqual(isQuestionSaved(questionId), false, 'question should be removed from saved list');
  assertEqual(loadSavedQuestions().length, 0, 'saved question list should be empty');

  console.log('PASS saved question storage');
}

function testWeaknessStorage(): void {
  resetStorage();
  clearWeaknessRecords();
  clearWrongQuestionIds();

  const questionId = 'PHY-001-001';

  addWrongQuestionId(questionId, '2026-06-09T03:00:00.000Z');

  assertIncludes(loadWrongQuestionIds(), questionId, 'wrong question id should be stored');

  const firstRecord = loadWeaknessRecords()[questionId];
  assert(Boolean(firstRecord), 'weakness record should exist');
  assertEqual(firstRecord?.errorCount, 1, 'weakness error count should be one');

  addWrongQuestionId(questionId, '2026-06-09T03:10:00.000Z');

  const secondRecord = loadWeaknessRecords()[questionId];
  assertEqual(secondRecord?.errorCount, 2, 'weakness error count should increment');

  markWeaknessRecovered(questionId);

  assertEqual(
    loadWrongQuestionIds().includes(questionId),
    false,
    'recovered weakness should be removed from wrong ids',
  );

  assertEqual(
    loadWeaknessRecords()[questionId],
    undefined,
    'recovered weakness should be removed from records',
  );

  console.log('PASS weakness storage');
}

function testResultStorage(): void {
  resetStorage();
  clearResults();

  assertEqual(loadResults().length, 0, 'results should be empty initially');

  saveResult({
    id: 'result-1',
    questionIds: ['LAW-001-001', 'PHY-001-001'],
    correctCount: 1,
    totalCount: 2,
    label: 'Result 1',
  });

  assertEqual(loadResults().length, 1, 'one result should be stored');
  assertEqual(loadResults()[0]?.id, 'result-1', 'stored result id should match');

  saveResult({
    id: 'result-1',
    questionIds: ['PROP-001-001'],
    correctCount: 0,
    totalCount: 1,
    label: 'Result 1 updated',
  });

  assertEqual(loadResults().length, 1, 'same result id should replace existing result');
  assertEqual(
    loadResults()[0]?.questionIds[0],
    'PROP-001-001',
    'updated result should replace question ids',
  );

  const next = saveResult({
    questionIds: ['LAW-002-001'],
    correctCount: 1,
    totalCount: 1,
    label: 'Generated id result',
  });

  assertEqual(next.length, 2, 'generated id result should be added');
  assert(typeof next[0]?.id === 'string', 'generated result should have an id');

  console.log('PASS result storage compatibility');
}

function testExamDateStorage(): void {
  resetStorage();

  assertEqual(loadExamDate(), null, 'exam date should be empty initially');

  saveExamDate('2026-07-01');

  assertEqual(loadExamDate(), '2026-07-01', 'exam date should be stored');

  clearExamDate();

  assertEqual(loadExamDate(), null, 'exam date should be cleared');

  console.log('PASS exam date storage');
}

function testBrokenJsonRecovery(): void {
  resetStorage();

  writeStorageValue('broken-json', '{');

  assertEqual(readJson<unknown>('broken-json'), undefined, 'broken json should return undefined');
  assertEqual(readStorageValue('broken-json'), undefined, 'broken json key should be removed');

  removeStorageValue('missing-key');

  console.log('PASS broken JSON recovery');
}

function run(): void {
  console.log('Running storage tests...');

  testLastSessionStorage();
  testQuestionProgressStorage();
  testSavedQuestionStorage();
  testWeaknessStorage();
  testResultStorage();
  testExamDateStorage();
  testBrokenJsonRecovery();

  console.log('All storage tests passed.');
}

run();