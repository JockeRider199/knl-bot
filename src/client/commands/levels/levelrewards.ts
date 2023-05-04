import {
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import {
	getLevelRewards,
	setLevelReward,
	removeLevelReward,
	getXPLeaderboard,
} from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("levelrewards")
		.setDescription("Défini les récompenses de niveaux")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("set")
				.setDescription("Défini une récompense de niveau")
				.addIntegerOption((option) => {
					return option
						.setName("level")
						.setDescription("Niveau de la récompense")
						.setRequired(true)
						.setMinValue(0);
				})
				.addRoleOption((option) => {
					return option
						.setName("role")
						.setDescription("Rôle à donner")
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("remove")
				.setDescription("Supprime une récompense de niveau")
				.addIntegerOption((option) => {
					return option
						.setName("level")
						.setDescription("Niveau de la récompense")
						.setRequired(true)
						.setMinValue(0);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("list")
				.setDescription("Liste les récompenses de niveaux");
		}),

	exec: async (interaction) => {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "set") {
			const level = interaction.options.getInteger("level", true);
			const role = interaction.options.getRole("role", true);

			await setLevelReward(interaction.guildId!, level, role.id);

			const members = await getXPLeaderboard(interaction.guildId!);
			members.forEach((member) => {
				if (member.level >= level) {
					const guildMember = interaction.guild!.members.cache.get(
						member.memberId
					);
					if (guildMember) {
						guildMember.roles.add(role.id);
					}
				}
			});

			await interaction.reply({
				content: `Récompense de niveau ${level} définie à ${role}`,
				ephemeral: true,
				allowedMentions: {
					roles: [],
				},
			});
		} else if (subcommand === "remove") {
			const level = interaction.options.getInteger("level", true);

			await removeLevelReward(interaction.guildId!, level);

			await interaction.reply({
				content: `Récompense de niveau ${level} supprimée`,
				ephemeral: true,
			});
		} else {
			const rewards = await getLevelRewards(interaction.guildId!);

			const embed = new EmbedBuilder()
				.setTitle("Récompenses de niveaux")
				.setDescription(
					rewards.length > 0
						? rewards
								.map((reward) => {
									return `Niveau ${reward.level} : <@&${reward.roleId}>`;
								})
								.join("\n")
						: "Aucune récompense de niveau définie"
				);

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	},
};

export default command;
