export interface PollQuestion {
    id: number,
    name: string,
    description: string,
    options: string[]
}

export class PollSubmission {
    poll = 0;
    choice = 0;
    who?: {
        discord_id?: number;
        username: string | undefined;
        discriminator?: number;
    };
    date?: {
        day: string,
        time: string
    }
}

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
export const discordOauthUrl: string = 'https://discord.com/api/oauth2/authorize?client_id=887832942804619304&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fpolls%3FoauthSuccess%3Dtrue&response_type=code&scope=identify'