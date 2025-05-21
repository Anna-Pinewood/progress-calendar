export function parseInput(input: string): { sphere: string; text: string } | null {
  const match = input.match(/^([^:]+):\s*(.+)$/);
  if (!match) return null;

  const [, sphere, text] = match;
  return { sphere: sphere.trim().toUpperCase(), text: text.trim() };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function groupAchievementsByDateAndSphere(achievements: Achievement[]): AchievementsByDateAndSphere {
  if (achievements.length === 0) {
    return { dates: [], spheres: [], achievementMap: {} };
  }

  const achievementDates = achievements.map(a => new Date(a.date));
  const minDate = new Date(Math.min(...achievementDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...achievementDates.map(d => d.getTime())));

  const allDatesInRange: string[] = [];
  let currentDate = new Date(minDate);

  while (currentDate <= maxDate) {
    allDatesInRange.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dates = allDatesInRange.sort((a, b) => {
    // Sort dates in descending order (newest first)
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const spheres = [...new Set(achievements.map(a => a.sphere))];

  const achievementMap: Record<string, Record<string, Achievement[]>> = {};

  // Initialize the map
  dates.forEach(date => {
    achievementMap[date] = {};
    spheres.forEach(sphere => {
      achievementMap[date][sphere] = [];
    });
  });

  // Fill the map with achievements
  achievements.forEach(achievement => {
    if (!achievementMap[achievement.date]) {
      achievementMap[achievement.date] = {};
    }

    if (!achievementMap[achievement.date][achievement.sphere]) {
      achievementMap[achievement.date][achievement.sphere] = [];
    }

    achievementMap[achievement.date][achievement.sphere].push(achievement);
  });

  return { dates, spheres, achievementMap };
}