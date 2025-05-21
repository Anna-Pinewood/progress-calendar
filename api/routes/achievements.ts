import express from 'express';
import pool from '../config/database'; // Corrected: use default import for pool

const router = express.Router();

// Get all achievements with their sphere names and colors
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.id, 
                a.datetime, 
                a.text, 
                a.sphere_id, 
                s.name as sphere_name,
                s.color as sphere_color 
            FROM achievements a
            JOIN spheres s ON a.sphere_id = s.id
            ORDER BY a.datetime DESC, a.id DESC;
        `);
        // Format datetime to be compatible with frontend expectations if necessary
        // The frontend expects datetime in 'YYYY-MM-DD' format after splitting by 'T'
        // PostgreSQL date/timestamp types might already be in a suitable ISO format.
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ message: 'Error fetching achievements', error: (error as Error).message });
    }
});

// Create a new achievement
router.post('/', async (req, res) => {
    const { sphere_name, date, text } = req.body; // Frontend sends sphere_name and date (YYYY-MM-DD)

    if (!sphere_name || !date || !text) {
        return res.status(400).json({ message: 'sphere_name, date, and text are required' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN'); // Start transaction

        // 1. Find or create sphere
        let sphereResult = await client.query('SELECT id FROM spheres WHERE name = $1', [sphere_name]);
        let sphereId;

        if (sphereResult.rows.length > 0) {
            sphereId = sphereResult.rows[0].id;
        } else {
            // Sphere not found, create it. Determine next position.
            // A more robust way for position would be a DB sequence or max(position) + 1
            const maxPositionResult = await client.query('SELECT MAX(position) as max_pos FROM spheres');
            const nextPosition = (maxPositionResult.rows[0]?.max_pos !== null ? maxPositionResult.rows[0].max_pos : -1) + 1;

            const newSphereInsertResult = await client.query(
                'INSERT INTO spheres (name, color, position) VALUES ($1, $2, $3) RETURNING id',
                [sphere_name, '#f3f4f6', nextPosition] // Default color, default position logic
            );
            sphereId = newSphereInsertResult.rows[0].id;
        }

        // 2. Insert achievement
        // Assuming 'date' from frontend is 'YYYY-MM-DD'. PostgreSQL can cast this to timestamp/date.
        const newAchievementResult = await client.query(
            'INSERT INTO achievements (sphere_id, datetime, text) VALUES ($1, $2, $3) RETURNING id, datetime, text, sphere_id',
            [sphereId, date, text]
        );

        await client.query('COMMIT'); // Commit transaction

        // Construct the response object to match frontend expectations (including sphere_name)
        const createdAchievement = {
            ...newAchievementResult.rows[0],
            sphere_name: sphere_name // Add sphere_name for consistency
        };

        res.status(201).json(createdAchievement);

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK'); // Rollback on error
        }
        console.error('Error creating achievement:', error);
        res.status(500).json({ message: 'Error creating achievement', error: (error as Error).message });
    } finally {
        if (client) {
            client.release(); // Release client back to pool
        }
    }
});

// Delete an achievement by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let client; // Declare client outside try block for access in finally
    try {
        client = await pool.connect(); // Get a client from the pool
        await client.query('BEGIN'); // Start transaction

        // Get sphere_id before deleting the achievement
        const achievementResult = await client.query('SELECT sphere_id FROM achievements WHERE id = $1', [parseInt(id)]);
        if (achievementResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).send('Achievement not found');
        }
        const sphereId = achievementResult.rows[0].sphere_id;

        // Delete the achievement
        const deleteResult = await client.query('DELETE FROM achievements WHERE id = $1 RETURNING id', [parseInt(id)]);
        // No need to check rowCount again as we did it above

        // Check if the sphere has any other achievements
        const remainingAchievementsResult = await client.query('SELECT id FROM achievements WHERE sphere_id = $1 LIMIT 1', [sphereId]);

        if (remainingAchievementsResult.rowCount === 0) {
            // No other achievements for this sphere, so delete the sphere
            await client.query('DELETE FROM spheres WHERE id = $1', [sphereId]);
        }

        await client.query('COMMIT'); // Commit transaction
        res.status(204).send();
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK'); // Rollback on error
        }
        console.error('Error deleting achievement:', error);
        res.status(500).json({ message: 'Error deleting achievement', error: (error as Error).message });
    } finally {
        if (client) {
            client.release(); // Release client back to the pool
        }
    }
});


// Placeholder for GET /:id (fetch single achievement)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                a.id, 
                a.datetime, 
                a.text, 
                a.sphere_id, 
                s.name as sphere_name,
                s.color as sphere_color 
            FROM achievements a
            JOIN spheres s ON a.sphere_id = s.id
            WHERE a.id = $1;
        `, [parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).send('Achievement not found');
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching achievement ${id}:`, error);
        res.status(500).json({ message: 'Error fetching achievement', error: (error as Error).message });
    }
});

// Placeholder for PUT /:id (update achievement) - more complex, requires careful handling of fields
router.put('/:id', async (req, res) => {
    // Implementation would require determining which fields are being updated,
    // potentially re-validating sphere_name if it changes, etc.
    // For now, returning a 501 Not Implemented.
    res.status(501).json({ message: 'Updating achievements not fully implemented yet' });
});


export default router; 