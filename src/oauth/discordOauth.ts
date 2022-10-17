import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
dotenv.config({ path: '/../.env' })
import { Request } from 'express';

const clientId = String(process.env.CLIENT_ID)
const clientSecret = String(process.env.CLIENT_SECRET)
const port = process.env.PORT

export async function discordOauth(req: Request) {
    const { code } = req.query;

    if (code) {
        try {
            const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: String(code),
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${port}/polls/1?choice=1`,
                    scope: 'identify',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData: any = await oauthResult.json();
            console.log(oauthData)

            const userResult = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            });

            return userResult.json()
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error;
            // it will return a 401 Unauthorized response in the try block above
            return console.error(error);
        }
    }
}