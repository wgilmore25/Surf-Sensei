import React, { useState, useEffect } from 'react';
import type { Recommendation } from '../types';

interface RecommendationDisplayProps {
  recommendationText: string;
}

const parseRecommendation = (text: string): Recommendation | null => {
  const spotMatch = text.match(/\*\*Spot Recommendation:\*\*\s*([\s\S]*?)(?=\*\*Board Recommendation:\*\*|$)/);
  const boardMatch = text.match(/\*\*Board Recommendation:\*\*\s*([\s\S]*?)(?=\*\*Spot Comparison:\*\*|$)/);
  const comparisonMatch = text.match(/\*\*Spot Comparison:\*\*\s*([\s\S]*?)(?=\*\*Session Strategy:\*\*|$)/);
  const strategyMatch = text.match(/\*\*Session Strategy:\*\*\s*([\s\S]*?$)/);

  if (!spotMatch || !boardMatch || !comparisonMatch || !strategyMatch) {
    return null; // Return null if parsing fails to find all sections
  }

  return {
    spot: spotMatch[1].trim(),
    board: boardMatch[1].trim(),
    comparison: comparisonMatch[1].trim(),
    strategy: strategyMatch[1].trim(),
  };
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6 last:mb-0">
        <h3 className="text-xl font-bold text-cyan-300 mb-2 border-b-2 border-cyan-400/30 pb-2">{title}</h3>
        <div className="prose prose-invert prose-p:text-slate-200 prose-ul:text-slate-300 prose-strong:text-white">
            {children}
        </div>
    </div>
);


const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendationText }) => {
  const [parsed, setParsed] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (recommendationText) {
      const result = parseRecommendation(recommendationText);
      if (result) {
        setParsed(result);
        setError('');
      } else {
        setError('Could not parse the recommendation. Displaying raw text.');
        setParsed(null);
      }
    }
  }, [recommendationText]);

  if (error) {
    return (
        <div>
            <p className="text-red-400 mb-4">{error}</p>
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300">{recommendationText}</pre>
        </div>
    );
  }

  if (!parsed) {
    return null;
  }

  // A simple function to render paragraphs from text with newlines
  const renderParagraphs = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      paragraph.trim() && <p key={index}>{paragraph}</p>
    ));
  };


  return (
    <div className="h-full overflow-y-auto">
        <Section title="Spot Recommendation">
            {renderParagraphs(parsed.spot)}
        </Section>
        <Section title="Board Recommendation">
            {renderParagraphs(parsed.board)}
        </Section>
        <Section title="Spot Comparison">
            {renderParagraphs(parsed.comparison)}
        </Section>
        <Section title="Session Strategy">
            {renderParagraphs(parsed.strategy)}
        </Section>
    </div>
  );
};

export default RecommendationDisplay;