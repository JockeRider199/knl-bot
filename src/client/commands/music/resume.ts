import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("resume")
		.setDescription("Remet la musique en lecture.")
		.setDMPermission(false),

	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);

		if (!player) {
			return interaction.reply({
				content: "Je ne suis pas en train de jouer.",
				ephemeral: true,
			});
		}

		if (!player.isPaused) {
			return interaction.reply({
				content: "Je ne suis pas en pause.",
				ephemeral: true,
			});
		}

		player.pause(false);

		return interaction.reply({ content: "J'ai remis la musique en lecture." });
	},
};

export default command;
