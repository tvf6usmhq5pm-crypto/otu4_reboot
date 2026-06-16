import { Suspense } from 'react';

import ResultClient from '../../components/result/ResultClient';

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: 430, margin: '0 auto', padding: 24 }}>
          Loading...
        </main>
      }
    >
      <ResultClient />
    </Suspense>
  );
}