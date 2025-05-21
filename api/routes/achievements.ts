import express from 'express';
import { Achievement } from '../models'; // Assuming models.ts is in the parent directory

const router = express.Router();

let achievements: Achievement[] = []; // In-memory store for now, replace with DB interaction

// Get all achievements
router.get('/', (req, res) => {
    res.json(achievements);
});

// Get a specific achievement by ID
router.get('/:id', (req, res) => {
    const achievement = achievements.find(a => a.id === parseInt(req.params.id));
    if (achievement) {
        res.json(achievement);
    } else {
        res.status(404).send('Achievement not found');
    }
});

// Create a new achievement
router.post('/', (req, res) => {
    const newAchievement: Achievement = {
        id: achievements.length > 0 ? Math.max(...achievements.map(a => a.id)) + 1 : 1, // Simple ID generation
        sphere_id: req.body.sphere_id,
        datetime: new Date(req.body.datetime),
        text: req.body.text
    };
    achievements.push(newAchievement);
    res.status(201).json(newAchievement);
});

// Update an existing achievement
router.put('/:id', (req, res) => {
    const achievementIndex = achievements.findIndex(a => a.id === parseInt(req.params.id));
    if (achievementIndex !== -1) {
        achievements[achievementIndex] = {
            ...achievements[achievementIndex],
            sphere_id: req.body.sphere_id ?? achievements[achievementIndex].sphere_id,
            datetime: req.body.datetime ? new Date(req.body.datetime) : achievements[achievementIndex].datetime,
            text: req.body.text ?? achievements[achievementIndex].text
        };
        res.json(achievements[achievementIndex]);
    } else {
        res.status(404).send('Achievement not found');
    }
});

// Delete an achievement
router.delete('/:id', (req, res) => {
    const achievementIndex = achievements.findIndex(a => a.id === parseInt(req.params.id));
    if (achievementIndex !== -1) {
        achievements.splice(achievementIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Achievement not found');
    }
});

export default router; 