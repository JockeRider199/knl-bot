import { ColorResolvable, type GatewayIntentBits } from "discord.js";
import { NodeGroup, PoruOptions } from "poru";

interface Config {
	intents: GatewayIntentBits[];
	guildId: string;
	embedsColor: ColorResolvable;
	music: MusicOptions;
}

interface MusicOptions {
	nodes: NodeGroup[];
	options: PoruOptions;
}

export default Config;
