import { GatewayIntentBits } from "discord.js";
import type Config from "../models/config";

const config: Config = {
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
	],
	guildId: "948849368092516373",
	embedsColor: "#FC817A",
	music: {
		nodes: [
			{
				name: "local-node",
				host: process.env.CONTAINER == "TRUE" ? "lavalink" : "localhost",
				port: 2333,
				password: process.env.LAVALINK_PASSWORD!,
			},
		],
		options: {
			library: "discord.js",
			defaultPlatform: "youtube",
			autoResume: true,
			send: null,
		},
	},
};

export default config;
