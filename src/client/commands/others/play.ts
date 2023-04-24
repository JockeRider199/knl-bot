import { GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Play a song in the voice channel")
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("song")
				.setDescription("The song you want to play")
				.setRequired(true)
		),

	exec: async (interaction, client) => {
		const guildMember = <GuildMember>interaction.member;

		if (!guildMember.voice.channel) {
			return interaction.reply({
				content: `Please connect with voice channel `,
				ephemeral: true,
			});
		}

		const song = interaction.options.getString("song")!;
		const res = await client.poru.resolve({
			query: song,
			source: "spsearch",
			requester: guildMember,
		});

		if (res.loadType === "LOAD_FAILED") {
			return interaction.reply("Failed to load track.");
		} else if (res.loadType === "NO_MATCHES") {
			return interaction.reply("No source found!");
		}

		const player = client.poru.createConnection({
			guildId: interaction.guildId!,
			voiceChannel: guildMember.voice.channelId!,
			textChannel: guildMember.id,
			deaf: true,
			mute: false,
		});

		if (res.loadType === "PLAYLIST_LOADED") {
			for (const track of res.tracks) {
				track.info.requester = guildMember;
				player.queue.add(track);
			}

			interaction.reply(
				`${res.playlistInfo.name} has been loaded with ${res.tracks.length}`
			);
		} else {
			const track = res.tracks[0];
			track.info.requester = guildMember;
			player.queue.add(track);
			interaction.reply(`Queued Track \n \`${track.info.title}\``);
		}

		if (!player.isPlaying && player.isConnected) player.play();
	},
};

export default command;
