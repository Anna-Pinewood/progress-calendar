import React, { useState } from 'react';
import { parseInput } from '../utils/parseInput';

interface AchievementFormProps {
  onAddAchievement: (sphere: string, text: string) => void;
}

const AchievementForm: React.FC<AchievementFormProps> = ({ onAddAchievement }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = parseInput(input);
    
    if (!parsed) {
      setError('Format must be "SPHERE: achievement text"');
      return;
    }
    
    onAddAchievement(parsed.sphere, parsed.text);
    setInput('');
    setError('');
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="mb-2">
          <label htmlFor="achievement" className="block text-sm font-medium text-gray-700 mb-1">
            Add Achievement
          </label>
          <div className="flex">
            <input
              id="achievement"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="SPHERE: Your achievement..."
              required
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-black rounded-r-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <div className="text-sm text-gray-500 mt-1">
          {/* Format: "SPHERE: Your achievement" (e.g., "HEALTH: Ran 5km today") */}
        </div>
      </form>
    </div>
  );
};

export default AchievementForm;