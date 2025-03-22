import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { fetchGame } from '../../store/gameSlice';
import { useParams } from 'react-router-dom';
import DroppableCell from '../../components/game/DroppableCell';
import PuzzlePiece from '../../components/game/PuzzlePiece';
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, HelpCircle } from 'lucide-react';
import Timer from '../../components/game/Timer';
import HintButton from '../../components/game/HintButton';
const getRowCol = (position, gridSize) => ({
  row: Math.floor(position / gridSize),
  col: position % gridSize,
});


const GameRoom = () => {
  const { gameId } = useParams();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const { data: game } = useSelector((state) => state.game);
  const [activeId, setActiveId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timer, setTimer] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const gridSize = 4; // Adjustable based on difficulty
  const cellSize = useMemo(() => 100 / zoomLevel, [zoomLevel]);

  useEffect(() => {
    dispatch(fetchGame(gameId));
  }, [dispatch, gameId]);

  useEffect(() => {
    if (game?.puzzle?.pieces) {
      const shuffledPieces = [...game.puzzle.pieces]
        .sort(() => Math.random() - 0.5)
        .map((piece, index) => ({
          ...piece,
          id: `piece-${index}`,
          currentPosition: null,
        }));
      setPieces(shuffledPieces);
    }
  }, [game]);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback((event) => {
    setDragOverId(event.over?.id || null);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverId(null);

    if (!over) return;

    const pieceId = active.id;
    const targetId = over.id;

    if (targetId.startsWith('cell-')) {
      const position = parseInt(targetId.split('-')[1]);
      const { row, col } = getRowCol(position, gridSize);

      setPieces((prevPieces) =>
        prevPieces.map((piece) => {
          if (piece.id === pieceId) {
            return { ...piece, currentPosition: { row, col } };
          }
          if (piece.currentPosition?.row === row && piece.currentPosition?.col === col) {
            return { ...piece, currentPosition: null };
          }
          return piece;
        })
      );
    }
  }, [gridSize]);

  const handleHint = useCallback(() => {
    setHintsUsed((prev) => prev + 1);
    // Logic to show a hint (e.g., highlight a correct piece)
  }, []);

  const gridPieces = useMemo(() => pieces.filter((p) => p.currentPosition !== null), [pieces]);
  const bankPieces = useMemo(() => pieces.filter((p) => p.currentPosition === null), [pieces]);

  if (!game || !game.puzzle) {
    return <div className="p-6 rounded-lg bg-yellow-50 text-yellow-600">Loading...</div>;
  }

  return (
    <div className={`h-screen w-screen p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Puzzle Game</h2>
        <Timer timer={timer} setTimer={setTimer} />
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full flex flex-col md:flex-row gap-6">
          {/* Puzzle Grid */}
          <div className="flex-1 relative bg-gray-100 rounded-lg p-4">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <HintButton onClick={handleHint} hintsUsed={hintsUsed} />
              <button onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 2))} className="bg-blue-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center">
                <ZoomIn size={20} />
              </button>
              <button onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))} className="bg-blue-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center">
                <ZoomOut size={20} />
              </button>
            </div>
            <SortableContext items={gridPieces.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                }}
              >
                {Array.from({ length: gridSize * gridSize }, (_, i) => {
                  const { row, col } = getRowCol(i, gridSize);
                  const piece = pieces.find(
                    (p) => p.currentPosition?.row === row && p.currentPosition?.col === col
                  );

                  return (
                    <DroppableCell
                      key={`cell-${i}`}
                      id={i}
                      isOver={dragOverId === `cell-${i}`}
                    >
                      {piece && (
                        <PuzzlePiece
                          id={piece.id}
                          imageUrl={game.puzzle.originalImage.url}
                          pieceData={piece.imageData}
                          isInBank={false}
                          cellSize={cellSize}
                        />
                      )}
                    </DroppableCell>
                  );
                })}
              </div>
            </SortableContext>
          </div>

          {/* Piece Bank */}
          <div className={`w-full md:w-1/3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg transition-all duration-300 flex flex-col`}>
            <div
              className={`flex justify-between items-center p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              <h3 className="text-lg font-semibold">Available Pieces</h3>
              {isDrawerOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {isDrawerOpen && (
              <SortableContext items={bankPieces.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {bankPieces.map((piece) => (
                      <div key={piece.id} className="aspect-square relative">
                        <PuzzlePiece
                          id={piece.id}
                          imageUrl={game.puzzle.originalImage.url}
                          pieceData={piece.imageData}
                          isInBank={true}
                          cellSize={cellSize}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </SortableContext>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId && (
            <div className="w-[200px] h-[200px] relative">
              <PuzzlePiece
                id={activeId}
                imageUrl={game.puzzle.originalImage.url}
                pieceData={pieces.find((p) => p.id === activeId)?.imageData}
                isInBank={true}
                cellSize={cellSize}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default React.memo(GameRoom);