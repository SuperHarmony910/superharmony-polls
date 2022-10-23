import express, { Router, Request, Response } from 'express'
import { discordOauth } from "../oauth/discordOauth"
import path from 'path'
import { PollQuestion, PollSubmission, discordOauthUrl } from '../models/pollModels'
import fetch from 'node-fetch'
const app = Router()
let submission: PollSubmission;
app.use(express.static(path.resolve(__dirname + '../public')));
import cookieParser from 'cookie-parser'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const polls: PollQuestion[] = [{
    id: 1,
    name: 'poll 1',
    description: 'poll 1 description',
    options: ["Option 1", "Option 2", "Option 3", "Option 4"]
},
{
    id: 2,
    name: 'poll 2',
    description: 'poll 2 description',
    options: ["Option 1", "Option 2", "Option 3", "Option 4"]
}];

// middleware that is specific to this router
app.use((req, res, next) => {
    next()
})

app.get('/:id', async (req: Request, res: Response) => {
    const poll = polls.find(s => s.id === parseInt(req.params.id));
    if (!poll) return res.status(404).send('The poll with the given ID was not found.');
    if (req.query['json']) { // for rpc when calls json
        console.log('json')
        return res.send(polls[poll.id])
    }
    const choice = parseInt(String(req.query['choice'])) || NaN;
    if (req.query['discord']) { // if the choice is contained in the url (the person probably sent it from discord)- this does not require frontend.
        res.cookie('rememberChoice', { poll: poll, choice: choice ?? null, discord: undefined }, { maxAge: 1000 * 60 * 5, httpOnly: false }) // save the option in a cookie
        console.debug('redirected')
        return res.redirect(discordOauthUrl)
    }
    res.sendFile(path.resolve('public/poll.html'))
    console.debug('file sent')
})

app.get('/', (req: Request, res: Response) => {
    if (req.query['oauthSuccess']) {
        if (!req.cookies.rememberChoice) return res.status(400).send('No identification cookie found. Did you come back from the <a href="">Discord OAuth prompt?</a>')
        let choice: number = parseInt(req.cookies.rememberChoice.choice) || NaN;
        let poll = req.cookies.rememberChoice.poll
        const user = discordOauth(req)
        res.cookie('identification', { poll: poll, choice: choice, discord: user }, { maxAge: 1000 * 60 * 5 })
        if (choice > poll.options.length || isNaN(choice)) return res.status(400).send(`Invalid choice. ${choice}`);
        // create submit code
        submission = {
            choice: choice,
            who: {
                username: req.cookies.identification.discord.username,
                discriminator: req.cookies.identification.discord.discriminator,
                discord_id: req.cookies.identification.discord.id
            }
        }
        res.send(submission)
        return fetch(`${req.protocol + '://' + req.get('host')}/polls/${poll.id}`, {
            method: 'POST',
            body: JSON.stringify(submission),
            headers: { 'Content-Type': 'application/json' },
        })
    }
    return res.send(`Available polls:\n\n${polls.map(p => p.name).join(', \n')}`)
})


app.get('/:id/json', async (req: Request, res: Response) => {
    const user = await discordOauth(req)
    console.log(req.query)
    const poll = polls.find(s => s.id === parseInt(req.params.id));
    if (!poll) res.status(404).send('The poll with the given ID was not found.');
    res.send(poll);
})

app.post("/:id", (req: Request, res: Response) => {
    if (req.body['option']) { //frontend response
        submission = {
            choice: parseInt(req.body['option'] ?? req.body['choice']),
            who: {
                username: req.body['username'] || undefined,
            }
        }
    } else submission = req.body //rpc response
    return res.send(`thank youu for responding to my poll ${submission.who?.username ?? ''}! u submitted <b>option ${req.body["option"]}</b> as your option.`)
});

export default app
export { submission }