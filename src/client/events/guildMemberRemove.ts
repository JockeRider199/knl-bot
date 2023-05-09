import { Event } from "../models/event";
import { getLogsChannel } from "../utils/database";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (_, member) => {
		const logsChannelId = await getLogsChannel(member.guild.id);

		if (!logsChannelId) return;

		const logsChannel = member.guild.channels.cache.get(logsChannelId);

		if (logsChannel) {
			logsChannel.send(`**${member.user.tag}** a quitté le serveur.`);
		}
	},
};

export default event;
