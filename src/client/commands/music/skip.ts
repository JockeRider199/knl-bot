import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skip la musique actuelle.")
		.setDMPermission(false),

	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);

		if (!player) {
			return interaction.reply({
				content: "Je ne suis pas en train de jouer.",
				ephemeral: true,
			});
		}

		player.stop();

		interaction.reply("Passage à la musique suivante.");
	},
};

export default command;
