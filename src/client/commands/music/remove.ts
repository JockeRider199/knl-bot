import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Supprime une musique de la file d'attente.")
		.setDMPermission(false)
		.addIntegerOption((option) => {
			return option
				.setName("index")
				.setDescription("L'index de la musique à supprimer.")
				.setRequired(true);
		}),
	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);

		if (!player) {
			return interaction.reply({
				content: "Aucune musique n'est en cours de lecture.",
				ephemeral: true,
			});
		}

		if (!player.queue.length) {
			return interaction.reply({
				content: "La file d'attente est vide.",
				ephemeral: true,
			});
		}

		const index = interaction.options.getInteger("index")!;
		if (index < 1 || index > player.queue.length) {
			return interaction.reply({
				content: "L'index de la musique à supprimer est invalide.",
				ephemeral: true,
			});
		}

		player.queue.remove(index - 1);

		return interaction.reply({
			content: `La musique à l'index ${index} a été supprimée.`,
		});
	},
};

export default command;
