import express from 'express';
import cors from "cors";
import { appRouter } from './routes';

const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// Sample route
app.get('/hello', (req, res) => {
    res.send('Hello, World!');
});

app.use("/api", appRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 