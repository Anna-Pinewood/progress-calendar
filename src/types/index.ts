export interface Achievement {
  id: number;
  date: string;
  sphere: string;
  text: string;
}

export interface AchievementsByDateAndSphere {
  dates: string[];
  spheres: string[];
  achievementMap: Record<string, Record<string, Achievement[]>>;
}

export interface SphereSetting {
  id: number;
  color: string;
  order: number;
}

export type SphereSettingsMap = Record<string, SphereSetting>;