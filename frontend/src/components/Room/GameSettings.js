import React, { useState } from 'react';

const GameSettings = ({ initialSettings, onSave, onCancel }) => {
  const [settings, setSettings] = useState(initialSettings);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="timeLimit" className="block text-sm font-medium">
          Time Limit (minutes)
        </label>
        <input
          type="number"
          id="timeLimit"
          name="timeLimit"
          value={settings.timeLimit}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          min="5"
          max="180"
        />
      </div>
      <div>
        <label htmlFor="gameMode" className="block text-sm font-medium">
          Game Mode
        </label>
        <select
          id="gameMode"
          name="gameMode"
          value={settings.gameMode}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          <option value="Puzzle">Puzzle</option>
          <option value="DrawablePuzzle">Drawable Puzzle</option>
          <option value="Drawable">Drawable</option>
        </select>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="turnBased"
          name="turnBased"
          checked={settings.turnBased}
          onChange={handleChange}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <label htmlFor="turnBased" className="ml-2 block text-sm font-medium">
          Turn-based game
        </label>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default GameSettings;