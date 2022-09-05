const Discord = require("discord.js")
const Dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const {Routes } = require("discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")
const {Client, GatewayIntentBits } = require("discord.js")


Dotenv.config()
const TOKEN = process.env.TOKEN

// Used for argument given to bot upon startup?
const LOAD_SLASH = process.argv[2] == "load"

//Discord Client ID for Bot
const CLIENT_ID = process.env.CLIENT_ID
// Discord Server in which bot will be executable 
const GUILD_ID = "463947429159370762"

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
})

process.on('unhandledRejection', error =>{
    console.error('Unhandled promise rejection:', error)
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

let commands = []

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for  (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9"}).setToken(TOKEN)
    console.log("Depoloying slash commands")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
}
else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid slash command")

            await interaction.deferReply()
            await slashcmd.run({client, interaction})
        }
        handleCommand()
    })
    client.login(TOKEN)
}