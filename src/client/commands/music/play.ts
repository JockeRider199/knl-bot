import { GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Joue une musique via un lien.")
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("lien")
				.setDescription("Le lien de votre musique ou playlist.")
				.setRequired(true)
		),

	exec: async (interaction, client) => {
		await interaction.deferReply();

		const guildMember = <GuildMember>interaction.member;

		if (!guildMember.voice.channel) {
			return interaction.editReply({
				content: `Connectez-vous à un salon vocal avant d'utiliser cette commande.`,
			});
		}

		const song = interaction.options.getString("lien")!;

		if (!song.startsWith("https")) {
			return interaction.editReply({
				content: `Veuillez entrer un lien valide.`,
			});
		}

		const res = await client.poru.resolve({
			query: song,
			source: "spsearch",
			requester: guildMember,
		});

		if (res.loadType === "LOAD_FAILED") {
			return interaction.editReply("Echec du chargement de la musique.");
		} else if (res.loadType === "NO_MATCHES") {
			return interaction.editReply("Aucune musique trouvée.");
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

			interaction.editReply(
				`${res.playlistInfo.name} a été ajoutée dans la file avec ${res.tracks.length} musiques.`
			);
		} else {
			const track = res.tracks[0];
			track.info.requester = guildMember;
			player.queue.add(track);
			interaction.editReply(`Ajout de la musique \n \`${track.info.title}\``);
		}

		if (!player.isPlaying && player.isConnected) player.play();
	},
};

export default command;
