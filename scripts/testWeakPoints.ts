import { getAllQuestions } from '../lib/questions';

import {
  buildLastSession,
} from '../lib/session';

import {
  clearQuestionProgress,
  clearWeaknessRecords,
  loadQuestionProgress,
  loadWeaknessRecords,
  loadWrongQuestionIds,
  markWeaknessRecovered,
  recordQuestionAnswer,
} from '../lib/storage';

type MemoryStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
};

function createMemoryStorage(): MemoryStorage {
  const data = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      data.set(key, value);
    },
    removeItem(key: string): void {
      data.delete(key);
    },
    clear(): void {
      data.clear();
    },
  };
}

function installMemoryLocalStorage(): void {
  const storage = createMemoryStorage();

  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  });
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. expected=${String(expected)} actual=${String(actual)}`);
  }
}

function assertDeepEqual<T>(actual: T, expected: T, message: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}. expected=${expectedJson} actual=${actualJson}`);
  }
}

function getSampleQuestionIds(count: number): string[] {
  const ids = getAllQuestions()
    .slice(0, count)
    .map((question) => question.id);

  assertEqual(ids.length, count, `should get ${count} sample question ids`);

  return ids;
}

function testWrongAnswerEntersWeakPoints(): void {
  const [questionId] = getSampleQuestionIds(1);

  clearWeaknessRecords();
  clearQuestionProgress(questionId);

  recordQuestionAnswer(questionId, false, '2026-06-10T01:00:00.000Z');

  const wrongIds = loadWrongQuestionIds();
  const weakness = loadWeaknessRecords()[questionId];
  const progress = loadQuestionProgress(questionId);

  assert(wrongIds.includes(questionId), 'wrong answer should enter weak-points queue');
  assert(weakness !== undefined, 'wrong answer should create weakness record');
  assertEqual(weakness.errorCount, 1, 'weakness errorCount should be 1');
  assertEqual(progress.totalAnswered, 1, 'progress totalAnswered should be 1');
  assertEqual(progress.totalCorrect, 0, 'progress totalCorrect should be 0');
  assertEqual(progress.lastResult, 'wrong', 'progress lastResult should be wrong');
}

function testBuildWeakPointsSessionFromIds(): void {
  const ids = getSampleQuestionIds(3);

  const session = buildLastSession({
    sessionType: 'weak-points',
    label: 'weak-points test',
    count: 2,
    questionIds: ids,
    now: '2026-06-10T02:00:00.000Z',
  });

  assertEqual(session.sessionType, 'weak-points', 'sessionType should be weak-points');
  assertEqual(session.label, 'weak-points test', 'label should be preserved');
  assertDeepEqual(session.questionIds, ids.slice(0, 2), 'session should use requested ids in order');
  assertEqual(session.currentIndex, 0, 'currentIndex should start at 0');
  assertEqual(Object.keys(session.answers).length, 0, 'answers should start empty');
  assertEqual(Object.keys(session.revealed ?? {}).length, 0, 'revealed should start empty');
  assertEqual(Object.keys(session.optionOrders ?? {}).length, 2, 'optionOrders should be created for selected ids');
}

function testRecoveredWeakPointLeavesQueue(): void {
  const [questionId] = getSampleQuestionIds(1);

  clearWeaknessRecords();
  clearQuestionProgress(questionId);

  recordQuestionAnswer(questionId, false, '2026-06-10T03:00:00.000Z');

  assert(loadWrongQuestionIds().includes(questionId), 'question should be in weak-points before recovery');

  recordQuestionAnswer(questionId, true, '2026-06-10T03:10:00.000Z');
  markWeaknessRecovered(questionId);

  const wrongIds = loadWrongQuestionIds();
  const weakness = loadWeaknessRecords()[questionId];
  const progress = loadQuestionProgress(questionId);

  assert(!wrongIds.includes(questionId), 'recovered question should leave weak-points queue');
  assertEqual(weakness, undefined, 'recovered weakness record should be removed');
  assertEqual(progress.totalAnswered, 2, 'progress totalAnswered should be 2');
  assertEqual(progress.totalCorrect, 1, 'progress totalCorrect should be 1');
  assertEqual(progress.lastResult, 'correct', 'progress lastResult should be correct');
}

function run(): void {
  console.log('Running weak-points tests...');

  installMemoryLocalStorage();

  testWrongAnswerEntersWeakPoints();
  console.log('PASS wrong answer enters weak-points');

  testBuildWeakPointsSessionFromIds();
  console.log('PASS build weak-points session from ids');

  testRecoveredWeakPointLeavesQueue();
  console.log('PASS recovered weak-point leaves queue');

  console.log('All weak-points tests passed.');
}

run();