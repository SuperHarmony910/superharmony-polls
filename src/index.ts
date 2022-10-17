// Import and configure libraries
import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv'
dotenv.config()
import 'colors'

// Import routes
import polls from './routes/polls'

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
  console.log(`[SERVER]`.magenta + ` Server started at http://localhost:${port}`.green);
});