import assert from 'node:assert/strict';

import {
  buildLastSession,
  buildOptionOrder,
  toDisplayedOptionIndex,
  toOriginalOptionIndex,
} from '../lib/session';

import type { OptionIndex } from '../lib/types';

const FIXED_ORDER: OptionIndex[] = [0, 1, 2, 3, 4];

function assertFixedOrder(order: OptionIndex[] | undefined, context: string) {
  assert.deepEqual(order, FIXED_ORDER, `${context}: option order must stay fixed`);
}

console.log('Running no-option-shuffle tests...');

const singleOrder = buildOptionOrder();
assertFixedOrder(singleOrder, 'buildOptionOrder');
console.log('PASS buildOptionOrder returns fixed order');

const session = buildLastSession({
  sessionType: 'daily-10',
  label: 'No option shuffle regression',
  count: 10,
  now: '2026-06-10T00:00:00.000Z',
});

session.questionIds.forEach((questionId) => {
  assertFixedOrder(session.optionOrders?.[questionId], `question ${questionId}`);

  FIXED_ORDER.forEach((originalIndex) => {
    const displayedIndex = toDisplayedOptionIndex(session, questionId, originalIndex);

    assert.equal(
      displayedIndex,
      originalIndex,
      `question ${questionId}: original index ${originalIndex} must equal displayed index`,
    );

    assert.equal(
      toOriginalOptionIndex(session, questionId, displayedIndex),
      originalIndex,
      `question ${questionId}: displayed index ${displayedIndex} must map back to same original index`,
    );
  });
});

console.log('PASS buildLastSession keeps every option order fixed');
console.log('PASS display index and original index are identical');
console.log('All no-option-shuffle tests passed.');