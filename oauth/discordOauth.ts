import * as dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

const [clientId, clientSecret, port] = [process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.PORT];

export async function discordOauth(query: QueryString.Qs) {
    const { code } = query;

    if (code) {
        try {
            const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${port}`,
                    scope: 'identify',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData = await oauthResult.json();
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