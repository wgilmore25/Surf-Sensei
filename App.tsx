import React, { useState } from 'react';
import { getSurfRecommendation } from './services/geminiService';
import type { SurfData, FeedbackData } from './types';
import InputForm from './components/InputForm';
import RecommendationDisplay from './components/RecommendationDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { WaveIcon } from './components/icons/WaveIcon';
import FeedbackForm from './components/FeedbackForm';
import NewsletterForm from './components/NewsletterForm';

const App: React.FC = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultDateTime = now.toISOString().slice(0, 16);

  const [surfData, setSurfData] = useState<SurfData>({
    sessionDateTime: defaultDateTime,
    spots: '',
    swellHeight: '',
    swellPeriod: '',
    swellDirection: '',
    windSpeed: '',
    windDirection: '',
    tideHeight: '',
    tideDirection: 'rising',
    skillLevel: 'Intermediate',
    bodyWeight: '',
    userBoards: '',
  });

  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const handleSubmit = async (data: SurfData) => {
    setIsLoading(true);
    setError('');
    setRecommendation('');
    setFeedbackSubmitted(false);
    try {
      const result = await getSurfRecommendation(data);
      setRecommendation(result);
    } catch (err) {
      let errorMessage = 'Failed to get recommendation. Please try again.';
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('api key')) {
          errorMessage = 'Failed to get recommendation. Please check your API key configuration.';
        } else if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
          errorMessage = 'A network error occurred. Please check your connection and try again.';
        }
      }
      setError(errorMessage);
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = (data: FeedbackData) => {
    console.log('Feedback received:', data);
    
    // Save feedback to localStorage to refine future model predictions (RAG-lite)
    try {
        const existingStorage = localStorage.getItem('surfSensei_feedback');
        const history = existingStorage ? JSON.parse(existingStorage) : [];
        
        history.push({
            timestamp: new Date().toISOString(),
            accuracy: data.accuracy,
            comments: data.comments,
        });
        
        localStorage.setItem('surfSensei_feedback', JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save feedback", e);
    }

    setFeedbackSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <WaveIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              SurfSensei
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-300">Your AI-powered surf spot advisor.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <InputForm
              initialData={surfData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <NewsletterForm />
          </div>

          <div className="relative min-h-[400px] lg:min-h-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl z-10">
                <LoadingSpinner />
                <p className="mt-4 text-slate-200">Analyzing the waves...</p>
              </div>
            )}
            
            <div className="flex-grow overflow-y-auto pr-2">
                {error && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-red-400 text-center">{error}</p>
                  </div>
                )}
                {!isLoading && !error && !recommendation && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                     <WaveIcon className="w-20 h-20 text-cyan-400/30" />
                    <p className="mt-4 text-slate-400">Your personalized surf report will appear here.</p>
                  </div>
                )}
                {recommendation && <RecommendationDisplay recommendationText={recommendation} />}
            </div>

            {recommendation && !error && !isLoading && (
              <div className="flex-shrink-0">
                {feedbackSubmitted ? (
                  <div className="mt-6 border-t border-white/10 pt-6 text-center text-green-300 animate-fade-in">
                    <p className="text-lg font-semibold">Thanks for your feedback!</p>
                    <p className="text-sm text-green-200/70 mt-1">SurfSensei will use this to improve future recommendations.</p>
                  </div>
                ) : (
                  <FeedbackForm onSubmit={handleFeedbackSubmit} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;