import { Player } from "poru";
import { Event } from "../models/event";
import { TextChannel } from "discord.js";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: (client, player: Player) => {
		const channel = client.channels.cache.get(
			player.textChannel
		) as TextChannel;
		if (channel) {
			channel.send("La file d'attente est terminée.");
		}
		return;
	},
};

export default event;
