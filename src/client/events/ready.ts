import { type Client } from "../models/client";
import { type Event } from "../models/event";

export const readyEvent: Event = {
	settings: {
		enabled: true,
	},

	exec: async (client: Client) => {
		console.log(`Logged in as ${client.user?.tag}!`);
		if (process.env.PRODUCTION == "TRUE") {
			console.log("Prod mode");
		}
		client.initPoru();
	},
};

export default readyEvent;
