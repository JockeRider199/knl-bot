import { VoiceChannel } from "discord.js";
import { type Client } from "../models/client";
import { type Event } from "../models/event";
import * as Database from "../utils/database";
import * as checkUnbans from "../utils/checkUnbans";

export const readyEvent: Event = {
	settings: {
		enabled: true,
	},

	exec: async (client: Client) => {
		console.log(`Logged in as ${client.user?.tag}!`);
		if (process.env.PRODUCTION == "TRUE") {
			console.log("Prod mode");
		}
		if (process.env.CONTAINER == "TRUE") {
			console.log("Container mode");
		}
		client.initPoru();
		checkUnbans.init(client);

		const voices = await Database.getTempVoices();
		for (const voice of voices) {
			const voiceChannel = (await client.channels.fetch(
				voice.id
			)) as VoiceChannel;
			if (!voiceChannel || voiceChannel.members.size < 1) {
				await Database.removeVoiceChannel(voice.guildId, voice.id);
				if (voiceChannel) {
					await voiceChannel.delete();
				}
			}
		}
	},
};

export default readyEvent;
