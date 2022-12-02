import express, { Router, Request, Response } from "express";
import { discordOauth } from "../oauth/discordOauth";
import path from "path";
import {
  PollQuestion,
  PollSubmission,
  discordOauthUrl,
  Submission
} from "../models/pollModels";
import fetch from "node-fetch";
const app = Router();
let submission: PollSubmission;
app.use(express.static(path.resolve(__dirname + "../polls/index")));
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import UglifyJS from "uglify-js";
import fs from "fs"

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
import dotenv from "dotenv";
const mongoPwd = process.env.MONGO_PWD

const polls: PollQuestion[] = [
  {
    id: 1,
    name: "poll 1",
    description: "poll 1 description",
    options: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
  },
  {
    id: 2,
    name: "poll 2",
    description: "poll 2 description",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
  },
];

// middleware that is specific to this router
app.use((req, res, next) => {
  next();
});

app.get("/:id/create", (req, res) => res.sendFile(path.resolve(__dirname + "../polls/public/create.html")));

app.post("/:id/create", (req, res) => {
  const poll = polls.find((p) => p.id === parseInt(req.params.id));
  if (poll) {
    res.render("create", { poll });
  } else {
    res.status(404).send("Poll not found");
  }
});

app.get("/:id", async (req: Request, res: Response) => {
  const poll = polls.find((s) => s.id === parseInt(req.params.id));
  if (!poll)
    return res.status(404).send("The poll with the given ID was not found.");
  if (req.query["json"]) {
    // for rpc when calls json
    console.log("json");
    return res.send(polls[poll.id]);
  }
  const choice = parseInt(String(req.query["choice"])) || NaN;
  if (req.query["discord"]) {
    // if the choice is contained in the url (the person probably sent it from discord)- this does not require frontend.
    res.cookie(
      "rememberChoice",
      { poll: poll, choice: choice ?? null, discord: undefined },
      { maxAge: 1000 * 60 * 5, httpOnly: false }
    ); // save the option in a cookie
    console.debug("redirected");
    return res.redirect(discordOauthUrl);
  }
  res.sendFile(path.resolve("public/polls/index.html"));
  console.debug("file sent");
});

app.get("/", async (req: Request, res: Response) => {
  console.debug("rememberChoice:", req.cookies.rememberChoice);
  if (req.query["oauthSuccess"]) {
    if (!req.cookies.rememberChoice)
      return res
        .status(400)
        .send(
          'No identification cookie found. Did you come back from the <a href="">Discord OAuth prompt?</a>'
        );
    let choice: number = parseInt(req.cookies.rememberChoice.choice) || NaN;
    let poll = req.cookies.rememberChoice.poll;
    const user = await discordOauth(req);
    // ! Consider re-implementing this code if you want to keep the Discord user cached; that way they don't have to answer the prompt every time! res.cookie('identification', user, { maxAge: 1000 * 60 * 5 })
    if (choice > poll.options.length || isNaN(choice))
      return res.status(400).send(`Invalid choice. ${choice}`);
    // create submit code
    submission = {
      poll: poll.id,
      choice: choice,
      who: {
        username: user.username,
        discriminator: String(user.discriminator),
        discord_id: user.id,
      },
      date: {
        day: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      },
    };
    res.send(
      `thank youu for responding to my poll ${submission.who?.username ?? ""
      }! u submitted <b>option ${submission.choice}</b> as your option.` //frontend response
    );
    return fetch(`${req.protocol + "://" + req.get("host")}/polls/${poll.id}`, {
      method: "POST",
      body: JSON.stringify(submission),
      headers: { "Content-Type": "application/json" },
    });
  }
  return res.send(
    `Available polls:\n\n${polls.map((p) => p.name).join(", \n")}`
  );
});

app.get("/:id/json", async (req: Request, res: Response) => {
  console.log(req.query);
  const poll = polls.find((s) => s.id === parseInt(req.params.id));
  if (!poll) res.status(404).send("The poll with the given ID was not found.");
  res.send(poll);
});

app.post("/:id", async (req: Request, res: Response) => {
  if (!polls[parseInt(req.params.id)] || !Array(polls).includes(req.params.id)) {
    const page = UglifyJS.minify(fs.readFileSync('../public/polls/pollConstructor.html', 'utf-8')).toString().replace('PAGE_NUMBER', req.params.id)
  }
  if (req.body["option"]) {
    //frontend response
    submission = {
      poll: parseInt(req.params.id),
      choice: parseInt(req.body["option"] ?? req.body["choice"]),
      who: {
        username: req.body["username"] || undefined,
      },
      date: {
        day: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      },
    };
  } else submission = req.body; //rpc response

  // upload to database
  // Set up default mongoose connection
  await mongoose.connect(`mongodb+srv://sus:${mongoPwd}@cluster0.5t37zkq.mongodb.net/pollSubmissions?retryWrites=true&w=majority`)
    .then(() => {
        console.log(`CONNECTED TO MONGO!`);
    })
    .catch((err) => {
        console.log(`OH NO! MONGO CONNECTION ERROR!`);
        console.log(err);
    })

  // Get the default connection
  const db = mongoose.connection;

  const submissionModel = new Submission(submission)
  submissionModel.save((err, submission) => {
    if (err) return console.error(err);
    console.log(`${submission._id} (${submission.who?.username ?? 'anonymous'}) saved to poll submission collection.`);
  });

  // Bind connection to error event (to get notification of connection errors)
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  return res.send(
    `thank youu for responding to my poll ${submission.who?.username ?? ""
    }! u submitted <b>option ${req.body["option"]}</b> as your option.` //frontend response
  );
});

export default app;
export { submission };
