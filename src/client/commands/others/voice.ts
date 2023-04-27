import {
	CategoryChannel,
	ChannelType,
	GuildMember,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import * as Database from "../../utils/database";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("voice")
		.setDescription("Voice channel commands")
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("setup")
				.setDescription("Configure le système de salon vocal")
				.addChannelOption((option) => {
					return option
						.setName("categorie")
						.setDescription("Catégorie des salons vocaux")
						.addChannelTypes(ChannelType.GuildCategory)
						.setRequired(true);
				})
				.addStringOption((option) => {
					return option
						.setName("nom")
						.setDescription("Nom du salon vocal")
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("lock")
				.setDescription("(De)Verrouille le salon vocal")
				.addStringOption((option) => {
					return option
						.setName("status")
						.setDescription("Status du salon vocal")
						.setRequired(true)
						.addChoices(
							{ name: "on", value: "true" },
							{ name: "off", value: "false" }
						);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("name")
				.setDescription("Change le nom du salon vocal")
				.addStringOption((option) => {
					return option
						.setName("name")
						.setDescription("Nom du salon vocal")
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("limit")
				.setDescription("Change la limite de personnes dans le salon vocal")
				.addIntegerOption((option) => {
					return option
						.setName("limit")
						.setDescription("Limite de personnes dans le salon vocal")
						.setMinValue(0)
						.setMaxValue(99)
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("block")
				.setDescription("Bloque un utilisateur du salon vocal")
				.addUserOption((option) => {
					return option
						.setName("user")
						.setDescription("Utilisateur à bloquer")
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("unblock")
				.setDescription("Débloque un utilisateur du salon vocal")
				.addUserOption((option) => {
					return option
						.setName("user")
						.setDescription("Utilisateur à débloquer")
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("claim")
				.setDescription("Revendique le salon vocal");
		})
		.setDMPermission(false),

	exec: async (interaction) => {
		const subcommand = interaction.options.getSubcommand();
		const member = <GuildMember>interaction.member;

		if (subcommand === "setup") {
			interaction.deferReply({ ephemeral: true });

			const permission = member.permissions.has("ManageChannels");
			if (!permission) {
				interaction.editReply({
					content:
						"Vous n'avez pas la permission de configurer le système de salon vocal",
				});
				return;
			}

			const category = interaction.options.getChannel(
				"categorie"
			) as CategoryChannel;
			const name = interaction.options.getString("nom")!;

			const channel = await interaction.guild!.channels.create({
				name,
				type: ChannelType.GuildVoice,
			});
			await channel.setParent(category.id);
			Database.setupVoiceChannels(
				interaction.guildId!,
				category.id,
				channel.id
			);

			interaction.editReply({
				content: `Le système est opérationnel !`,
			});

			return;
		} else if (subcommand === "claim") {
			if (!isInVoiceChannel()) return;
			const channel = member.voice.channel;

			if (channel) {
				const ownerId = await Database.getVoiceOwnerId(
					interaction.guildId!,
					channel.id
				);
				const isOwnerInChannel = channel.members.has(ownerId!);

				if (ownerId == member.user.id) {
					interaction.reply({
						content: `Vous êtes déjà propriétaire du salon vocal ${channel.name}`,
						ephemeral: true,
					});
					return;
				} else if (!isOwnerInChannel) {
					Database.createVoiceChannel(
						interaction.guildId!,
						channel.id,
						member.user.id
					);
					interaction.reply({
						content: `Le salon vocal ${channel.name} vous appartient désormais`,
						ephemeral: true,
					});
					return;
				} else {
					interaction.reply({
						content: `Le salon vocal ${channel.name} est déjà revendiqué par un autre utilisateur`,
						ephemeral: true,
					});
					return;
				}
			}
		}

		if (!isInVoiceChannel()) return;
		if (!(await checkOwnership())) return;

		if (subcommand === "lock") {
			const status = interaction.options.getString("status")!;
			const channel = member.voice.channel;

			if (channel) {
				channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
					Connect: status == "true" ? false : null,
				});
				interaction.reply({
					content: `Le salon vocal ${channel.name} a été ${
						status == "true" ? "verrouillé" : "déverrouillé"
					}`,
					ephemeral: true,
				});
			}
		} else if (subcommand === "name") {
			const name = interaction.options.getString("name")!;
			const channel = member.voice.channel;

			if (channel) {
				channel.setName(name);
				interaction.reply({
					content: `Le salon vocal ${channel.name} a été renommé en ${name}`,
					ephemeral: true,
				});
			}
		} else if (subcommand === "limit") {
			const limit = interaction.options.getInteger("limit")!;
			const channel = member.voice.channel;

			if (channel) {
				channel.setUserLimit(limit);
				interaction.reply({
					content:
						limit == 0
							? "La limite du salon vocal a été supprimée"
							: `La limite du salon vocal ${channel.name} a été mise sur ${limit} personnes`,
					ephemeral: true,
				});
			}
		} else if (subcommand === "block") {
			const user = interaction.options.getUser("user")!;
			const channel = member.voice.channel;

			if (channel) {
				channel.permissionOverwrites.edit(user, {
					Connect: false,
				});

				if (channel.members.has(user.id)) {
					channel.members.get(user.id)!.voice.disconnect();
				}

				interaction.reply({
					content: `L'utilisateur ${user.username} a été bloqué du salon vocal ${channel.name}`,
					ephemeral: true,
				});
			}
		} else if (subcommand === "unblock") {
			const user = interaction.options.getUser("user")!;
			const channel = member.voice.channel;

			if (channel) {
				channel.permissionOverwrites.edit(user, {
					Connect: null,
				});

				interaction.reply({
					content: `L'utilisateur ${user.username} a été débloqué du salon vocal ${channel.name}`,
					ephemeral: true,
				});
			}
		}

		function isInVoiceChannel() {
			if (!member.voice.channel) {
				interaction.reply({
					content: "Vous n'êtes pas dans un salon vocal.",
					ephemeral: true,
				});
				return false;
			}
			return true;
		}

		async function checkOwnership() {
			const isOwner = await Database.isVoiceOwner(
				interaction.guildId!,
				member.voice.channelId!,
				member.user.id
			);
			if (!isOwner) {
				interaction.reply({
					content: "Vous n'êtes pas le propriétaire de ce salon vocal",
					ephemeral: true,
				});
				return false;
			}
			return true;
		}
	},
};

export default command;
