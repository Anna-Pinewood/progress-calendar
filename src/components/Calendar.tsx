import React, { useState } from 'react';
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

const MAX_VISIBLE_SPHERES = 8; // Define the maximum number of visible spheres

const Calendar: React.FC<CalendarProps> = ({
  achievements,
  onDeleteAchievement,
  sphereSettings,
  onMoveSphere
}) => {
  const [collapsedSphere, setCollapsedSphere] = useState<string | null>(null);
  const [collapsedDate, setCollapsedDate] = useState<string | null>(null);

  const { dates, spheres: unsortedSpheres, achievementMap } = groupAchievementsByDateAndSphere(achievements);

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
    setCollapsedDate(null);
  };

  const toggleDate = (date: string) => {
    setCollapsedDate(current => current === date ? null : date);
    setCollapsedSphere(null); // Allow collapsing date even if a sphere is selected
  };

  const getVisibleDates = () => {
    if (collapsedSphere) {
      return dates.filter((date: string) => achievementMap[date][collapsedSphere!]?.length > 0);
    }
    return dates;
  };

  const getVisibleSpheres = () => {
    if (collapsedDate) {
      return spheres.filter((sphere: string) => achievementMap[collapsedDate!][sphere]?.length > 0);
    }
    if (collapsedSphere) {
      return [collapsedSphere];
    }
    // No slicing here, the scroll container will handle it.
    return spheres;
  };

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No achievements yet. Add your first achievement above!
      </div>
    );
  }

  const visibleDates = getVisibleDates();
  const visibleSpheres = getVisibleSpheres();
  const displayedSpheres = collapsedSphere ? [collapsedSphere] : spheres;

  return (
    <div className="overflow-hidden shadow-sm border border-gray-200 rounded-lg">
      <div className="flex"> {/* Flex container for sticky date and scrollable spheres */}
        {/* Date Column Header and Cells (Sticky) */}
        <div className="sticky left-0 z-20 bg-gray-50 flex flex-col">
          {/* Header for Date Column */}
          <div className="p-2 font-semibold text-center border-b border-r border-gray-300 h-[65px] flex items-center justify-center min-w-[150px]">
            Date
          </div>
          {/* Date Cells */}
          {visibleDates.map((date: string) => (
            <motion.div
              key={date}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-2 border-r border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 min-h-[60px] flex items-center min-w-[150px] ${collapsedDate === date ? 'bg-gray-100 font-semibold' : ''
                }`}
              onClick={() => toggleDate(date)}
              style={{ minHeight: collapsedSphere && !achievementMap[date][collapsedSphere!]?.length ? '0px' : '60px' }} // Adjust height for empty cells when sphere is collapsed
            >
              {formatDate(date)}
            </motion.div>
          ))}
        </div>

        {/* Scrollable Container for Sphere Headers and Cells */}
        <div className="overflow-x-auto flex-grow">
          <motion.div
            className="grid"
            layout
            style={{
              // Adjust gridTemplateColumns: Date column is handled by its own div.
              // We now manage columns for spheres. We ensure at least one column or up to MAX_VISIBLE_SPHERES if not collapsed.
              // If a sphere is collapsed, it shows 1 column. Otherwise, it shows up to MAX_VISIBLE_SPHERES or all if less.
              gridTemplateColumns: `repeat(${collapsedSphere ? 1 : Math.min(visibleSpheres.length, MAX_VISIBLE_SPHERES)}, minmax(200px, 1fr))`,
              // Ensure the grid itself can expand to hold all spheres if not collapsed.
              // The parent 'overflow-x-auto' will handle the scrolling.
              minWidth: collapsedSphere ? '200px' : `${visibleSpheres.length * 200}px`,
              transition: 'grid-template-columns 0.3s ease-in-out'
            }}
          >
            {/* Sphere Headers */}
            {displayedSpheres.map((sphere: string, index: number) => (
              <motion.div
                key={sphere}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`${collapsedSphere && sphere !== collapsedSphere ? 'hidden' : ''}`}
              >
                <SphereHeader
                  sphere={sphere}
                  onClick={() => toggleSphere(sphere)}
                  isCollapsed={collapsedSphere === sphere}
                  onMoveLeft={!collapsedSphere && index > 0 ? () => onMoveSphere(sphere, 'left') : undefined}
                  onMoveRight={!collapsedSphere && index < displayedSpheres.length - 1 ? () => onMoveSphere(sphere, 'right') : undefined}
                  color={sphereSettings[sphere]?.color || 'bg-gray-100'}
                />
              </motion.div>
            ))}

            {/* Calendar Rows (Cells for Spheres) */}
            {visibleDates.map((date: string) => (
              <React.Fragment key={`${date}-spheres`}>
                {displayedSpheres.map((sphere: string) => (
                  <motion.div
                    key={`${date}-${sphere}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${collapsedSphere && sphere !== collapsedSphere ? 'hidden' : ''} ${collapsedDate && !achievementMap[date][sphere]?.length ? 'hidden' : ''}`}
                    style={{ minHeight: collapsedSphere && !achievementMap[date][collapsedSphere!]?.length ? '0px' : 'auto' }}
                  >
                    <CalendarCell
                      achievements={achievementMap[date]?.[sphere] || []}
                      onDelete={onDeleteAchievement}
                      color={sphereSettings[sphere]?.color || 'bg-gray-100'}
                    />
                  </motion.div>
                ))}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;