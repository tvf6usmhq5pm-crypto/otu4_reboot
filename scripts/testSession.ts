import {
  answerQuestion,
  buildLastSession,
  summarizeMockPass,
  summarizeSession,
  summarizeSessionBySubject,
  toDisplayedOptionIndex,
  toOriginalOptionIndex,
} from '../lib/session';
import { requireQuestionById } from '../lib/questions';
import type { LastSession, OptionIndex, Subject } from '../lib/types';

const OPTION_INDICES: OptionIndex[] = [0, 1, 2, 3, 4];
const FIXED_NOW = '2026-06-09T00:00:00.000Z';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${message}. Expected ${String(expected)}, got ${String(actual)}`,
    );
  }
}

function assertAlmostEqual(
  actual: number,
  expected: number,
  message: string,
  epsilon = 1e-10,
): void {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(
      `Assertion failed: ${message}. Expected ${expected}, got ${actual}`,
    );
  }
}

function assertUnique(values: string[], message: string): void {
  assertEqual(new Set(values).size, values.length, message);
}

function isOptionIndexPermutation(order: OptionIndex[] | undefined): boolean {
  if (!order || order.length !== 5) {
    return false;
  }

  return OPTION_INDICES.every((index) => order.includes(index));
}

function assertValidOptionOrders(session: LastSession): void {
  assert(session.optionOrders, 'optionOrders should exist');

  session.questionIds.forEach((questionId) => {
    const order = session.optionOrders?.[questionId];
    assert(
      isOptionIndexPermutation(order),
      `${questionId}: optionOrders must be a 5-item permutation of 0..4`,
    );
  });
}

function countBySubject(questionIds: string[]): Record<Subject, number> {
  return questionIds.reduce<Record<Subject, number>>(
    (accumulator, questionId) => {
      const question = requireQuestionById(questionId);
      accumulator[question.subject] += 1;
      return accumulator;
    },
    { law: 0, phys: 0, prop: 0 },
  );
}

function buildIdentityOrders(questionIds: string[]): Record<string, OptionIndex[]> {
  return Object.fromEntries(
    questionIds.map((questionId) => [questionId, [...OPTION_INDICES]]),
  );
}

function answerWithOriginalIndex(
  session: LastSession,
  questionId: string,
  originalIndex: OptionIndex,
): LastSession {
  const displayedIndex = toDisplayedOptionIndex(session, questionId, originalIndex);
  return answerQuestion(session, questionId, displayedIndex);
}

function getWrongOptionIndex(correct: OptionIndex): OptionIndex {
  const wrong = OPTION_INDICES.find((index) => index !== correct);
  assert(wrong !== undefined, 'wrong option index should exist');
  return wrong;
}

function testDaily10(): void {
  const session = buildLastSession({
    sessionType: 'daily-10',
    now: FIXED_NOW,
  });

  assertEqual(session.sessionType, 'daily-10', 'daily session type');
  assertEqual(session.label, '今日の10問', 'daily default label');
  assertEqual(session.questionIds.length, 10, 'daily-10 should contain 10 questions');
  assertUnique(session.questionIds, 'daily-10 questionIds should be unique');
  assertValidOptionOrders(session);

  console.log('PASS daily-10 session generation');
}

function testMockExamShape(): LastSession {
  const session = buildLastSession({
    sessionType: 'mock-exam',
    now: FIXED_NOW,
  });

  assertEqual(session.sessionType, 'mock-exam', 'mock session type');
  assertEqual(session.label, '35問 本番モード', 'mock default label');
  assertEqual(session.questionIds.length, 35, 'mock-exam should contain 35 questions');
  assertUnique(session.questionIds, 'mock-exam questionIds should be unique');
  assertValidOptionOrders(session);

  const bySubject = countBySubject(session.questionIds);
  assertEqual(bySubject.law, 15, 'mock-exam should contain 15 law questions');
  assertEqual(bySubject.phys, 10, 'mock-exam should contain 10 phys questions');
  assertEqual(bySubject.prop, 10, 'mock-exam should contain 10 prop questions');

  console.log('PASS mock-exam shape and subject split');

  return session;
}

function testOptionIndexConversion(baseSession: LastSession): void {
  const [questionId] = baseSession.questionIds;
  assert(questionId, 'mock session should have a first question');

  const session: LastSession = {
    ...baseSession,
    optionOrders: {
      ...baseSession.optionOrders,
      [questionId]: [2, 0, 4, 1, 3],
    },
  };

  assertEqual(
    toOriginalOptionIndex(session, questionId, 0),
    2,
    'displayed index 0 should map to original index 2',
  );
  assertEqual(
    toOriginalOptionIndex(session, questionId, 1),
    0,
    'displayed index 1 should map to original index 0',
  );
  assertEqual(
    toDisplayedOptionIndex(session, questionId, 4),
    2,
    'original index 4 should map to displayed index 2',
  );

  const answered = answerQuestion(session, questionId, 0);
  assertEqual(
    answered.answers[questionId],
    2,
    'answerQuestion should save original option index, not displayed index',
  );

  console.log('PASS option index conversion and answer storage');
}

function testSummariesWithAllCorrect(baseSession: LastSession): void {
  let session: LastSession = {
    ...baseSession,
    answers: {},
    optionOrders: buildIdentityOrders(baseSession.questionIds),
  };

  session.questionIds.forEach((questionId) => {
    const question = requireQuestionById(questionId);
    session = answerWithOriginalIndex(session, questionId, question.correct);
  });

  const summary = summarizeSession(session);
  assertEqual(summary.total, 35, 'all-correct summary total');
  assertEqual(summary.answered, 35, 'all-correct summary answered');
  assertEqual(summary.correct, 35, 'all-correct summary correct');
  assertEqual(summary.wrong, 0, 'all-correct summary wrong');
  assertAlmostEqual(summary.accuracy, 1, 'all-correct summary accuracy');

  const bySubject = summarizeSessionBySubject(session);
  assertEqual(bySubject.law.total, 15, 'all-correct law total');
  assertEqual(bySubject.law.answered, 15, 'all-correct law answered');
  assertEqual(bySubject.law.correct, 15, 'all-correct law correct');
  assertEqual(bySubject.phys.total, 10, 'all-correct phys total');
  assertEqual(bySubject.phys.answered, 10, 'all-correct phys answered');
  assertEqual(bySubject.phys.correct, 10, 'all-correct phys correct');
  assertEqual(bySubject.prop.total, 10, 'all-correct prop total');
  assertEqual(bySubject.prop.answered, 10, 'all-correct prop answered');
  assertEqual(bySubject.prop.correct, 10, 'all-correct prop correct');

  const pass = summarizeMockPass(session);
  assertEqual(pass.law, true, 'all-correct law should pass');
  assertEqual(pass.phys, true, 'all-correct phys should pass');
  assertEqual(pass.prop, true, 'all-correct prop should pass');
  assertEqual(pass.passed, true, 'all-correct mock should pass');

  console.log('PASS summarizeSession and summarizeMockPass with all correct');
}

function testMockPassFailure(baseSession: LastSession): void {
  let session: LastSession = {
    ...baseSession,
    answers: {},
    optionOrders: buildIdentityOrders(baseSession.questionIds),
  };

  session.questionIds.forEach((questionId) => {
    const question = requireQuestionById(questionId);

    const selectedOriginalIndex =
      question.subject === 'phys'
        ? getWrongOptionIndex(question.correct)
        : question.correct;

    session = answerWithOriginalIndex(session, questionId, selectedOriginalIndex);
  });

  const bySubject = summarizeSessionBySubject(session);
  assertEqual(bySubject.phys.correct, 0, 'phys should be forced to 0 correct');

  const pass = summarizeMockPass(session);
  assertEqual(pass.law, true, 'law should pass when answered correctly');
  assertEqual(pass.phys, false, 'phys should fail when all phys answers are wrong');
  assertEqual(pass.prop, true, 'prop should pass when answered correctly');
  assertEqual(pass.passed, false, 'mock should fail if any subject is below 60%');

  console.log('PASS summarizeMockPass failure case');
}

function run(): void {
  console.log('Running session tests...');

  testDaily10();
  const mockSession = testMockExamShape();
  testOptionIndexConversion(mockSession);
  testSummariesWithAllCorrect(mockSession);
  testMockPassFailure(mockSession);

  console.log('All session tests passed.');
}

run();
