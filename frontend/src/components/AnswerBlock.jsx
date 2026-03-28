import React from 'react';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function AnswerBlock({ content, concepts, onConceptClick, activeContextId }) {
  if (!content) return null;

  // Sort by length descending, so we don't partially match parts of longer concepts
  const sortedConcepts = [...(concepts || [])]
    .filter(c => c.term && c.term.trim() !== '')
    .sort((a, b) => b.term.length - a.term.length);

  let parts = [{ text: content, isConcept: false, concept: null }];

  for (const concept of sortedConcepts) {
    const newParts = [];
    for (const part of parts) {
      if (part.isConcept) {
        newParts.push(part);
        continue;
      }

      const regexStr = `\\b(${escapeRegExp(concept.term)})\\b`;
      const regex = new RegExp(regexStr, 'gi');
      const textSplits = part.text.split(regex);

      textSplits.forEach((splitStr) => {
        if (!splitStr) return;
        if (splitStr.toLowerCase() === concept.term.toLowerCase()) {
          newParts.push({ text: splitStr, isConcept: true, concept });
        } else {
          newParts.push({ text: splitStr, isConcept: false, concept: null });
        }
      });
    }
    parts = newParts;
  }

  // Handle line breaks by converting \n to <br/>
  const renderTextContent = (text) => {
    return text.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i !== arr.length - 1 && <br className="my-2" />}
      </React.Fragment>
    ));
  };

  return (
    <div className="text-gray-300 leading-relaxed font-inter text-base">
      {parts.map((part, idx) => {
        if (part.isConcept) {
          const isActive = activeContextId === part.concept.context_id;
          return (
            <span
              key={idx}
              className={`highlight-term ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onConceptClick) onConceptClick(part.concept, content);
              }}
              title="Click to explore concept"
            >
              {part.text}
            </span>
          );
        }
        return <span key={idx}>{renderTextContent(part.text)}</span>;
      })}
    </div>
  );
}
