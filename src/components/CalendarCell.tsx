import React, { useState } from 'react';
import { Achievement } from '../types';

interface CalendarCellProps {
  achievements: Achievement[];
  onDelete: (id: number) => void;
  color: string;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ achievements, onDelete, color }) => {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    onDelete(id);
  };

  const handleToggleExpand = (id: number) => {
    setExpandedIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(id)) {
        newIds.delete(id);
      } else {
        newIds.add(id);
      }
      return newIds;
    });
  };

  const TRUNCATE_LENGTH = 50; // Or any length you prefer

  if (achievements.length === 0) {
    return <div className="border border-gray-200 p-2 min-h-[60px] h-full"></div>;
  }

  return (
    <div className="border border-gray-200 p-2 min-h-[60px] h-full bg-white">
      {achievements.map((achievement) => {
        const isExpanded = expandedIds.has(achievement.id);
        const displayText =
          achievement.text.length <= TRUNCATE_LENGTH || isExpanded
            ? achievement.text
            : `${achievement.text.substring(0, TRUNCATE_LENGTH)}...`;

        return (
          <div
            key={achievement.id}
            className="text-sm p-1 mb-1 rounded hover:bg-opacity-80 transition-colors cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => handleToggleExpand(achievement.id)}
            onContextMenu={(e) => handleContextMenu(e, achievement.id)}
          >
            {displayText}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarCell;