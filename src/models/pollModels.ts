import mongoose from "mongoose";
const { Schema } = mongoose;

export interface PollQuestion {
  id: number;
  name: string;
  description: string;
  options: string[];
}

export interface PollSubmission {
  poll: number;
  choice: number;
  who?: {
    discord_id?: number;
    username: string | undefined;
    discriminator?: string;
  };
  date?: {
    day: string;
    time: string;
  };
}

const submissionSchema = new Schema<PollSubmission>({
  poll: { type: Number, required: true },
  choice: { type: Number, required: true },
  who: {
    discord_id: Number,
    username: String,
    discriminator: Number,
  },
  date: {
    day: String,
    time: String,
  },
});

// Compile model from schema
export const Submission = mongoose.model("submission", submissionSchema);

/* consider taking from this
{
  title:  String, // String is shorthand for {type: String}
  author: String,
  body:   String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
}
*/
export const discordOauthUrl: string =
  "https://discord.com/api/oauth2/authorize?client_id=887832942804619304&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fpolls%3FoauthSuccess%3Dtrue&response_type=code&scope=identify";
