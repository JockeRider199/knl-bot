import { GatewayIntentBits } from "discord.js";
import type Config from "../models/config";

const config: Config = {
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	guildId: "704412119847796856",
	embedsColor: "#00B700",
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
