import { Client } from "../models/client";
import * as Database from "./database";

export async function init(client: Client) {
	setInterval(async () => {
		console.log("Checking unbans");
		const bans = await Database.getBannedMembers();

		for (const ban of bans) {
			if (ban.until <= Date.now()) {
				await Database.removeMemberBan(ban.guildId, ban.memberId);
				const guild = await client.guilds.fetch(ban.guildId);
				const member = await guild.members.fetch(ban.memberId);

				await guild.bans.remove(member, "Temp ban expired.").catch((_) => {});

				console.log(`Unbanned ${member.user.tag} from ${guild.name}`);
			}
		}
	}, 1000 * 60 * 15);
}
