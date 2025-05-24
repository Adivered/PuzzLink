import React, { useState } from 'react';
import {
  PencilIcon,
  PaintBrushIcon,
  Square3Stack3DIcon,
  SwatchIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  EyeDropperIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const WhiteboardToolbar = ({
  tool,
  color,
  size,
  opacity,
  onToolChange,
  onClear,
  onUndo,
  zoom,
  onZoomChange,
  isDarkTheme
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState('favorites');

  const tools = [
    { id: 'pen', name: 'Pen', icon: PencilIcon },
    { id: 'brush', name: 'Brush', icon: PaintBrushIcon },
    { id: 'highlighter', name: 'Highlighter', icon: SwatchIcon },
    { id: 'eraser', name: 'Eraser', icon: Square3Stack3DIcon },
  ];

  // Organized color palettes
  const colorPalettes = {
    favorites: {
      name: 'Favorites',
      icon: SparklesIcon,
      colors: [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
      ]
    },
    basic: {
      name: 'Basic',
      icon: SwatchIcon,
      colors: [
        '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF',
        '#FF0000', '#800000', '#FFFF00', '#808000', '#00FF00',
        '#008000', '#00FFFF', '#008080', '#0000FF', '#000080',
        '#FF00FF', '#800080', '#FFA500', '#A52A2A', '#FFC0CB'
      ]
    },
    warm: {
      name: 'Warm',
      icon: SparklesIcon,
      colors: [
        '#FF6B6B', '#FF8E53', '#FF6B35', '#FFD93D', '#F4D03F',
        '#FF9FF3', '#FF73FA', '#F8BBD9', '#EC7063', '#E74C3C',
        '#D35400', '#E67E22', '#F39C12', '#F1C40F', '#FDE68A'
      ]
    },
    cool: {
      name: 'Cool',
      icon: SparklesIcon,
      colors: [
        '#74B9FF', '#0984E3', '#6C5CE7', '#A29BFE', '#00B894',
        '#00CEC9', '#55A3FF', '#26DE81', '#45B7D1', '#96CEB4',
        '#81ECEC', '#74B9FF', '#A29BFE', '#DDA0DD', '#E0B4D6'
      ]
    },
    nature: {
      name: 'Nature',
      icon: SparklesIcon,
      colors: [
        '#27AE60', '#2ECC71', '#58D68D', '#82E0AA', '#A9DFBF',
        '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460',
        '#87CEEB', '#4682B4', '#5F9EA0', '#708090', '#2F4F4F'
      ]
    },
    pastel: {
      name: 'Pastel',
      icon: SparklesIcon,
      colors: [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#E6E6FA', '#F0E68C', '#DDA0DD', '#98FB98', '#F5DEB3',
        '#FFE4E1', '#E0FFFF', '#F0F8FF', '#FFEFD5', '#FDF5E6'
      ]
    }
  };

  const sizes = [1, 2, 4, 6, 8, 12, 16, 20, 24, 32];

  const handleToolSelect = (toolId) => {
    onToolChange(toolId);
  };

  const handleColorSelect = (newColor) => {
    onToolChange(tool, newColor);
    setShowColorPicker(false);
  };

  const handleSizeSelect = (newSize) => {
    onToolChange(tool, color, newSize);
    setShowSizePicker(false);
  };

  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    onToolChange(tool, color, size, newOpacity);
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom / 1.2, 0.1));
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  const ColorPalette = ({ palette }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {palette.colors.map((c, index) => (
          <button
            key={`${c}-${index}`}
            onClick={() => handleColorSelect(c)}
            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg ${
              color === c 
                ? 'border-blue-500 shadow-lg scale-110' 
                : isDarkTheme ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-500'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${
      isDarkTheme 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Left Section - Drawing Tools */}
      <div className="flex items-center space-x-2">
        {/* Tool Selection */}
        <div className="flex items-center space-x-1 mr-4">
          {tools.map((t) => {
            const IconComponent = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => handleToolSelect(t.id)}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  tool === t.id
                    ? isDarkTheme
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : isDarkTheme
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={t.name}
              >
                <IconComponent className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Enhanced Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`relative w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              isDarkTheme ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-500'
            }`}
            style={{ backgroundColor: color }}
            title="Choose Color"
          >
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full opacity-80">
              <SparklesIcon className="w-3 h-3 text-white m-0.5" />
            </div>
          </button>
          
          {showColorPicker && (
            <div className={`absolute top-12 left-0 z-50 w-80 p-4 rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
              isDarkTheme 
                ? 'bg-gray-800/95 border-gray-700' 
                : 'bg-white/95 border-gray-200'
            }`}>
              {/* Color Palette Tabs */}
              <div className="flex flex-wrap gap-1 mb-4 p-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg">
                {Object.entries(colorPalettes).map(([key, palette]) => {
                  const IconComponent = palette.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveColorTab(key)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                        activeColorTab === key
                          ? isDarkTheme
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : isDarkTheme
                            ? 'hover:bg-gray-600 text-gray-300'
                            : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <IconComponent className="w-3 h-3" />
                      <span>{palette.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Color Palette */}
              <ColorPalette palette={colorPalettes[activeColorTab]} />

              {/* Custom Color Picker */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <EyeDropperIcon className={`w-4 h-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                    Custom Color
                  </span>
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-full mt-2 h-10 rounded-lg border-0 cursor-pointer"
                  style={{ backgroundColor: color }}
                />
                
                {/* Color Input Field */}
                <input
                  type="text"
                  value={color.toUpperCase()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                      if (value.length === 7) {
                        handleColorSelect(value);
                      }
                    }
                  }}
                  className={`w-full mt-2 px-3 py-2 text-sm font-mono rounded-lg border transition-colors ${
                    isDarkTheme
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-300 text-gray-800 focus:border-blue-500'
                  }`}
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Size Picker */}
        <div className="relative">
          <button
            onClick={() => setShowSizePicker(!showSizePicker)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
              isDarkTheme
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Brush Size"
          >
            {size}px
          </button>
          {showSizePicker && (
            <div className={`absolute top-10 left-0 z-50 p-3 rounded-lg shadow-lg transition-all duration-300 ${
              isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeSelect(s)}
                    className={`px-2 py-1 rounded text-sm transition-all duration-200 hover:scale-105 ${
                      size === s
                        ? isDarkTheme
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDarkTheme
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            Opacity:
          </span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={handleOpacityChange}
            className={`w-20 h-2 rounded-lg cursor-pointer appearance-none ${
              isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            style={{
              background: `linear-gradient(to right, ${color}20 0%, ${color} 100%)`,
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          />
          <span className={`text-sm w-8 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>

      {/* Right Section - Actions and Zoom */}
      <div className="flex items-center space-x-2">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={handleZoomOut}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDarkTheme
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomReset}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
              isDarkTheme
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDarkTheme
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onUndo}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            isDarkTheme
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title="Undo"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={onClear}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            isDarkTheme
              ? 'bg-red-700 hover:bg-red-600 text-red-300'
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          }`}
          title="Clear All"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WhiteboardToolbar; 