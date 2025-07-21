import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, SphereSettingsMap } from '../types';
import { groupAchievementsByDateAndSphere } from '../utils/parseInput';
import CalendarCell from './CalendarCell';
import SphereHeader from './SphereHeader';

interface CalendarProps {
  achievements: Achievement[];
  onDeleteAchievement: (id: number) => void;
  sphereSettings: SphereSettingsMap;
  onMoveSphere: (sphere: string, direction: 'left' | 'right') => void;
}

const SPHERE_COLUMN_WIDTH_PX = 250; // Define the width for each sphere column
const CUTOFF_DATE = '2025-07-21'; // Date from which to apply cutoff color
const CUTOFF_COLOR = 'bg-blue-50'; // Color to apply for dates >= CUTOFF_DATE

const Calendar: React.FC<CalendarProps> = ({
  achievements,
  onDeleteAchievement,
  sphereSettings,
  onMoveSphere
}) => {
  const [collapsedSphere, setCollapsedSphere] = useState<string | null>(null);
  const [collapsedDate, setCollapsedDate] = useState<string | null>(null);
  const [hoveredSphere, setHoveredSphere] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const { dates, spheres: unsortedSpheres, achievementMap } = groupAchievementsByDateAndSphere(achievements);

  // Helper function to check if a date should use cutoff color
  const shouldUseCutoffColor = (dateStr: string) => {
    return dateStr >= CUTOFF_DATE;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort spheres based on their order
  const spheres = unsortedSpheres.sort((a: string, b: string) => {
    return (sphereSettings[a]?.order ?? 0) - (sphereSettings[b]?.order ?? 0);
  });

  const toggleSphere = (sphere: string) => {
    setCollapsedSphere(current => current === sphere ? null : sphere);
    setCollapsedDate(null); // If a sphere is toggled, uncollapse any date
  };

  const toggleDate = (date: string) => {
    setCollapsedDate(current => current === date ? null : date);
    setCollapsedSphere(null); // If a date is toggled, uncollapse any sphere
  };

  // Determine which spheres to actually render columns for
  let currentDisplayedSpheres: string[];
  if (collapsedSphere) {
    currentDisplayedSpheres = [collapsedSphere];
  } else if (collapsedDate) {
    // When a date is collapsed, show only spheres that have achievements on this date
    currentDisplayedSpheres = spheres.filter((sphere: string) => achievementMap[collapsedDate!]?.[sphere]?.length > 0);
  } else {
    currentDisplayedSpheres = spheres; // Show all spheres (sorted by order)
  }

  // Determine which dates to render rows for
  const visibleDates = useMemo(() => {
    let newVisibleDates = dates;
    if (collapsedSphere) {
      // Filter dates to only those that have achievements for the collapsed sphere
      newVisibleDates = dates.filter((date: string) => achievementMap[date]?.[collapsedSphere!]?.length > 0);
    }
    // If collapsedDate is active, we still show all dates initially, 
    // but currentDisplayedSpheres will be filtered, effectively showing less data horizontally.
    // The user's primary interaction for date filtering is clicking a date, which highlights it.
    // Actual filtering of dates (rows) is primarily driven by collapsedSphere.
    return newVisibleDates;
  }, [dates, collapsedSphere, achievementMap]);


  if (achievements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No achievements yet. Add your first achievement above!
      </div>
    );
  }

  const numDateCols = 1;
  const numActualSphereCols = currentDisplayedSpheres.length;

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `minmax(150px, auto) ${numActualSphereCols > 0 ? `repeat(${numActualSphereCols}, ${SPHERE_COLUMN_WIDTH_PX}px)` : ''}`,
    minWidth: `calc(150px + ${numActualSphereCols * SPHERE_COLUMN_WIDTH_PX}px)`, // Sum of min-widths for all actual spheres
    transition: 'grid-template-columns 0.3s ease-in-out', // Transition might be less relevant with fixed widths but can stay
  };

  return (
    <div className="overflow-hidden shadow-sm border border-gray-200 rounded-lg">
      <div className="overflow-x-auto"> {/* Scroll container for the entire grid */}
        <motion.div
          className="grid" // This class might be redundant if using style.display='grid'
          style={gridStyle}
          layout // Enable layout animations for the grid itself
        >
          {/* Row 1: HEADERS */}
          {/* Date Header (Sticky) */}
          <div className="sticky left-0 z-30 bg-gray-100 p-2 font-semibold text-center border-b border-r border-gray-300 min-h-[65px] flex items-center justify-center min-w-[150px]">
            Date
          </div>

          {/* Sphere Headers */}
          {currentDisplayedSpheres.map((sphere: string, index: number) => (
            <motion.div
              key={sphere}
              layout // Animate layout changes for sphere headers
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              // Wrapper div for SphereHeader, ensuring it's a grid item
              className="border-b border-r border-gray-300 min-h-[65px]" // Match date header style
              onMouseEnter={() => setHoveredSphere(sphere)}
              onMouseLeave={() => setHoveredSphere(null)}
            >
              <SphereHeader
                sphere={sphere}
                onClick={() => toggleSphere(sphere)}
                isCollapsed={collapsedSphere === sphere}
                onMoveLeft={!collapsedSphere && !collapsedDate && index > 0 ? () => onMoveSphere(sphere, 'left') : undefined}
                onMoveRight={!collapsedSphere && !collapsedDate && index < currentDisplayedSpheres.length - 1 ? () => onMoveSphere(sphere, 'right') : undefined}
                color={sphereSettings[sphere]?.color || 'bg-gray-100'}
              />
            </motion.div>
          ))}

          {/* Data Rows: Date Cell + Sphere Cells */}
          {visibleDates.map((date: string) => (
            <React.Fragment key={date}> {/* Each fragment's children form a conceptual grid row */}
              {/* Date Cell (Sticky) */}
              <motion.div
                key={`${date}-datecell`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`sticky left-0 z-20 bg-gray-50 p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-100 min-h-[60px] flex items-center min-w-[150px] ${collapsedDate === date ? 'bg-gray-100 font-semibold' : ''
                  }`}
                onClick={() => toggleDate(date)}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {formatDate(date)}
              </motion.div>

              {/* Sphere Cells for this date */}
              {currentDisplayedSpheres.map((sphere: string) => {
                const cellAchievements = achievementMap[date]?.[sphere] || [];
                const isHighlighted = hoveredSphere === sphere || hoveredDate === date;
                const useCutoffColor = shouldUseCutoffColor(date);
                return (
                  <motion.div
                    key={`${date}-${sphere}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    // This motion.div is the grid cell. CalendarCell is its content.
                    // CalendarCell itself applies border and min-height.
                    // The className for hiding when a date is collapsed and cell is empty is removed
                    // as currentDisplayedSpheres handles column visibility, and empty cells will just render as empty.
                    className={`transition-colors duration-200 ${isHighlighted ? 'bg-gray-100' : 'bg-white'}`} // Ensure background for the cell area before CalendarCell's own background
                  >
                    <CalendarCell
                      achievements={cellAchievements}
                      onDelete={onDeleteAchievement}
                      color={sphereSettings[sphere]?.color || 'bg-gray-100'}
                      isHighlighted={isHighlighted}
                      useCutoffColor={useCutoffColor}
                      cutoffColor={CUTOFF_COLOR}
                    />
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;