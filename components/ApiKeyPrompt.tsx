
import React, { useState } from 'react';
import { WaveIcon } from './icons/WaveIcon';

interface ApiKeyPromptProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
            <WaveIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              SurfSensei
            </h1>
        </div>
        
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Welcome!</h2>
        <p className="text-slate-400 mb-6">
          To get started, please enter your Google AI API key. This is required for the app to function outside of the development environment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="sr-only">
              Google AI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              className="w-full bg-slate-800/50 border border-slate-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 placeholder-slate-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-cyan-500/20"
          >
            Save & Continue
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-6">
          You can get your key from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Google AI Studio
          </a>. Your key is stored only in your browser for this session.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
