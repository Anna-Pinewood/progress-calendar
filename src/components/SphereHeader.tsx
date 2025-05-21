import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SphereHeaderProps {
  sphere: string;
  onClick: () => void;
  isCollapsed: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  color: string;
}

const SphereHeader: React.FC<SphereHeaderProps> = ({
  sphere,
  onClick,
  isCollapsed,
  onMoveLeft,
  onMoveRight,
  color
}) => {
  return (
    <div 
      className={`relative p-2 font-semibold text-center border-b border-gray-300 cursor-pointer hover:bg-opacity-80 transition-colors duration-200 group ${
        isCollapsed ? 'bg-opacity-80' : ''
      }`}
      style={{ backgroundColor: color }}
    >
      {onMoveLeft && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft();
          }}
          className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      
      <span onClick={onClick}>{sphere}</span>
      
      {onMoveRight && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight();
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SphereHeader;