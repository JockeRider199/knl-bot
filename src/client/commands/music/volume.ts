import {
	ChatInputCommandInteraction,
	GuildMember,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import { Client } from "../../models/client";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("volume")
		.setDescription("Controle le volume du bot.")
		.setDMPermission(false)
		.addNumberOption((option) => {
			return option
				.setName("niveau")
				.setDescription("Le niveau du volume entre 0-100")
				.setMinValue(0)
				.setMaxValue(100);
		}),

	exec: async (interaction: ChatInputCommandInteraction, client: Client) => {
		const volumeOption = interaction.options.getNumber("niveau");

		const guildMember = <GuildMember>interaction.member;
		if (!guildMember.voice.channel) {
			return interaction.editReply({
				content: `Connectez-vous à un salon vocal avant d'utiliser cette commande.`,
			});
		}

		const player = client.poru.players.get(interaction.guildId!);

		if (!player) {
			return interaction.reply({
				content: "Je ne suis pas en train de jouer.",
				ephemeral: true,
			});
		}

		if (volumeOption) {
			player.setVolume(volumeOption);
			interaction.reply({
				content: `Le volume a été défini sur ${volumeOption}%.`,
			});
		} else {
			interaction.reply({
				content: `Le volume est défini sur ${player.volume}%`,
			});
		}
	},
};

export default command;
