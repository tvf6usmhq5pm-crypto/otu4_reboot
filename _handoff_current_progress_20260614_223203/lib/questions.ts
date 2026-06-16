import rawQuestions from '../data/questions_all_700_v1.json';
import {
  isOptionIndex,
  isValidDifficulty,
  isValidDifficultySource,
  isValidQuestion,
  isValidStar,
  isValidSubject,
  type Difficulty,
  type FiveChoices,
  type Question,
  type RawQuestion,
  type SessionFilters,
  type Star,
  type Subject,
} from './types';

function toFiveChoices(value: string[], fieldName: string, id: string): FiveChoices {
  if (value.length !== 5) {
    throw new Error(`${id}: ${fieldName} must have exactly 5 items`);
  }

  return [value[0], value[1], value[2], value[3], value[4]];
}

function normalizeQuestion(raw: RawQuestion): Question {
  if (!isValidSubject(raw.subject)) {
    throw new Error(`${raw.id}: invalid subject`);
  }

  if (!isValidStar(raw.star)) {
    throw new Error(`${raw.id}: invalid star`);
  }

  if (!isValidDifficulty(raw.difficulty)) {
    throw new Error(`${raw.id}: invalid difficulty`);
  }

  if (!isValidDifficultySource(raw.difficultySource)) {
    throw new Error(`${raw.id}: invalid difficultySource`);
  }

  if (!isOptionIndex(raw.correct)) {
    throw new Error(`${raw.id}: invalid correct index`);
  }

  const question: Question = {
    ...raw,
    options: toFiveChoices(raw.options, 'options', raw.id),
    option_details: toFiveChoices(raw.option_details, 'option_details', raw.id),
    correct: raw.correct,
  };

  if (!isValidQuestion(question)) {
    throw new Error(`${raw.id}: invalid question`);
  }

  return question;
}

const QUESTIONS: Question[] = (rawQuestions as RawQuestion[]).map(normalizeQuestion);

const QUESTION_BY_ID = new Map<string, Question>(
  QUESTIONS.map((question) => [question.id, question]),
);

export function getAllQuestions(): Question[] {
  return QUESTIONS;
}

export function getQuestionCount(): number {
  return QUESTIONS.length;
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id);
}

export function requireQuestionById(id: string): Question {
  const question = getQuestionById(id);

  if (!question) {
    throw new Error(`Question not found: ${id}`);
  }

  return question;
}

export function getQuestionsBySubject(subject: Subject): Question[] {
  return QUESTIONS.filter((question) => question.subject === subject);
}

export function getQuestionsByStar(star: Star): Question[] {
  return QUESTIONS.filter((question) => question.star === star);
}

export function getQuestionsByStarMin(starMin: Star): Question[] {
  return QUESTIONS.filter((question) => question.star >= starMin);
}

export function getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
  return QUESTIONS.filter((question) => question.difficulty === difficulty);
}

export function getQuestionsByDifficultyRange(
  min: Difficulty,
  max: Difficulty,
): Question[] {
  return QUESTIONS.filter(
    (question) => question.difficulty >= min && question.difficulty <= max,
  );
}

export function getQuestionsByCardId(cardId: string): Question[] {
  return QUESTIONS.filter((question) => question.card_id === cardId);
}

export function getQuestionsBySectionKey(sectionKey: string): Question[] {
  return QUESTIONS.filter((question) => question.sectionKey === sectionKey);
}

export function getVariantsOf(parentId: string): Question[] {
  return QUESTIONS.filter((question) => question.parentId === parentId);
}

export function getOriginalQuestions(): Question[] {
  return QUESTIONS.filter((question) => !question.parentId);
}

export function getVariantQuestions(): Question[] {
  return QUESTIONS.filter((question) => Boolean(question.parentId));
}

export function filterQuestions(filters: SessionFilters): Question[] {
  return QUESTIONS.filter((question) => {
    if (filters.subject && question.subject !== filters.subject) {
      return false;
    }

    if (filters.star !== undefined && question.star !== filters.star) {
      return false;
    }

    if (filters.starMin !== undefined && question.star < filters.starMin) {
      return false;
    }

    if (
      filters.difficulty !== undefined &&
      question.difficulty !== filters.difficulty
    ) {
      return false;
    }

    if (
      filters.difficultyMin !== undefined &&
      question.difficulty < filters.difficultyMin
    ) {
      return false;
    }

    if (
      filters.difficultyMax !== undefined &&
      question.difficulty > filters.difficultyMax
    ) {
      return false;
    }

    if (filters.cardId && question.card_id !== filters.cardId) {
      return false;
    }

    if (filters.sectionKey && question.sectionKey !== filters.sectionKey) {
      return false;
    }

    if (filters.categoryName && question.category !== filters.categoryName) {
      return false;
    }

    if (filters.parentId && question.parentId !== filters.parentId) {
      return false;
    }

    if (filters.includeVariants === false && question.parentId) {
      return false;
    }

    return true;
  });
}

export function getQuestionSummary() {
  return {
    total: QUESTIONS.length,
    law: getQuestionsBySubject('law').length,
    phys: getQuestionsBySubject('phys').length,
    prop: getQuestionsBySubject('prop').length,
    star3: getQuestionsByStar(3).length,
    star2OrMore: getQuestionsByStarMin(2).length,
    variants: getVariantQuestions().length,
  };
}
