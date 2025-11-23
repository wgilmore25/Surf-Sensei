
import React, { useState } from 'react';
import type { SurfData } from '../types';
import { getSurfConditions } from '../services/geminiService';
import { MagicIcon } from './icons/MagicIcon';

interface InputFormProps {
  initialData: SurfData;
  onSubmit: (data: SurfData) => void;
  isLoading: boolean;
}

const FormField: React.FC<{ label: string; id: string; children: React.ReactNode }> = ({ label, id, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
            {label}
        </label>
        {children}
    </div>
);

const InputForm: React.FC<InputFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SurfData>(initialData);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAutoFill = async () => {
    if (!formData.spots) {
        setAutofillError('Please enter a spot name first.');
        return;
    }
    setAutofillError('');
    setIsAutofilling(true);
    try {
        const conditions = await getSurfConditions(formData.spots);
        setFormData((prev) => ({
            ...prev,
            ...conditions,
            // Retain personal info, overwrite conditions
            skillLevel: prev.skillLevel,
            bodyWeight: prev.bodyWeight,
            userBoards: prev.userBoards,
            sessionDateTime: prev.sessionDateTime
        }));
    } catch (err) {
        setAutofillError('Failed to fetch NOAA data.');
    } finally {
        setIsAutofilling(false);
    }
  };

  const commonInputClasses = "w-full bg-slate-800/50 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors";

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-cyan-300">Enter Session Details</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Spots to Compare" id="spots">
            <div className="relative flex gap-2">
                <input
                type="text"
                name="spots"
                id="spots"
                placeholder="e.g., Huntington Pier vs 56th Street Jetty"
                value={formData.spots}
                onChange={handleChange}
                className={commonInputClasses}
                />
            </div>
            <div className="mt-2 flex items-center justify-between">
                 <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isAutofilling || isLoading}
                    className="text-xs flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
                >
                    <MagicIcon className={`w-4 h-4 ${isAutofilling ? 'animate-pulse' : ''}`} />
                    {isAutofilling ? 'Fetching NOAA Data...' : 'Auto-fill conditions from NOAA'}
                </button>
                {autofillError && <span className="text-xs text-red-400">{autofillError}</span>}
            </div>
        </FormField>
        
        <FormField label="Desired Surf Time" id="sessionDateTime">
            <input
              type="datetime-local"
              name="sessionDateTime"
              id="sessionDateTime"
              value={formData.sessionDateTime}
              onChange={handleChange}
              className={commonInputClasses}
            />
        </FormField>

        <fieldset className={`transition-opacity duration-300 ${isAutofilling ? 'opacity-50' : 'opacity-100'}`}>
          <legend className="text-lg font-medium text-slate-200 mb-3 flex items-center justify-between w-full">
              <span>Conditions</span>
              {isAutofilling && <span className="text-xs text-cyan-400 animate-pulse">Updating...</span>}
          </legend>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Swell Height (ft)" id="swellHeight">
                  <input type="text" name="swellHeight" id="swellHeight" value={formData.swellHeight} onChange={handleChange} className={commonInputClasses} />
                </FormField>
                <FormField label="Swell Period (s)" id="swellPeriod">
                  <input type="text" name="swellPeriod" id="swellPeriod" value={formData.swellPeriod} onChange={handleChange} className={commonInputClasses} />
                </FormField>
                <FormField label="Swell Direction" id="swellDirection">
                  <input type="text" name="swellDirection" id="swellDirection" value={formData.swellDirection} onChange={handleChange} className={commonInputClasses} />
                </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Wind Speed (mph)" id="windSpeed">
                <input type="number" name="windSpeed" id="windSpeed" value={formData.windSpeed} onChange={handleChange} className={commonInputClasses} />
              </FormField>
              <FormField label="Wind Direction" id="windDirection">
                <input type="text" name="windDirection" id="windDirection" value={formData.windDirection} onChange={handleChange} className={commonInputClasses} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Tide Height (ft)" id="tideHeight">
                <input type="number" step="0.1" name="tideHeight" id="tideHeight" value={formData.tideHeight} onChange={handleChange} className={commonInputClasses} />
              </FormField>
              <FormField label="Tide Direction" id="tideDirection">
                <select name="tideDirection" id="tideDirection" value={formData.tideDirection} onChange={handleChange} className={commonInputClasses}>
                  <option value="rising">Rising</option>
                  <option value="falling">Falling</option>
                </select>
              </FormField>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-medium text-slate-200 mb-3">Your Profile</legend>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Skill Level" id="skillLevel">
                <select name="skillLevel" id="skillLevel" value={formData.skillLevel} onChange={handleChange} className={commonInputClasses}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </FormField>
              <FormField label="Weight (lbs)" id="bodyWeight">
                <input type="number" name="bodyWeight" id="bodyWeight" value={formData.bodyWeight} onChange={handleChange} className={commonInputClasses} />
              </FormField>
            </div>
            <FormField label="Boards You Own" id="userBoards">
                <textarea
                  name="userBoards"
                  id="userBoards"
                  placeholder="e.g., 6'0 31L shortboard, 5'8 fish, 7'0 mid-length"
                  value={formData.userBoards}
                  onChange={handleChange}
                  rows={3}
                  className={commonInputClasses}
                ></textarea>
              </FormField>
            </div>
        </fieldset>

        <button
          type="submit"
          disabled={isLoading || isAutofilling}
          className="w-full flex justify-center items-center bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? 'Thinking...' : 'Get Recommendation'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
