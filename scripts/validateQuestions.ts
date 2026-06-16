import questions from '../data/questions_all_700_v1.json';
import {
  isValidDifficulty,
  isValidDifficultySource,
  isValidStar,
  isValidSubject,
  type RawQuestion,
  type Subject,
} from '../lib/types';

type ValidationResult = {
  ok: boolean;
  errors: string[];
  summary: {
    total: number;
    bySubject: Record<Subject, number>;
    byDifficulty: Record<number, number>;
    byStar: Record<number, number>;
    byDifficultySource: Record<string, number>;
  };
};

function hasFiveChoices(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every((item) => typeof item === 'string')
  );
}

function isCorrectIndex(value: unknown): value is 0 | 1 | 2 | 3 | 4 {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4;
}

function validateQuestionShape(question: RawQuestion, index: number): string[] {
  const errors: string[] = [];
  const prefix = `[${index}] ${question?.id ?? '(no id)'}`;

  if (!question.id || typeof question.id !== 'string') {
    errors.push(`${prefix}: id is invalid`);
  }

  if (!isValidSubject(question.subject)) {
    errors.push(`${prefix}: subject is invalid`);
  }

  if (!question.sectionKey || typeof question.sectionKey !== 'string') {
    errors.push(`${prefix}: sectionKey is invalid`);
  }

  if (!isValidStar(question.star)) {
    errors.push(`${prefix}: star is invalid`);
  }

  if (!isValidDifficulty(question.difficulty)) {
    errors.push(`${prefix}: difficulty is invalid`);
  }

  if (!isValidDifficultySource(question.difficultySource)) {
    errors.push(`${prefix}: difficultySource is invalid`);
  }

  if (!question.question || typeof question.question !== 'string') {
    errors.push(`${prefix}: question is invalid`);
  }

  if (!hasFiveChoices(question.options)) {
    errors.push(`${prefix}: options must have exactly 5 strings`);
  }

  if (!isCorrectIndex(question.correct)) {
    errors.push(`${prefix}: correct must be 0-4`);
  }

  if (!question.explanation || typeof question.explanation !== 'string') {
    errors.push(`${prefix}: explanation is invalid`);
  }

  if (!hasFiveChoices(question.option_details)) {
    errors.push(`${prefix}: option_details must have exactly 5 strings`);
  }

  if (!question.label || typeof question.label !== 'string') {
    errors.push(`${prefix}: label is invalid`);
  }

  if (!question.card_id || typeof question.card_id !== 'string') {
    errors.push(`${prefix}: card_id is invalid`);
  }

  return errors;
}

function validateQuestions(rawQuestions: RawQuestion[]): ValidationResult {
  const errors: string[] = [];

  const summary: ValidationResult['summary'] = {
    total: rawQuestions.length,
    bySubject: {
      law: 0,
      phys: 0,
      prop: 0,
    },
    byDifficulty: {
      1: 0,
      2: 0,
      3: 0,
    },
    byStar: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
    },
    byDifficultySource: {},
  };

  if (rawQuestions.length !== 700) {
    errors.push(`Expected 700 questions, got ${rawQuestions.length}`);
  }

  const ids = new Set<string>();

  rawQuestions.forEach((question, index) => {
    errors.push(...validateQuestionShape(question, index));

    if (ids.has(question.id)) {
      errors.push(`${question.id}: duplicated id`);
    }

    ids.add(question.id);

    if (isValidSubject(question.subject)) {
      summary.bySubject[question.subject] += 1;
    }

    if (isValidDifficulty(question.difficulty)) {
      summary.byDifficulty[question.difficulty] += 1;
    }

    if (isValidStar(question.star)) {
      summary.byStar[question.star] += 1;
    }

    summary.byDifficultySource[question.difficultySource] =
      (summary.byDifficultySource[question.difficultySource] ?? 0) + 1;
  });

  rawQuestions.forEach((question) => {
    if (question.parentId && !ids.has(question.parentId)) {
      errors.push(`${question.id}: parentId not found: ${question.parentId}`);
    }
  });

  if (summary.bySubject.law !== 300) {
    errors.push(`Expected law 300, got ${summary.bySubject.law}`);
  }

  if (summary.bySubject.phys !== 200) {
    errors.push(`Expected phys 200, got ${summary.bySubject.phys}`);
  }

  if (summary.bySubject.prop !== 200) {
    errors.push(`Expected prop 200, got ${summary.bySubject.prop}`);
  }

  if (summary.byDifficultySource.manual !== 700) {
    errors.push(
      `Expected difficultySource manual 700, got ${
        summary.byDifficultySource.manual ?? 0
      }`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    summary,
  };
}

const result = validateQuestions(questions as RawQuestion[]);

console.log(JSON.stringify(result.summary, null, 2));

if (!result.ok) {
  console.error('Validation failed.');
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Validation passed.');
