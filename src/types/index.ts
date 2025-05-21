export interface Achievement {
  id: string;
  date: string;
  sphere: string;
  text: string;
}

export interface AchievementsByDateAndSphere {
  dates: string[];
  spheres: string[];
  achievementMap: Record<string, Record<string, Achievement[]>>;
}

export interface SphereSettings {
  color: string;
  order: number;
}

export type SphereSettingsMap = Record<string, SphereSettings>;