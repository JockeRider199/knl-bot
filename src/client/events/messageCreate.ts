import { Client, Message, MessageType } from "discord.js";
import { Event } from "../models/event";
import {
	getLevelRewards,
	getUserLevelData,
	updateUserLevelData,
} from "../utils/database";
import { calculateXpForLevel } from "../utils/helpers";

const cooldowns = new Map();

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (_: Client, msg: Message) => {
		if (!msg.guild) return;

		if (msg.type === MessageType.ChannelPinnedMessage) {
			await msg.delete();
		}

		if (!cooldowns.has(msg.author.id)) {
			if (msg.author.bot) return;
			if (msg.content.length < 5) return;

			// Between 7 and 13
			const xp = Math.floor(Math.random() * 7) + 7;
			const userLevelData = await getUserLevelData(msg.guild.id, msg.author.id);
			const nextXpRankup = calculateXpForLevel(userLevelData.level + 1);
			const newXp = BigInt(xp) + userLevelData.xp;
			if (newXp > nextXpRankup) {
				await updateUserLevelData(
					msg.guild.id,
					msg.author.id,
					newXp,
					userLevelData.level + 1
				);
				const rewards = await getLevelRewards(msg.guild.id);
				const reward = rewards.find(
					(reward) => reward.level === userLevelData.level + 1
				);
				if (reward) {
					const role = msg.guild.roles.cache.get(reward.roleId);
					if (role) {
						await msg.member!.roles.add(role);
					}
				}
			} else {
				await updateUserLevelData(
					msg.guild.id,
					msg.author.id,
					newXp,
					userLevelData.level
				);
			}

			cooldowns.set(msg.author.id, Date.now());

			setTimeout(() => {
				cooldowns.delete(msg.author.id);
			}, 1000 * 60);
		}
	},
};

export default event;
