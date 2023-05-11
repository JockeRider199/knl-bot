import { PrismaClient } from ".prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import { getOrCreateGuild } from "../src/client/utils/database";

async function main() {
	const prisma = new PrismaClient();

	prisma.$connect().then(() => {
		console.log("Connected to database");
	});

	const data = JSON.parse(
		readFileSync(join(process.cwd(), "migration", "output.json"), "utf-8")
	);

	await getOrCreateGuild("948849368092516373");

	for (const member of data) {
		try {
			await prisma.level.create({
				data: {
					guildId: "948849368092516373",
					memberId: member.memberId,
					xp: member.xp,
					level: member.level,
				},
			});
		} catch (err: any) {
			console.log(`At ${member.username}`, err);
		}
	}

	console.log("Done");
}

main();
