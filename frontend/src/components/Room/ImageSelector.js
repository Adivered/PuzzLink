import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect";
import { PhotoIcon } from "@heroicons/react/24/outline";

const ImageSelector = ({ currentImage, onSelectImage, isDarkTheme }) => {
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const imageRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelectImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedImage = `https://picsum.photos/seed/${imagePrompt}/800/600`;
      onSelectImage(generatedImage);
      setIsGenerating(false);
      setImagePrompt("");

      gsap.from(imageRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        ease: "expo.out",
      });
    }, 2000);
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-white">Update Game Image</h3>
      <div className="flex space-x-2">
        <label className="flex-grow">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div
            className={`p-3 rounded-lg border flex items-center space-x-2 cursor-pointer ${
              isDarkTheme
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800"
            } hover:bg-opacity-80 transition duration-300`}
          >
            <PhotoIcon className="w-5 h-5" />
            <span>Upload Image</span>
          </div>
        </label>
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Enter prompt for image generation"
          className={`flex-grow p-3 rounded-lg border ${
            isDarkTheme
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-800"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className={`px-4 py-3 rounded-lg font-medium transition duration-300 ${
            isGenerating
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>
      {currentImage && (
        <div className="mt-4">
          <img
            ref={imageRef}
            src={currentImage}
            alt="Selected game"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ImageSelector;