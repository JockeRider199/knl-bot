import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import * as Database from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Unban un membre")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addStringOption((option) => {
			return option
				.setName("id")
				.setDescription("L'id du membre à unban.")
				.setRequired(true);
		}),

	exec: async (interaction) => {
		const memberIdOption = interaction.options.getString("id")!;

		interaction.guild!.bans.remove(memberIdOption).catch(() => {});

		if (
			await Database.isMemberTempBanned(interaction.guildId!, memberIdOption)
		) {
			await Database.removeMemberBan(interaction.guildId!, memberIdOption);
		}

		await interaction.reply({
			content: "Le membre a été débanni.",
			ephemeral: true,
		});
	},
};

export default command;
