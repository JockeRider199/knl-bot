import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-command";
import ms from "ms";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Affiche la liste des musiques en attente.")
		.setDMPermission(false),

	exec: (interaction, client) => {
		const player = client.poru.players.get(interaction.guildId!);

		if (!player) {
			return interaction.reply({
				content: "Je ne suis pas en train de jouer.",
				ephemeral: true,
			});
		}

		const queue =
			player.queue.length > 9 ? player.queue.slice(0, 9) : player.queue;
		const embed = new EmbedBuilder()
			.setColor(client.getConfig().embedsColor)
			.setTitle("En cours de lecture")
			.setThumbnail(player.currentTrack.info.image ?? "")
			.setDescription(
				`[${player.currentTrack.info.title}](${
					player.currentTrack.info.uri
				}) [${ms(player.currentTrack.info.length)}]`
			)
			.setFooter({
				text: `Longueur file: ${player.queue.length} musiques\n${
					player.loop != "NONE" ? `Loop: ${player.loop.toLowerCase()}` : ""
				}`,
			});

		if (queue.length) {
			embed.addFields({
				name: "En attente",
				value: queue
					.map(
						(track, i) =>
							`${i + 1}. [${track.info.title}](${track.info.uri}) [${ms(
								track.info.length
							)}]`
					)
					.join("\n"),
			});
		}

		interaction.reply({ embeds: [embed] });
	},
};

export default command;
