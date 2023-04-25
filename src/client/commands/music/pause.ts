import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Met la musique en pause.")
		.setDMPermission(false),

	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);

		if (!player) {
			return interaction.reply({
				content: "Je ne suis pas en train de jouer.",
				ephemeral: true,
			});
		}

		if (player.isPaused) {
			return interaction.reply({
				content: "Je suis déjà en pause.",
				ephemeral: true,
			});
		}

		player.pause();

		return interaction.reply({ content: "J'ai mis la musique en pause." });
	},
};

export default command;
