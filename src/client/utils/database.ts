import { PrismaClient } from "../../../node_modules/.prisma/client";
const prisma = new PrismaClient({
	datasources: {
		db: {
			url:
				process.env.PRODUCTION == "TRUE" || process.env.CONTAINER == "TRUE"
					? process.env.PROD_DATABASE_URL
					: process.env.DATABASE_URL,
		},
	},
});

export async function init() {
	await prisma.$connect().then(() => {
		console.log("Connected to database");
	});
}
