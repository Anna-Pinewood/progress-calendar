import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LoginForm from './components/LoginForm';
import AchievementForm from './components/AchievementForm';
import Calendar from './components/Calendar';
import ColorPicker from './components/ColorPicker';
import { Achievement, SphereSettingsMap } from './types';
import { formatDate } from './utils/parseInput';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sphereSettings, setSphereSettings] = useState<SphereSettingsMap>({});

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleAddAchievement = (sphere: string, text: string) => {
    const newAchievement: Achievement = {
      id: uuidv4(),
      date: formatDate(new Date()),
      sphere,
      text,
    };
    
    setAchievements([...achievements, newAchievement]);
    
    // Initialize sphere settings if not exists
    if (!sphereSettings[sphere]) {
      setSphereSettings(prev => ({
        ...prev,
        [sphere]: {
          color: '#f3f4f6', // Default color (gray-100)
          order: Object.keys(prev).length
        }
      }));
    }
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id));
  };

  const handleSphereColorChange = (sphere: string, color: string) => {
    setSphereSettings(prev => ({
      ...prev,
      [sphere]: {
        ...prev[sphere],
        color
      }
    }));
  };

  const handleMoveSphere = (sphere: string, direction: 'left' | 'right') => {
    const spheres = Object.keys(sphereSettings).sort(
      (a, b) => sphereSettings[a].order - sphereSettings[b].order
    );
    
    const currentIndex = spheres.indexOf(sphere);
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= spheres.length) return;
    
    const targetSphere = spheres[newIndex];
    
    setSphereSettings(prev => ({
      ...prev,
      [sphere]: {
        ...prev[sphere],
        order: prev[targetSphere].order
      },
      [targetSphere]: {
        ...prev[targetSphere],
        order: prev[sphere].order
      }
    }));
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const spheres = Object.keys(sphereSettings).sort(
    (a, b) => sphereSettings[a].order - sphereSettings[b].order
  );

  const sphereColors = Object.fromEntries(
    spheres.map(sphere => [sphere, sphereSettings[sphere].color])
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Achievement Calendar</h1>
        
        <AchievementForm onAddAchievement={handleAddAchievement} />
        
        {spheres.length > 0 && (
          <div className="mb-6">
            <ColorPicker
              spheres={spheres}
              colors={sphereColors}
              onChange={handleSphereColorChange}
            />
          </div>
        )}
        
        <Calendar 
          achievements={achievements} 
          onDeleteAchievement={handleDeleteAchievement}
          sphereSettings={sphereSettings}
          onMoveSphere={handleMoveSphere}
        />
        
        <div className="mt-4 text-sm text-gray-500">
          Right-click on an achievement to delete it.
        </div>
      </div>
    </div>
  );
}

export default App;