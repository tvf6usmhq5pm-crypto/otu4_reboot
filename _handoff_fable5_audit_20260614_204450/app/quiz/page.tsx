import { Suspense } from 'react';

import QuizClient from '../../components/quiz/QuizClient';

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
          読み込み中...
        </main>
      }
    >
      <QuizClient />
    </Suspense>
  );
}