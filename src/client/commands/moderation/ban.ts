import {
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import ms from "ms";
import * as Database from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban un membre.")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membre à bannir.")
				.setRequired(true);
		})
		.addStringOption((option) => {
			return option
				.setName("raison")
				.setDescription("La raison du bannissement.")
				.setRequired(true);
		})
		.addStringOption((option) => {
			return option
				.setName("temps")
				.setDescription("La durée du ban")
				.setRequired(false);
		}),

	exec: async (interaction) => {
		const memberOption = interaction.options.getMember("membre") as GuildMember;
		const reasonOption = interaction.options.getString("raison")!;
		const timeOption = interaction.options.getString("temps");

		const power = (<GuildMember>(
			interaction.member
		))!.roles.highest.comparePositionTo(memberOption.roles.highest);

		if (power <= 0) {
			interaction.reply({
				content: `Vous ne pouvez pas bannir ce membre.`,
				ephemeral: true,
			});
			return;
		}

		if (timeOption) {
			await Database.tempBanMember(
				interaction.guildId!,
				memberOption.id,
				reasonOption,
				ms(timeOption)
			);
		}

		await memberOption
			.ban({
				reason: `Raison: ${reasonOption} (par ${interaction.user.tag}) ${
					timeOption ? `pour ${timeOption}` : ""
				}`,
			})
			.catch((_) => {
				interaction.reply({
					content: `Une erreur est survenue, je ne peux pas bannir ce membre.`,
					ephemeral: true,
				});
				return;
			});

		interaction.reply({
			content: `${memberOption.user.tag} a été banni du serveur.`,
			ephemeral: true,
		});
	},
};

export default command;
