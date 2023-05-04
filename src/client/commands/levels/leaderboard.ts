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
		// Fking lang
		// filter with async
		// explaination: https://medium.com/@debbs119/array-filter-and-array-map-with-async-functions-9636e1ae8d6e

		let leaderboard = await getXPLeaderboard(interaction.guildId!);
		const boolLeaderoard = await Promise.all(
			leaderboard.map(async (member) => {
				try {
					await interaction.guild!.members.fetch(member.memberId);
					return true;
				} catch {
					return false;
				}
			})
		);
		leaderboard = leaderboard.filter((_, index) => boolLeaderoard[index]);

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
