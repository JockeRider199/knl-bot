import { Client, Message, MessageType } from "discord.js";
import { Event } from "../models/event";
import { getUserLevelData, updateUserLevelData } from "../utils/database";
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
				await msg.reply(
					`You have leveled up to level ${userLevelData.level + 1}!`
				);
				await updateUserLevelData(
					msg.guild.id,
					msg.author.id,
					newXp,
					userLevelData.level + 1
				);
			} else {
				await updateUserLevelData(
					msg.guild.id,
					msg.author.id,
					newXp,
					userLevelData.level
				);
				await msg.reply(`You have gained ${xp} XP!`);
			}

			cooldowns.set(msg.author.id, Date.now());

			setTimeout(() => {
				cooldowns.delete(msg.author.id);
			}, 1000 * 60);
		}
	},
};

export default event;
