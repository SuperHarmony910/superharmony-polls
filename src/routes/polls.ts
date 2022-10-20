import express, { Router, Request, Response } from 'express'
import { discordOauth } from "../oauth/discordOauth"
import path from 'path'
import { PollQuestion, PollSubmission, discordOauthUrl } from '../models/pollModels'
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
    return res.send(`Available polls:\n\n${polls.map(p => p.name).join(', \n')}`)
})

app.get('/:id', async (req: Request, res: Response) => {
    const poll = polls.find(s => s.id === parseInt(req.params.id));
    if (!poll) return res.status(404).send('The poll with the given ID was not found.');
    if (req.query['json']) { // for rpc when calls json
        return res.send(polls[poll.id])
    }
    const choice = parseInt(String(req.query['choice'])) || NaN;
    // CANNOT SET HEADERS MEANS THAT YOU CANT SET ANY VALUE WITH res.x MORE THAN ONCE YEHASHUJFDSKAHUAFGHBUIUJ
    res.cookie('identification', { option: choice ?? null, discord: null }) // save the option in a cookie
    console.log(req.cookies.identification)
    if (req.query['discord']) { // if the choice is contained in the url (the person probably sent it from discord)- this does not require frontend.
        res.redirect(discordOauthUrl)
        const user = discordOauth(req)
        res.cookie('identification', { option: req.cookies.identification.option, discord: user })
        console.log(req.cookies)
        if (choice > poll.options.length || isNaN(choice)) return res.status(400).send('Invalid choice');
        // create submit code
        submission = {
            choice: choice,
            who: {
                username: req.cookies.identification.discord.username,
                discriminator: req.cookies.identification.discord.discriminator,
                discord_id: req.cookies.identification.discord.id
            }
        }
        console.log(submission)
        //res.write('Thank you for your submission!');
    }
    res.sendFile(path.resolve('public/poll.html'))
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
    submission = {
        choice: parseInt(req.body['option']),
        who: {
            username: req.body['username'] || undefined,
        }
    }
    console.log(submission)
    return res.send(`thank youu for responding to my poll ${submission.who?.username ?? ''}! u submitted <b>option ${req.body["option"]}</b> as your option.`)
});

export default app
export { submission }