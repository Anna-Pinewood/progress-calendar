export interface Sphere {
    id: number;
    name: string;
    color?: string; // Optional, as it has a default in the DB
    position?: number; // Optional
}

export interface Achievement {
    id: number;
    sphere_id: number;
    datetime: Date;
    text: string;
} 