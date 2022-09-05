const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder, ChannelType } = require("discord.js")
const { QueryType } = require("discord-player")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("loads songs from YouTube")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("song")
                .setDescription("Loads a single song from a URL")
                .addStringOption((option) => option.setName("url").setDescription("the song's url").setRequired(true))
        )
        .addSubcommand((subcommand) => 
            subcommand
                .setName("playlist")
                .setDescription("Loads a playlist of songs from a url")
                .addStringOption((option) => option.setName("url").setDescription("the playlist's url").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("search")
                .setDescription("Searches for sign based on provided keyword.")
        ),
        run: async ({ client, interaction }) => {
            if (!interaction.member.voice.channelId){
                await interaction.editReply("You need to be in a voice channel to use this command.")
                return;
            } 

            const queue = await client.player.createQueue(interaction.guild)

            if (!queue.connection) await queue.connect(interaction.member.voice.channel)

            let embed = new EmbedBuilder()

            if (interaction.options.getSubcommand() === "song") {
                let url = interaction.options.getString("url")
                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO,
                })

                if (result.tracks.length === 0) {
                    await interaction.reply("No Results")
                    return
                }
                const song = result.tracks[0]
                await queue.addTrack(song)
                embed
                    .setDescription(`**[${song.title}]${song.url}** has been added to the queue.`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Duration: ${song.duration}`})

        } else if (interaction.options.getSubcommand() === "playlist") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0) {
                await interaction.reply("No Results")
                return
            }
            const playlist = result.playlist[0]
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${results.tracks.length}[${playlist.title}]${playlist.url}** has been added to the queue.`)
                .setThumbnail(song.thumbnail)
        } else if (interaction.options.getSubcommand() === "search") {
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.length === 0) {
                await interaction.reply("No Results")
                return
            }

            const song = result.tracks[0]
            await queue.addTrack(song)
            
            embed
                .setDescription(`**[${song.title}]${song.url}** has been added to the queue.`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
        } 
        if (!queue.playing) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
    },
}
