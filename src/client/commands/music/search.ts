import { GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("search")
		.setDescription("Cherche une musique sur une plateforme via une recherche.")
		.setDMPermission(false)
		.addStringOption((option) =>
			option.setName("song").setDescription("Votre recherche").setRequired(true)
		)
		.addStringOption((option) => {
			return option
				.setName("platform")
				.setDescription(
					"La plateforme sur laquelle vous voulez chercher la musique"
				)
				.addChoices(
					{ name: "Spotify", value: "spsearch" },
					{ name: "Youtube", value: "ytsearch" }
				)
				.setRequired(false);
		}),

	exec: async (interaction, client) => {
		const guildMember = <GuildMember>interaction.member;

		if (!guildMember.voice.channel) {
			return interaction.reply({
				content: `Connectez-vous à un salon vocal avant d'utiliser cette commande.`,
				ephemeral: true,
			});
		}

		const song = interaction.options.getString("song")!;
		const platform = interaction.options.getString("platform") ?? "spsearch";

		if (song.startsWith("https")) {
			return interaction.reply({
				content: `Si vous souhaitez utiliser un lien, utilisez la commande /play.`,
				ephemeral: true,
			});
		}

		const res = await client.poru.resolve({
			query: song,
			source: platform,
			requester: guildMember,
		});

		if (res.loadType === "LOAD_FAILED") {
			return interaction.reply("Echec du chargement de la musique.");
		} else if (res.loadType === "NO_MATCHES") {
			return interaction.reply("Aucune musique trouvée.");
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
				`${res.playlistInfo.name} a été ajoutée dans la file avec ${res.tracks.length} musiques.`
			);
		} else {
			const track = res.tracks[0];
			track.info.requester = guildMember;
			player.queue.add(track);
			interaction.reply(`Ajout de la musique \n \`${track.info.title}\``);
		}

		if (!player.isPlaying && player.isConnected) player.play();
	},
};

export default command;
