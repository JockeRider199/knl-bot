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
	let guild = await prisma.guild.findUnique({
		where: {
			id: guildId,
		},
	});

	if (!guild) {
		guild = await prisma.guild.create({
			data: {
				id: guildId,
			},
		});
	}

	return guild;
}

export async function isVoiceOwner(
	guildId: string,
	channelId: string,
	ownerId: string
) {
	await getOrCreateGuild(guildId);

	const voice = await prisma.voiceChannel.findUnique({
		where: {
			channel: {
				id: channelId,
				guildId,
			},
		},
		select: {
			ownerId: true,
		},
	});

	if (voice && voice.ownerId == ownerId) {
		return true;
	}

	return false;
}

export async function createVoiceChannel(
	guildId: string,
	channelId: string,
	ownerId: string
) {
	await getOrCreateGuild(guildId);

	await prisma.voiceChannel.upsert({
		where: {
			channel: {
				id: channelId,
				guildId,
			},
		},
		update: {
			ownerId,
		},
		create: {
			id: channelId,
			ownerId,
			guildId,
		},
	});
}

export async function removeVoiceChannel(guildId: string, channelId: string) {
	await getOrCreateGuild(guildId);

	await prisma.voiceChannel.delete({
		where: {
			channel: {
				id: channelId,
				guildId,
			},
		},
	});
}

export async function isTempVoiceChannel(guildId: string, channelId: string) {
	await getOrCreateGuild(guildId);

	const voice = await prisma.voiceChannel.findUnique({
		where: {
			channel: {
				id: channelId,
				guildId,
			},
		},
	});

	return voice ? true : false;
}

export async function setupVoiceChannels(
	guildId: string,
	categoryId: string,
	channelId: string
) {
	await getOrCreateGuild(guildId);

	await prisma.guild.update({
		where: {
			id: guildId,
		},
		data: {
			voiceCreationCategoryId: categoryId,
			voiceCreationChannelId: channelId,
		},
	});
}

export async function getVoiceConfig(guildId: string) {
	await getOrCreateGuild(guildId);

	const guild = await prisma.guild.findUnique({
		where: {
			id: guildId,
		},
		select: {
			voiceCreationCategoryId: true,
			voiceCreationChannelId: true,
		},
	});

	return guild;
}

export async function getVoiceOwnerId(guildId: string, channelId: string) {
	await getOrCreateGuild(guildId);

	const voice = await prisma.voiceChannel.findUnique({
		where: {
			channel: {
				id: channelId,
				guildId,
			},
		},
	});

	return voice?.ownerId;
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

export async function getTempVoices() {
	const voices = await prisma.voiceChannel.findMany({
		select: {
			id: true,
			guildId: true,
		},
	});

	return voices;
}

export async function tempBanMember(
	guildId: string,
	memberId: string,
	reason: string,
	time: number
) {
	await getOrCreateGuild(guildId);

	await prisma.ban.create({
		data: {
			guildId,
			memberId,
			reason,
			until: Date.now() + time,
		},
	});
}

export async function removeMemberBan(guildId: string, memberId: string) {
	await getOrCreateGuild(guildId);

	await prisma.ban.delete({
		where: {
			memberId_guildId: {
				guildId,
				memberId,
			},
		},
	});
}

export async function getBannedMembers() {
	return await prisma.ban.findMany({});
}

export async function isMemberTempBanned(guildId: string, memberId: string) {
	await getOrCreateGuild(guildId);

	const res = await prisma.ban.findUnique({
		where: {
			memberId_guildId: {
				memberId,
				guildId,
			},
		},
	});

	return res ? true : false;
}

export async function createMemberWarn(
	guildId: string,
	memberId: string,
	reason: string,
	moderator: string
) {
	await getOrCreateGuild(guildId);

	await prisma.warn.create({
		data: {
			guildId,
			memberId,
			reason,
			moderator,
			date: Date.now(),
		},
	});
}
export async function removeMemberWarns(guildId: string, memberId: string) {
	await getOrCreateGuild(guildId);

	await prisma.warn.deleteMany({
		where: {
			guildId,
			memberId,
		},
	});
}
export async function getMemberWarns(guildId: string, memberId: string) {
	await getOrCreateGuild(guildId);

	const res = await prisma.warn.findMany({
		where: {
			guildId,
			memberId,
		},
	});

	return res;
}
export async function getUserLevelData(guildId: string, memberId: string) {
	await getOrCreateGuild(guildId);

	let res = await prisma.level.findUnique({
		where: {
			memberId_guildId: {
				memberId,
				guildId,
			},
		},
	});

	if (!res) {
		res = await prisma.level.create({
			data: {
				guildId,
				memberId,
			},
		});
	}

	return res;
}

export async function getUserLevelRank(guildId: string, memberId: string) {
	await getOrCreateGuild(guildId);

	const res = await prisma.level.findMany({
		where: {
			guildId,
		},
		orderBy: {
			xp: "desc",
		},
	});

	return `${res.findIndex((x) => x.memberId === memberId) + 1}/${res.length}`;
}
export async function updateUserLevelData(
	guildId: string,
	memberId: string,
	xp: bigint,
	level: number
) {
	await getOrCreateGuild(guildId);

	await prisma.level.update({
		where: {
			memberId_guildId: {
				memberId,
				guildId,
			},
		},
		data: {
			xp,
			level,
		},
	});
}
