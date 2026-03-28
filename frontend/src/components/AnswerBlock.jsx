import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Tag, MousePointer2, CheckCircle2 } from 'lucide-react';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function AnswerBlock({ content, concepts, onTermToggle, selectedTerms = [], activeContextId, magicSelectMode = false }) {
  const [selection, setSelection] = useState(null);
  const [magicSelectedWords, setMagicSelectedWords] = useState([]);
  const containerRef = useRef(null);

  if (!content) return null;

  // Handle standard text selection
  const handleMouseUp = () => {
    if (magicSelectMode) return;
    
    const sel = window.getSelection();
    const text = sel.toString().trim();
    
    if (text && text.length > 1) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setSelection({
        text,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 10
      });
    } else {
      setSelection(null);
    }
  };

  // Reset magic selection when mode changes
  useEffect(() => {
    setMagicSelectedWords([]);
    setSelection(null);
  }, [magicSelectMode]);

  const handleMagicWordClick = (word) => {
    setMagicSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      } else {
        return [...prev, word];
      }
    });
  };

  const handleAddTag = (text) => {
    if (onTermToggle) {
      onTermToggle(text);
    }
    setSelection(null);
    setMagicSelectedWords([]);
  };

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
  const renderTextContent = (text, isConcept = false) => {
    if (magicSelectMode && !isConcept) {
      // Split by words and spaces
      return text.split(/(\s+)/).map((word, i) => {
        if (word.trim() === '') return word;
        const isSelected = selectedTerms.includes(word) || magicSelectedWords.includes(word);
        return (
          <span
            key={i}
            onClick={() => handleMagicWordClick(word)}
            className={`cursor-pointer px-0.5 rounded transition-all ${
              isSelected 
              ? 'bg-primary-500/30 text-primary-200 border-b border-primary-500' 
              : 'hover:bg-white/10'
            }`}
          >
            {word}
          </span>
        );
      });
    }

    return text.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i !== arr.length - 1 && <br className="my-2" />}
      </React.Fragment>
    ));
  };

  return (
    <div 
      ref={containerRef}
      className="text-gray-300 leading-relaxed font-inter text-base relative"
      onMouseUp={handleMouseUp}
    >
      <AnimatePresence>
        {(selection || magicSelectedWords.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              left: selection ? selection.x : '50%',
              top: selection ? (selection.y - 10) : -30
            }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-[999] -translate-x-1/2 -translate-y-full mb-4 pointer-events-auto"
            style={!selection ? { left: '50%', transform: 'translateX(-50%)' } : {}}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddTag(selection ? selection.text : magicSelectedWords.join(' '));
              }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-400 via-teal-500 to-primary-600 text-black rounded-full text-xs font-black shadow-[0_10px_40px_rgba(45,212,191,0.5)] whitespace-nowrap hover:scale-110 active:scale-95 transition-transform border-2 border-white/30 backdrop-blur-md"
            >
              <Tag className="w-4 h-4 fill-current animate-pulse" />
              <span>Add to Deep Dive</span>
            </button>
            <div className="w-3 h-3 bg-teal-500 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-white/20"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {parts.map((part, idx) => {
        if (part.isConcept) {
          const isSelected = selectedTerms.includes(part.text);
          const isActive = activeContextId === (part.concept.context_id || `custom-${part.concept.term}`);
          return (
            <span
              key={idx}
              className={`highlight-term flex-inline items-center space-x-1 ${isActive ? 'active' : ''} ${isSelected ? 'ring-2 ring-primary-500/50 bg-primary-500/20' : ''} ${magicSelectMode ? 'opacity-50 grayscale-[0.5]' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!magicSelectMode && onTermToggle) onTermToggle(part.text);
              }}
              title={magicSelectMode ? 'Magic Selection Active' : 'Click to select concept'}
            >
              {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-400 inline mr-1" />}
              {part.text}
            </span>
          );
        }
        return <span key={idx}>{renderTextContent(part.text)}</span>;
      })}

      {magicSelectMode && (
        <div className="mt-4 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-primary-500/60 bg-primary-500/5 p-2 rounded-lg border border-primary-500/10">
          <MousePointer2 className="w-3 h-3" />
          <span>Select multiple words and click the floating button to add tags</span>
        </div>
      )}
    </div>
  );
}
