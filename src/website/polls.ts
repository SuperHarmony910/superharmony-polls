import { Router, Request, Response } from 'express'
const app = Router()

interface pollQuestion {
    id: number,
    name: string,
    description: string,
    options: string[]
}

const polls: pollQuestion[] = [{
    id: 1,
    name: 'poll 1',
    description: 'poll 1 description',
    options: ["Option 1", "Option 2", "Option 3"]
},
{
    id: 2,
    name: 'poll 2',
    description: 'poll 2 description',
    options: ["Option 1", "Option 2", "Option 3"]
}];

// middleware that is specific to this router
app.use((req, res, next) => {
    next()
})

app.get('/:id', (req: Request, res: Response) => {
    const poll = polls.find(s => s.id === parseInt(req.params.id));
    if (!poll) return res.status(404).send('The poll with the given ID was not found.');
    if (req.query['choice']) {
        if (parseInt(String(req.query['choice'])) < poll.options.length) return res.status(400).send('Invalid choice');
        // create submit code
        res.send('Thank you for your submission!');
    }
    res.send();
})

app.get('/:id/json', (req: Request, res: Response) => {
    const poll = polls.find(s => s.id === parseInt(req.params.id));
    if (!poll) res.status(404).send('The poll with the given ID was not found.');
    res.send(poll);
})

export default app