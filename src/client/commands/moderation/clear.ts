import {
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription(
			"Supprime un nombre de messages donné dans le salon courant."
		)
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option
				.setName("nombre")
				.setDescription("Nombre de messages à supprimer.")
				.setMinValue(1)
				.setMaxValue(99)
				.setRequired(true)
		),

	exec: async (interaction) => {
		const amount = interaction.options.getInteger("nombre", true);

		if (interaction.channel instanceof TextChannel) {
			const deleted = await interaction.channel.bulkDelete(amount, true);

			const msg = await interaction.reply({
				content: `**${deleted.size}** messages ont été supprimés.`,
				ephemeral: true,
			});

			setTimeout(async () => {
				await msg.delete();
			}, 3500);
		}
	},
};

export default command;
