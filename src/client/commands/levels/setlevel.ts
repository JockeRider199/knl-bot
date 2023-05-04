import {
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { getUserLevelData, updateUserLevelData } from "../../utils/database";
import { calculateLevelForXp, calculateXpForLevel } from "../../utils/helpers";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("setlevel")
		.setDescription("Défini le niveau d'un utilisateur")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption((option) => {
			return option
				.setName("user")
				.setDescription("Utilisateur à définir")
				.setRequired(false);
		})
		.addIntegerOption((option) => {
			return option
				.setName("level")
				.setDescription("Niveau à définir")
				.setRequired(false)
				.setMinValue(0);
		})
		.addIntegerOption((option) => {
			return option
				.setName("xp")
				.setDescription("XP à définir")
				.setRequired(false)
				.setMinValue(0);
		})
		.addBooleanOption((option) => {
			return option
				.setName("add")
				.setDescription("Ajoute le niveau au lieu de le définir")
				.setRequired(false);
		}),

	exec: async (interaction) => {
		const user =
			(interaction.options.getMember("user") as GuildMember | null) ??
			<GuildMember>interaction.member;
		const level = interaction.options.getInteger("level");
		const xp = interaction.options.getInteger("xp");
		const add = interaction.options.getBoolean("add") ?? false;

		if (level && xp) {
			await interaction.reply({
				content: "Vous ne pouvez pas définir le niveau et l'xp en même temps",
				ephemeral: true,
			});
			return;
		}

		if (level == null && xp == null) {
			await interaction.reply({
				content: "Vous devez définir le niveau ou l'xp",
				ephemeral: true,
			});
			return;
		}

		if (add) {
			const userLevelData = await getUserLevelData(
				interaction.guildId!,
				user.id
			);
			if (level != null) {
				const xpRequired = calculateXpForLevel(userLevelData.level + level);
				await updateUserLevelData(
					interaction.guildId!,
					user.id,
					userLevelData.xp + BigInt(xpRequired),
					userLevelData.level + level
				);
				interaction.reply({
					content: `Le niveau de ${user.user.username} a été augmenté de ${level}`,
					ephemeral: true,
				});
			} else {
				const newLevel = calculateLevelForXp(
					Number(userLevelData.xp + BigInt(xp!))
				);
				await updateUserLevelData(
					interaction.guildId!,
					user.id,
					userLevelData.xp + BigInt(xp!),
					newLevel
				);
				interaction.reply({
					content: `L'xp de ${user.user.username} a été augmenté de ${xp}`,
					ephemeral: true,
				});
			}
		} else {
			if (level != null) {
				const xpRequired = calculateXpForLevel(level);
				await updateUserLevelData(
					interaction.guildId!,
					user.id,
					BigInt(xpRequired),
					level
				);
				interaction.reply({
					content: `Le niveau de ${user.user.username} a été défini à ${level}`,
					ephemeral: true,
				});
			} else {
				const levelRequired = calculateLevelForXp(xp!);
				await updateUserLevelData(
					interaction.guildId!,
					user.id,
					BigInt(xp!),
					levelRequired
				);
				interaction.reply({
					content: `L'xp de ${user.user.username} a été défini à ${xp}`,
					ephemeral: true,
				});
			}
		}
	},
};

export default command;
