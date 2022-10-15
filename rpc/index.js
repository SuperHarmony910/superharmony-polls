// this is meant to be local, do not host this file

const rpc = require("discord-rpc")
require("dotenv").config({ path: __dirname + "/../.env" })
const client = new rpc.Client({ transport: 'ipc' })
client.on('ready', () => {
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            details: "Coding",
            // assets: {
            //     large_image: "Your Image",
            //     large_text: "Your Status"
            // },
            buttons: [{ label: "DONT CLICK ME /gen", url: "https://discord.com/api/oauth2/authorize?client_id=887832942804619304&redirect_uri=http%3A%2F%2Flocalhost%3A53134&response_type=code&scope=identify" }, { label: "nothing", url: "https://example.com" }]
        }
    })
})
console.log(process.env.CLIENT_ID)
client.login({ clientId: process.env.CLIENT_ID }).catch(console.error)