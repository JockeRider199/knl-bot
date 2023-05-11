import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { getXPLeaderboard } from "../../utils/database";
import { formatBigNumber } from "../../utils/helpers";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Classement des niveaux des membres du serveur")
		.setDMPermission(false),

	exec: async (interaction, client) => {
		let leaderboard = await getXPLeaderboard(interaction.guildId!);
		leaderboard = leaderboard.filter((member) => {
			return interaction.guild!.members.cache.has(member.memberId);
		});

		const displayLeaderboard = leaderboard.slice(0, 20);

		let embed = new EmbedBuilder()
			.setColor(client.getConfig().embedsColor)
			.setAuthor({
				iconURL: interaction.guild!.iconURL() ?? "",
				name: `Classement des niveaux de ${interaction.guild!.name}`,
			})
			.setDescription(
				`${displayLeaderboard
					.map((member, index) => {
						return `${index + 1}. <@${member.memberId}> - Niveau ${
							member.level
						} (${formatBigNumber(Number(member.xp))} XP)`;
					})
					.join("\n")}`
			)
			.setFooter({
				text: `Votre position: ${
					leaderboard.findIndex(
						(member) => member.memberId === interaction.user.id
					) + 1
				} / ${leaderboard.length} membres`,
			});

		await interaction.reply({
			embeds: [embed],
		});
	},
};

export default command;
