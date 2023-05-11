import { AuditLogEvent, EmbedBuilder, TextChannel } from "discord.js";
import { Event } from "../models/event";
import { getLogsChannel } from "../utils/database";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (_, message) => {
		const channelId = await getLogsChannel(message.guild.id);
		const channel = message.guild.channels.cache.get(channelId);

		if (channel && channel instanceof TextChannel) {
			const log = await message.guild.fetchAuditLogs({
				limit: 1,
				type: AuditLogEvent.MessageDelete,
			});
			const entry = log.entries.first();
			const embed = new EmbedBuilder()
				.setColor("#FF4610")
				.setAuthor({
					name: entry.executor.tag,
					iconURL: entry.executor.displayAvatarURL(),
				})
				.setDescription(
					`**Message de ${message.author} supprimé dans ${message.channel.name}**\n${message.content}`
				)
				.setFooter({
					text: `ID: ${message.author.id}`,
				})
				.setTimestamp();

			channel.send({ embeds: [embed] });
		}
	},
};

export default event;
