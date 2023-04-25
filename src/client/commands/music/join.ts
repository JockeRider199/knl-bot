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
	exec: (interaction, client) => {
		const guildMember = <GuildMember>interaction.member;

		if (!guildMember.voice.channel) {
			return interaction.reply({
				content: `Vous devez être connecté à un salon vocal pour utiliser cette commande.`,
				ephemeral: true,
			});
		}

		client.poru.createConnection({
			guildId: interaction.guildId!,
			voiceChannel: guildMember.voice.channelId!,
			textChannel: guildMember.id,
			deaf: true,
			mute: false,
		});

		interaction.reply({ content: "J'ai rejoins le salon vocal !" });
	},
};

export default command;
