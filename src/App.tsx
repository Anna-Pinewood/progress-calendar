import React, { useState, useEffect, useCallback } from 'react';
import LoginForm from './components/LoginForm';
import AchievementForm from './components/AchievementForm';
import Calendar from './components/Calendar';
import ColorPicker from './components/ColorPicker';
import ReportModal from './components/ReportModal';
import GoalsModal from './components/GoalsModal';
import RandomQuote from './components/RandomQuote';
import TickAnimation from './components/TickAnimation';
import { Achievement, SphereSettingsMap, SphereSetting } from './types';
import { formatDate } from './utils/parseInput';
import { AnimatePresence } from 'framer-motion';

// Define a type for the raw sphere data from the API
interface ApiSphere {
  id: number;
  name: string;
  color: string | null; // color can be null
  position: number; // API uses 'position'
}

// Define a type for the raw achievement data from the API
interface ApiAchievement {
  id: number;
  datetime: string; // API uses 'datetime'
  text: string;
  sphere_id: number; // Foreign key
  // Assuming API returns sphere_name and sphere_color as per plan "Связать с таблицей сфер..."
  sphere_name: string;
  // sphere_color: string; // Not strictly needed if we use sphereSettings for color display
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sphereSettings, setSphereSettings] = useState<SphereSettingsMap>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState<string>(formatDate(new Date()));
  const [generatedReportText, setGeneratedReportText] = useState<string>('');
  const [sortedSphereNames, setSortedSphereNames] = useState<string[]>([]);
  const [showTick, setShowTick] = useState(false);

  const fetchSpheres = useCallback(async () => {
    if (!isAuthenticated) return;
    console.log('[App.tsx] Fetching spheres...');
    try {
      const response = await fetch(`${API_BASE_URL}/spheres`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiSphere[] = await response.json();
      console.log('[App.tsx] Raw spheres data from API:', data);
      const newSphereSettings: SphereSettingsMap = {};
      data.forEach((sphere) => {
        newSphereSettings[sphere.name] = {
          id: sphere.id,
          color: sphere.color || '#f3f4f6',
          order: sphere.position,
        };
      });
      console.log('[App.tsx] Processed sphereSettings to be set:', newSphereSettings);
      setSphereSettings(newSphereSettings);
      setSortedSphereNames(Object.keys(newSphereSettings).sort((a, b) => newSphereSettings[a].order - newSphereSettings[b].order));
    } catch (error) {
      console.error("Failed to fetch spheres:", error);
      setSphereSettings({}); // Clear on error
    }
  }, [isAuthenticated]);

  const fetchAchievements = useCallback(async () => {
    if (!isAuthenticated) return;
    console.log('[App.tsx] Fetching achievements...');
    try {
      const response = await fetch(`${API_BASE_URL}/achievements`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiAchievement[] = await response.json();
      console.log('[App.tsx] Raw achievements data from API:', data);
      const formattedAchievements: Achievement[] = data.map(ach => {
        // Add a check for ach.datetime
        const dateString = (ach.datetime && typeof ach.datetime === 'string')
          ? ach.datetime.split('T')[0]
          : formatDate(new Date()); // Fallback to today if datetime is invalid/null
        return {
          id: ach.id,
          date: dateString,
          sphere: ach.sphere_name,
          text: ach.text,
        };
      }).filter(ach => ach.sphere && ach.text); // Also ensure sphere_name and text are present
      console.log('[App.tsx] Processed achievements to be set:', formattedAchievements);
      setAchievements(formattedAchievements);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      setAchievements([]); // Clear on error
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSpheres();
      fetchAchievements();
    }
  }, [isAuthenticated, fetchSpheres, fetchAchievements]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleAddAchievement = async (sphereNameFromInput: string, text: string) => {
    const newAchievementData = {
      date: formatDate(new Date()),
      sphere_name: sphereNameFromInput,
      text,
    };
    console.log('[App.tsx] Attempting to add achievement:', newAchievementData);
    try {
      const response = await fetch(`${API_BASE_URL}/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAchievementData),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[App.tsx] Add achievement API error response:', errorBody);
        throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
      }
      console.log('[App.tsx] Achievement added successfully via API, refetching data...');
      await fetchAchievements();
      await fetchSpheres();
      setShowTick(true);
      setTimeout(() => setShowTick(false), 2000);
      console.log('[App.tsx] Data refetched after adding achievement.');
    } catch (error) {
      console.error("Failed to add achievement:", error);
    }
  };

  const handleDeleteAchievement = async (achievementId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements/${achievementId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setAchievements(prevAchievements => prevAchievements.filter(ach => ach.id !== achievementId));
    } catch (error) {
      console.error("Failed to delete achievement:", error);
    }
  };

  const handleSphereColorChange = async (sphereName: string, color: string) => {
    const sphereToUpdate = sphereSettings[sphereName];
    if (!sphereToUpdate || sphereToUpdate.id === undefined) {
      console.error("Sphere not found or missing ID for color change:", sphereName);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/spheres/${sphereToUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ color }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSphereSettings(prev => ({
        ...prev,
        [sphereName]: {
          ...prev[sphereName],
          color
        }
      }));
    } catch (error) {
      console.error("Failed to update sphere color:", error);
    }
  };

  const handleMoveSphere = async (sphereName: string, direction: 'left' | 'right') => {
    const currentSpheresArray = Object.entries(sphereSettings)
      .map(([name, settings]) => ({ name, ...settings }))
      .sort((a, b) => a.order - b.order);

    const currentIndex = currentSpheresArray.findIndex(s => s.name === sphereName);
    if (currentIndex === -1) return;

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= currentSpheresArray.length) return;

    const sphereToMove = currentSpheresArray[currentIndex];
    const targetSphere = currentSpheresArray[newIndex];

    // New positions
    const newPositionForMovedSphere = targetSphere.order;
    const newPositionForTargetSphere = sphereToMove.order;

    try {
      // API calls to update sphere positions (order)
      await Promise.all([
        fetch(`${API_BASE_URL}/spheres/${sphereToMove.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: newPositionForMovedSphere }),
        }),
        fetch(`${API_BASE_URL}/spheres/${targetSphere.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: newPositionForTargetSphere }),
        }),
      ]);

      // Update local state to reflect the change immediately
      // More robust would be to refetchSpheres(), but this is more responsive
      setSphereSettings(prev => {
        const newSettings = { ...prev };
        newSettings[sphereToMove.name] = { ...newSettings[sphereToMove.name], order: newPositionForMovedSphere };
        newSettings[targetSphere.name] = { ...newSettings[targetSphere.name], order: newPositionForTargetSphere };
        return newSettings;
      });
      // Optionally, refetch spheres to ensure full consistency if other properties might change
      // await fetchSpheres(); 

    } catch (error) {
      console.error("Failed to move sphere:", error);
    }
  };

  const handleGenerateReport = () => {
    const startDate = new Date(reportStartDate);
    const filteredAchievements = achievements.filter(ach => {
      const achDate = new Date(ach.date);
      return achDate >= startDate;
    });

    if (filteredAchievements.length === 0) {
      setGeneratedReportText("No achievements found from the selected date.");
      setIsReportModalOpen(true);
      return;
    }

    const achievementsBySphere: { [key: string]: string[] } = {};
    filteredAchievements.forEach(ach => {
      if (!achievementsBySphere[ach.sphere]) {
        achievementsBySphere[ach.sphere] = [];
      }
      achievementsBySphere[ach.sphere].push(ach.text);
    });

    let report = "";
    // Use sortedSphereNames from component scope to maintain the order from the UI
    sortedSphereNames.forEach(sphereName => {
      if (achievementsBySphere[sphereName]) {
        report += `- ${sphereName.toUpperCase()}:\n`;
        achievementsBySphere[sphereName].forEach(text => {
          report += `\t- ${text}\n`;
        });
        report += `\n`; // Add a newline between spheres
      }
    });

    setGeneratedReportText(report.trim());
    setIsReportModalOpen(true);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generatedReportText)
      .then(() => console.log("Report copied to clipboard!"))
      .catch(err => console.error("Failed to copy report: ", err));
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // This is passed to ColorPicker, which expects an array of sphere names
  // and an object mapping sphere names to colors.
  const sphereColorsForPicker = Object.fromEntries(
    sortedSphereNames.map(name => [name, sphereSettings[name].color])
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <RandomQuote />
      <AnimatePresence>
        {showTick && <TickAnimation />}
      </AnimatePresence>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Achievement Calendar</h1>

        <AchievementForm onAddAchievement={handleAddAchievement} />

        <div className="my-6 flex flex-col sm:flex-row sm:items-end sm:justify-between">
          {sortedSphereNames.length > 0 && (
            <div className="mb-4 sm:mb-0 sm:mr-4">
              <ColorPicker
                spheres={sortedSphereNames}
                colors={sphereColorsForPicker}
                onChange={handleSphereColorChange}
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
            <div>
              <label htmlFor="report-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Report Start Date:
              </label>
              <input
                type="date"
                id="report-start-date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              />
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-green-200 text-green-800 rounded-md hover:bg-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 self-end sm:self-auto"
            >
              Create a Report
            </button>
            <button
              onClick={() => setIsGoalsModalOpen(true)}
              className="px-4 py-2 bg-purple-200 text-purple-800 rounded-md hover:bg-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 self-end sm:self-auto"
            >
              Мои цели
            </button>
          </div>
        </div>

        <Calendar
          achievements={achievements}
          onDeleteAchievement={handleDeleteAchievement}
          sphereSettings={sphereSettings}
          onMoveSphere={handleMoveSphere}
        />

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportText={generatedReportText}
          onCopy={handleCopyReport}
        />

        <GoalsModal
          isOpen={isGoalsModalOpen}
          onClose={() => setIsGoalsModalOpen(false)}
        />

        <div className="mt-4 text-sm text-gray-500">
          Right-click on an achievement to delete it.
        </div>
      </div>
    </div>
  );
}

export default App;