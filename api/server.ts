import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 8000;

app.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'API is running' });
});

app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
}); 