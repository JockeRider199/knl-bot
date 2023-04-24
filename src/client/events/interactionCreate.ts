import { type Interaction } from "discord.js";
import { type Client } from "../models/client";
import { type Event } from "../models/event";

export const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (client: Client, interaction: Interaction) => {
		if (interaction.isChatInputCommand()) {
			const commandName = interaction.commandName;
			const command = client
				.getSlashCommands()
				.find((cmd) => cmd.data.name == commandName);
			if (command != null) {
				command.exec(interaction, client);
			}
		} else if (interaction.isButton()) {
			const interactionData = interaction.customId.split("_");
			const commandName = interactionData[0];
			const buttonId = interactionData[1];

			const command = client
				.getSlashCommands()
				.find((cmd) => cmd.data.name == commandName);
			if (command != null && command.execButtons != null) {
				command.execButtons(interaction, buttonId, client);
			}
		} else if (interaction.isModalSubmit()) {
			const interactionData = interaction.customId.split("_");
			const commandName = interactionData[0];
			const modalId = interactionData[1];

			const command = client
				.getSlashCommands()
				.find((cmd) => cmd.data.name == commandName);
			if (command != null && command.execModals != null) {
				command.execModals(interaction, modalId, client);
			}
		}
	},
};

export default event;
