import {
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("unmute")
		.setDescription("Unmute un membre")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membre à unmute.")
				.setRequired(true);
		}),

	exec: async (interaction) => {
		const member = interaction.options.getMember("membre") as GuildMember;

		member.timeout(null);

		await interaction.reply({
			content: `Unmute ${member.user.tag}`,
			ephemeral: true,
		});
	},
};

export default command;
