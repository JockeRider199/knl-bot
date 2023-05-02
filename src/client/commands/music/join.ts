import { GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("join")
		.setDescription("Rejoins le salon vocal dans lequel vous êtes.")
		.setDMPermission(false),
	exec: async (interaction, client) => {
		const guildMember = <GuildMember>interaction.member;

		await interaction.deferReply({ ephemeral: true });

		if (!guildMember.voice.channel) {
			return interaction.editReply({
				content: `Vous devez être connecté à un salon vocal pour utiliser cette commande.`,
			});
		}

		client.poru.createConnection({
			guildId: interaction.guildId!,
			voiceChannel: guildMember.voice.channelId!,
			textChannel: guildMember.id,
			deaf: true,
			mute: false,
		});

		interaction.editReply({ content: "J'ai rejoins le salon vocal !" });
	},
};

export default command;
