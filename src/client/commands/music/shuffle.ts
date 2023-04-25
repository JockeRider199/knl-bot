import { GuildMember, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription("Melange la file d'attente.")
		.setDMPermission(false),
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

		if (player.queue.length < 2) {
			return interaction.reply({
				content: "La file d'attente est trop courte pour être mélangée.",
				ephemeral: true,
			});
		}

		player.queue.shuffle();

		return interaction.reply({
			content: "La file d'attente a été mélangée.",
		});
	},
};

export default command;
