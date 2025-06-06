import { PuzzlePieceIcon, PaintBrushIcon, PencilIcon } from "@heroicons/react/24/outline";

const GameTypeStation = ({ roomData, updateRoomData, isActive, isDarkTheme }) => {
  const gameTypes = [
    {
      id: "Puzzle",
      title: "Jigsaw Puzzle",
      description: "Solve puzzles together with friends",
      icon: <PuzzlePieceIcon className="w-10 h-10" />,
    },
    {
      id: "DrawablePuzzle",
      title: "Coloring Page",
      description: "Color and solve puzzles with codes",
      icon: <PaintBrushIcon className="w-10 h-10" />,
    },
    {
      id: "Drawable",
      title: "Shared Whiteboard",
      description: "Draw and collaborate in real-time",
      icon: <PencilIcon className="w-10 h-10" />,
    },
  ];

  const handleSelectGameType = (gameType) => {
    updateRoomData({ gameMode: gameType });
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      style={{ display: isActive ? "flex" : "none" }}
    >
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 auto-rows-min max-w-5xl mx-auto">
        {gameTypes.map((type) => (
          <div
            key={type.id}
            className={`cursor-pointer rounded-lg p-5 transition-all duration-300 hover:scale-105 ${
              roomData.gameMode === type.id
                ? isDarkTheme
                  ? "bg-blue-900 border-2 border-blue-500 shadow-md shadow-blue-500/25"
                  : "bg-blue-50 border-2 border-blue-500 shadow-md shadow-blue-500/25"
                : isDarkTheme
                  ? "bg-gray-700 hover:bg-gray-600 shadow-sm"
                  : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
            }`}
            onClick={() => handleSelectGameType(type.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-blue-500">
                {type.icon}
              </div>
              <h3 className="text-base font-bold mb-2 leading-tight">{type.title}</h3>
              <p className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"} mb-3 leading-relaxed`}>
                {type.description}
              </p>
              {roomData.gameMode === type.id && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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