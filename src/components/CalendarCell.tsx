import React from 'react';
import { Achievement } from '../types';

interface CalendarCellProps {
  achievements: Achievement[];
  onDelete: (id: string) => void;
  color: string;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ achievements, onDelete, color }) => {
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onDelete(id);
  };

  if (achievements.length === 0) {
    return <div className="border border-gray-200 p-2 min-h-[60px]"></div>;
  }

  return (
    <div className="border border-gray-200 p-2 min-h-[60px] bg-white">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="text-sm p-1 mb-1 rounded hover:bg-opacity-80 transition-colors"
          style={{ backgroundColor: color }}
          onContextMenu={(e) => handleContextMenu(e, achievement.id)}
        >
          {achievement.text}
        </div>
      ))}
    </div>
  );
};

export default CalendarCell;