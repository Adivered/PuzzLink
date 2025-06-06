import { useState, useRef, useEffect } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const ImageStation = ({ roomData, updateRoomData, isActive, isDarkTheme }) => {
  const stationRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imagePreview = e.target.result;
        updateRoomData({ image: file, imagePreview });
      };
      reader.readAsDataURL(file);
    }
    setIsDragging(false);
  };

  const handlePromptChange = (e) => {
    updateRoomData({ imagePrompt: e.target.value });
  };

  const handleGenerateImage = async () => {
    if (!roomData.imagePrompt) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: roomData.imagePrompt }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate image");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      updateRoomData({ image: null, imagePreview: imageUrl });
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    return () => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);

  useEffect(() => {
    if (roomData.imagePreview && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const container = canvas.parentElement;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      canvas.width = containerWidth;
      canvas.height = containerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        // Make image span full width
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;

        // If height exceeds canvas, fit by height instead
        if (drawHeight > canvas.height) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        // Remove shadows
        ctx.shadowBlur = 0;
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      };
      img.src = roomData.imagePreview;
    }
  }, [roomData.imagePreview, isDarkTheme]);

  const switchTab = (tab) => {
    if (tab !== activeTab) setActiveTab(tab);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    handleImageChange(e);
  };

  return (
    <div
      ref={stationRef}
      className={`absolute inset-0 transition-opacity duration-300 ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      style={{ display: isActive ? "block" : "none" }}
    >
      <div className="max-w-5xl mx-auto p-4 h-full flex flex-col">
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div>
            <div className="flex justify-center">
              <div className="inline-flex bg-white/10 backdrop-blur-lg rounded-full p-1 shadow-lg">
                {["upload", "prompt"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => switchTab(tab)}
                    className={`relative px-4 py-1.5 rounded-full font-semibold transition-all duration-300 text-sm ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className="relative z-10">
                      {tab === "upload" ? "Upload Magic" : "AI Dreamscape"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col">
              {activeTab === "upload" ? (
                <>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                      isDragging
                        ? "border-purple-500 bg-purple-500/10 scale-105"
                        : `${isDarkTheme ? "border-gray-700" : "border-gray-300"}`
                    }`}
                    style={{ minHeight: '200px' }}
                  >
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                      <div className="relative">
                        <CloudArrowUpIcon
                          className={`w-10 h-10 mb-3 transition-colors duration-300 ${
                            isDragging ? "text-purple-500" : "text-gray-500"
                          }`}
                        />
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {isDragging ? "Drop the Magic!" : "Drag, Drop, or Click!"}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, or GIF (max 10MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <div className="h-8"></div>
                </>
              ) : (
                <>
                  <div className="relative flex-1" style={{ minHeight: '200px' }}>
                    <textarea
                      value={roomData.imagePrompt}
                      onChange={handlePromptChange}
                      className={`w-full h-full p-3 pr-10 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none ${
                        isDarkTheme
                          ? "bg-gray-800 border-gray-700 text-white focus:border-purple-500"
                          : "bg-white border-gray-200 text-gray-900 focus:border-purple-500"
                      } transition-all duration-300`}
                      placeholder="Paint your imagination with words... (e.g., 'A whimsical forest with glowing mushrooms')"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">✨</span>
                  </div>
                  <div className="flex justify-end mt-2 h-6">
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                      className={`px-4 py-1.5 rounded-full font-semibold transition-all duration-300 text-sm ${
                        isGenerating
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                      }`}
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                    </button>
                  </div>
                  {error && <div className="text-red-500 text-center text-xs mt-1">{error}</div>}
                </>
              )}
            </div>
            <div className="flex flex-col">
              <div className="relative">
                <div className="absolute -top-6 right-0 z-10">
                  <h3 className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                    Sneak Peek
                  </h3>
                </div>
                <div
                  className={`relative rounded-xl overflow-hidden border-2 flex-1 ${
                    isDarkTheme ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
                  }`}
                  style={{ minHeight: '200px' }}
                >
                  {roomData.imagePreview ? (
                    <canvas ref={canvasRef} className="w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                      <p className="text-center px-4 text-xs">
                        {activeTab === "upload"
                          ? "Upload to unveil your masterpiece!"
                          : "Craft a prompt to conjure an image!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStation;