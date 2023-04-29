import {
	EmbedBuilder,
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { getMemberWarns } from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("warnings")
		.setDescription("Affiche les warns d'un membre.")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membres dont on veut afficher les warns.")
				.setRequired(true);
		}),

	exec: async (interaction, client) => {
		const member = interaction.options.getMember("membre") as GuildMember;

		const warns = await getMemberWarns(interaction.guildId!, member.id);

		if (warns.length == 0) {
			await interaction.reply({
				content: `Le membre ${member.user.tag} n'a aucun warn.`,
				ephemeral: true,
			});
			return;
		}

		const lastWarns = warns
			.sort((a, b) => Number(b.date) - Number(a.date))
			.slice(0, 10)
			.map((warn) => {
				return `${new Date(Number(warn.date)).toLocaleString()} - '**${
					warn.reason
				}**' (${warn.moderator})`;
			})
			.join("\n");

		const embed = new EmbedBuilder()
			.setColor(client.getConfig().embedsColor)
			.setTitle(`Warns de ${member.user.tag}`)
			.setDescription(lastWarns);

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};

export default command;
