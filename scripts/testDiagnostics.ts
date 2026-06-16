import {
  calcDiagnosticGapTo60,
  calcDiagnosticPercent,
  diagnoseNextAction,
  getWeakestDiagnosticSubject,
  type DiagnosticInput,
} from '../lib/diagnostics';

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

function baseInput(): DiagnosticInput {
  return {
    wrongCount: 0,
    examDays: 67,
    summaries: {
      law: { total: 0, correct: 0 },
      phys: { total: 0, correct: 0 },
      prop: { total: 0, correct: 0 },
    },
  };
}

function testDiagnosticMath(): void {
  assertEqual(calcDiagnosticPercent(6, 10), 60, '6/10 should be 60%');
  assertEqual(calcDiagnosticPercent(0, 0), 0, '0/0 should be 0%');
  assertEqual(calcDiagnosticGapTo60(4, 10), 2, '4/10 should need 2 more correct answers');
  assertEqual(calcDiagnosticGapTo60(6, 10), 0, '6/10 should need 0 more correct answers');
}

function testWrongPointsComeFirst(): void {
  const input = baseInput();

  input.wrongCount = 3;
  input.summaries.law = { total: 10, correct: 2 };

  const recommendation = diagnoseNextAction(input);

  assertEqual(recommendation.mode, 'weak-points', 'wrong points should come first');
  assertEqual(recommendation.priority, 'urgent', 'wrong points should be urgent');
  assertEqual(recommendation.count, 3, 'wrong point count should be preserved');
}

function testNoHistoryRecommendsDaily10(): void {
  const recommendation = diagnoseNextAction(baseInput());

  assertEqual(recommendation.mode, 'daily-10', 'no history should recommend daily-10');
  assertEqual(recommendation.subject, null, 'no history should not lock subject');
  assertEqual(recommendation.count, 10, 'daily-10 count should be 10');
}

function testWeakSubjectRecommendsSubjectDaily10(): void {
  const input = baseInput();

  input.summaries.law = { total: 10, correct: 8 };
  input.summaries.phys = { total: 10, correct: 4 };
  input.summaries.prop = { total: 10, correct: 7 };

  const weakest = getWeakestDiagnosticSubject(input.summaries);
  const recommendation = diagnoseNextAction(input);

  assertEqual(weakest, 'phys', 'phys should be weakest subject');
  assertEqual(recommendation.mode, 'daily-10', 'weak subject should recommend daily-10');
  assertEqual(recommendation.subject, 'phys', 'recommendation should target phys');
  assertEqual(recommendation.priority, 'urgent', 'under 60 subject should be urgent');
  assertEqual(recommendation.percent, 40, 'phys percent should be 40');
  assertEqual(recommendation.gapTo60, 2, 'phys gap should be 2');
}

function testStableStatusRecommendsMockExam(): void {
  const input = baseInput();

  input.summaries.law = { total: 10, correct: 8 };
  input.summaries.phys = { total: 10, correct: 7 };
  input.summaries.prop = { total: 10, correct: 9 };

  const recommendation = diagnoseNextAction(input);

  assertEqual(recommendation.mode, 'mock-exam', 'stable status should recommend mock exam');
  assertEqual(recommendation.priority, 'maintenance', 'stable status should be maintenance');
  assertEqual(recommendation.count, 35, 'mock exam count should be 35');
}

function testNearExamRecommendsMockExam(): void {
  const input = baseInput();

  input.examDays = 7;
  input.summaries.law = { total: 10, correct: 8 };
  input.summaries.phys = { total: 10, correct: 7 };
  input.summaries.prop = { total: 10, correct: 9 };

  const recommendation = diagnoseNextAction(input);

  assertEqual(recommendation.mode, 'mock-exam', 'near exam should recommend mock exam');
  assertEqual(recommendation.priority, 'normal', 'near exam should be normal priority');
}

function run(): void {
  console.log('Running diagnostics tests...');

  testDiagnosticMath();
  console.log('PASS diagnostic math');

  testWrongPointsComeFirst();
  console.log('PASS wrong points come first');

  testNoHistoryRecommendsDaily10();
  console.log('PASS no history recommends daily-10');

  testWeakSubjectRecommendsSubjectDaily10();
  console.log('PASS weak subject recommends subject daily-10');

  testStableStatusRecommendsMockExam();
  console.log('PASS stable status recommends mock exam');

  testNearExamRecommendsMockExam();
  console.log('PASS near exam recommends mock exam');

  console.log('All diagnostics tests passed.');
}

run();