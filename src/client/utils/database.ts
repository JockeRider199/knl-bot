import { PrismaClient } from "../../../node_modules/.prisma/client";
import { formatTicketNumber } from "./helpers";
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

export async function getOrCreateGuild(guildId: string) {
	let guild = await prisma.guild.findUnique({ where: { id: guildId } });

	if (!guild) {
		guild = await prisma.guild.create({
			data: {
				id: guildId,
			},
		});
	}

	return guild;
}

export async function createTicketConfig(
	guildId: string,
	modRoleId: string,
	ticketCategoryId: string
) {
	await getOrCreateGuild(guildId);

	await prisma.ticketsConfig.create({
		data: {
			guildId,
			modRoleId,
			ticketCategoryId,
		},
	});
}

export async function isTicket(guildId: string, channelId: string) {
	const isTicket = await prisma.ticket.findFirst({
		where: {
			guildId,
			channelId,
		},
	});

	return isTicket;
}

export async function isAlreadyInTicket(guildId: string, userId: string) {
	const existing = await prisma.ticket.findFirst({
		where: {
			ownerId: userId,
			guildId,
		},
	});

	return existing?.opened ?? false;
}

export async function getTicketCategory(guildId: string) {
	const ticketCategory = await prisma.ticketsConfig.findFirst({
		where: {
			guildId,
		},
		select: {
			ticketCategoryId: true,
		},
	});

	return ticketCategory?.ticketCategoryId;
}

export async function getTicketModRoleId(guildId: string) {
	const modRoleId = await prisma.ticketsConfig.findFirst({
		where: {
			guildId,
		},
		select: {
			modRoleId: true,
		},
	});

	return modRoleId!.modRoleId;
}

export async function createTicket(
	guildId: string,
	channelId: string,
	ownerId: string
) {
	const config = await prisma.ticketsConfig.findFirst({
		where: {
			guildId,
		},
	});

	await prisma.ticket.create({
		data: {
			guildId,
			ownerId,
			channelId,
			opened: true,
			ticketsConfigId: config?.modelId,
		},
	});
}

export async function increaseTicketCount(guildId: string) {
	const guild = await getOrCreateGuild(guildId);

	const config = await prisma.ticketsConfig.update({
		where: {
			guildId: guild.id,
		},
		data: {
			count: {
				increment: 1,
			},
		},
	});

	return formatTicketNumber(config.count);
}

export async function removeTicket(channelId: string) {
	await prisma.ticket.delete({
		where: {
			channelId,
		},
	});
}

export async function closeTicket(channelId: string) {
	await prisma.ticket.update({
		where: {
			channelId,
		},
		data: {
			opened: false,
		},
	});
}

export async function openTicket(channelId: string) {
	const req = await prisma.ticket.update({
		where: {
			channelId,
		},
		data: {
			opened: true,
		},
		select: {
			ownerId: true,
		},
	});

	return req.ownerId;
}
