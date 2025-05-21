import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ChevronDown } from 'lucide-react';

interface ColorPickerProps {
  spheres: string[];
  colors: Record<string, string>;
  onChange: (sphere: string, color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ spheres, colors, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSphereSelect = (sphere: string) => {
    setSelectedSphere(sphere);
    setIsOpen(false);
  };

  const handleColorChange = (color: string) => {
    if (selectedSphere) {
      onChange(selectedSphere, color);
    }
  };

  return (
    <div className="relative inline-block text-left mb-4">
      <div ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          {selectedSphere || "Select Sphere"}
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {selectedSphere && (
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="ml-2 w-8 h-8 rounded-full border border-gray-300"
            style={{ backgroundColor: colors[selectedSphere] || '#ffffff' }}
          />
        )}

        {isOpen && (
          <div className="absolute z-30 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {spheres.map((sphere) => (
                <button
                  key={sphere}
                  onClick={() => handleSphereSelect(sphere)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: colors[sphere] || '#ffffff' }}
                    />
                    {sphere}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showColorPicker && selectedSphere && (
        <div
          ref={colorPickerRef}
          className="absolute z-40 mt-2"
          style={{ top: '100%', left: '60px' }}
        >
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <HexColorPicker
              color={colors[selectedSphere] || '#ffffff'}
              onChange={handleColorChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;