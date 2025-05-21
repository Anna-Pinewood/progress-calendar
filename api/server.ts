import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectToDB, createTables } from './config/database';

dotenv.config(); // Load environment variables AT THE VERY TOP

const app = express();
const port = process.env.PORT || 8000;

app.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'API is running' });
});

const startServer = async () => {
    try {
        await connectToDB();
        await createTables();

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start the server due to database issues:", error);
        process.exit(1);
    }
};

startServer(); 