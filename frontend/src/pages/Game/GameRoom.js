import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { fetchGame, updateGameState } from '../../store/gameSlice';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Droppable Cell Component
const DroppableCell = ({ children, id }) => {
  const { setNodeRef } = useDroppable({
    id: `cell-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="border border-dashed border-gray-300 relative"
    >
      {children}
    </div>
  );
};

// Puzzle Piece Component
const PuzzlePiece = ({ id, imageUrl, pieceData, isInBank }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const parsedData = typeof pieceData === 'string' ? JSON.parse(pieceData) : pieceData;

  const style = {
    transform: CSS.Transform.toString(transform),
    width: `${parsedData.width}px`,
    height: `${parsedData.height}px`,
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: `-${parsedData.x}px -${parsedData.y}px`,
    cursor: 'grab',
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute ${isInBank ? 'rounded-lg shadow-md' : ''}`}
      {...listeners}
      {...attributes}
    />
  );
};

// Main Game Component
const GameRoom = () => {
  const { gameId } = useParams();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const { data: game, status } = useSelector((state) => state.game);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    console.log("Game ID: ", gameId)
    dispatch(fetchGame(gameId));
  }, [dispatch, gameId]);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const scale = Math.min(containerWidth / 1000, 1);
      setScale(scale);
    }
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!active || !over) return;

    const pieceId = active.id;
    const targetId = over.id;
    
    if (targetId.startsWith('cell-')) {
      const position = parseInt(targetId.split('-')[1]);
      
      dispatch(updateGameState({
        gameId: gameId,
        pieceId: pieceId,
        position: position
      }));
    }
  };

  if (!game || !game.puzzle) {
    return (
      <div className="p-6 rounded-lg bg-yellow-50 text-yellow-600">
        <h2 className="text-lg font-semibold">No Game Found</h2>
        <p>Please make sure a game has been started.</p>
      </div>
    );
  }

  const gridSize = Math.sqrt(game.puzzle.pieces.length);
  console.log("Game: ", game)
  console.log("Game Size: ", gridSize)

  return (
    <div ref={containerRef} className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-4">Puzzle Game</h2>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-6">
          {/* Puzzle Grid */}
          <div
            className="grid relative bg-gray-100 rounded-lg"
            style={{
              width: `${1000 * scale}px`,
              height: `${1000 * scale}px`,
              gridTemplate: `repeat(${gridSize}, 1fr) / repeat(${gridSize}, 1fr)`
            }}
          >
            {Array.from({ length: game.puzzle.pieces.length }, (_, i) => (
              <DroppableCell key={`cell-${i}`} id={i}>
                {game.puzzle.pieces.find(p => p.currentPosition === i) && (
                  <PuzzlePiece
                    id={game.puzzle.pieces.find(p => p.currentPosition === i)._id}
                    imageUrl={game.puzzle.originalImage.url}
                    pieceData={game.puzzle.pieces.find(p => p.currentPosition === i).imageData}
                    isInBank={false}
                  />
                )}
              </DroppableCell>
            ))}
          </div>

          {/* Piece Bank Drawer */}
          <div className={`bg-gray-50 rounded-lg transition-all duration-300 ease-in-out ${isDrawerOpen ? 'max-h-96' : 'max-h-12'} overflow-hidden`}>
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              <h3 className="text-lg font-semibold">Available Pieces</h3>
              {isDrawerOpen ? <ChevronDown /> : <ChevronUp />}
            </div>
            <div className="p-4 grid grid-cols-4 gap-4 overflow-y-auto max-h-screen">
            {game.puzzle.pieces
                .filter(p => !p.isCorrectlyPlaced)
                .map((piece) => (
                  <div key={piece._id} className="aspect-square relative">
                    <PuzzlePiece
                      id={piece._id}
                      imageUrl={game.puzzle.originalImage.url}
                      pieceData={piece.imageData}
                      isInBank={true}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default GameRoom;