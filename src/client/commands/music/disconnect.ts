import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("disconnect")
		.setDescription("Déconnecte le bot du salon vocal dans lequel il est.")
		.setDMPermission(false),
	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);
		player?.destroy();

		interaction.reply({ content: "J'ai quitté le salon vocal !" });
	},
};

export default command;
