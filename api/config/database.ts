import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

export const connectToDB = async () => {
    try {
        await pool.connect();
        console.log('Successfully connected to the database');
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1); // Exit if can't connect to DB
    }
};

export const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create Spheres table
        await client.query(`
      CREATE TABLE IF NOT EXISTS spheres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#FFFFFF',
        "position" INTEGER
      );
    `);

        // Create Achievements table
        await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        sphere_id INTEGER NOT NULL REFERENCES spheres(id) ON DELETE CASCADE,
        datetime TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        text TEXT NOT NULL
      );
    `);

        await client.query('COMMIT');
        console.log('Tables created successfully or already exist.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating tables', error);
        throw error; // Re-throw to be caught by server startup
    } finally {
        client.release();
    }
};

export default pool; 