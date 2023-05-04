import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { getUserLevelData, getUserLevelRank } from "../../utils/database";
import { calculateXpForLevel, formatBigNumber } from "../../utils/helpers";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("level")
		.setDescription("Montre le niveau d'un utilisateur")
		.addUserOption((option) => {
			return option
				.setName("user")
				.setDescription("L'utilisateur dont on veut voir le niveau");
		})
		.setDMPermission(false),

	exec: async (interaction, client) => {
		const user = interaction.options.getUser("user") || interaction.user;
		const data = await getUserLevelData(interaction.guildId!, user.id);

		const rank = await getUserLevelRank(interaction.guildId!, user.id);

		const embed = new EmbedBuilder()
			.setColor(client.getConfig().embedsColor)
			.setAuthor({
				name: user.username,
				iconURL: user.displayAvatarURL(),
			})
			.addFields(
				{ name: "Rank", value: rank },
				{ name: "Level", value: data.level.toString() },
				{
					name: "XP",
					value: `**${formatBigNumber(Number(data.xp))}**/${formatBigNumber(
						calculateXpForLevel(data.level + 1)
					)}`,
				}
			);
		interaction.reply({ embeds: [embed] });
		return;
	},
};

export default command;
