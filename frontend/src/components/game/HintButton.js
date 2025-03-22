import React from 'react';
import { HelpCircle } from 'lucide-react';

const HintButton = ({ onClick, hintsUsed }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
    >
      <HelpCircle size={20} />
      <span className="text-xs absolute bottom-0 right-0 bg-red-500 rounded-full px-1">
        {hintsUsed}
      </span>
    </button>
  );
};

export default HintButton;