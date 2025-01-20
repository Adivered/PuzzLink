import React, { useState } from 'react';
import { gsap } from 'gsap';

const ImageSelector = ({ currentImage, onSelectImage }) => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
    // Simulating image generation
    setTimeout(() => {
      const generatedImage = `https://picsum.photos/seed/${imagePrompt}/800/600`;
      onSelectImage(generatedImage);
      setIsGenerating(false);
      setImagePrompt('');
      
      gsap.from('#generated-image', {
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: 'back.out(1.7)'
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">Game Image</h3>
      <div className="flex space-x-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="flex-grow p-2 border rounded text-gray-800"
        />
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Enter prompt for image generation"
          className="flex-grow p-2 border rounded text-gray-800"
        />
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
            isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {currentImage && (
        <div className="mt-4">
          <img
            id="generated-image"
            src={currentImage}
            alt="Selected game"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ImageSelector;