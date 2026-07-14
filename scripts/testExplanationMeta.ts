import {
  explicitExplanationMetaMap,
  generatedDefaultExplanationMetaMap,
  getExplanationMeta,
} from '../data/explanation_meta_index';
import { getAllQuestions } from '../lib/questions';

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(
      `Assertion failed: ${message}`,
    );
  }
}

const questions = getAllQuestions();
const explicitIds = Object.keys(
  explicitExplanationMetaMap,
);

assert(
  questions.length === 701,
  `expected 701 questions, got ${questions.length}`,
);

assert(
  Object.keys(
    generatedDefaultExplanationMetaMap,
  ).length === questions.length,
  'generated default meta count must equal question count',
);

for (const question of questions) {
  const generated =
    generatedDefaultExplanationMetaMap[
      question.id
    ];

  const finalMeta =
    getExplanationMeta(
      question.id,
    );

  assert(
    generated !== undefined,
    `${question.id}: generated default meta missing`,
  );

  assert(
    finalMeta !== null,
    `${question.id}: final meta missing`,
  );

  assert(
    finalMeta.questionId ===
      question.id,
    `${question.id}: questionId mismatch`,
  );

  assert(
    finalMeta.shortExplanation
      .trim()
      .length > 0,
    `${question.id}: shortExplanation is empty`,
  );

  /*
   * JSONから生成する標準metaは、正解選択肢の原文を含むことを保証する。
   *
   * 個別metaは、正解文を短く言い換えたり、補足を追加したりできるため、
   * JSONの選択肢全文との完全一致は要求しない。
   */
  assert(
    generated.correctAnswerLine
      ?.includes(
        question.options[
          question.correct
        ],
      ),
    `${question.id}: generated correct answer text mismatch`,
  );

  assert(
    finalMeta.correctAnswerLine
      ?.trim()
      .length,
    `${question.id}: final correct answer line is empty`,
  );

  for (
    const optionIndex of [
      0,
      1,
      2,
      3,
      4,
    ] as const
  ) {
    assert(
      finalMeta.optionMemos?.[
        optionIndex
      ]?.trim().length,
      `${question.id}: option memo ${optionIndex} missing`,
    );
  }
}

for (
  const [
    questionId,
    explicitMeta,
  ] of Object.entries(
    explicitExplanationMetaMap,
  )
) {
  const generated =
    generatedDefaultExplanationMetaMap[
      questionId
    ];

  const finalMeta =
    getExplanationMeta(
      questionId,
    );

  assert(
    generated !== undefined,
    `${questionId}: generated meta missing for explicit question`,
  );

  assert(
    finalMeta !== null,
    `${questionId}: merged final meta missing`,
  );

  assert(
    finalMeta.questionId ===
      explicitMeta.questionId,
    `${questionId}: explicit questionId must be preserved`,
  );

  assert(
    finalMeta.style ===
      explicitMeta.style,
    `${questionId}: explicit style must be preserved`,
  );

  if (
    explicitMeta.correctAnswerLine
      ?.trim()
  ) {
    assert(
      finalMeta.correctAnswerLine ===
        explicitMeta.correctAnswerLine,
      `${questionId}: explicit correct answer line must override default`,
    );
  } else {
    assert(
      finalMeta.correctAnswerLine ===
        generated.correctAnswerLine,
      `${questionId}: blank explicit correct answer must use generated default`,
    );
  }

  if (
    explicitMeta.shortExplanation
      ?.trim()
  ) {
    assert(
      finalMeta.shortExplanation ===
        explicitMeta.shortExplanation,
      `${questionId}: explicit explanation must override default`,
    );
  } else {
    assert(
      finalMeta.shortExplanation ===
        generated.shortExplanation,
      `${questionId}: blank explicit explanation must use generated default`,
    );
  }

  for (
    const optionIndex of [
      0,
      1,
      2,
      3,
      4,
    ] as const
  ) {
    const explicitMemo =
      explicitMeta.optionMemos?.[
        optionIndex
      ];

    if (
      explicitMemo &&
      explicitMemo.trim().length > 0
    ) {
      assert(
        finalMeta.optionMemos?.[
          optionIndex
        ] === explicitMemo,
        `${questionId}: explicit option memo ${optionIndex} must override default`,
      );
    } else {
      assert(
        finalMeta.optionMemos?.[
          optionIndex
        ] ===
          generated.optionMemos?.[
            optionIndex
          ],
        `${questionId}: missing option memo ${optionIndex} must use generated default`,
      );
    }
  }

  if (explicitMeta.visualImage) {
    assert(
      finalMeta.visualImage ===
        explicitMeta.visualImage,
      `${questionId}: explicit visual image must be preserved`,
    );
  }

  if (explicitMeta.supplementalImage) {
    assert(
      finalMeta.supplementalImage ===
        explicitMeta.supplementalImage,
      `${questionId}: supplemental image must be preserved`,
    );
  }
}

const missingMetaIds =
  questions
    .filter(
      (question) =>
        getExplanationMeta(
          question.id,
        ) === null,
    )
    .map(
      (question) =>
        question.id,
    );

console.log(
  `TOTAL_QUESTIONS=${questions.length}`,
);

console.log(
  `GENERATED_DEFAULT_META=${
    Object.keys(
      generatedDefaultExplanationMetaMap,
    ).length
  }`,
);

console.log(
  `EXPLICIT_META=${explicitIds.length}`,
);

console.log(
  `DEFAULT_META_USED=${
    questions.length -
    explicitIds.length
  }`,
);

console.log(
  `FINAL_META_COVERAGE=${
    questions.length -
    missingMetaIds.length
  }`,
);

console.log(
  `MISSING_META=${missingMetaIds.length}`,
);

console.log(
  'EXPLICIT_META_OVERRIDE_OK=1',
);

console.log(
  'ALL_EXPLANATION_META_TESTS_PASSED=1',
);
