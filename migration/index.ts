import { PrismaClient } from ".prisma/client";
import { calculateLevelForXp } from "../src/client/utils/helpers";
const prisma = new PrismaClient();
import { readFileSync, writeFileSync } from "fs";
import { Client } from "discord.js";
import { join } from "path";

async function main() {
	/* prisma.$connect().then(() => {
		console.log("Connected to database");
	}); */
	const client = new Client({
		intents: ["Guilds", "GuildMembers"],
	});

	await client.login(token);

	const levelData = JSON.parse(
		readFileSync(join(process.cwd(), "migration", "input.json"), "utf-8")
	);
	const guild = await client.guilds.fetch("948849368092516373");
	const results: any[] = [];

	for (const member of levelData) {
		try {
			const m = await guild.members.fetch({ query: member.username, limit: 1 });

			console.log(`Member ${member.username} found`);

			results.push({
				memberId: m.first()?.user.id,
				xp: Number(unformatNumbers(member.xp)),
				level: calculateLevelForXp(Number(unformatNumbers(member.xp))),
				username: member.username,
			});
		} catch {
			console.log(`Member ${member.username} not found`);
		}

		/* await prisma.level.create({
      data: {
        guildId: "704412119847796856",
        memberId: fakeMember.id,
        xp: unformatNumbers(member.xp),
        level: calculateLevelForXp(Number(unformatNumbers(member.xp))),
      }
    }) */
	}

	console.log(
		`\n\nDone. ${results.length}/${
			JSON.stringify(levelData).length
		} members migrated.`
	);

	writeFileSync(
		join(process.cwd(), "migration", "output.json"),
		JSON.stringify(results, null, 2),
		"utf-8"
	);

	client.destroy();

	return 0;
}

main();

function unformatNumbers(str: string) {
	if (str.includes("K"))
		return BigInt(Number(str.split("K").join("").trim()) * 1000);
	return BigInt(Number(str));
}
