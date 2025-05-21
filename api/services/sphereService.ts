import { Pool } from 'pg';
import { Sphere } from '../models';
import pool from '../config/database';

// Function to get the database pool
// const pool: Pool = getDB(); // Removed this line as pool is imported directly

export const getAllSpheres = async (): Promise<Sphere[]> => {
    const result = await pool.query('SELECT id, name, color, position FROM spheres ORDER BY position ASC, id ASC');
    return result.rows;
};

export const createSphere = async (name: string, color?: string, position?: number): Promise<Sphere> => {
    // Check if sphere with the same name already exists
    const existingSphere = await pool.query('SELECT id FROM spheres WHERE name = $1', [name]);
    if (existingSphere.rows.length > 0) {
        throw new Error('Sphere with this name already exists');
    }

    // If position is not provided, find the next available position
    let newPosition = position;
    if (newPosition === undefined || newPosition === null) {
        const maxPositionResult = await pool.query('SELECT MAX(position) as max_pos FROM spheres');
        newPosition = (maxPositionResult.rows[0].max_pos || 0) + 1;
    }

    const result = await pool.query(
        'INSERT INTO spheres (name, color, position) VALUES ($1, $2, $3) RETURNING id, name, color, position',
        [name, color, newPosition]
    );
    return result.rows[0];
};

export const updateSphere = async (id: number, color?: string, position?: number): Promise<Sphere | null> => {
    const fields: string[] = [];
    const values: (string | number | undefined)[] = [];
    let queryIndex = 1;

    if (color !== undefined) {
        fields.push(`color = $${queryIndex++}`);
        values.push(color);
    }
    if (position !== undefined) {
        fields.push(`position = $${queryIndex++}`);
        values.push(position);
    }

    if (fields.length === 0) {
        // Nothing to update, fetch and return the current sphere
        const currentSphereResult = await pool.query('SELECT id, name, color, position FROM spheres WHERE id = $1', [id]);
        return currentSphereResult.rows.length > 0 ? currentSphereResult.rows[0] : null;
    }

    values.push(id); // For the WHERE clause

    const query = `UPDATE spheres SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING id, name, color, position`;
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
        return result.rows[0];
    }
    return null; // Or throw an error if sphere not found
}; 