import {
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import ms from "ms";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("mute")
		.setDescription("Mute un membre")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membre à mute.")
				.setRequired(true);
		})
		.addStringOption((option) => {
			return option
				.setName("raison")
				.setDescription("La raison du mute.")
				.setRequired(true);
		})
		.addStringOption((option) => {
			return option
				.setName("temps")
				.setDescription("Le temps du mute.")
				.setRequired(true);
		}),

	exec: async (interaction) => {
		const member = interaction.options.getMember("membre") as GuildMember;
		const reason = interaction.options.getString("raison", true);
		const time = interaction.options.getString("temps", true);

		const power = (<GuildMember>(
			interaction.member
		))!.roles.highest.comparePositionTo(member.roles.highest);

		if (power <= 0) {
			interaction.reply({
				content: `Vous ne pouvez pas mute ce membre.`,
				ephemeral: true,
			});
			return;
		}

		member.timeout(ms(time), reason);

		await interaction.reply({
			content: `Mute ${member.user.tag} pour ${reason} pendant ${time}`,
			ephemeral: true,
		});
	},
};

export default command;
