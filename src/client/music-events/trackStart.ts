import { Player, Track } from "poru";
import { Event } from "../models/event";
import { TextChannel } from "discord.js";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: (client, player: Player, track: Track) => {
		const channel = client.channels.cache.get(
			player.textChannel
		) as TextChannel;
		if (channel) {
			return channel.send({
				content: `Je joue désormais: ${track.info.title} - ${track.info.author} (${track.info.length})`,
			});
		}
	},
};

export default event;
