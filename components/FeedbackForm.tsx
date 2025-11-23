
import React, { useState } from 'react';
import type { FeedbackData } from '../types';

interface FeedbackFormProps {
  onSubmit: (data: FeedbackData) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const [accuracy, setAccuracy] = useState<'accurate' | 'inaccurate' | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accuracy) {
      setIsSubmitting(true);
      // Simulate a small delay for better UX
      setTimeout(() => {
        onSubmit({ accuracy, comments });
        setIsSubmitting(false);
      }, 400);
    }
  };

  return (
    <div className="mt-8 border-t border-white/10 pt-6 animate-fade-in">
      <h4 className="text-lg font-semibold text-slate-200 mb-4 text-center">
        How was this forecast?
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center gap-6">
          <button
            type="button"
            onClick={() => setAccuracy('accurate')}
            className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 w-32
              ${accuracy === 'accurate' 
                ? 'bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="font-medium">Spot On</span>
          </button>

          <button
            type="button"
            onClick={() => setAccuracy('inaccurate')}
            className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 w-32
              ${accuracy === 'inaccurate' 
                ? 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transition-transform group-hover:scale-110 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            <span className="font-medium">Off Base</span>
          </button>
        </div>

        {accuracy === 'inaccurate' && (
          <div className="animate-fade-in bg-red-900/10 border border-red-500/20 rounded-lg p-4">
            <label htmlFor="comments" className="block text-sm font-medium text-red-200 mb-2">
              What did SurfSensei get wrong? <span className="text-red-400 text-xs font-normal">(Required to improve the model)</span>
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g., The wind was onshore, not offshore. 56th street was actually closed out."
              rows={3}
              required
              className="w-full bg-slate-900/50 border border-red-500/30 rounded-md p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
        )}

        {accuracy === 'accurate' && (
           <div className="animate-fade-in bg-green-900/10 border border-green-500/20 rounded-lg p-4">
             <label htmlFor="comments" className="block text-sm font-medium text-green-200 mb-2">
               Any extra details? <span className="text-green-400 text-xs font-normal">(Optional)</span>
             </label>
             <textarea
               id="comments"
               value={comments}
               onChange={(e) => setComments(e.target.value)}
               placeholder="e.g., The board recommendation was perfect for these waves."
               rows={2}
               className="w-full bg-slate-900/50 border border-green-500/30 rounded-md p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:outline-none transition-colors"
             />
           </div>
        )}

        {accuracy && (
          <button
            type="submit"
            disabled={isSubmitting || (accuracy === 'inaccurate' && !comments.trim())}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-cyan-500/20"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        )}
      </form>
    </div>
  );
};

export default FeedbackForm;
