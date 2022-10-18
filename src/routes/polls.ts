import express, { Router, Request, Response } from 'express'
import { discordOauth } from "../oauth/discordOauth"
import path from 'path'
import { pollQuestion, pollSubmission } from '../models/pollModels'
const app = Router()
let submission: pollSubmission;
app.use(express.static(path.resolve(__dirname + '../public')));
import cookieParser from 'cookie-parser'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

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

app.get('/', (req: Request, res: Response) => {
    res.send(`Available polls:\n\n${polls.map(p => p.name).join(', \n')}`)
})

app.get('/:id', async (req: Request, res: Response) => {
    const poll = polls.find(s => s.id === parseInt(req.params.id));
    if (!poll) return res.status(404).send('The poll with the given ID was not found.');
    if (req.query['choice']) { // if the choice is contained in the url (the person probably sent it from discord)- this does not require frontend.
        const choice = parseInt(String(req.query['choice']))
        console.log(choice)
       // if (choice > poll.options.length || isNaN(choice)) return res.status(400).send('Invalid choice');
        // create submit code
        // submission = {
        //     discord: {
                
        //     }
        // }
        const oauthRes = await discordOauth(req)
        console.log(oauthRes)
        await res.send('Thank you for your submission!');
    }
    return res.sendFile(path.resolve('public/poll.html'))
})

app.get('/:id/json', async (req: Request, res: Response) => {
    const user = await discordOauth(req)
    console.log(user)
    console.log(req.query)
    const poll = polls.find(s => s.id === parseInt(req.params.id));
    if (!poll) res.status(404).send('The poll with the given ID was not found.');
    res.send(poll);
})

app.post("/:id", (req: Request, res: Response) => {
    console.log(req.body);
    submission = {
        choice: parseInt(req.body['option']),
        who: {
            username: req.body['username'] || undefined,
        }
    }
    return res.send(`thank youu for responding to my poll ${submission.who?.username ?? ''}! u submitted <b>option ${req.body["option"]}</b> as your option.`)
});

export default app