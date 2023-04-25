import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("clearqueue")
		.setDescription("Supprime la liste des musiques en attente.")
		.setDMPermission(false),

	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);

		if (!player) {
			return interaction.reply({
				content: "Je ne suis pas en train de jouer.",
				ephemeral: true,
			});
		}
		if (!player.queue.length) {
			return interaction.reply({
				content: "La file est vide.",
				ephemeral: true,
			});
		}

		player.queue.clear();

		interaction.reply({ content: "La file a été supprimée." });
	},
};

export default command;
