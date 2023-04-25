import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Boucle la musique ou playlist en cours de lecture.")
		.setDMPermission(false)
		.addStringOption((option) => {
			return option
				.setName("type")
				.setDescription("Le type de boucle.")
				.setRequired(true)
				.addChoices(
					{ name: "Musique", value: "TRACK" },
					{ name: "Playlist", value: "QUEUE" },
					{ name: "Désactiver", value: "NONE" }
				);
		}),
	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);
		const type = interaction.options.getString("type")!;

		if (!player) {
			return interaction.reply({
				content: "Aucune musique n'est en cours de lecture.",
				ephemeral: true,
			});
		}

		player.setLoop(type as Loop);

		return interaction.reply({
			content: `La boucle a été définie sur ${type.toLowerCase()}.`,
		});
	},
};

type Loop = "NONE" | "TRACK" | "QUEUE";

export default command;
