import { Client, Message, MessageType } from "discord.js";
import { Event } from "../models/event";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (_: Client, msg: Message) => {
		if (!msg.guild) return;

		if (msg.type === MessageType.ChannelPinnedMessage) {
			await msg.delete();
		}
	},
};

export default event;
