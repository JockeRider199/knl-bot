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
		select: {
			ownerId: true,
		},
	});

	return voice?.ownerId;
}
