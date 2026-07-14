import QuestionReviewClient, {
  type ReviewQuestion,
} from '../../../components/dev/QuestionReviewClient';
import {
  explicitExplanationMetaMap,
  getExplanationMeta,
} from '../../../data/explanation_meta_index';
import { getAllQuestions } from '../../../lib/questions';

export default function QuestionReviewPage() {
  const questions: ReviewQuestion[] =
    getAllQuestions().map(
      (question) => {
        const meta =
          getExplanationMeta(
            question.id,
          );

        return {
          id: question.id,
          subject: question.subject,
          star: question.star,
          difficulty:
            question.difficulty,
          itemName:
            question.item_name,
          question:
            question.question,
          options: [
            ...question.options,
          ],
          explanation:
            question.explanation,
          optionDetails: [
            ...question.option_details,
          ],
          questionLength:
            question.question.length,
          optionLengths:
            question.options.map(
              (option) =>
                option.length,
            ),
          explanationLength:
            question.explanation.length,
          optionDetailLengths:
            question.option_details.map(
              (detail) =>
                detail.length,
            ),
          hasImage: Boolean(
            meta?.visualImage?.src ||
              meta?.supplementalImage
                ?.src,
          ),
          metaKind:
            Object.prototype
              .hasOwnProperty.call(
                explicitExplanationMetaMap,
                question.id,
              )
              ? 'explicit'
              : 'default',
        };
      },
    );

  return (
    <QuestionReviewClient
      questions={questions}
    />
  );
}
