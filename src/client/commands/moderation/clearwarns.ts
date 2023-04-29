import {
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { removeMemberWarns } from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("clearwarns")
		.setDescription("Supprime tous les warns d'un membre.")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membre dont on veut supprimer les warns.")
				.setRequired(true);
		}),

	exec: async (interaction) => {
		const member = interaction.options.getMember("membre") as GuildMember;

		await removeMemberWarns(interaction.guildId!, member.id);

		await interaction.reply({
			content: `Les warns du membre ${member} ont été supprimés.`,
			ephemeral: true,
		});
	},
};

export default command;
