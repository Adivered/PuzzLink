import React from 'react';
import { useDroppable } from '@dnd-kit/core';


const DroppableCell = ({ children, id, isOver }) => {
    const { setNodeRef } = useDroppable({
        id: `cell-${id}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={`border-2 relative ${isOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'
                } transition-colors duration-200`}
        >
            {children}
        </div>
    );
};

export default DroppableCell;