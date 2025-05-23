import { PuzzlePieceIcon, PaintBrushIcon, PencilIcon } from "@heroicons/react/24/outline";

const GameTypeStation = ({ roomData, updateRoomData, isActive, isDarkTheme }) => {
  const gameTypes = [
    {
      id: "Puzzle",
      title: "Jigsaw Puzzle",
      description: "Solve puzzles together with friends",
      icon: <PuzzlePieceIcon className="w-12 h-12" />,
    },
    {
      id: "DrawablePuzzle",
      title: "Coloring Page",
      description: "Color and solve puzzles with codes",
      icon: <PaintBrushIcon className="w-12 h-12" />,
    },
    {
      id: "Drawable",
      title: "Shared Whiteboard",
      description: "Draw and collaborate in real-time",
      icon: <PencilIcon className="w-12 h-12" />,
    },
  ];

  const handleSelectGameType = (gameType) => {
    updateRoomData({ gameMode: gameType });
  };

  return (
    <div
      className={`absolute w-full transition-opacity duration-300 ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      style={{ display: isActive ? "block" : "none" }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Game Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gameTypes.map((type) => (
          <div
            key={type.id}
            className={`cursor-pointer rounded-xl p-6 transition-all duration-300 ${
              roomData.gameMode === type.id
                ? isDarkTheme
                  ? "bg-blue-900 border-2 border-blue-500"
                  : "bg-blue-50 border-2 border-blue-500"
                : isDarkTheme
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-white hover:bg-gray-50 shadow-md"
            }`}
            onClick={() => handleSelectGameType(type.id)}
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="mb-4">{type.icon}</div>
              <h3 className="text-xl font-bold mb-2">{type.title}</h3>
              <p className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>{type.description}</p>
              {roomData.gameMode === type.id && (
                <div
                  className={`mt-4 px-3 py-1 rounded-full text-sm font-medium ${
                    isDarkTheme ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                  }`}
                >
                  Selected
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameTypeStation;