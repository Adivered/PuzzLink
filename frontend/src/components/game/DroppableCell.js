import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const DroppableCell = ({ 
  id, 
  row, 
  col, 
  cellSize, 
  children, 
  isSelected = false,
  isOver = false,
  onClick,
  theme = 'light'
}) => {
  const {
    isOver: isOverFromKit,
    setNodeRef,
  } = useDroppable({
    id: id,
  });

  const getClassName = () => {
    // For piece bank (auto size), use different styling
    if (cellSize === 'auto') {
      return 'w-full h-full';
    }

    // For grid cells, remove all borders - pieces should fit together seamlessly
    let className = `relative transition-all duration-200 ease-in-out overflow-hidden ${
      isSelected 
        ? 'ring-2 ring-blue-400 ring-opacity-60' 
        : ''
    }`;
    
    // Add drop zone highlighting - keep this visible for functionality
    if (isOverFromKit || isOver) {
      className += theme === 'dark' 
        ? ' ring-2 ring-green-400/60 bg-green-900/20' 
        : ' ring-2 ring-green-500/60 bg-green-100/30';
    }
    
    // Add interactive cursor for empty cells
    if (!children && onClick) {
      className += ' cursor-pointer hover:bg-gray-100/20 dark:hover:bg-gray-800/20';
    }

    // Very subtle background for empty cells - almost invisible
    if (!children) {
      className += theme === 'dark'
        ? ' bg-gray-800/5 border-2 border-dashed border-blue-400/60'
        : ' bg-gray-100/10 border-2 border-dashed border-blue-500/60';
    }
    
    return className;
  };

  const style = cellSize === 'auto' ? {} : { 
    width: cellSize, 
    height: cellSize,
    minWidth: cellSize,
    minHeight: cellSize
  };

  // Add visual grid position indicator for empty cells
  const shouldShowGridPosition = false; // Removed to make it look more like a real puzzle

  return (
    <div
      ref={setNodeRef}
      className={getClassName()}
      style={style}
      onClick={onClick}
      data-row={row}
      data-col={col}
    >
      {/* Grid position indicator for empty cells */}
      {shouldShowGridPosition && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          <div className="text-xs font-mono">
            {row},{col}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default React.memo(DroppableCell);