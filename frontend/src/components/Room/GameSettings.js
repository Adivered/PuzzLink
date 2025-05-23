import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect";

const GameSettings = ({ initialSettings, onSave, onCancel, isDarkTheme }) => {
  const [settings, setSettings] = useState(initialSettings);
  const formRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".form-field", {
        opacity: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.1,
        ease: "expo.out",
      });
    }, formRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="form-field">
        <label
          htmlFor="timeLimit"
          className={`block text-base font-semibold transition-colors duration-300 mb-2 ${
            isDarkTheme ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Time Limit (minutes)
        </label>
        <input
          type="number"
          id="timeLimit"
          name="timeLimit"
          value={settings.timeLimit}
          onChange={handleChange}
          className={`mt-1 block w-full p-3 rounded-lg border transition-colors duration-300 ${
            isDarkTheme
              ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
              : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400"
          } focus:outline-none focus:ring-2 shadow-sm`}
          min="5"
          max="180"
        />
      </div>
      <div className="form-field">
        <label
          htmlFor="gameMode"
          className={`block text-base font-semibold transition-colors duration-300 mb-2 ${
            isDarkTheme ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Game Mode
        </label>
        <select
          id="gameMode"
          name="gameMode"
          value={settings.gameMode}
          onChange={handleChange}
          className={`mt-1 block w-full p-3 rounded-lg border transition-colors duration-300 ${
            isDarkTheme
              ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
              : "bg-white border-gray-300 text-gray-800 focus:ring-blue-400"
          } focus:outline-none focus:ring-2 shadow-sm appearance-none`}
        >
          <option value="Puzzle">Puzzle</option>
          <option value="DrawablePuzzle">Drawable Puzzle</option>
          <option value="Drawable">Drawable</option>
        </select>
      </div>
      <div className="form-field flex items-center">
        <input
          type="checkbox"
          id="turnBased"
          name="turnBased"
          checked={settings.turnBased}
          onChange={handleChange}
          className={`rounded border transition-colors duration-300 ${
            isDarkTheme
              ? "border-gray-600 text-blue-500 focus:ring-blue-500"
              : "border-gray-300 text-blue-600 focus:ring-blue-400"
          } h-4 w-4`}
        />
        <label
          htmlFor="turnBased"
          className={`ml-2 text-base font-semibold transition-colors duration-300 ${
            isDarkTheme ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Turn-based game
        </label>
      </div>
      <div className="form-field flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
            isDarkTheme
              ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md`}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default GameSettings;