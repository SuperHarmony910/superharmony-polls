// Import and configure libraries
import express, { Express, Request, Response } from 'express';
import { config } from 'dotenv'
config({ path: __dirname + "/../.env" })

// Import routes
import polls from './polls'

const app: Express = express();
app.use(express.json())
const port = process.env.PORT;

// Configure routes
app.use('/polls', polls)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from server!',
  });
});


app.listen(port, () => {
  console.log(`Server is running at https://localhost:${port}`);
});