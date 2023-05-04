import { ChannelType, VoiceChannel, VoiceState } from "discord.js";
import { Event } from "../models/event";
import * as Database from "../utils/database";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (client, oldState: VoiceState, newState: VoiceState) => {
		if (!newState.guild) return;

		const voiceConfig = await Database.getVoiceConfig(newState.guild.id);

		if (
			newState.channel &&
			voiceConfig &&
			newState.channelId == voiceConfig.voiceCreationChannelId
		) {
			const channel = await newState.guild.channels.create({
				name: `${newState.member!.displayName}'s channel`,
				type: ChannelType.GuildVoice,
				parent: voiceConfig.voiceCreationCategoryId,
			});
			channel.permissionOverwrites.set([
				{
					id: newState.member!.user.id,
					allow: ["MoveMembers"],
				},
			]);
			newState.member!.voice.setChannel(channel);
			await Database.createVoiceChannel(
				newState.guild.id,
				channel.id,
				newState.member!.id
			);
		}

		if (oldState.channel && oldState.channel.members.size == 0) {
			const isTempVoice = await Database.isTempVoiceChannel(
				oldState.guild.id,
				oldState.channel.id
			);
			if (isTempVoice) {
				oldState.channel.delete();
				await Database.removeVoiceChannel(
					oldState.guild.id,
					oldState.channel.id
				);
			}
		}

		// check if the  bot is alone in the voice channel if yes destroy the player after 5 min
		if (
			newState.guild.members.me?.voice.channel &&
			newState.guild.members.me?.voice.channel.members.size == 1
		) {
			const player = client.poru.players.get(newState.guild.id);
			setTimeout(() => {
				if (
					newState.guild.members.me?.voice.channel &&
					newState.guild.members.me?.voice.channel.members.size == 1
				) {
					if (!player) return;
					player.destroy();
				}
			}, 1000 * 30);
		}

		// if bot kicked from the voice channel destroy the player
		if (!newState.guild.members.me?.voice.channel) {
			const player = client.poru.players.get(oldState.guild.id);
			if (!player) return;
			player.destroy();
		}
	},
};

export default event;
