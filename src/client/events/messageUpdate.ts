import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { Event } from "../models/event";
import { getLogsChannel } from "../utils/database";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (_, oldMessage: Message, newMessage: Message) => {
		if (
			oldMessage.author.bot ||
			oldMessage.content === newMessage.content ||
			!oldMessage.guild
		)
			return;
		const logChannelId = await getLogsChannel(oldMessage.guild.id);

		if (!logChannelId) return;
		const logChannel = oldMessage.guild.channels.cache.get(logChannelId);

		if (logChannel && logChannel instanceof TextChannel) {
			const embed = new EmbedBuilder()
				.setAuthor({
					name: oldMessage.author.tag,
					iconURL: oldMessage.author.displayAvatarURL(),
				})
				.setDescription(`**Message édité dans ${oldMessage.channel}**`)
				.addFields([
					{
						name: "Avant",
						value: oldMessage.content,
					},
					{
						name: "Après",
						value: newMessage.content,
					},
				])
				.setFooter({
					text: `ID: ${oldMessage.author.id}`,
				})
				.setTimestamp();

			logChannel.send({ embeds: [embed] });
		}
	},
};

export default event;
