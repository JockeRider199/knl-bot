import { Node } from "poru";
import { Event } from "../models/event";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: (client, node: Node) => {
		console.log(`Node ${node.name} connected.`);
		return;
	},
};

export default event;
