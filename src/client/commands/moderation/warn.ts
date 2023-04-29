import {
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { createMemberWarn } from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("warn")
		.setDescription("Warn un membre")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membre à warn.")
				.setRequired(true);
		})
		.addStringOption((option) => {
			return option
				.setName("raison")
				.setDescription("La raison du warn.")
				.setRequired(true);
		}),

	exec: async (interaction) => {
		const member = interaction.options.getMember("membre") as GuildMember;
		const reason = interaction.options.getString("raison", true);

		const power = (<GuildMember>(
			interaction.member
		))!.roles.highest.comparePositionTo(member.roles.highest);

		if (power <= 0) {
			interaction.reply({
				content: `Vous ne pouvez pas warn ce membre.`,
				ephemeral: true,
			});
			return;
		}

		await createMemberWarn(
			interaction.guildId!,
			member.id,
			reason,
			interaction.user.tag
		);

		await interaction.reply({
			content: `Le membre ${member.user.tag} a été warn pour la raison suivante: ${reason}`,
			ephemeral: true,
		});

		try {
			await member.send({
				content: `Vous avez été warn sur le serveur ${
					interaction.guild!.name
				} pour la raison suivante: ${reason}`,
			});
		} catch (e) {
			await interaction.followUp({
				content: `Impossible d'avertir le membre ${member.user.tag} car ses messages privés sont fermés.`,
			});
		}
	},
};

export default command;
