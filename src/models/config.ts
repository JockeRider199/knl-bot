import { ColorResolvable, type GatewayIntentBits } from "discord.js";

interface Config {
	intents: GatewayIntentBits[];
	guildId: string;
	embedsColor: ColorResolvable;
}

export default Config;
