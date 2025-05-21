import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, SphereSettingsMap } from '../types';
import { groupAchievementsByDateAndSphere } from '../utils/parseInput';
import CalendarCell from './CalendarCell';
import SphereHeader from './SphereHeader';

interface CalendarProps {
  achievements: Achievement[];
  onDeleteAchievement: (id: string) => void;
  sphereSettings: SphereSettingsMap;
  onMoveSphere: (sphere: string, direction: 'left' | 'right') => void;
}

const Calendar: React.FC<CalendarProps> = ({
  achievements,
  onDeleteAchievement,
  sphereSettings,
  onMoveSphere
}) => {
  const [collapsedSphere, setCollapsedSphere] = useState<string | null>(null);
  const [collapsedDate, setCollapsedDate] = useState<string | null>(null);
  
  const { dates, spheres: unsortedSpheres, achievementMap } = groupAchievementsByDateAndSphere(achievements);

  // Sort spheres based on their order
  const spheres = unsortedSpheres.sort((a, b) => {
    return (sphereSettings[a]?.order ?? 0) - (sphereSettings[b]?.order ?? 0);
  });

  const toggleSphere = (sphere: string) => {
    setCollapsedSphere(current => current === sphere ? null : sphere);
    setCollapsedDate(null);
  };

  const toggleDate = (date: string) => {
    setCollapsedDate(current => current === date ? null : date);
    setCollapsedSphere(null);
  };

  const getVisibleDates = () => {
    if (collapsedSphere) {
      return dates.filter(date => achievementMap[date][collapsedSphere]?.length > 0);
    }
    return dates;
  };

  const getVisibleSpheres = () => {
    if (collapsedDate) {
      return spheres.filter(sphere => achievementMap[collapsedDate][sphere]?.length > 0);
    }
    if (collapsedSphere) {
      return [collapsedSphere];
    }
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

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="overflow-hidden shadow-sm border border-gray-200 rounded-lg">
          <motion.div 
            className="grid"
            layout
            style={{ 
              gridTemplateColumns: `150px repeat(${visibleSpheres.length}, minmax(200px, 1fr))`,
              transition: 'all 0.3s ease-in-out'
            }}
          >
            {/* Header Row */}
            <div className="p-2 font-semibold text-center border-b border-r border-gray-300 bg-gray-50 sticky left-0 z-10">
              Date
            </div>
            
            {visibleSpheres.map((sphere, index) => (
              <motion.div
                key={sphere}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SphereHeader 
                  sphere={sphere} 
                  onClick={() => toggleSphere(sphere)}
                  isCollapsed={collapsedSphere === sphere}
                  onMoveLeft={index > 0 ? () => onMoveSphere(sphere, 'left') : undefined}
                  onMoveRight={index < visibleSpheres.length - 1 ? () => onMoveSphere(sphere, 'right') : undefined}
                  color={sphereSettings[sphere]?.color || 'bg-gray-100'}
                />
              </motion.div>
            ))}
            
            {/* Calendar Rows */}
            {visibleDates.map((date) => (
              <React.Fragment key={date}>
                {/* Date Column (sticky) */}
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-2 border-r border-b border-gray-200 bg-gray-50 sticky left-0 cursor-pointer hover:bg-gray-100 ${
                    collapsedDate === date ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => toggleDate(date)}
                >
                  {date}
                </motion.div>
                
                {/* Achievement Cells */}
                {visibleSpheres.map((sphere) => (
                  <motion.div
                    key={`${date}-${sphere}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CalendarCell
                      achievements={achievementMap[date][sphere] || []}
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