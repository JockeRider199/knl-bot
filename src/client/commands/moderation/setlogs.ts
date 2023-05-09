import {
	ChannelType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { setLogsChannel } from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("logs")
		.setDescription("Défini le salon de logs")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("set")
				.setDescription("Active les logs")
				.addChannelOption((option) => {
					return option
						.setName("channel")
						.setDescription("Le salon de logs")
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand.setName("remove").setDescription("Désactive les logs");
		}),

	exec: async (interaction) => {
		const subcommand = interaction.options.getSubcommand(true);

		if (subcommand === "remove") {
			await setLogsChannel(interaction.guildId!);
			await interaction.reply({
				content: "Les logs ont été désactivés",
				ephemeral: true,
			});
		} else {
			const channelOption = interaction.options.getChannel("channel", true);

			await setLogsChannel(interaction.guildId!, channelOption.id);

			await interaction.reply({
				content: `Le salon de logs a été défini sur ${channelOption}`,
				ephemeral: true,
			});
		}
	},
};

export default command;
