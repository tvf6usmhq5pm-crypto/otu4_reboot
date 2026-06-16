import { Fragment, type ReactNode } from 'react';

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+?)\*\*/g;

  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`text-${key++}`}>
          {text.slice(lastIndex, match.index)}
        </Fragment>
      );
    }

    nodes.push(
      <strong key={`bold-${key++}`}>
        {match[1]}
      </strong>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <Fragment key={`text-${key++}`}>
        {text.slice(lastIndex)}
      </Fragment>
    );
  }

  return nodes;
}

export function InlineMarkdownText({ text }: { text?: string | null }) {
  return <>{renderInlineMarkdown(text ?? '')}</>;
}
