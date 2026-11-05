import React, { Fragment } from 'react';

interface SensaRichTextProps {
  text: string;
  className?: string;
}

const renderInline = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });

export const SensaRichText: React.FC<SensaRichTextProps> = ({ text, className = '' }) => (
  <div className={`whitespace-pre-wrap ${className}`}>
    {text.split('\n').map((line, index) => (
      <Fragment key={index}>
        {index > 0 && <br />}
        {renderInline(line)}
      </Fragment>
    ))}
  </div>
);
