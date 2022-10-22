export interface PollQuestion {
    id: number,
    name: string,
    description: string,
    options: string[]
}

export interface PollSubmission {
    choice: number,
    who?: {
        discord_id?: number,
        username: string | undefined,
        discriminator?: number
    }
}

const e = {
    "identification":
        { "poll": { "id": 1, "name": "poll 1", "description": "poll 1 description", "options": ["Option 1", "Option 2", "Option 3"] }, "choice": 4, "discord": null }
}

export const discordOauthUrl: string = 'https://discord.com/api/oauth2/authorize?client_id=887832942804619304&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fpolls%3FoauthSuccess%3Dtrue&response_type=code&scope=identify'